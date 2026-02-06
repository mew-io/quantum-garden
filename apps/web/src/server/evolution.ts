/**
 * Server-side Garden Evolution System
 *
 * This module contains the core evolution logic that runs server-side,
 * independent of any client. The garden grows on its own - clients just view it.
 *
 * Can be called from:
 * - Vercel Cron (via /api/cron/evolve)
 * - Local worker script (scripts/evolve-garden.ts)
 * - On-demand catch-up (if needed)
 *
 * @module server/evolution
 */

import type { PrismaClient, Plant as PrismaPlant } from "@prisma/client";
import {
  getVariantById,
  PLANT_VARIANTS,
  type ClusteringBehavior,
  type PlantVariant,
} from "@quantum-garden/shared";

/** Evolution timing constants (in milliseconds) */
export const EVOLUTION_CONFIG = {
  /** How often evolution should run */
  CHECK_INTERVAL: 15_000, // 15 seconds

  /** Minimum time before a dormant plant can germinate */
  MIN_DORMANCY: 60_000, // 1 minute

  /** Guaranteed germination time - plants dormant this long always germinate */
  GUARANTEED_GERMINATION_TIME: 600_000, // 10 minutes (reduced from 15)

  /** Base probability of germination per check (0-1) */
  GERMINATION_CHANCE: 0.25, // 25% (increased from 15%)

  /** Maximum plants that can germinate in a single check (except during waves) */
  MAX_GERMINATIONS_PER_CHECK: 2, // increased from 1

  /** Distance threshold for proximity bonus (pixels) */
  PROXIMITY_RADIUS: 200,

  /** Proximity bonus multiplier */
  PROXIMITY_MULTIPLIER: 2.0, // 2x chance near observed plants

  /** Distance threshold for clustering prevention (pixels) */
  CLUSTERING_RADIUS: 150,

  /** Minimum germinated neighbors to prevent clustering */
  CLUSTERING_THRESHOLD: 3,

  /** Age weighting duration (milliseconds) */
  AGE_WEIGHTING_PERIOD: 300_000, // 5 minutes

  /** Maximum age bonus multiplier */
  MAX_AGE_MULTIPLIER: 2.5,

  /** Wave germination probability (0-1) */
  WAVE_CHANCE: 0.08, // 8% chance per check (increased from 5%)

  /** Wave germination count range */
  WAVE_MIN_COUNT: 3,
  WAVE_MAX_COUNT: 5,

  /** Minimum dormant plants required for wave events */
  WAVE_MIN_DORMANT_COUNT: 5,

  /** Death system configuration */
  /** Minimum time a plant must be germinated before it can die */
  MIN_LIFETIME: 1_800_000, // 30 minutes (increased from 5 minutes)

  /** Guaranteed death time - plants older than this always die */
  GUARANTEED_DEATH_TIME: 7_200_000, // 2 hours (increased from 30 minutes)

  /** Base probability of death per check (0-1) */
  DEATH_CHANCE: 0.02, // 2% (reduced from 5%)

  /** Maximum plants that can die in a single check */
  MAX_DEATHS_PER_CHECK: 1, // reduced from 2

  /** Minimum alive plants before auto-reseeding triggers */
  MIN_POPULATION: 15,

  /** Number of new plants to spawn when auto-reseeding */
  RESEED_COUNT: 10,
};

type PlantWithPosition = PrismaPlant & { position: { x: number; y: number } };

/**
 * Result of an evolution check.
 */
export interface EvolutionResult {
  /** Number of eligible dormant plants checked */
  checked: number;
  /** Number of plants that germinated */
  germinated: number;
  /** Whether this was a wave event */
  isWave: boolean;
  /** Plant IDs that germinated */
  germinatedIds: string[];
  /** Number of plants that died */
  died: number;
  /** Plant IDs that died */
  diedIds: string[];
  /** Current evolution version */
  version: number;
}

/**
 * Convert Prisma plant to internal format with position object.
 */
function withPosition(plant: PrismaPlant): PlantWithPosition {
  return {
    ...plant,
    position: { x: plant.positionX, y: plant.positionY },
  };
}

/**
 * Calculate distance between two positions.
 */
function getDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a plant has observed neighbors nearby (proximity bonus).
 */
