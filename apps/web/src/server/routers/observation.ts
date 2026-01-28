import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import type { ResolvedTraits } from "@quantum-garden/shared";
import {
  GLYPH_PATTERNS,
  COLOR_PALETTES,
  getVariantById,
  getEffectivePalette,
} from "@quantum-garden/shared";
import { measureCircuit, getJobStatus } from "../../lib/quantum-client";

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
 * Resolve traits by calling the quantum service.
 *
 * This executes the quantum circuit (on IonQ simulator/hardware or mock)
 * and maps the measurement results to visual traits based on the circuit type.
 *
 * @param plantId - Unique plant identifier for the measurement request
 * @param circuitDefinition - Base64 encoded circuit definition
 * @param circuitId - Circuit type ID for trait mapping (e.g., "superposition", "bell_pair")
 * @returns Resolved traits from quantum measurement
 * @throws If quantum service call fails
 */
async function resolveTraitsFromQuantum(
  plantId: string,
  circuitDefinition: string,
  circuitId: string
): Promise<ResolvedTraits> {
  const response = await measureCircuit({
    plantId,
    circuitDefinition,
    circuitId,
  });

  if (!response.success || !response.traits) {
    throw new Error(response.error ?? "Quantum measurement failed");
  }

  return response.traits;
}

/**
 * Generate fallback mock traits when quantum service is unavailable.
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

      // Get the circuit ID for trait mapping (defaults to "variational")
      // The circuit ID determines which trait mapper is used based on complexity level
      const circuitId = plant.quantumCircuit?.circuitId ?? "variational";
      const ionqJobId = plant.quantumCircuit?.ionqJobId;

      // Check if quantum job has been pre-computed
      let resolvedTraits: ResolvedTraits | null = null;
      let waitingForQuantum = false;
      let executionMode = "mock";

      // If we have a pre-submitted job, check its live status from quantum service
      if (ionqJobId) {
        try {
          // Query quantum service for current job status
          const jobResult = await getJobStatus(ionqJobId);

          if (jobResult.status === "completed" && jobResult.traits) {
            // Job completed - use pre-computed traits
            resolvedTraits = jobResult.traits;
            executionMode = jobResult.executionMode ?? "simulator";
            console.log(
              `[Quantum] Plant ${plant.id} using pre-computed traits (job: ${ionqJobId.substring(0, 8)}..., mode: ${executionMode})`
            );
          } else if (["pending", "submitted", "running"].includes(jobResult.status)) {
            // Job still processing - observation completes but plant stays in superposed state
            // Frontend will show "quantum computation in progress" indicator
            waitingForQuantum = true;
            console.log(
              `[Quantum] Plant ${plant.id} observed but quantum job ${ionqJobId.substring(0, 8)}... still processing (${jobResult.status})`
            );
          } else if (["failed", "timeout"].includes(jobResult.status)) {
            // Job failed - fall back to mock
            console.warn(
              `[Quantum] Job ${ionqJobId} failed for plant ${plant.id} (status: ${jobResult.status}), using mock traits`
            );
            resolvedTraits = generateMockTraits(
              circuitDefinition as string,
              plant.variantId,
              plant.colorVariationName
            );
          } else {
            // Unknown status - fall back to mock
            console.warn(
              `[Quantum] Unknown job status ${jobResult.status} for plant ${plant.id}, using mock traits`
            );
            resolvedTraits = generateMockTraits(
              circuitDefinition as string,
              plant.variantId,
              plant.colorVariationName
            );
          }
        } catch (error) {
          // Job query failed - fall back to mock
          console.warn(
            `[Quantum] Failed to query job ${ionqJobId} for plant ${plant.id}, using mock:`,
            error instanceof Error ? error.message : error
          );
          resolvedTraits = generateMockTraits(
            circuitDefinition as string,
            plant.variantId,
            plant.colorVariationName
          );
        }
      } else {
        // No job ID - try real-time quantum service (legacy path)
        try {
          resolvedTraits = await resolveTraitsFromQuantum(
            plant.id,
            circuitDefinition as string,
            circuitId as string
          );
          executionMode = "simulator";
          console.log(
            `[Quantum] Plant ${plant.id} observed via real-time quantum service (circuit: ${circuitId})`
          );
        } catch (error) {
          // Quantum service unavailable - fall back to mock traits
          console.warn(
            `[Quantum] Service unavailable for plant ${plant.id}, using mock traits:`,
            error instanceof Error ? error.message : error
          );
          resolvedTraits = generateMockTraits(
            circuitDefinition as string,
            plant.variantId,
            plant.colorVariationName
          );
        }
      }

      const updatedPlant = await ctx.db.plant.update({
        where: { id: input.plantId },
        data: {
          observed: true,
          observedAt: new Date(),
          // If waiting for quantum computation, keep in superposed state
          // Otherwise, collapse to show resolved traits
          visualState: waitingForQuantum ? "superposed" : "collapsed",
          // Store resolved traits only if available (not waiting)
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
            const partnerCircuitId = partner.quantumCircuit?.circuitId ?? "variational";
            const partnerJobId = partner.quantumCircuit?.ionqJobId;

            // Check if partner's quantum job has been pre-computed
            let correlatedTraits: ResolvedTraits | null = null;

            // If partner has a pre-submitted job, check its live status from quantum service
            if (partnerJobId) {
              try {
                // Query quantum service for current job status
                const partnerJobResult = await getJobStatus(partnerJobId);

                if (partnerJobResult.status === "completed" && partnerJobResult.traits) {
                  // Job completed - use pre-computed traits
                  correlatedTraits = partnerJobResult.traits;
                  console.log(
                    `[Quantum] Entangled partner ${partner.id} using pre-computed traits (job: ${partnerJobId.substring(0, 8)}...)`
                  );
                } else if (["pending", "submitted", "running"].includes(partnerJobResult.status)) {
                  // Partner job still processing - skip for now
                  // The partner will be revealed when its own observation completes
                  console.log(
                    `[Quantum] Entangled partner ${partner.id} job still processing (${partnerJobResult.status}), will reveal later`
                  );
                  continue;
                } else {
                  // Job failed or unknown status - fall back to mock
                  console.warn(
                    `[Quantum] Partner job ${partnerJobId} failed/timeout (status: ${partnerJobResult.status}), using mock traits`
                  );
                  correlatedTraits = generateMockTraits(
                    partnerCircuit as string,
                    partner.variantId,
                    partner.colorVariationName,
                    i + 1
                  );
                }
              } catch (error) {
                // Job query failed - fall back to mock
                console.warn(
                  `[Quantum] Failed to query job ${partnerJobId} for partner ${partner.id}, using mock:`,
                  error instanceof Error ? error.message : error
                );
                correlatedTraits = generateMockTraits(
                  partnerCircuit as string,
                  partner.variantId,
                  partner.colorVariationName,
                  i + 1
                );
              }
            } else {
              // No job ID - try real-time quantum service (legacy path)
              try {
                correlatedTraits = await resolveTraitsFromQuantum(
                  partner.id,
                  partnerCircuit as string,
                  partnerCircuitId as string
                );
                console.log(
                  `[Quantum] Entangled partner ${partner.id} resolved via real-time quantum service`
                );
              } catch (error) {
                // Fall back to mock with seed offset for correlation
                console.warn(
                  `[Quantum] Service unavailable for partner ${partner.id}, using mock:`,
                  error instanceof Error ? error.message : error
                );
                correlatedTraits = generateMockTraits(
                  partnerCircuit as string,
                  partner.variantId,
                  partner.colorVariationName,
                  i + 1 // Offset based on position in entanglement group
                );
              }
            }

            // Only update partner if we have traits (skip if still computing)
            if (correlatedTraits) {
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

      // Return updated plant with information about entangled partners and quantum status
      // The frontend will refetch plants to get the updated partner states
      return {
        ...updatedPlant,
        entangledPartnersUpdated: plant.entanglementGroupId ? true : false,
        waitingForQuantum,
        quantumJobId: waitingForQuantum ? ionqJobId : undefined,
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
