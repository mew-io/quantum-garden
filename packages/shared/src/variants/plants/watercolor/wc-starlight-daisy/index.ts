/**
 * Starlight Daisy
 *
 * An ethereal cluster of luminous white daisy-like flowers on tall thin stems,
 * surrounded by abundant sparkle particles that glow against the dark garden.
 * Multiple flowers rise from a shared base at varying heights, each with
 * thin radiating petals and a warm golden center. Firefly-like sparkles
 * drift throughout the composition.
 *
 * Category: watercolor (flowers / ethereal)
 * Rarity: 0.08
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, standardOpenness, traitOr, buildLeaf } from "../_helpers";

/* ── colour palette ────────────────────────────────────────────────── */

const COLORS: Record<
  string,
  { petal: string; center: string; glow: string; sparkle: string; stem: string; leaf: string }
> = {
  celestial: {
    petal: "#E8E4F0",
    center: "#F0E0A0",
    glow: "#FFFDE8",
    sparkle: "#F8F4E0",
    stem: "#5A7A58",
    leaf: "#6B8A60",
  },
  moonbeam: {
    petal: "#D8DDE8",
    center: "#C8D0E0",
    glow: "#E8F0FF",
    sparkle: "#D0E0F8",
    stem: "#5A7078",
    leaf: "#687E80",
  },
  aurora: {
    petal: "#D8E8D0",
    center: "#E0D890",
    glow: "#F0FFE0",
    sparkle: "#D8F0C8",
    stem: "#587858",
    leaf: "#688A60",
  },
};

const DEFAULT_COLORS = COLORS.celestial!;

/* ── per-flower layout: deterministic positions for each count ───── */

const FLOWER_LAYOUTS: Record<number, Array<{ cx: number; tipY: number }>> = {
  4: [
    { cx: 22, tipY: 16 },
    { cx: 32, tipY: 10 },
    { cx: 40, tipY: 18 },
    { cx: 28, tipY: 22 },
  ],
  5: [
    { cx: 20, tipY: 18 },
    { cx: 30, tipY: 10 },
    { cx: 38, tipY: 14 },
    { cx: 44, tipY: 20 },
    { cx: 26, tipY: 24 },
  ],
  6: [
    { cx: 18, tipY: 18 },
    { cx: 26, tipY: 10 },
    { cx: 34, tipY: 8 },
    { cx: 42, tipY: 14 },
    { cx: 46, tipY: 22 },
    { cx: 22, tipY: 24 },
  ],
  7: [
    { cx: 16, tipY: 20 },
    { cx: 24, tipY: 12 },
    { cx: 32, tipY: 8 },
    { cx: 40, tipY: 10 },
    { cx: 46, tipY: 18 },
    { cx: 20, tipY: 26 },
    { cx: 36, tipY: 24 },
  ],
};

/* ── render a single daisy flower ────────────────────────────────── */

