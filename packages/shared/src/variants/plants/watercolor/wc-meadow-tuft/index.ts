/**
 * Watercolor Meadow Tuft
 *
 * Grass blades as tall narrow leaf shapes emerging from a base cluster,
 * with gentle swaying animation and seed-head dots at tips.
 *
 * Category: watercolor (grasses adaptation)
 * Rarity: 0.17 (base 1.1 × 0.15)
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr } from "../_helpers";

function buildWcMeadowTuftElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const bladeCount = traitOr(ctx.traits, "bladeCount", 5);
  const bladeHeight = traitOr(ctx.traits, "bladeHeight", 17);
  const swayAngle = traitOr(ctx.traits, "swayAngle", 0.25);

  // Determine lifecycle openness
  let openness: number;
  if (ctx.keyframeName === "sprout") {
    openness = 0.2 + ctx.keyframeProgress * 0.5;
  } else if (ctx.keyframeName === "full") {
    openness = 0.7 + ctx.keyframeProgress * 0.3;
  } else {
    // sway-left / sway-right
    openness = 1.0;
  }

  if (openness <= 0) return elements;

  // Sway direction based on keyframe
  const swayDir = ctx.keyframeName === "sway-left" ? -1 : ctx.keyframeName === "sway-right" ? 1 : 0;
  const swayOffset = swayDir * swayAngle * (0.5 + ctx.keyframeProgress * 0.5);

  const baseX = 32;
  const baseY = 48;

  // Base cluster
  elements.push({
    shape: { type: "disc", radius: 3 + openness * 2 },
    position: { x: baseX, y: baseY },
    rotation: 0,
    scale: 1,
    color: "#6B9E72",
    opacity: 0.35,
    zOffset: 0,
  });

  // Grass blades
  const bladeSpread = 3;
  for (let i = 0; i < bladeCount; i++) {
    const t = (i - (bladeCount - 1) / 2) / Math.max(1, bladeCount - 1);
    const bx = baseX + t * bladeSpread * 2;
    const height = (bladeHeight + rng() * 4) * openness;
    const bladeAngle = t * 0.15 + swayOffset + (rng() - 0.5) * 0.1;

    // Each blade as a leaf shape
    elements.push({
      shape: { type: "leaf", width: 1.2 + rng() * 0.5, length: height },
      position: { x: bx, y: baseY - 2 },
      rotation: -Math.PI / 2 + bladeAngle, // pointing up with slight lean
      scale: openness,
      color: rng() > 0.4 ? "#8EA888" : "#A8D8A8",
      opacity: 0.5 + rng() * 0.15,
      zOffset: 0.5 + i * 0.1,
    });

    // Seed head dots at blade tips
    if (openness > 0.7) {
      const tipX = bx + Math.sin(bladeAngle) * height * 0.8;
      const tipY = baseY - 2 - Math.cos(bladeAngle) * height * 0.8;
      elements.push({
        shape: { type: "dot", radius: 0.5 + rng() * 0.4 },
        position: { x: tipX, y: tipY },
        rotation: 0,
        scale: 1,
        color: "#C8D8B0",
        opacity: 0.4 + rng() * 0.2,
        zOffset: 1.5,
      });
    }
  }

  return elements;
}

export const wcMeadowTuft: PlantVariant = {
  id: "wc-meadow-tuft",
  name: "Watercolor Grass",
  description: "A soft cluster of painted grass blades that sway gently in an invisible breeze",
  rarity: 0.17,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 450,
    clusterBonus: 1.5,
    maxClusterDensity: 4,
    reseedClusterChance: 0.5,
  },
  quantumMapping: {
    schema: {
      bladeCount: { signal: "entropy", range: [3, 7], default: 5, round: true },
      bladeHeight: { signal: "growth", range: [12, 22], default: 17 },
      swayAngle: { signal: "spread", range: [0.1, 0.4], default: 0.25 },
    },
  },
  colorVariations: [
    { name: "sage", weight: 1.0, palettes: { full: ["#8EA888", "#A8D8A8", "#6B9E72"] } },
    { name: "golden", weight: 0.6, palettes: { full: ["#C8D8A0", "#D8E8B0", "#A0B880"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "sprout", duration: 8 },
      { name: "full", duration: 30 },
      { name: "sway-left", duration: 4 },
      { name: "sway-right", duration: 4 },
    ],
    wcEffect: { layers: 3, opacity: 0.45, spread: 0.05, colorVariation: 0.04 },
    buildElements: buildWcMeadowTuftElements,
  },
};
