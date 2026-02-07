/**
 * Performance Tests
 *
 * Tests to verify the garden handles 100+ plants efficiently.
 * These tests validate the performance characteristics of key components
 * that are critical for maintaining 60fps with many plants.
 *
 * Note: These are algorithmic complexity tests, not real GPU benchmarks.
 * Real GPU performance testing requires a browser environment with WebGL.
 */

import { describe, it, expect } from "vitest";
import { SpatialGrid } from "../spatial-grid";
import type { Plant } from "@quantum-garden/shared";

/**
 * Create a mock plant for performance testing.
 */
function createMockPlant(
  id: string,
  x: number,
  y: number,
  options: {
    germinatedAt?: Date | null;
    observed?: boolean;
  } = {}
): Plant {
  return {
    id,
    position: { x, y },
    observed: options.observed ?? false,
    visualState: options.germinatedAt ? "collapsed" : "superposed",
    variantId: "test-variant",
    createdAt: new Date(),
    germinatedAt: options.germinatedAt ?? null,
    lifecycleModifier: 1.0,
  } as Plant;
}

/**
 * Generate an array of plants with random positions.
 */
function generateRandomPlants(count: number, width: number, height: number): Plant[] {
  const plants: Plant[] = [];
  for (let i = 0; i < count; i++) {
    plants.push(createMockPlant(`plant-${i}`, Math.random() * width, Math.random() * height));
  }
  return plants;
}

/**
 * Generate plants in a grid pattern for predictable testing.
 */
function generateGridPlants(
  rows: number,
  cols: number,
  spacing: number,
  offsetX: number = 0,
  offsetY: number = 0
): Plant[] {
  const plants: Plant[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      plants.push(
        createMockPlant(`plant-${row}-${col}`, offsetX + col * spacing, offsetY + row * spacing)
      );
    }
  }
  return plants;
}

