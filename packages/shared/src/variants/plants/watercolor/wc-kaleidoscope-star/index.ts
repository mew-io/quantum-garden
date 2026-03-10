/**
 * Watercolor Kaleidoscope Star
 *
 * A mandala-like star viewed from above: N radiating petals with concentric
 * disc rings at the center. Between the main points sit shorter "inner star"
 * petals at half length. Dot accents mark each point tip.
 *
 * Category: watercolor (radial / geometric)
 * Rarity: 0.03 (base 1.0 x 0.03)
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr, radialPositions } from "../_helpers";

// ── Color palettes ────────────────────────────────────────────────────────────

interface StarColors {
  primary: string;
  secondary: string;
  accent: string;
}

const STAR_COLORS: Record<string, StarColors> = {
  aurora: { primary: "#70C0B0", secondary: "#A088C0", accent: "#50A0A0" },
  sunset: { primary: "#E8A870", secondary: "#D08898", accent: "#C08060" },
  midnight: { primary: "#6080B8", secondary: "#8098D0", accent: "#485888" },
};

const DEFAULT_COLORS: StarColors = STAR_COLORS.aurora!;

// ── Openness curve (custom 4-phase) ──────────────────────────────────────────

function starOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "dormant":
      return 0;
    case "forming":
      return progress * 0.5; // 0 -> 0.5
    case "star":
      return 0.5 + progress * 0.5; // 0.5 -> 1.0
    case "pulse":
      // Gentle pulsing around 1.0 using a sine wave
      return 0.95 + 0.05 * Math.sin(progress * Math.PI * 2);
    default:
      return 0.5;
  }
}

// ── Main builder ─────────────────────────────────────────────────────────────

function buildWcKaleidoscopeStarElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const pointCount = traitOr(ctx.traits, "pointCount", 6);
  const innerRadius = traitOr(ctx.traits, "innerRadius", 5);
  const outerRadius = traitOr(ctx.traits, "outerRadius", 14);

  const openness = starOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const colors =
    ctx.colorVariationName && STAR_COLORS[ctx.colorVariationName]
      ? STAR_COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const cx = 32;
  const cy = 32;

  // ── Center disc (small, opaque) ──────────────────────────────────────────
  if (openness > 0.05) {
    const centerRadius = 1.2 + openness * 0.8;
    elements.push({
      shape: { type: "disc", radius: centerRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colors.accent,
      opacity: 0.75,
      zOffset: 2.0,
    });
  }

  // ── Concentric disc rings (2-3 rings at increasing radii) ────────────────
  const ringOpenness = Math.max(0, (openness - 0.05) / 0.45); // fades in 0.05 -> 0.5
  if (ringOpenness > 0) {
    const ringCount = 2 + (rng() > 0.6 ? 1 : 0); // 2 or 3 rings
    for (let r = 0; r < ringCount; r++) {
      const ringFraction = (r + 1) / (ringCount + 1);
      const ringRadius = innerRadius * ringFraction * ringOpenness;
      const discCount = pointCount + Math.floor(rng() * 3);
      const positions = radialPositions(cx, cy, ringRadius, discCount, rng() * Math.PI);

      for (const pos of positions) {
        const dr = 0.5 + rng() * 0.6;
        elements.push({
          shape: { type: "disc", radius: dr * ringOpenness },
          position: { x: pos.x, y: pos.y },
          rotation: 0,
          scale: 1,
          color: r % 2 === 0 ? colors.secondary : colors.primary,
          opacity: 0.3 + ringOpenness * 0.2,
          zOffset: 1.0 + r * 0.1,
        });
      }
    }
  }

  // ── Main star petals (N pointed, radiating outward) ──────────────────────
  const petalOpenness = Math.max(0, (openness - 0.4) / 0.6); // fades in 0.4 -> 1.0
  if (petalOpenness > 0) {
    const mainPositions = radialPositions(cx, cy, 0, pointCount);
    for (const pos of mainPositions) {
      const petalWidth = (2.5 + rng() * 1.5) * petalOpenness;
      const petalLength = outerRadius * petalOpenness;

      elements.push({
        shape: { type: "petal", width: petalWidth, length: petalLength, roundness: 0.5 },
        position: { x: cx, y: cy },
        rotation: pos.angle,
        scale: 1.0,
        color: colors.primary,
        zOffset: 0.5,
      });

      // Dot accent at each point tip
      if (petalOpenness > 0.3) {
        const tipX = cx + Math.cos(pos.angle) * (outerRadius * petalOpenness);
        const tipY = cy + Math.sin(pos.angle) * (outerRadius * petalOpenness);
        elements.push({
          shape: { type: "dot", radius: 0.3 + rng() * 0.35 },
          position: { x: tipX, y: tipY },
          rotation: 0,
          scale: 1,
          color: colors.accent,
          opacity: 0.4 + rng() * 0.3,
          zOffset: 2.5,
        });
      }
    }
  }

  // ── Inner star petals (between main points, half length) ─────────────────
  if (petalOpenness > 0.2) {
    const innerPetalOpenness = (petalOpenness - 0.2) / 0.8;
    const halfStep = Math.PI / pointCount; // offset by half a step
    const innerPositions = radialPositions(cx, cy, 0, pointCount, halfStep);

    for (const pos of innerPositions) {
      const pw = (1.8 + rng() * 1.0) * innerPetalOpenness;
      const pl = outerRadius * 0.5 * innerPetalOpenness;

      elements.push({
        shape: { type: "petal", width: pw, length: pl, roundness: 0.5 },
        position: { x: cx, y: cy },
        rotation: pos.angle,
        scale: 1.0,
        color: colors.secondary,
        zOffset: 0.3,
      });
    }
  }

  return elements;
}

// ── Variant export ───────────────────────────────────────────────────────────

export const wcKaleidoscopeStar: PlantVariant = {
  id: "wc-kaleidoscope-star",
  name: "Kaleidoscope Star",
  disabled: true,
  description:
    "A mandala-like star of radiating petals with concentric disc rings, its symmetry determined by quantum entropy",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      pointCount: { signal: "entropy", range: [5, 9], default: 6, round: true },
      innerRadius: { signal: "certainty", range: [3, 7], default: 5 },
      outerRadius: { signal: "growth", range: [10, 18], default: 14 },
    },
  },
  colorVariations: [
    { name: "aurora", weight: 1.0, palettes: { bloom: ["#70C0B0", "#A088C0", "#50A0A0"] } },
    { name: "sunset", weight: 0.7, palettes: { bloom: ["#E8A870", "#D08898", "#C08060"] } },
    { name: "midnight", weight: 0.5, palettes: { bloom: ["#6080B8", "#8098D0", "#485888"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "dormant", duration: 5 },
      { name: "forming", duration: 15 },
      { name: "star", duration: 40 },
      { name: "pulse", duration: 8 },
    ],
    wcEffect: { layers: 3, opacity: 0.5, spread: 0.05, colorVariation: 0.04 },
    buildElements: buildWcKaleidoscopeStarElements,
  },
};
