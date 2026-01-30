/**
 * Lifecycle Computation Logic
 *
 * Functions for calculating plant lifecycle state from timestamps and modifiers.
 * All state is computed on demand, never stored.
 *
 * See docs/variants-and-lifecycle.md for architecture documentation.
 */

import type {
  PlantVariant,
  PlantWithLifecycle,
  ComputedLifecycleState,
  GlyphKeyframe,
  InterpolatedKeyframe,
  VectorKeyframe,
  InterpolatedVectorKeyframe,
  VectorPrimitive,
  VectorGlyphSnapshot,
  EasingType,
  VectorTransitionHint,
} from "./types";

// =============================================================================
// Easing Functions
// =============================================================================

/**
 * Easing function collection for transitions.
 */
const easingFunctions: Record<EasingType, (t: number) => number> = {
  /** Linear interpolation - constant speed */
  linear: (t: number) => t,

  /** Smooth ease in/out - accelerate then decelerate */
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),

  /**
   * Brush stroke easing - mimics natural brush movement.
   * Slow start (ink touching paper), fluid middle, gentle end (lift).
   */
  brushStroke: (t: number) => {
    if (t < 0.15) return t * t * 4.44; // Slow ink touch
    if (t > 0.85) return 1 - Math.pow(1 - t, 2) * 4.44; // Slow lift
    return 0.1 + (t - 0.15) * 1.143; // Fluid middle
  },
};

/**
 * Apply an easing function to a progress value.
 */
function applyEasing(t: number, easing: EasingType = "easeInOut"): number {
  const fn = easingFunctions[easing] ?? easingFunctions.easeInOut;
  return fn(Math.max(0, Math.min(1, t)));
}

// =============================================================================
// Variant Mode Helpers
// =============================================================================

/**
 * Check if a variant uses vector rendering mode.
 */
export function isVectorVariant(variant: PlantVariant): boolean {
  return variant.renderMode === "vector";
}

/**
 * Get the effective keyframes for a variant (pixel or vector).
 * For vector variants, creates compatible keyframe objects from vectorKeyframes.
 */
export function getEffectiveKeyframes(
  variant: PlantVariant
): Array<{ name: string; duration: number }> {
  if (isVectorVariant(variant) && variant.vectorKeyframes?.length) {
    return variant.vectorKeyframes.map((vk) => ({
      name: vk.name,
      duration: vk.duration,
    }));
  }
  return variant.keyframes;
}

/**
 * Get the number of keyframes in a variant (pixel or vector).
 */
export function getKeyframeCount(variant: PlantVariant): number {
  if (isVectorVariant(variant) && variant.vectorKeyframes?.length) {
    return variant.vectorKeyframes.length;
  }
  return variant.keyframes.length;
}

/**
 * Get the base total duration of a variant's lifecycle (without modifier).
 */
export function getBaseTotalDuration(variant: PlantVariant): number {
  const keyframes = getEffectiveKeyframes(variant);
  return keyframes.reduce((sum, kf) => sum + kf.duration, 0);
}

/**
 * Get a vector keyframe by index.
 */
export function getVectorKeyframe(variant: PlantVariant, index: number): VectorKeyframe | null {
  if (!variant.vectorKeyframes?.length) return null;
  return variant.vectorKeyframes[index] ?? null;
}

/**
 * Calculate the total duration of a variant's lifecycle.
 * Works with both pixel and vector variants.
 *
 * @param variant - The plant variant
 * @param lifecycleModifier - Speed multiplier (1.0 = normal)
 * @returns Total duration in seconds
 */
export function getTotalDuration(variant: PlantVariant, lifecycleModifier: number = 1.0): number {
  const baseTotal = getBaseTotalDuration(variant);
  return baseTotal / Math.max(0.1, lifecycleModifier);
}

/**
 * Calculate the effective duration of a keyframe with modifier applied.
 *
 * @param baseDuration - Original duration in seconds
 * @param lifecycleModifier - Speed multiplier
 * @returns Effective duration in seconds
 */
export function getEffectiveDuration(
  baseDuration: number,
  lifecycleModifier: number = 1.0
): number {
  return baseDuration / Math.max(0.1, lifecycleModifier);
}

/**
 * Helper to create a placeholder GlyphKeyframe from effective keyframe data.
 * Used for vector variants which don't have actual GlyphKeyframes.
 */
function createPlaceholderKeyframe(kf: { name: string; duration: number }): GlyphKeyframe {
  return {
    name: kf.name,
    duration: kf.duration,
    pattern: [],
    palette: [],
  };
}

