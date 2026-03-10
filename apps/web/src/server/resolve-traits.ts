/**
 * Trait Resolution - Pre-compute traits from quantum pool at plant creation time
 *
 * Plants get their traits immediately when created, not at observation time.
 * This uses the pre-computed quantum pool to deterministically select traits
 * based on plant/group ID and circuit type.
 */

import type { ResolvedTraits, CircuitType } from "@quantum-garden/shared";
import {
  GLYPH_PATTERNS,
  COLOR_PALETTES,
  getVariantById,
  getEffectivePalette,
  selectFromPool,
  computeQuantumSignals,
  resolveQuantumProperties,
} from "@quantum-garden/shared";
import { getQuantumPool } from "../lib/quantum-client";

/**
 * Standard pool circuit types and fallback mapping for custom circuits.
 */
const STANDARD_POOL_CIRCUITS = new Set<CircuitType>([
  "superposition",
  "bell_pair",
  "ghz_state",
  "interference",
  "variational",
]);
const CUSTOM_CIRCUIT_POOL_FALLBACK: Record<string, CircuitType> = {
  quantum_fern: "interference",
};

function getPoolCircuitId(circuitId: string): CircuitType {
  if (STANDARD_POOL_CIRCUITS.has(circuitId as CircuitType)) {
    return circuitId as CircuitType;
  }
  return CUSTOM_CIRCUIT_POOL_FALLBACK[circuitId] ?? "interference";
}

/**
 * Enrich pool-resolved traits with quantum signals and TypeScript-side mapping.
 */
function enrichTraits(
  baseTraits: ResolvedTraits,
  probabilities: Record<string, number>,
  variantId: string
): ResolvedTraits {
  const numQubits = Object.keys(probabilities)[0]?.length ?? 1;
  const signals = computeQuantumSignals(
    probabilities,
    numQubits,
    typeof baseTraits.growthRate === "number" ? baseTraits.growthRate : 1,
    typeof baseTraits.opacity === "number" ? baseTraits.opacity : 0.85
  );
  const variant = getVariantById(variantId);
  const tsProps = variant?.quantumMapping
    ? resolveQuantumProperties(variant.quantumMapping, signals)
    : {};
  return { ...baseTraits, quantumSignals: signals, ...tsProps };
}

/**
 * Simple seeded pseudo-random number generator.
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
 */
function generateMockTraits(
  variantId: string,
  colorVariationName: string | null,
  plantId: string
): ResolvedTraits {
  // Use plant ID as seed for reproducible randomness
  let baseSeed = 0;
  for (let i = 0; i < plantId.length; i++) {
    baseSeed = (baseSeed << 5) - baseSeed + plantId.charCodeAt(i);
    baseSeed = baseSeed & baseSeed;
  }

  const random = seededRandom(Math.abs(baseSeed));

  const variant = getVariantById(variantId);

  // Select a glyph pattern
  const patternIndex = Math.floor(random() * GLYPH_PATTERNS.length);
  const selectedPattern = GLYPH_PATTERNS[patternIndex];
  const glyphPattern = selectedPattern?.grid ?? GLYPH_PATTERNS[0]!.grid;

  // Use variant's palette if available
  let colorPalette: string[];
  if (variant && variant.keyframes[0]) {
    colorPalette = getEffectivePalette(variant.keyframes[0], variant, colorVariationName ?? null);
  } else {
    const paletteIndex = Math.floor(random() * COLOR_PALETTES.length);
    const selectedPalette = COLOR_PALETTES[paletteIndex];
    colorPalette = selectedPalette?.colors ?? COLOR_PALETTES[0]!.colors;
  }

  const growthRate = 0.5 + random() * 1.5;
  const opacity = 0.7 + random() * 0.3;

  // Generate mock quantum signals
  const mockProbs: Record<string, number> = {};
  const numQubits = 3;
  const numOutcomes = Math.pow(2, numQubits);
  let total = 0;
  const rawWeights: number[] = [];
  for (let i = 0; i < numOutcomes; i++) {
    const w = random() + 0.01;
    rawWeights.push(w);
    total += w;
  }
  for (let i = 0; i < numOutcomes; i++) {
    const bitstring = i.toString(2).padStart(numQubits, "0");
    mockProbs[bitstring] = rawWeights[i]! / total;
  }

  const quantumSignals = computeQuantumSignals(mockProbs, numQubits, growthRate, opacity);

  return { glyphPattern, colorPalette, growthRate, opacity, quantumSignals };
}

/**
 * Resolve traits for a plant from the quantum pool.
 *
 * Called at plant creation time to pre-compute traits.
 * Uses the quantum pool deterministically based on plant ID and circuit type.
 *
 * @returns Resolved traits and optional measurement data for the quantum record
 */
export async function resolveTraitsFromPool(params: {
  plantId: string;
  circuitId: string;
  variantId: string;
  colorVariationName?: string | null;
  entanglementGroupId?: string | null;
}): Promise<{
  traits: ResolvedTraits;
  executionMode: string;
  measurements?: number[];
  probabilities?: number[];
}> {
  const { plantId, circuitId, variantId, colorVariationName, entanglementGroupId } = params;

  try {
    const pool = await getQuantumPool();

    // For entangled plants, use group ID for correlated results
    const poolSeed = entanglementGroupId ?? plantId;
    const poolCircuitId = getPoolCircuitId(circuitId);
    const circuitPool = pool.pools[poolCircuitId];
    const poolResult = selectFromPool(circuitPool, poolSeed);

    const traits = enrichTraits(
      poolResult.traits as ResolvedTraits,
      poolResult.probabilities,
      variantId
    );

    return {
      traits,
      executionMode: poolResult.executionMode,
      measurements: poolResult.measurements,
      probabilities: Object.values(poolResult.probabilities),
    };
  } catch {
    // Pool unavailable — fall back to mock traits
    const traits = generateMockTraits(variantId, colorVariationName ?? null, plantId);
    const variant = getVariantById(variantId);
    const tsProps = variant?.quantumMapping
      ? resolveQuantumProperties(variant.quantumMapping, traits.quantumSignals ?? null)
      : {};

    return {
      traits: { ...traits, ...tsProps },
      executionMode: "mock",
    };
  }
}
