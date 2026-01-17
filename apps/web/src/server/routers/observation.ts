import { z } from "zod";
import { router, publicProcedure } from "../trpc";

/**
 * Observation-related procedures.
 *
 * Handles the observation system including regions and dwell completion.
 */
export const observationRouter = router({
  /**
   * Get the currently active observation region.
   */
  getActiveRegion: publicProcedure.query(async ({ ctx }) => {
    const region = await ctx.db.observationRegion.findFirst({
      where: {
        active: true,
        expiresAt: { gt: new Date() },
      },
    });
    return region;
  }),

  /**
   * Record an observation event.
   *
   * Called when dwell duration completes. This triggers quantum measurement
   * and collapses the plant's visual state.
   */
  recordObservation: publicProcedure
    .input(
      z.object({
        plantId: z.string(),
        regionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify plant is still unobserved
      const plant = await ctx.db.plant.findUnique({
        where: { id: input.plantId },
        include: { quantumCircuit: true },
      });

      if (!plant) {
        throw new Error("Plant not found");
      }

      if (plant.observed) {
        throw new Error("Plant has already been observed");
      }

      // TODO: Call quantum service to perform measurement
      // For now, we'll just mark the plant as observed
      // In production, this will trigger IonQ circuit execution

      const updatedPlant = await ctx.db.plant.update({
        where: { id: input.plantId },
        data: {
          observed: true,
          observedAt: new Date(),
          visualState: "collapsed",
          // traits will be set after quantum measurement
        },
      });

      // Record the observation event
      await ctx.db.observationEvent.create({
        data: {
          plantId: input.plantId,
          regionId: input.regionId,
          quantumRecordId: plant.quantumCircuitId,
        },
      });

      // Deactivate the observation region
      await ctx.db.observationRegion.update({
        where: { id: input.regionId },
        data: { active: false },
      });

      return updatedPlant;
    }),

  /**
   * Get observation history for a plant.
   */
  getHistory: publicProcedure
    .input(z.object({ plantId: z.string() }))
    .query(async ({ ctx, input }) => {
      const events = await ctx.db.observationEvent.findMany({
        where: { plantId: input.plantId },
        orderBy: { timestamp: "desc" },
      });
      return events;
    }),
});