/**
 * Compute the current lifecycle state for a plant.
 *
 * This is the core calculation function. Given a plant, its variant,
 * and the current time, it returns the active keyframe and progress.
 * Works with both pixel and vector variants.
 *
 * @param plant - Plant with lifecycle fields
 * @param variant - The plant's variant definition
 * @param now - Current time (defaults to now)
 * @returns Computed lifecycle state
 */
export function computeLifecycleState(
  plant: PlantWithLifecycle,
  variant: PlantVariant,
  now: Date = new Date()
): ComputedLifecycleState {
  const { germinatedAt, lifecycleModifier } = plant;
  const totalDuration = getTotalDuration(variant, lifecycleModifier);
  const effectiveKeyframes = getEffectiveKeyframes(variant);
  const isVector = isVectorVariant(variant);

  // Helper to get keyframe (real or placeholder)
  const getKeyframe = (index: number): GlyphKeyframe | undefined => {
    if (isVector) {
      const kf = effectiveKeyframes[index];
      return kf ? createPlaceholderKeyframe(kf) : undefined;
    }
    return variant.keyframes[index];
  };

  // Not germinated - return first keyframe at 0 progress
  if (!germinatedAt) {
    const firstKeyframe = getKeyframe(0);
    if (!firstKeyframe) {
      throw new Error(`Variant ${variant.id} has no keyframes`);
    }
    return {
      currentKeyframe: firstKeyframe,
      keyframeIndex: 0,
      keyframeProgress: 0,
      totalProgress: 0,
      elapsedSeconds: 0,
      totalDurationSeconds: totalDuration,
      prevKeyframe: undefined,
      nextKeyframe: getKeyframe(1),
      isComplete: false,
    };
  }

  // Calculate elapsed time
  const elapsedMs = now.getTime() - germinatedAt.getTime();
  let elapsedSeconds = Math.max(0, elapsedMs / 1000);

  // Handle looping - track if we've completed at least one full cycle
  let hasLooped = false;
  if (variant.loop && totalDuration > 0) {
    hasLooped = elapsedSeconds >= totalDuration;
    elapsedSeconds = elapsedSeconds % totalDuration;
  }

  // Walk through keyframes to find current one
  let accumulated = 0;
  for (let i = 0; i < effectiveKeyframes.length; i++) {
    const keyframe = effectiveKeyframes[i];
    if (!keyframe) continue;

    const effectiveDuration = getEffectiveDuration(keyframe.duration, lifecycleModifier);

    if (elapsedSeconds < accumulated + effectiveDuration) {
      // Found the active keyframe
      const timeInKeyframe = elapsedSeconds - accumulated;
      const keyframeProgress = effectiveDuration > 0 ? timeInKeyframe / effectiveDuration : 1;

      // Get previous keyframe
      // For looping variants on first keyframe, only wrap to last keyframe
      // if we've actually completed at least one loop
      let prevKeyframe: GlyphKeyframe | undefined;
      if (i > 0) {
        prevKeyframe = getKeyframe(i - 1);
      } else if (variant.loop && hasLooped) {
        prevKeyframe = getKeyframe(effectiveKeyframes.length - 1);
      }

      const currentKeyframe = getKeyframe(i);
      if (!currentKeyframe) continue;

      return {
        currentKeyframe,
        keyframeIndex: i,
        keyframeProgress: Math.min(1, keyframeProgress),
        totalProgress: totalDuration > 0 ? elapsedSeconds / totalDuration : 1,
        elapsedSeconds,
        totalDurationSeconds: totalDuration,
        prevKeyframe,
        nextKeyframe: getKeyframe(i + 1),
        isComplete: false,
      };
    }

    accumulated += effectiveDuration;
  }

  // Past all keyframes - lifecycle complete
  const lastKeyframe = getKeyframe(effectiveKeyframes.length - 1);
  if (!lastKeyframe) {
    throw new Error(`Variant ${variant.id} has no keyframes`);
  }

  return {
    currentKeyframe: lastKeyframe,
    keyframeIndex: effectiveKeyframes.length - 1,
    keyframeProgress: 1,
    totalProgress: 1,
    elapsedSeconds,
    totalDurationSeconds: totalDuration,
    prevKeyframe: getKeyframe(effectiveKeyframes.length - 2),
    nextKeyframe: undefined,
    isComplete: true,
  };
}

/**
 * Compute lifecycle state from a progress percentage (for time travel).
 *
 * This is a pure function that computes the lifecycle state from a normalized
 * progress value (0.0 - 1.0), independent of real time. This enables:
 * - Deterministic rendering at any point in the lifecycle
 * - Timeline scrubbing without Date.now()
 * - Future orchestrator integration
 *
 * @param variant - The plant variant definition
 * @param progress - Total lifecycle progress (0.0 = start, 1.0 = complete)
 * @returns Computed lifecycle state
 */
