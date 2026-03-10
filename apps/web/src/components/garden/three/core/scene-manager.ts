/**
 * Scene Manager - Core Three.js setup for Quantum Garden
 *
 * Manages the WebGL renderer, orthographic camera, and scene lifecycle.
 * Uses OrthographicCamera for 2D rendering without perspective distortion.
 *
 * The camera frustum is set to the fixed 4K garden world size (3840x2160),
 * adjusted for viewport aspect ratio. On desktop, the garden is centered
 * with framing. Users can zoom via scroll wheel or pinch, and pan via
 * touch drag when zoomed in.
 */

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { CANVAS } from "@quantum-garden/shared";
import {
  type BackgroundType,
  BACKGROUND_CONFIGS,
  createPaperTexture,
  PaperGrainShader,
  CloudShader,
} from "./backgrounds";

export interface SceneManagerConfig {
  container: HTMLElement;
  width?: number;
  height?: number;
  backgroundColor?: string;
  enableBloom?: boolean;
}

/** Bloom effect configuration */
const BLOOM_CONFIG = {
  /** Bloom intensity (0-3 typical range) */
  STRENGTH: 0.55,
  /** Size of bloom radius in pixels */
  RADIUS: 0.8,
  /** Brightness threshold for bloom to kick in (0-1) */
  THRESHOLD: 0.6,
};

/** Camera zoom configuration for micro-transitions */
const CAMERA_CONFIG = {
  /** Default zoom level */
  DEFAULT_ZOOM: 1.0,
  /** Zoom level during observation dwell */
  DWELL_ZOOM: 1.03,
  /** Smoothing factor for zoom transitions (0-1, lower = smoother) */
  ZOOM_SMOOTHING: 0.08,
};

/** User-controlled zoom configuration */
const ZOOM_CONFIG = {
  /** Minimum effective zoom — close enough to see plant detail */
  MIN_EFFECTIVE: 1.5,
  /** Maximum effective zoom — good detail without pixelation */
  MAX_EFFECTIVE: 5.0,
  /** Zoom multiplier per scroll wheel tick */
  WHEEL_FACTOR: 1.1,
};

/**
 * Minimum ratio of viewport pixels to garden pixels before auto-zoom kicks in.
 * Below this threshold, the garden would be too small to read, so we zoom in
 * automatically. 0.25 means auto-zoom on viewports < 25% of garden size.
 */
const MIN_READABLE_SCALE = 0.45;

/**
 * Performance metrics for the render loop.
 */
export interface PerformanceMetrics {
  /** Frames per second (rolling average over 60 frames) */
  fps: number;
  /** Frame time in milliseconds (rolling average) */
  frameTimeMs: number;
  /** Number of draw calls in the last frame */
  drawCalls: number;
  /** Number of triangles rendered in the last frame */
  triangles: number;
}

/**
 * Manages the core Three.js scene, camera, and renderer.
 *
 * Provides:
 * - OrthographicCamera with fixed garden-world frustum (3840x2160)
 * - Aspect-ratio-aware centering (letterbox/pillarbox)
 * - Scroll wheel zoom (desktop) and pinch-to-zoom (mobile)
 * - Touch panning when zoomed in
 * - WebGLRenderer with transparency support
 * - Automatic resize handling
 * - Render loop management
 */
