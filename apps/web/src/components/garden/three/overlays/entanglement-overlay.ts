/**
 * Entanglement Overlay - Visualizes quantum entanglement connections
 *
 * Three.js implementation of dashed lines connecting entangled plants.
 * Uses LineSegments with a LineDashedMaterial for the dashed effect.
 */

import * as THREE from "three";
import { useGardenStore } from "@/stores/garden-store";
import type { Plant } from "@quantum-garden/shared";

/** Visual constants for entanglement lines */
const ENTANGLEMENT = {
  LINE_COLOR: 0x9b87f5,
  LINE_WIDTH: 1.5,
  LINE_ALPHA: 0.3,
  PULSE_ALPHA: 0.8,
  PULSE_DURATION: 2.0,
  DASH_SIZE: 8,
  GAP_SIZE: 4,
};

interface EntanglementGroup {
  groupId: string;
  plants: Plant[];
}

/**
 * Renders dashed lines between entangled plants.
 */
export class EntanglementOverlay {
  private group: THREE.Group;
  private lines: THREE.LineSegments | null = null;
  private material: THREE.LineDashedMaterial;
  private groups: EntanglementGroup[] = [];
  private pulsingGroups: Map<string, number> = new Map();
  private storeUnsubscribe: (() => void) | null = null;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "entanglement";

    // Create dashed line material
    this.material = new THREE.LineDashedMaterial({
      color: ENTANGLEMENT.LINE_COLOR,
      transparent: true,
      opacity: ENTANGLEMENT.LINE_ALPHA,
      dashSize: ENTANGLEMENT.DASH_SIZE,
      gapSize: ENTANGLEMENT.GAP_SIZE,
    });

    // Subscribe to store changes
    this.storeUnsubscribe = useGardenStore.subscribe((state) => {
      this.updateGroups(state.plants);
    });

    // Initial sync
    const initialPlants = useGardenStore.getState().plants;
    this.updateGroups(initialPlants);
  }

  /**
   * Update entanglement groups from plant data.
   */
  private updateGroups(plants: Plant[]): void {
    // Group plants by entanglement group ID
    const groupMap = new Map<string, Plant[]>();

    for (const plant of plants) {
      if (plant.entanglementGroupId) {
        const group = groupMap.get(plant.entanglementGroupId) ?? [];
        group.push(plant);
        groupMap.set(plant.entanglementGroupId, group);
      }
    }

    // Convert to array of groups (only groups with 2+ plants)
    this.groups = Array.from(groupMap.entries())
      .filter(([_, groupPlants]) => groupPlants.length >= 2)
      .map(([groupId, groupPlants]) => ({ groupId, plants: groupPlants }));

    // Rebuild geometry
    this.rebuildGeometry();
  }

  /**
   * Rebuild line geometry based on current groups.
   */
  private rebuildGeometry(): void {
    // Remove old lines
    if (this.lines) {
      this.group.remove(this.lines);
      this.lines.geometry.dispose();
      this.lines = null;
    }

    if (this.groups.length === 0) return;

    // Collect all line segments
    const vertices: number[] = [];

    for (const group of this.groups) {
      const plants = group.plants;
      if (plants.length < 2) continue;

      // Draw lines between consecutive plants
      for (let i = 0; i < plants.length - 1; i++) {
        const p1 = plants[i]!;
        const p2 = plants[i + 1]!;

        vertices.push(p1.position.x, p1.position.y, 0.5);
        vertices.push(p2.position.x, p2.position.y, 0.5);
      }

      // Close the loop if more than 2 plants
      if (plants.length > 2) {
        const first = plants[0]!;
        const last = plants[plants.length - 1]!;
        vertices.push(last.position.x, last.position.y, 0.5);
        vertices.push(first.position.x, first.position.y, 0.5);
      }
    }

    if (vertices.length === 0) return;

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

    // Create lines
    this.lines = new THREE.LineSegments(geometry, this.material);

    // Compute line distances for dashing to work
    this.lines.computeLineDistances();

    this.group.add(this.lines);
  }

  /**
   * Trigger a pulse animation for an entanglement group.
   */
  triggerPulse(groupId: string): void {
    this.pulsingGroups.set(groupId, performance.now());
  }

  /**
   * Update the overlay each frame.
   */
  update(_time: number): void {
    const now = performance.now();

    // Calculate max alpha based on any active pulses
    let maxAlpha = ENTANGLEMENT.LINE_ALPHA;

    for (const [groupId, pulseStart] of this.pulsingGroups) {
      const elapsed = (now - pulseStart) / 1000;

      if (elapsed < ENTANGLEMENT.PULSE_DURATION) {
        const progress = elapsed / ENTANGLEMENT.PULSE_DURATION;
        const pulseIntensity = Math.sin(progress * Math.PI);
        const alpha =
          ENTANGLEMENT.LINE_ALPHA +
          (ENTANGLEMENT.PULSE_ALPHA - ENTANGLEMENT.LINE_ALPHA) * pulseIntensity;
        maxAlpha = Math.max(maxAlpha, alpha);
      } else {
        this.pulsingGroups.delete(groupId);
      }
    }

    // Update material opacity
    this.material.opacity = maxAlpha;
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

    if (this.lines) {
      this.lines.geometry.dispose();
    }
    this.material.dispose();
  }
}
