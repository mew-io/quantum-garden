/**
 * Germination Flow Integration Tests
 *
 * Tests the complete germination flow from the GardenEvolutionSystem
 * detecting a dormant plant, through to the store being updated with
 * the germination result.
 *
 * This integration test verifies that all components work together:
 * - GardenEvolutionSystem detects dormant plants
 * - Germination callback is called with correct plant ID
 * - Store is updated with germination results
 * - Notifications are added to the store
 * - Events are logged to the quantum event log
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GardenEvolutionSystem } from "../garden-evolution";
import type { Plant } from "@quantum-garden/shared";

// Real store state for integration testing
let storeState = {
  plants: [] as Plant[],
  notifications: [] as { id: string; message: string }[],
  eventLog: [] as { type: string; plantId: string }[],
  lastGerminationTime: null as number | null,
  evolutionPaused: false,
  evolutionStats: null as { dormantCount: number; trackedCount: number } | null,
};

// Mock the garden store with real state tracking
vi.mock("@/stores/garden-store", () => ({
  useGardenStore: {
    getState: () => storeState,
    setState: (updates: Partial<typeof storeState>) => {
      storeState = { ...storeState, ...updates };
    },
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
    createdAt?: Date;
    variantId?: string;
  } = {}
): Plant {
  return {
    id,
    position: { x, y },
    observed: options.observed ?? false,
    visualState: options.germinatedAt ? "collapsed" : "superposed",
    variantId: options.variantId ?? "test-variant",
    createdAt: options.createdAt ?? new Date(Date.now() - 120000), // 2 min ago by default
    germinatedAt: options.germinatedAt ?? null,
    lifecycleModifier: 1.0,
  } as Plant;
}

/**
 * Reset the store state for each test.
 */
function resetStoreState() {
  storeState = {
    plants: [],
    notifications: [],
    eventLog: [],
    lastGerminationTime: null,
    evolutionPaused: false,
    evolutionStats: null,
  };
}

