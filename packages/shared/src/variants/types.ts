/**
 * Plant Variant & Lifecycle Types
 *
 * These types define the structure of plant variants (species templates)
 * and their keyframe-based lifecycle animation system.
 *
 * See docs/variants-and-lifecycle.md for full architecture documentation.
 */

import type { ResolvedTraits } from "../types";
import type { QuantumSignals } from "../quantum/signals";

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

// ============================================================================
// QUANTUM PROPERTY MAPPING TYPES
// ============================================================================

/**
 * A single declarative mapping from a quantum signal to a named property.
 *
 * The signal (always [0, 1]) is optionally curved, then linearly mapped
 * to the output range. Used in `QuantumPropertySchema` as the easy path
 * for variants that use generic circuits (Path B).
 *
 * Example:
 *   petalCount: { signal: 'entropy', range: [3, 8], default: 5, round: true }
 *   → When entropy is 0.72: 3 + 0.72 * (8-3) = 6.6 → floored to 6
 */
export interface QuantumPropertyMapping {
  /** Which normalized quantum signal drives this property */
  signal: keyof QuantumSignals;
  /** Output range [min, max] */
  range: [number, number];
  /** Default value when quantum signals are unavailable (unobserved plant) */
  default: number;
  /** If true, floor the result to an integer (useful for counts) */
  round?: boolean;
  /**
   * Optional easing curve applied before range mapping.
   * 'easeIn': slow start (t²), 'easeOut': slow end ((1-(1-t)²))
   */
  curve?: "linear" | "easeIn" | "easeOut";
}

/**
 * Declarative schema for per-variant quantum property mappings.
 * Each key is a property name; each value describes how to derive it
 * from a quantum signal.
 */
export type QuantumPropertySchema = Record<string, QuantumPropertyMapping>;

/**
 * Quantum property configuration for a plant variant.
 *
 * Supports two modes that can be used individually or combined:
 *
 * **Schema (easy path):** Declarative linear mappings from signals to ranges.
 * Good for simple properties that correlate directly with one signal.
 *
 * **Resolve (power-user path):** Full custom function. Receives all signals,
 * can combine them, apply conditionals, return any data structure needed.
 * Output overrides schema output for overlapping keys.
 *
 * When both are provided, schema runs first, then resolve merges on top.
 * Called with `null` signals for unobserved plants — must return safe defaults.
 *
 * Used for variants with generic circuits (Path B). Variants with custom
 * Python circuits (Path A) don't need this — their circuit's `map_measurements()`
 * already returns plant-specific properties in `ResolvedTraits.extra`.
 */
export interface QuantumPropertyConfig {
  schema?: QuantumPropertySchema;
  resolve?: (signals: QuantumSignals | null) => Record<string, unknown>;
}

/**
 * A single trait control for the sandbox UI.
 *
 * When a variant defines `sandboxControls`, the sandbox renders a slider
 * for each control and passes the values directly into the watercolor
 * builder's `ctx.traits`, bypassing quantum measurement. Useful for
 * Path A variants (custom Python circuits) whose traits are normally
 * only available after quantum observation.
 */
export interface SandboxTraitControl {
  /** Trait key — must match the key in ctx.traits (from circuit's extra dict) */
  key: string;
  /** Display label shown above the slider */
  label: string;
  /** Minimum slider value */
  min: number;
  /** Maximum slider value */
  max: number;
  /** Slider step size */
  step: number;
  /** Default value when the slider is first shown */
  default: number;
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

  /**
   * If true, this variant will not spawn in the garden.
   * Existing plants of this variant are unaffected.
   * The variant still appears in the sandbox (marked as disabled).
   */
  disabled?: boolean;

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
   * - 'watercolor': Layered semi-transparent shapes for painterly effect
   */
  renderMode?: "pixel" | "vector" | "watercolor";

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
   * Watercolor configuration for watercolor mode variants.
   * Defines lifecycle keyframes, watercolor effect settings, and a builder
   * function that produces watercolor elements from quantum traits.
   * Required when renderMode is 'watercolor'.
   */
  watercolorConfig?: WatercolorConfig;

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