export function computeLifecycleStateFromProgress(
  variant: PlantVariant,
  progress: number
): ComputedLifecycleState {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const effectiveKeyframes = getEffectiveKeyframes(variant);
  const isVector = isVectorVariant(variant);

  // Calculate total duration for reference (used for elapsedSeconds/totalDuration)
  const totalDuration = effectiveKeyframes.reduce((sum, kf) => sum + kf.duration, 0);

  // Helper to get keyframe (real or placeholder)
  const getKeyframe = (index: number): GlyphKeyframe | undefined => {
    if (isVector) {
      const kf = effectiveKeyframes[index];
      return kf ? createPlaceholderKeyframe(kf) : undefined;
    }
    return variant.keyframes[index];
  };

  // Handle edge case: no keyframes
  const firstKeyframe = getKeyframe(0);
  if (!firstKeyframe) {
    throw new Error(`Variant ${variant.id} has no keyframes`);
  }

  // Handle start of lifecycle
  if (clampedProgress === 0) {
    return {
      currentKeyframe: firstKeyframe,
      keyframeIndex: 0,
      keyframeProgress: 0,
      totalProgress: 0,
      elapsedSeconds: 0,
      totalDurationSeconds: totalDuration,
      prevKeyframe: undefined,
      nextKeyframe: getKeyframe(1),
      isComplete: false,
    };
  }

  // Walk through keyframes based on their relative durations
  let accumulated = 0;
  for (let i = 0; i < effectiveKeyframes.length; i++) {
    const kf = effectiveKeyframes[i];
    if (!kf) continue;

    const keyframeFraction = kf.duration / totalDuration;

    if (clampedProgress < accumulated + keyframeFraction) {
      // Found the active keyframe
      const keyframeProgress =
        keyframeFraction > 0 ? (clampedProgress - accumulated) / keyframeFraction : 1;

      const currentKeyframe = getKeyframe(i);
      if (!currentKeyframe) continue;

      return {
        currentKeyframe,
        keyframeIndex: i,
        keyframeProgress: Math.min(1, keyframeProgress),
        totalProgress: clampedProgress,
        elapsedSeconds: clampedProgress * totalDuration,
        totalDurationSeconds: totalDuration,
        prevKeyframe: getKeyframe(i - 1),
        nextKeyframe: getKeyframe(i + 1),
        isComplete: false,
      };
    }

    accumulated += keyframeFraction;
  }

  // At end of lifecycle (progress = 1.0)
  const lastKeyframe = getKeyframe(effectiveKeyframes.length - 1);
  if (!lastKeyframe) {
    throw new Error(`Variant ${variant.id} has no keyframes`);
  }

  return {
    currentKeyframe: lastKeyframe,
    keyframeIndex: effectiveKeyframes.length - 1,
    keyframeProgress: 1,
    totalProgress: 1,
    elapsedSeconds: totalDuration,
    totalDurationSeconds: totalDuration,
    prevKeyframe: getKeyframe(effectiveKeyframes.length - 2),
    nextKeyframe: undefined,
    isComplete: true,
  };
}

/** Fraction of keyframe duration used for tween-in */
const TWEEN_EDGE_FRACTION = 0.1;

/**
 * Get the active visual for a plant, handling tweening if enabled.
 *
 * Tweening only occurs at keyframe start:
 * - First 10%: Tween in from previous keyframe (smooth entry)
 * - Last 90%: Stable current keyframe
 *
 * Note: We only do tween-in, not tween-out, to avoid a discontinuity at
 * keyframe boundaries. The tween-in of keyframe B handles the transition
 * from keyframe A, so no tween-out from A is needed.
 *
 * @param state - Computed lifecycle state
 * @param variant - Plant variant
 * @returns Either the current keyframe or an interpolated result
 */
export function getActiveVisual(
  state: ComputedLifecycleState,
  variant: PlantVariant
): GlyphKeyframe | InterpolatedKeyframe {
  // No tweening enabled - return current keyframe as-is
  if (!variant.tweenBetweenKeyframes) {
    return state.currentKeyframe;
  }

  const progress = state.keyframeProgress;

  // First 10%: Tween in from previous keyframe
  if (progress < TWEEN_EDGE_FRACTION && state.prevKeyframe) {
    // Map 0.0-0.1 to 0.0-1.0 for interpolation
    const t = progress / TWEEN_EDGE_FRACTION;
    return interpolateKeyframes(state.prevKeyframe, state.currentKeyframe, t);
  }

  // Remaining 90%: Return stable current keyframe
  return state.currentKeyframe;
}

