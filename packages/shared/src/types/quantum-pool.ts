/**
 * Pre-computed quantum result pool types.
 *
 * The quantum pool contains pre-computed results from real IonQ quantum hardware/simulator.
 * During observation, plants deterministically select a result from the pool based on their ID,
 * providing instant trait revelation while maintaining quantum authenticity.
 */

/**
 * Resolved visual traits for a plant.
 * This is a subset of the full ResolvedTraits type from the main types module.
 */
export interface PoolResolvedTraits {
  glyphPattern: number[][];
  colorPalette: string[];
  growthRate: number;
  opacity: number;
}

/**
 * A single quantum measurement result with resolved traits.
 */
export interface QuantumPoolResult {
  /** Index in the pool (0-99 for pool size 100) */
  index: number;

  /** Raw measurement results (list of integers from qubit measurements) */
  measurements: number[];

  /** Measurement counts (bitstring → count) */
  counts: Record<string, number>;

  /** Probability distribution (bitstring → probability) */
  probabilities: Record<string, number>;

  /** Resolved visual traits mapped from measurements */
  traits: PoolResolvedTraits;

  /** Execution mode used for this result */
  executionMode: "simulator" | "hardware" | "mock";

  /** Timestamp when this result was computed */
  timestamp: string;

  /** Number of shots used */
  shots: number;

  /** Whether error mitigation was disabled (should be true for authentic results) */
  errorMitigationDisabled: boolean;
}

/**
 * Complete quantum pool for all circuit types.
 */
export interface QuantumPool {
  /** Pool metadata */
  metadata: {
    /** When the pool was generated */
    generatedAt: string;

    /** Pool size per circuit type */
    poolSize: number;

    /** Total number of results across all circuits */
    totalResults: number;

    /** Execution mode used for generation */
    executionMode: "simulator" | "hardware" | "mock";

    /** Whether error mitigation was disabled */
    errorMitigationDisabled: boolean;
  };

  /** Results organized by circuit type */
  pools: {
    superposition: QuantumPoolResult[];
    bell_pair: QuantumPoolResult[];
    ghz_state: QuantumPoolResult[];
    interference: QuantumPoolResult[];
    variational: QuantumPoolResult[];
  };
}

/**
 * Circuit types that have pools.
 */
export type CircuitType = keyof QuantumPool["pools"];

/**
 * Get a deterministic result from the pool based on plant ID.
 *
 * Uses a hash of the plant ID to select a result, ensuring:
 * - Same plant always gets same result
 * - Results are evenly distributed across the pool
 * - No predictable patterns in trait assignment
 */
export function selectFromPool(pool: QuantumPoolResult[], plantId: string): QuantumPoolResult {
  // Simple hash function for deterministic selection
  let hash = 0;
  for (let i = 0; i < plantId.length; i++) {
    hash = (hash << 5) - hash + plantId.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Ensure positive and within pool size
  const index = Math.abs(hash) % pool.length;
  return pool[index]!;
}