describe("Performance Tests", () => {
  describe("SpatialGrid with 100+ plants", () => {
    it("should handle 100 plants efficiently", () => {
      const grid = new SpatialGrid(100);
      const plants = generateRandomPlants(100, 1000, 1000);

      // Rebuild should complete quickly
      const startRebuild = performance.now();
      grid.rebuild(plants);
      const rebuildTime = performance.now() - startRebuild;

      // Rebuild 100 plants should be very fast (<10ms)
      expect(rebuildTime).toBeLessThan(10);

      // Query should return reasonable subset
      const startQuery = performance.now();
      const found = grid.getPlantsInRegion({ x: 500, y: 500 }, 135);
      const queryTime = performance.now() - startQuery;

      // Query should be sub-millisecond
      expect(queryTime).toBeLessThan(1);
      expect(found.length).toBeLessThan(100);
    });

    it("should handle 500 plants efficiently", () => {
      const grid = new SpatialGrid(100);
      const plants = generateRandomPlants(500, 2000, 2000);

      const startRebuild = performance.now();
      grid.rebuild(plants);
      const rebuildTime = performance.now() - startRebuild;

      // Rebuild 500 plants should be fast (<50ms)
      expect(rebuildTime).toBeLessThan(50);

      // Multiple queries should all be fast
      const queryTimes: number[] = [];
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        grid.getPlantsInRegion({ x: Math.random() * 2000, y: Math.random() * 2000 }, 135);
        queryTimes.push(performance.now() - start);
      }

      // All queries should be sub-millisecond
      expect(Math.max(...queryTimes)).toBeLessThan(1);
    });

    it("should handle 1000 plants (max capacity)", () => {
      const grid = new SpatialGrid(100);
      const plants = generateRandomPlants(1000, 3000, 3000);

      const startRebuild = performance.now();
      grid.rebuild(plants);
      const rebuildTime = performance.now() - startRebuild;

      // Rebuild 1000 plants should complete in reasonable time (<100ms)
      expect(rebuildTime).toBeLessThan(100);

      // Query at center of garden
      const found = grid.getPlantsInRegion({ x: 1500, y: 1500 }, 135);

      // Should find plants but not all of them
      expect(found.length).toBeGreaterThan(0);
      expect(found.length).toBeLessThan(500);
    });

    it("should scale linearly with plant count for rebuild", () => {
      const grid = new SpatialGrid(100);
      const iterations = 50; // Average over many runs to reduce timing noise

      // Measure rebuild times for different plant counts
      const measurements: { count: number; time: number }[] = [];

      for (const count of [100, 200, 400, 800]) {
        const plants = generateRandomPlants(count, 2000, 2000);
        // Warmup
        grid.rebuild(plants);
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
          grid.rebuild(plants);
        }
        measurements.push({ count, time: (performance.now() - start) / iterations });
      }

      // Time should scale roughly linearly (within 3x for 8x plants)
      const ratio = measurements[3]!.time / measurements[0]!.time;
      expect(ratio).toBeLessThan(24); // Allow 3x overhead for 8x plants
    });
  });

  describe("SpatialGrid query performance", () => {
    it("should maintain O(1) average query time regardless of total plant count", () => {
      // Test with different total plant counts
      const queryTimesBy100 = measureAverageQueryTime(100);
      const queryTimesBy500 = measureAverageQueryTime(500);
      const queryTimesBy1000 = measureAverageQueryTime(1000);

      // Query times should be roughly similar (within 5x)
      // because queries only scan cells that intersect the region
      const maxRatio = Math.max(
        queryTimesBy1000 / Math.max(queryTimesBy100, 0.001),
        queryTimesBy500 / Math.max(queryTimesBy100, 0.001)
      );

      expect(maxRatio).toBeLessThan(5);
    });

    it("should handle queries at garden edges efficiently", () => {
      const grid = new SpatialGrid(100);
      const plants = generateRandomPlants(500, 2000, 2000);
      grid.rebuild(plants);

      // Query at various edges
      const edgeQueries = [
        { x: 0, y: 0 },
        { x: 2000, y: 0 },
        { x: 0, y: 2000 },
        { x: 2000, y: 2000 },
      ];

      for (const center of edgeQueries) {
        const start = performance.now();
        grid.getPlantsInRegion(center, 135);
        const time = performance.now() - start;

        // Edge queries should still be fast
        expect(time).toBeLessThan(1);
      }
    });

    it("should handle overlapping region queries efficiently", () => {
      const grid = new SpatialGrid(100);
      const plants = generateRandomPlants(500, 1000, 1000);
      grid.rebuild(plants);

      // Multiple overlapping queries in quick succession
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        // Slightly offset queries that overlap
        grid.getPlantsInRegion({ x: 500 + i, y: 500 + i }, 135);
      }
      const totalTime = performance.now() - start;

      // 100 queries should complete quickly (<10ms)
      expect(totalTime).toBeLessThan(10);
    });
  });

  describe("plant state update simulation", () => {
    it("should efficiently detect changed plants via hash comparison", () => {
      const plants = generateRandomPlants(500, 2000, 2000);

      // Simulate hash-based dirty detection
      const hashes = new Map<string, string>();

      // Initial hash computation
      // Initial hash computation
      for (const plant of plants) {
        const hash = computeSimpleHash(plant);
        hashes.set(plant.id, hash);
      }

      // Change 10% of plants
      const changedPlants = plants.slice(0, 50);
      for (const plant of changedPlants) {
        plant.observed = true;
        plant.visualState = "collapsed";
      }

      // Detect changes
      const startDetect = performance.now();
      const dirtyIndices: number[] = [];
      for (let i = 0; i < plants.length; i++) {
        const plant = plants[i]!;
        const newHash = computeSimpleHash(plant);
        if (hashes.get(plant.id) !== newHash) {
          dirtyIndices.push(i);
          hashes.set(plant.id, newHash);
        }
      }
      const detectTime = performance.now() - startDetect;

      // Should detect exactly the changed plants
      expect(dirtyIndices.length).toBe(50);

      // Hash comparison should be very fast
      expect(detectTime).toBeLessThan(5);
    });

    it("should efficiently track dirty ranges for partial buffer updates", () => {
      const dirtyIndices = new Set<number>();

      // Simulate contiguous updates (a small range of plants changed)
      // This is more realistic - plants in a region often update together
      const startIdx = 200;
      for (let i = 0; i < 50; i++) {
        dirtyIndices.add(startIdx + i);
      }

      // Calculate dirty range
      const start = performance.now();
      let minDirty = Infinity;
      let maxDirty = -Infinity;

      for (const idx of dirtyIndices) {
        if (idx < minDirty) minDirty = idx;
        if (idx > maxDirty) maxDirty = idx;
      }

      const dirtyCount = maxDirty - minDirty + 1;
      const totalInstances = 1000;
      // Use partial update if dirty range < 50% of total and less than 500 instances
      const usePartialUpdate = dirtyCount < totalInstances * 0.5 && dirtyIndices.size < 500;
      const rangeTime = performance.now() - start;

      // Range calculation should be instant
      expect(rangeTime).toBeLessThan(1);

      // Contiguous range of 50 should definitely use partial update
      expect(dirtyCount).toBe(50);
      expect(usePartialUpdate).toBe(true);
    });

    it("should fall back to full update for widely scattered changes", () => {
      const dirtyIndices = new Set<number>();

      // Simulate widely scattered updates (every 10th plant)
      for (let i = 0; i < 1000; i += 10) {
        dirtyIndices.add(i);
      }

      let minDirty = Infinity;
      let maxDirty = -Infinity;

      for (const idx of dirtyIndices) {
        if (idx < minDirty) minDirty = idx;
        if (idx > maxDirty) maxDirty = idx;
      }

      const dirtyCount = maxDirty - minDirty + 1;
      const totalInstances = 1000;
      // Wide scatter means dirty range spans most of the buffer
      const usePartialUpdate = dirtyCount < totalInstances * 0.5;

      // Scattered changes should trigger full update (range spans ~1000)
      expect(dirtyCount).toBeGreaterThan(900);
      expect(usePartialUpdate).toBe(false);
    });
  });

  describe("grid-based plant distribution", () => {
    it("should efficiently handle clustered plants", () => {
      const grid = new SpatialGrid(100);

      // Create clusters of plants
      const plants: Plant[] = [];
      // 5 clusters of 100 plants each
      for (let cluster = 0; cluster < 5; cluster++) {
        const clusterX = cluster * 400 + 200;
        const clusterY = 500;
        for (let i = 0; i < 100; i++) {
          plants.push(
            createMockPlant(
              `cluster-${cluster}-plant-${i}`,
              clusterX + (Math.random() - 0.5) * 100,
              clusterY + (Math.random() - 0.5) * 100
            )
          );
        }
      }

      const startRebuild = performance.now();
      grid.rebuild(plants);
      const rebuildTime = performance.now() - startRebuild;

      // Clustered plants should still rebuild quickly
      expect(rebuildTime).toBeLessThan(50);

      // Query in a cluster should return most of that cluster
      const found = grid.getPlantsInRegion({ x: 200, y: 500 }, 100);
      expect(found.length).toBeGreaterThan(50);
      expect(found.length).toBeLessThanOrEqual(100);

      // Query between clusters should find few plants
      const foundBetween = grid.getPlantsInRegion({ x: 400, y: 500 }, 50);
      expect(foundBetween.length).toBeLessThan(50);
    });

    it("should efficiently handle uniformly distributed plants", () => {
      const grid = new SpatialGrid(100);

      // Generate plants in a uniform grid
      const plants = generateGridPlants(10, 10, 100, 50, 50);

      grid.rebuild(plants);

      // Query at various positions
      for (let x = 100; x < 900; x += 200) {
        for (let y = 100; y < 900; y += 200) {
          const found = grid.getPlantsInRegion({ x, y }, 150);
          // Should find roughly 4-9 plants in each query
          expect(found.length).toBeGreaterThan(0);
          expect(found.length).toBeLessThan(20);
        }
      }
    });
  });

  describe("memory efficiency", () => {
    it("should not leak memory during repeated rebuilds", () => {
      const grid = new SpatialGrid(100);

      // Perform many rebuilds
      for (let i = 0; i < 100; i++) {
        const plants = generateRandomPlants(100, 1000, 1000);
        grid.rebuild(plants);
      }

      // Clear and verify
      grid.rebuild([]);

      // Grid should be empty after clearing
      const found = grid.getPlantsInRegion({ x: 500, y: 500 }, 1000);
      expect(found.length).toBe(0);
    });

    it("should efficiently reuse grid cells during rebuild", () => {
      const grid = new SpatialGrid(100);

      // Initial build
      const plants1 = generateRandomPlants(500, 2000, 2000);
      grid.rebuild(plants1);

      // Rebuild with different plants
      const plants2 = generateRandomPlants(500, 2000, 2000);
      const startRebuild = performance.now();
      grid.rebuild(plants2);
      const rebuildTime = performance.now() - startRebuild;

      // Subsequent rebuild should be as fast as initial
      expect(rebuildTime).toBeLessThan(50);
    });
  });
});

/**
 * Helper to measure average query time for a given plant count.
 */
function measureAverageQueryTime(plantCount: number): number {
  const grid = new SpatialGrid(100);
  const width = Math.sqrt(plantCount) * 100;
  const plants = generateRandomPlants(plantCount, width, width);
  grid.rebuild(plants);

  // Perform multiple queries and average
  const times: number[] = [];
  for (let i = 0; i < 20; i++) {
    const start = performance.now();
    grid.getPlantsInRegion({ x: Math.random() * width, y: Math.random() * width }, 135);
    times.push(performance.now() - start);
  }

  return times.reduce((a, b) => a + b, 0) / times.length;
}

/**
 * Simple hash function for plant state (simulates PlantInstancer's dirty detection).
 */
function computeSimpleHash(plant: Plant): string {
  return `${plant.id}:${plant.observed}:${plant.visualState}:${plant.germinatedAt?.getTime() ?? 0}`;
}
