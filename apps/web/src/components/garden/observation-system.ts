/**
 * Observation System - Core observation logic for Quantum Garden
 *
 * Implements the designed three-condition alignment system:
 * 1. Plant inside invisible observation region
 * 2. Reticle overlaps that region
 * 3. Reticle overlaps any part of plant
 *
 * When all three conditions align → observation triggers immediately (no dwell time).
 *
 * Design Philosophy:
 * "Observation is not something the viewer does. It is something that
 * occasionally happens in their presence."
 */

import type {
  Plant,
  Position,
  ObservationPayload,
  ObservationRegion,
} from "@quantum-garden/shared";
import { CANVAS } from "@quantum-garden/shared";
import { useGardenStore } from "@/stores/garden-store";

interface Vector2 {
  x: number;
  y: number;
}

/**
 * Configuration for the observation system.
 */
interface ObservationSystemConfig {
  /** Radius of observation regions (pixels) */
  regionRadius?: number;
  /** Lifetime of each region (seconds) */
  regionLifetime?: number;
  /** Cooldown period after observation (seconds) */
  cooldownDuration?: number;
  /** Plant size for overlap detection (pixels) */
  plantSize?: number;
}

const DEFAULT_CONFIG: Required<ObservationSystemConfig> = {
  regionRadius: 135, // 120-150 pixels
  regionLifetime: 75, // 60-90 seconds
  cooldownDuration: 17.5, // 15-20 seconds
  plantSize: 64, // 64x64 pixel plants
};

/**
 * ObservationSystem manages region-based observation logic.
 *
 * Handles region lifecycle, alignment detection, and observation triggering.
 */
export class ObservationSystem {
  private plants: Plant[];
  private getReticlePosition: () => Vector2;
  private onObservation: (payload: ObservationPayload) => void;
  private config: Required<ObservationSystemConfig>;

  // Region state
  private activeRegion: ObservationRegion | null = null;
  private regionTimer: number = 0;

  // Cooldown state
  private cooldownTimer: number = 0;

  // Debug mode
  private debugMode: boolean = false;

  // Observation tracking (prevent double-observations within same frame)
  private lastObservedPlantId: string | null = null;

  constructor(
    plants: Plant[],
    getReticlePosition: () => Vector2,
    onObservation: (payload: ObservationPayload) => void,
    config: ObservationSystemConfig = {}
  ) {
    this.plants = plants;
    this.getReticlePosition = getReticlePosition;
    this.onObservation = onObservation;
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize with first region
    this.createNewRegion();
  }

  /**
   * Update the observation system each frame.
   */
  update(deltaTime: number): void {
    // In debug mode, skip region-based observation
    if (this.debugMode) {
      return;
    }

    // Update cooldown timer
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= deltaTime;
      if (this.cooldownTimer <= 0) {
        useGardenStore.getState().setIsInCooldown(false);
      }
    }

    // Update region timer
    this.regionTimer -= deltaTime;

    // Check if region expired
    if (this.regionTimer <= 0 && this.activeRegion) {
      this.createNewRegion();
    }

    // Skip observation checks during cooldown
    if (this.cooldownTimer > 0) {
      return;
    }

