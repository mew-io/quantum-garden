/**
 * Spatial Grid Tests
 *
 * Tests the spatial indexing system used for efficient plant lookups
 * in the observation system.
 */

import { describe, it, expect } from "vitest";
import { SpatialGrid } from "../spatial-grid";
import type { Plant } from "@quantum-garden/shared";

/**
 * Create a mock plant for testing.
 */
function createMockPlant(id: string, x: number, y: number): Plant {
  return {
    id,
    position: { x, y },
    observed: false,
    visualState: "superposed",
    variantId: "test-variant",
    createdAt: new Date(),
    lifecycleModifier: 1.0,
  } as Plant;
}

describe("SpatialGrid", () => {
  describe("basic operations", () => {
    it("should create an empty grid", () => {
      const grid = new SpatialGrid(100);

      expect(grid.getCellSize()).toBe(100);
      expect(grid.getCellCount()).toBe(0);
      expect(grid.getPlantCount()).toBe(0);
    });

    it("should add plants and index them", () => {
      const grid = new SpatialGrid(100);
      const plants = [
        createMockPlant("p1", 50, 50),
        createMockPlant("p2", 150, 50),
        createMockPlant("p3", 50, 150),
      ];

      grid.rebuild(plants);

      expect(grid.getPlantCount()).toBe(3);
      // Plants are in different cells (100px each)
      expect(grid.getCellCount()).toBe(3);
    });

    it("should place plants in same cell when close together", () => {
      const grid = new SpatialGrid(100);
      const plants = [
        createMockPlant("p1", 10, 10),
        createMockPlant("p2", 20, 20),
        createMockPlant("p3", 30, 30),
      ];

      grid.rebuild(plants);

      expect(grid.getPlantCount()).toBe(3);
      // All plants in cell (0,0) since they're all under 100
      expect(grid.getCellCount()).toBe(1);
    });
  });

  describe("region queries", () => {
    it("should find plants in a circular region", () => {
      const grid = new SpatialGrid(100);
      const plants = [
        createMockPlant("center", 500, 500),
        createMockPlant("near", 550, 550),
        createMockPlant("far", 800, 800),
      ];

      grid.rebuild(plants);

      // Query a region centered at 500,500 with radius 100
      const found = grid.getPlantsInRegion({ x: 500, y: 500 }, 100);

      // Should find center and near plants
      expect(found.length).toBe(2);
      const foundIds = found.map((p) => p.id).sort();
      expect(foundIds).toEqual(["center", "near"]);
    });

    it("should return empty array when no plants in region", () => {
      const grid = new SpatialGrid(100);
      const plants = [createMockPlant("p1", 100, 100)];

      grid.rebuild(plants);

      // Query a region far from any plants
      const found = grid.getPlantsInRegion({ x: 1000, y: 1000 }, 50);

      expect(found.length).toBe(0);
    });

    it("should handle region spanning multiple cells", () => {
      const grid = new SpatialGrid(100);
      // Plants spread across 4 cells
      const plants = [
        createMockPlant("p1", 90, 90), // Cell (0,0)
        createMockPlant("p2", 110, 90), // Cell (1,0)
        createMockPlant("p3", 90, 110), // Cell (0,1)
        createMockPlant("p4", 110, 110), // Cell (1,1)
      ];

      grid.rebuild(plants);

      // Region centered at cell boundary should find all 4
      const found = grid.getPlantsInRegion({ x: 100, y: 100 }, 50);

      expect(found.length).toBe(4);
    });

    it("should not return duplicate plants", () => {
      const grid = new SpatialGrid(50);
      const plants = [createMockPlant("single", 100, 100)];

      grid.rebuild(plants);

      // Large region that covers multiple cells
      const found = grid.getPlantsInRegion({ x: 100, y: 100 }, 200);

      // Should only return the plant once
      expect(found.length).toBe(1);
      expect(found[0]!.id).toBe("single");
    });
  });

  describe("performance characteristics", () => {
    it("should efficiently query with many plants", () => {
      const grid = new SpatialGrid(100);

      // Create 1000 plants spread across a 1000x1000 area
      const plants: Plant[] = [];
      for (let i = 0; i < 1000; i++) {
        plants.push(createMockPlant(`p${i}`, Math.random() * 1000, Math.random() * 1000));
      }

      grid.rebuild(plants);

      // Query should return fewer plants than total
      const found = grid.getPlantsInRegion({ x: 500, y: 500 }, 135); // Typical region radius

      // Should find roughly 1000 * (pi * 135^2) / (1000 * 1000) ≈ 57 plants
      // With cell overhead, might be slightly more
      expect(found.length).toBeLessThan(200);
      expect(found.length).toBeGreaterThan(0);
    });

    it("should have consistent query results", () => {
      const grid = new SpatialGrid(100);
      const plants = [
        createMockPlant("p1", 100, 100),
        createMockPlant("p2", 200, 200),
        createMockPlant("p3", 300, 300),
      ];

      grid.rebuild(plants);

      // Multiple queries should return same results
      const result1 = grid.getPlantsInRegion({ x: 150, y: 150 }, 100);
      const result2 = grid.getPlantsInRegion({ x: 150, y: 150 }, 100);

      expect(result1.length).toBe(result2.length);
      expect(result1.map((p) => p.id).sort()).toEqual(result2.map((p) => p.id).sort());
    });
  });

  describe("rebuild behavior", () => {
    it("should clear old data when rebuilding", () => {
      const grid = new SpatialGrid(100);

      // Initial plants
      grid.rebuild([createMockPlant("old1", 100, 100), createMockPlant("old2", 200, 200)]);

      expect(grid.getPlantCount()).toBe(2);

      // Rebuild with new plants
      grid.rebuild([createMockPlant("new1", 300, 300)]);

      expect(grid.getPlantCount()).toBe(1);

      // Old plants should not be found
      const found = grid.getPlantsInRegion({ x: 100, y: 100 }, 50);
      expect(found.length).toBe(0);

      // New plant should be found
      const foundNew = grid.getPlantsInRegion({ x: 300, y: 300 }, 50);
      expect(foundNew.length).toBe(1);
      expect(foundNew[0]!.id).toBe("new1");
    });

    it("should handle empty rebuild", () => {
      const grid = new SpatialGrid(100);

      grid.rebuild([createMockPlant("p1", 100, 100)]);
      expect(grid.getPlantCount()).toBe(1);

      grid.rebuild([]);
      expect(grid.getPlantCount()).toBe(0);
      expect(grid.getCellCount()).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle plants at origin (0,0)", () => {
      const grid = new SpatialGrid(100);
      const plants = [createMockPlant("origin", 0, 0)];

      grid.rebuild(plants);

      const found = grid.getPlantsInRegion({ x: 0, y: 0 }, 50);
      expect(found.length).toBe(1);
    });

    it("should handle negative coordinates", () => {
      const grid = new SpatialGrid(100);
      const plants = [createMockPlant("negative", -50, -50)];

      grid.rebuild(plants);

      const found = grid.getPlantsInRegion({ x: -50, y: -50 }, 50);
      expect(found.length).toBe(1);
    });

    it("should handle very large coordinates", () => {
      const grid = new SpatialGrid(100);
      const plants = [createMockPlant("far", 10000, 10000)];

      grid.rebuild(plants);

      const found = grid.getPlantsInRegion({ x: 10000, y: 10000 }, 50);
      expect(found.length).toBe(1);
    });

    it("should handle very small cell size", () => {
      const grid = new SpatialGrid(10);
      const plants = [
        createMockPlant("p1", 5, 5),
        createMockPlant("p2", 15, 15),
        createMockPlant("p3", 25, 25),
      ];

      grid.rebuild(plants);

      // Each plant in its own cell
      expect(grid.getCellCount()).toBe(3);

      // Region should still find correct plants
      const found = grid.getPlantsInRegion({ x: 15, y: 15 }, 15);
      expect(found.length).toBe(3);
    });

    it("should handle zero-radius region query", () => {
      const grid = new SpatialGrid(100);
      const plants = [createMockPlant("p1", 50, 50)];

      grid.rebuild(plants);

      // Zero radius should only find plant at exact cell
      const found = grid.getPlantsInRegion({ x: 50, y: 50 }, 0);
      expect(found.length).toBe(1);
    });
  });
});
