/**
 * Evolution Logic Tests
 *
 * Tests the pure calculation functions used by the garden evolution system.
 */

import { describe, it, expect } from "vitest";
import {
  getDistance,
  hasObservedNeighbors,
  isInCluster,
  getAgeMultiplier,
  isGuaranteedGermination,
  getGerminationProbability,
  isEligibleForGermination,
  EVOLUTION_CONFIG,
} from "../evolution-logic";
import type { Plant } from "@quantum-garden/shared";

/**
 * Create a mock plant for testing.
 */
function createMockPlant(
  id: string,
  x: number,
  y: number,
  options: {
    observed?: boolean;
    germinatedAt?: Date | null;
  } = {}
): Plant {
  return {
    id,
    position: { x, y },
    observed: options.observed ?? false,
    visualState: options.observed ? "collapsed" : "superposed",
    variantId: "test-variant",
    createdAt: new Date(),
    lifecycleModifier: 1.0,
    germinatedAt: options.germinatedAt ?? null,
  } as Plant;
}

describe("getDistance", () => {
  it("should calculate distance between two points", () => {
    expect(getDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(getDistance({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0);
    expect(getDistance({ x: 10, y: 10 }, { x: 13, y: 14 })).toBe(5);
  });

  it("should handle negative coordinates", () => {
    expect(getDistance({ x: -3, y: -4 }, { x: 0, y: 0 })).toBe(5);
    expect(getDistance({ x: -10, y: 0 }, { x: 10, y: 0 })).toBe(20);
  });

  it("should be commutative", () => {
    const pos1 = { x: 100, y: 200 };
    const pos2 = { x: 150, y: 300 };
    expect(getDistance(pos1, pos2)).toBe(getDistance(pos2, pos1));
  });
});

describe("hasObservedNeighbors", () => {
  it("should return true when observed plant is within radius", () => {
    const position = { x: 100, y: 100 };
    const plants = [
      createMockPlant("p1", 150, 150, { observed: true }), // ~70px away
    ];

    expect(hasObservedNeighbors(position, plants, 100)).toBe(true);
  });

  it("should return false when no observed plants nearby", () => {
    const position = { x: 100, y: 100 };
    const plants = [
      createMockPlant("p1", 500, 500, { observed: true }), // Far away
    ];

    expect(hasObservedNeighbors(position, plants, 100)).toBe(false);
  });

  it("should ignore unobserved plants", () => {
    const position = { x: 100, y: 100 };
    const plants = [
      createMockPlant("p1", 110, 110, { observed: false }), // Close but not observed
    ];

    expect(hasObservedNeighbors(position, plants, 100)).toBe(false);
  });

  it("should use default radius from config", () => {
    const position = { x: 100, y: 100 };
    const plants = [
      createMockPlant("p1", 100 + EVOLUTION_CONFIG.PROXIMITY_RADIUS - 10, 100, { observed: true }),
    ];

    expect(hasObservedNeighbors(position, plants)).toBe(true);
  });

  it("should handle empty plant list", () => {
    expect(hasObservedNeighbors({ x: 100, y: 100 }, [])).toBe(false);
  });
});

describe("isInCluster", () => {
  it("should return true when too many germinated plants nearby", () => {
    const position = { x: 100, y: 100 };
    const plants = [
      createMockPlant("p1", 110, 110, { germinatedAt: new Date() }),
      createMockPlant("p2", 120, 100, { germinatedAt: new Date() }),
      createMockPlant("p3", 100, 120, { germinatedAt: new Date() }),
    ];

    expect(isInCluster(position, plants, 150, 3)).toBe(true);
  });

  it("should return false when below threshold", () => {
    const position = { x: 100, y: 100 };
    const plants = [
      createMockPlant("p1", 110, 110, { germinatedAt: new Date() }),
      createMockPlant("p2", 120, 100, { germinatedAt: new Date() }),
    ];

    expect(isInCluster(position, plants, 150, 3)).toBe(false);
  });

  it("should ignore dormant plants", () => {
    const position = { x: 100, y: 100 };
    const plants = [
      createMockPlant("p1", 110, 110, { germinatedAt: new Date() }),
      createMockPlant("p2", 120, 100, { germinatedAt: null }), // Dormant
      createMockPlant("p3", 100, 120, { germinatedAt: null }), // Dormant
    ];

    expect(isInCluster(position, plants, 150, 3)).toBe(false);
  });

  it("should ignore distant germinated plants", () => {
    const position = { x: 100, y: 100 };
    const plants = [
      createMockPlant("p1", 500, 500, { germinatedAt: new Date() }), // Far
      createMockPlant("p2", 600, 600, { germinatedAt: new Date() }), // Far
      createMockPlant("p3", 700, 700, { germinatedAt: new Date() }), // Far
    ];

    expect(isInCluster(position, plants, 150, 3)).toBe(false);
  });

  it("should use default config values", () => {
    const position = { x: 100, y: 100 };
    const threshold = EVOLUTION_CONFIG.CLUSTERING_THRESHOLD;

    // Create exactly threshold number of germinated plants nearby
    const plants = Array.from({ length: threshold }, (_, i) =>
      createMockPlant(`p${i}`, 100 + i * 10, 100, { germinatedAt: new Date() })
    );

    expect(isInCluster(position, plants)).toBe(true);
  });
});

describe("getAgeMultiplier", () => {
  const now = Date.now();
  const period = EVOLUTION_CONFIG.AGE_WEIGHTING_PERIOD;
  const maxMultiplier = EVOLUTION_CONFIG.MAX_AGE_MULTIPLIER;

  it("should return 1.0 for plants younger than age weighting period", () => {
    const dormantSince = now - period / 2; // Half the period
    expect(getAgeMultiplier(dormantSince, now)).toBe(1.0);
  });

  it("should start increasing multiplier at age weighting period", () => {
    const dormantSince = now - period;
    // At exactly the period, ageRatio = 1/3, so multiplier = 1.0 + (1/3) * 1.5 = 1.5
    const multiplier = getAgeMultiplier(dormantSince, now);
    expect(multiplier).toBeGreaterThan(1.0);
    expect(multiplier).toBeLessThan(maxMultiplier);
  });

  it("should increase multiplier after age weighting period", () => {
    const dormantSince = now - period * 2; // 2x the period
    const multiplier = getAgeMultiplier(dormantSince, now);
    expect(multiplier).toBeGreaterThan(1.0);
    expect(multiplier).toBeLessThan(maxMultiplier);
  });

  it("should reach max multiplier after 3x age weighting period", () => {
    const dormantSince = now - period * 4; // 4x the period (well past 3x)
    const multiplier = getAgeMultiplier(dormantSince, now);
    expect(multiplier).toBe(maxMultiplier);
  });

  it("should accept custom config values", () => {
    const customPeriod = 60_000; // 1 minute
    const customMax = 3.0;

    const dormantSince = now - customPeriod * 3;
    const multiplier = getAgeMultiplier(dormantSince, now, customPeriod, customMax);
    expect(multiplier).toBe(customMax);
  });

  it("should handle edge case of dormantSince in the future", () => {
    const dormantSince = now + 1000; // Future
    expect(getAgeMultiplier(dormantSince, now)).toBe(1.0);
  });
});

describe("isGuaranteedGermination", () => {
  const now = Date.now();
  const guaranteedTime = EVOLUTION_CONFIG.GUARANTEED_GERMINATION_TIME;

  it("should return false for plants dormant less than guaranteed time", () => {
    const dormantSince = now - guaranteedTime / 2; // Half the guaranteed time
    expect(isGuaranteedGermination(dormantSince, now)).toBe(false);
  });

  it("should return true for plants dormant exactly at guaranteed time", () => {
    const dormantSince = now - guaranteedTime;
    expect(isGuaranteedGermination(dormantSince, now)).toBe(true);
  });

  it("should return true for plants dormant longer than guaranteed time", () => {
    const dormantSince = now - guaranteedTime * 2; // Double the guaranteed time
    expect(isGuaranteedGermination(dormantSince, now)).toBe(true);
  });

  it("should accept custom guaranteed time", () => {
    const customGuaranteedTime = 60_000; // 1 minute
    const dormantSince = now - customGuaranteedTime;
    expect(isGuaranteedGermination(dormantSince, now, customGuaranteedTime)).toBe(true);
  });

  it("should handle edge case of dormantSince in the future", () => {
    const dormantSince = now + 1000; // Future
    expect(isGuaranteedGermination(dormantSince, now)).toBe(false);
  });
});

describe("getGerminationProbability", () => {
  const now = Date.now();
  const dormantSince = now - 60_000; // 1 minute ago

  it("should return base chance for plant with no modifiers", () => {
    const plant = createMockPlant("test", 500, 500);
    const plants: Plant[] = [];

    const probability = getGerminationProbability(plant, plants, dormantSince, now);
    expect(probability).toBe(EVOLUTION_CONFIG.GERMINATION_CHANCE);
  });

  it("should apply proximity bonus near observed plants", () => {
    const plant = createMockPlant("test", 100, 100);
    const plants = [createMockPlant("observed", 150, 150, { observed: true })];

    const probability = getGerminationProbability(plant, plants, dormantSince, now);
    const expected = EVOLUTION_CONFIG.GERMINATION_CHANCE * EVOLUTION_CONFIG.PROXIMITY_MULTIPLIER;
    expect(probability).toBeCloseTo(expected, 5);
  });

  it("should return 0 in clustered area", () => {
    const plant = createMockPlant("test", 100, 100);
    const plants = [
      createMockPlant("g1", 110, 110, { germinatedAt: new Date() }),
      createMockPlant("g2", 120, 100, { germinatedAt: new Date() }),
      createMockPlant("g3", 100, 120, { germinatedAt: new Date() }),
    ];

    const probability = getGerminationProbability(plant, plants, dormantSince, now);
    expect(probability).toBe(0);
  });

  it("should apply age multiplier for old plants", () => {
    const plant = createMockPlant("test", 500, 500);
    const plants: Plant[] = [];
    // Use a time just before guaranteed germination threshold to test age multiplier
    // AGE_WEIGHTING_PERIOD * 2.9 = 870,000 ms (just under 15 min guaranteed time)
    const oldDormantSince = now - EVOLUTION_CONFIG.AGE_WEIGHTING_PERIOD * 2.9;

    const probability = getGerminationProbability(plant, plants, oldDormantSince, now);
    // At 2.9x AGE_WEIGHTING_PERIOD, ageRatio = min(2.9 / 3, 1) ≈ 0.967
    // multiplier = 1.0 + 0.967 * 1.5 ≈ 2.45
    const expectedAgeMultiplier = 1.0 + (2.9 / 3) * (EVOLUTION_CONFIG.MAX_AGE_MULTIPLIER - 1.0);
    const expected = EVOLUTION_CONFIG.GERMINATION_CHANCE * expectedAgeMultiplier;
    expect(probability).toBeCloseTo(expected, 5);
  });

  it("should combine proximity and age bonuses", () => {
    const plant = createMockPlant("test", 100, 100);
    const plants = [createMockPlant("observed", 150, 150, { observed: true })];
    // Use a time just before guaranteed germination threshold to test age multiplier
    const oldDormantSince = now - EVOLUTION_CONFIG.AGE_WEIGHTING_PERIOD * 2.9;

    const probability = getGerminationProbability(plant, plants, oldDormantSince, now);
    const expectedAgeMultiplier = 1.0 + (2.9 / 3) * (EVOLUTION_CONFIG.MAX_AGE_MULTIPLIER - 1.0);
    const expected =
      EVOLUTION_CONFIG.GERMINATION_CHANCE *
      EVOLUTION_CONFIG.PROXIMITY_MULTIPLIER *
      expectedAgeMultiplier;
    expect(probability).toBeCloseTo(expected, 5);
  });

  it("should cap probability at 1.0", () => {
    const plant = createMockPlant("test", 100, 100);
    const plants = [createMockPlant("observed", 150, 150, { observed: true })];

    // Use very high multipliers via custom config
    const probability = getGerminationProbability(plant, plants, dormantSince, now, {
      GERMINATION_CHANCE: 0.8,
      PROXIMITY_MULTIPLIER: 5.0,
    });

    expect(probability).toBe(1.0);
  });

  it("should accept custom config", () => {
    const plant = createMockPlant("test", 500, 500);
    const plants: Plant[] = [];

    const probability = getGerminationProbability(plant, plants, dormantSince, now, {
      GERMINATION_CHANCE: 0.5,
    });

    expect(probability).toBe(0.5);
  });

  it("should return 1.0 for plants dormant longer than guaranteed time", () => {
    const plant = createMockPlant("test", 500, 500);
    const plants: Plant[] = [];
    const guaranteedDormantSince = now - EVOLUTION_CONFIG.GUARANTEED_GERMINATION_TIME;

    const probability = getGerminationProbability(plant, plants, guaranteedDormantSince, now);
    expect(probability).toBe(1.0);
  });

  it("should return 0 for guaranteed plants in clustered area", () => {
    const plant = createMockPlant("test", 100, 100);
    const plants = [
      createMockPlant("g1", 110, 110, { germinatedAt: new Date() }),
      createMockPlant("g2", 120, 100, { germinatedAt: new Date() }),
      createMockPlant("g3", 100, 120, { germinatedAt: new Date() }),
    ];
    const guaranteedDormantSince = now - EVOLUTION_CONFIG.GUARANTEED_GERMINATION_TIME;

    // Even guaranteed germination should be blocked by clustering
    const probability = getGerminationProbability(plant, plants, guaranteedDormantSince, now);
    expect(probability).toBe(0);
  });

  it("should accept custom guaranteed germination time", () => {
    const plant = createMockPlant("test", 500, 500);
    const plants: Plant[] = [];
    const customGuaranteedTime = 60_000; // 1 minute
    const customDormantSince = now - customGuaranteedTime;

    const probability = getGerminationProbability(plant, plants, customDormantSince, now, {
      GUARANTEED_GERMINATION_TIME: customGuaranteedTime,
    });
    expect(probability).toBe(1.0);
  });
});

describe("isEligibleForGermination", () => {
  const now = Date.now();
  const minDormancy = EVOLUTION_CONFIG.MIN_DORMANCY;

  it("should return true for valid dormant plant", () => {
    const plant = createMockPlant("test", 100, 100);
    const dormantSince = now - minDormancy - 1000;

    expect(isEligibleForGermination(plant, dormantSince, now)).toBe(true);
  });

  it("should return false for already germinated plant", () => {
    const plant = createMockPlant("test", 100, 100, { germinatedAt: new Date() });
    const dormantSince = now - minDormancy - 1000;

    expect(isEligibleForGermination(plant, dormantSince, now)).toBe(false);
  });

  it("should return false for already observed plant", () => {
    const plant = createMockPlant("test", 100, 100, { observed: true });
    const dormantSince = now - minDormancy - 1000;

    expect(isEligibleForGermination(plant, dormantSince, now)).toBe(false);
  });

  it("should return false when dormantSince is undefined", () => {
    const plant = createMockPlant("test", 100, 100);

    expect(isEligibleForGermination(plant, undefined, now)).toBe(false);
  });

  it("should return false when plant has not been dormant long enough", () => {
    const plant = createMockPlant("test", 100, 100);
    const dormantSince = now - minDormancy / 2; // Half the required time

    expect(isEligibleForGermination(plant, dormantSince, now)).toBe(false);
  });

  it("should return true exactly at minimum dormancy", () => {
    const plant = createMockPlant("test", 100, 100);
    const dormantSince = now - minDormancy;

    expect(isEligibleForGermination(plant, dormantSince, now)).toBe(true);
  });

  it("should accept custom minimum dormancy", () => {
    const plant = createMockPlant("test", 100, 100);
    const customMinDormancy = 10_000;
    const dormantSince = now - customMinDormancy;

    expect(isEligibleForGermination(plant, dormantSince, now, customMinDormancy)).toBe(true);
  });
});
