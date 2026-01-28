/**
 * Constants for Quantum Garden
 *
 * These values define system behavior and can be tuned for different
 * deployment contexts (web vs gallery installation).
 */

/** Observation region configuration */
export const OBSERVATION_REGION = {
  /** Minimum radius in pixels */
  MIN_RADIUS: 80,
  /** Maximum radius in pixels */
  MAX_RADIUS: 200,
  /** Only one active region at a time */
  MAX_ACTIVE: 1,
  /** Minimum lifetime in seconds */
  MIN_LIFETIME: 30,
  /** Maximum lifetime in seconds */
  MAX_LIFETIME: 120,
} as const;

/** Reticle configuration */
export const RETICLE = {
  /** Size options in pixels */
  SIZES: [3, 5] as const,
  /** Default size */
  DEFAULT_SIZE: 3,
  /** Minimum drift speed in pixels per second */
  MIN_SPEED: 10,
  /** Maximum drift speed in pixels per second */
  MAX_SPEED: 30,
  /** Minimum pause duration in seconds */
  MIN_PAUSE: 2,
  /** Maximum pause duration in seconds */
  MAX_PAUSE: 6,
  /** Color (neutral gray) */
  COLOR: "#888888",
} as const;

/** Dwell tracking configuration */
export const DWELL = {
  /** Minimum dwell duration for observation (seconds) */
  MIN_DURATION: 5,
  /** Preferred dwell duration range (seconds) */
  PREFERRED_MIN: 10,
  PREFERRED_MAX: 20,
  /** Default dwell duration (seconds) */
  DEFAULT_DURATION: 15,
} as const;

/** System cooldown after observation */
export const COOLDOWN = {
  /** Minimum cooldown in seconds */
  MIN: 10,
  /** Maximum cooldown in seconds */
  MAX: 30,
  /** Default cooldown in seconds */
  DEFAULT: 20,
} as const;

/** Plant glyph configuration */
export const GLYPH = {
  /** Maximum glyph size in pixels */
  MAX_SIZE: 64,
  /** Minimum glyph size in pixels */
  MIN_SIZE: 16,
  /** Opacity for superposed state (multiple faint configurations) */
  SUPERPOSED_OPACITY: 0.3,
  /** Opacity for collapsed state (single resolved form) */
  COLLAPSED_OPACITY: 1.0,
} as const;

/** Garden canvas configuration */
export const CANVAS = {
  /** Background color - light warm cream for contrast with pastel plants */
  BACKGROUND_COLOR: "#F5F0E8",
  /** Default width */
  DEFAULT_WIDTH: 1200,
  /** Default height */
  DEFAULT_HEIGHT: 800,
} as const;

/** Quantum circuit configuration */
export const QUANTUM = {
  /** Default number of trait qubits per plant */
  DEFAULT_TRAIT_QUBITS: 5,
  /** Maximum qubits per circuit (IonQ limit consideration) */
  MAX_QUBITS: 11,
  /** Default number of shots for measurement */
  DEFAULT_SHOTS: 100,
} as const;

/** API endpoints */
export const API = {
  /** tRPC base path */
  TRPC_PATH: "/api/trpc",
  /** Quantum service health check */
  QUANTUM_HEALTH: "/health",
} as const;
