/**
 * ObservationSystem - Manages observation mechanics in the garden
 *
 * Observation occurs when three conditions align over time:
 * 1. A plant exists inside an invisible observation region
 * 2. The system reticle overlaps that region
 * 3. Both remain aligned for the required dwell duration
 *
 * See docs/observation-system.md for full specification.
 */

import { Ticker } from "pixi.js";
import type { Application } from "pixi.js";
import type {
  Plant,
  ObservationRegion,
  Position,
  BoundingBox,
  ObservationPayload,
} from "@quantum-garden/shared";
import { OBSERVATION_REGION, DWELL, COOLDOWN, GLYPH } from "@quantum-garden/shared";
import { useGardenStore } from "@/stores/garden-store";

/** Size of plant glyph for bounding box calculation */
const PLANT_SIZE = GLYPH.MAX_SIZE;

/**
 * Manages observation regions, dwell tracking, and observation events.
 */
export class ObservationSystem {
  private app: Application;
  private ticker: Ticker;
  private isRunning: boolean;

  // Region state
  private activeRegion: ObservationRegion | null;
  private regionTimer: number; // Seconds remaining in region lifetime

  // Dwell tracking
  private dwellTarget: string | null; // Plant ID being dwelled on
  private dwellTime: number; // Accumulated dwell time in seconds
  private readonly dwellDuration: number; // Required dwell duration

  // Cooldown state
  private isInCooldown: boolean;
  private cooldownTimer: number;
  private readonly cooldownDuration: number;

  // Observation callback
  private onObservation: ((payload: ObservationPayload) => void) | null;

  constructor(app: Application) {
    this.app = app;
    this.ticker = new Ticker();
    this.isRunning = false;

    // Initialize region state
    this.activeRegion = null;
    this.regionTimer = 0;

    // Initialize dwell state
    this.dwellTarget = null;
    this.dwellTime = 0;
    this.dwellDuration = DWELL.DEFAULT_DURATION;

    // Initialize cooldown state
    this.isInCooldown = false;
    this.cooldownTimer = 0;
    this.cooldownDuration = COOLDOWN.DEFAULT;

    // No callback initially
    this.onObservation = null;
  }

  /**
   * Set callback for observation events.
   */
  setObservationCallback(callback: (payload: ObservationPayload) => void): void {
    this.onObservation = callback;
  }

