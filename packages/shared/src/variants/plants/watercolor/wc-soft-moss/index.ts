/**
 * Watercolor Soft Moss
 *
 * Gentle ground cover rendered as overlapping semi-transparent discs in
 * greens and teals, spreading outward from center over its lifecycle.
 *
 * Category: watercolor (ground-cover adaptation)
 * Rarity: 0.18 (base 1.2 × 0.15)
 * Render mode: watercolor
 * Path B: bell_pair circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, appearOpenness, traitOr, buildDiscCluster } from "../_helpers";

const MOSS_COLORS = {
  sage: { main: "#8EA888", accent: "#6B9E72", ground: "#A8C898" },
  teal: { main: "#88D0D0", accent: "#60B0B0", ground: "#A0D8C8" },
  forest: { main: "#4A8F3F", accent: "#3A7A30", ground: "#78B868" },
};

function buildWcSoftMossElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const clusterCount = traitOr(ctx.traits, "clusterCount", 5);
  const clusterDensity = traitOr(ctx.traits, "clusterDensity", 0.6);

  const openness = appearOpenness(ctx.keyframeName, ctx.keyframeProgress);
  if (openness <= 0) return elements;

  const colors =
    ctx.colorVariationName && MOSS_COLORS[ctx.colorVariationName as keyof typeof MOSS_COLORS]
      ? MOSS_COLORS[ctx.colorVariationName as keyof typeof MOSS_COLORS]!
      : MOSS_COLORS.sage;

  // Base ground disc
  elements.push({
    shape: { type: "disc", radius: 10 * openness * clusterDensity },
    position: { x: 32, y: 32 },
    rotation: 0,
    scale: 1,
    color: colors.ground,
    opacity: 0.25,
    zOffset: 0,
  });

  // Main moss clusters
  const scatterRadius = 12 * openness;
  buildDiscCluster(
    elements,
    32,
    32,
    Math.round(clusterCount * openness),
    [1.5 + clusterDensity, 3.5 + clusterDensity * 2],
    scatterRadius,
    colors.main,
    0.45,
    0.5,
    rng
  );

  // Accent highlight clusters (smaller, brighter)
  buildDiscCluster(
    elements,
    32,
    32,
    Math.round(clusterCount * 0.5 * openness),
    [0.8, 1.8],
    scatterRadius * 0.8,
    colors.accent,
    0.35,
    1.0,
    rng
  );

  // Spore dots
  const sporeCount = Math.round(3 + clusterDensity * 5);
  for (let i = 0; i < sporeCount; i++) {
    if (openness < 0.4) break;
    const a = rng() * Math.PI * 2;
    const d = rng() * scatterRadius * 1.2;
    elements.push({
      shape: { type: "dot", radius: 0.3 + rng() * 0.4 },
      position: { x: 32 + Math.cos(a) * d, y: 32 + Math.sin(a) * d },
      rotation: 0,
      scale: 1,
      color: colors.accent,
      opacity: 0.3 + rng() * 0.2,
      zOffset: 1.5,
    });
  }

  return elements;
}

export const wcSoftMoss: PlantVariant = {
  id: "wc-soft-moss",
  name: "Moss",
  description:
    "A gentle ground cover painted in soft watercolor washes, spreading across the garden floor like spilled tea",
  rarity: 0.18,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "bell_pair",
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 540,
    clusterBonus: 2.5,
    maxClusterDensity: 6,
    reseedClusterChance: 0.8,
  },
  quantumMapping: {
    schema: {
      clusterCount: { signal: "spread", range: [3, 8], default: 5, round: true },
      clusterDensity: { signal: "growth", range: [0.3, 0.9], default: 0.6 },
    },
  },
  colorVariations: [
    { name: "sage", weight: 1.0, palettes: { settled: ["#8EA888", "#6B9E72", "#A8C898"] } },
    { name: "teal", weight: 0.8, palettes: { settled: ["#88D0D0", "#60B0B0", "#A0D8C8"] } },
    { name: "forest", weight: 0.6, palettes: { settled: ["#4A8F3F", "#3A7A30", "#78B868"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "emerging", duration: 15 },
      { name: "spreading", duration: 40 },
      { name: "settled", duration: 90 },
    ],
    wcEffect: { layers: 3, opacity: 0.5, spread: 0.08, colorVariation: 0.06 },
    buildElements: buildWcSoftMossElements,
  },
};
