/**
 * Overlay Manager - Coordinates all UI overlay elements
 *
 * Manages a separate Three.js scene layer for overlay elements like:
 * - Reticle (system attention indicator)
 * - Entanglement lines (connections between entangled plants)
 * - Dwell indicator (observation progress arc)
 * - Observation feedback (celebration rings)
 *
 * These are rendered on top of the plant scene.
 */

import * as THREE from "three";
import type { Plant } from "@quantum-garden/shared";
import type { SceneManager } from "../core/scene-manager";
import { ReticleOverlay } from "./reticle-overlay";
import { EntanglementOverlay } from "./entanglement-overlay";
import { DwellOverlay } from "./dwell-overlay";
import { FeedbackOverlay } from "./feedback-overlay";
import { VectorPlantOverlay } from "./vector-plant-overlay";
import { DebugOverlay } from "./debug-overlay";

/**
 * Manages all overlay elements in a unified way.
 */
export class OverlayManager {
  private sceneManager: SceneManager;
  private overlayScene: THREE.Scene;

  // Overlay components
  public reticle: ReticleOverlay;
  public entanglement: EntanglementOverlay;
  public dwell: DwellOverlay;
  public feedback: FeedbackOverlay;
  public vectorPlants: VectorPlantOverlay;
  public debug: DebugOverlay;

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;

    // Create a separate scene for overlays (rendered after main scene)
    this.overlayScene = new THREE.Scene();

    // Initialize overlay components
    this.reticle = new ReticleOverlay();
    this.entanglement = new EntanglementOverlay();
    this.dwell = new DwellOverlay();
    this.feedback = new FeedbackOverlay();
    this.vectorPlants = new VectorPlantOverlay();
    this.debug = new DebugOverlay();

    // Add all overlay meshes to the overlay scene
    this.overlayScene.add(this.reticle.getObject());
    this.overlayScene.add(this.entanglement.getObject());
    this.overlayScene.add(this.dwell.getObject());
    this.overlayScene.add(this.feedback.getObject());
    this.overlayScene.add(this.vectorPlants.getObject());
    this.overlayScene.add(this.debug.getObject());
  }

  /**
   * Update all overlays. Called each frame.
   */
  update(time: number, deltaTime: number): void {
    this.reticle.update(time, deltaTime);
    this.entanglement.update(time);
    this.dwell.update(time);
    this.feedback.update(time);
    this.vectorPlants.update(time);
    this.debug.update(time, deltaTime);
  }

  /**
   * Set plants for the vector plant overlay and debug overlay.
   */
  setPlants(plants: Plant[]): void {
    this.vectorPlants.setPlants(plants);
    this.debug.setPlants(plants);
  }

  /**
   * Set the selected plant for debug highlighting.
   */
  setSelectedPlant(plantId: string | null): void {
    this.debug.setSelectedPlant(plantId);
  }

  /**
   * Render the overlay scene on top of the main scene.
   * Should be called after the main scene render.
   */
  render(): void {
    const renderer = this.sceneManager.renderer;
    const camera = this.sceneManager.camera;

    // Don't clear - render on top of existing content
    renderer.autoClear = false;
    renderer.render(this.overlayScene, camera);
    renderer.autoClear = true;
  }

  /**
   * Clean up all resources.
   */
  dispose(): void {
    this.reticle.dispose();
    this.entanglement.dispose();
    this.dwell.dispose();
    this.feedback.dispose();
    this.vectorPlants.dispose();
    this.debug.dispose();
  }
}
