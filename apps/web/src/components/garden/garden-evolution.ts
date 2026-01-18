/**
 * GardenEvolutionSystem - Manages time-based garden progression
 *
 * Handles automatic evolution of the garden over time:
 * - Dormant plants gradually germinate
 * - Creates a sense of slow, natural progression
 *
 * The garden evolves at a contemplative pace, with changes
 * happening slowly over minutes, not seconds.
 */

import { useGardenStore } from "@/stores/garden-store";

/** Evolution timing constants (in milliseconds) */
const EVOLUTION = {
  /** How often to check for evolution opportunities */
  CHECK_INTERVAL: 30_000, // 30 seconds

  /** Minimum time before a dormant plant can germinate */
  MIN_DORMANCY: 60_000, // 1 minute

  /** Probability of germination per check (0-1) */
  GERMINATION_CHANCE: 0.15, // 15% chance per dormant plant per check

  /** Maximum plants that can germinate in a single check */
  MAX_GERMINATIONS_PER_CHECK: 1,
};

type GerminationCallback = (plantId: string) => Promise<void>;

/**
 * Manages the slow evolution of the garden over time.
 *
 * This system creates a contemplative experience where
 * the garden changes gradually without user interaction.
 */
export class GardenEvolutionSystem {
  private intervalId: ReturnType<typeof setInterval> | null;
  private isRunning: boolean;
  private onGerminate: GerminationCallback | null;
  private plantAges: Map<string, number>; // plantId -> timestamp when first seen dormant

  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.onGerminate = null;
    this.plantAges = new Map();
  }

  /**
   * Set the callback for germination events.
   * Called when a dormant plant should germinate.
   */
  setGerminationCallback(callback: GerminationCallback): void {
    this.onGerminate = callback;
  }

  /**
   * Start the evolution system.
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Initialize tracking of dormant plants
    this.initializePlantTracking();

    // Start periodic evolution checks
    this.intervalId = setInterval(() => {
      this.checkEvolution();
    }, EVOLUTION.CHECK_INTERVAL);
  }

  /**
   * Stop the evolution system.
   */
  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Clean up resources.
   */
  destroy(): void {
    this.stop();
    this.plantAges.clear();
  }

  /**
   * Initialize tracking of dormant plants.
   */
  private initializePlantTracking(): void {
    const { plants } = useGardenStore.getState();
    const now = Date.now();

    for (const plant of plants) {
      if (!plant.germinatedAt && !this.plantAges.has(plant.id)) {
        this.plantAges.set(plant.id, now);
      }
    }
  }

  /**
   * Check for evolution opportunities and trigger them.
   */
  private async checkEvolution(): Promise<void> {
    if (!this.isRunning || !this.onGerminate) return;

    const { plants } = useGardenStore.getState();
    const now = Date.now();

    // Update tracking for any new dormant plants
    for (const plant of plants) {
      if (!plant.germinatedAt && !this.plantAges.has(plant.id)) {
        this.plantAges.set(plant.id, now);
      }
    }

    // Find dormant plants eligible for germination
    const eligiblePlants = plants.filter((plant) => {
      if (plant.germinatedAt) return false; // Already germinated
      if (plant.observed) return false; // Already observed (shouldn't happen, but safety check)

      const dormantSince = this.plantAges.get(plant.id);
      if (!dormantSince) return false;

      // Must have been dormant for minimum time
      return now - dormantSince >= EVOLUTION.MIN_DORMANCY;
    });

    if (eligiblePlants.length === 0) return;

    // Randomly select plants to germinate
    let germinationsThisCheck = 0;

    for (const plant of eligiblePlants) {
      if (germinationsThisCheck >= EVOLUTION.MAX_GERMINATIONS_PER_CHECK) break;

      if (Math.random() < EVOLUTION.GERMINATION_CHANCE) {
        try {
          await this.onGerminate(plant.id);
          this.plantAges.delete(plant.id); // No longer tracking
          germinationsThisCheck++;

          // Log for debugging (will be visible in browser console)
          console.log(`[Evolution] Plant ${plant.id.slice(-6)} germinated`);
        } catch (error) {
          console.error(`[Evolution] Failed to germinate plant ${plant.id}:`, error);
        }
      }
    }
  }

  /**
   * Manually trigger evolution check (for testing).
   */
  async triggerCheck(): Promise<void> {
    await this.checkEvolution();
  }

  /**
   * Get current evolution stats (for debugging).
   */
  getStats(): { dormantCount: number; trackedCount: number } {
    const { plants } = useGardenStore.getState();
    const dormantCount = plants.filter((p) => !p.germinatedAt).length;
    return {
      dormantCount,
      trackedCount: this.plantAges.size,
    };
  }
}

/**
 * Factory function to create a GardenEvolutionSystem.
 */
export function createGardenEvolutionSystem(): GardenEvolutionSystem {
  return new GardenEvolutionSystem();
}