/**
 * Interpolate between two keyframes for smooth transitions.
 *
 * @param from - Starting keyframe
 * @param to - Ending keyframe
 * @param t - Interpolation factor (0.0 - 1.0)
 * @returns Interpolated keyframe data
 */
export function interpolateKeyframes(
  from: GlyphKeyframe,
  to: GlyphKeyframe,
  t: number
): InterpolatedKeyframe {
  // Clamp t to valid range
  const progress = Math.max(0, Math.min(1, t));

  // Interpolate pattern (blend opacity per pixel)
  const pattern = interpolatePatterns(from.pattern, to.pattern, progress);

  // Interpolate palette colors
  const palette = interpolatePalettes(from.palette, to.palette, progress);

  // Interpolate opacity and scale
  const fromOpacity = from.opacity ?? 1;
  const toOpacity = to.opacity ?? 1;
  const opacity = lerp(fromOpacity, toOpacity, progress);

  const fromScale = from.scale ?? 1;
  const toScale = to.scale ?? 1;
  const scale = lerp(fromScale, toScale, progress);

  return {
    pattern,
    palette,
    opacity,
    scale,
    fromKeyframe: from.name,
    toKeyframe: to.name,
    t: progress,
  };
}

/**
 * Interpolate between two 8x8 patterns.
 *
 * When a pixel is 1 in 'from' but 0 in 'to', its value fades from 1 to 0.
 * When a pixel is 0 in 'from' but 1 in 'to', its value fades from 0 to 1.
 *
 * @param from - Starting pattern
 * @param to - Ending pattern
 * @param t - Interpolation factor
 * @returns Pattern with values 0-1 representing pixel opacity
 */
function interpolatePatterns(from: number[][], to: number[][], t: number): number[][] {
  const result: number[][] = [];
  const size = Math.max(from.length, to.length);

  for (let y = 0; y < size; y++) {
    const row: number[] = [];
    const fromRow = from[y] ?? [];
    const toRow = to[y] ?? [];
    const rowSize = Math.max(fromRow.length, toRow.length);

    for (let x = 0; x < rowSize; x++) {
      const fromVal = fromRow[x] ?? 0;
      const toVal = toRow[x] ?? 0;
      row.push(lerp(fromVal, toVal, t));
    }
    result.push(row);
  }

  return result;
}

/**
 * Interpolate between two color palettes.
 *
 * Colors are interpolated in RGB space.
 *
 * @param from - Starting palette
 * @param to - Ending palette
 * @param t - Interpolation factor
 * @returns Interpolated palette
 */
function interpolatePalettes(from: string[], to: string[], t: number): string[] {
  const result: string[] = [];
  const size = Math.max(from.length, to.length);

  for (let i = 0; i < size; i++) {
    const fromColor = from[i] ?? from[0] ?? "#000000";
    const toColor = to[i] ?? to[0] ?? "#000000";
    result.push(interpolateColor(fromColor, toColor, t));
  }

  return result;
}

/**
 * Interpolate between two hex colors.
 *
 * @param from - Starting color (hex)
 * @param to - Ending color (hex)
 * @param t - Interpolation factor
 * @returns Interpolated color (hex)
 */
function interpolateColor(from: string, to: string, t: number): string {
  const fromRgb = hexToRgb(from);
  const toRgb = hexToRgb(to);

  const r = Math.round(lerp(fromRgb.r, toRgb.r, t));
  const g = Math.round(lerp(fromRgb.g, toRgb.g, t));
  const b = Math.round(lerp(fromRgb.b, toRgb.b, t));

  return rgbToHex(r, g, b);
}

/**
 * Convert hex color to RGB object.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Convert RGB values to hex color.
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Linear interpolation helper.
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// =============================================================================
// Vector Tweening
// =============================================================================

/**
 * Get the active vector visual for a plant, handling tweening.
 *
 * Similar to getActiveVisual but for vector variants.
 * Interpolates between vector keyframes during transitions.
 *
 * @param state - Computed lifecycle state
 * @param variant - Plant variant (must be vector mode)
 * @returns Either the current vector keyframe or an interpolated result
 */
