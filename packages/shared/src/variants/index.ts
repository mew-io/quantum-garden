/**
 * Plant Variants Module
 *
 * This module defines plant variants (species) and their lifecycle animations.
 * TypeScript is the single source of truth - Python imports via JSON export.
 *
 * See docs/variants-and-lifecycle.md for full documentation.
 */

// Types
export type {
  GlyphKeyframe,
  PlantVariant,
  ColorVariation,
  ComputedLifecycleState,
  PlantWithLifecycle,
  InterpolatedKeyframe,
} from "./types";

// Lifecycle computation
export {
  getTotalDuration,
  getEffectiveDuration,
  computeLifecycleState,
  getActiveVisual,
  interpolateKeyframes,
  growthRateToLifecycleModifier,
  isLifecycleComplete,
  selectColorVariation,
  getEffectivePalette,
  getKeyframeWithEffectivePalette,
} from "./lifecycle";

// Variant definitions
export { PLANT_VARIANTS, getVariantById, getAllVariants } from "./definitions";