export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.OrthographicCamera;
  public renderer: THREE.WebGLRenderer;

  // Post-processing
  private composer: EffectComposer | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private bloomEnabled: boolean = false;

  // Background post-processing passes (all created, only one enabled)
  private paperPass: ShaderPass | null = null;
  private cloudPass: ShaderPass | null = null;
  private currentBackground: BackgroundType = "clouds";

  private container: HTMLElement;
  private animationId: number | null = null;
  private updateCallbacks: Set<(deltaTime: number) => void> = new Set();
  private postRenderCallbacks: Set<() => void> = new Set();
  private lastTime: number = 0;

  // Performance tracking
  private frameTimes: number[] = [];
  private readonly FRAME_SAMPLE_SIZE = 60;
  private _performanceMetrics: PerformanceMetrics = {
    fps: 0,
    frameTimeMs: 0,
    drawCalls: 0,
    triangles: 0,
  };

  // Camera zoom state
  // Effective zoom = baseZoom * userZoom * currentZoom (dwell)
  private targetZoom: number = CAMERA_CONFIG.DEFAULT_ZOOM; // dwell micro-zoom target
  private currentZoom: number = CAMERA_CONFIG.DEFAULT_ZOOM; // dwell micro-zoom (smoothed)
  private baseZoom: number = 1.0; // auto-computed from viewport vs garden size
  private userZoom: number = 1.0; // user-controlled via scroll wheel / pinch

  // Camera panning state
  private panOffset: { x: number; y: number } = { x: 0, y: 0 };
  private targetPanOffset: { x: number; y: number } | null = null;
  private targetUserZoom: number | null = null;

  // Touch state for single-finger pan
  private touchState: {
    startPos: { x: number; y: number };
    startPan: { x: number; y: number };
  } | null = null;

  // Pinch state for two-finger zoom
  private pinchState: {
    startDist: number;
    startUserZoom: number;
    center: { x: number; y: number };
  } | null = null;

  // Mouse drag state for desktop panning
  private mouseState: {
    startPos: { x: number; y: number };
    startPan: { x: number; y: number };
  } | null = null;

  /** Whether the last mouse interaction was a drag (moved > threshold) */
  private _wasDragging = false;
  private static readonly DRAG_THRESHOLD = 5; // pixels

  // Intro zoom animation state
  private introZoomActive: boolean = true;
  private introZoomStart: number = 0;
  private readonly INTRO_ZOOM_DURATION = 2000; // ms
  private readonly INTRO_ZOOM_FROM = 0.85;
  private readonly INTRO_ZOOM_TO = 1.0;

  constructor(config: SceneManagerConfig) {
    this.container = config.container;
    const vw = config.width ?? window.innerWidth;
    const vh = config.height ?? window.innerHeight;

    // Create scene with default background
    this.scene = new THREE.Scene();
    const bgColor =
      config.backgroundColor ?? BACKGROUND_CONFIGS[this.currentBackground].backgroundColor;
    this.scene.background = new THREE.Color(bgColor);

    // Create orthographic camera with garden-world frustum
    // Origin at top-left (0,0), positive x to right, positive y down
    // Actual frustum bounds are set by applyCamera() based on viewport aspect ratio
    this.camera = new THREE.OrthographicCamera(
      0, // left
      CANVAS.DEFAULT_WIDTH, // right
      0, // top
      CANVAS.DEFAULT_HEIGHT, // bottom
      0.1, // near
      1000 // far
    );
    // Position camera looking down at Z=0 plane
    this.camera.position.z = 500;

    // Create renderer — fills the viewport
    this.renderer = new THREE.WebGLRenderer({
      antialias: false, // Pixel art style - no smoothing
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(vw, vh);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Sort objects by renderOrder for proper layering
    this.renderer.sortObjects = true;

    // Append canvas to container
    this.container.appendChild(this.renderer.domElement);

    // Set up post-processing pipeline (bloom + paper grain)
    this.bloomEnabled = config.enableBloom ?? true;
    this.setupPostProcessing(vw, vh);

    // Calculate initial camera layout
    this.computeLayout(vw, vh);
    this.applyCamera();

    // Handle resize
    window.addEventListener("resize", this.handleResize);

    // Scroll wheel zoom (desktop)
    this.renderer.domElement.addEventListener("wheel", this.handleWheel, { passive: false });

    // Touch: panning + pinch-to-zoom (mobile)
    this.renderer.domElement.addEventListener("touchstart", this.handleTouchStart, {
      passive: false,
    });
    this.renderer.domElement.addEventListener("touchmove", this.handleTouchMove, {
      passive: false,
    });
    this.renderer.domElement.addEventListener("touchend", this.handleTouchEnd);

    // Mouse: click-drag panning (desktop)
    this.renderer.domElement.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
  }

  /**
   * Set up the post-processing pipeline.
   *
   * Always creates an EffectComposer with:
   * 1. RenderPass — renders the scene
   * 2. BloomPass (optional) — glow on bright elements
   * 3. PaperGrainPass — applies paper texture to background areas
   * 4. OutputPass — color space conversion
   *
   * The paper grain is applied AFTER bloom so it doesn't get washed out.
   */
  private setupPostProcessing(width: number, height: number): void {
    this.composer = new EffectComposer(this.renderer);

    // Render pass - renders the scene normally
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Bloom pass - adds glow to bright areas (optional)
    if (this.bloomEnabled) {
      const resolution = new THREE.Vector2(Math.floor(width / 2), Math.floor(height / 2));
      this.bloomPass = new UnrealBloomPass(
        resolution,
        BLOOM_CONFIG.STRENGTH,
        BLOOM_CONFIG.RADIUS,
        BLOOM_CONFIG.THRESHOLD
      );
      this.composer.addPass(this.bloomPass);
    }

    // Parchment background pass (atmospheric haze)
    const paperTexture = createPaperTexture();
    this.paperPass = new ShaderPass(PaperGrainShader);
    this.paperPass.uniforms["tPaper"]!.value = paperTexture;
    (this.paperPass.uniforms["resolution"]!.value as THREE.Vector2).set(width, height);
    this.paperPass.uniforms["aspectRatio"]!.value = width / height;
    this.paperPass.enabled = this.currentBackground === "parchment";
    this.composer.addPass(this.paperPass);

    // Cloud background pass (procedural FBM clouds)
    this.cloudPass = new ShaderPass(CloudShader);
    (this.cloudPass.uniforms["resolution"]!.value as THREE.Vector2).set(width, height);
    this.cloudPass.uniforms["aspectRatio"]!.value = width / height;
    this.cloudPass.uniforms["uTime"]!.value = 0;
    this.cloudPass.enabled = this.currentBackground === "clouds";
    this.composer.addPass(this.cloudPass);

    // Output pass - handles color space conversion for final output
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  // --- Effective zoom helpers ---

  /** Get the effective zoom level (baseZoom × userZoom, excluding dwell micro-zoom) */
  private get effectiveUserZoom(): number {
    return this.baseZoom * this.userZoom;
  }

  /** Get the full effective zoom including dwell micro-zoom */
  private get effectiveZoom(): number {
    return this.baseZoom * this.userZoom * this.currentZoom;
  }

  /** Whether the last mouse interaction was a drag rather than a click */
  get wasDragging(): boolean {
    return this._wasDragging;
  }

  /** Whether panning is enabled (zoomed in past full-garden view) */
  private get isPanningEnabled(): boolean {
    return this.effectiveUserZoom > 1.001; // small epsilon to avoid float comparison issues
  }

  /** Clamp userZoom to valid range based on current baseZoom */
  private clampUserZoom(): void {
    const minUser = ZOOM_CONFIG.MIN_EFFECTIVE / this.baseZoom;
    const maxUser = ZOOM_CONFIG.MAX_EFFECTIVE / this.baseZoom;
    this.userZoom = Math.max(minUser, Math.min(maxUser, this.userZoom));
  }

  /**
   * Compute layout parameters based on viewport size.
   * Determines baseZoom and resets userZoom.
   */
  private computeLayout(vw: number, vh: number): void {
    const gardenW = CANVAS.DEFAULT_WIDTH;
    const gardenH = CANVAS.DEFAULT_HEIGHT;

    // How many screen pixels per garden pixel at fit-to-screen
    const fitScale = Math.min(vw / gardenW, vh / gardenH);

    if (fitScale >= MIN_READABLE_SCALE) {
      // Garden is readable at this viewport size — start at 1.5x for lush feel
      this.baseZoom = 1.5;
    } else {
      // Viewport is too small — auto-zoom for readability
      this.baseZoom = Math.max(1.5, MIN_READABLE_SCALE / fitScale);
    }

    // Reset user zoom on layout recompute (window resize)
    this.userZoom = 1.0;
    this.panOffset = { x: 0, y: 0 };
  }

  /**
   * Apply camera frustum based on garden world, viewport aspect ratio, pan, and zoom.
   *
   * The frustum is expanded on one axis to match the viewport aspect ratio,
   * keeping the garden centered. Pan offset shifts the view when zoomed in.
   */
  private applyCamera(): void {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gardenW = CANVAS.DEFAULT_WIDTH;
    const gardenH = CANVAS.DEFAULT_HEIGHT;

    const gardenAspect = gardenW / gardenH;
    const viewportAspect = vw / vh;

    // Calculate visible world size to fit garden with correct aspect ratio
    let visibleW: number;
    let visibleH: number;

    if (viewportAspect > gardenAspect) {
      // Viewport is wider than garden — expand width (pillarbox)
      visibleH = gardenH;
      visibleW = gardenH * viewportAspect;
    } else {
      // Viewport is taller than garden — expand height (letterbox)
      visibleW = gardenW;
      visibleH = gardenW / viewportAspect;
    }

    // Center the garden in the visible area
    const cx = gardenW / 2;
    const cy = gardenH / 2;

    // Set frustum centered on garden, offset by pan
    this.camera.left = cx - visibleW / 2 + this.panOffset.x;
    this.camera.right = cx + visibleW / 2 + this.panOffset.x;
    this.camera.top = cy - visibleH / 2 + this.panOffset.y;
    this.camera.bottom = cy + visibleH / 2 + this.panOffset.y;

    // Apply combined zoom: baseZoom × userZoom × dwellZoom
    this.camera.zoom = this.effectiveZoom;

    this.camera.updateProjectionMatrix();
  }

  /**
   * Clamp pan offset so the camera stays within garden bounds.
   * When fully zoomed out, maxPan naturally reaches 0 — no hard snap needed.
   */
  private clampPanOffset(): void {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gardenW = CANVAS.DEFAULT_WIDTH;
    const gardenH = CANVAS.DEFAULT_HEIGHT;
    const zoom = this.effectiveZoom;

    // Visible garden extent at current zoom
    const gardenAspect = gardenW / gardenH;
    const viewportAspect = vw / vh;

    let visibleW: number;
    let visibleH: number;
    if (viewportAspect > gardenAspect) {
      visibleH = gardenH;
      visibleW = gardenH * viewportAspect;
    } else {
      visibleW = gardenW;
      visibleH = gardenW / viewportAspect;
    }

    // After zoom, the actual visible area is smaller
    const zoomedW = visibleW / zoom;
    const zoomedH = visibleH / zoom;

    // Maximum pan from center: half of garden minus half of visible
    const maxPanX = Math.max(0, (gardenW - zoomedW) / 2);
    const maxPanY = Math.max(0, (gardenH - zoomedH) / 2);

    this.panOffset.x = Math.max(-maxPanX, Math.min(maxPanX, this.panOffset.x));
    this.panOffset.y = Math.max(-maxPanY, Math.min(maxPanY, this.panOffset.y));
  }

  /**
   * Zoom toward a screen point, keeping the world position under that point fixed.
   */
  private zoomToward(clientX: number, clientY: number, newUserZoom: number): void {
    // Get world position under cursor before zoom
    const worldBefore = this.screenToWorld(clientX, clientY);

    // Apply new zoom
    this.userZoom = newUserZoom;
    this.clampUserZoom();
    this.applyCamera();

    // Get world position under cursor after zoom
    const worldAfter = this.screenToWorld(clientX, clientY);

    // Adjust pan so the same world point stays under the cursor
    this.panOffset.x += worldBefore.x - worldAfter.x;
    this.panOffset.y += worldBefore.y - worldAfter.y;
    this.clampPanOffset();
    this.applyCamera();
  }

  // --- Scroll wheel zoom ---

  private handleWheel = (e: WheelEvent): void => {
    e.preventDefault();

    const zoomIn = e.deltaY < 0;
    const factor = zoomIn ? ZOOM_CONFIG.WHEEL_FACTOR : 1 / ZOOM_CONFIG.WHEEL_FACTOR;
    const newUserZoom = this.userZoom * factor;

    this.zoomToward(e.clientX, e.clientY, newUserZoom);
  };

  // --- Touch handlers: single-finger pan + two-finger pinch ---

  private handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();

    if (e.touches.length === 2) {
      // Start pinch-to-zoom
      const t0 = e.touches[0]!;
      const t1 = e.touches[1]!;
      const dx = t1.clientX - t0.clientX;
      const dy = t1.clientY - t0.clientY;
      this.pinchState = {
        startDist: Math.sqrt(dx * dx + dy * dy),
        startUserZoom: this.userZoom,
        center: { x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 },
      };
      // Cancel any active single-finger pan
      this.touchState = null;
    } else if (e.touches.length === 1 && this.isPanningEnabled) {
      // Start single-finger pan
      const touch = e.touches[0]!;
      this.touchState = {
        startPos: { x: touch.clientX, y: touch.clientY },
        startPan: { ...this.panOffset },
      };
      this.pinchState = null;
    }
  };

  private handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault();

    if (e.touches.length === 2 && this.pinchState) {
      // Pinch-to-zoom
      const t0 = e.touches[0]!;
      const t1 = e.touches[1]!;
      const dx = t1.clientX - t0.clientX;
      const dy = t1.clientY - t0.clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);

      const scale = currentDist / this.pinchState.startDist;
      const newUserZoom = this.pinchState.startUserZoom * scale;

      this.zoomToward(this.pinchState.center.x, this.pinchState.center.y, newUserZoom);
    } else if (e.touches.length === 1 && this.touchState) {
      // Single-finger pan
      const touch = e.touches[0]!;
      const dx = touch.clientX - this.touchState.startPos.x;
      const dy = touch.clientY - this.touchState.startPos.y;

      // Convert screen pixels to garden-world units
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const gardenW = CANVAS.DEFAULT_WIDTH;
      const gardenH = CANVAS.DEFAULT_HEIGHT;
      const gardenAspect = gardenW / gardenH;
      const viewportAspect = vw / vh;

      let visibleW: number;
      if (viewportAspect > gardenAspect) {
        visibleW = gardenH * viewportAspect;
      } else {
        visibleW = gardenW;
      }
      const zoom = this.effectiveZoom;
      const gardenUnitsPerPixel = visibleW / zoom / vw;

      // Negative because dragging right should show what's to the left
      this.panOffset.x = this.touchState.startPan.x - dx * gardenUnitsPerPixel;
      this.panOffset.y = this.touchState.startPan.y - dy * gardenUnitsPerPixel;
      this.clampPanOffset();
      this.applyCamera();
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    if (e.touches.length === 1 && this.pinchState) {
      // Transitioning from pinch (2 fingers) to pan (1 finger)
      // Start a new pan from the remaining finger
      const touch = e.touches[0]!;
      this.pinchState = null;
      if (this.isPanningEnabled) {
        this.touchState = {
          startPos: { x: touch.clientX, y: touch.clientY },
          startPan: { ...this.panOffset },
        };
      }
    } else if (e.touches.length === 0) {
      // All fingers lifted
      this.touchState = null;
      this.pinchState = null;
    }
  };

  // --- Mouse handlers: click-drag panning (desktop) ---

  private handleMouseDown = (e: MouseEvent): void => {
    // Only track left-click
    if (e.button !== 0) return;

    this._wasDragging = false;
    this.mouseState = {
      startPos: { x: e.clientX, y: e.clientY },
      startPan: { ...this.panOffset },
    };
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.mouseState) return;

    const dx = e.clientX - this.mouseState.startPos.x;
    const dy = e.clientY - this.mouseState.startPos.y;

    // Check if movement exceeds drag threshold
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > SceneManager.DRAG_THRESHOLD) {
      this._wasDragging = true;
    }

    // Only pan if panning is enabled
    if (!this.isPanningEnabled) return;

    // Convert screen pixels to garden-world units
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gardenW = CANVAS.DEFAULT_WIDTH;
    const gardenH = CANVAS.DEFAULT_HEIGHT;
    const gardenAspect = gardenW / gardenH;
    const viewportAspect = vw / vh;

    let visibleW: number;
    if (viewportAspect > gardenAspect) {
      visibleW = gardenH * viewportAspect;
    } else {
      visibleW = gardenW;
    }
    const zoom = this.effectiveZoom;
    const gardenUnitsPerPixel = visibleW / zoom / vw;

    // Negative because dragging right should show what's to the left
    this.panOffset.x = this.mouseState.startPan.x - dx * gardenUnitsPerPixel;
    this.panOffset.y = this.mouseState.startPan.y - dy * gardenUnitsPerPixel;
    this.clampPanOffset();
    this.applyCamera();
  };

  private handleMouseUp = (): void => {
    this.mouseState = null;
  };

  /**
   * Convert screen (client) coordinates to garden world coordinates.
   * Accounts for camera frustum, zoom, and pan offset.
   */
  screenToWorld(clientX: number, clientY: number): { x: number; y: number } {
    const canvas = this.renderer.domElement;
    const rect = canvas.getBoundingClientRect();

    // Normalized device coordinates (-1 to 1)
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);

    const vector = new THREE.Vector3(ndcX, ndcY, 0);
    vector.unproject(this.camera);

    return { x: vector.x, y: vector.y };
  }

  /**
   * Start the render loop.
   */
  start(): void {
    if (this.animationId !== null) return;
    this.lastTime = performance.now();
    // Start intro zoom animation
    if (this.introZoomActive) {
      this.introZoomStart = performance.now();
      this.userZoom = this.INTRO_ZOOM_FROM;
      this.applyCamera();
    }
    this.animate();
  }

  /**
   * Stop the render loop.
   */
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Add an update callback to be called each frame.
   */
  addUpdateCallback(callback: (deltaTime: number) => void): void {
    this.updateCallbacks.add(callback);
  }

  /**
   * Remove an update callback.
   */
  removeUpdateCallback(callback: (deltaTime: number) => void): void {
    this.updateCallbacks.delete(callback);
  }

  /**
   * Add a post-render callback to be called after each frame render.
   */
  addPostRenderCallback(callback: () => void): void {
    this.postRenderCallbacks.add(callback);
  }

  /**
   * Remove a post-render callback.
   */
  removePostRenderCallback(callback: () => void): void {
    this.postRenderCallbacks.delete(callback);
  }

  /**
   * Main animation loop.
   */
  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    const now = performance.now();
    const deltaTime = (now - this.lastTime) / 1000; // Convert to seconds
    const frameTimeMs = now - this.lastTime;
    this.lastTime = now;

    // Track frame times for rolling average
    this.frameTimes.push(frameTimeMs);
    if (this.frameTimes.length > this.FRAME_SAMPLE_SIZE) {
      this.frameTimes.shift();
    }

    // Call all update callbacks
    for (const callback of this.updateCallbacks) {
      callback(deltaTime);
    }

    // Update intro zoom animation ("stepping into the painting" effect)
    if (this.introZoomActive) {
      const elapsed = now - this.introZoomStart;
      if (elapsed >= this.INTRO_ZOOM_DURATION) {
        this.userZoom = this.INTRO_ZOOM_TO;
        this.introZoomActive = false;
      } else {
        // Ease-out cubic for gentle deceleration
        const t = elapsed / this.INTRO_ZOOM_DURATION;
        const eased = 1 - Math.pow(1 - t, 3);
        this.userZoom = this.INTRO_ZOOM_FROM + (this.INTRO_ZOOM_TO - this.INTRO_ZOOM_FROM) * eased;
      }
      this.applyCamera();
    }

    // Update camera zoom with smooth interpolation
    this.updateCameraZoom();

    // Update smooth pan and zoom animations (from panTo)
    this.updateCameraPan();
    this.updateUserZoom();

    // Update cloud animation time
    if (this.cloudPass?.enabled) {
      this.cloudPass.uniforms["uTime"]!.value += deltaTime;
    }

    // Render through post-processing pipeline
    this.composer!.render();

    // Update performance metrics after render
    this.updatePerformanceMetrics();

    // Call post-render callbacks (e.g., overlays)
    for (const callback of this.postRenderCallbacks) {
      callback();
    }
  };

  /**
   * Update performance metrics from renderer info.
   */
  private updatePerformanceMetrics(): void {
    // Calculate rolling average FPS and frame time
    if (this.frameTimes.length > 0) {
      const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
      this._performanceMetrics.frameTimeMs = avgFrameTime;
      this._performanceMetrics.fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
    }

    // Get renderer info
    const info = this.renderer.info;
    this._performanceMetrics.drawCalls = info.render.calls;
    this._performanceMetrics.triangles = info.render.triangles;
  }

  /**
   * Get current performance metrics.
   */
  get performanceMetrics(): PerformanceMetrics {
    return { ...this._performanceMetrics };
  }

  /**
   * Handle window resize.
   */
  private handleResize = (): void => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Update renderer to fill viewport
    this.renderer.setSize(vw, vh);

    // Update post-processing pipeline
    if (this.composer) {
      this.composer.setSize(vw, vh);
    }
    if (this.bloomPass) {
      this.bloomPass.resolution.set(Math.floor(vw / 2), Math.floor(vh / 2));
    }
    if (this.paperPass) {
      (this.paperPass.uniforms["resolution"]!.value as THREE.Vector2).set(vw, vh);
      this.paperPass.uniforms["aspectRatio"]!.value = vw / vh;
    }
    if (this.cloudPass) {
      (this.cloudPass.uniforms["resolution"]!.value as THREE.Vector2).set(vw, vh);
      this.cloudPass.uniforms["aspectRatio"]!.value = vw / vh;
    }

    // Recalculate layout and apply camera
    this.computeLayout(vw, vh);
    this.applyCamera();
  };

  /**
   * Get the canvas element.
   */
  get canvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  /**
   * Get current viewport dimensions.
   */
  get viewport(): { width: number; height: number } {
    return {
      width: this.renderer.domElement.width / window.devicePixelRatio,
      height: this.renderer.domElement.height / window.devicePixelRatio,
    };
  }

  /**
   * Enable or disable bloom effect.
   */
  setBloomEnabled(enabled: boolean): void {
    this.bloomEnabled = enabled;
    if (this.bloomPass) {
      this.bloomPass.enabled = enabled;
    }
  }

  /**
   * Get whether bloom is currently enabled.
   */
  isBloomEnabled(): boolean {
    return this.bloomEnabled;
  }

  /**
   * Adjust bloom intensity (0-2 typical range).
   */
  setBloomStrength(strength: number): void {
    if (this.bloomPass) {
      this.bloomPass.strength = strength;
    }
  }

  /**
   * Switch the active background type.
   */
  setBackground(type: BackgroundType): void {
    this.currentBackground = type;

    // Update scene background color
    const config = BACKGROUND_CONFIGS[type];
    this.scene.background = new THREE.Color(config.backgroundColor);

    // Toggle passes
    if (this.paperPass) this.paperPass.enabled = type === "parchment";
    if (this.cloudPass) this.cloudPass.enabled = type === "clouds";
    // "plain" = no background pass enabled
  }

  /**
   * Get the current background type.
   */
  getBackground(): BackgroundType {
    return this.currentBackground;
  }

  /**
   * Update camera zoom with smooth interpolation.
   * Integrates dwell micro-zoom with base zoom and user zoom via applyCamera().
   */
  private updateCameraZoom(): void {
    // Skip if zoom is already at target
    if (Math.abs(this.currentZoom - this.targetZoom) < 0.001) {
      this.currentZoom = this.targetZoom;
      return;
    }

    // Smoothly interpolate toward target
    this.currentZoom += (this.targetZoom - this.currentZoom) * CAMERA_CONFIG.ZOOM_SMOOTHING;

    // Apply camera (which combines baseZoom, userZoom, and currentZoom)
    this.applyCamera();
  }

  /**
   * Update camera pan with smooth interpolation toward target.
   */
  private updateCameraPan(): void {
    if (!this.targetPanOffset) return;

    const dx = this.targetPanOffset.x - this.panOffset.x;
    const dy = this.targetPanOffset.y - this.panOffset.y;

    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
      this.panOffset.x = this.targetPanOffset.x;
      this.panOffset.y = this.targetPanOffset.y;
      this.targetPanOffset = null;
    } else {
      this.panOffset.x += dx * CAMERA_CONFIG.ZOOM_SMOOTHING;
      this.panOffset.y += dy * CAMERA_CONFIG.ZOOM_SMOOTHING;
    }

    this.clampPanOffset();
    this.applyCamera();
  }

  /**
   * Update user zoom with smooth interpolation toward target.
   */
  private updateUserZoom(): void {
    if (this.targetUserZoom === null) return;

    const diff = this.targetUserZoom - this.userZoom;

    if (Math.abs(diff) < 0.005) {
      this.userZoom = this.targetUserZoom;
      this.targetUserZoom = null;
    } else {
      this.userZoom += diff * CAMERA_CONFIG.ZOOM_SMOOTHING;
    }

    this.clampPanOffset();
    this.applyCamera();
  }

  /**
   * Smoothly pan and zoom the camera to center on a world position.
   */
  panTo(worldX: number, worldY: number): void {
    const gardenW = CANVAS.DEFAULT_WIDTH;
    const gardenH = CANVAS.DEFAULT_HEIGHT;

    // Pan offset is relative to the garden center
    this.targetPanOffset = {
      x: worldX - gardenW / 2,
      y: worldY - gardenH / 2,
    };

    // Zoom in to see the plant clearly (only if not already zoomed in more)
    if (this.userZoom < 2.5) {
      this.targetUserZoom = 2.5;
    }
  }

  /**
   * Trigger subtle zoom in for observation dwell.
   * Call when cursor starts dwelling on an observable plant.
   */
  onDwellStart(): void {
    this.targetZoom = CAMERA_CONFIG.DWELL_ZOOM;
  }

  /**
   * Reset zoom to normal after dwell ends.
   * Call when cursor moves off plant or observation completes.
   */
  onDwellEnd(): void {
    this.targetZoom = CAMERA_CONFIG.DEFAULT_ZOOM;
  }

  /**
   * Set a custom target zoom level.
   * @param zoom - Target zoom (1.0 = normal, >1 = zoomed in, <1 = zoomed out)
   */
  setTargetZoom(zoom: number): void {
    this.targetZoom = Math.max(0.5, Math.min(2.0, zoom));
  }

  /**
   * Get current zoom level.
   */
  getZoom(): number {
    return this.currentZoom;
  }

  /**
   * Clean up resources.
   */
  destroy(): void {
    this.stop();
    window.removeEventListener("resize", this.handleResize);

    // Remove input event listeners
    this.renderer.domElement.removeEventListener("wheel", this.handleWheel);
    this.renderer.domElement.removeEventListener("touchstart", this.handleTouchStart);
    this.renderer.domElement.removeEventListener("touchmove", this.handleTouchMove);
    this.renderer.domElement.removeEventListener("touchend", this.handleTouchEnd);
    this.renderer.domElement.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);

    // Remove canvas from DOM
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    // Dispose of post-processing resources
    if (this.composer) {
      this.composer.dispose();
    }

    // Dispose of background pass textures
    if (this.paperPass) {
      const tex = this.paperPass.uniforms["tPaper"]!.value as THREE.Texture | null;
      tex?.dispose();
    }
    if (this.cloudPass) {
      this.cloudPass.material?.dispose();
    }

    // Dispose of Three.js resources
    this.renderer.dispose();
    this.scene.clear();
  }
}
