/**
 * Dwell Overlay - Observation progress indicator
 *
 * Three.js implementation of the circular progress arc that shows
 * how close a plant is to being observed (dwell time progress).
 */

import * as THREE from "three";
import { useGardenStore } from "@/stores/garden-store";
import type { Plant } from "@quantum-garden/shared";

/** Visual constants for dwell indicator */
const DWELL_INDICATOR = {
  RADIUS: 35,
  LINE_WIDTH: 3,
  ARC_COLOR: 0x4ecdc4,
  TRACK_COLOR: 0x374151,
  ARC_ALPHA: 0.8,
  TRACK_ALPHA: 0.3,
  SEGMENTS: 64,
};

/**
 * Renders a progress arc around plants being observed.
 */
export class DwellOverlay {
  private group: THREE.Group;

  // Track circle (background)
  private trackGeometry: THREE.BufferGeometry;
  private trackMaterial: THREE.LineBasicMaterial;
  private trackLine: THREE.LineLoop;

  // Progress arc
  private arcGeometry: THREE.BufferGeometry;
  private arcMaterial: THREE.LineBasicMaterial;
  private arcLine: THREE.Line;

  // State from store
  private currentTargetId: string | null = null;
  private currentProgress: number = 0;
  private plants: Plant[] = [];
  private storeUnsubscribe: (() => void) | null = null;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "dwell-indicator";

    // Create track (background circle)
    this.trackGeometry = this.createCircleGeometry(
      DWELL_INDICATOR.RADIUS,
      DWELL_INDICATOR.SEGMENTS
    );
    this.trackMaterial = new THREE.LineBasicMaterial({
      color: DWELL_INDICATOR.TRACK_COLOR,
      transparent: true,
      opacity: DWELL_INDICATOR.TRACK_ALPHA,
    });
    this.trackLine = new THREE.LineLoop(this.trackGeometry, this.trackMaterial);
    this.trackLine.visible = false;
    this.group.add(this.trackLine);

    // Create progress arc
    this.arcGeometry = new THREE.BufferGeometry();
    this.arcMaterial = new THREE.LineBasicMaterial({
      color: DWELL_INDICATOR.ARC_COLOR,
      transparent: true,
      opacity: DWELL_INDICATOR.ARC_ALPHA,
    });
    this.arcLine = new THREE.Line(this.arcGeometry, this.arcMaterial);
    this.arcLine.visible = false;
    this.group.add(this.arcLine);

    // Subscribe to store changes
    this.storeUnsubscribe = useGardenStore.subscribe((state) => {
      this.currentTargetId = state.dwellTarget;
      this.currentProgress = state.dwellProgress;
      this.plants = state.plants;
    });

    // Initial sync
    const state = useGardenStore.getState();
    this.currentTargetId = state.dwellTarget;
    this.currentProgress = state.dwellProgress;
    this.plants = state.plants;
  }

  /**
   * Create a circle geometry.
   */
  private createCircleGeometry(radius: number, segments: number): THREE.BufferGeometry {
    const vertices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      vertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 1);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }

  /**
   * Create an arc geometry from startAngle to endAngle.
   */
  private updateArcGeometry(
    radius: number,
    startAngle: number,
    endAngle: number,
    segments: number
  ): void {
    const vertices: number[] = [];
    const angleRange = endAngle - startAngle;
    const numPoints = Math.max(2, Math.ceil(segments * (angleRange / (Math.PI * 2))));

    for (let i = 0; i <= numPoints; i++) {
      const angle = startAngle + (i / numPoints) * angleRange;
      vertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 1);
    }

    this.arcGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    this.arcGeometry.attributes.position!.needsUpdate = true;
  }

  /**
   * Update the overlay each frame.
   */
  update(_time: number): void {
    // Hide if no active dwell target
    if (!this.currentTargetId || this.currentProgress <= 0) {
      this.trackLine.visible = false;
      this.arcLine.visible = false;
      return;
    }

    // Find the target plant
    const targetPlant = this.plants.find((p) => p.id === this.currentTargetId);
    if (!targetPlant) {
      this.trackLine.visible = false;
      this.arcLine.visible = false;
      return;
    }

    const { x, y } = targetPlant.position;

    // Position track at plant location
    this.trackLine.position.set(x, y, 0);
    this.trackLine.visible = true;

    // Update and position progress arc
    if (this.currentProgress > 0) {
      const startAngle = -Math.PI / 2; // Start at top
      const endAngle = startAngle + this.currentProgress * Math.PI * 2;

      this.updateArcGeometry(
        DWELL_INDICATOR.RADIUS,
        startAngle,
        endAngle,
        DWELL_INDICATOR.SEGMENTS
      );

      this.arcLine.position.set(x, y, 0);
      this.arcLine.visible = true;
    } else {
      this.arcLine.visible = false;
    }
  }

  /**
   * Check if there are any active animations that need updating.
   * Returns true when a dwell indicator is being shown.
   */
  hasActiveAnimations(): boolean {
    return this.currentTargetId !== null && this.currentProgress > 0;
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
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
    }

    this.trackGeometry.dispose();
    this.trackMaterial.dispose();
    this.arcGeometry.dispose();
    this.arcMaterial.dispose();
  }
}
