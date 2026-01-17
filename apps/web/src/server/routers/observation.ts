import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import type { ResolvedTraits } from "@quantum-garden/shared";
import {
  GLYPH_PATTERNS,
  COLOR_PALETTES,
  getVariantById,
  getEffectivePalette,
} from "@quantum-garden/shared";

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
 * Generate mock traits that simulate quantum measurement outcomes.
 *
 * This uses pseudorandom generation seeded from the circuit definition
 * to produce reproducible, deterministic trait values. When real quantum
 * integration is enabled, this function will be replaced with actual
 * measurement results.
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
  colorVariationName: string | null
): ResolvedTraits {
  // Extract seed from circuit definition for reproducible randomness
  let seed = 0;
  try {
    const decoded = Buffer.from(circuitDefinition, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded) as { seed?: number };
    seed = parsed.seed ?? Date.now();
  } catch {
    // If parsing fails, use current time as seed
    seed = Date.now();
  }

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

      // Generate resolved traits using mock quantum measurement
      // When real quantum integration is enabled, this will use actual
      // measurement results from IonQ hardware. For now, we use
      // deterministic pseudorandom generation seeded from the circuit.
      const resolvedTraits = generateMockTraits(
        circuitDefinition as string,
        plant.variantId,
        plant.colorVariationName
      );

      const updatedPlant = await ctx.db.plant.update({
        where: { id: input.plantId },
        data: {
          observed: true,
          observedAt: new Date(),
          visualState: "collapsed",
          // Store resolved traits (pre-computed or mock-generated)
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
