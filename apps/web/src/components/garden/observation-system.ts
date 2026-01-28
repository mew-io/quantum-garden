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
import { SpatialGrid } from "./spatial-grid";

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
  /** Enable dwell-time observation mode (requires holding cursor on plant) */
  enableDwellMode?: boolean;
  /** Time required to observe a plant in dwell mode (seconds) */
  dwellDuration?: number;
}

const DEFAULT_CONFIG: Required<ObservationSystemConfig> = {
  regionRadius: 135, // 120-150 pixels
  regionLifetime: 75, // 60-90 seconds
  cooldownDuration: 17.5, // 15-20 seconds
  plantSize: 64, // 64x64 pixel plants
  enableDwellMode: false, // Immediate observation by default
  dwellDuration: 1.5, // 1.5 seconds when dwell mode is enabled
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

  // Dwell-time observation state
  private dwellTarget: string | null = null; // Plant ID being dwelled on
  private dwellTimer: number = 0; // Accumulated dwell time

  // Spatial indexing for O(1) plant lookups
  // Cell size matches region radius for optimal query performance
  private spatialGrid: SpatialGrid;

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

    // Initialize spatial grid with cell size matching region radius
    this.spatialGrid = new SpatialGrid(this.config.regionRadius);
    this.spatialGrid.rebuild(plants);

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
      // Reset dwell when entering cooldown
      this.resetDwellState();
      return;
    }

    // Check for alignment and trigger observation
    this.checkForObservation(deltaTime);
  }

  /**
   * Check if alignment conditions are met and trigger observation.
   * In dwell mode, requires cursor to stay on plant for dwellDuration.
   * In immediate mode, triggers as soon as alignment conditions are met.
   */
  private checkForObservation(deltaTime: number = 0): void {
    if (!this.activeRegion) return;

    const reticlePos = this.getReticlePosition();

    // Check if reticle is within region
    if (!this.isPointInCircle(reticlePos, this.activeRegion.center, this.activeRegion.radius)) {
      // Reset dwell if cursor leaves region
      this.resetDwellState();
      return;
    }

    // Find eligible plant (unobserved, fully contained in region, overlapping reticle)
    const eligiblePlant = this.findEligiblePlant(reticlePos);

    if (!eligiblePlant) {
      // No eligible plant under cursor - reset dwell
      this.resetDwellState();
      return;
    }

    // In dwell mode, track time on plant before observing
    if (this.config.enableDwellMode) {
      this.handleDwellObservation(eligiblePlant, deltaTime);
    } else {
      // Immediate mode - trigger observation right away
      this.triggerObservation(eligiblePlant);
    }
  }

  /**
   * Handle dwell-time observation mode.
   * Accumulates time on a plant and triggers observation when dwell completes.
   */
  private handleDwellObservation(plant: Plant, deltaTime: number): void {
    // Check if we're dwelling on a new plant
    if (this.dwellTarget !== plant.id) {
      // Reset and start new dwell
      this.dwellTarget = plant.id;
      this.dwellTimer = 0;
      useGardenStore.getState().setDwellTarget(plant.id);
      useGardenStore.getState().setDwellProgress(0);
    }

    // Accumulate dwell time
    this.dwellTimer += deltaTime;

    // Calculate and sync progress (0-1)
    const progress = Math.min(1, this.dwellTimer / this.config.dwellDuration);
    useGardenStore.getState().setDwellProgress(progress);

    // Trigger observation when dwell completes
    if (this.dwellTimer >= this.config.dwellDuration) {
      this.triggerObservation(plant);
      this.resetDwellState();
    }
  }

  /**
   * Reset dwell state when cursor moves off plant or observation completes.
   */
  private resetDwellState(): void {
    if (this.dwellTarget !== null || this.dwellTimer > 0) {
      this.dwellTarget = null;
      this.dwellTimer = 0;
      useGardenStore.getState().resetDwell();
    }
  }

  /**
   * Find an eligible plant for observation.
   *
   * Uses spatial grid for O(1) average-case lookups instead of O(n) iteration.
   *
   * Eligibility criteria:
   * - Plant is unobserved
   * - Plant's full bounding box is within active region
   * - Reticle overlaps any part of the plant
   */
  private findEligiblePlant(reticlePos: Vector2): Plant | null {
    if (!this.activeRegion) return null;

    const halfPlantSize = this.config.plantSize / 2;

    // Use spatial grid to get only nearby plants (O(1) instead of O(n))
    const nearbyPlants = this.spatialGrid.getPlantsInRegion(
      this.activeRegion.center,
      this.activeRegion.radius
    );

    for (const plant of nearbyPlants) {
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
   * Rebuilds spatial index for efficient lookups.
   */
  updatePlants(plants: Plant[]): void {
    this.plants = plants;
    this.spatialGrid.rebuild(plants);
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
   * Enable or disable dwell-time observation mode.
   * When enabled, cursor must stay on plant for dwellDuration to observe.
   * When disabled, observation triggers immediately on alignment.
   */
  setDwellMode(enabled: boolean): void {
    this.config.enableDwellMode = enabled;
    // Reset any active dwell when mode changes
    this.resetDwellState();
  }

  /**
   * Get current dwell mode state.
   */
  getDwellMode(): boolean {
    return this.config.enableDwellMode;
  }

  /**
   * Set the dwell duration (time required to observe in dwell mode).
   * @param duration Time in seconds
   */
  setDwellDuration(duration: number): void {
    this.config.dwellDuration = duration;
  }

  /**
   * Get current dwell duration.
   */
  getDwellDuration(): number {
    return this.config.dwellDuration;
  }

  /**
   * Get current dwell state (for external progress display).
   */
  getDwellState(): { target: string | null; progress: number } {
    return {
      target: this.dwellTarget,
      progress: this.config.dwellDuration > 0 ? this.dwellTimer / this.config.dwellDuration : 0,
    };
  }

  /**
   * Clean up resources.
   */
  dispose(): void {
    this.activeRegion = null;
    this.resetDwellState();
    useGardenStore.getState().setActiveRegion(null);
  }
}
