/**
 * Plant Variant & Lifecycle Types
 *
 * These types define the structure of plant variants (species templates)
 * and their keyframe-based lifecycle animation system.
 *
 * See docs/variants-and-lifecycle.md for full architecture documentation.
 */

/**
 * A single keyframe in a plant's lifecycle animation.
 *
 * Keyframes define the visual state at a moment in time.
 * Designers have full creative freedom over names, patterns, and timing.
 */
export interface GlyphKeyframe {
  /** Descriptive name for this keyframe (e.g., "bloom", "wilt", "pulse-1") */
  name: string;

  /** Duration this keyframe lasts in seconds */
  duration: number;

  /** 64x64 glyph pattern grid (1 = filled, 0 = empty) */
  pattern: number[][];

  /** Color palette for this keyframe */
  palette: string[];

  /** Optional opacity override (default 1.0) */
  opacity?: number;

  /** Optional scale override (default 1.0) */
  scale?: number;

  /**
   * Allow additional properties for future extensibility.
   * Examples: rotation, blur, glow, etc.
   */
  [key: string]: unknown;
}

/**
 * A plant variant defines a "species" with its lifecycle animation.
 *
 * Variants are defined in TypeScript as the single source of truth,
 * then exported to JSON for Python to consume.
 *
 * Colors are embedded in variants, not a separate matrix:
 * - Fixed-color variants: Palette defined in keyframes, no variation
 * - Multi-color variants: Define colorVariations, quantum selects one
 */
export interface PlantVariant {
  /** Unique identifier for this variant */
  id: string;

  /** Human-readable name */
  name: string;

  /** Optional description for documentation */
  description?: string;

  /**
   * Rarity affects spawn probability.
   * 0.0 = never spawns, 1.0 = most common.
   * Lower values = rarer variants.
   */
  rarity: number;

  /**
   * If true, the plant remains in its first keyframe until observed.
   * Observation triggers germination and starts the lifecycle.
   */
  requiresObservationToGerminate: boolean;

  /**
   * Render mode determines how the plant is displayed.
   * - 'pixel': Traditional 64x64 binary patterns (default)
   * - 'vector': Smooth vector lines using Three.js Line primitives
   */
  renderMode?: "pixel" | "vector";

  /**
   * Ordered array of keyframes defining the lifecycle animation.
   * Any number of keyframes (2, 6, 20+).
   * Durations are in seconds, modified by individual plant's lifecycleModifier.
   * Required for pixel mode variants.
   */
  keyframes: GlyphKeyframe[];

  /**
   * Vector keyframes for vector mode variants.
   * Uses vector primitives instead of binary patterns for smooth rendering.
   * Required when renderMode is 'vector'.
   */
  vectorKeyframes?: VectorKeyframe[];

  /**
   * Optional color variations for multi-color variants.
   *
   * When defined, quantum measurement selects which color set to use.
   * Each variation defines palettes for each keyframe by name.
   *
   * Example: A tulip might have:
   * - "red": { "bud": ["#8B0000", ...], "bloom": ["#FF0000", ...] }
   * - "yellow": { "bud": ["#8B8B00", ...], "bloom": ["#FFFF00", ...] }
   *
   * If not defined, keyframe palettes are used as-is (fixed-color variant).
   */
  colorVariations?: ColorVariation[];

  /**
   * If true, smoothly interpolate between keyframes.
   * If false (default), snap to each keyframe at its start time.
   */
  tweenBetweenKeyframes?: boolean;

  /**
   * If true, loop back to first keyframe after completing the last.
   * If false (default), stay on last keyframe when lifecycle completes.
   */
  loop?: boolean;
}

/**
 * A color variation for multi-color variants.
 *
 * Some plant types (like tulips) can appear in different colors.
 * Quantum measurement selects which variation to use.
 */
export interface ColorVariation {
  /** Name of this color variation (e.g., "red", "yellow", "purple") */
  name: string;

  /** Relative probability of this variation (higher = more common) */
  weight: number;

  /**
   * Palette overrides for each keyframe.
   * Key is keyframe name, value is the palette to use.
   * Keyframes not listed use their default palette.
   */
  palettes: Record<string, string[]>;
}

/**
 * Computed lifecycle state at a point in time.
 *
 * This is calculated on demand from:
 * - germinatedAt timestamp
 * - lifecycleModifier
 * - current time
 *
 * Never stored in the database - always computed.
 */
