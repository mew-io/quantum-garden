/**
 * Debug Overlay - Visualization for observation system debugging
 *
 * Renders observation regions as visible circles when debug mode is enabled.
 * Also shows plant bounding boxes and position markers for debugging visibility issues.
 * This overlay is only visible during development and can be completely removed for production.
 */

import * as THREE from "three";
import type { ObservationRegion, Plant } from "@quantum-garden/shared";
import { PATTERN_SIZE } from "@quantum-garden/shared";

/**
 * Renders debug visualizations for the observation system.
 */
export class DebugOverlay {
  private group: THREE.Group;
  private regionCircle: THREE.LineLoop | null = null;
  private regionCenterDot: THREE.Mesh | null = null;
  private activeRegion: ObservationRegion | null = null;
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

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "debug-overlay";

    this.plantMarkersGroup = new THREE.Group();
    this.plantMarkersGroup.name = "plant-markers";
    this.group.add(this.plantMarkersGroup);
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

      // Determine color based on plant state (or white if selected)
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
      box.position.set(plant.position.x, plant.position.y, 3); // z = 3 for debug layer
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
        color: isSelected ? 0xffffff : 0xffffff,
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
      // Show existing region
      if (this.activeRegion) {
        this.createRegionVisualization(this.activeRegion);
      }
      // Show plant markers
      this.updatePlantMarkers();
    } else {
      // Hide region
      this.setActiveRegion(null);
      // Clear plant markers
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
    // Animate selected plant marker with pulse effect
    if (this.selectedPlantId && this.isVisible) {
      const { box, dot, crosshair } = this.selectedMarkerComponents;

      // Pulse frequency: 2 Hz (2 cycles per second)
      const pulsePhase = (time * 2 * Math.PI * 2) % (Math.PI * 2);

      // Scale pulse: oscillates between 1.0 and 1.15
      const scalePulse = 1.0 + Math.sin(pulsePhase) * 0.15;

      // Opacity pulse: oscillates between 0.7 and 1.0
      const opacityPulse = 0.85 + Math.sin(pulsePhase) * 0.15;

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
   * Returns true when visible (for region updates) or when animating selected plant.
   */
  hasActiveAnimations(): boolean {
    // Always need updates when visible (selected plant pulse animation)
    return this.isVisible;
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

    // Clean up plant markers
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
