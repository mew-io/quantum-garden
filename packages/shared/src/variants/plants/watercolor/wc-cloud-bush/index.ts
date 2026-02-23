/**
 * Watercolor Cloud Bush
 *
 * A soft, rounded bush painted as overlapping cloud-like discs.
 * Berry dots appear in later lifecycle stages. Gentle breathing effect.
 *
 * Category: watercolor (shrubs adaptation)
 * Rarity: 0.06 (base 0.4 × 0.15)
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr } from "../_helpers";

function buildWcCloudBushElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const puffCount = traitOr(ctx.traits, "puffCount", 6);
  const bushSize = traitOr(ctx.traits, "bushSize", 1.0);
  const berryCount = traitOr(ctx.traits, "berryCount", 4);

  // Lifecycle
  let openness: number;
  const kf = ctx.keyframeName;
  if (kf === "base") {
    openness = 0.5 + ctx.keyframeProgress * 0.3;
  } else if (kf === "full") {
    openness = 0.8 + ctx.keyframeProgress * 0.2;
  } else if (kf === "breathe-in") {
    openness = 1.0 - ctx.keyframeProgress * 0.05;
  } else if (kf === "breathe-out") {
    openness = 0.95 + ctx.keyframeProgress * 0.08;
  } else if (kf === "berried") {
    openness = 1.0;
  } else {
    openness = 0.8;
  }

  const cx = 32;
  const cy = 30;

  // Cloud/bush puffs arranged in dome shape
  const puffPositions = [
    [0, 3], // center bottom
    [-7, 1], // left
    [7, 1], // right
    [-4, -4], // upper left
    [4, -4], // upper right
    [0, -6], // top
    [-10, -1], // far left
    [10, -1], // far right
  ];

  for (let i = 0; i < Math.min(puffCount, puffPositions.length); i++) {
    const pos = puffPositions[i]!;
    const radius = (4 + rng() * 3) * bushSize * openness;
    const pColor = rng() > 0.5 ? "#A8D8A8" : "#88D0D0";

    elements.push({
      shape: { type: "disc", radius },
      position: { x: cx + pos[0]! * bushSize, y: cy + pos[1]! * bushSize },
      rotation: 0,
      scale: 1,
      color: pColor,
      opacity: 0.4 + rng() * 0.12,
      zOffset: 0.5 + i * 0.1,
    });
  }

  // Small leaf accents at bush edges
  for (let i = 0; i < 3; i++) {
    const angle = -Math.PI / 3 + (i * Math.PI) / 3;
    const edgeDist = 8 * bushSize;
    elements.push({
      shape: { type: "leaf", width: 2.5, length: 5 },
      position: {
        x: cx + Math.cos(angle) * edgeDist,
        y: cy + Math.sin(angle) * edgeDist + 2,
      },
      rotation: angle + Math.PI / 2,
      scale: openness * 0.6,
      color: "#6B9E72",
      zOffset: 1.0,
    });
  }

  // Berries (only in later keyframes)
  if (kf === "berried" || kf === "breathe-out") {
    for (let i = 0; i < berryCount; i++) {
      const bx = cx + (rng() - 0.5) * 16 * bushSize;
      const by = cy + (rng() - 0.5) * 10 * bushSize + 2;
      elements.push({
        shape: { type: "dot", radius: 0.6 + rng() * 0.5 },
        position: { x: bx, y: by },
        rotation: 0,
        scale: 1,
        color: "#E89090",
        opacity: 0.55 + rng() * 0.2,
        zOffset: 1.5,
      });
    }
  }

  return elements;
}

export const wcCloudBush: PlantVariant = {
  id: "wc-cloud-bush",
  name: "Watercolor Cloud Bush",
  description:
    "A soft, puffy bush painted in airy watercolor washes that breathes gently and bears painted berries",
  rarity: 0.06,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      puffCount: { signal: "spread", range: [4, 8], default: 6, round: true },
      bushSize: { signal: "growth", range: [0.7, 1.3], default: 1.0 },
      berryCount: { signal: "entropy", range: [0, 8], default: 4, round: true },
    },
  },
  colorVariations: [
    { name: "sage", weight: 1.0, palettes: { full: ["#A8D8A8", "#88D0D0", "#6B9E72"] } },
    { name: "sky", weight: 0.6, palettes: { full: ["#90B8E8", "#A8D0F0", "#6B8EA8"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "base", duration: 25 },
      { name: "full", duration: 20 },
      { name: "breathe-in", duration: 6 },
      { name: "breathe-out", duration: 6 },
      { name: "berried", duration: 40 },
    ],
    wcEffect: { layers: 3, opacity: 0.48, spread: 0.08, colorVariation: 0.06 },
    buildElements: buildWcCloudBushElements,
  },
};
