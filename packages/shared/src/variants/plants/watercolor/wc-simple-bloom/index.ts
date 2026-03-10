/**
 * Watercolor Simple Bloom
 *
 * The classic flower in watercolor: stem, leaf pairs, petals around a center
 * disc with stamen dots. Soft pastels, gentle lifecycle.
 *
 * Category: watercolor (flowers adaptation)
 * Rarity: 0.15 (base 1.0 × 0.15)
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, standardOpenness, traitOr, buildStem } from "../_helpers";

const BLOOM_COLORS: Record<string, { petal: string; center: string; stem: string; leaf: string }> =
  {
    peach: { petal: "#F0C8A8", center: "#D8A070", stem: "#8EA888", leaf: "#9AAE8C" },
    mint: { petal: "#A8D8C8", center: "#60B0A0", stem: "#8EA888", leaf: "#9AAE8C" },
    blush: { petal: "#E8B8C8", center: "#C88098", stem: "#8EA888", leaf: "#9AAE8C" },
    cream: { petal: "#F0E8D0", center: "#D8C8A0", stem: "#8EA888", leaf: "#9AAE8C" },
  };

const DEFAULT_COLORS = BLOOM_COLORS.peach!;

function buildWcSimpleBloomElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const petalCount = traitOr(ctx.traits, "petalCount", 5);
  const leafCount = traitOr(ctx.traits, "leafCount", 2);
  const stemCurvature = traitOr(ctx.traits, "stemCurvature", 0.15);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const colors =
    ctx.colorVariationName && BLOOM_COLORS[ctx.colorVariationName]
      ? BLOOM_COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const cx = 32;
  const cy = 22;
  const stemBottom = 52;
  const stemFullTop = cy + 4;

  // Stem — grows upward with openness so it doesn't appear as a static stick
  const stemGrowth = Math.min(1, openness / 0.3);
  if (stemGrowth > 0) {
    const stemTopY = stemBottom + (stemFullTop - stemBottom) * stemGrowth;
    buildStem(
      elements,
      cx,
      stemBottom,
      cx,
      stemTopY,
      stemCurvature * stemGrowth,
      0.6 + openness * 0.3,
      colors.stem,
      0.55 * Math.min(1, stemGrowth * 2),
      rng
    );
  }

  // Leaves — positioned along the grown portion of the stem
  const leafOpenness = Math.max(0, (openness - 0.1) / 0.9);
  for (let i = 0; i < leafCount; i++) {
    if (leafOpenness <= 0) break;
    const t = (i + 0.5) / leafCount;
    const stemTopY = stemBottom + (stemFullTop - stemBottom) * stemGrowth;
    const leafY = stemBottom - t * (stemBottom - stemTopY);
    const side = i % 2 === 0 ? 1 : -1;
    const angle = side * (0.4 + rng() * 0.6);
    const scale = (0.5 + rng() * 0.5) * leafOpenness;

    elements.push({
      shape: { type: "leaf", width: 3.5, length: 9 },
      position: { x: cx + side * 1.5, y: leafY },
      rotation: angle,
      scale,
      color: colors.leaf,
      zOffset: 0.5,
    });
  }

  // Petals
  const petalOpenness = Math.max(0, (openness - 0.05) / 0.95);
  if (petalOpenness > 0) {
    const step = (Math.PI * 2) / petalCount;
    for (let i = 0; i < petalCount; i++) {
      const angle = step * i + rng() * 0.18;
      const pw = (3.5 + rng() * 2) * petalOpenness;
      const pl = (9 + rng() * 4) * petalOpenness;

      elements.push({
        shape: { type: "petal", width: pw, length: pl, roundness: 0.82 },
        position: { x: cx, y: cy },
        rotation: angle,
        scale: 1.0,
        color: colors.petal,
        zOffset: 1.0,
      });
    }
  }

  // Center disc
  if (petalOpenness > 0.2) {
    const discRadius = 1.4 + petalOpenness * 1.4;
    elements.push({
      shape: { type: "disc", radius: discRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colors.center,
      opacity: 0.7,
      zOffset: 2.0,
    });

    // Stamen dots
    const dotCount = Math.floor(3 + petalOpenness * 4);
    for (let i = 0; i < dotCount; i++) {
      const a = rng() * Math.PI * 2;
      const d = rng() * discRadius * 0.8;
      elements.push({
        shape: { type: "dot", radius: 0.28 + rng() * 0.35 },
        position: { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d },
        rotation: 0,
        scale: 1,
        color: colors.center,
        opacity: 0.35 + rng() * 0.35,
        zOffset: 2.1,
      });
    }
  }

  return elements;
}

export const wcSimpleBloom: PlantVariant = {
  id: "wc-simple-bloom",
  name: "Bloom",
  description:
    "A gentle painted flower with soft pastel petals, its form shaped by quantum measurement",
  rarity: 0.15,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      petalCount: { signal: "entropy", range: [4, 7], default: 5, round: true },
      leafCount: { signal: "growth", range: [1, 4], default: 2, round: true },
      stemCurvature: { signal: "certainty", range: [0.4, 0], default: 0.15 },
    },
  },
  colorVariations: [
    { name: "peach", weight: 1.0, palettes: { bloom: ["#F0C8A8", "#D8A070", "#8EA888"] } },
    { name: "mint", weight: 0.8, palettes: { bloom: ["#A8D8C8", "#60B0A0", "#8EA888"] } },
    { name: "blush", weight: 0.8, palettes: { bloom: ["#E8B8C8", "#C88098", "#8EA888"] } },
    { name: "cream", weight: 0.6, palettes: { bloom: ["#F0E8D0", "#D8C8A0", "#8EA888"] } },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 420,
    clusterBonus: 1.8,
    maxClusterDensity: 7,
    reseedClusterChance: 0.6,
  },
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 15 },
      { name: "sprout", duration: 20 },
      { name: "bloom", duration: 45 },
      { name: "fade", duration: 25 },
    ],
    wcEffect: { layers: 3, opacity: 0.48, spread: 0.07, colorVariation: 0.045 },
    buildElements: buildWcSimpleBloomElements,
  },
};
