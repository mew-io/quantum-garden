/**
 * Debug Overlay - Plant marker visualization for debugging
 *
 * Shows plant bounding boxes and position markers for debugging visibility issues.
 * This overlay is only visible during development and can be completely removed for production.
 */

import * as THREE from "three";
import type { Plant } from "@quantum-garden/shared";
import { PATTERN_SIZE } from "@quantum-garden/shared";

/**
 * Renders debug visualizations for plants.
 */
export class DebugOverlay {
  private group: THREE.Group;
  private isVisible: boolean = false;

  // Plant debug visualization
  private plantMarkersGroup: THREE.Group;
  private plantMarkers: Map<string, THREE.Object3D> = new Map();
  private plants: Plant[] = [];
  private selectedPlantId: string | null = null;

  // Pulse animation for selected plant
  private selectedMarkerComponents: {
    box: THREE.Line | null;
    dot: THREE.Mesh | null;
    crosshair: THREE.LineSegments | null;
  } = { box: null, dot: null, crosshair: null };

  // Locate pulse animation
  private locatePulse: { active: boolean; startTime: number } = {
    active: false,
    startTime: 0,
  };
  private temporarilyVisible: boolean = false;
  private static readonly LOCATE_PULSE_DURATION = 1.5; // seconds

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "debug-overlay";

