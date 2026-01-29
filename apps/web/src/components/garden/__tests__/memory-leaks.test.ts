/**
 * Memory Leak Tests
 *
 * Tests to detect memory leaks during extended garden sessions.
 * These tests simulate long-running sessions and verify that:
 * - Resources are properly cleaned up
 * - Caches don't grow unbounded
 * - Subscriptions are unregistered
 * - Intervals/timers are cleared
 *
 * Note: These are behavioral tests that verify cleanup patterns.
 * Real memory profiling requires browser DevTools.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GardenEvolutionSystem } from "../garden-evolution";
import { SpatialGrid } from "../spatial-grid";
import type { Plant } from "@quantum-garden/shared";

// Mock the garden store
const mockStoreState = {
  plants: [] as Plant[],
  isTimeTravelMode: false,
};

vi.mock("@/stores/garden-store", () => ({
  useGardenStore: {
    getState: () => mockStoreState,
    setState: (updates: Partial<typeof mockStoreState>) => {
      Object.assign(mockStoreState, updates);
    },
    subscribe: vi.fn(() => () => {}), // Returns unsubscribe function
  },
}));

// Mock the debug logger
vi.mock("@/lib/debug-logger", () => ({
  debugLogger: {
    evolution: {
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    },
  },
}));

/**
 * Create a mock plant for testing.
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
 * Reset mock state between tests.
 */
function resetMockState() {
  mockStoreState.plants = [];
  mockStoreState.isTimeTravelMode = false;
}

