/**
 * Watercolor Dream Vine
 *
 * S-curve main vine stem with curling tendril stems branching off,
 * leaf pairs along the vine, and small bud dots at tendril tips.
 * Dreamy, flowing aesthetic with purple/green/lavender palette.
 *
 * Category: watercolor (vine/climber)
 * Rarity: 0.03
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr, buildLeaf } from "../_helpers";

const VINE_COLORS: Record<string, { vine: string; leaf: string; tendril: string; bud: string }> = {
  twilight: {
    vine: "#7A6898",
    leaf: "#7AB888",
    tendril: "#A888C8",
    bud: "#C8A0D8",
  },
  dawn: {
    vine: "#A08880",
    leaf: "#C8D098",
    tendril: "#D8A8B8",
    bud: "#E8C8D8",
  },
};

const DEFAULT_COLORS = VINE_COLORS.twilight!;

/**
 * Dream vine lifecycle openness curve.
 * seed (0.05) -> vine (0.05->0.5) -> tendril (0.5->0.85) -> bloom (0.85->1.0)
 */
function vineOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "seed":
      return 0.05;
    case "vine":
      return 0.05 + progress * 0.45;
    case "tendril":
      return 0.5 + progress * 0.35;
    case "bloom":
      return 0.85 + progress * 0.15;
    default:
      return 0.5;
  }
}

function buildWcDreamVineElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const vineLength = traitOr(ctx.traits, "vineLength", 1.0);
  const tendrilCount = traitOr(ctx.traits, "tendrilCount", 4);
  const curlTightness = traitOr(ctx.traits, "curlTightness", 1.0);

  const openness = vineOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const colors =
    ctx.colorVariationName && VINE_COLORS[ctx.colorVariationName]
      ? VINE_COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  if (openness <= 0) return elements;

  // === MAIN VINE (S-curve from bottom-left to upper-right) ===
  const startX = 14;
  const startY = 56;
  const endX = 50;
  const endY = 10;

  // Scale the vine length: how far along the vine we've grown
  const vineProgress = Math.min(openness * 2, 1.0); // vine fully extends by openness 0.5
  const effectiveEndX = startX + (endX - startX) * vineProgress * vineLength;
  const effectiveEndY = startY + (endY - startY) * vineProgress * vineLength;

  // S-curve control points
  const ctrl1X = startX + 20 + rng() * 4;
  const ctrl1Y = startY - 12;
  const ctrl2X = endX - 18 - rng() * 4;
  const ctrl2Y = endY + 10;

  // Interpolate control points based on vine progress
  const c1x = startX + (ctrl1X - startX) * vineProgress;
  const c1y = startY + (ctrl1Y - startY) * vineProgress;
  const c2x = startX + (ctrl2X - startX) * vineProgress;
  const c2y = startY + (ctrl2Y - startY) * vineProgress;

  elements.push({
    shape: {
      type: "stem",
      points: [
        [startX, startY],
        [c1x, c1y],
        [c2x, c2y],
        [effectiveEndX, effectiveEndY],
      ],
      thickness: 0.5 + openness * 0.4,
    },
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: 1,
    color: colors.vine,
    opacity: 0.55,
    zOffset: 0,
  });

  // === TENDRILS branching off the main vine ===
  const tendrilOpenness = Math.max(0, (openness - 0.35) / 0.5); // tendrils start appearing at 0.35

  if (tendrilOpenness > 0) {
    for (let i = 0; i < tendrilCount; i++) {
      // Position each tendril along the vine
      const t = (i + 0.5) / tendrilCount; // 0-1 position along vine
      if (t > vineProgress) break; // don't place tendrils past the grown portion

      // Compute approximate position on the S-curve using cubic interpolation
      const it = 1 - t;
      const branchX =
        it * it * it * startX +
        3 * it * it * t * ctrl1X +
        3 * it * t * t * ctrl2X +
        t * t * t * endX;
      const branchY =
        it * it * it * startY +
        3 * it * it * t * ctrl1Y +
        3 * it * t * t * ctrl2Y +
        t * t * t * endY;

      // Alternate tendril direction: left/right of the vine
      const side = i % 2 === 0 ? 1 : -1;

      // Tendril curl: an arching stem that curls outward
      const curlLength = (8 + rng() * 6) * tendrilOpenness * curlTightness;
      const curlAngle = side * (0.6 + rng() * 0.4);
      const tipX = branchX + Math.cos(curlAngle) * curlLength * side;
      const tipY = branchY - Math.sin(Math.abs(curlAngle)) * curlLength * 0.6 - rng() * 3;

      // Curl midpoint curves outward
      const midX = branchX + (tipX - branchX) * 0.5 + side * curlTightness * 3;
      const midY = branchY + (tipY - branchY) * 0.4 - curlTightness * 2;

      elements.push({
        shape: {
          type: "stem",
          points: [
            [branchX, branchY],
            [midX, midY],
            [tipX + side * curlTightness * 1.5, tipY - 1],
            [tipX, tipY],
          ],
          thickness: 0.25 + tendrilOpenness * 0.15,
        },
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        color: colors.tendril,
        opacity: 0.45,
        zOffset: 0.3,
      });

      // === LEAF PAIR at tendril branch point ===
      const leafScale = (0.4 + rng() * 0.3) * tendrilOpenness;
      const leafAngleBase = curlAngle * 0.6;

      // Left leaf
      buildLeaf(
        elements,
        branchX + side * 1.2,
        branchY - 0.5,
        leafAngleBase + 0.3,
        leafScale,
        3.0,
        6.5,
        colors.leaf,
        0.6
      );

      // Right leaf (mirror)
      buildLeaf(
        elements,
        branchX - side * 1.2,
        branchY - 0.5,
        -leafAngleBase - 0.3,
        leafScale,
        3.0,
        6.5,
        colors.leaf,
        0.6
      );

      // === BUD DOT at tendril tip ===
      // Only visible in bloom keyframe
      if (ctx.keyframeName === "bloom") {
        const budOpacity = 0.3 + ctx.keyframeProgress * 0.5;
        const budRadius = 0.6 + rng() * 0.5;

        elements.push({
          shape: { type: "dot", radius: budRadius },
          position: { x: tipX, y: tipY },
          rotation: 0,
          scale: 1,
          color: colors.bud,
          opacity: budOpacity,
          zOffset: 1.5,
        });

        // Secondary glow dot
        if (ctx.keyframeProgress > 0.3) {
          elements.push({
            shape: { type: "dot", radius: budRadius * 1.6 },
            position: { x: tipX, y: tipY },
            rotation: 0,
            scale: 1,
            color: colors.bud,
            opacity: budOpacity * 0.3,
            zOffset: 1.4,
          });
        }
      }
    }
  }

  return elements;
}

export const wcDreamVine: PlantVariant = {
  id: "wc-dream-vine",
  name: "Watercolor Dream Vine",
  description:
    "A flowing S-curve vine with curling tendrils and dreamy bud dots, its growth pattern shaped by quantum interference",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      vineLength: { signal: "growth", range: [0.6, 1.4], default: 1.0 },
      tendrilCount: { signal: "entropy", range: [2, 6], default: 4, round: true },
      curlTightness: { signal: "spread", range: [0.5, 1.5], default: 1.0 },
    },
  },
  colorVariations: [
    {
      name: "twilight",
      weight: 1.0,
      palettes: { bloom: ["#A888C8", "#7AB888", "#C8A0D8"] },
    },
    {
      name: "dawn",
      weight: 0.7,
      palettes: { bloom: ["#D8A8B8", "#C8D098", "#E8C8D8"] },
    },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "seed", duration: 5 },
      { name: "vine", duration: 20 },
      { name: "tendril", duration: 30 },
      { name: "bloom", duration: 25 },
    ],
    wcEffect: { layers: 3, opacity: 0.46, spread: 0.07, colorVariation: 0.05 },
    buildElements: buildWcDreamVineElements,
  },
};
