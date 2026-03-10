/**
 * Hydrangea Puff
 *
 * A dense dome of 8-12 tiny 4-petal florets packed into a lush round
 * mass on a thick stem. Individual florets are tiny but packed tightly,
 * creating a full, pillow-like hydrangea or viburnum shape.
 *
 * Category: watercolor (flowers)
 * Rarity: 0.08
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import {
  createRng,
  standardOpenness,
  traitOr,
  buildStem,
  buildLeaf,
  radialPositions,
} from "../_helpers";

const HYDRANGEA_COLORS: Record<
  string,
  { petal: string; accent: string; stem: string; leaf: string }
> = {
  periwinkle: { petal: "#B0B8E0", accent: "#8890C8", stem: "#6B8A60", leaf: "#78A068" },
  rosepink: { petal: "#E0A8C0", accent: "#C880A0", stem: "#6B8A60", leaf: "#78A068" },
  seafoam: { petal: "#A8D8C8", accent: "#80C0A8", stem: "#6B8A60", leaf: "#78A068" },
  lilac: { petal: "#C8B0D8", accent: "#A888C0", stem: "#6B8A60", leaf: "#78A068" },
};

const DEFAULT_COLORS = HYDRANGEA_COLORS.periwinkle!;

/**
 * Render a single tiny 4-petal floret at a given position.
 */