export interface ComputedLifecycleState {
  /** The currently active keyframe */
  currentKeyframe: GlyphKeyframe;

  /** Index of current keyframe in the variant's keyframes array */
  keyframeIndex: number;

  /** Progress within the current keyframe (0.0 - 1.0) */
  keyframeProgress: number;

  /** Total progress through the entire lifecycle (0.0 - 1.0) */
  totalProgress: number;

  /** Elapsed seconds since germination */
  elapsedSeconds: number;

  /** Total duration of the lifecycle in seconds (with modifier applied) */
  totalDurationSeconds: number;

  /** Previous keyframe for tweening (undefined if on first keyframe) */
  prevKeyframe?: GlyphKeyframe;

  /** Next keyframe for tweening (undefined if on last keyframe) */
  nextKeyframe?: GlyphKeyframe;

  /** True if the lifecycle has completed all keyframes (and not looping) */
  isComplete: boolean;
}

/**
 * Extended Plant type with lifecycle fields.
 *
 * This extends the base Plant interface for use in lifecycle calculations.
 */
export interface PlantWithLifecycle {
  id: string;
  variantId: string;

  /** When the plant started progressing through keyframes (null = not germinated) */
  germinatedAt: Date | null;

  /**
   * Speed multiplier for lifecycle progression.
   * Derived from quantum growthRate trait.
   * 1.0 = normal, 2.0 = 2x faster, 0.5 = 2x slower.
   */
  lifecycleModifier: number;

  /**
   * Selected color variation name for multi-color variants.
   * Null for fixed-color variants or if not yet determined.
   * Selected by quantum measurement for variants with colorVariations.
   */
  colorVariationName: string | null;
}

/**
 * Result of interpolating between two keyframes for tweening.
 */
export interface InterpolatedKeyframe {
  /** Interpolated pattern (each pixel has opacity 0-1) */
  pattern: number[][];

  /** Interpolated color palette */
  palette: string[];

  /** Interpolated opacity */
  opacity: number;

  /** Interpolated scale */
  scale: number;

  /** Source keyframe name */
  fromKeyframe: string;

  /** Target keyframe name */
  toKeyframe: string;

  /** Interpolation progress (0.0 - 1.0) */
  t: number;
}

// ============================================================================
// VECTOR RENDERING TYPES
// ============================================================================

/**
 * Vector primitives for true vector rendering (no pixelation).
 * Coordinates are in a 64x64 space to match pixel pattern dimensions.
 */
export type VectorPrimitive =
  | VectorCircle
  | VectorLine
  | VectorPolygon
  | VectorStar
  | VectorDiamond;

export interface VectorCircle {
  type: "circle";
  cx: number;
  cy: number;
  radius: number;
}

export interface VectorLine {
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface VectorPolygon {
  type: "polygon";
  cx: number;
  cy: number;
  sides: number;
  radius: number;
  /** Rotation in degrees */
  rotation?: number;
}

export interface VectorStar {
  type: "star";
  cx: number;
  cy: number;
  points: number;
  outerRadius: number;
  innerRadius: number;
  /** Rotation in degrees */
  rotation?: number;
}

export interface VectorDiamond {
  type: "diamond";
  cx: number;
  cy: number;
  width: number;
  height: number;
}

/**
 * A keyframe for vector variants.
 * Uses vector primitives instead of binary patterns.
 */
export interface VectorKeyframe {
  /** Descriptive name for this keyframe */
  name: string;

  /** Duration this keyframe lasts in seconds */
  duration: number;

  /** Vector primitives to render */
  primitives: VectorPrimitive[];

  /** Stroke color (hex string, e.g., "#707070") */
  strokeColor: string;

  /** Stroke opacity (0-1) */
  strokeOpacity: number;

  /** Optional scale override (default 1.0) */
  scale?: number;
}

/**
 * Result of interpolating between two vector keyframes for tweening.
 */
export interface InterpolatedVectorKeyframe {
  /** Interpolated primitives (positions and sizes blended) */
  primitives: VectorPrimitive[];

  /** Interpolated stroke color */
  strokeColor: string;

  /** Interpolated stroke opacity */
  strokeOpacity: number;

  /** Interpolated scale */
  scale: number;

  /** Source keyframe name */
  fromKeyframe: string;

  /** Target keyframe name */
  toKeyframe: string;

  /** Interpolation progress (0.0 - 1.0) */
  t: number;
}
