/**
 * Watercolor Crystal Cluster
 *
 * Angular tall petals (low roundness ~0.2) radiating upward from a base,
 * like crystal shards growing from the ground. Highlight dots scattered
 * on crystal surfaces give a shimmering, mineralic quality.
 *
 * Category: watercolor (mineral/crystal)
 * Rarity: 0.03
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr } from "../_helpers";

const CRYSTAL_COLORS: Record<string, { crystal: string[]; base: string; highlight: string }> = {
  amethyst: {
    crystal: ["#9B8EC8", "#B8A8E0", "#6858A0"],
    base: "#4A3870",
    highlight: "#E0D8F0",
  },
  ice: {
    crystal: ["#A8D0E8", "#C8E0F0", "#7090B0"],
    base: "#405868",
    highlight: "#E8F0F8",
  },
  "rose-quartz": {
    crystal: ["#D8A8C0", "#E8C0D8", "#A87898"],
    base: "#684050",
    highlight: "#F0E0E8",
  },
};

const DEFAULT_COLORS = CRYSTAL_COLORS.amethyst!;

/**
 * Crystal cluster lifecycle openness curve.
 * dormant (0) -> emerging (0->0.6) -> crystal (0.6->1.0) -> shimmer (1.0, sparkle)
 */
function crystalOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "dormant":
      return 0;
    case "emerging":
      return progress * 0.6;
    case "crystal":
      return 0.6 + progress * 0.4;
    case "shimmer":
      return 1.0;
    default:
      return 0.5;
  }
}

function buildWcCrystalClusterElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const crystalCount: number = traitOr(ctx.traits, "crystalCount", 5);
  const facetSharpness: number = traitOr(ctx.traits, "facetSharpness", 0.2);
  const clusterSpread: number = traitOr(ctx.traits, "clusterSpread", 1.0);

  const openness = crystalOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const colors =
    ctx.colorVariationName && CRYSTAL_COLORS[ctx.colorVariationName]
      ? CRYSTAL_COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  if (openness <= 0) return elements;

  const cx = 32;
  const baseY = 52;

  // === BASE DISC ===
  // Dark disc at ground level representing the crystal formation base
  const baseRadius = (3.0 + clusterSpread * 2.0) * Math.min(openness * 2, 1);
  elements.push({
    shape: { type: "disc", radius: baseRadius },
    position: { x: cx, y: baseY },
    rotation: 0,
    scale: 1,
    color: colors.base,
    opacity: 0.55,
    zOffset: 0,
  });

  // === CRYSTAL SHARDS ===
  // Tall narrow petal shapes radiating upward from the base at slight angles
  const angleStep = (Math.PI * 0.6) / Math.max(crystalCount - 1, 1);
  const startAngle = -Math.PI * 0.3; // fan from roughly -55 to +55 degrees around vertical

  for (let i = 0; i < crystalCount; i++) {
    // Each crystal has a slightly different angle, height, and width
    const baseAngle = crystalCount === 1 ? 0 : startAngle + angleStep * i;
    const angle = baseAngle + (rng() - 0.5) * 0.15; // slight random jitter

    // Crystal dimensions: tall and narrow
    const heightBase = 14 + rng() * 10; // 14-24 units tall
    const height = heightBase * openness * clusterSpread;
    const width = (2.0 + rng() * 1.5) * (0.6 + openness * 0.4);

    // Crystal color: cycle through the palette
    const colorIndex = i % colors.crystal.length;
    const crystalColor = colors.crystal[colorIndex]!;

    // Position the crystal slightly spread from center
    const spreadX = Math.sin(angle) * clusterSpread * 3;
    const crystalX = cx + spreadX;

    // The crystal "petal" points upward (rotation is relative to up)
    // Use negative angle to point upward with slight tilt
    const rotation = -Math.PI / 2 + angle * 0.5;

    elements.push({
      shape: {
        type: "petal",
        width,
        length: height,
        roundness: facetSharpness, // low roundness = angular/sharp
      },
      position: { x: crystalX, y: baseY - 1 },
      rotation,
      scale: 1.0,
      color: crystalColor,
      zOffset: 1.0 + i * 0.1,
    });

    // === HIGHLIGHT DOTS on crystal surface ===
    // Small bright dots along the crystal body for facet reflections
    if (openness > 0.4) {
      const dotCount = 2 + Math.floor(rng() * 3);
      for (let j = 0; j < dotCount; j++) {
        // Place dots along the crystal's length
        const t = 0.2 + rng() * 0.7; // position along crystal (0.2-0.9)
        const dotDist = height * t;
        const dotX =
          crystalX + Math.sin(rotation + Math.PI / 2) * dotDist * 0.3 + (rng() - 0.5) * width * 0.6;
        const dotY = baseY - 1 - Math.cos(angle * 0.5) * dotDist;

        elements.push({
          shape: { type: "dot", radius: 0.2 + rng() * 0.25 },
          position: { x: dotX, y: dotY },
          rotation: 0,
          scale: 1,
          color: colors.highlight,
          opacity: 0.5 + rng() * 0.35,
          zOffset: 2.0,
        });
      }
    }
  }

  // === SHIMMER SPARKLE DOTS ===
  // Extra sparkle dots that appear only in the shimmer keyframe
  if (ctx.keyframeName === "shimmer") {
    const sparkleCount = 4 + Math.floor(rng() * 5);
    const shimmerIntensity = 0.5 + ctx.keyframeProgress * 0.5;

    for (let i = 0; i < sparkleCount; i++) {
      // Scatter sparkles around the crystal cluster
      const sparkleX = cx + (rng() - 0.5) * clusterSpread * 14;
      const sparkleY = baseY - 4 - rng() * 28 * clusterSpread;

      elements.push({
        shape: { type: "dot", radius: 0.15 + rng() * 0.2 },
        position: { x: sparkleX, y: sparkleY },
        rotation: 0,
        scale: 1,
        color: colors.highlight,
        opacity: (0.4 + rng() * 0.5) * shimmerIntensity,
        zOffset: 2.5,
      });
    }
  }

  return elements;
}

export const wcCrystalCluster: PlantVariant = {
  id: "wc-crystal-cluster",
  name: "Watercolor Crystal Cluster",
  description:
    "Angular crystal shards radiating upward from a dark base, their facets catching light through quantum shimmer",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      crystalCount: { signal: "entropy", range: [3, 7], default: 5, round: true },
      facetSharpness: { signal: "certainty", range: [0.1, 0.3], default: 0.2 },
      clusterSpread: { signal: "spread", range: [0.6, 1.4], default: 1.0 },
    },
  },
  colorVariations: [
    {
      name: "amethyst",
      weight: 1.0,
      palettes: { crystal: ["#9B8EC8", "#B8A8E0", "#6858A0"] },
    },
    {
      name: "ice",
      weight: 0.7,
      palettes: { crystal: ["#A8D0E8", "#C8E0F0", "#7090B0"] },
    },
    {
      name: "rose-quartz",
      weight: 0.5,
      palettes: { crystal: ["#D8A8C0", "#E8C0D8", "#A87898"] },
    },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "dormant", duration: 5 },
      { name: "emerging", duration: 12 },
      { name: "crystal", duration: 40 },
      { name: "shimmer", duration: 8 },
    ],
    wcEffect: { layers: 3, opacity: 0.52, spread: 0.04, colorVariation: 0.03 },
    buildElements: buildWcCrystalClusterElements,
  },
};
