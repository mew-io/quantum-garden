/**
 * Entanglement Overlay - Visualizes quantum entanglement connections
 *
 * Three.js implementation of dashed lines connecting entangled plants.
 * Uses LineSegments with a LineDashedMaterial for the dashed effect.
 *
 * When observation triggers entanglement, a "quantum correlation wave"
 * travels along the connection lines as a visual pulse.
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
  // Wave particle settings
  WAVE_COLOR: 0xffffff,
  WAVE_SIZE: 6,
  WAVE_DURATION: 0.6, // How long the wave takes to travel
  WAVE_ALPHA: 0.9,
};

interface EntanglementGroup {
  groupId: string;
  plants: Plant[];
}

interface WaveParticle {
  groupId: string;
  startTime: number;
  fromPosition: THREE.Vector3;
  toPosition: THREE.Vector3;
  mesh: THREE.Mesh;
}

/**
 * Renders dashed lines between entangled plants with wave effects.
 */
export class EntanglementOverlay {
  private group: THREE.Group;
  private lines: THREE.LineSegments | null = null;
  private material: THREE.LineDashedMaterial;
  private groups: EntanglementGroup[] = [];
  private pulsingGroups: Map<string, number> = new Map();
  private storeUnsubscribe: (() => void) | null = null;

  // Wave particles
  private waveParticles: WaveParticle[] = [];
  private waveMaterial: THREE.MeshBasicMaterial;
  private waveGeometry: THREE.CircleGeometry;

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

    // Create wave particle material and geometry (reusable)
    this.waveMaterial = new THREE.MeshBasicMaterial({
      color: ENTANGLEMENT.WAVE_COLOR,
      transparent: true,
      opacity: ENTANGLEMENT.WAVE_ALPHA,
    });
    this.waveGeometry = new THREE.CircleGeometry(ENTANGLEMENT.WAVE_SIZE, 16);

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
        const existingGroup = groupMap.get(plant.entanglementGroupId) ?? [];
        existingGroup.push(plant);
        groupMap.set(plant.entanglementGroupId, existingGroup);
      }
    }

    // Convert to array of groups (only groups with 2+ plants)
    this.groups = Array.from(groupMap.entries())
      .filter(([, groupPlants]) => groupPlants.length >= 2)
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
   * Creates wave particles that travel along the connection lines.
   */
  triggerPulse(groupId: string): void {
    const now = performance.now();
    this.pulsingGroups.set(groupId, now);

    // Find the group and create wave particles
    const group = this.groups.find((g) => g.groupId === groupId);
    if (!group || group.plants.length < 2) return;

    // Find the observed plant (the one that triggered the pulse)
    // We'll assume it's the one that was most recently observed
    const observedPlant = group.plants.find((p) => p.observed);
    if (!observedPlant) return;

    // Create wave particles traveling to each non-observed partner
    for (const partner of group.plants) {
      if (partner.id === observedPlant.id) continue;

      // Create a wave particle
      const mesh = new THREE.Mesh(this.waveGeometry, this.waveMaterial.clone());
      mesh.position.set(observedPlant.position.x, observedPlant.position.y, 1);

      this.group.add(mesh);

      this.waveParticles.push({
        groupId,
        startTime: now,
        fromPosition: new THREE.Vector3(observedPlant.position.x, observedPlant.position.y, 1),
        toPosition: new THREE.Vector3(partner.position.x, partner.position.y, 1),
        mesh,
      });
    }
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

    // Update wave particles
    const completedParticles: number[] = [];

    for (let i = 0; i < this.waveParticles.length; i++) {
      const particle = this.waveParticles[i]!;
      const elapsed = (now - particle.startTime) / 1000;
      const progress = elapsed / ENTANGLEMENT.WAVE_DURATION;

      if (progress >= 1) {
        completedParticles.push(i);
        continue;
      }

      // Ease out cubic for smooth arrival
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // Interpolate position
      particle.mesh.position.lerpVectors(particle.fromPosition, particle.toPosition, easedProgress);

      // Fade out as it approaches destination
      const material = particle.mesh.material as THREE.MeshBasicMaterial;
      material.opacity = ENTANGLEMENT.WAVE_ALPHA * (1 - progress * 0.5);

      // Grow slightly as it travels
      const scale = 1 + easedProgress * 0.5;
      particle.mesh.scale.set(scale, scale, 1);
    }

    // Remove completed particles (in reverse order)
    for (let i = completedParticles.length - 1; i >= 0; i--) {
      const index = completedParticles[i]!;
      const particle = this.waveParticles[index]!;

      this.group.remove(particle.mesh);
      (particle.mesh.material as THREE.MeshBasicMaterial).dispose();

      this.waveParticles.splice(index, 1);
    }
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
    this.waveMaterial.dispose();
    this.waveGeometry.dispose();

    // Clean up any remaining wave particles
    for (const particle of this.waveParticles) {
      (particle.mesh.material as THREE.MeshBasicMaterial).dispose();
    }
  }
}
