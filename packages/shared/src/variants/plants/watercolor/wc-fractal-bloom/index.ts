/**
 * Watercolor Fractal Bloom
 *
 * A recursive branching plant: a main trunk splits into 2-3 sub-branches,
 * each of which may split again up to `recursionDepth` levels. Terminal
 * branches end with small petal clusters, forming a fractal tree silhouette
 * rendered in soft watercolor washes.
 *
 * Category: watercolor (fractal / botanical)
 * Rarity: 0.03 (base 1.0 x 0.03)
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr, buildStem } from "../_helpers";

// ── Color palettes ────────────────────────────────────────────────────────────

interface FractalColors {
  branch: string;
  petal: string;
  leaf: string;
}

const FRACTAL_COLORS: Record<string, FractalColors> = {
  coral: { branch: "#7CAA7C", petal: "#E8A088", leaf: "#7CAA7C" },
  violet: { branch: "#7CAA7C", petal: "#B898D0", leaf: "#7CAA7C" },
};

const DEFAULT_COLORS: FractalColors = FRACTAL_COLORS.coral!;

// ── Openness curve (custom 4-phase) ──────────────────────────────────────────

function fractalOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "seed":
      return 0.05;
    case "trunk":
      return 0.05 + progress * 0.25; // 0.05 -> 0.30
    case "branch":
      return 0.3 + progress * 0.5; // 0.30 -> 0.80
    case "bloom":
      return 0.8 + progress * 0.2; // 0.80 -> 1.00
    default:
      return 0.5;
  }
}

// ── Recursive branch builder ─────────────────────────────────────────────────

/**
 * Recursively build fractal branches. At each level the branch is shorter and
 * thinner than its parent. Terminal branches receive small petal clusters.
 */
function buildFractalBranch(
  elements: WatercolorElement[],
  startX: number,
  startY: number,
  angle: number,
  length: number,
  thickness: number,
  depth: number,
  maxDepth: number,
  branchAngle: number,
  scaleFactor: number,
  colors: FractalColors,
  openness: number,
  rng: () => number
): void {
  // Branch segment grows in length based on openness at this depth
  const depthThreshold = 0.05 + depth * 0.15;
  const segmentGrowth = Math.min(1, Math.max(0, (openness - depthThreshold) / 0.25));

  // End point of this branch segment — grows outward
  const endX = startX + Math.cos(angle) * length * segmentGrowth;
  const endY = startY + Math.sin(angle) * length * segmentGrowth;

  if (segmentGrowth <= 0) {
    // Consume RNG to keep deterministic
    rng();
    return;
  }

  // Stem element for the branch
  buildStem(
    elements,
    startX,
    startY,
    endX,
    endY,
    (0.08 + rng() * 0.06) * segmentGrowth, // subtle curvature
    thickness,
    colors.branch,
    (0.5 + openness * 0.15) * Math.min(1, segmentGrowth * 2),
    rng
  );

  if (depth >= maxDepth) {
    // Terminal branch: add petal cluster and dot accent
    // Flowers appear once the branch segment is mostly grown
    const petalOpenness = Math.max(0, (segmentGrowth - 0.6) / 0.4);
    if (petalOpenness > 0) {
      const petalCount = 3 + Math.floor(rng() * 3); // 3-5 petals
      const step = (Math.PI * 2) / petalCount;
      for (let i = 0; i < petalCount; i++) {
        const pa = step * i + rng() * 0.3;
        const pw = (1.8 + rng() * 1.2) * petalOpenness;
        const pl = (4.0 + rng() * 2.5) * petalOpenness;
        elements.push({
          shape: { type: "petal", width: pw, length: pl, roundness: 0.7 },
          position: { x: endX, y: endY },
          rotation: pa,
          scale: 1.0,
          color: colors.petal,
          zOffset: 1.5 + depth * 0.1,
        });
      }

      // Dot accent at terminal node
      elements.push({
        shape: { type: "dot", radius: 0.3 + rng() * 0.4 },
        position: { x: endX, y: endY },
        rotation: 0,
        scale: 1,
        color: colors.petal,
        opacity: 0.4 + rng() * 0.3,
        zOffset: 2.0 + depth * 0.1,
      });
    }
    return;
  }

  // Determine child branch visibility based on openness
  const branchThreshold = 0.3 + depth * 0.15;
  if (openness < branchThreshold) return;

  // 2-3 child branches
  const childCount = 2 + (rng() > 0.5 ? 1 : 0);
  const childLength = length * scaleFactor;
  const childThickness = thickness * 0.65;

  if (childCount === 2) {
    // Two branches: symmetric spread
    const spread = branchAngle * (0.8 + rng() * 0.4);
    buildFractalBranch(
      elements,
      endX,
      endY,
      angle - spread,
      childLength,
      childThickness,
      depth + 1,
      maxDepth,
      branchAngle,
      scaleFactor,
      colors,
      openness,
      rng
    );
    buildFractalBranch(
      elements,
      endX,
      endY,
      angle + spread,
      childLength,
      childThickness,
      depth + 1,
      maxDepth,
      branchAngle,
      scaleFactor,
      colors,
      openness,
      rng
    );
  } else {
    // Three branches: center plus two angled
    const spread = branchAngle * (0.7 + rng() * 0.3);
    buildFractalBranch(
      elements,
      endX,
      endY,
      angle - spread,
      childLength,
      childThickness,
      depth + 1,
      maxDepth,
      branchAngle,
      scaleFactor,
      colors,
      openness,
      rng
    );
    buildFractalBranch(
      elements,
      endX,
      endY,
      angle,
      childLength * 0.9,
      childThickness * 0.9,
      depth + 1,
      maxDepth,
      branchAngle,
      scaleFactor,
      colors,
      openness,
      rng
    );
    buildFractalBranch(
      elements,
      endX,
      endY,
      angle + spread,
      childLength,
      childThickness,
      depth + 1,
      maxDepth,
      branchAngle,
      scaleFactor,
      colors,
      openness,
      rng
    );
  }
}