function hasObservedNeighbors(
  plantPosition: { x: number; y: number },
  allPlants: PlantWithPosition[]
): boolean {
  return allPlants.some(
    (p) => p.observed && getDistance(plantPosition, p.position) <= EVOLUTION_CONFIG.PROXIMITY_RADIUS
  );
}

/**
 * Check if a plant is in a crowded area (clustering prevention).
 * Used for spread-mode plants only.
 */
function isInCluster(
  plantPosition: { x: number; y: number },
  allPlants: PlantWithPosition[]
): boolean {
  const nearbyGerminated = allPlants.filter(
    (p) =>
      p.germinatedAt && getDistance(plantPosition, p.position) <= EVOLUTION_CONFIG.CLUSTERING_RADIUS
  );
  return nearbyGerminated.length >= EVOLUTION_CONFIG.CLUSTERING_THRESHOLD;
}

/** Default clustering behavior for variants without explicit config */
const DEFAULT_CLUSTERING_BEHAVIOR: ClusteringBehavior = {
  mode: "spread",
  clusterRadius: EVOLUTION_CONFIG.CLUSTERING_RADIUS,
  clusterBonus: 1.0,
  maxClusterDensity: 3,
  reseedClusterChance: 0,
};

/**
 * Get clustering behavior for a plant variant.
 */
function getClusteringBehavior(variantId: string): ClusteringBehavior {
  const variant = getVariantById(variantId);
  if (!variant?.clusteringBehavior) {
    return DEFAULT_CLUSTERING_BEHAVIOR;
  }
  return {
    ...DEFAULT_CLUSTERING_BEHAVIOR,
    ...variant.clusteringBehavior,
  };
}

/**
 * Count germinated plants of the same variant within a radius.
 */
function countSameTypeNeighbors(
  plantPosition: { x: number; y: number },
  variantId: string,
  allPlants: PlantWithPosition[],
  radius: number
): number {
  return allPlants.filter(
    (p) =>
      p.variantId === variantId &&
      p.germinatedAt &&
      getDistance(plantPosition, p.position) <= radius
  ).length;
}

/**
 * Evaluate clustering rules for a plant.
 * Returns { shouldPrevent: boolean, clusterBonus: number }
 * - For 'spread' mode: prevents germination in dense areas
 * - For 'cluster' mode: provides bonus near same-type plants
 */
function evaluateClusteringRules(
  plant: PlantWithPosition,
  allPlants: PlantWithPosition[]
): { shouldPrevent: boolean; clusterBonus: number } {
  const behavior = getClusteringBehavior(plant.variantId);
  const radius = behavior.clusterRadius ?? EVOLUTION_CONFIG.CLUSTERING_RADIUS;

  if (behavior.mode === "cluster") {
    // Clustering mode: bonus for same-type neighbors, no prevention
    const sameTypeCount = countSameTypeNeighbors(
      plant.position,
      plant.variantId,
      allPlants,
      radius
    );

    // Calculate bonus that scales with neighbor count up to maxClusterDensity
    const maxDensity = behavior.maxClusterDensity ?? 5;
    const effectiveCount = Math.min(sameTypeCount, maxDensity);
    const bonusMultiplier = behavior.clusterBonus ?? 2.0;

    // Bonus scales from 1.0 (no neighbors) to clusterBonus (at max density)
    const bonus =
      effectiveCount > 0 ? 1 + (effectiveCount / maxDensity) * (bonusMultiplier - 1) : 1.0;

    return { shouldPrevent: false, clusterBonus: bonus };
  }

  if (behavior.mode === "neutral") {
    // Neutral mode: no spatial rules
    return { shouldPrevent: false, clusterBonus: 1.0 };
  }

  // Spread mode (default): prevent germination in dense areas
  const shouldPrevent = isInCluster(plant.position, allPlants);
  return { shouldPrevent, clusterBonus: 1.0 };
}

/**
 * Calculate age-based germination bonus.
 */
