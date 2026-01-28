import { z } from "zod";
import type { Plant as PrismaPlant } from "@prisma/client";
import type { Plant, VisualState, ResolvedTraits } from "@quantum-garden/shared";
import { router, publicProcedure } from "../trpc";

/**
 * Evolution event types for the timeline.
 */
export type EvolutionEventType = "germination" | "observation";

export interface EvolutionEvent {
  type: EvolutionEventType;
  plantId: string;
  timestamp: Date;
  variantId?: string;
  entanglementGroupId?: string;
}

/**
 * Compute a plant's visual state at a specific point in time.
 *
 * Logic:
 * - superposed if not yet observed (includes dormant plants with germinatedAt=null)
 * - collapsed if observedAt <= timestamp
 *
 * Note: "dormant" is not a VisualState value - it's inferred from
 * visualState="superposed" + germinatedAt=null.
 */
function computeHistoricalVisualState(plant: PrismaPlant, timestamp: Date): VisualState {
  const ts = timestamp.getTime();

  // If already observed at this timestamp, it's collapsed
  if (plant.observedAt && plant.observedAt.getTime() <= ts) {
    return "collapsed";
  }

  // Otherwise it's superposed (includes dormant plants)
  return "superposed";
}

/**
 * Transform plant with historical state computed for a specific timestamp.
 */
function transformPlantAtTime(plant: PrismaPlant, timestamp: Date): Plant {
  const historicalState = computeHistoricalVisualState(plant, timestamp);
  const ts = timestamp.getTime();

  // Only include traits if the plant was already observed at this timestamp
  const traits =
    plant.observed && plant.observedAt && plant.observedAt.getTime() <= ts
      ? (plant.traits as unknown as ResolvedTraits)
      : undefined;

  return {
    id: plant.id,
    position: { x: plant.positionX, y: plant.positionY },
    observed: plant.observed && plant.observedAt ? plant.observedAt.getTime() <= ts : false,
    observedAt: plant.observedAt && plant.observedAt.getTime() <= ts ? plant.observedAt : undefined,
    quantumCircuitId: plant.quantumCircuitId,
    visualState: historicalState,
    entanglementGroupId: plant.entanglementGroupId ?? undefined,
    traits,
    createdAt: plant.createdAt,
    updatedAt: plant.updatedAt,
    variantId: plant.variantId,
    germinatedAt: plant.germinatedAt,
    lifecycleModifier: plant.lifecycleModifier,
    colorVariationName: plant.colorVariationName,
  };
}

/**
 * Garden-related procedures.
 *
 * Handles historical queries for time-travel functionality.
 */
export const gardenRouter = router({
  /**
   * Get garden state at a specific timestamp.
   *
   * Returns all plants with their states computed for that moment in time:
   * - dormant if not yet germinated
   * - superposed if germinated but not yet observed
   * - collapsed if already observed
   */
  getStateAtTime: publicProcedure
    .input(
      z.object({
        timestamp: z.coerce.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { timestamp } = input;

      // Query all plants
      const plants = await ctx.db.plant.findMany({
        orderBy: { createdAt: "asc" },
      });

      // Transform each plant with historical state
      return plants.map((plant) => transformPlantAtTime(plant, timestamp));
    }),

  /**
   * Get evolution timeline showing germinations and observations.
   *
   * Returns a sorted list of events between startTime and endTime.
   * Useful for rendering timeline markers and understanding garden evolution.
   */
  getEvolutionTimeline: publicProcedure
    .input(
      z.object({
        startTime: z.coerce.date(),
        endTime: z.coerce.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startTime, endTime } = input;

      // Query observation events in range
      const observations = await ctx.db.observationEvent.findMany({
        where: {
          timestamp: {
            gte: startTime,
            lte: endTime,
          },
        },
        include: {
          plant: {
            select: {
              variantId: true,
              entanglementGroupId: true,
            },
          },
        },
        orderBy: { timestamp: "asc" },
      });

      // Query plants with germination times in range
      const germinations = await ctx.db.plant.findMany({
        where: {
          germinatedAt: {
            gte: startTime,
            lte: endTime,
          },
        },
        select: {
          id: true,
          variantId: true,
          germinatedAt: true,
          entanglementGroupId: true,
        },
      });

      // Build events list
      const events: EvolutionEvent[] = [];

      // Add germination events
      for (const plant of germinations) {
        if (plant.germinatedAt) {
          events.push({
            type: "germination",
            plantId: plant.id,
            timestamp: plant.germinatedAt,
            variantId: plant.variantId,
            entanglementGroupId: plant.entanglementGroupId ?? undefined,
          });
        }
      }

      // Add observation events
      for (const obs of observations) {
        events.push({
          type: "observation",
          plantId: obs.plantId,
          timestamp: obs.timestamp,
          variantId: obs.plant.variantId,
          entanglementGroupId: obs.plant.entanglementGroupId ?? undefined,
        });
      }

      // Sort by timestamp
      events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      return events;
    }),
});
