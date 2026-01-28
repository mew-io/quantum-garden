/**
 * GardenEvolutionSystem Tests
 *
 * Tests the garden evolution system that manages time-based plant germination.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GardenEvolutionSystem, createGardenEvolutionSystem } from "../garden-evolution";
import type { Plant } from "@quantum-garden/shared";

// Mock the garden store
vi.mock("@/stores/garden-store", () => ({
  useGardenStore: {
    getState: vi.fn(() => ({
      plants: [] as Plant[],
    })),
  },
}));

// Mock the debug logger
vi.mock("@/lib/debug-logger", () => ({
  debugLogger: {
    evolution: {
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
    },
  },
}));

import { useGardenStore } from "@/stores/garden-store";

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
  } = {}
): Plant {
  return {
    id,
    position: { x, y },
    observed: options.observed ?? false,
    visualState: options.germinatedAt ? "collapsed" : "superposed",
    variantId: "test-variant",
    createdAt: options.createdAt ?? new Date(),
    germinatedAt: options.germinatedAt ?? null,
    lifecycleModifier: 1.0,
  } as Plant;
}

/**
 * Set mock plants in the store.
 */
function setMockPlants(plants: Plant[]): void {
  vi.mocked(useGardenStore.getState).mockReturnValue({
    plants,
  } as ReturnType<typeof useGardenStore.getState>);
}

