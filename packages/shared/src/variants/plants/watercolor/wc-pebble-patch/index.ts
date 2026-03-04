/**
 * Watercolor Pebble Patch
 *
 * Scattered rounded stones in warm earth tones, rendered as soft watercolor discs.
 * Static composition — appears all at once and persists.
 *
 * Category: watercolor (ground-cover adaptation)
 * Rarity: 0.2 (base 1.3 × 0.15)
 * Render mode: watercolor
 * Path B: bell_pair circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr } from "../_helpers";

function buildWcPebblePatchElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const stoneCount = traitOr(ctx.traits, "stoneCount", 8);
  const scatterRadius = traitOr(ctx.traits, "scatterRadius", 14);

  const openness = ctx.keyframeName === "appear" ? ctx.keyframeProgress : 1.0;
  if (openness <= 0) return elements;

  // Earth tone palette
  const stoneColors = ["#B8A090", "#9E8878", "#D8C8B8", "#8B7660", "#C4B4A0"];

  // Ground texture base
  elements.push({
    shape: { type: "disc", radius: scatterRadius * 0.6 * openness },
    position: { x: 32, y: 32 },
    rotation: 0,
    scale: 1,
    color: "#D8D0C8",
    opacity: 0.15,
    zOffset: 0,
  });

  // Scattered stones
  for (let i = 0; i < stoneCount; i++) {
    if (openness < i / stoneCount) break;
    const angle = rng() * Math.PI * 2;
    const dist = rng() * scatterRadius;
    const radius = 1.0 + rng() * 2.5;
    const color = stoneColors[Math.floor(rng() * stoneColors.length)]!;

    elements.push({
      shape: { type: "disc", radius },
      position: { x: 32 + Math.cos(angle) * dist, y: 32 + Math.sin(angle) * dist },
      rotation: 0,
      scale: openness,
      color,
      opacity: 0.5 + rng() * 0.15,
      zOffset: 0.5,
    });
  }

  // Tiny ground texture dots
  for (let i = 0; i < 6; i++) {
    const a = rng() * Math.PI * 2;
    const d = rng() * scatterRadius * 1.1;
    elements.push({
      shape: { type: "dot", radius: 0.2 + rng() * 0.3 },
      position: { x: 32 + Math.cos(a) * d, y: 32 + Math.sin(a) * d },
      rotation: 0,
      scale: 1,
      color: "#9E8878",
      opacity: 0.2 + rng() * 0.15,
      zOffset: 1.0,
    });
  }

  return elements;
}

export const wcPebblePatch: PlantVariant = {
  id: "wc-pebble-patch",
  name: "Pebbles",
  description: "Warm-toned stones scattered like a watercolor still life on the garden floor",
  rarity: 0.2,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "bell_pair",
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 360,
    clusterBonus: 2.0,
    maxClusterDensity: 8,
    reseedClusterChance: 0.7,
  },
  quantumMapping: {
    schema: {
      stoneCount: { signal: "entropy", range: [4, 12], default: 8, round: true },
      scatterRadius: { signal: "spread", range: [8, 20], default: 14 },
    },
  },
  colorVariations: [
    { name: "warm", weight: 1.0, palettes: { settled: ["#B8A090", "#9E8878", "#D8C8B8"] } },
    { name: "cool", weight: 0.7, palettes: { settled: ["#A0A8B8", "#8890A0", "#C0C8D0"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "appear", duration: 10 },
      { name: "settled", duration: 120 },
    ],
    wcEffect: { layers: 2, opacity: 0.55, spread: 0.04, colorVariation: 0.08 },
    buildElements: buildWcPebblePatchElements,
  },
};