export function getActiveVectorVisual(
  state: ComputedLifecycleState,
  variant: PlantVariant
): VectorKeyframe | InterpolatedVectorKeyframe {
  const vectorKeyframes = variant.vectorKeyframes;
  if (!vectorKeyframes?.length) {
    throw new Error(`Variant ${variant.id} has no vector keyframes`);
  }

  const currentVectorKf = vectorKeyframes[state.keyframeIndex];
  if (!currentVectorKf) {
    throw new Error(`Vector keyframe ${state.keyframeIndex} not found`);
  }

  // No tweening enabled - return current keyframe as-is
  if (!variant.tweenBetweenKeyframes) {
    return currentVectorKf;
  }

  const progress = state.keyframeProgress;

  // First 10%: Tween in from previous keyframe
  if (progress < TWEEN_EDGE_FRACTION && state.keyframeIndex > 0) {
    const prevVectorKf = vectorKeyframes[state.keyframeIndex - 1];
    if (prevVectorKf) {
      // Map 0.0-0.1 to 0.0-1.0 for interpolation
      const t = progress / TWEEN_EDGE_FRACTION;
      return interpolateVectorKeyframes(prevVectorKf, currentVectorKf, t);
    }
  }

  // Remaining 90%: Return stable current keyframe
  return currentVectorKf;
}

/**
 * Interpolate between two vector keyframes for smooth transitions.
 *
 * @param from - Starting vector keyframe
 * @param to - Ending vector keyframe
 * @param t - Interpolation factor (0.0 - 1.0)
 * @returns Interpolated vector keyframe data
 */
export function interpolateVectorKeyframes(
  from: VectorKeyframe,
  to: VectorKeyframe,
  t: number
): InterpolatedVectorKeyframe {
  // Clamp t to valid range
  const progress = Math.max(0, Math.min(1, t));

  // Interpolate stroke color
  const strokeColor = interpolateColor(from.strokeColor, to.strokeColor, progress);

  // Interpolate stroke opacity
  const strokeOpacity = lerp(from.strokeOpacity, to.strokeOpacity, progress);

  // Interpolate scale
  const fromScale = from.scale ?? 1;
  const toScale = to.scale ?? 1;
  const scale = lerp(fromScale, toScale, progress);

  // Interpolate primitives with transition hints
  const hint = to.transitionHint;
  const { primitives, drawFractions } = interpolateVectorPrimitivesWithHint(
    from.primitives,
    to.primitives,
    progress,
    hint
  );

  return {
    primitives,
    strokeColor,
    strokeOpacity,
    scale,
    fromKeyframe: from.name,
    toKeyframe: to.name,
    t: progress,
    drawFractions,
  };
}

/**
 * Interpolate between two arrays of vector primitives with transition hints.
 *
 * Supports three strategies:
 * - 'progressive': Lines draw/undraw sequentially (for brush stroke effects)
 * - 'morph': Vertices travel to new positions
 * - 'fade': Simple crossfade (default)
 *
 * @param from - Starting primitives array
 * @param to - Ending primitives array
 * @param t - Interpolation factor
 * @param hint - Optional transition hints
 * @returns Object with interpolated primitives and draw fractions
 */
function interpolateVectorPrimitivesWithHint(
  from: VectorPrimitive[],
  to: VectorPrimitive[],
  t: number,
  hint?: VectorTransitionHint
): { primitives: VectorPrimitive[]; drawFractions: number[] } {
  const strategy = hint?.strategy ?? detectTransitionStrategy(from, to);
  const easing = hint?.easing ?? "easeInOut";
  const easedT = applyEasing(t, easing);

  if (strategy === "progressive" && to.length > from.length) {
    return interpolateProgressive(from, to, easedT);
  }

  if (strategy === "rotate") {
    // Rotate primitives around center during transition
    const rotations = hint?.rotations ?? 1;
    return interpolateRotate(from, to, easedT, rotations);
  }

  if (strategy === "morph" || canInterpolateDirect(from, to)) {
    // Direct interpolation with full draw fractions
    const primitives = from.map((fromP, i) => {
      const toP = to[i];
      return toP ? interpolateSinglePrimitive(fromP, toP, easedT) : fromP;
    });
    return {
      primitives,
      drawFractions: primitives.map(() => 1),
    };
  }

  // Fallback: fade/crossfade at midpoint
  const primitives = easedT < 0.5 ? from : to;
  return {
    primitives,
    drawFractions: primitives.map(() => 1),
  };
}

/**
 * Check if two primitive arrays can be directly interpolated.
 */
function canInterpolateDirect(from: VectorPrimitive[], to: VectorPrimitive[]): boolean {
  return (
    from.length === to.length &&
    from.every((p, i) => {
      const toP = to[i];
      return toP && p.type === toP.type;
    })
  );
}

/**
 * Auto-detect the best transition strategy based on primitive structures.
 */
function detectTransitionStrategy(
  from: VectorPrimitive[],
  to: VectorPrimitive[]
): "progressive" | "morph" | "fade" {
  // If primitives are growing and mostly lines, use progressive
  if (to.length > from.length) {
    const toLineCount = to.filter((p) => p.type === "line").length;
    if (toLineCount > to.length * 0.5) {
      return "progressive";
    }
  }

  // If same count and types, use morph
  if (canInterpolateDirect(from, to)) {
    return "morph";
  }

  // Default to fade
  return "fade";
}

