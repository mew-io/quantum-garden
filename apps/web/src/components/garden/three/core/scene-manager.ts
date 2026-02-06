/**
 * Scene Manager - Core Three.js setup for Quantum Garden
 *
 * Manages the WebGL renderer, orthographic camera, and scene lifecycle.
 * Uses OrthographicCamera for 2D rendering without perspective distortion.
 *
 * The camera frustum is set to the fixed 4K garden world size (3840x2160),
 * adjusted for viewport aspect ratio. On desktop, the garden is centered
 * with framing. On mobile, touch panning lets users explore the full garden.
 */

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { CANVAS } from "@quantum-garden/shared";

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
  STRENGTH: 0.4,
  /** Size of bloom radius in pixels */
  RADIUS: 0.6,
  /** Brightness threshold for bloom to kick in (0-1) */
  THRESHOLD: 0.7,
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

/**
 * Minimum ratio of viewport pixels to garden pixels before panning is enabled.
 * Below this threshold, the garden would be too small to read, so we zoom in
 * and allow panning instead. 0.25 means panning enables when the viewport is
 * less than 25% of the garden size (e.g., a 375px phone vs 3840px garden).
 */
const MIN_READABLE_SCALE = 0.25;

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
 * - Aspect-ratio-aware centering (letterbox/pillarbox on desktop)
 * - Touch panning on mobile when garden exceeds viewport
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

  // Camera zoom state for micro-transitions (dwell zoom)
  private targetZoom: number = CAMERA_CONFIG.DEFAULT_ZOOM;
  private currentZoom: number = CAMERA_CONFIG.DEFAULT_ZOOM;

  // Camera panning state (for mobile touch panning)
  private panOffset: { x: number; y: number } = { x: 0, y: 0 };
  private baseZoom: number = 1.0;
  private isPanningEnabled: boolean = false;
  private touchState: {
    startPos: { x: number; y: number };
    startPan: { x: number; y: number };
  } | null = null;

  constructor(config: SceneManagerConfig) {
    this.container = config.container;
    const vw = config.width ?? window.innerWidth;
    const vh = config.height ?? window.innerHeight;

    // Create scene
    this.scene = new THREE.Scene();
    const bgColor = config.backgroundColor ?? CANVAS.BACKGROUND_COLOR;
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
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // Sort objects by renderOrder for proper layering
    this.renderer.sortObjects = true;

    // Append canvas to container
    this.container.appendChild(this.renderer.domElement);

    // Set up post-processing bloom if enabled
    this.bloomEnabled = config.enableBloom ?? true;
    if (this.bloomEnabled) {
      this.setupBloom(vw, vh);
    }

    // Calculate initial camera layout
    this.computeLayout(vw, vh);
    this.applyCamera();

    // Handle resize
    window.addEventListener("resize", this.handleResize);

    // Touch panning for mobile
    this.renderer.domElement.addEventListener("touchstart", this.handleTouchStart, {
      passive: false,
    });
    this.renderer.domElement.addEventListener("touchmove", this.handleTouchMove, {
      passive: false,
    });
    this.renderer.domElement.addEventListener("touchend", this.handleTouchEnd);
  }

  /**
   * Set up post-processing bloom effect.
   * Creates a subtle glow on bright elements like celebration rings and particles.
   */
  private setupBloom(width: number, height: number): void {
    // Create the effect composer
    this.composer = new EffectComposer(this.renderer);

    // Render pass - renders the scene normally
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Bloom pass - adds glow to bright areas
    const resolution = new THREE.Vector2(width, height);
    this.bloomPass = new UnrealBloomPass(
      resolution,
      BLOOM_CONFIG.STRENGTH,
      BLOOM_CONFIG.RADIUS,
      BLOOM_CONFIG.THRESHOLD
    );
    this.composer.addPass(this.bloomPass);

    // Output pass - handles color space conversion for final output
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  /**
   * Compute layout parameters based on viewport size.
   * Determines whether panning is needed and sets base zoom.
   */
  private computeLayout(vw: number, vh: number): void {
    const gardenW = CANVAS.DEFAULT_WIDTH;
    const gardenH = CANVAS.DEFAULT_HEIGHT;

    // How many screen pixels per garden pixel at fit-to-screen
    const fitScale = Math.min(vw / gardenW, vh / gardenH);

    if (fitScale >= MIN_READABLE_SCALE) {
      // Garden is readable at this viewport size — show it all, no panning
      this.baseZoom = 1.0;
      this.isPanningEnabled = false;
      this.panOffset = { x: 0, y: 0 };
    } else {
      // Viewport is too small — zoom in so plants are readable, enable panning
      // baseZoom > 1 zooms into the garden, showing a portion of it
      this.baseZoom = MIN_READABLE_SCALE / fitScale;
      this.isPanningEnabled = true;
      this.clampPanOffset();
    }
  }

  /**
   * Apply camera frustum based on garden world, viewport aspect ratio, pan, and zoom.
   *
   * The frustum is expanded on one axis to match the viewport aspect ratio,
   * keeping the garden centered. Pan offset shifts the view for mobile panning.
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

    // Apply combined zoom: base zoom (for mobile fit) × dwell micro-zoom
    this.camera.zoom = this.baseZoom * this.currentZoom;

    this.camera.updateProjectionMatrix();
  }

  /**
   * Clamp pan offset so the camera stays within garden bounds.
   */
  private clampPanOffset(): void {
    if (!this.isPanningEnabled) {
      this.panOffset = { x: 0, y: 0 };
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gardenW = CANVAS.DEFAULT_WIDTH;
    const gardenH = CANVAS.DEFAULT_HEIGHT;
    const effectiveZoom = this.baseZoom * this.currentZoom;

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
    const zoomedW = visibleW / effectiveZoom;
    const zoomedH = visibleH / effectiveZoom;

    // Maximum pan from center: half of garden minus half of visible
    const maxPanX = Math.max(0, (gardenW - zoomedW) / 2);
    const maxPanY = Math.max(0, (gardenH - zoomedH) / 2);

    this.panOffset.x = Math.max(-maxPanX, Math.min(maxPanX, this.panOffset.x));
    this.panOffset.y = Math.max(-maxPanY, Math.min(maxPanY, this.panOffset.y));
  }

  // --- Touch panning handlers ---

  private handleTouchStart = (e: TouchEvent): void => {
    if (!this.isPanningEnabled || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0]!;
    this.touchState = {
      startPos: { x: touch.clientX, y: touch.clientY },
      startPan: { ...this.panOffset },
    };
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (!this.touchState || e.touches.length !== 1) return;
    e.preventDefault();

    const touch = e.touches[0]!;
    const dx = touch.clientX - this.touchState.startPos.x;
    const dy = touch.clientY - this.touchState.startPos.y;

    // Convert screen pixels to garden-world units
    // Screen-to-world scale: how many garden units per screen pixel
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
    const effectiveZoom = this.baseZoom * this.currentZoom;
    const gardenUnitsPerPixel = visibleW / effectiveZoom / vw;

    // Negative because dragging right should show what's to the left
    this.panOffset.x = this.touchState.startPan.x - dx * gardenUnitsPerPixel;
    this.panOffset.y = this.touchState.startPan.y - dy * gardenUnitsPerPixel;
    this.clampPanOffset();
    this.applyCamera();
  };

  private handleTouchEnd = (): void => {
    this.touchState = null;
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

    // Update camera zoom with smooth interpolation
    this.updateCameraZoom();

    // Render main scene (with bloom if enabled)
    if (this.composer && this.bloomEnabled) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

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

    // Update bloom composer if enabled
    if (this.composer) {
      this.composer.setSize(vw, vh);
    }
    if (this.bloomPass) {
      this.bloomPass.resolution.set(vw, vh);
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
   * Update camera zoom with smooth interpolation.
   * Integrates dwell micro-zoom with base zoom via applyCamera().
   */
  private updateCameraZoom(): void {
    // Skip if zoom is already at target
    if (Math.abs(this.currentZoom - this.targetZoom) < 0.001) {
      this.currentZoom = this.targetZoom;
      return;
    }

    // Smoothly interpolate toward target
    this.currentZoom += (this.targetZoom - this.currentZoom) * CAMERA_CONFIG.ZOOM_SMOOTHING;

    // Apply camera (which combines baseZoom and currentZoom)
    this.applyCamera();
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

    // Remove touch event listeners
    this.renderer.domElement.removeEventListener("touchstart", this.handleTouchStart);
    this.renderer.domElement.removeEventListener("touchmove", this.handleTouchMove);
    this.renderer.domElement.removeEventListener("touchend", this.handleTouchEnd);

    // Remove canvas from DOM
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    // Dispose of post-processing resources
    if (this.composer) {
      this.composer.dispose();
    }

    // Dispose of Three.js resources
    this.renderer.dispose();
    this.scene.clear();
  }
}
