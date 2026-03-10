/**
 * Overlay Manager - Coordinates all UI overlay elements
 *
 * Manages a separate Three.js scene layer for overlay elements like:
 * - Entanglement lines (connections between entangled plants)
 * - Dwell indicator (observation progress arc)
 * - Observation feedback (celebration rings)
 *
 * These are rendered on top of the plant scene.
 *
 * Performance: The overlay scene is rendered to a cached render target.
 * Only re-renders when content changes (dirty flag). On most frames,
 * composites the cached texture with a single full-screen quad draw.
 */

import * as THREE from "three";
import type { Plant } from "@quantum-garden/shared";
import type { SceneManager } from "../core/scene-manager";
import { EntanglementOverlay } from "./entanglement-overlay";
import { FeedbackOverlay } from "./feedback-overlay";
import { GerminationOverlay } from "./germination-overlay";
import { VectorPlantOverlay } from "./vector-plant-overlay";
import { WatercolorPlantOverlay } from "./watercolor-plant-overlay";
import { DebugOverlay } from "./debug-overlay";

/**
 * Manages all overlay elements in a unified way.
 */
export class OverlayManager {
  private sceneManager: SceneManager;
  private overlayScene: THREE.Scene;

  // Overlay components
  public entanglement: EntanglementOverlay;
  public feedback: FeedbackOverlay;
  public germination: GerminationOverlay;
  public vectorPlants: VectorPlantOverlay;
  public watercolorPlants: WatercolorPlantOverlay;
  public debug: DebugOverlay;

  // Track whether plant overlays have content (set via setPlants)
  private hasPlantOverlayContent = false;

  // Cached render target for overlay scene
  private renderTarget: THREE.WebGLRenderTarget | null = null;
  private compositeQuad: THREE.Mesh | null = null;
  private compositeScene: THREE.Scene | null = null;
  private compositeCamera: THREE.OrthographicCamera | null = null;
  private dirty = true;
  private lastCameraMatrix = new THREE.Matrix4();

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;

    // Create a separate scene for overlays (rendered to cache)
    this.overlayScene = new THREE.Scene();

    // Initialize overlay components
    this.entanglement = new EntanglementOverlay();
    this.feedback = new FeedbackOverlay();
    this.germination = new GerminationOverlay();
    this.vectorPlants = new VectorPlantOverlay();
    this.watercolorPlants = new WatercolorPlantOverlay();
    this.debug = new DebugOverlay();

