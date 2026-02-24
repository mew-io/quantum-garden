/**
 * Watercolor Berry Thicket
 *
 * Dense crossing stem shapes (branches) with berry dot clusters at branch
 * ends. Thorny thicket silhouette in earth-toned watercolor washes.
 *
 * Category: watercolor (shrubs adaptation)
 * Rarity: 0.06
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { buildLeaf, buildStem, createRng, traitOr } from "../_helpers";

function buildWcBerryThicketElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const branchCount = traitOr(ctx.traits, "branchCount", 5);
  const berryDensity = traitOr(ctx.traits, "berryDensity", 4);
  const thicketWidth = traitOr(ctx.traits, "thicketWidth", 1.0);

  // Lifecycle openness
  let openness: number;
  const kf = ctx.keyframeName;
  if (kf === "dormant") {
    openness = 0;
  } else if (kf === "growing") {
    openness = ctx.keyframeProgress * 0.7;
  } else if (kf === "thicket") {
    openness = 0.7 + ctx.keyframeProgress * 0.3;
  } else if (kf === "berried") {
    openness = 1.0;
  } else {
    openness = 0.5;
  }

  if (openness <= 0) return elements;

  const baseX = 32;
  const baseY = 54;

  // Branch angles spread outward from the base in a fan shape.
  // Each branch has a slightly randomised angle and length.
  const branchAngles: number[] = [];
  const angleSpread = Math.PI * 0.7; // ~126 degrees total spread
  for (let i = 0; i < branchCount; i++) {
    const t = branchCount > 1 ? i / (branchCount - 1) : 0.5;
    const baseAngle = -Math.PI / 2 - angleSpread / 2 + t * angleSpread;
    branchAngles.push(baseAngle + (rng() - 0.5) * 0.25);
  }

  // Branch tip positions (stored for berry placement)
  const tipPositions: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < branchCount; i++) {
    const angle = branchAngles[i]!;
    const branchLen = (16 + rng() * 8) * openness * thicketWidth;
    const tipX = baseX + Math.cos(angle) * branchLen;
    const tipY = baseY + Math.sin(angle) * branchLen;
    tipPositions.push({ x: tipX, y: tipY });

    // Main branch stem
    const curvature = 0.3 + rng() * 0.4;
    const branchColor = rng() > 0.5 ? "#8B7355" : "#7A6645";
    buildStem(
      elements,
      baseX,
      baseY,
      tipX,
      tipY,
      curvature,
      0.4 + openness * 0.3,
      branchColor,
      0.45 + rng() * 0.1,
      rng
    );

    // Secondary twig from midpoint
    if (openness > 0.4 && rng() > 0.35) {
      const midX = (baseX + tipX) / 2 + (rng() - 0.5) * 3;
      const midY = (baseY + tipY) / 2 + (rng() - 0.5) * 3;
      const twigAngle = angle + (rng() > 0.5 ? 0.4 : -0.4);
      const twigLen = branchLen * 0.4 * openness;
      const twigTipX = midX + Math.cos(twigAngle) * twigLen;
      const twigTipY = midY + Math.sin(twigAngle) * twigLen;
      tipPositions.push({ x: twigTipX, y: twigTipY });

      buildStem(elements, midX, midY, twigTipX, twigTipY, 0.2, 0.25, "#7A6645", 0.35, rng);
    }

    // Small leaves along branch
    if (openness > 0.3) {
      const leafCount = 1 + Math.floor(rng() * 2);
      for (let l = 0; l < leafCount; l++) {
        const lt = 0.3 + rng() * 0.5; // position along branch
        const lx = baseX + (tipX - baseX) * lt + (rng() - 0.5) * 2;
        const ly = baseY + (tipY - baseY) * lt + (rng() - 0.5) * 2;
        const leafAngle = angle + (rng() > 0.5 ? Math.PI / 3 : -Math.PI / 3);
        const leafScale = 0.4 + openness * 0.4;
        buildLeaf(elements, lx, ly, leafAngle, leafScale, 2.0, 3.5, "#6B8E5A", 0.8 + i * 0.05);
      }
    }
  }

  // Berry dots — only visible in "berried" keyframe
  if (kf === "berried") {
    for (const tip of tipPositions) {
      const berriesHere = Math.max(1, Math.floor(berryDensity * (0.5 + rng() * 0.5)));
      for (let b = 0; b < berriesHere; b++) {
        const bx = tip.x + (rng() - 0.5) * 4;
        const by = tip.y + (rng() - 0.5) * 4;
        const berryRadius = 0.5 + rng() * 0.6;
        const berryColor = rng() > 0.4 ? "#C8553D" : "#A0422E";
        elements.push({
          shape: { type: "dot", radius: berryRadius },
          position: { x: bx, y: by },
          rotation: 0,
          scale: 1,
          color: berryColor,
          opacity: 0.5 + rng() * 0.25,
          zOffset: 1.5 + rng() * 0.2,
        });
      }
    }
  }

  return elements;
}

export const wcBerryThicket: PlantVariant = {
  id: "wc-berry-thicket",
  name: "Watercolor Berry Thicket",
  description:
    "A dense thicket of crossing branches painted in earthy watercolor washes, bearing clusters of berries at its tips",
  rarity: 0.06,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      branchCount: { signal: "entropy", range: [3, 7], default: 5, round: true },
      berryDensity: { signal: "spread", range: [2, 8], default: 4, round: true },
      thicketWidth: { signal: "growth", range: [0.7, 1.3], default: 1.0 },
    },
  },
  colorVariations: [
    { name: "bramble", weight: 1.0, palettes: { full: ["#8B7355", "#6B8E5A", "#C8553D"] } },
    { name: "autumn", weight: 0.6, palettes: { full: ["#A0724B", "#C87830", "#8B4513"] } },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 400,
    clusterBonus: 2.0,
    maxClusterDensity: 5,
    reseedClusterChance: 0.6,
  },
  watercolorConfig: {
    keyframes: [
      { name: "dormant", duration: 5 },
      { name: "growing", duration: 15 },
      { name: "thicket", duration: 35 },
      { name: "berried", duration: 30 },
    ],
    wcEffect: { layers: 3, opacity: 0.45, spread: 0.06, colorVariation: 0.04 },
    buildElements: buildWcBerryThicketElements,
  },
};