    this.plantMarkersGroup = new THREE.Group();
    this.plantMarkersGroup.name = "plant-markers";
    this.group.add(this.plantMarkersGroup);
  }

  /**
   * Set plants for debug visualization.
   */
  setPlants(plants: Plant[]): void {
    this.plants = plants;

    if (this.isVisible) {
      this.updatePlantMarkers();
    }
  }

  /**
   * Set the selected plant ID for highlighting.
   */
  setSelectedPlant(plantId: string | null): void {
    if (this.selectedPlantId !== plantId) {
      this.selectedPlantId = plantId;
      if (this.isVisible) {
        this.updatePlantMarkers();
      }
    }
  }

  /**
   * Trigger a brief locate pulse animation on the selected plant.
   */
  triggerLocatePulse(): void {
    this.locatePulse = { active: true, startTime: -1 };
    // Temporarily show the overlay if not already visible
    if (!this.isVisible) {
      this.temporarilyVisible = true;
      this.setVisible(true);
    }
  }

  /**
   * Get the selected plant ID.
   */
  getSelectedPlant(): string | null {
    return this.selectedPlantId;
  }

  /**
   * Update plant markers to show bounding boxes and position dots.
   */
  private updatePlantMarkers(): void {
    // Clear existing markers
    this.plantMarkers.forEach((marker) => {
      this.plantMarkersGroup.remove(marker);
      marker.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.plantMarkers.clear();

    // Clear selected marker references
    this.selectedMarkerComponents = { box: null, dot: null, crosshair: null };

    if (!this.isVisible) return;

    // Create markers for each plant
    for (const plant of this.plants) {
      const markerGroup = new THREE.Group();
      markerGroup.name = `plant-marker-${plant.id.slice(0, 8)}`;

      const isSelected = plant.id === this.selectedPlantId;

      // Determine color based on plant state
      let color: number;
      if (isSelected) {
        color = 0xff00ff; // Bright magenta for selected
      } else if (plant.observed) {
        color = 0xfbbf24; // Yellow for observed
      } else if (plant.germinatedAt) {
        color = 0x22c55e; // Green for germinated
      } else {
        color = 0x3b82f6; // Blue for dormant/superposed
      }

      // Create bounding box using actual PATTERN_SIZE
      const size = PATTERN_SIZE;
      const boxGeometry = new THREE.BufferGeometry();
      const halfSize = size / 2;
      const vertices = new Float32Array([
        -halfSize,
        -halfSize,
        0,
        halfSize,
        -halfSize,
        0,
        halfSize,
        halfSize,
        0,
        -halfSize,
        halfSize,
        0,
        -halfSize,
        -halfSize,
        0,
      ]);
      boxGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

      const boxMaterial = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: isSelected ? 1.0 : 0.5,
        linewidth: isSelected ? 3 : 1,
      });

      const box = new THREE.Line(boxGeometry, boxMaterial);
      box.position.set(plant.position.x, plant.position.y, 3);
      markerGroup.add(box);

      // Create center dot (larger for selected)
      const dotRadius = isSelected ? 6 : 4;
      const dotGeometry = new THREE.CircleGeometry(dotRadius, 16);
      const dotMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.9,
      });

      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.set(plant.position.x, plant.position.y, 3.1);
      markerGroup.add(dot);

      // Create crosshair for better visibility (larger for selected)
      const crosshairSize = isSelected ? 16 : 8;
      const crosshairGeometry = new THREE.BufferGeometry();
      const crosshairVerts = new Float32Array([
        -crosshairSize,
        0,
        0,
        crosshairSize,
        0,
        0,
        0,
        -crosshairSize,
        0,
        0,
        crosshairSize,
        0,
      ]);
      crosshairGeometry.setAttribute("position", new THREE.BufferAttribute(crosshairVerts, 3));

      const crosshairMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: isSelected ? 1.0 : 0.6,
      });

      const crosshair = new THREE.LineSegments(crosshairGeometry, crosshairMaterial);
      crosshair.position.set(plant.position.x, plant.position.y, 3.2);
      markerGroup.add(crosshair);

      this.plantMarkersGroup.add(markerGroup);
      this.plantMarkers.set(plant.id, markerGroup);

      // Store references to selected plant's components for animation
      if (isSelected) {
        this.selectedMarkerComponents = { box, dot, crosshair };
      }
    }
  }

  /**
   * Set visibility of debug overlay.
   */
  setVisible(visible: boolean): void {
    this.isVisible = visible;

    if (visible) {
      this.updatePlantMarkers();
    } else {
      this.updatePlantMarkers();
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
   * Animates the selected plant marker with a gentle pulse effect.
   */
  update(time: number, _deltaTime: number): void {
    if (this.selectedPlantId && this.isVisible) {
      const { box, dot, crosshair } = this.selectedMarkerComponents;

      // Initialize locate pulse start time on first frame
      if (this.locatePulse.active && this.locatePulse.startTime < 0) {
        this.locatePulse.startTime = time;
      }

      let scalePulse: number;
      let opacityPulse: number;

      if (this.locatePulse.active) {
        const elapsed = time - this.locatePulse.startTime;
        const progress = Math.min(elapsed / DebugOverlay.LOCATE_PULSE_DURATION, 1);

        if (progress >= 1) {
          this.locatePulse.active = false;
          // Hide overlay if it was only shown temporarily for the pulse
          if (this.temporarilyVisible) {
            this.temporarilyVisible = false;
            this.setVisible(false);
            return;
          }
          scalePulse = 1.0;
          opacityPulse = 1.0;
        } else {
          const decay = 1 - progress;
          const phase = (elapsed * 2 * Math.PI * 4) % (Math.PI * 2);
          scalePulse = 1.0 + Math.sin(phase) * 0.4 * decay;
          opacityPulse = 0.6 + Math.sin(phase) * 0.4 * decay;
        }
      } else {
        const pulsePhase = (time * 2 * Math.PI * 2) % (Math.PI * 2);
        scalePulse = 1.0 + Math.sin(pulsePhase) * 0.15;
        opacityPulse = 0.85 + Math.sin(pulsePhase) * 0.15;
      }

      if (box) {
        box.scale.set(scalePulse, scalePulse, 1);
        (box.material as THREE.LineBasicMaterial).opacity = opacityPulse;
      }

      if (dot) {
        dot.scale.set(scalePulse, scalePulse, 1);
        (dot.material as THREE.MeshBasicMaterial).opacity = opacityPulse;
      }

      if (crosshair) {
        crosshair.scale.set(scalePulse, scalePulse, 1);
        (crosshair.material as THREE.LineBasicMaterial).opacity = opacityPulse;
      }
    }
  }

  /**
   * Check if there are any active animations that need updating.
   */
  hasActiveAnimations(): boolean {
    return this.isVisible || this.locatePulse.active;
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
    this.plantMarkers.forEach((marker) => {
      marker.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.plantMarkers.clear();
  }
}