// ── Main builder ─────────────────────────────────────────────────────────────

function buildWcFractalBloomElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const recursionDepth = traitOr(ctx.traits, "recursionDepth", 3);
  const branchAngle = traitOr(ctx.traits, "branchAngle", 0.5);
  const scaleFactor = traitOr(ctx.traits, "scaleFactor", 0.6);

  const openness = fractalOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const colors =
    ctx.colorVariationName && FRACTAL_COLORS[ctx.colorVariationName]
      ? FRACTAL_COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  // Base of the trunk
  const baseX = 32;
  const baseY = 56;
  const trunkAngle = -Math.PI / 2; // straight up
  const trunkLength = 16 + openness * 4; // grows slightly with lifecycle
  const trunkThickness = 0.8 + openness * 0.3;

  // Build the fractal tree starting from the base
  buildFractalBranch(
    elements,
    baseX,
    baseY,
    trunkAngle,
    trunkLength,
    trunkThickness,
    0,
    recursionDepth,
    branchAngle,
    scaleFactor,
    colors,
    openness,
    rng
  );

  return elements;
}

// ── Variant export ───────────────────────────────────────────────────────────

export const wcFractalBloom: PlantVariant = {
  id: "wc-fractal-bloom",
  name: "Fractal Bloom",
  description:
    "A recursively branching tree whose terminal buds burst into tiny petal clusters, its fractal depth shaped by quantum entropy",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      recursionDepth: { signal: "entropy", range: [2, 4], default: 3, round: true },
      branchAngle: { signal: "spread", range: [0.3, 0.8], default: 0.5 },
      scaleFactor: { signal: "growth", range: [0.5, 0.75], default: 0.6 },
    },
  },
  colorVariations: [
    { name: "coral", weight: 1.0, palettes: { bloom: ["#E8A088", "#D08070", "#7CAA7C"] } },
    { name: "violet", weight: 0.7, palettes: { bloom: ["#B898D0", "#9878B0", "#7CAA7C"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "seed", duration: 5 },
      { name: "trunk", duration: 15 },
      { name: "branch", duration: 30 },
      { name: "bloom", duration: 30 },
    ],
    wcEffect: { layers: 3, opacity: 0.48, spread: 0.06, colorVariation: 0.04 },
    buildElements: buildWcFractalBloomElements,
  },
};
