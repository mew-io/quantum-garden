/**
 * Core type definitions for Quantum Garden
 *
 * These types are shared between the web frontend and API.
 * They define the shape of data flowing through the system.
 */

/** 2D position in the garden coordinate space */
export interface Position {
  x: number;
  y: number;
}

/** Bounding box for collision and containment checks */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Visual state of a plant - either showing superposition or collapsed form */
export type VisualState = "superposed" | "collapsed";

/** Status of a quantum job submitted to IonQ */
export type QuantumJobStatus = "pending" | "submitted" | "running" | "completed" | "failed";

/**
 * A plant in the garden.
 *
 * Plants exist in quantum superposition until observed, at which point
 * their visual form collapses to a single resolved configuration.
 */
export interface Plant {
  id: string;
  position: Position;
  observed: boolean;
  observedAt?: Date;
  quantumCircuitId: string;
  /** Circuit type used to generate this plant's quantum state */
  circuitType?: string;
  visualState: VisualState;
  entanglementGroupId?: string;
  traits?: ResolvedTraits;
  createdAt: Date;
  updatedAt: Date;

  // Lifecycle fields
  /** Variant ID referencing a PlantVariant definition */
  variantId: string;
  /** When the plant's lifecycle started (null = dormant/seed state) */
  germinatedAt?: Date | null;
  /** When the plant died and was removed from visualization */
  diedAt?: Date | null;
  /** Speed multiplier for lifecycle progression (from quantum growthRate) */
  lifecycleModifier: number;
  /** Selected color variation for multi-color variants */
  colorVariationName?: string | null;
}

/**
 * Traits resolved from quantum measurement.
 *
 * When a plant is observed, quantum measurement results are mapped
 * to these concrete visual and behavioral properties.
 *
 * The type is intentionally open: the index signature allows plant variants
 * to store custom properties alongside the standard base fields. These extras
 * come from two sources:
 *
 * - **Path A (custom Python circuit):** The circuit's `map_measurements()`
 *   returns plant-specific properties in `ResolvedTraits.extra` (e.g., a fern
 *   circuit returns `branchCount`, `asymmetry`, `leafDensity`). These flow
 *   through the pool and are stored directly here.
 *
 * - **Path B (TypeScript mapping):** A variant's `quantumMapping.schema` or
 *   `quantumMapping.resolve()` derives properties from `quantumSignals` at
 *   observation time. These are merged in before storage.
 *
 * Variant builders access custom properties via `ctx.traits`, cast to their
 * own interface. Consistency between mapping and builder is the variant
 * author's responsibility.
 */
export interface ResolvedTraits {
  /** Pixel pattern for the plant glyph (2D array: 1 = filled, 0 = empty) */
  glyphPattern?: number[][];
  /** Color palette derived from quantum measurement */
  colorPalette?: string[];
  /** Growth rate modifier (0.5 = slow, 1.0 = normal, 2.0 = fast) */
  growthRate?: number;
  /** Opacity of the rendered glyph (0.0 - 1.0) */
  opacity?: number;
  /**
   * Normalized quantum signals computed from the pool result's probability
   * distribution at observation time. Stored for Path B TypeScript mapping
   * and educational UI display.
   */
  quantumSignals?: import("./quantum/signals").QuantumSignals;
  /** Custom and extended properties — open to any JSON-serializable value */
  [key: string]: unknown;
}

/**
 * A quantum circuit record stored in the database.
 *
 * Each plant references a quantum circuit that encodes its possible traits.
 * Circuits are executed asynchronously on IonQ hardware.
 */
export interface QuantumRecord {
  id: string;
  /** Qiskit circuit definition serialized as JSON */
  circuitDefinition: object;
  /** IonQ job ID once submitted */
  ionqJobId?: string;
  status: QuantumJobStatus;
  /** Raw measurement results from quantum execution */
  measurements?: number[];
  /** Probability distribution from quantum execution */
  probabilities?: number[];
  createdAt: Date;
  completedAt?: Date;
}

