/**
 * Watercolor Zen Lotus
 *
 * A serene lotus viewed from ABOVE, floating on water. Two concentric
 * rings of petals surround a mandala-like center disc with dot patterns.
 * No stem — the flower sits directly on a faint water surface.
 *
 * The breathe keyframe gently expands and contracts the bloom, and the
 * symmetryFold trait biases petal arrangement toward specific rotational
 * symmetries (3-fold, 4-fold, or 6-fold).
 *
 * Category: watercolor (flowers)
 * Rarity: 0.03 (base 0.2 x 0.15)
 * Render mode: watercolor
 * Path A: wc_zen_lotus custom Python circuit
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr, radialPositions } from "../_helpers";

/**
 * Color palettes for the Zen Lotus, keyed by color variation name.
 * Each palette has primary (petals), secondary (inner petals), and accent (center/dots).
 */
const LOTUS_COLORS: Record<string, { primary: string; secondary: string; accent: string }> = {
  "white-jade": { primary: "#C8CEC8", secondary: "#B0BAB0", accent: "#98A498" },
  "blush-pink": { primary: "#D8B8C0", secondary: "#C8A8B4", accent: "#B898A8" },
  "morning-gold": { primary: "#D8CEB8", secondary: "#C8BEA8", accent: "#B8AE98" },
};

const DEFAULT_COLORS = LOTUS_COLORS["white-jade"]!;

/**
 * Get the openness factor for each lifecycle keyframe.
 * The lotus has a meditative lifecycle: slow rise, full bloom, gentle breathing, rest, close.
 */
function getLotusOpenness(
  keyframeName: string,
  progress: number,
  breatheAmplitude: number
): number {
  switch (keyframeName) {
    case "seed":
      return 0;
    case "bud":
      return progress * 0.15;
    case "rise":
      return 0.15 + progress * 0.25;
    case "open":
      return 0.4 + progress * 0.2;
    case "unfurl":
      return 0.6 + progress * 0.2;
    case "bloom":
      return 0.8 + progress * 0.2;
    case "breathe":
      return 1.0 + Math.sin(progress * Math.PI * 2) * breatheAmplitude;
    case "rest":
      return 1.0 - progress * 0.1;
    case "close":
      return 0.9 * (1 - progress * 0.5);
    default:
      return 0.5;
  }
}

/**
 * Builder function for the Watercolor Zen Lotus variant.
 *
 * Visual design — top-down view of a lotus floating on water:
 * - Outer ring of 4-8 slightly narrower petals
 * - Inner ring of 3-6 wide rounded petals, offset by half a step from outer
 * - Center disc with mandala-like dot pattern (concentric arrangement)
 * - Optional faint water surface disc underneath everything
 *
 * Path A: reads innerPetals, outerPetals, symmetryFold, breatheAmplitude
 * directly from ctx.traits (set by the wc_zen_lotus Python circuit).
 */
function buildWcZenLotusElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  // Path A: read traits from Python circuit's extra dict (via plant.traits).
  // Fallback values for unobserved plants (ctx.traits is null).
  const innerPetals = traitOr(ctx.traits, "innerPetals", 5);
  const outerPetals = traitOr(ctx.traits, "outerPetals", 6);
  const symmetryFold = traitOr(ctx.traits, "symmetryFold", 6);
  const breatheAmplitude = traitOr(ctx.traits, "breatheAmplitude", 0.04);

  // Color selection
  const colors =
    ctx.colorVariationName && LOTUS_COLORS[ctx.colorVariationName]
      ? LOTUS_COLORS[ctx.colorVariationName]!
      : ctx.traits?.colorPalette
        ? {
            primary: ctx.traits.colorPalette[0] ?? DEFAULT_COLORS.primary,
            secondary: ctx.traits.colorPalette[1] ?? DEFAULT_COLORS.secondary,
            accent: ctx.traits.colorPalette[2] ?? DEFAULT_COLORS.accent,
          }
        : DEFAULT_COLORS;

  // Lifecycle-driven openness
  const openness = getLotusOpenness(ctx.keyframeName, ctx.keyframeProgress, breatheAmplitude);

  // Center position (centered — viewed from above)
  const cx = 32;
  const cy = 32;

  // === WATER SURFACE DISC ===
  // Very large, very faint — sits underneath everything
  if (openness > 0) {
    elements.push({
      shape: { type: "disc", radius: 28 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: "#D0D8E0",
      opacity: 0.08 + openness * 0.04,
      zOffset: -1.0,
    });
  }

  // === OUTER PETAL RING ===
  // Slightly narrower, longer petals. Offset by half a step from inner ring.
  const outerPetalOpenness = Math.max(0, (openness - 0.1) / 0.9);
  if (outerPetalOpenness > 0) {
    // Use symmetryFold to bias the actual petal count toward a symmetry
    const effectiveOuterCount = outerPetals;
    const outerOffsetAngle = Math.PI / effectiveOuterCount; // half-step offset from inner ring
    const outerRadius = 12 * outerPetalOpenness;
    const outerPositions = radialPositions(
      cx,
      cy,
      outerRadius,
      effectiveOuterCount,
      outerOffsetAngle
    );

    for (let i = 0; i < outerPositions.length; i++) {
      const pos = outerPositions[i]!;
      const roundness = 0.8 + rng() * 0.2; // 0.8–1.0
      const pw = (4 + rng() * 0.8) * outerPetalOpenness;
      const pl = (10 + rng() * 2) * outerPetalOpenness;

      elements.push({
        shape: {
          type: "petal",
          width: pw,
          length: pl,
          roundness,
        },
        position: { x: cx, y: cy },
        rotation: pos.angle + rng() * 0.08,
        scale: 1.0,
        color: colors.primary,
        zOffset: 0.5,
      });
    }
  }

  // === INNER PETAL RING ===
  // Wider, rounder petals arranged radially
  const innerPetalOpenness = Math.max(0, (openness - 0.2) / 0.8);
  if (innerPetalOpenness > 0) {
    // Bias toward symmetryFold: use the actual innerPetals count but align angles
    const effectiveInnerCount = innerPetals;
    const innerRadius = 7 * innerPetalOpenness;
    const innerPositions = radialPositions(cx, cy, innerRadius, effectiveInnerCount, 0);

    for (let i = 0; i < innerPositions.length; i++) {
      const pos = innerPositions[i]!;
      const roundness = 1.0 + rng() * 0.3; // 1.0–1.3
      const pw = (5 + rng() * 1) * innerPetalOpenness;
      const pl = (8 + rng() * 1.5) * innerPetalOpenness;

      elements.push({
        shape: {
          type: "petal",
          width: pw,
          length: pl,
          roundness,
        },
        position: { x: cx, y: cy },
        rotation: pos.angle + rng() * 0.06,
        scale: 1.0,
        color: colors.secondary,
        zOffset: 1.0,
      });
    }
  }

  // === CENTER DISC ===
  if (innerPetalOpenness > 0.15) {
    const discRadius = 3 * innerPetalOpenness;
    elements.push({
      shape: { type: "disc", radius: discRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colors.accent,
      opacity: 0.65,
      zOffset: 2.0,
    });

    // === MANDALA DOT PATTERN ===
    // Concentric rings of dots inside the center disc
    // The symmetryFold trait determines how many dots per ring
    const dotRings = symmetryFold >= 5 ? 2 : 1;
    const dotsPerRing = symmetryFold;

    for (let ring = 0; ring < dotRings; ring++) {
      const ringRadius = discRadius * (0.3 + ring * 0.35);
      const ringOffset = ring * (Math.PI / dotsPerRing); // stagger rings

      for (let i = 0; i < dotsPerRing; i++) {
        const angle = ((Math.PI * 2) / dotsPerRing) * i + ringOffset;
        const dotX = cx + Math.cos(angle) * ringRadius;
        const dotY = cy + Math.sin(angle) * ringRadius;

        elements.push({
          shape: { type: "dot", radius: 0.25 + rng() * 0.2 },
          position: { x: dotX, y: dotY },
          rotation: 0,
          scale: 1,
          color: colors.accent,
          opacity: 0.4 + rng() * 0.3,
          zOffset: 2.2,
        });
      }
    }

    // Central dot
    elements.push({
      shape: { type: "dot", radius: 0.35 + rng() * 0.15 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colors.accent,
      opacity: 0.55 + rng() * 0.2,
      zOffset: 2.3,
    });
  }

  return elements;
}

export const wcZenLotus: PlantVariant = {
  id: "wc-zen-lotus",
  name: "Zen Lotus",
  description:
    "A serene lotus viewed from above, floating on still water with concentric petal rings and a mandala center, its symmetry shaped by entangled qubit pairs",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  // Path A: custom Python circuit encodes all visual properties directly.
  // The wc_zen_lotus circuit maps qubit measurements to
  // innerPetals, outerPetals, symmetryFold, and breatheAmplitude in its extra dict.
  circuitId: "wc_zen_lotus",
  sandboxControls: [
    { key: "innerPetals", label: "Inner Petals", min: 3, max: 6, step: 1, default: 5 },
    { key: "outerPetals", label: "Outer Petals", min: 4, max: 8, step: 1, default: 6 },
    { key: "symmetryFold", label: "Symmetry Fold", min: 3, max: 6, step: 1, default: 6 },
    {
      key: "breatheAmplitude",
      label: "Breathe Amplitude",
      min: 0.02,
      max: 0.08,
      step: 0.01,
      default: 0.04,
    },
  ],
  colorVariations: [
    {
      name: "white-jade",
      weight: 1.0,
      palettes: { bloom: ["#C8CEC8", "#B0BAB0", "#98A498"] },
    },
    {
      name: "blush-pink",
      weight: 0.9,
      palettes: { bloom: ["#D8B8C0", "#C8A8B4", "#B898A8"] },
    },
    {
      name: "morning-gold",
      weight: 0.8,
      palettes: { bloom: ["#D8CEB8", "#C8BEA8", "#B8AE98"] },
    },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "seed", duration: 10 },
      { name: "bud", duration: 12 },
      { name: "rise", duration: 12 },
      { name: "open", duration: 15 },
      { name: "unfurl", duration: 18 },
      { name: "bloom", duration: 40 },
      { name: "breathe", duration: 25 },
      { name: "rest", duration: 20 },
      { name: "close", duration: 15 },
    ],
    wcEffect: {
      layers: 4,
      opacity: 0.42,
      spread: 0.05,
      colorVariation: 0.03,
    },
    buildElements: buildWcZenLotusElements,
  },
};
