/**
 * Sunfire Cosmos
 *
 * A radiant cluster of cosmos-like flowers that blaze with intense
 * golden light. Each broad-petalled bloom has a fiercely glowing center
 * that radiates warmth outward through translucent petals, creating a
 * sun-like halo effect. Stems splay outward from a shared base,
 * diverging dramatically. Warm sparkle particles and a golden
 * atmospheric haze complete the composition.
 *
 * Category: watercolor (flowers / ethereal)
 * Rarity: 0.07
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, standardOpenness, traitOr, buildLeaf } from "../_helpers";

/* ── colour palettes ─────────────────────────────────────────────── */

const COLORS: Record<
  string,
  {
    petalBase: string;
    petalGlow: string;
    center: string;
    coreHot: string;
    halo: string;
    sparkle: string;
    aura: string;
    stem: string;
    leaf: string;
  }
> = {
  roseglow: {
    petalBase: "#E8A0B8",
    petalGlow: "#F8C8D8",
    center: "#FFF0F0",
    coreHot: "#FFE0E8",
    halo: "#F0B0C8",
    sparkle: "#F8A8C0",
    aura: "#D878A0",
    stem: "#5A7048",
    leaf: "#607850",
  },
  sapphire: {
    petalBase: "#7098D0",
    petalGlow: "#A8C8F0",
    center: "#E8F0FF",
    coreHot: "#D0E0FF",
    halo: "#90B8F0",
    sparkle: "#80B0F0",
    aura: "#5070B8",
    stem: "#4A6858",
    leaf: "#587060",
  },
  sunburst: {
    petalBase: "#E0B020",
    petalGlow: "#F0D860",
    center: "#FFFDE0",
    coreHot: "#FFF8B0",
    halo: "#F0D040",
    sparkle: "#F8E060",
    aura: "#C8A010",
    stem: "#5A6838",
    leaf: "#607840",
  },
  amethyst: {
    petalBase: "#9870C0",
    petalGlow: "#C0A0E0",
    center: "#F0E8FF",
    coreHot: "#E0D0FF",
    halo: "#B090E0",
    sparkle: "#B888E8",
    aura: "#7050A0",
    stem: "#585860",
    leaf: "#606068",
  },
};

const DEFAULT_COLORS = COLORS.sunburst!;

/* ── flower layout positions ─────────────────────────────────────── */

const FLOWER_LAYOUTS: Record<number, Array<{ cx: number; tipY: number; splay: number }>> = {
  4: [
    { cx: 20, tipY: 14, splay: -0.3 },
    { cx: 32, tipY: 8, splay: 0.0 },
    { cx: 42, tipY: 12, splay: 0.25 },
    { cx: 28, tipY: 20, splay: -0.1 },
  ],
  5: [
    { cx: 18, tipY: 16, splay: -0.35 },
    { cx: 28, tipY: 8, splay: -0.1 },
    { cx: 36, tipY: 6, splay: 0.05 },
    { cx: 44, tipY: 12, splay: 0.3 },
    { cx: 24, tipY: 22, splay: -0.15 },
  ],
  6: [
    { cx: 16, tipY: 18, splay: -0.4 },
    { cx: 24, tipY: 10, splay: -0.2 },
    { cx: 34, tipY: 6, splay: 0.0 },
    { cx: 42, tipY: 8, splay: 0.2 },
    { cx: 48, tipY: 16, splay: 0.35 },
    { cx: 20, tipY: 24, splay: -0.25 },
  ],
  7: [
    { cx: 14, tipY: 20, splay: -0.45 },
    { cx: 22, tipY: 12, splay: -0.25 },
    { cx: 30, tipY: 6, splay: -0.05 },
    { cx: 38, tipY: 8, splay: 0.1 },
    { cx: 46, tipY: 14, splay: 0.35 },
    { cx: 18, tipY: 26, splay: -0.3 },
    { cx: 36, tipY: 22, splay: 0.15 },
  ],
};

/* ── render a single cosmos flower ───────────────────────────────── */

