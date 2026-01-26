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
  // Vector rendering types
  VectorPrimitive,
  VectorCircle,
  VectorLine,
  VectorPolygon,
  VectorStar,
  VectorDiamond,
  VectorKeyframe,
  InterpolatedVectorKeyframe,
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
  // Vector/pixel abstraction helpers
  isVectorVariant,
  getEffectiveKeyframes,
  getKeyframeCount,
  getBaseTotalDuration,
  getVectorKeyframe,
  // Vector tweening
  getActiveVectorVisual,
  interpolateVectorKeyframes,
  isInterpolatedVectorKeyframe,
} from "./lifecycle";

// Variant definitions
export { PLANT_VARIANTS, getVariantById, getAllVariants } from "./definitions";
