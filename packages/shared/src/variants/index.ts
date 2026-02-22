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
  // Quantum property mapping (Path B)
  QuantumPropertyMapping,
  QuantumPropertySchema,
  QuantumPropertyConfig,
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
  // Progressive drawing types
  VectorGlyphSnapshot,
  VectorTransitionHint,
  EasingType,
  TransitionStrategy,
  // Clustering behavior
  ClusteringBehavior,
  // Watercolor rendering types
  WatercolorShapeDef,
  WatercolorPetal,
  WatercolorLeaf,
  WatercolorDisc,
  WatercolorDot,
  WatercolorStem,
  WatercolorElement,
  WatercolorEffect,
  WatercolorBuildContext,
  WatercolorConfig,
  // Sandbox
  SandboxTraitControl,
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
  // Vector/pixel/watercolor abstraction helpers
  isVectorVariant,
  isWatercolorVariant,
  getEffectiveKeyframes,
  getKeyframeCount,
  getBaseTotalDuration,
  getVectorKeyframe,
  // Vector tweening
  getActiveVectorVisual,
  interpolateVectorKeyframes,
  isInterpolatedVectorKeyframe,
  // Time travel / progress-based rendering
  computeLifecycleStateFromProgress,
  renderVectorGlyphAtProgress,
} from "./lifecycle";

// Variant definitions
export { PLANT_VARIANTS, getVariantById, getAllVariants } from "./registry";