function renderCosmos(
  elements: WatercolorElement[],
  cx: number,
  cy: number,
  petalCount: number,
  petalOpenness: number,
  flowerScale: number,
  colorSet: (typeof COLORS)[string],
  rng: () => number
): void {
  if (petalOpenness <= 0) return;

  const step = (Math.PI * 2) / petalCount;

  // === INTENSE RADIAL HALO (the sun-like glow) ===
  if (petalOpenness > 0.2) {
    // Outermost diffuse glow
    elements.push({
      shape: { type: "disc", radius: (16 + rng() * 4) * petalOpenness * flowerScale },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.aura,
      opacity: 0.05 + petalOpenness * 0.05,
      zOffset: 0.6,
    });

    // Mid halo
    elements.push({
      shape: { type: "disc", radius: (12 + rng() * 3) * petalOpenness * flowerScale },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.halo,
      opacity: 0.07 + petalOpenness * 0.07,
      zOffset: 0.65,
    });

    // Inner halo (warm, bright)
    elements.push({
      shape: { type: "disc", radius: (8 + rng() * 2) * petalOpenness * flowerScale },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.coreHot,
      opacity: 0.06 + petalOpenness * 0.06,
      zOffset: 0.7,
    });
  }

  // === BROAD PETALS — wide, rounded cosmos shape ===
  for (let i = 0; i < petalCount; i++) {
    const angle = step * i + rng() * 0.1;
    const pl = (8 + rng() * 3) * petalOpenness * flowerScale;
    const pw = (3.2 + rng() * 1.2) * petalOpenness * flowerScale;

    // Base petal layer
    elements.push({
      shape: { type: "petal", width: pw, length: pl, roundness: 0.55 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petalBase,
      opacity: 0.6 + rng() * 0.15,
      zOffset: 1.0,
    });

    // Inner glow petal (brighter, smaller — light radiating from center)
    elements.push({
      shape: { type: "petal", width: pw * 0.55, length: pl * 0.7, roundness: 0.6 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petalGlow,
      opacity: 0.45 + petalOpenness * 0.25,
      zOffset: 1.1,
    });

    // Light ray extending beyond petal tip
    if (petalOpenness > 0.3) {
      const rayDist = pl * 0.95;
      elements.push({
        shape: { type: "dot", radius: (0.5 + rng() * 0.4) * flowerScale },
        position: {
          x: cx + Math.cos(angle) * rayDist,
          y: cy + Math.sin(angle) * rayDist,
        },
        rotation: 0,
        scale: 1,
        color: colorSet.halo,
        opacity: 0.3 + rng() * 0.2,
        zOffset: 1.3,
      });
    }
  }

  // === BLAZING CENTER (intense multi-layer core) ===
  if (petalOpenness > 0.15) {
    const coreRadius = (2.5 + petalOpenness * 1.8) * flowerScale;

    // Outer center glow bloom
    elements.push({
      shape: { type: "disc", radius: coreRadius * 2.5 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.halo,
      opacity: 0.2 + petalOpenness * 0.15,
      zOffset: 2.0,
    });

    // Main bright center
    elements.push({
      shape: { type: "disc", radius: coreRadius * 1.4 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.center,
      opacity: 0.8 + petalOpenness * 0.15,
      zOffset: 2.1,
    });

    // Hot core
    elements.push({
      shape: { type: "disc", radius: coreRadius * 0.7 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.coreHot,
      opacity: 0.7 + petalOpenness * 0.2,
      zOffset: 2.2,
    });

    // White-hot point
    elements.push({
      shape: { type: "disc", radius: coreRadius * 0.3 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: "#FFFFFF",
      opacity: 0.6 + petalOpenness * 0.25,
      zOffset: 2.3,
    });

    // Stamen dots
    const stamenCount = Math.floor(3 + petalOpenness * 4);
    for (let i = 0; i < stamenCount; i++) {
      const a = rng() * Math.PI * 2;
      const d = coreRadius * (0.5 + rng() * 0.9);
      elements.push({
        shape: { type: "dot", radius: (0.15 + rng() * 0.2) * flowerScale },
        position: { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d },
        rotation: 0,
        scale: 1,
        color: colorSet.center,
        opacity: 0.5 + rng() * 0.3,
        zOffset: 2.4,
      });
    }
  }
}

/* ── main builder ────────────────────────────────────────────────── */

function buildWcSunfireCosmosElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const flowerCount = traitOr(ctx.traits, "flowerCount", 5);
  const petalCount = traitOr(ctx.traits, "petalCount", 8);
  const sparkleCount = traitOr(ctx.traits, "sparkleCount", 22);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const petalOpenness = Math.max(0, (openness - 0.07) / 0.93);
  const leafOpenness = Math.max(0, (openness - 0.04) / 0.96);

  const colors =
    ctx.colorVariationName && COLORS[ctx.colorVariationName]
      ? COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const clampedCount = Math.max(4, Math.min(7, Math.round(flowerCount)));
  const layout = FLOWER_LAYOUTS[clampedCount] ?? FLOWER_LAYOUTS[5]!;

  const baseX = 32;
  const baseY = 56;

  // === GOLDEN ATMOSPHERIC HAZE ===
  if (openness > 0.08) {
    elements.push({
      shape: { type: "disc", radius: 22 + openness * 10 },
      position: { x: baseX, y: baseY - 2 },
      rotation: 0,
      scale: 1,
      color: colors.aura,
      opacity: 0.04 + openness * 0.03,
      zOffset: 0.01,
    });
  }

  // === BROAD POINTED LEAVES at base ===
  if (leafOpenness > 0) {
    const leafCount = 6 + Math.floor(rng() * 4);
    for (let i = 0; i < leafCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const lx = baseX + (rng() - 0.5) * 14;
      const ly = baseY - rng() * 4;
      const angle = -Math.PI / 2 + side * (0.3 + rng() * 0.5) + (rng() - 0.5) * 0.3;
      const leafLen = (5 + rng() * 7) * leafOpenness;

      elements.push({
        shape: { type: "petal", width: 1.4 + rng() * 1.0, length: leafLen, roundness: 0.2 },
        position: { x: lx, y: ly },
        rotation: angle,
        scale: 1,
        color: colors.leaf,
        opacity: 0.4 + rng() * 0.2,
        zOffset: 0.05,
      });
    }

    // Broader accent leaves
    for (let i = 0; i < 3; i++) {
      if (leafOpenness > 0.2) {
        buildLeaf(
          elements,
          baseX + (rng() - 0.5) * 10,
          baseY - 2 - rng() * 3,
          (rng() - 0.5) * 1.0,
          (0.4 + rng() * 0.3) * leafOpenness,
          3,
          8,
          colors.leaf,
          0.4
        );
      }
    }
  }

  // === SPLAYING STEMS + FLOWERS ===
  for (let i = 0; i < clampedCount; i++) {
    const { cx: flowerCx, tipY, splay } = layout[i]!;

    const offsetX = (rng() - 0.5) * 2;
    const offsetY = (rng() - 0.5) * 2;
    const finalCx = flowerCx + offsetX;
    const finalTipY = tipY + offsetY;

    // Stems splay outward — the splay value pushes the midpoint
    const midX = (baseX + finalCx) / 2 + splay * 8 + (rng() - 0.5) * 3;
    const midY = (baseY + finalTipY) / 2 + (rng() - 0.5) * 3;
    const c1x = baseX + (midX - baseX) * 0.45 + (rng() - 0.5) * 2;
    const c1y = baseY - (baseY - midY) * 0.35;
    const c2x = midX + (finalCx - midX) * 0.5 + (rng() - 0.5) * 1.5;
    const c2y = midY - (midY - finalTipY) * 0.3;

    elements.push({
      shape: {
        type: "stem",
        points: [
          [baseX, baseY],
          [c1x, c1y],
          [midX, midY],
          [c2x, c2y],
          [finalCx, finalTipY + 3],
        ],
        thickness: 0.35 + openness * 0.2,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: colors.stem,
      opacity: 0.5 + openness * 0.15,
      zOffset: 0.1,
    });

    // Small leaf on some stems
    if (leafOpenness > 0 && rng() > 0.35) {
      const leafT = 0.35 + rng() * 0.2;
      const leafX = baseX + (finalCx - baseX) * leafT + (rng() - 0.5) * 2;
      const leafY = baseY + (finalTipY - baseY) * leafT;
      const side = i % 2 === 0 ? 1 : -1;

      buildLeaf(
        elements,
        leafX,
        leafY,
        side * (0.4 + rng() * 0.4),
        (0.35 + rng() * 0.25) * leafOpenness,
        2,
        5,
        colors.leaf,
        0.4
      );
    }

    // Flower scale
    const flowerScale = 0.8 + rng() * 0.3;
    const headPetalCount = i === 0 ? petalCount : Math.max(6, petalCount - Math.floor(rng() * 2));

    renderCosmos(
      elements,
      finalCx,
      finalTipY,
      headPetalCount,
      petalOpenness,
      flowerScale,
      colors,
      rng
    );
  }

  // === WARM SPARKLE PARTICLES ===
  if (openness > 0.12) {
    const sparkleOpenness = Math.min(1, (openness - 0.12) / 0.55);
    const activeSparkles = Math.round(sparkleCount * sparkleOpenness);

    for (let i = 0; i < activeSparkles; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * 22 + 3;
      const sx = baseX + Math.cos(angle) * dist * 0.8 + (rng() - 0.5) * 8;
      const sy = 30 + Math.sin(angle) * dist * 1.1 + (rng() - 0.5) * 12;

      const roll = rng();
      const isLarge = roll < 0.15;
      const isMedium = roll < 0.35;

      const sparkleRadius = isLarge
        ? 0.6 + rng() * 0.5
        : isMedium
          ? 0.3 + rng() * 0.3
          : 0.12 + rng() * 0.2;

      elements.push({
        shape: { type: "dot", radius: sparkleRadius },
        position: { x: sx, y: sy },
        rotation: 0,
        scale: 1,
        color: isLarge ? colors.coreHot : colors.sparkle,
        opacity: (isLarge ? 0.7 : isMedium ? 0.5 : 0.3) + rng() * 0.25,
        zOffset: 3.0 + rng() * 0.5,
      });

      if (isLarge || isMedium) {
        elements.push({
          shape: { type: "disc", radius: sparkleRadius * (isLarge ? 4.5 : 2.5) },
          position: { x: sx, y: sy },
          rotation: 0,
          scale: 1,
          color: colors.aura,
          opacity: (isLarge ? 0.08 : 0.04) + rng() * 0.03,
          zOffset: 2.9,
        });
      }
    }
  }

  return elements;
}

/* ── variant definition ──────────────────────────────────────────── */

export const wcSunfireCosmos: PlantVariant = {
  id: "wc-sunfire-cosmos",
  name: "Sunfire Cosmos",
  description:
    "Radiant cosmos flowers blazing with intense light, their broad petals glowing around fiercely bright centers like miniature suns",
  rarity: 0.07,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      flowerCount: { signal: "entropy", range: [4, 7], default: 5, round: true },
      petalCount: { signal: "spread", range: [6, 10], default: 8, round: true },
      sparkleCount: { signal: "growth", range: [14, 28], default: 22, round: true },
    },
  },
  colorVariations: [
    {
      name: "roseglow",
      weight: 0.8,
      palettes: { bloom: ["#E8A0B8", "#F8C8D8", "#5A7048"] },
    },
    {
      name: "sapphire",
      weight: 0.8,
      palettes: { bloom: ["#7098D0", "#A8C8F0", "#4A6858"] },
    },
    {
      name: "sunburst",
      weight: 1.0,
      palettes: { bloom: ["#E0B020", "#F0D860", "#5A6838"] },
    },
    {
      name: "amethyst",
      weight: 0.8,
      palettes: { bloom: ["#9870C0", "#C0A0E0", "#585860"] },
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
    wcEffect: { layers: 4, opacity: 0.6, spread: 0.09, colorVariation: 0.07 },
    buildElements: buildWcSunfireCosmosElements,
  },
};
