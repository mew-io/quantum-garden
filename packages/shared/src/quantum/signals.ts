/**
 * Quantum Signals
 *
 * Normalized [0–1] scalar metrics derived from a quantum pool result's
 * probability distribution. These serve as the vocabulary for TypeScript-side
 * quantum property mappings (Path B), where a variant uses a generic circuit
 * (superposition, bell_pair, etc.) and derives plant-specific properties here
 * rather than in a custom Python circuit.
 *
 * For variants with a custom Python circuit (Path A), the circuit's
 * `map_measurements()` returns plant-specific properties directly in
 * `ResolvedTraits.extra`, and `QuantumSignals` are still computed and stored
 * but the variant's builder reads from `ctx.traits` directly.
 */

/**
 * Normalized quantum signals derived from a pool result's probability
 * distribution. All values are in [0, 1].
 */
export interface QuantumSignals {
  /**
   * Shannon entropy of the probability distribution, normalized by the
   * maximum possible entropy for this circuit's qubit count.
   * 0 = fully deterministic (one outcome dominates), 1 = maximum uncertainty.
   */
  entropy: number;

  /**
   * Probability of the most frequently measured outcome (0–1).
   * High dominance = strong "favorite" state. Inverse of spread.
   */
  dominance: number;

  /**
   * Fraction of all possible bitstrings (2^qubits) that were actually observed.
   * 0 = only one distinct outcome, 1 = every possible bitstring was seen.
   */
  spread: number;

  /**
   * Fraction of measured outcomes with an even number of 1-bits.
   * 0.5 = balanced (no parity bias). Deviations capture quantum parity correlations.
   */
  parityBias: number;

  /**
   * The existing growthRate (0.5–2.0) normalized to [0, 1].
   * Provided for convenience so schemas only need one signal vocabulary.
   */
  growth: number;

  /**
   * The existing opacity (0.7–1.0) normalized to [0, 1].
   * Provided for convenience.
   */
  certainty: number;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, isFinite(v) ? v : 0));
}

/**
 * Compute quantum signals from a pool result's probability distribution.
 *
 * @param probabilities - Bitstring → probability map from the pool result
 * @param numQubits - Number of qubits in the circuit (determines max entropy)
 * @param growthRate - Base growthRate trait (0.5–2.0)
 * @param opacity - Base opacity trait (0.7–1.0)
 */
export function computeQuantumSignals(
  probabilities: Record<string, number>,
  numQubits: number,
  growthRate: number,
  opacity: number
): QuantumSignals {
  const probValues = Object.values(probabilities);
  const maxPossibleOutcomes = Math.pow(2, numQubits);

  // Shannon entropy normalized by max possible entropy
  let rawEntropy = 0;
  for (const p of probValues) {
    if (p > 0) rawEntropy -= p * Math.log2(p);
  }
  const maxEntropy = Math.log2(maxPossibleOutcomes);
  const entropy = clamp01(maxEntropy > 0 ? rawEntropy / maxEntropy : 0);

  // Dominance: probability of most frequent outcome
  const dominance = clamp01(probValues.length > 0 ? Math.max(...probValues) : 0.5);

  // Spread: fraction of possible bitstrings that appeared
  const spread = clamp01(probValues.length / maxPossibleOutcomes);

  // Parity bias: fraction of outcomes with even count of 1-bits
  let evenParityWeight = 0;
  for (const [bitstring, prob] of Object.entries(probabilities)) {
    const onesCount = bitstring.split("").filter((b) => b === "1").length;
    if (onesCount % 2 === 0) evenParityWeight += prob;
  }
  const parityBias = clamp01(evenParityWeight);

  // Normalized versions of existing base traits
  const growth = clamp01((growthRate - 0.5) / 1.5); // 0.5–2.0 → 0–1
  const certainty = clamp01((opacity - 0.7) / 0.3); // 0.7–1.0 → 0–1

  return { entropy, dominance, spread, parityBias, growth, certainty };
}
