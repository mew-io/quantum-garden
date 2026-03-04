/**
 * Watercolor Sapling Hope
 *
 * A young tree growing from the ground — thick trunk stem with an
 * expanding crown of overlapping discs and scattered leaves. Hopeful,
 * upward energy rendered in soft watercolor layers.
 *
 * Category: watercolor (trees adaptation)
 * Rarity: 0.04
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { buildDiscCluster, buildLeaf, buildStem, createRng, traitOr } from "../_helpers";

function buildWcSaplingHopeElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const crownSpread = traitOr(ctx.traits, "crownSpread", 1.0);
  const branchCount = traitOr(ctx.traits, "branchCount", 3);
  const trunkHeight = traitOr(ctx.traits, "trunkHeight", 26);

  // Lifecycle openness
  let openness: number;
  const kf = ctx.keyframeName;
  if (kf === "seed") {
    openness = 0.05;
  } else if (kf === "sprout") {
    openness = 0.05 + ctx.keyframeProgress * 0.35;
  } else if (kf === "sapling") {
    openness = 0.4 + ctx.keyframeProgress * 0.4;
  } else if (kf === "crown") {
    openness = 0.8 + ctx.keyframeProgress * 0.2;
  } else {
    openness = 0.5;
  }

  const baseX = 32;
  const baseY = 56;
  const scaledHeight = trunkHeight * openness;
  const crownCenterY = baseY - scaledHeight;

  // Trunk — thick stem from ground to crown center
  if (openness > 0.05) {
    const trunkThickness = 0.6 + openness * 0.6;
    const trunkColor = "#6B5B3A";
    buildStem(
      elements,
      baseX,
      baseY,
      baseX,
      crownCenterY,
      0.15,
      trunkThickness,
      trunkColor,
      0.5,
      rng
    );
  }

  // Branches radiating upward from the top of the trunk
  if (openness > 0.35) {
    const branchOpenness = Math.min(1, (openness - 0.35) / 0.65); // 0→1 over sapling+crown
    const branchSpreadAngle = Math.PI * 0.6; // ~108 degrees total upward fan
    for (let i = 0; i < branchCount; i++) {
      const t = branchCount > 1 ? i / (branchCount - 1) : 0.5;
      const angle =
        -Math.PI / 2 - branchSpreadAngle / 2 + t * branchSpreadAngle + (rng() - 0.5) * 0.15;
      const branchLen = (8 + rng() * 4) * branchOpenness * crownSpread;
      const tipX = baseX + Math.cos(angle) * branchLen;
      const tipY = crownCenterY + Math.sin(angle) * branchLen;

      buildStem(
        elements,
        baseX,
        crownCenterY,
        tipX,
        tipY,
        0.2 + rng() * 0.2,
        0.25 + branchOpenness * 0.15,
        "#7B6B4A",
        0.4,
        rng
      );
    }
  }

  // Crown canopy — overlapping discs forming foliage mass
  if (openness > 0.4) {
    const crownOpenness = Math.min(1, (openness - 0.4) / 0.6);
    const crownRadius = (6 + 4 * crownOpenness) * crownSpread;
    const discCount = 3 + Math.floor(crownOpenness * 4);
    const crownColor = rng() > 0.5 ? "#7CB97C" : "#A8D8A8";

    buildDiscCluster(
      elements,
      baseX,
      crownCenterY - 2,
      discCount,
      [2.5 * crownSpread, 5 * crownSpread],
      crownRadius,
      crownColor,
      0.35 + crownOpenness * 0.15,
      0.8,
      rng
    );
  }

  // Leaf shapes scattered in the crown area
  if (openness > 0.5) {
    const leafOpenness = Math.min(1, (openness - 0.5) / 0.5);
    const leafCount = 3 + Math.floor(leafOpenness * 3);
    for (let i = 0; i < leafCount; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = (3 + rng() * 6) * crownSpread;
      const lx = baseX + Math.cos(angle) * dist;
      const ly = crownCenterY - 2 + Math.sin(angle) * dist * 0.6; // flattened vertically
      const leafAngle = angle + (rng() - 0.5) * 0.8;
      const leafScale = 0.4 + leafOpenness * 0.5;
      const leafColor = rng() > 0.5 ? "#7CB97C" : "#68A868";

      buildLeaf(elements, lx, ly, leafAngle, leafScale, 2.5, 4.5, leafColor, 1.0 + i * 0.05);
    }
  }

  // Bud/fruit dot details — only in "crown" (fully mature) keyframe
  if (kf === "crown") {
    const dotCount = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < dotCount; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = (2 + rng() * 5) * crownSpread;
      const dx = baseX + Math.cos(angle) * dist;
      const dy = crownCenterY - 2 + Math.sin(angle) * dist * 0.6;
      const dotColor = rng() > 0.5 ? "#E8C870" : "#D0B060";

      elements.push({
        shape: { type: "dot", radius: 0.4 + rng() * 0.4 },
        position: { x: dx, y: dy },
        rotation: 0,
        scale: 1,
        color: dotColor,
        opacity: 0.45 + rng() * 0.2,
        zOffset: 1.5 + rng() * 0.2,
      });
    }
  }

  return elements;
}

export const wcSaplingHope: PlantVariant = {
  id: "wc-sapling-hope",
  name: "Sapling Hope",
  description:
    "A young tree with an expanding crown of soft watercolor foliage, embodying hopeful upward energy",
  rarity: 0.04,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      crownSpread: { signal: "growth", range: [0.6, 1.4], default: 1.0 },
      branchCount: { signal: "entropy", range: [2, 5], default: 3, round: true },
      trunkHeight: { signal: "certainty", range: [20, 32], default: 26 },
    },
  },
  colorVariations: [
    { name: "spring", weight: 1.0, palettes: { full: ["#7CB97C", "#A8D8A8", "#6B5B3A"] } },
    { name: "autumn", weight: 0.6, palettes: { full: ["#D4A04A", "#C8A848", "#7B6B4A"] } },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 500,
    clusterBonus: 1.5,
    maxClusterDensity: 4,
    reseedClusterChance: 0.6,
  },
  watercolorConfig: {
    keyframes: [
      { name: "seed", duration: 8 },
      { name: "sprout", duration: 15 },
      { name: "sapling", duration: 35 },
      { name: "crown", duration: 30 },
    ],
    wcEffect: { layers: 3, opacity: 0.48, spread: 0.07, colorVariation: 0.05 },
    buildElements: buildWcSaplingHopeElements,
  },
};
