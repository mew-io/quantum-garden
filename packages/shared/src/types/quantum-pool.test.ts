/**
 * Quantum Pool Selection Tests
 *
 * Tests the selectFromPool function to verify:
 * - Deterministic selection (same plant ID = same result)
 * - Even distribution across the pool
 * - Proper handling of edge cases
 */

import { describe, it, expect } from "vitest";
import { selectFromPool, type QuantumPoolResult } from "./quantum-pool";

/**
 * Create a mock pool result for testing.
 */
function createMockResult(index: number): QuantumPoolResult {
  return {
    index,
    measurements: [0, 1, 0, 1, 1],
    counts: { "00000": 50, "11111": 50 },
    probabilities: { "00000": 0.5, "11111": 0.5 },
    traits: {
      glyphPattern: [[1]],
      colorPalette: ["#FF0000", "#00FF00", "#0000FF"],
      growthRate: 1.0 + index * 0.01,
      opacity: 0.9,
    },
    executionMode: "simulator",
    timestamp: new Date().toISOString(),
    shots: 100,
    errorMitigationDisabled: true,
  };
}

/**
 * Create a mock pool with the specified size.
 */
function createMockPool(size: number): QuantumPoolResult[] {
  return Array.from({ length: size }, (_, i) => createMockResult(i));
}

describe("selectFromPool", () => {
  describe("deterministic selection", () => {
    it("should return the same result for the same plant ID", () => {
      const pool = createMockPool(100);
      const plantId = "plant-abc-123";

      const result1 = selectFromPool(pool, plantId);
      const result2 = selectFromPool(pool, plantId);

      expect(result1.index).toBe(result2.index);
      expect(result1.traits.growthRate).toBe(result2.traits.growthRate);
    });

    it("should be deterministic across multiple calls", () => {
      const pool = createMockPool(100);
      const plantId = "test-plant-xyz";

      const results = Array.from({ length: 10 }, () => selectFromPool(pool, plantId));

      // All results should be identical
      const firstIndex = results[0]!.index;
      expect(results.every((r) => r.index === firstIndex)).toBe(true);
    });

    it("should return different results for different plant IDs", () => {
      const pool = createMockPool(100);

      const result1 = selectFromPool(pool, "plant-1");
      const result2 = selectFromPool(pool, "plant-2");
      const result3 = selectFromPool(pool, "plant-3");

      // With 100 pool entries, different IDs should likely get different results
      // (collision possible but unlikely for small sample)
      const indices = [result1.index, result2.index, result3.index];
      const uniqueIndices = new Set(indices);

      // At least 2 of 3 should be different
      expect(uniqueIndices.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe("distribution", () => {
    it("should distribute results across the entire pool", () => {
      const poolSize = 100;
      const pool = createMockPool(poolSize);
      const sampleSize = 1000;

      // Generate many plant IDs and check distribution
      const selectedIndices = new Map<number, number>();

      for (let i = 0; i < sampleSize; i++) {
        const plantId = `plant-${i}-${Date.now()}-${Math.random()}`;
        const result = selectFromPool(pool, plantId);
        const count = selectedIndices.get(result.index) ?? 0;
        selectedIndices.set(result.index, count + 1);
      }

      // Should hit at least 50% of the pool with 1000 samples
      expect(selectedIndices.size).toBeGreaterThan(poolSize * 0.5);

      // No single index should have more than 5x the expected frequency
      // Expected frequency = sampleSize / poolSize = 10
      const maxFrequency = Math.max(...selectedIndices.values());
      expect(maxFrequency).toBeLessThan(50); // 5x expected
    });

    it("should handle small pools correctly", () => {
      const pool = createMockPool(5);

      // With a small pool, all indices should be reachable
      const selectedIndices = new Set<number>();

      for (let i = 0; i < 100; i++) {
        const plantId = `small-pool-test-${i}`;
        const result = selectFromPool(pool, plantId);
        selectedIndices.add(result.index);
      }

      // All 5 indices should be hit with 100 samples
      expect(selectedIndices.size).toBe(5);
    });
  });

  describe("edge cases", () => {
    it("should handle single-element pool", () => {
      const pool = createMockPool(1);

      const result1 = selectFromPool(pool, "any-plant-id");
      const result2 = selectFromPool(pool, "different-plant-id");

      expect(result1.index).toBe(0);
      expect(result2.index).toBe(0);
    });

    it("should handle empty string plant ID", () => {
      const pool = createMockPool(100);

      const result = selectFromPool(pool, "");

      expect(result).toBeDefined();
      expect(result.index).toBeGreaterThanOrEqual(0);
      expect(result.index).toBeLessThan(100);
    });

    it("should handle very long plant IDs", () => {
      const pool = createMockPool(100);
      const longId = "a".repeat(10000);

      const result = selectFromPool(pool, longId);

      expect(result).toBeDefined();
      expect(result.index).toBeGreaterThanOrEqual(0);
      expect(result.index).toBeLessThan(100);
    });

    it("should handle special characters in plant ID", () => {
      const pool = createMockPool(100);

      const result = selectFromPool(pool, "plant-with-special-chars-!@#$%^&*()");

      expect(result).toBeDefined();
      expect(result.index).toBeGreaterThanOrEqual(0);
      expect(result.index).toBeLessThan(100);
    });

    it("should handle unicode characters in plant ID", () => {
      const pool = createMockPool(100);

      const result = selectFromPool(pool, "plant-with-emoji-🌱🌺🌳");

      expect(result).toBeDefined();
      expect(result.index).toBeGreaterThanOrEqual(0);
      expect(result.index).toBeLessThan(100);
    });
  });

  describe("CUID-style IDs", () => {
    it("should work with CUID-format plant IDs", () => {
      const pool = createMockPool(100);

      // CUID format: starts with 'c', followed by timestamp + random
      const cuidIds = [
        "cmkyau00g00039k7ddxs6mifu",
        "cmkyau04p000e9k7dmjh0njjn",
        "cmkyau04r000g9k7db1ur0qd1",
        "cjld2cjxh0000qzrmn831i7rn",
        "ckpzpzqhx0000gzrm1234abcd",
      ];

      const results = cuidIds.map((id) => selectFromPool(pool, id));

      // All results should be valid
      results.forEach((result, i) => {
        expect(result).toBeDefined();
        expect(result.index).toBeGreaterThanOrEqual(0);
        expect(result.index).toBeLessThan(100);

        // Same ID should give same result
        const repeat = selectFromPool(pool, cuidIds[i]!);
        expect(repeat.index).toBe(result.index);
      });

      // Different CUIDs should likely give different results
      const uniqueIndices = new Set(results.map((r) => r.index));
      expect(uniqueIndices.size).toBeGreaterThanOrEqual(3);
    });
  });
});
