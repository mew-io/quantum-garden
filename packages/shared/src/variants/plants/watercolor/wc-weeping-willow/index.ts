/**
 * Watercolor Weeping Willow
 *
 * A weeping willow tree rendered in watercolor style with a thick trunk,
 * arching branches from the crown, and long drooping fronds creating a
 * curtain effect. Frond count, droop angle, bilateral symmetry, and trunk
 * thickness are all driven by a custom 4-qubit entanglement circuit.
 *
 * Category: watercolor (trees)
 * Rarity: 0.03
 * Render mode: watercolor
 * Path A: custom Python circuit (wc_weeping_willow) — no quantumMapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr } from "../_helpers";

/**
 * Color sets for the weeping willow, keyed by color variation name.
 */
const WILLOW_COLORS: Record<string, { foliage: string; branch: string; trunk: string }> = {
  willow: { foliage: "#8AB87C", branch: "#B0D8A0", trunk: "#6B5B3A" },
  autumn: { foliage: "#C8B868", branch: "#D8D080", trunk: "#7B6B4A" },
};

const WILLOW_DEFAULT_COLORS = WILLOW_COLORS["willow"]!;

/**
 * Get willow-specific openness for lifecycle keyframes.
 * seed -> trunk -> canopy -> droop
 */
function getWillowOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "seed":
      return 0.02 + progress * 0.03; // 0.02 -> 0.05 (small sprout)
    case "trunk":
      return 0.05 + progress * 0.3; // 0.05 -> 0.35 (trunk grows)
    case "canopy":
      return 0.35 + progress * 0.35; // 0.35 -> 0.70 (branches extend)
    case "droop":
      return 0.7 + progress * 0.3; // 0.70 -> 1.00 (fronds hang fully)
    default:
      return 0.5;
  }
}

/**
 * Builder function for the Watercolor Weeping Willow variant.
 *
 * Creates a willow with a thick trunk, arching branches, and drooping fronds.
 * The frond count, droop angle, symmetry, and trunk thickness are read
 * directly from ctx.traits (Path A: set by the wc_weeping_willow Python circuit).
 *
 * Visual design:
 * - Thick trunk stem from bottom center upward
 * - 4-6 main branch stems arching outward from the trunk top
 * - Long thin frond stems drooping from branch tips, curving downward
 * - Small leaf shapes at frond attachment points
 * - Foliage disc at the crown center for fullness
 */
function buildWcWeepingWillowElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  // Path A: read properties from Python circuit's extra dict (via plant.traits).
  // Fallback values for unobserved plants (ctx.traits is null).
  const frondCount = traitOr(ctx.traits, "frondCount", 6);
  const droopAngle = traitOr(ctx.traits, "droopAngle", 0.55);
  const symmetryBias = traitOr(ctx.traits, "symmetryBias", 0.5);
  const trunkThickness = traitOr(ctx.traits, "trunkThickness", 0.8);

  // Color selection
  const colorSet =
    (ctx.colorVariationName ? WILLOW_COLORS[ctx.colorVariationName] : null) ??
    (ctx.traits?.colorPalette
      ? {
          foliage: ctx.traits.colorPalette[0] ?? WILLOW_DEFAULT_COLORS.foliage,
          branch: ctx.traits.colorPalette[1] ?? WILLOW_DEFAULT_COLORS.branch,
          trunk: ctx.traits.colorPalette[2] ?? WILLOW_DEFAULT_COLORS.trunk,
        }
      : WILLOW_DEFAULT_COLORS);

  // Lifecycle-driven openness
  const openness = getWillowOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const cx = 32;
  const trunkTop = 22;
  const trunkBottom = 56;

  // === TRUNK ===
  // Thick trunk stem with slight seed-based curve
  if (openness > 0.03) {
    const trunkHeight = (trunkBottom - trunkTop) * Math.min(1, openness / 0.35);
    const trunkTopY = trunkBottom - trunkHeight;
    const curveDir = rng() > 0.5 ? 1 : -1;
    const curveAmount = (1 - trunkThickness) * 3 * curveDir;

    elements.push({
      shape: {
        type: "stem",
        points: [
          [cx, trunkBottom],
          [cx + curveAmount * 0.3, trunkBottom - trunkHeight * 0.33],
          [cx + curveAmount * 0.5, trunkBottom - trunkHeight * 0.66],
          [cx + curveAmount * 0.2, trunkTopY],
        ],
        thickness: 0.6 + trunkThickness * 0.8,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: colorSet.trunk,
      opacity: 0.65,
      zOffset: 0,
    });
  }

  // === BRANCHES AND FRONDS ===
  if (openness > 0.35) {
    const branchOpenness = Math.min(1, (openness - 0.35) / 0.35);
    const frondOpenness = Math.max(0, (openness - 0.7) / 0.3);

    // Number of main branches: 4-6 based on frondCount
    const branchCount = Math.min(6, Math.max(4, Math.floor(frondCount * 0.7)));

    for (let i = 0; i < branchCount; i++) {
      // Distribute branches around the crown
      // symmetryBias controls how evenly distributed vs random they are
      const baseAngle = (i / branchCount) * Math.PI * 2 - Math.PI / 2;
      const angleJitter = (1 - symmetryBias) * (rng() - 0.5) * 0.6;
      const branchAngle = baseAngle + angleJitter;

      // Branch extends outward and slightly upward from trunk top
      const branchLen = (6 + rng() * 4) * branchOpenness;
      const bx = cx + Math.cos(branchAngle) * branchLen;
      const by = trunkTop + Math.sin(branchAngle) * branchLen * 0.5 - 2;

      // Main branch stem
      elements.push({
        shape: {
          type: "stem",
          points: [
            [cx, trunkTop],
            [cx + (bx - cx) * 0.3, trunkTop - 1 + (by - trunkTop) * 0.2],
            [cx + (bx - cx) * 0.6, trunkTop + (by - trunkTop) * 0.6],
            [bx, by],
          ],
          thickness: 0.35 + trunkThickness * 0.25,
        },
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        color: colorSet.trunk,
        opacity: 0.55,
        zOffset: 0.3 + i * 0.05,
      });

      // Small leaf at branch attachment point
      elements.push({
        shape: {
          type: "leaf",
          width: 2.5,
          length: 4,
        },
        position: { x: bx, y: by },
        rotation: branchAngle + (rng() - 0.5) * 0.3,
        scale: 0.5 * branchOpenness,
        color: colorSet.foliage,
        zOffset: 0.6 + i * 0.05,
      });

      // === FRONDS DROOPING FROM BRANCH TIPS ===
      if (frondOpenness > 0) {
        // Each branch gets 2-4 fronds based on frondCount
        const frondsPerBranch = Math.max(2, Math.floor(frondCount / branchCount) + 1);

        for (let f = 0; f < frondsPerBranch; f++) {
          const frondAngleOffset = (rng() - 0.5) * 0.8;
          const frondStartX = bx + (rng() - 0.5) * 2;
          const frondStartY = by + rng() * 1;

          // Frond droops downward with gravity effect controlled by droopAngle
          const frondLen = (8 + rng() * 6) * frondOpenness;
          const droopX = frondStartX + Math.cos(branchAngle + frondAngleOffset) * frondLen * 0.3;
          const droopY = frondStartY + frondLen * droopAngle * 1.2;

          // Gentle curve as the frond hangs
          const midX = (frondStartX + droopX) / 2 + (rng() - 0.5) * 2;
          const midY = (frondStartY + droopY) / 2 + frondLen * droopAngle * 0.4;

          elements.push({
            shape: {
              type: "stem",
              points: [
                [frondStartX, frondStartY],
                [
                  frondStartX + (midX - frondStartX) * 0.4,
                  frondStartY + (midY - frondStartY) * 0.3,
                ],
                [midX, midY],
                [droopX, droopY],
              ],
              thickness: 0.15 + rng() * 0.1,
            },
            position: { x: 0, y: 0 },
            rotation: 0,
            scale: 1,
            color: colorSet.foliage,
            opacity: 0.35 + frondOpenness * 0.2,
            zOffset: 1.0 + i * 0.1 + f * 0.02,
          });
        }
      }
    }

    // === FOLIAGE DISC AT CROWN CENTER ===
    // Adds fullness to the canopy
    if (branchOpenness > 0.3) {
      const crownRadius = 3 + branchOpenness * 3;
      elements.push({
        shape: { type: "disc", radius: crownRadius },
        position: { x: cx, y: trunkTop - 1 },
        rotation: 0,
        scale: 1,
        color: colorSet.branch,
        opacity: 0.25 * branchOpenness,
        zOffset: 0.5,
      });
    }
  }

  return elements;
}

export const wcWeepingWillow: PlantVariant = {
  id: "wc-weeping-willow",
  name: "Watercolor Weeping Willow",
  description:
    "A weeping willow tree painted in watercolor with drooping fronds and arching branches, its bilateral symmetry and frond count shaped by a 4-qubit entanglement circuit",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  // Path A: custom Python circuit encodes all visual properties directly.
  // The wc_weeping_willow circuit maps qubit measurements to
  // frondCount, droopAngle, symmetryBias, and trunkThickness in its extra dict.
  circuitId: "wc_weeping_willow",
  sandboxControls: [
    { key: "frondCount", label: "Frond Count", min: 4, max: 8, step: 1, default: 6 },
    { key: "droopAngle", label: "Droop Angle", min: 0.3, max: 0.8, step: 0.05, default: 0.55 },
    {
      key: "symmetryBias",
      label: "Symmetry Bias",
      min: 0.0,
      max: 1.0,
      step: 0.05,
      default: 0.5,
    },
    {
      key: "trunkThickness",
      label: "Trunk Thickness",
      min: 0.6,
      max: 1.0,
      step: 0.05,
      default: 0.8,
    },
  ],
  colorVariations: [
    {
      name: "willow",
      weight: 1.0,
      palettes: { bloom: ["#8AB87C", "#B0D8A0", "#6B5B3A"] },
    },
    {
      name: "autumn",
      weight: 0.6,
      palettes: { bloom: ["#C8B868", "#D8D080", "#7B6B4A"] },
    },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 600,
    clusterBonus: 1.5,
    maxClusterDensity: 3,
    reseedClusterChance: 0.5,
  },
  watercolorConfig: {
    keyframes: [
      { name: "seed", duration: 5 },
      { name: "trunk", duration: 15 },
      { name: "canopy", duration: 35 },
      { name: "droop", duration: 25 },
    ],
    wcEffect: {
      layers: 3,
      opacity: 0.45,
      spread: 0.07,
      colorVariation: 0.05,
    },
    buildElements: buildWcWeepingWillowElements,
  },
};