    // Check for alignment and trigger observation
    this.checkForObservation();
  }

  /**
   * Check if alignment conditions are met and trigger observation.
   */
  private checkForObservation(): void {
    if (!this.activeRegion) return;

    const reticlePos = this.getReticlePosition();

    // Check if reticle is within region
    if (!this.isPointInCircle(reticlePos, this.activeRegion.center, this.activeRegion.radius)) {
      return;
    }

    // Find eligible plant (unobserved, fully contained in region, overlapping reticle)
    const eligiblePlant = this.findEligiblePlant(reticlePos);

    if (eligiblePlant) {
      this.triggerObservation(eligiblePlant);
    }
  }

  /**
   * Find an eligible plant for observation.
   *
   * Eligibility criteria:
   * - Plant is unobserved
   * - Plant's full bounding box is within active region
   * - Reticle overlaps any part of the plant
   */
  private findEligiblePlant(reticlePos: Vector2): Plant | null {
    if (!this.activeRegion) return null;

    const halfPlantSize = this.config.plantSize / 2;

    for (const plant of this.plants) {
      // Skip observed plants
      if (plant.observed) continue;

      // Skip if this plant was just observed (prevent double-observation)
      if (plant.id === this.lastObservedPlantId) continue;

      // Check if plant's full bounding box is within region
      const plantBounds = {
        x: plant.position.x - halfPlantSize,
        y: plant.position.y - halfPlantSize,
        width: this.config.plantSize,
        height: this.config.plantSize,
      };

      if (
        !this.isBoundingBoxInCircle(plantBounds, this.activeRegion.center, this.activeRegion.radius)
      ) {
        continue;
      }

      // Check if reticle overlaps plant
      if (this.isPointInBoundingBox(reticlePos, plantBounds)) {
        return plant;
      }
    }

    return null;
  }

  /**
   * Trigger observation for a plant.
   */
  private triggerObservation(plant: Plant): void {
    // Create observation payload
    const payload: ObservationPayload = {
      plantId: plant.id,
      regionId: this.activeRegion!.id,
      reticleId: "system-reticle",
      timestamp: new Date(),
    };

    // Track last observed plant
    this.lastObservedPlantId = plant.id;

    // Start cooldown
    this.cooldownTimer = this.config.cooldownDuration;
    useGardenStore.getState().setIsInCooldown(true);

    // Deactivate current region and create new one
    this.createNewRegion();

    // Trigger observation callback
    this.onObservation(payload);
  }

  /**
   * Create a new observation region at a random location.
   */
  private createNewRegion(): void {
    // Random position within canvas bounds
    const margin = this.config.regionRadius;
    const center: Position = {
      x: margin + Math.random() * (CANVAS.DEFAULT_WIDTH - 2 * margin),
      y: margin + Math.random() * (CANVAS.DEFAULT_HEIGHT - 2 * margin),
    };

    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.regionLifetime * 1000);

    this.activeRegion = {
      id: `region-${Date.now()}`,
      center,
      radius: this.config.regionRadius,
      active: true,
      lifetime: this.config.regionLifetime,
      createdAt: now,
      expiresAt,
    };

    this.regionTimer = this.config.regionLifetime;

    // Sync to store
    useGardenStore.getState().setActiveRegion(this.activeRegion);
  }

  /**
   * Check if a point is within a circle.
   */
  private isPointInCircle(point: Vector2, center: Position, radius: number): boolean {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return dx * dx + dy * dy <= radius * radius;
  }

  /**
   * Check if a bounding box is fully contained within a circle.
   */
  private isBoundingBoxInCircle(
    box: { x: number; y: number; width: number; height: number },
    center: Position,
    radius: number
  ): boolean {
    // Check all four corners
    const corners = [
      { x: box.x, y: box.y }, // top-left
      { x: box.x + box.width, y: box.y }, // top-right
      { x: box.x, y: box.y + box.height }, // bottom-left
      { x: box.x + box.width, y: box.y + box.height }, // bottom-right
    ];

    return corners.every((corner) => this.isPointInCircle(corner, center, radius));
  }

  /**
   * Check if a point is within a bounding box.
   */
  private isPointInBoundingBox(
    point: Vector2,
    box: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      point.x >= box.x &&
      point.x <= box.x + box.width &&
      point.y >= box.y &&
      point.y <= box.y + box.height
    );
  }

  /**
   * Update the list of plants.
   */
  updatePlants(plants: Plant[]): void {
    this.plants = plants;
  }

  /**
   * Get the active observation region.
   */
  getActiveRegion(): ObservationRegion | null {
    return this.activeRegion;
  }

  /**
   * Check if system is in cooldown.
   */
  isInCooldown(): boolean {
    return this.cooldownTimer > 0;
  }

  /**
   * Set debug mode.
   * When enabled, region-based observation is disabled (click observation takes over).
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Get current debug mode state.
   */
  getDebugMode(): boolean {
    return this.debugMode;
  }

  /**
   * Clean up resources.
   */
  dispose(): void {
    this.activeRegion = null;
    useGardenStore.getState().setActiveRegion(null);
  }
}