/**
 * An observation event recording when a plant was observed.
 *
 * Observations are rare, deliberate, and irreversible. They occur when
 * the reticle overlaps an eligible plant for the required dwell duration.
 */
export interface ObservationEvent {
  id: string;
  plantId: string;
  regionId: string;
  timestamp: Date;
  quantumRecordId: string;
}

/**
 * An invisible observation region where observation can occur.
 *
 * Regions are never rendered. A plant must be fully contained within
 * an active region for observation to be possible.
 */
export interface ObservationRegion {
  id: string;
  center: Position;
  radius: number;
  active: boolean;
  /** How long the region remains active (seconds) */
  lifetime: number;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * The system reticle that drifts autonomously through the garden.
 *
 * The reticle represents system attention, not user control.
 * It moves slowly with gentle pauses and direction changes.
 */
export interface Reticle {
  id: string;
  position: Position;
  /** Size in pixels (typically 3x3 or 5x5) */
  size: number;
  /** Current velocity in pixels per second */
  velocity: Position;
  /** Time until next direction change (seconds) */
  nextDirectionChange: number;
}

/**
 * Payload sent to the backend when observation completes.
 */
export interface ObservationPayload {
  plantId: string;
  regionId: string;
  reticleId: string;
  timestamp: Date;
}

/**
 * Response from the quantum service after measurement.
 */
export interface MeasurementResult {
  plantId: string;
  success: boolean;
  traits?: ResolvedTraits;
  error?: string;
}

/**
 * A group of entangled plants that share correlated traits.
 */
export interface EntanglementGroup {
  id: string;
  plantIds: string[];
  quantumCircuitId: string;
  createdAt: Date;
}

/**
 * Comparison of correlated and different traits between entangled plants.
 * Used for educational UI showing what quantum entanglement affects.
 */
export interface TraitComparison {
  /** Traits that are correlated due to quantum entanglement */
  correlated: {
    /** Matching color palette */
    colorPalette: string[];
    /** Matching growth rate modifier */
    growthRate: number;
    /** Matching opacity */
    opacity: number;
    /** Matching glyph pattern (visual pattern hash) */
    glyphPattern: number[][];
  };
  /** Traits that differ between entangled plants */
  different: {
    /** Plant species/variant ID */
    variantId: string;
    /** Color variation name if applicable */
    colorVariationName?: string | null;
  };
}

// =============================================================================
// Quantum Circuit Types
// =============================================================================

/**
 * Complexity levels for quantum circuits.
 *
 * Each level teaches a different quantum concept:
 * - 1: Superposition (single qubit)
 * - 2: Entanglement (Bell pairs)
 * - 3: Multi-party entanglement (GHZ states)
 * - 4: Quantum interference
 * - 5: Variational/parameterized circuits
 */
export type CircuitComplexityLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Metadata for a registered quantum circuit type.
 *
 * Each circuit type is a self-contained module that can be
 * contributed by the community.
 */
export interface CircuitMetadata {
  /** Unique identifier (e.g., "superposition", "bell_pair") */
  id: string;
  /** Display name (e.g., "Single Qubit Superposition") */
  name: string;
  /** Complexity level (1-5) */
  level: CircuitComplexityLevel;
  /** Number of qubits used */
  qubitCount: number;
  /** Quantum concept being taught */
  concept: string;
  /** Educational description */
  description: string;
  /** Minimum plant variant rarity for this circuit */
  minRarity: number;
  /** Maximum plant variant rarity for this circuit */
  maxRarity: number;
}

/**
 * Response from listing all available circuits.
 */
export interface ListCircuitsResponse {
  circuits: CircuitMetadata[];
  executionMode: "mock" | "simulator" | "hardware";
}

/**
 * Request to generate a quantum circuit.
 */
export interface GenerateCircuitRequest {
  seed: number;
  /** Specific circuit type to use */
  circuitId?: string;
  /** Auto-select circuit based on plant rarity */
  rarity?: number;
}

/**
 * Response from generating a circuit.
 */
export interface GenerateCircuitResponse {
  circuitId: string;
  circuitDefinition: string;
  numQubits: number;
  level: CircuitComplexityLevel;
  concept: string;
}

/**
 * Request to measure a plant's quantum circuit.
 */
export interface MeasureCircuitRequest {
  plantId: string;
  circuitDefinition: string;
  circuitId: string;
  shots?: number;
}

/**
 * Response from measuring a circuit.
 */
export interface MeasureCircuitResponse {
  plantId: string;
  success: boolean;
  traits?: ResolvedTraits;
  executionMode?: "mock" | "simulator" | "hardware";
  error?: string;
}

// =============================================================================
// Quantum Job Types (Async Execution)
// =============================================================================

/**
 * Status of a quantum job.
 */
export type JobStatus = "pending" | "submitted" | "running" | "completed" | "failed" | "timeout";

/**
 * Request to submit a quantum job.
 */
export interface SubmitJobRequest {
  plantId: string;
  circuitId?: string;
  rarity?: number;
  seed: number;
  shots?: number;
}

/**
 * Response from submitting a job.
 */
export interface SubmitJobResponse {
  jobId: string;
  status: JobStatus;
  circuitId: string;
  executionMode: "mock" | "simulator" | "hardware";
}

/**
 * Job status and results.
 */
export interface JobStatusResponse {
  jobId: string;
  plantId: string;
  circuitId: string;
  status: JobStatus;
  createdAt: string;
  submittedAt?: string;
  completedAt?: string;
  executionMode?: "mock" | "simulator" | "hardware";
  traits?: ResolvedTraits;
  error?: string;
}

/**
 * Job queue statistics.
 */
export interface JobStatsResponse {
  pending: number;
  submitted: number;
  running: number;
  completed: number;
  failed: number;
  timeout: number;
  total: number;
  executionMode: "mock" | "simulator" | "hardware";
}

// =============================================================================
// Quantum Event Log Types
// =============================================================================

/**
 * Types of quantum events tracked in the event log.
 */
export type QuantumEventType =
  | "observation"
  | "germination"
  | "entanglement"
  | "wave_germination"
  | "death";

/**
 * Circuit types for educational content mapping.
 */
export type CircuitType =
  | "superposition"
  | "bell_pair"
  | "ghz_state"
  | "interference"
  | "variational";

/**
 * Unified quantum event for the event log.
 *
 * Captures all types of quantum events with relevant metadata
 * for display in the persistent event log panel.
 */
export interface QuantumEvent {
  /** Unique event ID */
  id: string;
  /** Type of quantum event */
  type: QuantumEventType;
  /** When the event occurred */
  timestamp: Date;

