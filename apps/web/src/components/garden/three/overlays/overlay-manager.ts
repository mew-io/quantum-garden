/**
 * Overlay Manager - Coordinates all UI overlay elements
 *
 * Manages a separate Three.js scene layer for overlay elements like:
 * - Entanglement lines (connections between entangled plants)
 * - Dwell indicator (observation progress arc)
 * - Observation feedback (celebration rings)
 *
 * These are rendered on top of the plant scene.
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

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;

    // Create a separate scene for overlays (rendered after main scene)
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
   * Update all overlays. Called each frame.
   * Uses hasActiveAnimations() checks to skip overlays with no work to do.
   */
  update(time: number, deltaTime: number): void {
    // Only update overlays that have active animations
    if (this.entanglement.hasActiveAnimations()) {
      this.entanglement.update(time);
    }

    if (this.feedback.hasActiveAnimations()) {
      this.feedback.update(time);
    }

    if (this.germination.hasActiveAnimations()) {
      this.germination.update(time);
    }

    if (this.vectorPlants.hasActiveAnimations()) {
      this.vectorPlants.update(time);
    }

    if (this.watercolorPlants.hasActiveAnimations()) {
      this.watercolorPlants.update(time);
    }

    if (this.debug.hasActiveAnimations()) {
      this.debug.update(time, deltaTime);
    }
  }

  /**
   * Set plants for the vector plant overlay and debug overlay.
   */
  setPlants(plants: Plant[]): void {
    this.vectorPlants.setPlants(plants);
    this.watercolorPlants.setPlants(plants);
    this.debug.setPlants(plants);
  }

  /**
   * Set the selected plant for debug highlighting.
   */
  setSelectedPlant(plantId: string | null): void {
    this.debug.setSelectedPlant(plantId);
  }

  /**
   * Trigger a locate pulse on the selected plant.
   */
  triggerLocatePulse(): void {
    this.debug.triggerLocatePulse();
  }

  /**
   * Render the overlay scene on top of the main scene.
   * Should be called after the main scene render.
   */
  render(): void {
    const renderer = this.sceneManager.renderer;
    const camera = this.sceneManager.camera;

    // Reset render target to canvas (in case EffectComposer left it on a framebuffer)
    renderer.setRenderTarget(null);

    // Clear only the depth buffer so overlay renders on top of main scene
    renderer.clearDepth();

    // Don't clear color - render on top of existing content
    renderer.autoClear = false;
    renderer.render(this.overlayScene, camera);
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
  }
}