  /**
   * Start the observation system.
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Create initial observation region
    this.createNewRegion();

    // Start update loop
    this.ticker.add(this.update, this);
    this.ticker.start();
  }

  /**
   * Stop the observation system.
   */
  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    this.ticker.stop();
    this.ticker.remove(this.update, this);
  }

  /**
   * Clean up resources.
   */
  destroy(): void {
    this.stop();
    this.ticker.destroy();
  }

  /**
   * Update loop called each frame.
   */
  private update = (ticker: Ticker): void => {
    const deltaSeconds = ticker.deltaMS / 1000;

    // Update cooldown timer
    if (this.isInCooldown) {
      this.cooldownTimer -= deltaSeconds;
      if (this.cooldownTimer <= 0) {
        this.isInCooldown = false;
        this.cooldownTimer = 0;
        this.syncCooldownToStore(false);
      }
    }

    // Update region lifetime
    if (this.activeRegion) {
      this.regionTimer -= deltaSeconds;
      if (this.regionTimer <= 0) {
        this.relocateRegion();
      }
    }

    // Skip alignment check during cooldown
    if (this.isInCooldown) {
      return;
    }

    // Check for eligible plant
    const eligiblePlant = this.findEligiblePlant();

    if (eligiblePlant) {
      // Accumulate dwell time
      if (this.dwellTarget === eligiblePlant.id) {
        this.dwellTime += deltaSeconds;
        this.syncDwellToStore(eligiblePlant.id, this.dwellTime / this.dwellDuration);

        // Check if observation threshold reached
        if (this.dwellTime >= this.dwellDuration) {
          this.triggerObservation(eligiblePlant);
        }
      } else {
        // New target, reset dwell
        this.dwellTarget = eligiblePlant.id;
        this.dwellTime = deltaSeconds;
        this.syncDwellToStore(eligiblePlant.id, this.dwellTime / this.dwellDuration);
      }
    } else {
      // No eligible plant, reset dwell
      if (this.dwellTarget !== null) {
        this.resetDwell();
      }
    }
  };

  /**
   * Find a plant eligible for observation.
   *
   * Eligibility requires:
   * - Plant is unobserved
   * - Entire plant bounding box is within active region
   * - Reticle overlaps any portion of plant
   * - Reticle overlaps active region
   */
  private findEligiblePlant(): Plant | null {
    const store = useGardenStore.getState();
    const { plants, reticle } = store;

    // Must have reticle and active region
    if (!reticle || !this.activeRegion) {
      return null;
    }

    // Check if reticle overlaps region
    if (
      !this.isPointInCircle(reticle.position, this.activeRegion.center, this.activeRegion.radius)
    ) {
      return null;
    }

    const reticleBounds = this.getReticleBounds(reticle.position, reticle.size);

    // Find first unobserved plant meeting all conditions
    for (const plant of plants) {
      // Skip observed plants
      if (plant.observed) {
        continue;
      }

      const plantBounds = this.getPlantBounds(plant.position);

      // Check if entire plant is within region
      if (!this.isBoxInCircle(plantBounds, this.activeRegion.center, this.activeRegion.radius)) {
        continue;
      }

      // Check if reticle overlaps plant
      if (!this.boxesOverlap(reticleBounds, plantBounds)) {
        continue;
      }

      // This plant is eligible
      return plant;
    }

    return null;
  }

  /**
   * Trigger an observation event.
   */
  private triggerObservation(plant: Plant): void {
    if (!this.activeRegion) return;

    const store = useGardenStore.getState();
    const { reticle } = store;
    if (!reticle) return;

    const payload: ObservationPayload = {
      plantId: plant.id,
      regionId: this.activeRegion.id,
      reticleId: reticle.id,
      timestamp: new Date(),
    };

    // Invoke callback if set
    if (this.onObservation) {
      this.onObservation(payload);
    }

    // Reset dwell
    this.resetDwell();

    // Start cooldown
    this.isInCooldown = true;
    this.cooldownTimer = this.cooldownDuration;
    this.syncCooldownToStore(true);

    // Relocate region after observation
    this.relocateRegion();
  }

  /**
   * Create a new observation region.
   */
  private createNewRegion(): void {
    const { width, height } = this.app.screen;

    // Random position within screen bounds (with margin)
    const margin = OBSERVATION_REGION.MAX_RADIUS;
    const x = margin + Math.random() * (width - 2 * margin);
    const y = margin + Math.random() * (height - 2 * margin);

    // Random radius within range
    const radius =
      OBSERVATION_REGION.MIN_RADIUS +
      Math.random() * (OBSERVATION_REGION.MAX_RADIUS - OBSERVATION_REGION.MIN_RADIUS);

    // Random lifetime within range
    const lifetime =
      OBSERVATION_REGION.MIN_LIFETIME +
      Math.random() * (OBSERVATION_REGION.MAX_LIFETIME - OBSERVATION_REGION.MIN_LIFETIME);

    const now = new Date();

    this.activeRegion = {
      id: `region-${Date.now()}`,
      center: { x, y },
      radius,
      active: true,
      lifetime,
      createdAt: now,
      expiresAt: new Date(now.getTime() + lifetime * 1000),
    };

    this.regionTimer = lifetime;

    // Sync to store
    this.syncRegionToStore();
  }

  /**
   * Relocate the observation region to a new position.
   */
  private relocateRegion(): void {
    this.activeRegion = null;
    this.createNewRegion();
  }

  /**
   * Reset dwell tracking.
   */
  private resetDwell(): void {
    this.dwellTarget = null;
    this.dwellTime = 0;
    useGardenStore.getState().resetDwell();
  }

  /**
   * Sync region state to Zustand store.
   */
  private syncRegionToStore(): void {
    useGardenStore.getState().setActiveRegion(this.activeRegion);
  }

  /**
   * Sync dwell state to Zustand store.
   */
  private syncDwellToStore(plantId: string, progress: number): void {
    const store = useGardenStore.getState();
    store.setDwellTarget(plantId);
    store.setDwellProgress(Math.min(1, progress));
  }

  /**
   * Sync cooldown state to Zustand store.
   */
  private syncCooldownToStore(inCooldown: boolean): void {
    useGardenStore.getState().setIsInCooldown(inCooldown);
  }

  // --- Geometry helpers ---

  /**
   * Check if a point is inside a circle.
   */
  private isPointInCircle(point: Position, center: Position, radius: number): boolean {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return dx * dx + dy * dy <= radius * radius;
  }

  /**
   * Check if a bounding box is entirely contained within a circle.
   */
  private isBoxInCircle(box: BoundingBox, center: Position, radius: number): boolean {
    // Check all four corners of the box
    const corners = [
      { x: box.x, y: box.y }, // top-left
      { x: box.x + box.width, y: box.y }, // top-right
      { x: box.x, y: box.y + box.height }, // bottom-left
      { x: box.x + box.width, y: box.y + box.height }, // bottom-right
    ];

    return corners.every((corner) => this.isPointInCircle(corner, center, radius));
  }

  /**
   * Check if two bounding boxes overlap.
   */
  private boxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
    return (
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    );
  }

  /**
   * Get the bounding box for a plant at a given position.
   */
  private getPlantBounds(position: Position): BoundingBox {
    const halfSize = PLANT_SIZE / 2;
    return {
      x: position.x - halfSize,
      y: position.y - halfSize,
      width: PLANT_SIZE,
      height: PLANT_SIZE,
    };
  }

  /**
   * Get the bounding box for the reticle.
   */
  private getReticleBounds(position: Position, size: number): BoundingBox {
    const halfSize = size / 2;
    return {
      x: position.x - halfSize,
      y: position.y - halfSize,
      width: size,
      height: size,
    };
  }

  /**
   * Get the current active region (for debugging/testing).
   */
  getActiveRegion(): ObservationRegion | null {
    return this.activeRegion;
  }

  /**
   * Get current dwell state (for debugging/testing).
   */
  getDwellState(): { target: string | null; time: number; duration: number } {
    return {
      target: this.dwellTarget,
      time: this.dwellTime,
      duration: this.dwellDuration,
    };
  }
}

/**
 * Factory function to create an ObservationSystem.
 */
export function createObservationSystem(app: Application): ObservationSystem {
  return new ObservationSystem(app);
}