    // Add all overlay meshes to the overlay scene
    this.overlayScene.add(this.entanglement.getObject());
    this.overlayScene.add(this.feedback.getObject());
    this.overlayScene.add(this.germination.getObject());
    this.overlayScene.add(this.vectorPlants.getObject());
    this.overlayScene.add(this.watercolorPlants.getObject());
    this.overlayScene.add(this.debug.getObject());
  }

  /**
   * Mark overlay cache as dirty so it re-renders next frame.
   */
  markDirty(): void {
    this.dirty = true;
  }

  /**
   * Update all overlays. Called each frame.
   * Uses hasActiveAnimations() checks to skip overlays with no work to do.
   */
  update(time: number, deltaTime: number): void {
    // Only update overlays that have active animations
    if (this.entanglement.hasActiveAnimations()) {
      this.entanglement.update(time);
      this.dirty = true;
    }

    if (this.feedback.hasActiveAnimations()) {
      this.feedback.update(time);
      this.dirty = true;
    }

    if (this.germination.hasActiveAnimations()) {
      this.germination.update(time);
      this.dirty = true;
    }

    if (this.vectorPlants.hasActiveAnimations()) {
      this.vectorPlants.update(time);
      this.dirty = true;
    }

    if (this.watercolorPlants.hasActiveAnimations()) {
      this.watercolorPlants.update(time);
      this.dirty = true;
    }

    if (this.debug.hasActiveAnimations()) {
      this.debug.update(time, deltaTime);
      this.dirty = true;
    }
  }

  /**
   * Set plants for the vector plant overlay and debug overlay.
   */
  setPlants(plants: Plant[]): void {
    this.vectorPlants.setPlants(plants);
    this.watercolorPlants.setPlants(plants);
    this.debug.setPlants(plants);
    this.hasPlantOverlayContent =
      this.vectorPlants.hasActiveAnimations() || this.watercolorPlants.hasActiveAnimations();
    this.dirty = true;
  }

  /**
   * Set the selected plant for debug highlighting.
   */
  setSelectedPlant(plantId: string | null): void {
    this.debug.setSelectedPlant(plantId);
    this.dirty = true;
  }

  /**
   * Trigger a locate pulse on the selected plant.
   */
  triggerLocatePulse(): void {
    this.debug.triggerLocatePulse();
    this.dirty = true;
  }

  /**
   * Whether any overlay has visible content worth rendering.
   * Used to skip the overlay render pass entirely when idle.
   */
  hasAnyVisibleContent(): boolean {
    return (
      this.entanglement.hasActiveAnimations() ||
      this.feedback.hasActiveAnimations() ||
      this.germination.hasActiveAnimations() ||
      this.hasPlantOverlayContent ||
      this.debug.hasActiveAnimations()
    );
  }

  /**
   * Ensure the render target and composite quad exist and match the renderer size.
   */
  private ensureRenderTarget(): void {
    const renderer = this.sceneManager.renderer;
    const size = renderer.getSize(new THREE.Vector2());
    const pixelRatio = renderer.getPixelRatio();
    const w = Math.floor(size.x * pixelRatio);
    const h = Math.floor(size.y * pixelRatio);

    if (this.renderTarget && this.renderTarget.width === w && this.renderTarget.height === h) {
      return;
    }

    // Dispose old target
    this.renderTarget?.dispose();

    this.renderTarget = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
    });

    // Create composite quad for blitting the cached texture
    const mat = new THREE.MeshBasicMaterial({
      map: this.renderTarget.texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    if (this.compositeQuad) {
      (this.compositeQuad.material as THREE.Material).dispose();
      this.compositeQuad.geometry.dispose();
    }

    this.compositeQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    this.compositeScene = new THREE.Scene();
    this.compositeScene.add(this.compositeQuad);
    this.compositeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.dirty = true;
  }

  /**
   * Render the overlay scene on top of the main scene.
   * Uses a cached render target — only re-renders the full overlay scene when dirty.
   */
  render(): void {
    const renderer = this.sceneManager.renderer;
    const camera = this.sceneManager.camera;

    this.ensureRenderTarget();

    // Check if camera changed (zoom/pan) — invalidates cached overlay
    if (!this.lastCameraMatrix.equals(camera.projectionMatrix)) {
      this.lastCameraMatrix.copy(camera.projectionMatrix);
      this.dirty = true;
    }

    // Only re-render overlay scene to cache when content changed
    if (this.dirty) {
      renderer.setRenderTarget(this.renderTarget);
      renderer.setClearColor(0x000000, 0);
      renderer.clear(true, true, false);
      renderer.render(this.overlayScene, camera);
      renderer.setRenderTarget(null);
      this.dirty = false;
    }

    // Composite cached overlay texture on top of main scene (1 draw call)
    renderer.clearDepth();
    renderer.autoClear = false;
    renderer.render(this.compositeScene!, this.compositeCamera!);
    renderer.autoClear = true;
  }

  /**
   * Clean up all resources.
   */
  dispose(): void {
    this.entanglement.dispose();
    this.feedback.dispose();
    this.germination.dispose();
    this.vectorPlants.dispose();
    this.watercolorPlants.dispose();
    this.debug.dispose();

    this.renderTarget?.dispose();
    if (this.compositeQuad) {
      (this.compositeQuad.material as THREE.Material).dispose();
      this.compositeQuad.geometry.dispose();
    }
  }
}
