/**
 * Watercolor Kaleidoscope Star Vector
 *
 * A more saturated, vivid version of the kaleidoscope star with more points
 * and tighter geometry. Neon and prism color variations give it an electric,
 * ethereal feel. More concentric rings and pointed petals than the standard
 * kaleidoscope star.
 *
 * Category: watercolor (ethereal-vector adaptation)
 * Rarity: 0.02
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr, radialPositions } from "../_helpers";

// -- Color palettes -----------------------------------------------------------

interface StarVectorColors {
  primary: string;
  secondary: string;
  accent: string;
}

const STAR_VECTOR_COLORS: Record<string, StarVectorColors> = {
  neon: { primary: "#20D8A8", secondary: "#D820A8", accent: "#20A8D8" },
  prism: { primary: "#E84040", secondary: "#40E840", accent: "#4040E8" },
};

const DEFAULT_COLORS: StarVectorColors = STAR_VECTOR_COLORS.neon!;

// -- Openness curve -----------------------------------------------------------

function starVectorOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "dormant":
      return 0;
    case "forming":
      return progress * 0.5; // 0 -> 0.5
    case "star":
      return 0.5 + progress * 0.5; // 0.5 -> 1.0
    case "pulse":
      // Tighter pulsing for the vector version
      return 0.95 + 0.05 * Math.sin(progress * Math.PI * 3);
    default:
      return 0.5;
  }
}

// -- Builder ------------------------------------------------------------------

function buildWcKaleidoscopeStarVectorElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const pointCount = traitOr(ctx.traits, "pointCount", 8);
  const innerRadius = traitOr(ctx.traits, "innerRadius", 4.5);
  const outerRadius = traitOr(ctx.traits, "outerRadius", 16);

  const openness = starVectorOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const colors =
    ctx.colorVariationName && STAR_VECTOR_COLORS[ctx.colorVariationName]
      ? STAR_VECTOR_COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const cx = 32;
  const cy = 32;

  // -- Center disc (vivid accent) ---------------------------------------------
  if (openness > 0.05) {
    const centerRadius = 1.5 + openness * 1.0;
    elements.push({
      shape: { type: "disc", radius: centerRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colors.accent,
      opacity: 0.8,
      zOffset: 2.0,
    });
  }

  // -- Concentric disc rings (3-4 rings, tighter than base) -------------------
  const ringOpenness = Math.max(0, (openness - 0.05) / 0.45);
  if (ringOpenness > 0) {
    const ringCount = 3 + (rng() > 0.5 ? 1 : 0); // 3 or 4 rings
    for (let r = 0; r < ringCount; r++) {
      const ringFraction = (r + 1) / (ringCount + 1);
      const ringRadius = innerRadius * ringFraction * ringOpenness;
      const discCount = pointCount + Math.floor(rng() * 4);
      const positions = radialPositions(cx, cy, ringRadius, discCount, rng() * Math.PI);

      for (const pos of positions) {
        const dr = 0.4 + rng() * 0.55;
        elements.push({
          shape: { type: "disc", radius: dr * ringOpenness },
          position: { x: pos.x, y: pos.y },
          rotation: 0,
          scale: 1,
          color: r % 2 === 0 ? colors.secondary : colors.primary,
          opacity: 0.35 + ringOpenness * 0.2,
          zOffset: 1.0 + r * 0.1,
        });
      }
    }
  }

  // -- Main star petals (N pointed, radiating outward) ------------------------
  const petalOpenness = Math.max(0, (openness - 0.35) / 0.65);
  if (petalOpenness > 0) {
    const mainPositions = radialPositions(cx, cy, 0, pointCount);
    for (const pos of mainPositions) {
      const petalWidth = (2.0 + rng() * 1.2) * petalOpenness;
      const petalLength = outerRadius * petalOpenness;

      elements.push({
        shape: { type: "petal", width: petalWidth, length: petalLength, roundness: 0.45 },
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
          shape: { type: "dot", radius: 0.3 + rng() * 0.4 },
          position: { x: tipX, y: tipY },
          rotation: 0,
          scale: 1,
          color: colors.accent,
          opacity: 0.45 + rng() * 0.3,
          zOffset: 2.5,
        });
      }
    }
  }

  // -- Inner star petals (between main points, tighter geometry) --------------
  if (petalOpenness > 0.15) {
    const innerPetalOpenness = (petalOpenness - 0.15) / 0.85;
    const halfStep = Math.PI / pointCount;
    const innerPositions = radialPositions(cx, cy, 0, pointCount, halfStep);

    for (const pos of innerPositions) {
      const pw = (1.5 + rng() * 0.8) * innerPetalOpenness;
      const pl = outerRadius * 0.45 * innerPetalOpenness;

      elements.push({
        shape: { type: "petal", width: pw, length: pl, roundness: 0.4 },
        position: { x: cx, y: cy },
        rotation: pos.angle,
        scale: 1.0,
        color: colors.secondary,
        zOffset: 0.3,
      });

      // Extra inner tip dots for the vector version
      if (innerPetalOpenness > 0.5) {
        const innerTipX = cx + Math.cos(pos.angle) * pl;
        const innerTipY = cy + Math.sin(pos.angle) * pl;
        elements.push({
          shape: { type: "dot", radius: 0.2 + rng() * 0.25 },
          position: { x: innerTipX, y: innerTipY },
          rotation: 0,
          scale: 1,
          color: colors.primary,
          opacity: 0.35 + rng() * 0.2,
          zOffset: 1.8,
        });
      }
    }
  }

  return elements;
}

// -- Variant export -----------------------------------------------------------

export const wcKaleidoscopeStarVector: PlantVariant = {
  id: "wc-kaleidoscope-star-vector",
  name: "Kaleidoscope Star Vector",
  disabled: true,
  description:
    "A vivid mandala-like star with neon radiating petals and tight concentric rings, its symmetry amplified by quantum entropy",
  rarity: 0.02,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      pointCount: { signal: "entropy", range: [6, 10], default: 8, round: true },
      innerRadius: { signal: "certainty", range: [3, 6], default: 4.5 },
      outerRadius: { signal: "growth", range: [12, 20], default: 16 },
    },
  },
  colorVariations: [
    { name: "neon", weight: 1.0, palettes: { full: ["#20D8A8", "#D820A8", "#20A8D8"] } },
    { name: "prism", weight: 0.7, palettes: { full: ["#E84040", "#40E840", "#4040E8"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "dormant", duration: 5 },
      { name: "forming", duration: 12 },
      { name: "star", duration: 38 },
      { name: "pulse", duration: 10 },
    ],
    wcEffect: { layers: 3, opacity: 0.52, spread: 0.05, colorVariation: 0.05 },
    buildElements: buildWcKaleidoscopeStarVectorElements,
  },
};
