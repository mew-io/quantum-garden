/**
 * Evolution Logic - Pure calculation functions for garden evolution
 *
 * These functions are extracted from GardenEvolutionSystem for testability.
 * They contain no side effects and are purely computational.
 */

import type { Plant } from "@quantum-garden/shared";

/** Evolution configuration constants */
export const EVOLUTION_CONFIG = {
  /** Base probability of germination per check (0-1) */
  GERMINATION_CHANCE: 0.15,

  /** Distance threshold for proximity bonus (pixels, scaled for 4K canvas) */
  PROXIMITY_RADIUS: 600,

  /** Proximity bonus multiplier */
  PROXIMITY_MULTIPLIER: 2.0,

  /** Distance threshold for clustering prevention (pixels, scaled for 4K canvas) */
  CLUSTERING_RADIUS: 450,

  /** Minimum germinated neighbors to prevent clustering */
  CLUSTERING_THRESHOLD: 3,

  /** Age weighting duration (milliseconds) */
  AGE_WEIGHTING_PERIOD: 300_000, // 5 minutes

  /** Maximum age bonus multiplier */
  MAX_AGE_MULTIPLIER: 2.5,

  /** Minimum dormancy before germination (milliseconds) */
  MIN_DORMANCY: 60_000, // 1 minute

  /** Guaranteed germination time (milliseconds) - plants dormant this long always germinate */
  GUARANTEED_GERMINATION_TIME: 900_000, // 15 minutes
};

/**
 * Calculate Euclidean distance between two positions.
 */
export function getDistance(
  pos1: { x: number; y: number },
  pos2: { x: number; y: number }
): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a plant has observed neighbors nearby (proximity bonus).
 */
export function hasObservedNeighbors(
  plantPosition: { x: number; y: number },
  allPlants: Plant[],
  proximityRadius: number = EVOLUTION_CONFIG.PROXIMITY_RADIUS
): boolean {
  return allPlants.some(
    (p) => p.observed && getDistance(plantPosition, p.position) <= proximityRadius
  );
}

/**
 * Check if a plant is in a crowded area (clustering prevention).
 * Returns true if there are too many germinated plants nearby.
 */
export function isInCluster(
  plantPosition: { x: number; y: number },
  allPlants: Plant[],
  clusteringRadius: number = EVOLUTION_CONFIG.CLUSTERING_RADIUS,
  clusteringThreshold: number = EVOLUTION_CONFIG.CLUSTERING_THRESHOLD
): boolean {
  const nearbyGerminated = allPlants.filter(
    (p) => p.germinatedAt && getDistance(plantPosition, p.position) <= clusteringRadius
  );
  return nearbyGerminated.length >= clusteringThreshold;
}

/**
 * Calculate age-based germination bonus.
 * Returns a multiplier (1.0 to MAX_AGE_MULTIPLIER).
 *
 * Plants that have been dormant longer than AGE_WEIGHTING_PERIOD
 * gradually increase their germination probability.
 */
export function getAgeMultiplier(
  dormantSince: number,
  now: number,
  ageWeightingPeriod: number = EVOLUTION_CONFIG.AGE_WEIGHTING_PERIOD,
  maxAgeMultiplier: number = EVOLUTION_CONFIG.MAX_AGE_MULTIPLIER
): number {
  const age = now - dormantSince;
  if (age < ageWeightingPeriod) {
    return 1.0;
  }
  // Linear increase up to max multiplier over 3x the weighting period
  const ageRatio = Math.min(age / (ageWeightingPeriod * 3), 1);
  return 1.0 + ageRatio * (maxAgeMultiplier - 1.0);
}

/**
 * Check if a plant has been dormant long enough for guaranteed germination.
 * After GUARANTEED_GERMINATION_TIME, plants will always germinate (100% probability).
 */
export function isGuaranteedGermination(
  dormantSince: number,
  now: number,
  guaranteedTime: number = EVOLUTION_CONFIG.GUARANTEED_GERMINATION_TIME
): boolean {
  const dormantDuration = now - dormantSince;
  return dormantDuration >= guaranteedTime;
}

/**
 * Calculate germination probability for a plant.
 * Combines base chance, proximity bonus, age weighting, clustering prevention,
 * and guaranteed germination after 15 minutes.
 */
export function getGerminationProbability(
  plant: Plant,
  allPlants: Plant[],
  dormantSince: number,
  now: number,
  config: Partial<typeof EVOLUTION_CONFIG> = {}
): number {
  const mergedConfig = { ...EVOLUTION_CONFIG, ...config };

  // Check for guaranteed germination first (15 min dormancy)
  // Even guaranteed germination respects clustering prevention
  const guaranteed = isGuaranteedGermination(
    dormantSince,
    now,
    mergedConfig.GUARANTEED_GERMINATION_TIME
  );

  // Clustering prevention: 0% chance in crowded areas (even for guaranteed)
  if (
    isInCluster(
      plant.position,
      allPlants,
      mergedConfig.CLUSTERING_RADIUS,
      mergedConfig.CLUSTERING_THRESHOLD
    )
  ) {
    return 0;
  }

  // Guaranteed germination returns 100%
  if (guaranteed) {
    return 1.0;
  }

  let probability = mergedConfig.GERMINATION_CHANCE;

  // Proximity bonus: 2x chance near observed plants
  if (hasObservedNeighbors(plant.position, allPlants, mergedConfig.PROXIMITY_RADIUS)) {
    probability *= mergedConfig.PROXIMITY_MULTIPLIER;
  }

  // Age weighting: older plants gradually increase chance
  const ageMultiplier = getAgeMultiplier(
    dormantSince,
    now,
    mergedConfig.AGE_WEIGHTING_PERIOD,
    mergedConfig.MAX_AGE_MULTIPLIER
  );
  probability *= ageMultiplier;

  return Math.min(probability, 1.0); // Cap at 100%
}

/**
 * Check if a plant is eligible for germination.
 */
export function isEligibleForGermination(
  plant: Plant,
  dormantSince: number | undefined,
  now: number,
  minDormancy: number = EVOLUTION_CONFIG.MIN_DORMANCY
): boolean {
  // Must not already be germinated
  if (plant.germinatedAt) return false;

  // Must not already be observed
  if (plant.observed) return false;

  // Must have tracking data
  if (!dormantSince) return false;

  // Must have been dormant for minimum time
  return now - dormantSince >= minDormancy;
}
