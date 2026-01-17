/**
 * Observation Router Integration Tests
 *
 * Tests the complete observation flow from recording an observation
 * through to plant state collapse with mock trait generation.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { observationRouter } from "../observation";

// Use a separate Prisma client for tests
const db = new PrismaClient();

// Helper to create a tRPC caller for testing
async function createCaller() {
  const ctx = { db };
  return observationRouter.createCaller(ctx);
}

// Test data cleanup
const testIds = {
  plants: [] as string[],
  regions: [] as string[],
  quantumRecords: [] as string[],
  events: [] as string[],
};

async function cleanup() {
  // Clean up in order due to foreign key constraints
  await db.observationEvent.deleteMany({
    where: { id: { in: testIds.events } },
  });
  await db.plant.deleteMany({
    where: { id: { in: testIds.plants } },
  });
  await db.observationRegion.deleteMany({
    where: { id: { in: testIds.regions } },
  });
  await db.quantumRecord.deleteMany({
    where: { id: { in: testIds.quantumRecords } },
  });

  // Reset tracking
  testIds.plants = [];
  testIds.regions = [];
  testIds.quantumRecords = [];
  testIds.events = [];
}

describe("observationRouter", () => {
  beforeEach(async () => {
    await cleanup();
  });

  afterEach(async () => {
    await cleanup();
    await db.$disconnect();
  });

  describe("recordObservation", () => {
    it("should observe a plant and collapse its state", async () => {
      // Arrange: Create quantum record
      const quantumRecord = await db.quantumRecord.create({
        data: {
          circuitDefinition: Buffer.from(JSON.stringify({ type: "test", seed: 12345 })).toString(
            "base64"
          ),
          status: "pending",
          measurements: [],
          probabilities: [],
        },
      });
      testIds.quantumRecords.push(quantumRecord.id);

      // Arrange: Create observation region
      const region = await db.observationRegion.create({
        data: {
          centerX: 100,
          centerY: 100,
          radius: 150,
          active: true,
          lifetime: 60,
          expiresAt: new Date(Date.now() + 60000),
        },
      });
      testIds.regions.push(region.id);

      // Arrange: Create unobserved plant
      const plant = await db.plant.create({
        data: {
          positionX: 100,
          positionY: 100,
          observed: false,
          visualState: "superposed",
          quantumCircuitId: quantumRecord.id,
          variantId: "simple-bloom",
          lifecycleModifier: 1.0,
        },
      });
      testIds.plants.push(plant.id);

      // Act: Record observation
      const caller = await createCaller();
      const result = await caller.recordObservation({
        plantId: plant.id,
        regionId: region.id,
      });

      // Assert: Plant is now observed
      expect(result.observed).toBe(true);
      expect(result.visualState).toBe("collapsed");
      expect(result.observedAt).toBeDefined();

      // Assert: Traits were generated
      expect(result.traits).toBeDefined();
      const traits = result.traits as {
        glyphPattern: number[][];
        colorPalette: string[];
        growthRate: number;
        opacity: number;
      };
      expect(traits.glyphPattern).toBeDefined();
      expect(traits.colorPalette).toBeInstanceOf(Array);
      expect(traits.growthRate).toBeGreaterThanOrEqual(0.5);
      expect(traits.growthRate).toBeLessThanOrEqual(1.5);
      expect(traits.opacity).toBeGreaterThanOrEqual(0.7);
      expect(traits.opacity).toBeLessThanOrEqual(1.0);

      // Assert: Observation event was recorded
      const events = await db.observationEvent.findMany({
        where: { plantId: plant.id },
      });
      expect(events).toHaveLength(1);
      expect(events[0]!.regionId).toBe(region.id);
      testIds.events.push(events[0]!.id);

      // Assert: Region was deactivated
      const updatedRegion = await db.observationRegion.findUnique({
        where: { id: region.id },
      });
      expect(updatedRegion?.active).toBe(false);
    });

    it("should throw error when plant not found", async () => {
      const caller = await createCaller();

      await expect(
        caller.recordObservation({
          plantId: "non-existent-id",
          regionId: "some-region",
        })
      ).rejects.toThrow("Plant not found");
    });

    it("should throw error when plant already observed", async () => {
      // Arrange: Create quantum record
      const quantumRecord = await db.quantumRecord.create({
        data: {
          circuitDefinition: Buffer.from(JSON.stringify({ type: "test", seed: 54321 })).toString(
            "base64"
          ),
          status: "pending",
          measurements: [],
          probabilities: [],
        },
      });
      testIds.quantumRecords.push(quantumRecord.id);

      // Arrange: Create observation region
      const region = await db.observationRegion.create({
        data: {
          centerX: 100,
          centerY: 100,
          radius: 150,
          active: true,
          lifetime: 60,
          expiresAt: new Date(Date.now() + 60000),
        },
      });
      testIds.regions.push(region.id);

      // Arrange: Create already observed plant
      const plant = await db.plant.create({
        data: {
          positionX: 100,
          positionY: 100,
          observed: true, // Already observed
          visualState: "collapsed",
          observedAt: new Date(),
          quantumCircuitId: quantumRecord.id,
          variantId: "simple-bloom",
          lifecycleModifier: 1.0,
        },
      });
      testIds.plants.push(plant.id);

      // Act & Assert
      const caller = await createCaller();
      await expect(
        caller.recordObservation({
          plantId: plant.id,
          regionId: region.id,
        })
      ).rejects.toThrow("Plant has already been observed");
    });

    it("should generate deterministic traits from circuit seed", async () => {
      const seed = 99999;

      // Create two plants with the same circuit seed
      const quantumRecord1 = await db.quantumRecord.create({
        data: {
          circuitDefinition: Buffer.from(JSON.stringify({ type: "test", seed })).toString("base64"),
          status: "pending",
          measurements: [],
          probabilities: [],
        },
      });
      testIds.quantumRecords.push(quantumRecord1.id);

      const quantumRecord2 = await db.quantumRecord.create({
        data: {
          circuitDefinition: Buffer.from(JSON.stringify({ type: "test", seed })).toString("base64"),
          status: "pending",
          measurements: [],
          probabilities: [],
        },
      });
      testIds.quantumRecords.push(quantumRecord2.id);

      const region = await db.observationRegion.create({
        data: {
          centerX: 100,
          centerY: 100,
          radius: 150,
          active: true,
          lifetime: 60,
          expiresAt: new Date(Date.now() + 60000),
        },
      });
      testIds.regions.push(region.id);

      const plant1 = await db.plant.create({
        data: {
          positionX: 100,
          positionY: 100,
          observed: false,
          visualState: "superposed",
          quantumCircuitId: quantumRecord1.id,
          variantId: "simple-bloom",
          lifecycleModifier: 1.0,
        },
      });
      testIds.plants.push(plant1.id);

      const plant2 = await db.plant.create({
        data: {
          positionX: 200,
          positionY: 200,
          observed: false,
          visualState: "superposed",
          quantumCircuitId: quantumRecord2.id,
          variantId: "simple-bloom",
          lifecycleModifier: 1.0,
        },
      });
      testIds.plants.push(plant2.id);

      // Observe both plants
      const caller = await createCaller();

      // Re-activate region for second observation
      const result1 = await caller.recordObservation({
        plantId: plant1.id,
        regionId: region.id,
      });

      await db.observationRegion.update({
        where: { id: region.id },
        data: { active: true },
      });

      const result2 = await caller.recordObservation({
        plantId: plant2.id,
        regionId: region.id,
      });

      // Track events for cleanup
      const events = await db.observationEvent.findMany({
        where: { plantId: { in: [plant1.id, plant2.id] } },
      });
      events.forEach((e) => testIds.events.push(e.id));

      // Traits should be identical because seeds are the same
      const traits1 = result1.traits as { growthRate: number; opacity: number };
      const traits2 = result2.traits as { growthRate: number; opacity: number };

      expect(traits1.growthRate).toBe(traits2.growthRate);
      expect(traits1.opacity).toBe(traits2.opacity);
    });
  });

  describe("getActiveRegion", () => {
    it("should return active non-expired region", async () => {
      const region = await db.observationRegion.create({
        data: {
          centerX: 200,
          centerY: 200,
          radius: 100,
          active: true,
          lifetime: 60,
          expiresAt: new Date(Date.now() + 60000), // 1 minute from now
        },
      });
      testIds.regions.push(region.id);

      const caller = await createCaller();
      const result = await caller.getActiveRegion();

      expect(result).not.toBeNull();
      expect(result?.id).toBe(region.id);
      expect(result?.active).toBe(true);
    });

    it("should return null when no active region", async () => {
      const caller = await createCaller();
      const result = await caller.getActiveRegion();

      expect(result).toBeNull();
    });

    it("should return null when region is expired", async () => {
      const region = await db.observationRegion.create({
        data: {
          centerX: 200,
          centerY: 200,
          radius: 100,
          active: true,
          lifetime: 60,
          expiresAt: new Date(Date.now() - 1000), // Already expired
        },
      });
      testIds.regions.push(region.id);

      const caller = await createCaller();
      const result = await caller.getActiveRegion();

      expect(result).toBeNull();
    });

    it("should return null when region is inactive", async () => {
      const region = await db.observationRegion.create({
        data: {
          centerX: 200,
          centerY: 200,
          radius: 100,
          active: false, // Inactive
          lifetime: 60,
          expiresAt: new Date(Date.now() + 60000),
        },
      });
      testIds.regions.push(region.id);

      const caller = await createCaller();
      const result = await caller.getActiveRegion();

      expect(result).toBeNull();
    });
  });

  describe("getHistory", () => {
    it("should return observation history for a plant", async () => {
      // Arrange: Create plant and observation event
      const quantumRecord = await db.quantumRecord.create({
        data: {
          circuitDefinition: "test",
          status: "completed",
          measurements: [],
          probabilities: [],
        },
      });
      testIds.quantumRecords.push(quantumRecord.id);

      const plant = await db.plant.create({
        data: {
          positionX: 100,
          positionY: 100,
          observed: true,
          visualState: "collapsed",
          observedAt: new Date(),
          quantumCircuitId: quantumRecord.id,
          variantId: "simple-bloom",
          lifecycleModifier: 1.0,
        },
      });
      testIds.plants.push(plant.id);

      const event = await db.observationEvent.create({
        data: {
          plantId: plant.id,
          regionId: "test-region",
          quantumRecordId: quantumRecord.id,
        },
      });
      testIds.events.push(event.id);

      // Act
      const caller = await createCaller();
      const result = await caller.getHistory({ plantId: plant.id });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.plantId).toBe(plant.id);
    });

    it("should return empty array for plant with no history", async () => {
      const caller = await createCaller();
      const result = await caller.getHistory({ plantId: "non-existent" });

      expect(result).toHaveLength(0);
    });
  });
});
