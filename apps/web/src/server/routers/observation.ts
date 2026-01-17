import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import type { ResolvedTraits } from "@quantum-garden/shared";

/** Quantum service URL (Python FastAPI service) */
const QUANTUM_SERVICE_URL = process.env.QUANTUM_SERVICE_URL ?? "http://localhost:18742";

/** Response type from quantum service measurement endpoint */
interface QuantumMeasureResponse {
  plant_id: string;
  success: boolean;
  traits?: {
    glyphPattern: number[][];
    colorPalette: string[];
    growthRate: number;
    opacity: number;
  };
  error?: string;
}

/**
 * Call the quantum service to perform measurement on a plant's circuit.
 */
async function callQuantumMeasurement(
  plantId: string,
  circuitDefinition: string
): Promise<QuantumMeasureResponse> {
  const response = await fetch(`${QUANTUM_SERVICE_URL}/circuits/measure`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plant_id: plantId,
      circuit_definition: circuitDefinition,
    }),
  });

  if (!response.ok) {
    throw new Error(`Quantum service error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<QuantumMeasureResponse>;
}

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

      // Get the circuit definition from the quantum record
      const circuitDefinition = plant.quantumCircuit?.circuitDefinition;
      if (!circuitDefinition) {
        throw new Error("Plant has no quantum circuit definition");
      }

      // Call quantum service to perform measurement
      let resolvedTraits: ResolvedTraits | undefined;
      try {
        const measureResult = await callQuantumMeasurement(
          input.plantId,
          circuitDefinition as string
        );

        if (measureResult.success && measureResult.traits) {
          resolvedTraits = {
            glyphPattern: measureResult.traits.glyphPattern,
            colorPalette: measureResult.traits.colorPalette,
            growthRate: measureResult.traits.growthRate,
            opacity: measureResult.traits.opacity,
          };
        }
      } catch (error) {
        // Log error but continue with observation
        // In production, you might want to handle this differently
        console.error("Quantum measurement failed:", error);
      }

      const updatedPlant = await ctx.db.plant.update({
        where: { id: input.plantId },
        data: {
          observed: true,
          observedAt: new Date(),
          visualState: "collapsed",
          // Store resolved traits from quantum measurement
          traits: resolvedTraits ? (resolvedTraits as unknown as object) : undefined,
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