function renderFloret(
  elements: WatercolorElement[],
  cx: number,
  cy: number,
  floretSize: number,
  petalOpenness: number,
  colorSet: { petal: string; accent: string; stem: string; leaf: string },
  rng: () => number,
  zOffset: number
): void {
  if (petalOpenness <= 0) return;

  const petalCount = 4;
  const baseRotation = rng() * (Math.PI / 4); // random rotation per floret
  const step = (Math.PI * 2) / petalCount;

  for (let i = 0; i < petalCount; i++) {
    const angle = step * i + baseRotation + rng() * 0.15;
    const pw = (1.2 + rng() * 0.5) * floretSize * petalOpenness;
    const pl = (2.5 + rng() * 1.0) * floretSize * petalOpenness;

    elements.push({
      shape: { type: "petal", width: pw, length: pl, roundness: 0.85 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petal,
      zOffset,
    });
  }

  // Tiny center dot
  if (petalOpenness > 0.3) {
    elements.push({
      shape: { type: "dot", radius: 0.25 + rng() * 0.2 },
      position: { x: cx + (rng() - 0.5) * 0.4, y: cy + (rng() - 0.5) * 0.4 },
      rotation: 0,
      scale: 1,
      color: colorSet.accent,
      opacity: 0.5 + rng() * 0.3,
      zOffset: zOffset + 0.5,
    });
  }
}

function buildWcHydrangeaPuffElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const floretCount = traitOr(ctx.traits, "floretCount", 10);
  const domeRadius = traitOr(ctx.traits, "domeRadius", 10);
  const floretSize = traitOr(ctx.traits, "floretSize", 0.8);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const colors =
    ctx.colorVariationName && HYDRANGEA_COLORS[ctx.colorVariationName]
      ? HYDRANGEA_COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const petalOpenness = Math.max(0, (openness - 0.05) / 0.95);
  const leafOpenness = Math.max(0, (openness - 0.1) / 0.9);

  const cx = 32;
  const cy = 22;
  const stemBottom = 56;
  const stemFullTop = cy + 6;

  // === STEM (thick, sturdy) — grows upward with openness ===
  const stemGrowth = Math.min(1, openness / 0.3);
  if (stemGrowth > 0) {
    const stemTopY = stemBottom + (stemFullTop - stemBottom) * stemGrowth;
    buildStem(
      elements,
      cx,
      stemBottom,
      cx,
      stemTopY,
      0.08 * stemGrowth,
      0.8 + openness * 0.35,
      colors.stem,
      0.58 * Math.min(1, stemGrowth * 2),
      rng
    );
  }

  // === BROAD LEAVES (2-3 large hydrangea leaves) — along grown stem ===
  const stemTopY = stemBottom + (stemFullTop - stemBottom) * stemGrowth;
  const leafCount = 2 + Math.floor(rng() * 2);
  for (let i = 0; i < leafCount; i++) {
    if (leafOpenness <= 0) break;
    const t = (i + 0.4) / (leafCount + 0.2);
    const leafY = stemBottom - t * (stemBottom - stemTopY) * 0.7;
    const side = i % 2 === 0 ? 1 : -1;

    buildLeaf(
      elements,
      cx + side * 2.5,
      leafY,
      side * (0.35 + rng() * 0.45),
      (0.5 + rng() * 0.4) * leafOpenness,
      5,
      11,
      colors.leaf,
      0.5
    );
  }

  // === BUD (shown during early growth before florets appear) ===
  if (petalOpenness < 0.15) {
    const budRadius = 3 + openness * 2;
    elements.push({
      shape: { type: "disc", radius: budRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colors.leaf,
      opacity: 0.4 + openness * 0.2,
      zOffset: 1.0,
    });
    return elements;
  }

  // === DOME OF FLORETS ===
  const clampedCount = Math.max(8, Math.min(12, Math.round(floretCount)));

  // Build floret positions in concentric rings
  const floretPositions: Array<{ x: number; y: number; ring: number }> = [];

  // Center floret
  floretPositions.push({ x: cx, y: cy, ring: 0 });

  // Inner ring (~4 florets)
  const innerCount = Math.min(4, clampedCount - 1);
  const innerRing = radialPositions(cx, cy, domeRadius * 0.38, innerCount, rng() * 0.5);
  for (const pos of innerRing) {
    floretPositions.push({
      x: pos.x + (rng() - 0.5) * 1.2,
      y: pos.y + (rng() - 0.5) * 1.2,
      ring: 1,
    });
  }

  // Outer ring (remaining florets)
  const outerCount = clampedCount - 1 - innerCount;
  if (outerCount > 0) {
    const outerRing = radialPositions(cx, cy, domeRadius * 0.75, outerCount, rng() * 0.5);
    for (const pos of outerRing) {
      floretPositions.push({
        x: pos.x + (rng() - 0.5) * 1.5,
        // Offset outer florets slightly downward for dome illusion
        y: pos.y + (rng() - 0.5) * 1.5 + 1.0,
        ring: 2,
      });
    }
  }

  // Render each floret
  for (const pos of floretPositions) {
    // Inner florets render on top for depth
    const zBase = pos.ring === 0 ? 1.4 : pos.ring === 1 ? 1.2 : 1.0;
    renderFloret(elements, pos.x, pos.y, floretSize, petalOpenness, colors, rng, zBase);
  }

  return elements;
}

export const wcHydrangeaPuff: PlantVariant = {
  id: "wc-hydrangea-puff",
  name: "Hydrangea Puff",
  description:
    "A dense dome of tiny four-petal florets forming a lush watercolor mass, its fullness determined by quantum entropy",
  rarity: 0.08,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      floretCount: { signal: "entropy", range: [8, 12], default: 10, round: true },
      domeRadius: { signal: "growth", range: [8, 13], default: 10 },
      floretSize: { signal: "spread", range: [0.6, 1.0], default: 0.8 },
    },
  },
  colorVariations: [
    {
      name: "periwinkle",
      weight: 1.0,
      palettes: { bloom: ["#B0B8E0", "#8890C8", "#6B8A60"] },
    },
    { name: "rosepink", weight: 0.9, palettes: { bloom: ["#E0A8C0", "#C880A0", "#6B8A60"] } },
    { name: "seafoam", weight: 0.7, palettes: { bloom: ["#A8D8C8", "#80C0A8", "#6B8A60"] } },
    { name: "lilac", weight: 0.8, palettes: { bloom: ["#C8B0D8", "#A888C0", "#6B8A60"] } },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 450,
    clusterBonus: 1.6,
    maxClusterDensity: 4,
    reseedClusterChance: 0.55,
  },
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 15 },
      { name: "sprout", duration: 20 },
      { name: "bloom", duration: 50 },
      { name: "fade", duration: 20 },
    ],
    wcEffect: { layers: 4, opacity: 0.42, spread: 0.05, colorVariation: 0.05 },
    buildElements: buildWcHydrangeaPuffElements,
  },
};
