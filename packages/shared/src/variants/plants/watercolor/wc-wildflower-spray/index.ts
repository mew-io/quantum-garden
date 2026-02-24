/**
 * Wildflower Spray
 *
 * An asymmetric spray of 3-5 small delicate blooms on forking twigs,
 * like cherry blossoms or apple blossoms. The stem forks into 2-3
 * branches, each ending in 1-2 small flowers. Airy and naturalistic
 * with visible space between blooms.
 *
 * Category: watercolor (flowers)
 * Rarity: 0.09
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, standardOpenness, traitOr, buildStem, buildLeaf } from "../_helpers";

const WILDFLOWER_COLORS: Record<
  string,
  { petal: string; center: string; stem: string; leaf: string }
> = {
  blossom: { petal: "#F5D0D8", center: "#D89098", stem: "#8A9E78", leaf: "#94A884" },
  apricot: { petal: "#F0D8B8", center: "#D8B080", stem: "#8A9E78", leaf: "#94A884" },
  periwinkle: { petal: "#C8C0E8", center: "#9888C0", stem: "#8A9E78", leaf: "#94A884" },
  snowdrift: { petal: "#F0ECE8", center: "#D0C8B8", stem: "#8A9E78", leaf: "#94A884" },
};

const DEFAULT_COLORS = WILDFLOWER_COLORS.blossom!;

/**
 * Bloom positions for multi-bloom layouts on forking branches.
 * Each entry is [cx, cy] for the bloom center.
 */
const BLOOM_POSITIONS: Record<number, Array<[number, number]>> = {
  3: [
    [20, 18],
    [34, 14],
    [46, 20],
  ],
  4: [
    [18, 20],
    [30, 14],
    [42, 18],
    [50, 24],
  ],
  5: [
    [16, 20],
    [26, 14],
    [36, 12],
    [44, 16],
    [52, 22],
  ],
};

/**
 * Render a single small bloom (4-6 petals, center disc, stamen dots).
 */