function getAgeMultiplier(dormantSince: Date, now: number): number {
  const age = now - dormantSince.getTime();
  if (age < EVOLUTION_CONFIG.AGE_WEIGHTING_PERIOD) {
    return 1.0;
  }
  const ageRatio = Math.min(age / (EVOLUTION_CONFIG.AGE_WEIGHTING_PERIOD * 3), 1);
  return 1.0 + ageRatio * (EVOLUTION_CONFIG.MAX_AGE_MULTIPLIER - 1.0);
}

/**
 * Check if a plant has been dormant long enough for guaranteed germination.
 */
function isGuaranteedGermination(dormantSince: Date, now: number): boolean {
  const dormantDuration = now - dormantSince.getTime();
  return dormantDuration >= EVOLUTION_CONFIG.GUARANTEED_GERMINATION_TIME;
}

/**
 * Calculate germination probability for a plant.
 */
function getGerminationProbability(
  plant: PlantWithPosition,
  allPlants: PlantWithPosition[],
  now: number
): number {
  const dormantSince = plant.createdAt;

  // Guaranteed germination after threshold (takes priority over everything)
  if (isGuaranteedGermination(dormantSince, now)) {
    return 1.0;
  }

  // Evaluate clustering rules (different behavior for cluster vs spread mode)
  const { shouldPrevent, clusterBonus } = evaluateClusteringRules(plant, allPlants);

  if (shouldPrevent) {
    return 0;
  }

  let probability = EVOLUTION_CONFIG.GERMINATION_CHANCE;

  // Apply clustering bonus (for cluster-mode plants)
  probability *= clusterBonus;

  // Proximity bonus near observed plants (applies to all plant types)
  if (hasObservedNeighbors(plant.position, allPlants)) {
    probability *= EVOLUTION_CONFIG.PROXIMITY_MULTIPLIER;
  }

  // Age weighting
  probability *= getAgeMultiplier(dormantSince, now);

  return Math.min(probability, 1.0);
}

/**
 * Select plants for wave germination with spatial distribution.
 */
function selectSpatiallyDistributedPlants(
  candidates: PlantWithPosition[],
  count: number
): PlantWithPosition[] {
  if (candidates.length <= count) {
    return candidates;
  }

  const selected: PlantWithPosition[] = [];
  const startIndex = Math.floor(Math.random() * candidates.length);
  selected.push(candidates[startIndex]!);

  while (selected.length < count) {
    let bestCandidate: PlantWithPosition | null = null;
    let bestMinDistance = -1;

    for (const candidate of candidates) {
      if (selected.includes(candidate)) continue;

      let minDistanceToSelected = Infinity;
      for (const selectedPlant of selected) {
        const dist = getDistance(candidate.position, selectedPlant.position);
        if (dist < minDistanceToSelected) {
          minDistanceToSelected = dist;
        }
      }

      if (minDistanceToSelected > bestMinDistance) {
        bestMinDistance = minDistanceToSelected;
        bestCandidate = candidate;
      }
    }

    if (bestCandidate) {
      selected.push(bestCandidate);
    } else {
      break;
    }
  }

  return selected;
}

/**
 * Select plants for wave germination with mode-aware spatial distribution.
 * - Cluster-mode plants: grouped together (nearby same-type)
 * - Spread-mode plants: distributed apart
 */
function selectWavePlantsWithClustering(
  candidates: PlantWithPosition[],
  count: number
): PlantWithPosition[] {
  if (candidates.length <= count) {
    return candidates;
  }

  // Separate candidates by clustering mode
  const clusterCandidates = candidates.filter(
    (p) => getClusteringBehavior(p.variantId).mode === "cluster"
  );
  const spreadCandidates = candidates.filter(
    (p) => getClusteringBehavior(p.variantId).mode !== "cluster"
  );

  const selected: PlantWithPosition[] = [];

  // For cluster-mode plants: select groups of same-type plants nearby each other
  if (clusterCandidates.length > 0) {
    // Pick a random cluster candidate as seed
    const seedIndex = Math.floor(Math.random() * clusterCandidates.length);
    const seed = clusterCandidates[seedIndex]!;
    selected.push(seed);

    // Add nearby same-type candidates
    const sameTypeCandidates = clusterCandidates.filter(
      (c) => c.variantId === seed.variantId && c !== seed
    );
    const sorted = sameTypeCandidates.sort(
      (a, b) => getDistance(seed.position, a.position) - getDistance(seed.position, b.position)
    );

    // Add up to half the wave count from same-type neighbors
    const clusterSlots = Math.floor(count / 2);
    for (const candidate of sorted.slice(0, clusterSlots)) {
      if (selected.length < count) {
        selected.push(candidate);
      }
    }
  }

  // Fill remaining slots with spatially distributed spread-mode plants
  const remainingCount = count - selected.length;
  if (remainingCount > 0 && spreadCandidates.length > 0) {
    const distributed = selectSpatiallyDistributedPlants(spreadCandidates, remainingCount);
    selected.push(...distributed);
  }

  // If we still need more, add any remaining candidates
  if (selected.length < count) {
    const remaining = candidates.filter((c) => !selected.includes(c));
    for (const candidate of remaining) {
      if (selected.length >= count) break;
      selected.push(candidate);
    }
  }

  return selected;
}

