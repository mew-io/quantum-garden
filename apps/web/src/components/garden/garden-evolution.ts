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
import { debugLogger } from "@/lib/debug-logger";
import type { Plant } from "@quantum-garden/shared";

/** Evolution timing constants (in milliseconds) */
const EVOLUTION = {
  /** How often to check for evolution opportunities */
  CHECK_INTERVAL: 15_000, // 15 seconds

  /** Minimum time before a dormant plant can germinate */
  MIN_DORMANCY: 60_000, // 1 minute

  /** Guaranteed germination time - plants dormant this long always germinate */
  GUARANTEED_GERMINATION_TIME: 900_000, // 15 minutes

  /** Base probability of germination per check (0-1) */
  GERMINATION_CHANCE: 0.15, // 15% base chance per dormant plant per check

  /** Maximum plants that can germinate in a single check (except during waves) */
  MAX_GERMINATIONS_PER_CHECK: 1,

  /** Distance threshold for proximity bonus (pixels) */
  PROXIMITY_RADIUS: 200, // Plants within 200px of observed plants get bonus

  /** Proximity bonus multiplier */
  PROXIMITY_MULTIPLIER: 2.0, // 2x chance near observed plants

  /** Distance threshold for clustering prevention (pixels) */
  CLUSTERING_RADIUS: 150, // Skip if 3+ germinated plants within 150px

  /** Minimum germinated neighbors to prevent clustering */
  CLUSTERING_THRESHOLD: 3,

  /** Age weighting duration (milliseconds) */
  AGE_WEIGHTING_PERIOD: 300_000, // 5 minutes

  /** Maximum age bonus multiplier */
  MAX_AGE_MULTIPLIER: 2.5, // Up to 2.5x chance for oldest plants

  /** Wave germination probability (0-1) */
  WAVE_CHANCE: 0.05, // 5% chance per check for a germination wave

  /** Wave germination count */
  WAVE_GERMINATION_COUNT: 3, // 3-5 plants germinate in a wave

  /** Minimum dormant plants required for wave events */
  WAVE_MIN_DORMANT_COUNT: 5, // Need at least 5 dormant plants for a wave

  /** Minimum distance between wave-selected plants (pixels) */
  WAVE_MIN_SPACING: 200, // Prefer plants at least 200px apart in waves
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
   * Check if the evolution system is currently running.
   */
  get running(): boolean {
    return this.isRunning;
  }

  /**
   * Pause the evolution system (alias for stop, preserves tracking).
   */
  pause(): void {
    if (!this.isRunning) return;
    debugLogger.evolution.info("Evolution system paused");
    this.stop();
  }

  /**
   * Resume the evolution system (alias for start).
   */
  resume(): void {
    if (this.isRunning) return;
    debugLogger.evolution.info("Evolution system resumed");
    this.start();
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
   * Calculate distance between two plants.
   */
  private getDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if a plant has observed neighbors nearby (proximity bonus).
   */
  private hasObservedNeighbors(
    plantPosition: { x: number; y: number },
    allPlants: Plant[]
  ): boolean {
    return allPlants.some(
      (p) => p.observed && this.getDistance(plantPosition, p.position) <= EVOLUTION.PROXIMITY_RADIUS
    );
  }

  /**
   * Check if a plant is in a crowded area (clustering prevention).
   */
  private isInCluster(plantPosition: { x: number; y: number }, allPlants: Plant[]): boolean {
    const nearbyGerminated = allPlants.filter(
      (p) =>
        p.germinatedAt && this.getDistance(plantPosition, p.position) <= EVOLUTION.CLUSTERING_RADIUS
    );
    return nearbyGerminated.length >= EVOLUTION.CLUSTERING_THRESHOLD;
  }

  /**
   * Select plants for wave germination with spatial distribution.
   * Uses a greedy algorithm to maximize spread across the garden.
   *
   * @param candidates - Eligible plants to choose from
   * @param count - Number of plants to select
   * @returns Array of spatially-distributed plants
   */
  private selectSpatiallyDistributedPlants(candidates: Plant[], count: number): Plant[] {
    if (candidates.length <= count) {
      return candidates;
    }

    const selected: Plant[] = [];

    // Start with a random plant to add variety
    const startIndex = Math.floor(Math.random() * candidates.length);
    selected.push(candidates[startIndex]!);

    // Greedily select plants that maximize minimum distance to already-selected plants
    while (selected.length < count) {
      let bestCandidate: Plant | null = null;
      let bestMinDistance = -1;

      for (const candidate of candidates) {
        // Skip already selected
        if (selected.includes(candidate)) continue;

        // Calculate minimum distance to any selected plant
        let minDistanceToSelected = Infinity;
        for (const selectedPlant of selected) {
          const dist = this.getDistance(candidate.position, selectedPlant.position);
          if (dist < minDistanceToSelected) {
            minDistanceToSelected = dist;
          }
        }

        // Track candidate with maximum minimum distance (furthest from all selected)
        if (minDistanceToSelected > bestMinDistance) {
          bestMinDistance = minDistanceToSelected;
          bestCandidate = candidate;
        }
      }

      if (bestCandidate) {
        selected.push(bestCandidate);
      } else {
        break; // No more candidates
      }
    }

    return selected;
  }

  /**
   * Calculate age-based germination bonus.
   * Returns a multiplier (1.0 to MAX_AGE_MULTIPLIER).
   */
  private getAgeMultiplier(dormantSince: number, now: number): number {
    const age = now - dormantSince;
    if (age < EVOLUTION.AGE_WEIGHTING_PERIOD) {
      return 1.0;
    }
    // Linear increase up to max multiplier
    const ageRatio = Math.min(age / (EVOLUTION.AGE_WEIGHTING_PERIOD * 3), 1);
    return 1.0 + ageRatio * (EVOLUTION.MAX_AGE_MULTIPLIER - 1.0);
  }

  /**
   * Check if a plant has been dormant long enough for guaranteed germination.
   */
  private isGuaranteedGermination(dormantSince: number, now: number): boolean {
    const dormantDuration = now - dormantSince;
    return dormantDuration >= EVOLUTION.GUARANTEED_GERMINATION_TIME;
  }

  /**
   * Calculate germination probability for a plant.
   */
  private getGerminationProbability(
    plant: Plant,
    allPlants: Plant[],
    dormantSince: number,
    now: number
  ): number {
    // Check for guaranteed germination first (15 min dormancy)
    const guaranteed = this.isGuaranteedGermination(dormantSince, now);

    // Clustering prevention: 0% chance in crowded areas (even for guaranteed)
    if (this.isInCluster(plant.position, allPlants)) {
      return 0;
    }

    // Guaranteed germination returns 100%
    if (guaranteed) {
      return 1.0;
    }

    let probability = EVOLUTION.GERMINATION_CHANCE;

    // Proximity bonus: 2x chance near observed plants
    if (this.hasObservedNeighbors(plant.position, allPlants)) {
      probability *= EVOLUTION.PROXIMITY_MULTIPLIER;
    }

    // Age weighting: older plants gradually increase chance
    const ageMultiplier = this.getAgeMultiplier(dormantSince, now);
    probability *= ageMultiplier;

    return Math.min(probability, 1.0); // Cap at 100%
  }

  /**
   * Check for evolution opportunities and trigger them.
   */
  private async checkEvolution(): Promise<void> {
    if (!this.isRunning || !this.onGerminate) return;

    const { plants } = useGardenStore.getState();
    const now = Date.now();

    debugLogger.evolution.debug("Running evolution check", {
      totalPlants: plants.length,
      trackedDormant: this.plantAges.size,
    });

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

    // Determine if this is a wave event (requires minimum dormant count)
    const canWave = eligiblePlants.length >= EVOLUTION.WAVE_MIN_DORMANT_COUNT;
    const isWave = canWave && Math.random() < EVOLUTION.WAVE_CHANCE;
    const maxGerminations = isWave
      ? EVOLUTION.WAVE_GERMINATION_COUNT + Math.floor(Math.random() * 3) // 3-5 plants
      : EVOLUTION.MAX_GERMINATIONS_PER_CHECK;

    // For wave events, select spatially-distributed plants
    // For normal events, use the regular eligibility order
    const plantsToProcess = isWave
      ? this.selectSpatiallyDistributedPlants(eligiblePlants, maxGerminations)
      : eligiblePlants;

    // Process selected plants
    let germinationsThisCheck = 0;

    for (const plant of plantsToProcess) {
      if (germinationsThisCheck >= maxGerminations) break;

      const dormantSince = this.plantAges.get(plant.id);
      if (!dormantSince) continue;

      const probability = this.getGerminationProbability(plant, plants, dormantSince, now);

      if (Math.random() < probability) {
        try {
          await this.onGerminate(plant.id);
          this.plantAges.delete(plant.id); // No longer tracking
          germinationsThisCheck++;

          // Log for debugging
          const waveIndicator = isWave ? " (wave)" : "";
          const guaranteedIndicator = probability >= 1.0 ? " (guaranteed)" : "";
          debugLogger.evolution.info(`Plant germinated${waveIndicator}${guaranteedIndicator}`, {
            plantId: plant.id.slice(0, 8),
            probability: probability.toFixed(2),
          });
        } catch (error) {
          debugLogger.evolution.error("Failed to germinate plant", {
            plantId: plant.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    if (isWave && germinationsThisCheck > 0) {
      debugLogger.evolution.info(`Germination wave complete`, {
        plantsGerminated: germinationsThisCheck,
      });
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