/**
 * Progressive drawing interpolation.
 *
 * Lines draw sequentially: existing primitives stay visible,
 * new primitives progressively reveal based on their index.
 *
 * @param from - Starting primitives
 * @param to - Ending primitives (should have more than from)
 * @param t - Eased interpolation factor (0-1)
 * @returns Primitives with draw fractions
 */
function interpolateProgressive(
  from: VectorPrimitive[],
  to: VectorPrimitive[],
  t: number
): { primitives: VectorPrimitive[]; drawFractions: number[] } {
  const drawFractions: number[] = [];
  const newCount = to.length - from.length;

  for (let i = 0; i < to.length; i++) {
    if (i < from.length) {
      // Existing primitive - fully visible
      // Also morph position if types match
      drawFractions.push(1);
    } else {
      // New primitive - progressively reveal based on order
      const newIndex = i - from.length;
      const revealPoint = newCount > 0 ? newIndex / newCount : 0;
      // Each primitive reveals over 20% of the remaining time
      const fraction = Math.max(0, Math.min(1, (t - revealPoint * 0.8) / 0.2));
      drawFractions.push(fraction);
    }
  }

  // Return the target primitives with draw fractions
  return { primitives: to, drawFractions };
}

/**
 * Rotate interpolation - rotates all primitives around center.
 *
 * Good for geometric/kaleidoscope patterns where the visual effect
 * is a spinning transformation between keyframes.
 *
 * @param from - Starting primitives
 * @param to - Ending primitives
 * @param t - Eased interpolation factor (0-1)
 * @param rotations - Number of full rotations (default: 1)
 * @returns Rotated primitives with full draw fractions
 */
function interpolateRotate(
  from: VectorPrimitive[],
  to: VectorPrimitive[],
  t: number,
  rotations: number = 1
): { primitives: VectorPrimitive[]; drawFractions: number[] } {
  // Calculate rotation angle (in radians)
  const angle = t * Math.PI * 2 * rotations;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  // Use 'from' primitives in first half, 'to' in second half
  // This allows different primitive counts between keyframes
  const basePrimitives = t < 0.5 ? from : to;

  // Rotate each primitive around the center (0.5, 0.5 in normalized space)
  const center = 0.5;
  const primitives = basePrimitives.map((p) => rotatePrimitive(p, center, center, cosA, sinA));

  return {
    primitives,
    drawFractions: primitives.map(() => 1),
  };
}

/**
 * Rotate a single primitive around a center point.
 */