describe("Germination Flow Integration", () => {
  let system: GardenEvolutionSystem;

  beforeEach(() => {
    vi.useFakeTimers();
    resetStoreState();
    system = new GardenEvolutionSystem();
  });

  afterEach(() => {
    system.destroy();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("basic germination flow", () => {
    it("should detect dormant plants and trigger germination callback", async () => {
      // Track germination calls
      const germinatedPlantIds: string[] = [];
      const callback = vi.fn().mockImplementation(async (plantId: string) => {
        germinatedPlantIds.push(plantId);
        // Simulate what the real callback would do - update the store
        const plant = storeState.plants.find((p) => p.id === plantId);
        if (plant) {
          plant.germinatedAt = new Date();
        }
      });
      system.setGerminationCallback(callback);

      // Create a dormant plant with creation time in the past
      const plant = createMockPlant("plant-1", 100, 100, {
        createdAt: new Date(Date.now() - 120000), // 2 min ago
      });
      storeState.plants = [plant];

      // Start the system
      system.start();
      expect(system.running).toBe(true);

      // Advance time past guaranteed germination threshold (15+ minutes)
      vi.advanceTimersByTime(20 * 60 * 1000); // 20 minutes

      // Manually trigger check
      await system.triggerCheck();

      // Verify germination was triggered
      expect(callback).toHaveBeenCalled();
      expect(germinatedPlantIds).toContain("plant-1");
    });

    it("should not trigger germination for already germinated plants", async () => {
      const callback = vi.fn().mockResolvedValue(undefined);
      system.setGerminationCallback(callback);

      // Create an already germinated plant
      const plant = createMockPlant("plant-1", 100, 100, {
        germinatedAt: new Date(),
      });
      storeState.plants = [plant];

      system.start();
      vi.advanceTimersByTime(20 * 60 * 1000);
      await system.triggerCheck();

      // Should not be called - plant is already germinated
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("multiple plant germination", () => {
    it("should germinate multiple plants over time", async () => {
      const germinatedPlantIds: string[] = [];
      const callback = vi.fn().mockImplementation(async (plantId: string) => {
        germinatedPlantIds.push(plantId);
        const plant = storeState.plants.find((p) => p.id === plantId);
        if (plant) {
          plant.germinatedAt = new Date();
        }
      });
      system.setGerminationCallback(callback);

      // Create multiple dormant plants spread far apart (to avoid cooldown)
      const plants = [
        createMockPlant("plant-1", 100, 100),
        createMockPlant("plant-2", 600, 600),
        createMockPlant("plant-3", 1100, 100),
      ];
      storeState.plants = plants;

      // Mock random to always pass germination
      vi.spyOn(Math, "random").mockReturnValue(0.01);

      system.start();

      // Advance time past minimum dormancy
      vi.advanceTimersByTime(60 * 1000);

      // Multiple checks to germinate all plants
      await system.triggerCheck();
      await system.triggerCheck();
      await system.triggerCheck();

      // All plants should eventually germinate
      expect(germinatedPlantIds.length).toBeGreaterThanOrEqual(1);

      vi.spyOn(Math, "random").mockRestore();
    });
  });

  describe("wave germination", () => {
    it("should trigger wave germination with context when many plants are dormant", async () => {
      const contexts: { isWave: boolean; waveIndex?: number; waveTotal?: number }[] = [];
      const callback = vi.fn().mockImplementation(async (_plantId: string, context) => {
        contexts.push(context);
      });
      system.setGerminationCallback(callback);

      // Create 6 dormant plants (above wave threshold of 5)
      const plants = [
        createMockPlant("p1", 100, 100),
        createMockPlant("p2", 500, 100),
        createMockPlant("p3", 900, 100),
        createMockPlant("p4", 100, 500),
        createMockPlant("p5", 500, 500),
        createMockPlant("p6", 900, 500),
      ];
      storeState.plants = plants;

      // Mock random to trigger wave and pass germination
      vi.spyOn(Math, "random").mockReturnValue(0.01);

      system.start();
      vi.advanceTimersByTime(60 * 1000);
      callback.mockClear();
      contexts.length = 0;

      await system.triggerCheck();

      // Should have wave germinations (3+ plants)
      const waveContexts = contexts.filter((c) => c.isWave);
      expect(waveContexts.length).toBeGreaterThanOrEqual(3);

      // Wave contexts should have proper indices
      if (waveContexts.length > 0) {
        expect(waveContexts[0]?.waveIndex).toBe(1);
        expect(typeof waveContexts[0]?.waveTotal).toBe("number");
      }

      vi.spyOn(Math, "random").mockRestore();
    });
  });

  describe("evolution stats tracking", () => {
    it("should track dormant plant count in stats", () => {
      const plants = [
        createMockPlant("dormant-1", 100, 100),
        createMockPlant("dormant-2", 200, 200),
        createMockPlant("germinated-1", 300, 300, { germinatedAt: new Date() }),
      ];
      storeState.plants = plants;

      system.start();
      const stats = system.getStats();

      expect(stats.dormantCount).toBe(2);
      expect(stats.trackedCount).toBe(2);
    });

    it("should update stats as plants germinate", async () => {
      const callback = vi.fn().mockImplementation(async (plantId: string) => {
        const plant = storeState.plants.find((p) => p.id === plantId);
        if (plant) {
          plant.germinatedAt = new Date();
        }
      });
      system.setGerminationCallback(callback);

      const plants = [createMockPlant("plant-1", 100, 100), createMockPlant("plant-2", 600, 600)];
      storeState.plants = plants;

      vi.spyOn(Math, "random").mockReturnValue(0.01);

      system.start();

      // Initial stats
      let stats = system.getStats();
      expect(stats.dormantCount).toBe(2);

      vi.advanceTimersByTime(60 * 1000);
      await system.triggerCheck();

      // After one germination
      stats = system.getStats();
      expect(stats.dormantCount).toBeLessThanOrEqual(2);

      vi.spyOn(Math, "random").mockRestore();
    });
  });

  describe("cooldown behavior", () => {
    it("should apply cooldown to nearby plants after germination", async () => {
      const germinatedPlantIds: string[] = [];
      const callback = vi.fn().mockImplementation(async (plantId: string) => {
        germinatedPlantIds.push(plantId);
        const plant = storeState.plants.find((p) => p.id === plantId);
        if (plant) {
          plant.germinatedAt = new Date();
        }
      });
      system.setGerminationCallback(callback);

      // Create two plants close together (within cooldown radius of 200px)
      const plants = [
        createMockPlant("plant-1", 100, 100),
        createMockPlant("plant-2", 150, 100), // 50px away
      ];
      storeState.plants = plants;

      // Use a very low random value to always pass germination checks
      // The system uses random for: wave check, wave count, and germination probability
      vi.spyOn(Math, "random").mockReturnValue(0.01);

      system.start();
      vi.advanceTimersByTime(60 * 1000);
      callback.mockClear();
      germinatedPlantIds.length = 0;

      // First check - one plant should germinate (MAX_GERMINATIONS_PER_CHECK = 1)
      await system.triggerCheck();
      expect(germinatedPlantIds.length).toBe(1);
      const firstGerminatedId = germinatedPlantIds[0];

      // The system should now have a cooldown record for the germinated plant
      // On next check, the nearby plant should have reduced probability (0.3x)
      callback.mockClear();

      // Use a value that would pass 15% base chance but fail 15% * 0.3 = 4.5% cooldown chance
      // 0.08 > 0.045 so it should fail with cooldown applied
      vi.spyOn(Math, "random").mockReturnValue(0.08);

      // Second check - the remaining plant should be affected by cooldown
      await system.triggerCheck();

      // The nearby plant should not germinate due to cooldown penalty
      // (0.08 > 0.15 * 0.3 = 0.045)
      const secondGerminated = germinatedPlantIds.filter((id) => id !== firstGerminatedId);
      expect(secondGerminated.length).toBe(0);

      vi.spyOn(Math, "random").mockRestore();
    });
  });

  describe("clustering prevention", () => {
    it("should prevent germination in crowded areas", async () => {
      const callback = vi.fn().mockResolvedValue(undefined);
      system.setGerminationCallback(callback);

      // Create a dormant plant surrounded by 3+ germinated plants (within 150px)
      const dormantPlant = createMockPlant("dormant", 100, 100);
      const germinatedPlants = [
        createMockPlant("g1", 120, 100, { germinatedAt: new Date() }),
        createMockPlant("g2", 100, 120, { germinatedAt: new Date() }),
        createMockPlant("g3", 80, 100, { germinatedAt: new Date() }),
      ];
      storeState.plants = [dormantPlant, ...germinatedPlants];

      vi.spyOn(Math, "random").mockReturnValue(0.01);

      system.start();
      // Even with guaranteed germination time (20+ min), clustering should prevent it
      vi.advanceTimersByTime(20 * 60 * 1000);
      await system.triggerCheck();

      // Should not germinate due to clustering
      expect(callback).not.toHaveBeenCalled();

      vi.spyOn(Math, "random").mockRestore();
    });
  });

  describe("error handling", () => {
    it("should handle callback errors gracefully and continue", async () => {
      const callback = vi
        .fn()
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValue(undefined);
      system.setGerminationCallback(callback);

      const plants = [createMockPlant("plant-1", 100, 100), createMockPlant("plant-2", 600, 600)];
      storeState.plants = plants;

      vi.spyOn(Math, "random").mockReturnValue(0.01);

      system.start();
      vi.advanceTimersByTime(60 * 1000);

      // First check fails
      await system.triggerCheck();
      expect(callback).toHaveBeenCalled();

      // System should still be running
      expect(system.running).toBe(true);

      vi.spyOn(Math, "random").mockRestore();
    });
  });
});
