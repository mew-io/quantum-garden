/**
 * Watercolor Star Moss
 *
 * Ground cover with star-shaped clusters — each cluster is a central dot
 * with 5-6 tiny petal shapes radiating out like little stars. Multiple
 * clusters scattered across the ground.
 *
 * Category: watercolor (ground-cover)
 * Rarity: 0.03
 * Render mode: watercolor
 * Path B: bell_pair circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr, radialPositions } from "../_helpers";

const MOSS_COLORS = {
  emerald: { center: "#60A868", petal: "#80C880", ground: "#489048" },
  silver: { center: "#A0B0A8", petal: "#B8C8C0", ground: "#889890" },
};

function buildWcStarMossElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const starCount = traitOr(ctx.traits, "starCount", 5);
  const pointSharpness = traitOr(ctx.traits, "pointSharpness", 0.5);
  const clusterSpread = traitOr(ctx.traits, "clusterSpread", 1.0);

  // Lifecycle openness
  let openness: number;
  const kf = ctx.keyframeName;
  if (kf === "appear") {
    openness = ctx.keyframeProgress * 0.5;
  } else if (kf === "spread") {
    openness = 0.5 + ctx.keyframeProgress * 0.4;
  } else if (kf === "settled") {
    openness = 0.9 + ctx.keyframeProgress * 0.1;
  } else {
    openness = 0.5;
  }

  if (openness <= 0) return elements;

  const colors =
    ctx.colorVariationName && MOSS_COLORS[ctx.colorVariationName as keyof typeof MOSS_COLORS]
      ? MOSS_COLORS[ctx.colorVariationName as keyof typeof MOSS_COLORS]!
      : MOSS_COLORS.emerald;

  const cx = 32;
  const cy = 32;

  // Ground disc base beneath clusters
  elements.push({
    shape: { type: "disc", radius: 10 * clusterSpread * openness },
    position: { x: cx, y: cy },
    rotation: 0,
    scale: 1,
    color: colors.ground,
    opacity: 0.2,
    zOffset: 0,
  });

  // Generate star cluster positions scattered across the canvas
  const visibleStars = Math.ceil(starCount * openness);
  const clusterPositions: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < starCount; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * 12 * clusterSpread;
    clusterPositions.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
    });
  }

  // Build each star cluster
  for (let s = 0; s < visibleStars; s++) {
    const pos = clusterPositions[s]!;
    const pointCount = 5 + Math.floor(rng() * 2); // 5-6 points per star

    // Center dot of the star
    elements.push({
      shape: { type: "dot", radius: 0.8 + rng() * 0.4 },
      position: { x: pos.x, y: pos.y },
      rotation: 0,
      scale: openness,
      color: colors.center,
      opacity: 0.5 + rng() * 0.15,
      zOffset: 1.0,
    });

    // Tiny petal shapes radiating out like star points
    const petalLength = 2 + pointSharpness * 2; // 2-3px based on sharpness
    const petalWidth = 1.0 + (1 - pointSharpness) * 0.8; // wider when less sharp
    const starRadius = petalLength * 0.8;
    const petalPositions = radialPositions(
      pos.x,
      pos.y,
      starRadius * openness,
      pointCount,
      rng() * Math.PI * 2
    );

    for (const pp of petalPositions) {
      elements.push({
        shape: { type: "leaf", width: petalWidth, length: petalLength },
        position: { x: pp.x, y: pp.y },
        rotation: pp.angle + Math.PI / 2,
        scale: openness * 0.7,
        color: colors.petal,
        opacity: 0.4 + rng() * 0.1,
        zOffset: 0.8,
      });
    }
  }

  return elements;
}

export const wcStarMoss: PlantVariant = {
  id: "wc-star-moss",
  name: "Watercolor Star Moss",
  description:
    "Ground cover with tiny star-shaped clusters scattered like constellations fallen to earth, painted in soft watercolor",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "bell_pair",
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 400,
    clusterBonus: 1.5,
    maxClusterDensity: 5,
    reseedClusterChance: 0.5,
  },
  quantumMapping: {
    schema: {
      starCount: { signal: "spread", range: [3, 7], default: 5, round: true },
      pointSharpness: { signal: "certainty", range: [0.3, 0.7], default: 0.5 },
      clusterSpread: { signal: "entropy", range: [0.6, 1.4], default: 1.0 },
    },
  },
  colorVariations: [
    { name: "emerald", weight: 1.0, palettes: { full: ["#60A868", "#80C880", "#489048"] } },
    { name: "silver", weight: 0.6, palettes: { full: ["#A0B0A8", "#B8C8C0", "#889890"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "appear", duration: 10 },
      { name: "spread", duration: 25 },
      { name: "settled", duration: 40 },
    ],
    wcEffect: { layers: 3, opacity: 0.45, spread: 0.05, colorVariation: 0.03 },
    buildElements: buildWcStarMossElements,
  },
};