function rotatePrimitive(
  p: VectorPrimitive,
  cx: number,
  cy: number,
  cosA: number,
  sinA: number
): VectorPrimitive {
  const rotatePoint = (x: number, y: number): { x: number; y: number } => {
    const dx = x - cx;
    const dy = y - cy;
    return {
      x: cx + dx * cosA - dy * sinA,
      y: cy + dx * sinA + dy * cosA,
    };
  };

  switch (p.type) {
    case "circle": {
      const rotated = rotatePoint(p.cx, p.cy);
      return { type: "circle", cx: rotated.x, cy: rotated.y, radius: p.radius };
    }
    case "line": {
      const p1 = rotatePoint(p.x1, p.y1);
      const p2 = rotatePoint(p.x2, p.y2);
      return { type: "line", x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
    }
    case "polygon": {
      // VectorPolygon is defined by center, sides, and radius - just rotate center
      const rotated = rotatePoint(p.cx, p.cy);
      return { type: "polygon", cx: rotated.x, cy: rotated.y, sides: p.sides, radius: p.radius };
    }
    case "star": {
      const rotated = rotatePoint(p.cx, p.cy);
      return {
        type: "star",
        cx: rotated.x,
        cy: rotated.y,
        outerRadius: p.outerRadius,
        innerRadius: p.innerRadius,
        points: p.points,
      };
    }
    case "diamond": {
      const rotated = rotatePoint(p.cx, p.cy);
      return { type: "diamond", cx: rotated.x, cy: rotated.y, width: p.width, height: p.height };
    }
    default:
      return p;
  }
}

/**
 * Interpolate a single primitive between two states of the same type.
 */
function interpolateSinglePrimitive(
  from: VectorPrimitive,
  to: VectorPrimitive,
  t: number
): VectorPrimitive {
  switch (from.type) {
    case "circle":
      if (to.type !== "circle") return from;
      return {
        type: "circle",
        cx: lerp(from.cx, to.cx, t),
        cy: lerp(from.cy, to.cy, t),
        radius: lerp(from.radius, to.radius, t),
      };

    case "line":
      if (to.type !== "line") return from;
      return {
        type: "line",
        x1: lerp(from.x1, to.x1, t),
        y1: lerp(from.y1, to.y1, t),
        x2: lerp(from.x2, to.x2, t),
        y2: lerp(from.y2, to.y2, t),
      };

    case "polygon":
      if (to.type !== "polygon") return from;
      return {
        type: "polygon",
        cx: lerp(from.cx, to.cx, t),
        cy: lerp(from.cy, to.cy, t),
        sides: Math.round(lerp(from.sides, to.sides, t)),
        radius: lerp(from.radius, to.radius, t),
        rotation: lerp(from.rotation ?? 0, to.rotation ?? 0, t),
      };

    case "star":
      if (to.type !== "star") return from;
      return {
        type: "star",
        cx: lerp(from.cx, to.cx, t),
        cy: lerp(from.cy, to.cy, t),
        points: Math.round(lerp(from.points, to.points, t)),
        outerRadius: lerp(from.outerRadius, to.outerRadius, t),
        innerRadius: lerp(from.innerRadius, to.innerRadius, t),
        rotation: lerp(from.rotation ?? 0, to.rotation ?? 0, t),
      };

    case "diamond":
      if (to.type !== "diamond") return from;
      return {
        type: "diamond",
        cx: lerp(from.cx, to.cx, t),
        cy: lerp(from.cy, to.cy, t),
        width: lerp(from.width, to.width, t),
        height: lerp(from.height, to.height, t),
      };

    default:
      return from;
  }
}

/**
 * Type guard to check if a vector visual is interpolated.
 */
export function isInterpolatedVectorKeyframe(
  visual: VectorKeyframe | InterpolatedVectorKeyframe
): visual is InterpolatedVectorKeyframe {
  return "t" in visual && "fromKeyframe" in visual;
}

// =============================================================================
// Time Travel / Progress-Based Rendering
// =============================================================================

/**
 * Render a vector glyph at a specific progress percentage.
 *
 * This is the main entry point for time-addressable rendering.
 * Pure function - same inputs always produce same output, independent of real time.
 *
 * @param variant - The plant variant definition (must be vector mode)
 * @param progress - Lifecycle completion (0.0 = start, 1.0 = complete)
 * @returns Complete visual state for rendering
 *
 * @example
 * // Render at 50% completion
 * const snapshot = renderVectorGlyphAtProgress(sumiSpiritVariant, 0.5);
 * // snapshot.primitives - shapes to render
 * // snapshot.drawFractions - how much of each primitive to draw
 */
export function renderVectorGlyphAtProgress(
  variant: PlantVariant,
  progress: number
): VectorGlyphSnapshot {
  if (!isVectorVariant(variant)) {
    throw new Error(`renderVectorGlyphAtProgress requires a vector variant, got: ${variant.id}`);
  }

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const state = computeLifecycleStateFromProgress(variant, clampedProgress);

  // Get the vector visual with draw fractions
  const visual = getActiveVectorVisualWithDrawFractions(state, variant);

  return {
    primitives: visual.primitives,
    drawFractions: visual.drawFractions,
    strokeColor: visual.strokeColor,
    strokeOpacity: visual.strokeOpacity,
    scale: visual.scale ?? 1,
    keyframeName: state.currentKeyframe.name,
    progress: clampedProgress,
  };
}

/**
 * Get the active vector visual with draw fractions for progressive drawing.
 *
 * Similar to getActiveVectorVisual but always returns draw fractions.
 */
function getActiveVectorVisualWithDrawFractions(
  state: ComputedLifecycleState,
  variant: PlantVariant
): {
  primitives: VectorPrimitive[];
  drawFractions: number[];
  strokeColor: string;
  strokeOpacity: number;
  scale?: number;
} {
  const vectorKeyframes = variant.vectorKeyframes;
  if (!vectorKeyframes?.length) {
    throw new Error(`Variant ${variant.id} has no vector keyframes`);
  }

  const currentVectorKf = vectorKeyframes[state.keyframeIndex];
  if (!currentVectorKf) {
    throw new Error(`Vector keyframe ${state.keyframeIndex} not found`);
  }

  // No tweening enabled - return current keyframe with full draw fractions
  if (!variant.tweenBetweenKeyframes) {
    return {
      primitives: currentVectorKf.primitives,
      drawFractions: currentVectorKf.primitives.map(() => 1),
      strokeColor: currentVectorKf.strokeColor,
      strokeOpacity: currentVectorKf.strokeOpacity,
      scale: currentVectorKf.scale,
    };
  }

  const progress = state.keyframeProgress;

  // First 10%: Tween in from previous keyframe
  if (progress < TWEEN_EDGE_FRACTION && state.keyframeIndex > 0) {
    const prevVectorKf = vectorKeyframes[state.keyframeIndex - 1];
    if (prevVectorKf) {
      // Map 0.0-0.1 to 0.0-1.0 for interpolation
      const t = progress / TWEEN_EDGE_FRACTION;
      const interpolated = interpolateVectorKeyframes(prevVectorKf, currentVectorKf, t);
      return {
        primitives: interpolated.primitives,
        drawFractions: interpolated.drawFractions ?? interpolated.primitives.map(() => 1),
        strokeColor: interpolated.strokeColor,
        strokeOpacity: interpolated.strokeOpacity,
        scale: interpolated.scale,
      };
    }
  }

  // Remaining 90%: Return stable current keyframe
  return {
    primitives: currentVectorKf.primitives,
    drawFractions: currentVectorKf.primitives.map(() => 1),
    strokeColor: currentVectorKf.strokeColor,
    strokeOpacity: currentVectorKf.strokeOpacity,
    scale: currentVectorKf.scale,
  };
}

/**
 * Convert a quantum growthRate trait to a lifecycle modifier.
 *
 * The growthRate from quantum measurement (0.5 - 2.0) maps directly
 * to the lifecycle modifier.
 *
 * @param growthRate - Growth rate from quantum traits
 * @returns Lifecycle modifier (clamped to 0.5 - 2.0)
 */
export function growthRateToLifecycleModifier(growthRate: number): number {
  return Math.max(0.5, Math.min(2.0, growthRate));
}

/**
 * Check if a plant's lifecycle is complete and ready for cleanup.
 *
 * @param state - Computed lifecycle state
 * @param variant - Plant variant
 * @returns True if lifecycle is complete and not looping
 */
export function isLifecycleComplete(state: ComputedLifecycleState, variant: PlantVariant): boolean {
  if (variant.loop) return false;
  return state.isComplete;
}

// =============================================================================
// Color Variation Functions
// =============================================================================

/**
 * Select a color variation based on quantum probability.
 *
 * For multi-color variants (like tulips), this uses quantum measurement
 * to select which color the plant will be.
 *
 * @param variant - The plant variant
 * @param probability - Random value from quantum measurement (0.0 - 1.0)
 * @returns Selected color variation name, or null if fixed-color variant
 */
export function selectColorVariation(variant: PlantVariant, probability: number): string | null {
  if (!variant.colorVariations || variant.colorVariations.length === 0) {
    return null; // Fixed-color variant
  }

  // Calculate total weight
  const totalWeight = variant.colorVariations.reduce((sum, v) => sum + v.weight, 0);

  // Select based on probability
  let accumulated = 0;
  for (const variation of variant.colorVariations) {
    accumulated += variation.weight / totalWeight;
    if (probability <= accumulated) {
      return variation.name;
    }
  }

  // Fallback to last variation
  const last = variant.colorVariations[variant.colorVariations.length - 1];
  return last?.name ?? null;
}

/**
 * Get the effective palette for a keyframe, considering color variations.
 *
 * @param keyframe - The keyframe
 * @param variant - The plant variant
 * @param colorVariationName - Selected color variation name (or null)
 * @returns The palette to use for rendering
 */
export function getEffectivePalette(
  keyframe: GlyphKeyframe,
  variant: PlantVariant,
  colorVariationName: string | null
): string[] {
  // No color variation selected - use keyframe's default palette
  if (!colorVariationName || !variant.colorVariations) {
    return keyframe.palette;
  }

  // Find the color variation
  const variation = variant.colorVariations.find((v) => v.name === colorVariationName);
  if (!variation) {
    return keyframe.palette;
  }

  // Check if this keyframe has an override in the variation
  const override = variation.palettes[keyframe.name];
  return override ?? keyframe.palette;
}

/**
 * Get a keyframe with its effective palette applied.
 *
 * This is a convenience function that returns a keyframe-like object
 * with the correct palette for the plant's color variation.
 *
 * @param keyframe - Original keyframe
 * @param variant - Plant variant
 * @param colorVariationName - Selected color variation name
 * @returns Keyframe with effective palette
 */
export function getKeyframeWithEffectivePalette(
  keyframe: GlyphKeyframe,
  variant: PlantVariant,
  colorVariationName: string | null
): GlyphKeyframe {
  const effectivePalette = getEffectivePalette(keyframe, variant, colorVariationName);

  if (effectivePalette === keyframe.palette) {
    return keyframe; // No change needed
  }

  return {
    ...keyframe,
    palette: effectivePalette,
  };
}
