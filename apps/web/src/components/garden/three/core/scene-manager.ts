/**
 * Scene Manager - Core Three.js setup for Quantum Garden
 *
 * Manages the WebGL renderer, orthographic camera, and scene lifecycle.
 * Uses OrthographicCamera for 2D rendering without perspective distortion.
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
 * - OrthographicCamera configured for 2D pixel-aligned rendering
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

  // Camera zoom state for micro-transitions
  private targetZoom: number = CAMERA_CONFIG.DEFAULT_ZOOM;
  private currentZoom: number = CAMERA_CONFIG.DEFAULT_ZOOM;

  constructor(config: SceneManagerConfig) {
    this.container = config.container;
    const width = config.width ?? window.innerWidth;
    const height = config.height ?? window.innerHeight;

    // Create scene
    this.scene = new THREE.Scene();
    const bgColor = config.backgroundColor ?? CANVAS.BACKGROUND_COLOR;
    this.scene.background = new THREE.Color(bgColor);

    // Create orthographic camera for 2D rendering
    // Origin at top-left (0,0), positive x to right, positive y down
    // This matches typical 2D canvas coordinate systems
    this.camera = new THREE.OrthographicCamera(
      0, // left
      width, // right
      0, // top
      height, // bottom
      0.1, // near
      1000 // far
    );
    // Position camera looking down at Z=0 plane
    this.camera.position.z = 500;

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: false, // Pixel art style - no smoothing
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // Sort objects by renderOrder for proper layering
    this.renderer.sortObjects = true;

    // Append canvas to container
    this.container.appendChild(this.renderer.domElement);

    // Set up post-processing bloom if enabled
    this.bloomEnabled = config.enableBloom ?? true;
    if (this.bloomEnabled) {
      this.setupBloom(width, height);
    }

    // Handle resize
    window.addEventListener("resize", this.handleResize);
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
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Update camera frustum
    this.camera.left = 0;
    this.camera.right = width;
    this.camera.top = 0;
    this.camera.bottom = height;
    this.camera.updateProjectionMatrix();

    // Update renderer size
    this.renderer.setSize(width, height);

    // Update bloom composer if enabled
    if (this.composer) {
      this.composer.setSize(width, height);
    }
    if (this.bloomPass) {
      this.bloomPass.resolution.set(width, height);
    }
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
   */
  private updateCameraZoom(): void {
    // Skip if zoom is already at target
    if (Math.abs(this.currentZoom - this.targetZoom) < 0.001) {
      this.currentZoom = this.targetZoom;
      return;
    }

    // Smoothly interpolate toward target
    this.currentZoom += (this.targetZoom - this.currentZoom) * CAMERA_CONFIG.ZOOM_SMOOTHING;

    // Apply zoom to camera
    this.camera.zoom = this.currentZoom;
    this.camera.updateProjectionMatrix();
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
