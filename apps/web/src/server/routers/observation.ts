import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import type { ResolvedTraits, CircuitType } from "@quantum-garden/shared";
import {
  GLYPH_PATTERNS,
  COLOR_PALETTES,
  getVariantById,
  getEffectivePalette,
  selectFromPool,
} from "@quantum-garden/shared";
import { getQuantumPool } from "../../lib/quantum-client";

/**
 * Simple seeded pseudo-random number generator.
 * Uses a linear congruential generator for reproducible randomness.
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Generate fallback mock traits when quantum pool is unavailable.
 *
 * This uses pseudorandom generation seeded from the circuit definition
 * to produce reproducible, deterministic trait values. Used as fallback
 * when quantum service is unreachable or returns an error.
 *
 * The traits generated are:
 * - glyphPattern: Selected from predefined patterns based on variant/seed
 * - colorPalette: Uses variant's palette or falls back to randomized selection
 * - growthRate: 0.5 to 1.5 (slow to fast lifecycle)
 * - opacity: 0.7 to 1.0 (maintains visibility)
 */
function generateMockTraits(
  circuitDefinition: string,
  variantId: string,
  colorVariationName: string | null,
  seedOffset: number = 0
): ResolvedTraits {
  // Extract seed from circuit definition for reproducible randomness
  let baseSeed = 0;
  try {
    const decoded = Buffer.from(circuitDefinition, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded) as { seed?: number };
    baseSeed = parsed.seed ?? Date.now();
  } catch {
    // If parsing fails, use current time as seed
    baseSeed = Date.now();
  }

  // Apply offset for entangled partners (creates correlated but distinct traits)
  const seed = baseSeed + seedOffset * 1000;
  const random = seededRandom(seed);

  // Get variant for palette selection
  const variant = getVariantById(variantId);

  // Select a glyph pattern based on seed
  const patternIndex = Math.floor(random() * GLYPH_PATTERNS.length);
  const selectedPattern = GLYPH_PATTERNS[patternIndex];
  const glyphPattern = selectedPattern?.grid ?? GLYPH_PATTERNS[0]!.grid;

  // Use variant's palette if available, otherwise select randomly
  let colorPalette: string[];
  if (variant && variant.keyframes[0]) {
    colorPalette = getEffectivePalette(variant.keyframes[0], variant, colorVariationName ?? null);
  } else {
    const paletteIndex = Math.floor(random() * COLOR_PALETTES.length);
    const selectedPalette = COLOR_PALETTES[paletteIndex];
    colorPalette = selectedPalette?.colors ?? COLOR_PALETTES[0]!.colors;
  }

  // Generate growth rate (0.5 to 1.5)
  const growthRate = 0.5 + random();

  // Generate opacity (0.7 to 1.0)
  const opacity = 0.7 + random() * 0.3;

  return {
    glyphPattern,
    colorPalette,
    growthRate,
    opacity,
  };
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

      // Get the circuit ID for trait selection
      const circuitId = (plant.quantumCircuit?.circuitId ?? "variational") as CircuitType;

      // Resolve traits from pre-computed quantum pool
      let resolvedTraits: ResolvedTraits;
      let executionMode = "mock";

      try {
        // Load the quantum pool
        const pool = await getQuantumPool();

        // Select result deterministically based on plant ID
        const circuitPool = pool.pools[circuitId];
        const poolResult = selectFromPool(circuitPool, plant.id);

        // Use the pre-computed traits
        resolvedTraits = poolResult.traits as ResolvedTraits;
        executionMode = poolResult.executionMode;

        console.log(
          `[Quantum] Plant ${plant.id} using pool result ${poolResult.index} from ${circuitId} (mode: ${executionMode})`
        );
      } catch (error) {
        // Pool unavailable - fall back to mock traits
        console.warn(
          `[Quantum] Pool unavailable for plant ${plant.id}, using mock traits:`,
          error instanceof Error ? error.message : error
        );
        resolvedTraits = generateMockTraits(
          circuitDefinition as string,
          plant.variantId,
          plant.colorVariationName
        );
      }

      const updatedPlant = await ctx.db.plant.update({
        where: { id: input.plantId },
        data: {
          observed: true,
          observedAt: new Date(),
          visualState: "collapsed",
          traits: resolvedTraits as unknown as object,
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

      // If this plant is entangled, also reveal its partners with correlated traits
      if (plant.entanglementGroupId) {
        const entangledPartners = await ctx.db.plant.findMany({
          where: {
            entanglementGroupId: plant.entanglementGroupId,
            id: { not: plant.id },
            observed: false,
          },
          include: { quantumCircuit: true },
        });

        // Update each entangled partner with correlated traits
        for (let i = 0; i < entangledPartners.length; i++) {
          const partner = entangledPartners[i]!;
          const partnerCircuit = partner.quantumCircuit?.circuitDefinition;

          if (partnerCircuit) {
            const partnerCircuitId = (partner.quantumCircuit?.circuitId ??
              "variational") as CircuitType;

            // Resolve correlated traits from pre-computed quantum pool
            let correlatedTraits: ResolvedTraits;

            try {
              // Load the quantum pool
              const partnerPool = await getQuantumPool();

              // Select result deterministically based on partner ID
              const partnerCircuitPool = partnerPool.pools[partnerCircuitId];
              const partnerPoolResult = selectFromPool(partnerCircuitPool, partner.id);

              // Use the pre-computed traits
              correlatedTraits = partnerPoolResult.traits as ResolvedTraits;

              console.log(
                `[Quantum] Entangled partner ${partner.id} using pool result ${partnerPoolResult.index} from ${partnerCircuitId}`
              );
            } catch (error) {
              // Pool unavailable - fall back to mock traits
              console.warn(
                `[Quantum] Pool unavailable for partner ${partner.id}, using mock:`,
                error instanceof Error ? error.message : error
              );
              correlatedTraits = generateMockTraits(
                partnerCircuit as string,
                partner.variantId,
                partner.colorVariationName,
                i + 1
              );
            }

            await ctx.db.plant.update({
              where: { id: partner.id },
              data: {
                observed: true,
                observedAt: new Date(),
                visualState: "collapsed",
                traits: correlatedTraits as unknown as object,
              },
            });

            // Record observation event for partner
            await ctx.db.observationEvent.create({
              data: {
                plantId: partner.id,
                regionId: input.regionId,
                quantumRecordId: partner.quantumCircuitId,
              },
            });
          }
        }
      }

      // Deactivate the observation region if it exists in the database.
      // Note: Regions may be created in-memory by ObservationSystem and not persisted.
      // This update is optional - if the region doesn't exist, we skip it.
      try {
        await ctx.db.observationRegion.update({
          where: { id: input.regionId },
          data: { active: false },
        });
      } catch {
        // Region not found in database - this is expected for in-memory regions
      }

      // Return updated plant with information about entangled partners
      // The frontend will refetch plants to get the updated partner states
      return {
        ...updatedPlant,
        entangledPartnersUpdated: plant.entanglementGroupId ? true : false,
      };
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