/**
 * Check if a plant has lived long enough for guaranteed death.
 */
function isGuaranteedDeath(germinatedAt: Date, now: number): boolean {
  const lifetime = now - germinatedAt.getTime();
  return lifetime >= EVOLUTION_CONFIG.GUARANTEED_DEATH_TIME;
}

/**
 * Calculate age-based death bonus (older plants more likely to die).
 */
function getDeathAgeMultiplier(germinatedAt: Date, now: number): number {
  const age = now - germinatedAt.getTime();
  if (age < EVOLUTION_CONFIG.MIN_LIFETIME * 2) {
    return 1.0;
  }
  const ageRatio = Math.min(age / EVOLUTION_CONFIG.GUARANTEED_DEATH_TIME, 1);
  return 1.0 + ageRatio * 3.0; // Up to 4x multiplier for old plants
}

/**
 * Calculate death probability for a plant.
 */
function getDeathProbability(plant: PlantWithPosition, now: number): number {
  if (!plant.germinatedAt) {
    return 0; // Dormant plants don't die
  }

  const germinatedAt = plant.germinatedAt;
  const lifetime = now - germinatedAt.getTime();

  // Too young to die
  if (lifetime < EVOLUTION_CONFIG.MIN_LIFETIME) {
    return 0;
  }

  // Guaranteed death after maximum lifetime
  if (isGuaranteedDeath(germinatedAt, now)) {
    return 1.0;
  }

  let probability = EVOLUTION_CONFIG.DEATH_CHANCE;

  // Age weighting (older plants more likely to die)
  probability *= getDeathAgeMultiplier(germinatedAt, now);

  return Math.min(probability, 1.0);
}

/**
 * Auto-reseed the garden if the alive population is below the minimum threshold.
 * Creates new dormant plants with clustering-aware positioning.
 *
 * @returns Number of new plants created
 */
