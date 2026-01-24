/**
 * Scene Manager - Core Three.js setup for Quantum Garden
 *
 * Manages the WebGL renderer, orthographic camera, and scene lifecycle.
 * Uses OrthographicCamera for 2D rendering without perspective distortion.
 */

import * as THREE from "three";
import { CANVAS } from "@quantum-garden/shared";

export interface SceneManagerConfig {
  container: HTMLElement;
  width?: number;
  height?: number;
  backgroundColor?: string;
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

  private container: HTMLElement;
  private animationId: number | null = null;
  private updateCallbacks: Set<(deltaTime: number) => void> = new Set();
  private postRenderCallbacks: Set<() => void> = new Set();
  private lastTime: number = 0;

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

    // Handle resize
    window.addEventListener("resize", this.handleResize);
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
    this.lastTime = now;

    // Call all update callbacks
    for (const callback of this.updateCallbacks) {
      callback(deltaTime);
    }

    // Render main scene
    this.renderer.render(this.scene, this.camera);

    // Call post-render callbacks (e.g., overlays)
    for (const callback of this.postRenderCallbacks) {
      callback();
    }
  };

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
   * Clean up resources.
   */
  destroy(): void {
    this.stop();
    window.removeEventListener("resize", this.handleResize);

    // Remove canvas from DOM
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    // Dispose of Three.js resources
    this.renderer.dispose();
    this.scene.clear();
  }
}