describe("GardenEvolutionSystem", () => {
  let system: GardenEvolutionSystem;

  beforeEach(() => {
    vi.useFakeTimers();
    system = new GardenEvolutionSystem();
    setMockPlants([]);
  });

  afterEach(() => {
    system.destroy();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("lifecycle", () => {
    it("should create a new system with stopped state", () => {
      expect(system.running).toBe(false);
    });

    it("should start the evolution system", () => {
      system.start();
      expect(system.running).toBe(true);
    });

    it("should stop the evolution system", () => {
      system.start();
      system.stop();
      expect(system.running).toBe(false);
    });

    it("should not start twice", () => {
      system.start();
      system.start(); // Should be a no-op
      expect(system.running).toBe(true);
    });

    it("should not stop twice", () => {
      system.start();
      system.stop();
      system.stop(); // Should be a no-op
      expect(system.running).toBe(false);
    });

    it("should pause and resume", () => {
      system.start();
      expect(system.running).toBe(true);

      system.pause();
      expect(system.running).toBe(false);

      system.resume();
      expect(system.running).toBe(true);
    });

    it("should destroy and clean up", () => {
      system.start();
      system.destroy();
      expect(system.running).toBe(false);
    });
  });

  describe("germination callback", () => {
    it("should set and call germination callback", async () => {
      const callback = vi.fn().mockResolvedValue(undefined);
      system.setGerminationCallback(callback);

      // Create a dormant plant
      const plant = createMockPlant("plant-1", 100, 100);
      setMockPlants([plant]);

      system.start();

      // Advance time past minimum dormancy and guaranteed germination threshold
      vi.advanceTimersByTime(20 * 60 * 1000); // 20 minutes

      // Manually trigger check
      await system.triggerCheck();

      // Callback should have been called with plant ID
      expect(callback).toHaveBeenCalledWith("plant-1");
    });

    it("should not trigger callback when system is stopped", async () => {
      const callback = vi.fn().mockResolvedValue(undefined);
      system.setGerminationCallback(callback);

      const plant = createMockPlant("plant-1", 100, 100);
      setMockPlants([plant]);

      // Don't start the system
      await system.triggerCheck();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("plant tracking", () => {
    it("should track dormant plants", () => {
      const plants = [
        createMockPlant("dormant-1", 100, 100),
        createMockPlant("dormant-2", 200, 200),
        createMockPlant("germinated-1", 300, 300, { germinatedAt: new Date() }),
      ];
      setMockPlants(plants);

      system.start();
      const stats = system.getStats();

      expect(stats.dormantCount).toBe(2);
      expect(stats.trackedCount).toBe(2);
    });

    it("should track new dormant plants on evolution check", async () => {
      const callback = vi.fn().mockResolvedValue(undefined);
      system.setGerminationCallback(callback);

      // Start with one plant
      const plant1 = createMockPlant("plant-1", 100, 100);
      setMockPlants([plant1]);
      system.start();

      // Add another plant
      const plant2 = createMockPlant("plant-2", 200, 200);
      setMockPlants([plant1, plant2]);

      await system.triggerCheck();
      const stats = system.getStats();

      expect(stats.dormantCount).toBe(2);
      expect(stats.trackedCount).toBe(2);
    });
  });

  describe("germination eligibility", () => {
    it("should not germinate plants that have been dormant less than minimum time", async () => {
      const callback = vi.fn().mockResolvedValue(undefined);
      system.setGerminationCallback(callback);

      // Create a plant that was just added
      const plant = createMockPlant("new-plant", 100, 100);
      setMockPlants([plant]);

      system.start();
      await system.triggerCheck();

      // Plant hasn't been dormant long enough
      expect(callback).not.toHaveBeenCalled();
    });

    it("should not germinate already germinated plants", async () => {
      const callback = vi.fn().mockResolvedValue(undefined);
      system.setGerminationCallback(callback);

      const plant = createMockPlant("germinated", 100, 100, {
        germinatedAt: new Date(),
      });
      setMockPlants([plant]);

      system.start();
      await system.triggerCheck();

      expect(callback).not.toHaveBeenCalled();
    });

    it("should not germinate already observed plants", async () => {
      const callback = vi.fn().mockResolvedValue(undefined);
      system.setGerminationCallback(callback);

      const plant = createMockPlant("observed", 100, 100, {
        observed: true,
      });
      setMockPlants([plant]);

      system.start();
      await system.triggerCheck();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("clustering prevention", () => {
    it("should not germinate plants in crowded areas", async () => {
      const callback = vi.fn().mockResolvedValue(undefined);
      system.setGerminationCallback(callback);

      // Create a dormant plant surrounded by 3+ germinated plants (within 150px)
      const dormantPlant = createMockPlant("dormant", 100, 100);
      const germinatedPlants = [
        createMockPlant("g1", 120, 100, { germinatedAt: new Date() }),
        createMockPlant("g2", 100, 120, { germinatedAt: new Date() }),
        createMockPlant("g3", 80, 100, { germinatedAt: new Date() }),
      ];

      setMockPlants([dormantPlant, ...germinatedPlants]);
      system.start();

      // Advance time past guaranteed germination threshold
      vi.advanceTimersByTime(20 * 60 * 1000); // 20 minutes

      await system.triggerCheck();

      // Should not germinate due to clustering prevention (even with guaranteed time)
      expect(callback).not.toHaveBeenCalled();
    });

    it("should germinate plants not in crowded areas", async () => {
      const callback = vi.fn().mockResolvedValue(undefined);
      system.setGerminationCallback(callback);

      // Create a dormant plant with only 2 germinated neighbors (below threshold)
      const dormantPlant = createMockPlant("dormant", 100, 100);
      const germinatedPlants = [
        createMockPlant("g1", 120, 100, { germinatedAt: new Date() }),
        createMockPlant("g2", 100, 120, { germinatedAt: new Date() }),
      ];

      setMockPlants([dormantPlant, ...germinatedPlants]);
      system.start();

      // Advance time past minimum dormancy and guaranteed germination threshold
      vi.advanceTimersByTime(20 * 60 * 1000); // 20 minutes

      await system.triggerCheck();

      // Should germinate (guaranteed germination after 20 min, not clustered)
      expect(callback).toHaveBeenCalledWith("dormant");
    });
  });

  describe("stats", () => {
    it("should return correct stats", () => {
      const plants = [
        createMockPlant("d1", 100, 100),
        createMockPlant("d2", 200, 200),
        createMockPlant("g1", 300, 300, { germinatedAt: new Date() }),
        createMockPlant("g2", 400, 400, { germinatedAt: new Date() }),
      ];
      setMockPlants(plants);

      system.start();
      const stats = system.getStats();

      expect(stats.dormantCount).toBe(2);
      expect(stats.trackedCount).toBe(2);
    });
  });

  describe("factory function", () => {
    it("should create a new system via factory", () => {
      const factorySystem = createGardenEvolutionSystem();
      expect(factorySystem).toBeInstanceOf(GardenEvolutionSystem);
      expect(factorySystem.running).toBe(false);
      factorySystem.destroy();
    });
  });

  describe("error handling", () => {
    it("should handle germination callback errors gracefully", async () => {
      const callback = vi.fn().mockRejectedValue(new Error("API error"));
      system.setGerminationCallback(callback);

      const plant = createMockPlant("plant-1", 100, 100);
      setMockPlants([plant]);

      system.start();

      // Advance time past guaranteed germination threshold
      vi.advanceTimersByTime(20 * 60 * 1000); // 20 minutes

      // Should not throw
      await expect(system.triggerCheck()).resolves.not.toThrow();

      // Callback was called but failed
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("wave events", () => {
    it("should limit germinations to MAX_GERMINATIONS_PER_CHECK when below WAVE_MIN_DORMANT_COUNT", async () => {
      const callback = vi.fn().mockResolvedValue(undefined);
      system.setGerminationCallback(callback);

      // Create only 4 dormant plants (below the 5 minimum for waves)
      // Space them far apart to avoid clustering
      const plants = [
        createMockPlant("p1", 100, 100),
        createMockPlant("p2", 500, 100),
        createMockPlant("p3", 100, 500),
        createMockPlant("p4", 500, 500),
      ];
      setMockPlants(plants);

      system.start();

      // Advance time past minimum dormancy but not past a second interval
      // MIN_DORMANCY is 60s, CHECK_INTERVAL is 30s
      // We need plants to be tracked for 60s+ so we can manually call triggerCheck
      vi.advanceTimersByTime(60 * 1000);

      // Mock random to always pass germination probability (0.01 < 0.15)
      // canWave is false (4 < 5), so Math.random() is only called for germination probability
      vi.spyOn(Math, "random").mockReturnValue(0.01);

      // Clear any callbacks from interval-triggered checks during advanceTimersByTime
      callback.mockClear();

      await system.triggerCheck();

      // Without wave (< 5 plants), only MAX_GERMINATIONS_PER_CHECK (1) should germinate
      // in a SINGLE triggerCheck call, even though all plants would pass probability
      expect(callback.mock.calls.length).toBe(1);

      vi.spyOn(Math, "random").mockRestore();
    });

    it("should allow wave germinations (3+) when at or above WAVE_MIN_DORMANT_COUNT", async () => {
      const callback = vi.fn().mockResolvedValue(undefined);
      system.setGerminationCallback(callback);

      // Create 6 dormant plants (above the 5 minimum for waves)
      // Space them far apart to avoid clustering prevention
      const plants = [
        createMockPlant("p1", 100, 100),
        createMockPlant("p2", 500, 100),
        createMockPlant("p3", 900, 100),
        createMockPlant("p4", 100, 500),
        createMockPlant("p5", 500, 500),
        createMockPlant("p6", 900, 500),
      ];
      setMockPlants(plants);

      system.start();

      // Advance time past minimum dormancy
      vi.advanceTimersByTime(60 * 1000);

      // Mock random to always trigger wave chance and always pass germination probability
      vi.spyOn(Math, "random").mockReturnValue(0.01); // < 0.05 = wave, < 0.15 = germinate

      // Clear any callbacks from interval-triggered checks
      callback.mockClear();

      await system.triggerCheck();

      // With wave triggered (6 >= 5), should germinate 3-5 plants (wave count)
      expect(callback.mock.calls.length).toBeGreaterThanOrEqual(3);

      vi.spyOn(Math, "random").mockRestore();
    });
  });
});
