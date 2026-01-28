/**
 * Debug Overlay - Visualization for observation system debugging
 *
 * Renders observation regions as visible circles when debug mode is enabled.
 * This overlay is only visible during development and can be completely removed for production.
 */

import * as THREE from "three";
import type { ObservationRegion } from "@quantum-garden/shared";

/**
 * Renders debug visualizations for the observation system.
 */
export class DebugOverlay {
  private group: THREE.Group;
  private regionCircle: THREE.LineLoop | null = null;
  private regionCenterDot: THREE.Mesh | null = null;
  private activeRegion: ObservationRegion | null = null;
  private isVisible: boolean = false;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "debug-overlay";
  }

  /**
   * Update the active region visualization.
   */
  setActiveRegion(region: ObservationRegion | null): void {
    this.activeRegion = region;

    // Clear previous visualization
    if (this.regionCircle) {
      this.group.remove(this.regionCircle);
      this.regionCircle.geometry.dispose();
      (this.regionCircle.material as THREE.Material).dispose();
      this.regionCircle = null;
    }

    if (this.regionCenterDot) {
      this.group.remove(this.regionCenterDot);
      this.regionCenterDot.geometry.dispose();
      (this.regionCenterDot.material as THREE.Material).dispose();
      this.regionCenterDot = null;
    }

    // Create new visualization if region exists and debug is visible
    if (region && this.isVisible) {
      this.createRegionVisualization(region);
    }
  }

  /**
   * Create visualization for an observation region.
   */
  private createRegionVisualization(region: ObservationRegion): void {
    // Create circle outline
    const segments = 64;
    const circleGeometry = new THREE.BufferGeometry();
    const vertices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = region.center.x + Math.cos(angle) * region.radius;
      const y = region.center.y + Math.sin(angle) * region.radius;
      vertices.push(x, y, 2); // z = 2 for overlay layer
    }

    circleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

    const circleMaterial = new THREE.LineBasicMaterial({
      color: 0x22c55e, // Green
      transparent: true,
      opacity: 0.3,
      linewidth: 2,
    });

    this.regionCircle = new THREE.LineLoop(circleGeometry, circleMaterial);
    this.group.add(this.regionCircle);

    // Create center dot
    const dotGeometry = new THREE.CircleGeometry(3, 16);
    const dotMaterial = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.5,
    });

    this.regionCenterDot = new THREE.Mesh(dotGeometry, dotMaterial);
    this.regionCenterDot.position.set(region.center.x, region.center.y, 2);
    this.group.add(this.regionCenterDot);
  }

  /**
   * Set visibility of debug overlay.
   */
  setVisible(visible: boolean): void {
    this.isVisible = visible;

    if (visible && this.activeRegion) {
      // Show existing region
      this.createRegionVisualization(this.activeRegion);
    } else if (!visible) {
      // Hide region
      this.setActiveRegion(null);
    }

    this.group.visible = visible;
  }

  /**
   * Get visibility state.
   */
  getVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Update the overlay each frame.
   */
  update(_time: number, _deltaTime: number): void {
    // No per-frame updates needed
    // Region updates happen via setActiveRegion calls
  }

  /**
   * Get the Three.js object for adding to scene.
   */
  getObject(): THREE.Object3D {
    return this.group;
  }

  /**
   * Clean up resources.
   */
  dispose(): void {
    if (this.regionCircle) {
      this.regionCircle.geometry.dispose();
      (this.regionCircle.material as THREE.Material).dispose();
    }

    if (this.regionCenterDot) {
      this.regionCenterDot.geometry.dispose();
      (this.regionCenterDot.material as THREE.Material).dispose();
    }
  }
}