  /**
   * Clustering behavior configuration.
   * Controls how this plant type interacts with spatial proximity rules during germination.
   */
  clusteringBehavior?: ClusteringBehavior;

  /**
   * Which Python circuit this variant uses. Overrides rarity-based circuit selection
   * at plant creation time. Use the circuit's registered `id` string.
   *
   * Path A variants (custom Python circuit): set this to the circuit's id.
   * Path B variants (generic circuit + TS mapping): omit or set to a generic circuit id.
   */
  circuitId?: string;

  /**
   * TypeScript-side quantum property mapping (Path B only).
   *
   * Derives variant-specific visual properties from `QuantumSignals` at observation time.
   * Not needed for Path A variants whose Python circuit's `map_measurements()` already
   * returns plant-specific properties in `ResolvedTraits.extra`.
   */
  quantumMapping?: QuantumPropertyConfig;

  /**
   * Optional sandbox trait controls for the Variant Sandbox UI.
   *
   * When defined, the sandbox renders a slider for each control and injects
   * the values into the watercolor builder's `ctx.traits`, allowing designers
   * to preview all quantum-driven visual parameters without needing an actual
   * quantum observation. Primarily useful for Path A watercolor variants.
   */
  sandboxControls?: SandboxTraitControl[];
}

/**
 * Clustering behavior configuration for plant variants.
 *
 * Some plants (like moss, pebbles) naturally grow in clusters,
 * while others (like flowers, trees) spread out.
 */
export interface ClusteringBehavior {
  /**
   * How this plant type handles spatial proximity.
   * - 'cluster': Gains germination bonus near same-type plants
   * - 'spread': Prevented from germinating in dense areas (default)
   * - 'neutral': No spatial preference
   */
  mode: "cluster" | "spread" | "neutral";

  /**
   * Radius in pixels to check for same-type neighbors.
   * Default: 150 (same as CLUSTERING_RADIUS)
   */
  clusterRadius?: number;

  /**
   * Germination bonus multiplier when near same-type germinated plants.
   * E.g., 2.0 = 2x chance when near same-type neighbors.
   * Only applies when mode is 'cluster'.
   */
  clusterBonus?: number;

  /**
   * Maximum cluster density before clustering bonus stops.
   * Prevents infinite growth in one spot.
   * E.g., 6 = stop bonus after 6 neighbors within radius.
   */
  maxClusterDensity?: number;