async function autoReseedIfNeeded(
  db: PrismaClient,
  allPlants: PlantWithPosition[],
  diedIds: string[]
): Promise<number> {
  const aliveAfterDeaths = allPlants.filter((p) => !p.diedAt && !diedIds.includes(p.id));
  if (aliveAfterDeaths.length >= EVOLUTION_CONFIG.MIN_POPULATION) {
    return 0;
  }

  const plantsNeeded = EVOLUTION_CONFIG.RESEED_COUNT;
  const canvasWidth = 1200;
  const canvasHeight = 800;
  const margin = 50;

  // Get or create a quantum record for new plants
  let quantumRecord = await db.quantumRecord.findFirst();
  if (!quantumRecord) {
    quantumRecord = await db.quantumRecord.create({
      data: {
        circuitId: "superposition",
        circuitDefinition: { type: "placeholder", gates: [] },
        status: "completed",
        measurements: [0, 1],
        probabilities: [0.5, 0.5],
      },
    });
  }
  const quantumCircuitId = quantumRecord.id;

  // Helper to select variant using rarity weights
  const selectVariantByRarity = (): PlantVariant => {
    const totalWeight = PLANT_VARIANTS.reduce((sum, v) => sum + v.rarity, 0);
    let random = Math.random() * totalWeight;

    for (const variant of PLANT_VARIANTS) {
      random -= variant.rarity;
      if (random <= 0) {
        return variant;
      }
    }
    return PLANT_VARIANTS[0]!;
  };

  for (let i = 0; i < plantsNeeded; i++) {
    // Select variant using rarity weights
    const variant = selectVariantByRarity();
    const variantId = variant.id;
    const behavior = getClusteringBehavior(variantId);

    let position: { x: number; y: number };

    // For cluster-mode plants, try to spawn near existing same-type plants
    if (behavior.mode === "cluster" && Math.random() < (behavior.reseedClusterChance ?? 0.5)) {
      const existingSameType = aliveAfterDeaths.filter(
        (p) => p.variantId === variantId && p.germinatedAt
      );

      if (existingSameType.length > 0) {
        // Pick a random existing plant of same type as anchor
        const anchor = existingSameType[Math.floor(Math.random() * existingSameType.length)]!;
        const radius = behavior.clusterRadius ?? 150;

        // Spawn within cluster radius with some randomness
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * (radius - 30); // At least 30px away
        position = {
          x: Math.max(
            margin,
            Math.min(canvasWidth - margin, anchor.positionX + Math.cos(angle) * distance)
          ),
          y: Math.max(
            margin,
            Math.min(canvasHeight - margin, anchor.positionY + Math.sin(angle) * distance)
          ),
        };
      } else {
        // No existing same-type, use random position
        position = {
          x: margin + Math.random() * (canvasWidth - 2 * margin),
          y: margin + Math.random() * (canvasHeight - 2 * margin),
        };
      }
    } else {
      // Spread mode or random: use distributed positioning
      position = {
        x: margin + Math.random() * (canvasWidth - 2 * margin),
        y: margin + Math.random() * (canvasHeight - 2 * margin),
      };
    }

    await db.plant.create({
      data: {
        positionX: position.x,
        positionY: position.y,
        observed: false,
        visualState: "superposed",
        quantumCircuitId,
        variantId,
        lifecycleModifier: 0.8 + Math.random() * 0.4, // 0.8-1.2 range
      },
    });
  }

  return plantsNeeded;
}

/**
 * Get or create the garden state singleton.
 */
async function getOrCreateGardenState(db: PrismaClient) {
  let state = await db.gardenState.findUnique({
    where: { id: "singleton" },
  });

  if (!state) {
    state = await db.gardenState.create({
      data: {
        id: "singleton",
        lastEvolutionCheck: new Date(),
        evolutionVersion: 0,
      },
    });
  }

  return state;
}

/**
 * Run a single evolution check.
 *
 * This is the main entry point for the evolution system.
 * Call this from cron jobs, workers, or on-demand.
 */