function renderSmallBloom(
  elements: WatercolorElement[],
  cx: number,
  cy: number,
  petalCount: number,
  petalOpenness: number,
  colorSet: { petal: string; center: string; stem: string; leaf: string },
  rng: () => number
): void {
  if (petalOpenness <= 0) return;

  const step = (Math.PI * 2) / petalCount;
  for (let i = 0; i < petalCount; i++) {
    const angle = step * i + rng() * 0.2;
    const pw = (2.0 + rng() * 1.0) * petalOpenness;
    const pl = (5.0 + rng() * 2.5) * petalOpenness;

    elements.push({
      shape: { type: "petal", width: pw, length: pl, roundness: 0.7 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petal,
      zOffset: 1.0,
    });
  }

  // Center disc
  if (petalOpenness > 0.2) {
    const discRadius = 0.8 + petalOpenness * 0.8;
    elements.push({
      shape: { type: "disc", radius: discRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.center,
      opacity: 0.7,
      zOffset: 2.0,
    });

    // Stamen dots
    const dotCount = Math.floor(2 + petalOpenness * 2);
    for (let i = 0; i < dotCount; i++) {
      const a = rng() * Math.PI * 2;
      const d = rng() * discRadius * 0.7;
      elements.push({
        shape: { type: "dot", radius: 0.2 + rng() * 0.2 },
        position: { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d },
        rotation: 0,
        scale: 1,
        color: colorSet.center,
        opacity: 0.35 + rng() * 0.35,
        zOffset: 2.1,
      });
    }
  }
}

function buildWcWildflowerSprayElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const bloomCount = traitOr(ctx.traits, "bloomCount", 4);
  const petalCount = traitOr(ctx.traits, "petalCount", 5);
  const branchSpread = traitOr(ctx.traits, "branchSpread", 0.8);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const colors =
    ctx.colorVariationName && WILDFLOWER_COLORS[ctx.colorVariationName]
      ? WILDFLOWER_COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const petalOpenness = Math.max(0, (openness - 0.05) / 0.95);
  const leafOpenness = Math.max(0, (openness - 0.1) / 0.9);

  // Clamp bloom count and get positions
  const clampedCount = Math.max(3, Math.min(5, Math.round(bloomCount)));
  const positions = BLOOM_POSITIONS[clampedCount] ?? BLOOM_POSITIONS[4]!;

  // Fork point where the main stem splits into branches
  const forkX = 32;
  const forkY = 30;
  const stemBottom = 54;

  // === MAIN STEM (bottom to fork point) ===
  buildStem(
    elements,
    forkX,
    stemBottom,
    forkX,
    forkY,
    0.1,
    0.5 + openness * 0.25,
    colors.stem,
    0.55,
    rng
  );

  // === BRANCH STEMS (fork to each bloom) ===
  for (let i = 0; i < clampedCount; i++) {
    const [bCx, bCy] = positions[i]!;

    // Spread positions outward based on branchSpread trait
    const spreadCx = forkX + (bCx - forkX) * branchSpread;
    const spreadCy = forkY + (bCy - forkY) * branchSpread;

    // Mid-control for a natural arc
    const midX = (forkX + spreadCx) / 2 + (rng() - 0.5) * 3;
    const midY = (forkY + spreadCy) / 2 - 2 - rng() * 2;

    elements.push({
      shape: {
        type: "stem",
        points: [
          [forkX, forkY],
          [midX, midY],
          [spreadCx + (rng() - 0.5) * 1.5, spreadCy + 2],
          [spreadCx, spreadCy],
        ],
        thickness: 0.35 + openness * 0.15,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: colors.stem,
      opacity: 0.5,
      zOffset: 0.2,
    });

    // === BLOOM at branch tip ===
    // Vary petal count slightly per bloom
    const headPetalCount = i === 0 ? petalCount : Math.max(4, petalCount - Math.floor(rng() * 2));
    renderSmallBloom(elements, spreadCx, spreadCy, headPetalCount, petalOpenness, colors, rng);
  }

  // === LEAVES (2-3 small leaves near fork and along main stem) ===
  const leafCount = 2 + Math.floor(rng() * 2); // 2-3 leaves
  for (let i = 0; i < leafCount; i++) {
    if (leafOpenness <= 0) break;
    const t = (i + 0.4) / (leafCount + 0.2);
    const leafY = stemBottom - t * (stemBottom - forkY) * 0.85;
    const side = i % 2 === 0 ? 1 : -1;

    buildLeaf(
      elements,
      forkX + side * 1.5,
      leafY,
      side * (0.4 + rng() * 0.5),
      (0.4 + rng() * 0.4) * leafOpenness,
      2.5,
      6,
      colors.leaf,
      0.5
    );
  }

  return elements;
}

export const wcWildflowerSpray: PlantVariant = {
  id: "wc-wildflower-spray",
  name: "Wildflower Spray",
  description:
    "A naturalistic spray of small blossoms on forking twigs, their count and arrangement shaped by quantum entropy",
  rarity: 0.09,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      bloomCount: { signal: "entropy", range: [3, 5], default: 4, round: true },
      petalCount: { signal: "spread", range: [4, 6], default: 5, round: true },
      branchSpread: { signal: "growth", range: [0.5, 1.2], default: 0.8 },
    },
  },
  colorVariations: [
    { name: "blossom", weight: 1.0, palettes: { bloom: ["#F5D0D8", "#D89098", "#8A9E78"] } },
    { name: "apricot", weight: 0.8, palettes: { bloom: ["#F0D8B8", "#D8B080", "#8A9E78"] } },
    {
      name: "periwinkle",
      weight: 0.7,
      palettes: { bloom: ["#C8C0E8", "#9888C0", "#8A9E78"] },
    },
    { name: "snowdrift", weight: 0.6, palettes: { bloom: ["#F0ECE8", "#D0C8B8", "#8A9E78"] } },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 400,
    clusterBonus: 1.8,
    maxClusterDensity: 6,
    reseedClusterChance: 0.65,
  },
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 12 },
      { name: "sprout", duration: 18 },
      { name: "bloom", duration: 45 },
      { name: "fade", duration: 20 },
    ],
    wcEffect: { layers: 3, opacity: 0.46, spread: 0.06, colorVariation: 0.045 },
    buildElements: buildWcWildflowerSprayElements,
  },
};
