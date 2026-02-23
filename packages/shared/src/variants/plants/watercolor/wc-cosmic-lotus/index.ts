/**
 * Watercolor Cosmic Lotus
 *
 * A sacred geometry lotus — inner circle of overlapping discs in a
 * flower-of-life pattern, surrounded by an outer ring of large petals,
 * with cosmic radiance (dot particles) emanating outward in a spiral.
 * The most complex and rare watercolor variant.
 *
 * Category: watercolor (cosmic flora)
 * Rarity: 0.02
 * Render mode: watercolor
 * Path A: custom Python circuit (wc_cosmic_lotus) — no quantumMapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, radialPositions, traitOr } from "../_helpers";

/**
 * Color sets for the cosmic lotus, keyed by color variation name.
 */
const LOTUS_COLORS: Record<string, { inner: string; outer: string; radiance: string }> = {
  celestial: { inner: "#D8A050", outer: "#8060B8", radiance: "#F0D888" },
  void: { inner: "#3050A0", outer: "#5070C0", radiance: "#A0B8E8" },
  ethereal: { inner: "#D8D8E8", outer: "#B8B8D0", radiance: "#F0F0F8" },
};

const LOTUS_DEFAULT_COLORS = LOTUS_COLORS["celestial"]!;

/**
 * Get lotus-specific openness for lifecycle keyframes.
 * void -> genesis -> lotus -> radiance
 */
function getLotusOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "void":
      return 0; // nothing visible
    case "genesis":
      return progress * 0.4; // 0 -> 0.4 (inner circles form)
    case "lotus":
      return 0.4 + progress * 0.5; // 0.4 -> 0.9 (outer petals and radiance)
    case "radiance":
      return 0.9 + progress * 0.1; // 0.9 -> 1.0 (full cosmic glow)
    default:
      return 0.5;
  }
}

/**
 * Builder function for the Watercolor Cosmic Lotus variant.
 *
 * Creates a sacred geometry lotus with inner flower-of-life discs,
 * outer petals, and cosmic radiance particles in a spiral pattern.
 *
 * Visual design:
 * - Inner flower-of-life: overlapping discs around center
 * - Center disc (bright, small)
 * - Outer petal ring: large petals radiating outward
 * - Radiance particles: dots emanating in spiral from center outward
 */
function buildWcCosmicLotusElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  // Path A: read properties from Python circuit's extra dict (via plant.traits).
  // Fallback values for unobserved plants (ctx.traits is null).
  const innerCircleCount = traitOr(ctx.traits, "innerCircleCount", 4);
  const outerPetalCount = traitOr(ctx.traits, "outerPetalCount", 7);
  const radianceRadius = traitOr(ctx.traits, "radianceRadius", 1.0);
  const spiralTurns = traitOr(ctx.traits, "spiralTurns", 1.2);

  // Color selection
  const colorSet =
    (ctx.colorVariationName ? LOTUS_COLORS[ctx.colorVariationName] : null) ??
    (ctx.traits?.colorPalette
      ? {
          inner: ctx.traits.colorPalette[0] ?? LOTUS_DEFAULT_COLORS.inner,
          outer: ctx.traits.colorPalette[1] ?? LOTUS_DEFAULT_COLORS.outer,
          radiance: ctx.traits.colorPalette[2] ?? LOTUS_DEFAULT_COLORS.radiance,
        }
      : LOTUS_DEFAULT_COLORS);

  // Lifecycle-driven openness
  const openness = getLotusOpenness(ctx.keyframeName, ctx.keyframeProgress);

  if (openness <= 0) return elements;

  const cx = 32;
  const cy = 30;

  // === CENTER DISC ===
  // Bright, small disc at the very center — the seed of the lotus
  if (openness > 0.05) {
    const centerOpenness = Math.min(1, openness / 0.3);
    const centerRadius = (1.5 + centerOpenness * 1.5) * radianceRadius * 0.6;

    elements.push({
      shape: { type: "disc", radius: centerRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.radiance,
      opacity: 0.6 * centerOpenness,
      zOffset: 2.0,
    });
  }

  // === INNER FLOWER-OF-LIFE DISCS ===
  // Overlapping discs arranged in a circle, creating flower-of-life intersections
  if (openness > 0.1) {
    const innerOpenness = Math.min(1, (openness - 0.1) / 0.3);
    // The radius from center to each inner disc — close enough to overlap
    const innerRingRadius = 4.5 * innerOpenness * radianceRadius;
    const innerDiscRadius = 3.5 * innerOpenness * radianceRadius;
    const innerPositions = radialPositions(cx, cy, innerRingRadius, innerCircleCount, 0);

    for (let i = 0; i < innerPositions.length; i++) {
      const pos = innerPositions[i]!;

      elements.push({
        shape: { type: "disc", radius: innerDiscRadius },
        position: { x: pos.x, y: pos.y },
        rotation: 0,
        scale: 1,
        color: colorSet.inner,
        opacity: (0.25 + rng() * 0.1) * innerOpenness,
        zOffset: 0.8 + i * 0.05,
      });
    }

    // Secondary inner layer — slightly offset for depth
    if (innerOpenness > 0.5) {
      const secondaryOffset = Math.PI / innerCircleCount; // half-step rotation
      const secondaryPositions = radialPositions(
        cx,
        cy,
        innerRingRadius * 0.6,
        Math.max(2, innerCircleCount - 1),
        secondaryOffset
      );

      for (let i = 0; i < secondaryPositions.length; i++) {
        const pos = secondaryPositions[i]!;
        elements.push({
          shape: { type: "disc", radius: innerDiscRadius * 0.7 },
          position: { x: pos.x, y: pos.y },
          rotation: 0,
          scale: innerOpenness,
          color: colorSet.radiance,
          opacity: (0.2 + rng() * 0.08) * innerOpenness,
          zOffset: 1.0 + i * 0.05,
        });
      }
    }
  }

  // === OUTER PETAL RING ===
  // Large petals radiating outward from the inner structure
  if (openness > 0.4) {
    const petalOpenness = Math.min(1, (openness - 0.4) / 0.4);
    const outerRadius = (10 + petalOpenness * 4) * radianceRadius;
    const outerPositions = radialPositions(cx, cy, outerRadius * 0.5, outerPetalCount, 0);

    for (let i = 0; i < outerPositions.length; i++) {
      const pos = outerPositions[i]!;
      const petalWidth = (4 + rng() * 2) * petalOpenness * radianceRadius;
      const petalLength = (8 + rng() * 3) * petalOpenness * radianceRadius;

      elements.push({
        shape: {
          type: "petal",
          width: petalWidth,
          length: petalLength,
          roundness: 0.65 + rng() * 0.15,
        },
        position: { x: cx, y: cy },
        rotation: pos.angle + rng() * 0.08,
        scale: 1.0,
        color: colorSet.outer,
        opacity: (0.35 + rng() * 0.1) * petalOpenness,
        zOffset: 0.4 + i * 0.03,
      });
    }
  }

  // === RADIANCE PARTICLES (spiral pattern) ===
  // Dots emanating in a spiral from center outward
  if (openness > 0.5) {
    const radianceOpenness = Math.min(1, (openness - 0.5) / 0.4);
    const particleCount = Math.floor(12 + outerPetalCount * 2);

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount; // 0 to 1 along the spiral
      // Spiral: angle increases with t, radius increases with t
      const spiralAngle = t * spiralTurns * Math.PI * 2 + rng() * 0.3;
      const spiralDist = (3 + t * 14) * radianceRadius * radianceOpenness;
      const x = cx + Math.cos(spiralAngle) * spiralDist;
      const y = cy + Math.sin(spiralAngle) * spiralDist;
      const dotRadius = (0.2 + rng() * 0.5) * (1 - t * 0.5); // smaller at outer edge

      elements.push({
        shape: { type: "dot", radius: dotRadius },
        position: { x, y },
        rotation: 0,
        scale: radianceOpenness,
        color: i % 3 === 0 ? colorSet.radiance : colorSet.inner,
        opacity: (0.25 + rng() * 0.3) * radianceOpenness * (1 - t * 0.4),
        zOffset: 2.5 + rng() * 0.3,
      });
    }
  }

  // === COSMIC GLOW (large diffuse backdrop discs) ===
  // Very transparent large discs for ambient cosmic depth
  if (openness > 0.7) {
    const cosmicOpenness = Math.min(1, (openness - 0.7) / 0.3);

    for (let i = 0; i < 3; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * 6 * radianceRadius;
      const radius = (5 + rng() * 4) * radianceRadius * cosmicOpenness;
      const cosmicColor = i === 0 ? colorSet.outer : i === 1 ? colorSet.inner : colorSet.radiance;

      elements.push({
        shape: { type: "disc", radius },
        position: {
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
        },
        rotation: 0,
        scale: 1,
        color: cosmicColor,
        opacity: (0.08 + rng() * 0.06) * cosmicOpenness,
        zOffset: 0.05,
      });
    }
  }

  return elements;
}

export const wcCosmicLotus: PlantVariant = {
  id: "wc-cosmic-lotus",
  name: "Watercolor Cosmic Lotus",
  description:
    "A sacred geometry lotus with flower-of-life inner discs, radiating outer petals, and spiral cosmic radiance, its structure encoded by a 5-qubit multi-pair entanglement circuit",
  rarity: 0.02,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  // Path A: custom Python circuit encodes all visual properties directly.
  // The wc_cosmic_lotus circuit maps qubit measurements to
  // innerCircleCount, outerPetalCount, radianceRadius, and spiralTurns in its extra dict.
  circuitId: "wc_cosmic_lotus",
  sandboxControls: [
    {
      key: "innerCircleCount",
      label: "Inner Circle Count",
      min: 3,
      max: 6,
      step: 1,
      default: 4,
    },
    {
      key: "outerPetalCount",
      label: "Outer Petal Count",
      min: 5,
      max: 9,
      step: 1,
      default: 7,
    },
    {
      key: "radianceRadius",
      label: "Radiance Radius",
      min: 0.6,
      max: 1.4,
      step: 0.05,
      default: 1.0,
    },
    {
      key: "spiralTurns",
      label: "Spiral Turns",
      min: 0.5,
      max: 2.0,
      step: 0.1,
      default: 1.2,
    },
  ],
  colorVariations: [
    {
      name: "celestial",
      weight: 1.0,
      palettes: { bloom: ["#D8A050", "#8060B8", "#F0D888"] },
    },
    {
      name: "void",
      weight: 0.5,
      palettes: { bloom: ["#3050A0", "#5070C0", "#A0B8E8"] },
    },
    {
      name: "ethereal",
      weight: 0.7,
      palettes: { bloom: ["#D8D8E8", "#B8B8D0", "#F0F0F8"] },
    },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "void", duration: 5 },
      { name: "genesis", duration: 20 },
      { name: "lotus", duration: 45 },
      { name: "radiance", duration: 20 },
    ],
    wcEffect: {
      layers: 4,
      opacity: 0.45,
      spread: 0.08,
      colorVariation: 0.06,
    },
    buildElements: buildWcCosmicLotusElements,
  },
};