export async function runEvolutionCheck(db: PrismaClient): Promise<EvolutionResult> {
  const now = Date.now();

  // Ensure garden state exists
  await getOrCreateGardenState(db);

  // Get all plants
  const prismaPlants = await db.plant.findMany();
  const allPlants = prismaPlants.map(withPosition);

  // Find dormant plants eligible for germination
  // Note: We only check germinatedAt, not observed. A plant can be observed
  // (quantum state collapsed) before germinating. These are separate concepts:
  // - Germination: When lifecycle starts (seed → growing)
  // - Observation: When quantum state collapses (traits determined)
  const eligiblePlants = allPlants.filter((plant) => {
    if (plant.germinatedAt) return false; // Already germinated

    const dormantDuration = now - plant.createdAt.getTime();
    return dormantDuration >= EVOLUTION_CONFIG.MIN_DORMANCY;
  });

  if (eligiblePlants.length === 0) {
    // Still process deaths even if no plants to germinate
    const alivePlants = allPlants.filter((p) => p.germinatedAt && !p.diedAt);
    const plantsToDie: PlantWithPosition[] = [];

    for (const plant of alivePlants) {
      if (plantsToDie.length >= EVOLUTION_CONFIG.MAX_DEATHS_PER_CHECK) break;

      const probability = getDeathProbability(plant, now);
      if (Math.random() < probability) {
        plantsToDie.push(plant);
      }
    }

    // Mark plants as dead
    const deathTime = new Date();
    const diedIds: string[] = [];

    for (const plant of plantsToDie) {
      await db.plant.update({
        where: { id: plant.id },
        data: { diedAt: deathTime },
      });
      diedIds.push(plant.id);
    }

    // Auto-reseed if population is too low
    await autoReseedIfNeeded(db, allPlants, diedIds);

    // Update evolution version if deaths or reseeds occurred
    let state = await db.gardenState.findUnique({ where: { id: "singleton" } });
    if (plantsToDie.length > 0) {
      state = await db.gardenState.update({
        where: { id: "singleton" },
        data: {
          lastEvolutionCheck: deathTime,
          evolutionVersion: { increment: 1 },
        },
      });
    }

    return {
      checked: 0,
      germinated: 0,
      isWave: false,
      germinatedIds: [],
      died: plantsToDie.length,
      diedIds,
      version: state?.evolutionVersion ?? 0,
    };
  }

  // Determine if this is a wave event
  const canWave = eligiblePlants.length >= EVOLUTION_CONFIG.WAVE_MIN_DORMANT_COUNT;
  const isWave = canWave && Math.random() < EVOLUTION_CONFIG.WAVE_CHANCE;
  const maxGerminations = isWave
    ? EVOLUTION_CONFIG.WAVE_MIN_COUNT +
      Math.floor(
        Math.random() * (EVOLUTION_CONFIG.WAVE_MAX_COUNT - EVOLUTION_CONFIG.WAVE_MIN_COUNT + 1)
      )
    : EVOLUTION_CONFIG.MAX_GERMINATIONS_PER_CHECK;

  // For wave events, select plants with cluster-aware distribution
  const plantsToProcess = isWave
    ? selectWavePlantsWithClustering(eligiblePlants, maxGerminations)
    : eligiblePlants;

  // Determine which plants will germinate
  const plantsToGerminate: PlantWithPosition[] = [];
  for (const plant of plantsToProcess) {
    if (plantsToGerminate.length >= maxGerminations) break;

    const probability = getGerminationProbability(plant, allPlants, now);
    if (Math.random() < probability) {
      plantsToGerminate.push(plant);
    }
  }

  // Germinate selected plants
  const germinationTime = new Date();
  const germinatedIds: string[] = [];

  for (const plant of plantsToGerminate) {
    await db.plant.update({
      where: { id: plant.id },
      data: { germinatedAt: germinationTime },
    });
    germinatedIds.push(plant.id);
  }

  // Process plant deaths
  const alivePlants = allPlants.filter((p) => p.germinatedAt && !p.diedAt);
  const plantsToDie: PlantWithPosition[] = [];

  for (const plant of alivePlants) {
    if (plantsToDie.length >= EVOLUTION_CONFIG.MAX_DEATHS_PER_CHECK) break;

    const probability = getDeathProbability(plant, now);
    if (Math.random() < probability) {
      plantsToDie.push(plant);
    }
  }

  // Mark plants as dead
  const deathTime = new Date();
  const diedIds: string[] = [];

  for (const plant of plantsToDie) {
    await db.plant.update({
      where: { id: plant.id },
      data: { diedAt: deathTime },
    });
    diedIds.push(plant.id);
  }

  // Auto-reseed if population is too low
  await autoReseedIfNeeded(db, allPlants, diedIds);

  // Update garden state
  const updatedState = await db.gardenState.update({
    where: { id: "singleton" },
    data: {
      lastEvolutionCheck: germinationTime,
      evolutionVersion: { increment: 1 },
    },
  });

  return {
    checked: eligiblePlants.length,
    germinated: plantsToGerminate.length,
    isWave,
    germinatedIds,
    died: plantsToDie.length,
    diedIds,
    version: updatedState.evolutionVersion,
  };
}

/**
 * Get current garden evolution state.
 */
export async function getEvolutionState(db: PrismaClient) {
  const state = await getOrCreateGardenState(db);
  const plants = await db.plant.findMany();

  const alivePlants = plants.filter((p) => !p.diedAt);
  const dormantCount = alivePlants.filter((p) => !p.germinatedAt).length;
  const germinatedCount = alivePlants.filter((p) => p.germinatedAt).length;
  const deadCount = plants.filter((p) => p.diedAt).length;

  return {
    version: state.evolutionVersion,
    lastCheck: state.lastEvolutionCheck,
    dormantCount,
    germinatedCount,
    deadCount,
    totalPlants: alivePlants.length,
  };
}
