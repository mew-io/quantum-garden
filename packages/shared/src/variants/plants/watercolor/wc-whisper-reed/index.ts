/**
 * Watercolor Whisper Reed
 *
 * Tall thin reeds with fluffy circular tips, rendered as delicate stem
 * shapes with disc tops. Gentle sway animation.
 *
 * Category: watercolor (grasses adaptation)
 * Rarity: 0.14 (base 0.9 × 0.15)
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr } from "../_helpers";

function buildWcWhisperReedElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const reedCount = traitOr(ctx.traits, "reedCount", 3);
  const reedHeight = traitOr(ctx.traits, "reedHeight", 24);
  const tipSize = traitOr(ctx.traits, "tipSize", 1.8);

  // Lifecycle
  let openness: number;
  if (ctx.keyframeName === "dormant") {
    openness = 0;
  } else if (ctx.keyframeName === "rising") {
    openness = ctx.keyframeProgress * 0.7;
  } else if (ctx.keyframeName === "tall") {
    openness = 0.7 + ctx.keyframeProgress * 0.3;
  } else {
    // sway
    openness = 1.0;
  }

  if (openness <= 0) return elements;

  const swayDir = ctx.keyframeName === "sway" ? Math.sin(ctx.keyframeProgress * Math.PI * 2) : 0;
  const baseX = 32;
  const baseY = 54;

  // Reeds
  for (let i = 0; i < reedCount; i++) {
    const offset = (i - (reedCount - 1) / 2) * 5;
    const rx = baseX + offset;
    const height = (reedHeight + rng() * 4) * openness;
    const topY = baseY - height;
    const sway = swayDir * (3 + rng() * 2);

    // Reed stem
    elements.push({
      shape: {
        type: "stem",
        points: [
          [rx, baseY],
          [rx + sway * 0.3, baseY - height * 0.33],
          [rx + sway * 0.7, baseY - height * 0.66],
          [rx + sway, topY],
        ],
        thickness: 0.35 + openness * 0.15,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: "#9AAE8C",
      opacity: 0.5,
      zOffset: 0.5 + i * 0.1,
    });

    // Fluffy tip disc
    if (openness > 0.3) {
      const tipRadius = tipSize * (0.5 + openness * 0.5);
      elements.push({
        shape: { type: "disc", radius: tipRadius },
        position: { x: rx + sway, y: topY },
        rotation: 0,
        scale: 1,
        color: "#B8A888",
        opacity: 0.4 + openness * 0.15,
        zOffset: 1.0,
      });

      // Fluff dots around tip
      for (let j = 0; j < 3; j++) {
        const a = rng() * Math.PI * 2;
        const d = rng() * tipRadius * 1.2;
        elements.push({
          shape: { type: "dot", radius: 0.2 + rng() * 0.3 },
          position: { x: rx + sway + Math.cos(a) * d, y: topY + Math.sin(a) * d },
          rotation: 0,
          scale: 1,
          color: "#C8B898",
          opacity: 0.3 + rng() * 0.2,
          zOffset: 1.5,
        });
      }
    }
  }

  return elements;
}

export const wcWhisperReed: PlantVariant = {
  id: "wc-whisper-reed",
  name: "Reed",
  description: "Tall thin reeds with fluffy tips, painted in muted watercolor tones",
  rarity: 0.14,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      reedHeight: { signal: "growth", range: [18, 30], default: 24 },
      tipSize: { signal: "entropy", range: [1.0, 2.5], default: 1.8 },
      reedCount: { signal: "spread", range: [2, 4], default: 3, round: true },
    },
  },
  colorVariations: [
    { name: "marsh", weight: 1.0, palettes: { tall: ["#9AAE8C", "#B8A888", "#8EA888"] } },
    { name: "autumn", weight: 0.6, palettes: { tall: ["#C8B888", "#D8C898", "#A8A078"] } },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 450,
    clusterBonus: 1.5,
    maxClusterDensity: 5,
    reseedClusterChance: 0.6,
  },
  watercolorConfig: {
    keyframes: [
      { name: "dormant", duration: 8 },
      { name: "rising", duration: 15 },
      { name: "tall", duration: 35 },
      { name: "sway", duration: 8 },
    ],
    wcEffect: { layers: 3, opacity: 0.42, spread: 0.05, colorVariation: 0.03 },
    buildElements: buildWcWhisperReedElements,
  },
};