  // Plant info
  /** ID of the primary plant involved */
  plantId: string;
  /** Plant variant ID */
  variantId?: string;

  // Observation-specific fields
  /** Circuit type used (for observations) */
  circuitId?: CircuitType;
  /** Execution mode (mock, simulator, hardware) */
  executionMode?: "mock" | "simulator" | "hardware";
  /** Resolved traits from quantum measurement */
  resolvedTraits?: ResolvedTraits;

  // Entanglement-specific fields
  /** Entanglement group ID */
  entanglementGroupId?: string;
  /** IDs of entangled partner plants */
  partnerPlantIds?: string[];

  // Germination-specific fields
  /** Type of germination event */
  germinationType?: "normal" | "wave" | "guaranteed";
  /** How long the plant was dormant before germinating (ms) */
  dormancyDuration?: number;
  /** Number of plants in a wave germination */
  waveSize?: number;

  // Measurement-specific fields (observation events)
  /** Summary of quantum measurement results */
  measurementSummary?: {
    /** Total number of measurement shots */
    shots: number;
    /** Most frequently measured bitstring (e.g., "00", "111") */
    dominantBitstring: string;
    /** Probability of the dominant outcome (0-1) */
    dominantProbability: number;
    /** Number of distinct measurement outcomes observed */
    distinctOutcomes: number;
  };

  // Lifecycle-specific fields
  /** Plant creation timestamp (for computing lifespan in death events) */
  createdAt?: Date;
}

// Re-export quantum pool types
export * from "./types/quantum-pool";