  /**
   * For auto-reseeding: probability of spawning near existing same-type plant.
   * 0.0 = always random position, 1.0 = always try to cluster.
   * Only applies when mode is 'cluster'.
   */
  reseedClusterChance?: number;
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
  | VectorDiamond
  | VectorArc
  | VectorBezier
  | VectorSpiral;

export interface VectorCircle {
  type: "circle";
  cx: number;
  cy: number;
  radius: number;
  /** Whether this shape should be filled (default true for circles) */
  fill?: boolean;
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
  /** Whether this shape should be filled (default true for polygons) */
  fill?: boolean;
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
  /** Whether this shape should be filled (default true for stars) */
  fill?: boolean;
}

export interface VectorDiamond {
  type: "diamond";
  cx: number;
  cy: number;
  width: number;
  height: number;
  /** Whether this shape should be filled (default true for diamonds) */
  fill?: boolean;
}

/**
 * Arc primitive - curved line segment.
 * Useful for creating flowing, organic shapes.
 * Can be filled to create wedge/pie slice shapes.
 */
export interface VectorArc {
  type: "arc";
  /** Center X coordinate */
  cx: number;
  /** Center Y coordinate */
  cy: number;
  /** Radius of the arc */
  radius: number;
  /** Start angle in degrees (0 = right, 90 = down) */
  startAngle: number;
  /** End angle in degrees */
  endAngle: number;
  /** Whether this shape should be filled as a wedge (default false for arcs) */
  fill?: boolean;
}

/**
 * Bezier curve primitive - smooth curve defined by control points.
 * Creates elegant, flowing lines perfect for organic plant shapes.
 */
export interface VectorBezier {
  type: "bezier";
  /** Start point X */
  x1: number;
  /** Start point Y */
  y1: number;
  /** First control point X */
  cx1: number;
  /** First control point Y */
  cy1: number;
  /** Second control point X */
  cx2: number;
  /** Second control point Y */
  cy2: number;
  /** End point X */
  x2: number;
  /** End point Y */
  y2: number;
}

/**
 * Spiral primitive - expanding or contracting spiral.
 * Creates mesmerizing, natural patterns.
 */
export interface VectorSpiral {
  type: "spiral";
  /** Center X coordinate */
  cx: number;
  /** Center Y coordinate */
  cy: number;
  /** Starting radius (inner) */
  startRadius: number;
  /** Ending radius (outer) */
  endRadius: number;
  /** Number of full rotations */
  turns: number;
  /** Starting angle in degrees (default: 0) */
  startAngle?: number;
}

/**
 * Easing function types for transitions.
 */
export type EasingType = "linear" | "easeInOut" | "brushStroke";

/**
 * Transition strategy types for vector keyframes.
 * - 'progressive': Lines draw/undraw sequentially (like brush strokes)
 * - 'morph': Vertices travel to new positions
 * - 'fade': Simple crossfade (default behavior)
 * - 'rotate': Primitives rotate around center (good for geometric/kaleidoscope patterns)
 */
export type TransitionStrategy = "progressive" | "morph" | "fade" | "rotate";

/**
 * Hints for how to transition into this keyframe.
 */
export interface VectorTransitionHint {
  /** How primitives should transition */
  strategy: TransitionStrategy;

  /** Easing function for the transition */
  easing?: EasingType;

  /** Number of full rotations for 'rotate' strategy (default: 1) */
  rotations?: number;
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

  /** Optional transition hints for progressive drawing */
  transitionHint?: VectorTransitionHint;

  // === Fill & Outline Properties (for vector art style) ===

  /** Fill color for closed shapes (hex string, e.g., "#E89090") */
  fillColor?: string;

  /** Fill opacity (0-1, default 0.8) */
  fillOpacity?: number;

  /** Stroke/outline width in pixels (default 2) */
  strokeWidth?: number;

  /** Outline color override (hex string, default "#2A2A2A" charcoal) */
  outlineColor?: string;
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

  /**
   * Per-primitive draw fraction for progressive drawing.
   * Each value is 0-1 where 0 = hidden, 1 = fully visible.
   * For lines, this controls how much of the line is drawn.
   */
  drawFractions?: number[];

  // === Fill & Outline Properties ===

  /** Interpolated fill color */
  fillColor?: string;

  /** Interpolated fill opacity */
  fillOpacity?: number;

  /** Interpolated stroke width */
  strokeWidth?: number;

  /** Outline color (usually constant) */
  outlineColor?: string;
}

/**
 * Time-addressable snapshot for rendering a vector glyph.
 * Pure output from renderVectorGlyphAtProgress() - deterministic given inputs.
 */
export interface VectorGlyphSnapshot {
  /** Primitives to render */
  primitives: VectorPrimitive[];

  /** Per-primitive draw fraction (0 = hidden, 1 = fully drawn) */
  drawFractions: number[];

  /** Stroke color */
  strokeColor: string;

  /** Stroke opacity */
  strokeOpacity: number;

  /** Scale */
  scale: number;

  /** Name of the current keyframe */
  keyframeName: string;

  /** Lifecycle progress (0.0 = start, 1.0 = complete) */
  progress: number;

  // === Fill & Outline Properties ===

