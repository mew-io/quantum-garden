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
 */
export interface ResolvedTraits {
  /** Pixel pattern for the plant glyph (2D array: 1 = filled, 0 = empty) */
  glyphPattern: number[][];
  /** Color palette derived from quantum measurement */
  colorPalette: string[];
  /** Growth rate modifier (0.5 = slow, 1.0 = normal, 2.0 = fast) */
  growthRate: number;
  /** Opacity of the rendered glyph (0.0 - 1.0) */
  opacity: number;
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
