import { z } from "zod";
import { router, publicProcedure } from "../trpc";

/**
 * Plant-related procedures.
 *
 * Handles querying and managing plants in the garden.
 */
export const plantsRouter = router({
  /**
   * Get all plants in the garden.
   */
  list: publicProcedure.query(async ({ ctx }) => {
    const plants = await ctx.db.plant.findMany({
      orderBy: { createdAt: "asc" },
    });
    return plants;
  }),

  /**
   * Get a single plant by ID.
   */
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const plant = await ctx.db.plant.findUnique({
      where: { id: input.id },
      include: {
        quantumCircuit: true,
        entanglementGroup: true,
      },
    });
    return plant;
  }),

  /**
   * Get plants by entanglement group.
   */
  getByEntanglementGroup: publicProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const plants = await ctx.db.plant.findMany({
        where: { entanglementGroupId: input.groupId },
      });
      return plants;
    }),

  /**
   * Get unobserved plants.
   */
  getUnobserved: publicProcedure.query(async ({ ctx }) => {
    const plants = await ctx.db.plant.findMany({
      where: { observed: false },
    });
    return plants;
  }),
});
