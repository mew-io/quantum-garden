import { z } from "zod";
import type { Plant as PrismaPlant } from "@prisma/client";
import type { Plant, VisualState, ResolvedTraits } from "@quantum-garden/shared";
import { router, publicProcedure } from "../trpc";

/**
 * Transform a Prisma plant to the shared Plant type.
 * Optionally accepts the circuit type from an included quantumCircuit relation.
 */
function transformPlant(plant: PrismaPlant, circuitType?: string): Plant {
  return {
    id: plant.id,
    position: { x: plant.positionX, y: plant.positionY },
    observed: plant.observed,
    observedAt: plant.observedAt ?? undefined,
    quantumCircuitId: plant.quantumCircuitId,
    circuitType,
    visualState: plant.visualState as VisualState,
    entanglementGroupId: plant.entanglementGroupId ?? undefined,
    traits: plant.traits ? (plant.traits as unknown as ResolvedTraits) : undefined,
    createdAt: plant.createdAt,
    updatedAt: plant.updatedAt,
    variantId: plant.variantId,
    germinatedAt: plant.germinatedAt,
    diedAt: plant.diedAt,
    lifecycleModifier: plant.lifecycleModifier,
    colorVariationName: plant.colorVariationName,
  };
}

/**
 * Plant-related procedures.
 *
 * Handles querying and managing plants in the garden.
 */
export const plantsRouter = router({
  /**
   * Get all plants in the garden (excludes dead plants).
   */
  list: publicProcedure.query(async ({ ctx }) => {
    const plants = await ctx.db.plant.findMany({
      where: { diedAt: null },
      orderBy: { createdAt: "asc" },
      include: { quantumCircuit: true },
    });
    return plants.map((p) => transformPlant(p, p.quantumCircuit?.circuitId ?? "variational"));
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
    return plant ? transformPlant(plant, plant.quantumCircuit?.circuitId ?? "variational") : null;
  }),

  /**
   * Get plants by entanglement group (excludes dead plants).
   */
  getByEntanglementGroup: publicProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const plants = await ctx.db.plant.findMany({
        where: {
          entanglementGroupId: input.groupId,
          diedAt: null,
        },
        include: { quantumCircuit: true },
      });
      return plants.map((p) => transformPlant(p, p.quantumCircuit?.circuitId ?? "variational"));
    }),

  /**
   * Get unobserved plants (excludes dead plants).
   */
  getUnobserved: publicProcedure.query(async ({ ctx }) => {
    const plants = await ctx.db.plant.findMany({
      where: {
        observed: false,
        diedAt: null,
      },
      include: { quantumCircuit: true },
    });
    return plants.map((p) => transformPlant(p, p.quantumCircuit?.circuitId ?? "variational"));
  }),

  /**
   * Germinate a dormant plant.
   *
   * Sets the germinatedAt timestamp, allowing the plant to
   * begin its lifecycle progression from seed to bloom.
   */
  germinate: publicProcedure
    .input(z.object({ plantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find the plant with its quantum circuit for circuit type info
      const plant = await ctx.db.plant.findUnique({
        where: { id: input.plantId },
        include: { quantumCircuit: true },
      });

      if (!plant) {
        throw new Error(`Plant not found: ${input.plantId}`);
      }

      const circuitType = plant.quantumCircuit?.circuitId ?? "variational";

      if (plant.germinatedAt) {
        // Already germinated, return current state
        return transformPlant(plant, circuitType);
      }

      // Update plant with germination timestamp
      const updatedPlant = await ctx.db.plant.update({
        where: { id: input.plantId },
        data: { germinatedAt: new Date() },
      });

      return transformPlant(updatedPlant, circuitType);
    }),
});