  /** Fill color for closed shapes */
  fillColor?: string;

  /** Fill opacity */
  fillOpacity?: number;

  /** Stroke/outline width in pixels */
  strokeWidth?: number;

  /** Outline color (charcoal by default) */
  outlineColor?: string;
}

// ============================================================================
// WATERCOLOR RENDERING TYPES
// ============================================================================

/**
 * Shape definitions for the watercolor renderer.
 * Each type maps to a specific Three.js Shape/Geometry builder.
 * Coordinates are relative to the element's position.
 */
export type WatercolorShapeDef =
  | WatercolorPetal
  | WatercolorLeaf
  | WatercolorDisc
  | WatercolorDot
  | WatercolorStem;

export interface WatercolorPetal {
  type: "petal";
  /** Width of the petal at its widest point */
  width: number;
  /** Length from base to tip */
  length: number;
  /** Roundness of the petal base (0.2 = pointed, 1.3 = very round) */
  roundness: number;
}

export interface WatercolorLeaf {
  type: "leaf";
  /** Width of the leaf at its widest point */
  width: number;
  /** Length from base to tip */
  length: number;
}

export interface WatercolorDisc {
  type: "disc";
  /** Radius of the disc */
  radius: number;
}

export interface WatercolorDot {
  type: "dot";
  /** Radius of the dot */
  radius: number;
}

export interface WatercolorStem {
  type: "stem";
  /** Control points for the CatmullRom curve [x, y][] */
  points: [number, number][];
  /** Thickness of the stem tube */
  thickness: number;
}

/**
 * A positioned element in a watercolor composition.
 * The watercolor renderer applies the layering effect to each element.
 */
export interface WatercolorElement {
  /** Shape definition */
  shape: WatercolorShapeDef;
  /** Position in 64x64 coordinate space */
  position: { x: number; y: number };
  /** Rotation in radians */
  rotation: number;
  /** Scale factor */
  scale: number;
  /** Base color (hex string) */
  color: string;
  /** Per-element opacity override (default uses wcEffect.opacity) */
  opacity?: number;
  /** Z offset for stacking order within the composition */
  zOffset?: number;
}

/**
 * Parameters controlling the watercolor layering effect.
 * Applied uniformly to all elements in a composition.
 */
export interface WatercolorEffect {
  /** Number of semi-transparent layers per element (2-5) */
  layers: number;
  /** Base opacity for innermost layer (0.1-1.0) */
  opacity: number;
  /** Position jitter between layers (0.0-0.3) */
  spread: number;
  /** HSL color jitter per layer (0.0-0.2) */
  colorVariation: number;
}

/**
 * Context passed to the watercolor builder function.
 * Contains all quantum-derived data and lifecycle state needed
 * to produce the watercolor elements for a plant.
 */
export interface WatercolorBuildContext {
  /** Current keyframe name (e.g., "bud", "bloom", "fade") */
  keyframeName: string;
  /** Progress within current keyframe (0-1) */
  keyframeProgress: number;
  /** Total lifecycle progress (0-1) */
  totalProgress: number;
  /** Quantum-resolved traits (null if superposed/unobserved) */
  traits: ResolvedTraits | null;
  /** Deterministic seed derived from plant ID */
  seed: number;
  /** Selected color variation name (from quantum measurement) */
  colorVariationName: string | null;
  /** Which quantum circuit drove this plant */
  circuitType: string | null;
}

/**
 * Watercolor variant configuration.
 * Defines lifecycle timing, effect parameters, and the builder function
 * that translates quantum traits into watercolor elements.
 */
export interface WatercolorConfig {
  /** Lifecycle keyframe definitions (timing only - shapes come from builder) */
  keyframes: { name: string; duration: number }[];
  /** Watercolor effect settings */
  wcEffect: WatercolorEffect;
  /** Builder function: takes context, returns elements to render */
  buildElements: (ctx: WatercolorBuildContext) => WatercolorElement[];
}
