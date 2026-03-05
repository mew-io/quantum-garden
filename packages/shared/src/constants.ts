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

/** Garden canvas configuration (4K resolution for gallery displays) */
export const CANVAS = {
  /** Background color - warm cream watercolor paper */
  BACKGROUND_COLOR: "#F8F5F0",
  /** Garden world width (4K UHD) */
  DEFAULT_WIDTH: 3840,
  /** Garden world height (4K UHD) */
  DEFAULT_HEIGHT: 2160,
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

/** UI timing configuration */
export const UI_TIMING = {
  /** Toast notification auto-dismiss (milliseconds) */
  NOTIFICATION_DISMISS_MS: 5000,
  /** Context panel auto-dismiss (milliseconds) */
  CONTEXT_PANEL_DISMISS_MS: 30000,
  /** Maximum visible notifications at once */
  MAX_NOTIFICATIONS: 3,
} as const;
