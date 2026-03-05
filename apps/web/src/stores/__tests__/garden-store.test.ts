/**
 * Garden Store Tests
 *
 * Tests for the Zustand garden store, focusing on evolution state management.
 * The store is the central state management for the garden application.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useGardenStore } from "../garden-store";
import type { Plant } from "@quantum-garden/shared";

/**
 * Helper to reset store state between tests.
 */
function resetStore() {
  useGardenStore.setState({
    plants: [],
    activeRegion: null,
    dwellTarget: null,
    dwellProgress: 0,
    isInCooldown: false,
    notifications: [],
    observationContext: null,
    evolutionPaused: true,
    evolutionStats: null,
    lastGerminationTime: null,
    eventLog: [],
    selectedEventId: null,
    historicalEventsLoaded: false,
  });
}

/**
 * Create a mock plant for testing.
 */
function createMockPlant(id: string, options: Partial<Plant> = {}): Plant {
  return {
    id,
    position: { x: 100, y: 100 },
    observed: false,
    visualState: "superposed",
    variantId: "test-variant",
    createdAt: new Date(),
    germinatedAt: null,
    lifecycleModifier: 1.0,
    ...options,
  } as Plant;
}

describe("Garden Store", () => {
  beforeEach(() => {
    resetStore();
  });

  describe("evolution state", () => {
    describe("evolutionPaused", () => {
      it("should start with evolution paused", () => {
        const state = useGardenStore.getState();
        expect(state.evolutionPaused).toBe(true);
      });

      it("should set evolution paused state", () => {
        const { setEvolutionPaused } = useGardenStore.getState();

        setEvolutionPaused(false);
        expect(useGardenStore.getState().evolutionPaused).toBe(false);

        setEvolutionPaused(true);
        expect(useGardenStore.getState().evolutionPaused).toBe(true);
      });
    });

    describe("evolutionStats", () => {
      it("should start with null evolution stats", () => {
        const state = useGardenStore.getState();
        expect(state.evolutionStats).toBeNull();
      });

      it("should set evolution stats", () => {
        const { setEvolutionStats } = useGardenStore.getState();

        setEvolutionStats({ dormantCount: 5, trackedCount: 3 });

        const state = useGardenStore.getState();
        expect(state.evolutionStats).toEqual({
          dormantCount: 5,
          trackedCount: 3,
        });
      });

      it("should clear evolution stats with null", () => {
        const { setEvolutionStats } = useGardenStore.getState();

        setEvolutionStats({ dormantCount: 5, trackedCount: 3 });
        setEvolutionStats(null);

        expect(useGardenStore.getState().evolutionStats).toBeNull();
      });

      it("should update evolution stats incrementally", () => {
        const { setEvolutionStats } = useGardenStore.getState();

        setEvolutionStats({ dormantCount: 10, trackedCount: 10 });
        setEvolutionStats({ dormantCount: 8, trackedCount: 8 });

        const state = useGardenStore.getState();
        expect(state.evolutionStats?.dormantCount).toBe(8);
        expect(state.evolutionStats?.trackedCount).toBe(8);
      });
    });

    describe("lastGerminationTime", () => {
      it("should start with null last germination time", () => {
        const state = useGardenStore.getState();
        expect(state.lastGerminationTime).toBeNull();
      });

      it("should set last germination time", () => {
        const { setLastGerminationTime } = useGardenStore.getState();
        const timestamp = Date.now();

        setLastGerminationTime(timestamp);

        expect(useGardenStore.getState().lastGerminationTime).toBe(timestamp);
      });

      it("should clear last germination time with null", () => {
        const { setLastGerminationTime } = useGardenStore.getState();

        setLastGerminationTime(Date.now());
        setLastGerminationTime(null);

        expect(useGardenStore.getState().lastGerminationTime).toBeNull();
      });
    });
  });

  describe("notifications", () => {
    it("should start with empty notifications", () => {
      const state = useGardenStore.getState();
      expect(state.notifications).toEqual([]);
    });

    it("should add notification with unique ID", () => {
      const { addNotification } = useGardenStore.getState();

      addNotification("Plant germinated!");

      const state = useGardenStore.getState();
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0]?.message).toBe("Plant germinated!");
      expect(state.notifications[0]?.id).toMatch(/^notification-/);
      expect(state.notifications[0]?.timestamp).toBeGreaterThan(0);
    });

    it("should limit notifications to MAX_NOTIFICATIONS (3)", () => {
      const { addNotification } = useGardenStore.getState();

      addNotification("First");
      addNotification("Second");
      addNotification("Third");
      addNotification("Fourth");
      addNotification("Fifth");

      const state = useGardenStore.getState();
      expect(state.notifications).toHaveLength(3);
      // Should keep the most recent 3
      expect(state.notifications.map((n) => n.message)).toEqual(["Third", "Fourth", "Fifth"]);
    });

    it("should remove notification by ID", () => {
      const { addNotification, removeNotification } = useGardenStore.getState();

      addNotification("Test notification");
      const notificationId = useGardenStore.getState().notifications[0]?.id;

      removeNotification(notificationId!);

      expect(useGardenStore.getState().notifications).toHaveLength(0);
    });

    it("should handle removing non-existent notification gracefully", () => {
      const { addNotification, removeNotification } = useGardenStore.getState();

      addNotification("Test notification");
      removeNotification("non-existent-id");

      expect(useGardenStore.getState().notifications).toHaveLength(1);
    });
  });

  describe("plants state", () => {
    it("should start with empty plants array", () => {
      const state = useGardenStore.getState();
      expect(state.plants).toEqual([]);
    });

    it("should set plants", () => {
      const { setPlants } = useGardenStore.getState();
      const plants = [createMockPlant("plant-1"), createMockPlant("plant-2")];

      setPlants(plants);

      expect(useGardenStore.getState().plants).toHaveLength(2);
    });

    it("should update a single plant", () => {
      const { setPlants, updatePlant } = useGardenStore.getState();
      const plants = [createMockPlant("plant-1"), createMockPlant("plant-2")];
      setPlants(plants);

      updatePlant("plant-1", { observed: true, visualState: "collapsed" });

      const state = useGardenStore.getState();
      const updatedPlant = state.plants.find((p) => p.id === "plant-1");
      expect(updatedPlant?.observed).toBe(true);
      expect(updatedPlant?.visualState).toBe("collapsed");
    });

    it("should not modify other plants when updating one", () => {
      const { setPlants, updatePlant } = useGardenStore.getState();
      const plants = [createMockPlant("plant-1"), createMockPlant("plant-2")];
      setPlants(plants);

      updatePlant("plant-1", { observed: true });

      const state = useGardenStore.getState();
      const plant2 = state.plants.find((p) => p.id === "plant-2");
      expect(plant2?.observed).toBe(false);
    });

    it("should handle updating non-existent plant gracefully", () => {
      const { setPlants, updatePlant } = useGardenStore.getState();
      const plants = [createMockPlant("plant-1")];
      setPlants(plants);

      updatePlant("non-existent", { observed: true });

      // Should not throw and plants should remain unchanged
      expect(useGardenStore.getState().plants).toHaveLength(1);
    });
  });

  describe("dwell state", () => {
    it("should start with no dwell target", () => {
      const state = useGardenStore.getState();
      expect(state.dwellTarget).toBeNull();
      expect(state.dwellProgress).toBe(0);
    });

    it("should set dwell target", () => {
      const { setDwellTarget } = useGardenStore.getState();

      setDwellTarget("plant-1");

      expect(useGardenStore.getState().dwellTarget).toBe("plant-1");
    });

    it("should set dwell progress", () => {
      const { setDwellProgress } = useGardenStore.getState();

      setDwellProgress(0.5);

      expect(useGardenStore.getState().dwellProgress).toBe(0.5);
    });

    it("should reset dwell state", () => {
      const { setDwellTarget, setDwellProgress, resetDwell } = useGardenStore.getState();

      setDwellTarget("plant-1");
      setDwellProgress(0.75);
      resetDwell();

      const state = useGardenStore.getState();
      expect(state.dwellTarget).toBeNull();
      expect(state.dwellProgress).toBe(0);
    });
  });

  describe("cooldown state", () => {
    it("should start with cooldown disabled", () => {
      const state = useGardenStore.getState();
      expect(state.isInCooldown).toBe(false);
    });

    it("should set cooldown state", () => {
      const { setIsInCooldown } = useGardenStore.getState();

      setIsInCooldown(true);
      expect(useGardenStore.getState().isInCooldown).toBe(true);

      setIsInCooldown(false);
      expect(useGardenStore.getState().isInCooldown).toBe(false);
    });
  });

  describe("observation context", () => {
    it("should start with no observation context", () => {
      const state = useGardenStore.getState();
      expect(state.observationContext).toBeNull();
    });

    it("should set observation context", () => {
      const { setObservationContext } = useGardenStore.getState();
      const context = {
        plantId: "plant-1",
        circuitId: "superposition",
        isEntangled: false,
      };

      setObservationContext(context);

      expect(useGardenStore.getState().observationContext).toEqual(context);
    });

    it("should clear observation context", () => {
      const { setObservationContext, clearObservationContext } = useGardenStore.getState();

      setObservationContext({
        plantId: "plant-1",
        circuitId: "superposition",
        isEntangled: false,
      });
      clearObservationContext();

      expect(useGardenStore.getState().observationContext).toBeNull();
    });
  });

  describe("quantum event log", () => {
    it("should start with empty event log", () => {
      const state = useGardenStore.getState();
      expect(state.eventLog).toEqual([]);
      expect(state.historicalEventsLoaded).toBe(false);
    });

    it("should add event with generated ID", () => {
      const { addEvent } = useGardenStore.getState();

      addEvent({
        type: "germination",
        timestamp: new Date(),
        plantId: "plant-1",
      });

      const state = useGardenStore.getState();
      expect(state.eventLog).toHaveLength(1);
      expect(state.eventLog[0]?.id).toMatch(/^event-/);
      expect(state.eventLog[0]?.type).toBe("germination");
    });

    it("should limit event log to 50 entries", () => {
      const { addEvent } = useGardenStore.getState();

      // Add 55 events
      for (let i = 0; i < 55; i++) {
        addEvent({
          type: "germination",
          timestamp: new Date(Date.now() + i),
          plantId: `plant-${i}`,
        });
      }

      const state = useGardenStore.getState();
      expect(state.eventLog).toHaveLength(50);
      // Should keep the most recent 50 (indices 5-54)
      expect(state.eventLog[0]?.plantId).toBe("plant-5");
      expect(state.eventLog[49]?.plantId).toBe("plant-54");
    });

    it("should clear event log and reset historical flag", () => {
      const { addEvent, clearEventLog, setHistoricalEventsLoaded } = useGardenStore.getState();

      addEvent({
        type: "germination",
        timestamp: new Date(),
        plantId: "plant-1",
      });
      setHistoricalEventsLoaded(true);

      clearEventLog();

      const state = useGardenStore.getState();
      expect(state.eventLog).toEqual([]);
      expect(state.historicalEventsLoaded).toBe(false);
    });

    it("should set selected event ID", () => {
      const { setSelectedEventId } = useGardenStore.getState();

      setSelectedEventId("event-123");

      expect(useGardenStore.getState().selectedEventId).toBe("event-123");
    });

    it("should clear selected event ID", () => {
      const { setSelectedEventId } = useGardenStore.getState();

      setSelectedEventId("event-123");
      setSelectedEventId(null);

      expect(useGardenStore.getState().selectedEventId).toBeNull();
    });

    it("should set historical events loaded flag", () => {
      const { setHistoricalEventsLoaded } = useGardenStore.getState();

      setHistoricalEventsLoaded(true);

      expect(useGardenStore.getState().historicalEventsLoaded).toBe(true);
    });
  });

  describe("active region", () => {
    it("should start with null active region", () => {
      const state = useGardenStore.getState();
      expect(state.activeRegion).toBeNull();
    });

    it("should set active region", () => {
      const { setActiveRegion } = useGardenStore.getState();
      const region = {
        id: "region-1",
        center: { x: 100, y: 100 },
        radius: 50,
        lifetime: 60,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60000),
        active: true,
      };

      setActiveRegion(region);

      expect(useGardenStore.getState().activeRegion).toEqual(region);
    });

    it("should clear active region", () => {
      const { setActiveRegion } = useGardenStore.getState();
      const region = {
        id: "region-1",
        center: { x: 100, y: 100 },
        radius: 50,
        lifetime: 60,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60000),
        active: true,
      };
      setActiveRegion(region);

      setActiveRegion(null);

      expect(useGardenStore.getState().activeRegion).toBeNull();
    });
  });
});
