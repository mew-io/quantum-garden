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
} from "./types";

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