function renderDaisy(
  elements: WatercolorElement[],
  cx: number,
  cy: number,
  petalCount: number,
  petalOpenness: number,
  colorSet: (typeof COLORS)[string],
  rng: () => number,
  flowerScale: number
): void {
  if (petalOpenness <= 0) return;

  const step = (Math.PI * 2) / petalCount;

  // Outer glow disc behind the flower
  if (petalOpenness > 0.3) {
    elements.push({
      shape: { type: "disc", radius: (8 + rng() * 3) * petalOpenness * flowerScale },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.glow,
      opacity: 0.08 + petalOpenness * 0.07,
      zOffset: 0.8,
    });
  }

  // Petals — thin, pointed rays
  for (let i = 0; i < petalCount; i++) {
    const angle = step * i + rng() * 0.15;
    const pl = (7 + rng() * 3) * petalOpenness * flowerScale;
    const pw = (1.6 + rng() * 0.8) * petalOpenness * flowerScale;

    elements.push({
      shape: { type: "petal", width: pw, length: pl, roundness: 0.35 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petal,
      opacity: 0.75 + rng() * 0.2,
      zOffset: 1.0,
    });
  }

  // Warm glowing center disc
  if (petalOpenness > 0.15) {
    const discRadius = (1.5 + petalOpenness * 1.2) * flowerScale;
    elements.push({
      shape: { type: "disc", radius: discRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.center,
      opacity: 0.8,
      zOffset: 2.0,
    });

    // Inner glow highlight
    elements.push({
      shape: { type: "disc", radius: discRadius * 0.55 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.glow,
      opacity: 0.5 + petalOpenness * 0.2,
      zOffset: 2.1,
    });

    // Stamen dots
    const dotCount = Math.floor(2 + petalOpenness * 3);
    for (let i = 0; i < dotCount; i++) {
      const a = rng() * Math.PI * 2;
      const d = rng() * discRadius * 0.7;
      elements.push({
        shape: { type: "dot", radius: (0.15 + rng() * 0.2) * flowerScale },
        position: { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d },
        rotation: 0,
        scale: 1,
        color: colorSet.glow,
        opacity: 0.5 + rng() * 0.3,
        zOffset: 2.2,
      });
    }
  }
}

/* ── main builder ────────────────────────────────────────────────── */

function buildWcStarlightDaisyElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  // Quantum-driven traits
  const flowerCount = traitOr(ctx.traits, "flowerCount", 5);
  const petalCount = traitOr(ctx.traits, "petalCount", 8);
  const sparkleCount = traitOr(ctx.traits, "sparkleCount", 22);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const petalOpenness = Math.max(0, (openness - 0.08) / 0.92);
  const leafOpenness = Math.max(0, (openness - 0.05) / 0.95);

  const colors =
    ctx.colorVariationName && COLORS[ctx.colorVariationName]
      ? COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  // Clamp flower count and get layout
  const clampedFlowerCount = Math.max(4, Math.min(7, Math.round(flowerCount)));
  const layout = FLOWER_LAYOUTS[clampedFlowerCount] ?? FLOWER_LAYOUTS[5]!;

  // Shared base point
  const baseX = 32;
  const baseY = 56;

  // === BASE GRASS TUFTS ===
  if (openness > 0.02) {
    const grassCount = 5 + Math.floor(rng() * 4);
    for (let i = 0; i < grassCount; i++) {
      const gx = baseX + (rng() - 0.5) * 16;
      const gy = baseY - rng() * 3;
      const angle = (rng() - 0.5) * 0.8;
      const bladeLen = (3 + rng() * 5) * Math.min(openness * 2, 1);

      elements.push({
        shape: { type: "petal", width: 0.5 + rng() * 0.4, length: bladeLen, roundness: 0.2 },
        position: { x: gx, y: gy },
        rotation: -Math.PI / 2 + angle,
        scale: 1,
        color: colors.leaf,
        opacity: 0.4 + rng() * 0.2,
        zOffset: 0.05,
      });
    }
  }

  // === STEMS + FLOWERS ===
  for (let i = 0; i < clampedFlowerCount; i++) {
    const { cx: flowerCx, tipY } = layout[i]!;

    // Slight per-flower variation from seed
    const offsetX = (rng() - 0.5) * 2;
    const offsetY = (rng() - 0.5) * 2;
    const finalCx = flowerCx + offsetX;
    const finalTipY = tipY + offsetY;

    // Stem — thin curved line from base to flower
    const midX = (baseX + finalCx) / 2 + (rng() - 0.5) * 4;
    const midY = (baseY + finalTipY) / 2 + (rng() - 0.5) * 3;
    const ctrl1X = baseX + (midX - baseX) * 0.5 + (rng() - 0.5) * 2;
    const ctrl1Y = baseY - (baseY - midY) * 0.4;
    const ctrl2X = midX + (finalCx - midX) * 0.5 + (rng() - 0.5) * 2;
    const ctrl2Y = midY - (midY - finalTipY) * 0.3;

    elements.push({
      shape: {
        type: "stem",
        points: [
          [baseX, baseY],
          [ctrl1X, ctrl1Y],
          [midX, midY],
          [ctrl2X, ctrl2Y],
          [finalCx, finalTipY + 3],
        ],
        thickness: 0.3 + openness * 0.15,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: colors.stem,
      opacity: 0.5 + openness * 0.15,
      zOffset: 0.1,
    });

    // Small leaf on each stem (alternating sides)
    if (leafOpenness > 0 && rng() > 0.25) {
      const leafT = 0.4 + rng() * 0.25;
      const leafX = baseX + (finalCx - baseX) * leafT + (rng() - 0.5) * 2;
      const leafY = baseY + (finalTipY - baseY) * leafT;
      const side = i % 2 === 0 ? 1 : -1;

      buildLeaf(
        elements,
        leafX,
        leafY,
        side * (0.4 + rng() * 0.4),
        (0.35 + rng() * 0.3) * leafOpenness,
        2.0,
        5.0,
        colors.leaf,
        0.45
      );
    }

    // Flower scale — slightly smaller for background flowers
    const flowerScale = 0.7 + (1 - finalTipY / 30) * 0.35 + rng() * 0.1;

    // Per-flower petal count variation
    const headPetalCount = i === 0 ? petalCount : Math.max(5, petalCount - Math.floor(rng() * 3));

    renderDaisy(
      elements,
      finalCx,
      finalTipY,
      headPetalCount,
      petalOpenness,
      colors,
      rng,
      Math.min(flowerScale, 1.2)
    );
  }

  // === SPARKLE PARTICLES (key distinguishing feature) ===
  if (openness > 0.15) {
    const sparkleOpenness = Math.min(1, (openness - 0.15) / 0.6);
    const activeSparkles = Math.round(sparkleCount * sparkleOpenness);

    for (let i = 0; i < activeSparkles; i++) {
      // Distribute sparkles in an elongated oval around the plant
      const angle = rng() * Math.PI * 2;
      const dist = rng() * 22 + 3;
      const sx = baseX + Math.cos(angle) * dist * 0.8 + (rng() - 0.5) * 8;
      const sy = 32 + Math.sin(angle) * dist * 1.1 + (rng() - 0.5) * 10;

      // Vary sparkle size — a few large, most small
      const isLarge = rng() < 0.15;
      const sparkleRadius = isLarge ? 0.5 + rng() * 0.4 : 0.15 + rng() * 0.25;

      elements.push({
        shape: { type: "dot", radius: sparkleRadius },
        position: { x: sx, y: sy },
        rotation: 0,
        scale: 1,
        color: isLarge ? colors.glow : colors.sparkle,
        opacity: (isLarge ? 0.6 : 0.3) + rng() * 0.3,
        zOffset: 3.0 + rng() * 0.5,
      });

      // Large sparkles get a secondary glow disc behind them
      if (isLarge) {
        elements.push({
          shape: { type: "disc", radius: sparkleRadius * 3.5 },
          position: { x: sx, y: sy },
          rotation: 0,
          scale: 1,
          color: colors.glow,
          opacity: 0.06 + rng() * 0.04,
          zOffset: 2.9,
        });
      }
    }
  }

  return elements;
}

/* ── variant definition ──────────────────────────────────────────── */

export const wcStarlightDaisy: PlantVariant = {
  id: "wc-starlight-daisy",
  name: "Starlight Daisy",
  description:
    "An ethereal cluster of luminous daisies surrounded by drifting sparkle particles, their count shaped by quantum entropy",
  rarity: 0.08,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      flowerCount: { signal: "entropy", range: [4, 7], default: 5, round: true },
      petalCount: { signal: "spread", range: [6, 10], default: 8, round: true },
      sparkleCount: { signal: "growth", range: [15, 30], default: 22, round: true },
    },
  },
  colorVariations: [
    {
      name: "celestial",
      weight: 1.0,
      palettes: { bloom: ["#E8E4F0", "#F0E0A0", "#5A7A58"] },
    },
    {
      name: "moonbeam",
      weight: 0.7,
      palettes: { bloom: ["#D8DDE8", "#C8D0E0", "#5A7078"] },
    },
    {
      name: "aurora",
      weight: 0.6,
      palettes: { bloom: ["#D8E8D0", "#E0D890", "#587858"] },
    },
  ],
  clusteringBehavior: {
    mode: "spread",
  },
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 14 },
      { name: "sprout", duration: 18 },
      { name: "bloom", duration: 50 },
      { name: "fade", duration: 20 },
    ],
    wcEffect: { layers: 4, opacity: 0.55, spread: 0.08, colorVariation: 0.06 },
    buildElements: buildWcStarlightDaisyElements,
  },
};