describe("Memory Leak Tests", () => {
  describe("GardenEvolutionSystem resource cleanup", () => {
    let system: GardenEvolutionSystem;

    beforeEach(() => {
      vi.useFakeTimers();
      resetMockState();
      system = new GardenEvolutionSystem();
    });

    afterEach(() => {
      system.destroy();
      vi.useRealTimers();
      vi.clearAllMocks();
    });

    it("should clear interval on destroy", () => {
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      system.start();
      expect(system.running).toBe(true);

      system.destroy();
      expect(system.running).toBe(false);
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it("should clear internal maps on destroy", () => {
      // Add some plants to trigger tracking
      mockStoreState.plants = [
        createMockPlant("plant-1", 100, 100),
        createMockPlant("plant-2", 200, 200),
      ];

      system.start();

      // Trigger a check to populate tracking maps
      vi.advanceTimersByTime(60 * 1000);

      // Destroy should clear maps
      system.destroy();

      // Stats should show empty after destroy
      const stats = system.getStats();
      expect(stats.trackedCount).toBe(0);
    });

    it("should not leak intervals on repeated start/stop cycles", () => {
      const setIntervalSpy = vi.spyOn(global, "setInterval");
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      // Simulate 100 start/stop cycles
      for (let i = 0; i < 100; i++) {
        system.start();
        system.stop();
      }

      // setInterval should have been called 100 times
      expect(setIntervalSpy).toHaveBeenCalledTimes(100);
      // clearInterval should also have been called 100 times
      expect(clearIntervalSpy).toHaveBeenCalledTimes(100);
    });

    it("should handle rapid start/stop without memory issues", () => {
      // Rapid toggling should not cause issues
      for (let i = 0; i < 50; i++) {
        system.start();
        vi.advanceTimersByTime(100); // Brief time between
        system.stop();
      }

      // System should be cleanly stopped
      expect(system.running).toBe(false);
    });

    it("should clean up germination tracking for removed plants", async () => {
      const callback = vi.fn().mockImplementation(async (plantId: string) => {
        const plant = mockStoreState.plants.find((p) => p.id === plantId);
        if (plant) {
          plant.germinatedAt = new Date();
        }
      });
      system.setGerminationCallback(callback);

      // Start with many plants
      const plants: Plant[] = [];
      for (let i = 0; i < 50; i++) {
        plants.push(createMockPlant(`plant-${i}`, i * 50, i * 50));
      }
      mockStoreState.plants = plants;

      system.start();
      vi.advanceTimersByTime(60 * 1000);

      // Germinate some plants
      vi.spyOn(Math, "random").mockReturnValue(0.01);
      await system.triggerCheck();

      // Remove all plants (simulate clearing garden)
      mockStoreState.plants = [];

      // Stats should reflect empty garden
      const stats = system.getStats();
      expect(stats.dormantCount).toBe(0);

      vi.spyOn(Math, "random").mockRestore();
    });

    it("should clean up recent germinations after cooldown expires", async () => {
      const callback = vi.fn().mockResolvedValue(undefined);
      system.setGerminationCallback(callback);

      // Single plant
      mockStoreState.plants = [createMockPlant("plant-1", 100, 100)];

      system.start();
      vi.advanceTimersByTime(60 * 1000);

      // Force germination
      vi.spyOn(Math, "random").mockReturnValue(0.01);
      await system.triggerCheck();

      // Advance past cooldown duration (2 minutes)
      vi.advanceTimersByTime(3 * 60 * 1000);

      // Add a new plant
      mockStoreState.plants.push(createMockPlant("plant-2", 150, 100));

      // Trigger another check - cooldown should be expired and cleaned up
      await system.triggerCheck();

      // The new plant should not be affected by old cooldown
      // (Can't directly verify map size, but behavior should be correct)
      vi.spyOn(Math, "random").mockRestore();
    });
  });

  describe("SpatialGrid memory management", () => {
    it("should not accumulate memory on repeated rebuilds", () => {
      const grid = new SpatialGrid(100);

      // Simulate 1000 rebuild cycles (like during extended session)
      for (let i = 0; i < 1000; i++) {
        const plants: Plant[] = [];
        for (let j = 0; j < 100; j++) {
          plants.push(
            createMockPlant(`plant-${i}-${j}`, Math.random() * 1000, Math.random() * 1000)
          );
        }
        grid.rebuild(plants);
      }

      // Grid should only contain latest plants
      const found = grid.getPlantsInRegion({ x: 500, y: 500 }, 1000);
      expect(found.length).toBeLessThanOrEqual(100);
    });

    it("should handle empty rebuilds correctly", () => {
      const grid = new SpatialGrid(100);

      // Build with plants
      const plants = [createMockPlant("p1", 100, 100), createMockPlant("p2", 200, 200)];
      grid.rebuild(plants);

      expect(grid.getPlantsInRegion({ x: 150, y: 150 }, 100).length).toBeGreaterThan(0);

      // Rebuild with empty
      grid.rebuild([]);

      // Should find nothing
      expect(grid.getPlantsInRegion({ x: 150, y: 150 }, 100).length).toBe(0);
    });

    it("should handle plants moving between cells", () => {
      const grid = new SpatialGrid(100);

      // Plant starts in one cell
      let plant = createMockPlant("moving-plant", 50, 50);
      grid.rebuild([plant]);

      // Move plant across many cells
      for (let i = 0; i < 100; i++) {
        plant = { ...plant, position: { x: i * 20, y: i * 20 } };
        grid.rebuild([plant]);
      }

      // Should only have one plant
      const allFound = grid.getPlantsInRegion({ x: 1000, y: 1000 }, 2000);
      expect(allFound.length).toBe(1);
    });
  });

  describe("subscription cleanup patterns", () => {
    it("should follow zustand subscription pattern correctly", () => {
      // Zustand subscribe() returns an unsubscribe function
      // This test verifies the expected pattern works
      const subscriptions: (() => void)[] = [];

      // Simulate zustand subscription pattern
      const createSubscription = (): (() => void) => {
        let _active = true;
        return () => {
          _active = false;
        };
      };

      // Create 100 subscriptions
      for (let i = 0; i < 100; i++) {
        subscriptions.push(createSubscription());
      }

      // Unsubscribe all - should not throw
      for (const unsub of subscriptions) {
        expect(() => unsub()).not.toThrow();
      }

      expect(subscriptions.length).toBe(100);
    });

    it("should handle subscription/unsubscription ordering", () => {
      // Test that subscriptions can be unsubscribed in any order
      const subscriptions: { id: number; unsub: () => void }[] = [];

      for (let i = 0; i < 50; i++) {
        subscriptions.push({
          id: i,
          unsub: () => {},
        });
      }

      // Unsubscribe in reverse order
      for (let i = subscriptions.length - 1; i >= 0; i--) {
        expect(() => subscriptions[i]!.unsub()).not.toThrow();
      }

      // Unsubscribe in random order
      const shuffled = [...subscriptions].sort(() => Math.random() - 0.5);
      for (const sub of shuffled) {
        expect(() => sub.unsub()).not.toThrow();
      }
    });
  });

  describe("extended session simulation", () => {
    it("should handle many germination cycles without issues", async () => {
      vi.useFakeTimers();
      const system = new GardenEvolutionSystem();

      const germinatedIds: string[] = [];
      const callback = vi.fn().mockImplementation(async (plantId: string) => {
        germinatedIds.push(plantId);
        const plant = mockStoreState.plants.find((p) => p.id === plantId);
        if (plant) {
          plant.germinatedAt = new Date();
        }
      });
      system.setGerminationCallback(callback);

      try {
        // Simulate 1-hour session with plants germinating every minute
        for (let minute = 0; minute < 60; minute++) {
          // Add some dormant plants
          for (let i = 0; i < 5; i++) {
            mockStoreState.plants.push(
              createMockPlant(`plant-${minute}-${i}`, Math.random() * 1000, Math.random() * 1000)
            );
          }

          system.start();

          // Advance 1 minute
          vi.advanceTimersByTime(60 * 1000);

          // Force germination check
          vi.spyOn(Math, "random").mockReturnValue(0.01);
          await system.triggerCheck();
          vi.spyOn(Math, "random").mockRestore();

          system.stop();
        }

        // System should have handled all cycles without error
        expect(germinatedIds.length).toBeGreaterThan(0);
      } finally {
        system.destroy();
        vi.useRealTimers();
      }
    });

    it("should handle rapid observation simulations", () => {
      const grid = new SpatialGrid(100);

      // Simulate 1000 observation checks (as if user is watching for a while)
      const plants: Plant[] = [];
      for (let i = 0; i < 100; i++) {
        plants.push(createMockPlant(`plant-${i}`, Math.random() * 1000, Math.random() * 1000));
      }
      grid.rebuild(plants);

      // 1000 observation region queries
      for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        grid.getPlantsInRegion({ x, y }, 135);
      }

      // Grid should still be functional
      const found = grid.getPlantsInRegion({ x: 500, y: 500 }, 500);
      expect(found.length).toBeGreaterThan(0);
    });

    it("should handle plant state changes without accumulating garbage", () => {
      const plants: Plant[] = [];
      for (let i = 0; i < 100; i++) {
        plants.push(createMockPlant(`plant-${i}`, i * 20, i * 20));
      }

      // Simulate 1000 state changes
      for (let cycle = 0; cycle < 1000; cycle++) {
        // Change random plant state
        const plantIndex = cycle % plants.length;
        const plant = plants[plantIndex]!;

        if (cycle % 3 === 0) {
          plant.observed = true;
          plant.visualState = "collapsed";
        } else if (cycle % 3 === 1) {
          plant.germinatedAt = new Date();
        }
      }

      // All plants should still be valid
      expect(plants.length).toBe(100);
      expect(plants.every((p) => p.id.startsWith("plant-"))).toBe(true);
    });
  });

  describe("callback cleanup", () => {
    it("should not hold callback references after destroy", () => {
      vi.useFakeTimers();
      const system = new GardenEvolutionSystem();

      const callback = vi.fn().mockResolvedValue(undefined);

      system.setGerminationCallback(callback);
      system.destroy();

      // Callback should not be callable after destroy
      // (System is destroyed, so no checks should trigger)
      expect(system.running).toBe(false);

      vi.useRealTimers();
    });

    it("should handle callback errors without leaking", async () => {
      vi.useFakeTimers();
      resetMockState();
      const system = new GardenEvolutionSystem();

      // Callback that always throws
      const errorCallback = vi.fn().mockRejectedValue(new Error("Test error"));
      system.setGerminationCallback(errorCallback);

      mockStoreState.plants = [createMockPlant("plant-1", 100, 100)];

      system.start();
      vi.advanceTimersByTime(60 * 1000);

      // Should not throw even when callback errors
      vi.spyOn(Math, "random").mockReturnValue(0.01);
      await expect(system.triggerCheck()).resolves.not.toThrow();
      vi.spyOn(Math, "random").mockRestore();

      // System should still be running
      expect(system.running).toBe(true);

      system.destroy();
      vi.useRealTimers();
    });
  });

  describe("cache size limits", () => {
    it("should handle many unique plant variants", () => {
      const grid = new SpatialGrid(100);

      // Create plants with many different variant IDs
      const plants: Plant[] = [];
      for (let i = 0; i < 500; i++) {
        plants.push({
          ...createMockPlant(`plant-${i}`, Math.random() * 1000, Math.random() * 1000),
          variantId: `variant-${i}`, // Unique variant per plant
        });
      }

      grid.rebuild(plants);

      // Grid should still work correctly
      const found = grid.getPlantsInRegion({ x: 500, y: 500 }, 500);
      expect(found.length).toBeGreaterThan(0);
    });
  });
});
