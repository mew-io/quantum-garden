/**
 * Blushing Peony
 *
 * A lush cluster of soft pink peonies with warm golden centres that
 * glow like captured sunlight. Each bloom features multiple concentric
 * rings of rounded, cupped petals surrounding a luminous golden core.
 * Tight round buds sit among the open flowers, promising future
 * blooms. Broad serrated leaves frame the arrangement while sparkle
 * particles and purple mist complete the dreamy atmosphere.
 *
 * Category: watercolor (flowers / ethereal)
 * Rarity: 0.07
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, standardOpenness, traitOr } from "../_helpers";

/* ── colour palettes ─────────────────────────────────────────────── */

const COLORS: Record<
  string,
  {
    petalOuter: string;
    petalMid: string;
    petalInner: string;
    petalHighlight: string;
    goldenCenter: string;
    goldenGlow: string;
    goldenBright: string;
    budColor: string;
    sparkle: string;
    aura: string;
    mist: string;
    stem: string;
    leaf: string;
    leafDark: string;
  }
> = {
  roseglow: {
    petalOuter: "#E8A0B8",
    petalMid: "#F0B8C8",
    petalInner: "#F8D0DA",
    petalHighlight: "#FFE8F0",
    goldenCenter: "#F0C860",
    goldenGlow: "#FFE088",
    goldenBright: "#FFF8D0",
    budColor: "#D890A8",
    sparkle: "#F8B0C8",
    aura: "#C880A8",
    mist: "#A868B8",
    stem: "#4A5838",
    leaf: "#3A5830",
    leafDark: "#2A4020",
  },
  sunburst: {
    petalOuter: "#D8B848",
    petalMid: "#E8D060",
    petalInner: "#F0E080",
    petalHighlight: "#F8F0B0",
    goldenCenter: "#F8E060",
    goldenGlow: "#FFF088",
    goldenBright: "#FFFCE0",
    budColor: "#C8A838",
    sparkle: "#F0D060",
    aura: "#A89020",
    mist: "#8A7828",
    stem: "#4A5838",
    leaf: "#3A5830",
    leafDark: "#2A4020",
  },
  amethyst: {
    petalOuter: "#A880C8",
    petalMid: "#B898D8",
    petalInner: "#D0B8F0",
    petalHighlight: "#E8D8FF",
    goldenCenter: "#E0B858",
    goldenGlow: "#F0D078",
    goldenBright: "#FFF0C8",
    budColor: "#9070B0",
    sparkle: "#B898E0",
    aura: "#7858A8",
    mist: "#6848A0",
    stem: "#484850",
    leaf: "#384838",
    leafDark: "#283828",
  },
  white: {
    petalOuter: "#E0D8D0",
    petalMid: "#ECE8E0",
    petalInner: "#F4F0EA",
    petalHighlight: "#FFFFF8",
    goldenCenter: "#F0C860",
    goldenGlow: "#FFE088",
    goldenBright: "#FFF8D0",
    budColor: "#D0C8C0",
    sparkle: "#F0E8D8",
    aura: "#C0B0A0",
    mist: "#A898B0",
    stem: "#4A5838",
    leaf: "#3A5830",
    leafDark: "#2A4020",
  },
};

const DEFAULT_COLORS = COLORS.roseglow!;

/* ── flower & bud layout ─────────────────────────────────────────── */

interface FlowerPos {
  cx: number;
  cy: number;
  size: number; // 1.0 = full, smaller = partial
  isBud: boolean;
}

const FLOWER_LAYOUTS: Record<number, FlowerPos[]> = {
  5: [
    { cx: 32, cy: 14, size: 1.2, isBud: false },
    { cx: 22, cy: 20, size: 0.9, isBud: false },
    { cx: 42, cy: 18, size: 0.95, isBud: false },
    { cx: 26, cy: 28, size: 0.85, isBud: false },
    { cx: 40, cy: 28, size: 0.8, isBud: false },
    // Buds
    { cx: 16, cy: 16, size: 0.5, isBud: true },
    { cx: 46, cy: 12, size: 0.45, isBud: true },
    { cx: 36, cy: 26, size: 0.4, isBud: true },
  ],
  6: [
    { cx: 30, cy: 12, size: 1.2, isBud: false },
    { cx: 20, cy: 18, size: 0.95, isBud: false },
    { cx: 40, cy: 14, size: 1.0, isBud: false },
    { cx: 24, cy: 26, size: 0.85, isBud: false },
    { cx: 36, cy: 24, size: 0.9, isBud: false },
    { cx: 44, cy: 26, size: 0.8, isBud: false },
    // Buds
    { cx: 14, cy: 14, size: 0.5, isBud: true },
    { cx: 48, cy: 10, size: 0.45, isBud: true },
    { cx: 28, cy: 30, size: 0.4, isBud: true },
    { cx: 46, cy: 24, size: 0.35, isBud: true },
  ],
  7: [
    { cx: 32, cy: 10, size: 1.25, isBud: false },
    { cx: 20, cy: 16, size: 0.95, isBud: false },
    { cx: 42, cy: 14, size: 1.0, isBud: false },
    { cx: 14, cy: 24, size: 0.8, isBud: false },
    { cx: 28, cy: 24, size: 0.9, isBud: false },
    { cx: 38, cy: 26, size: 0.85, isBud: false },
    { cx: 48, cy: 22, size: 0.8, isBud: false },
    // Buds
    { cx: 12, cy: 14, size: 0.5, isBud: true },
    { cx: 50, cy: 10, size: 0.45, isBud: true },
    { cx: 22, cy: 30, size: 0.4, isBud: true },
    { cx: 44, cy: 30, size: 0.38, isBud: true },
  ],
};

/* ── render a peony bud ──────────────────────────────────────────── */

function renderBud(
  elements: WatercolorElement[],
  cx: number,
  cy: number,
  budScale: number,
  bloomOpenness: number,
  colorSet: (typeof COLORS)[string],
  rng: () => number
): void {
  if (bloomOpenness <= 0.05) return;

  const s = budScale * bloomOpenness;

  // Tight round bud — overlapping discs
  elements.push({
    shape: { type: "disc", radius: 3.0 * s },
    position: { x: cx, y: cy },
    rotation: 0,
    scale: 1,
    color: colorSet.budColor,
    opacity: 0.45 + rng() * 0.15,
    zOffset: 0.8,
  });

  // Lighter top highlight
  elements.push({
    shape: { type: "disc", radius: 2.0 * s },
    position: { x: cx, y: cy - 0.5 * s },
    rotation: 0,
    scale: 1,
    color: colorSet.petalMid,
    opacity: 0.35 + rng() * 0.15,
    zOffset: 0.85,
  });

  // Tiny petal tips visible at top of bud
  const tipCount = 3 + Math.floor(rng() * 2);
  for (let i = 0; i < tipCount; i++) {
    const angle = -Math.PI / 2 + (i / (tipCount - 1) - 0.5) * 0.8;
    elements.push({
      shape: { type: "petal", width: 1.0 * s, length: 1.5 * s, roundness: 0.8 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1,
      color: colorSet.petalOuter,
      opacity: 0.35 + rng() * 0.15,
      zOffset: 0.9,
    });
  }

  // Subtle inner glow
  if (bloomOpenness > 0.3) {
    elements.push({
      shape: { type: "disc", radius: 1.0 * s },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.goldenGlow,
      opacity: 0.1 + bloomOpenness * 0.08,
      zOffset: 0.95,
    });
  }
}

/* ── render a single open peony flower ───────────────────────────── */

function renderPeony(
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

  const s = flowerScale;

  // === BACKGROUND GLOW ===
  if (petalOpenness > 0.2) {
    elements.push({
      shape: { type: "disc", radius: (14 + rng() * 3) * petalOpenness * s },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.aura,
      opacity: 0.05 + petalOpenness * 0.05,
      zOffset: 0.6,
    });
  }

  // === OUTER RING — large, softer petals ===
  const outerCount = petalCount;
  const outerLen = (7 + rng() * 2) * petalOpenness * s;
  const outerW = (4.5 + rng() * 1.5) * petalOpenness * s;

  for (let i = 0; i < outerCount; i++) {
    const angle = (i / outerCount) * Math.PI * 2 + (rng() - 0.5) * 0.2 - Math.PI / 2;

    elements.push({
      shape: { type: "petal", width: outerW, length: outerLen, roundness: 0.75 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1,
      color: colorSet.petalOuter,
      opacity: 0.5 + rng() * 0.15,
      zOffset: 0.9 + rng() * 0.02,
    });

    // Inner glow on outer petals
    elements.push({
      shape: { type: "petal", width: outerW * 0.6, length: outerLen * 0.8, roundness: 0.8 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1,
      color: colorSet.petalMid,
      opacity: 0.3 + petalOpenness * 0.12,
      zOffset: 0.95 + rng() * 0.02,
    });
  }

  // === MIDDLE RING — medium, lighter petals ===
  const midCount = Math.max(4, outerCount - 1);
  const midLen = (5 + rng() * 1.5) * petalOpenness * s;
  const midW = (3.5 + rng() * 1) * petalOpenness * s;
  const midOffset = Math.PI / outerCount;

  for (let i = 0; i < midCount; i++) {
    const angle = (i / midCount) * Math.PI * 2 + midOffset + (rng() - 0.5) * 0.25 - Math.PI / 2;

    elements.push({
      shape: { type: "petal", width: midW, length: midLen, roundness: 0.8 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1,
      color: colorSet.petalMid,
      opacity: 0.45 + rng() * 0.15,
      zOffset: 1.05 + rng() * 0.02,
    });

    elements.push({
      shape: { type: "petal", width: midW * 0.55, length: midLen * 0.75, roundness: 0.85 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1,
      color: colorSet.petalInner,
      opacity: 0.3 + petalOpenness * 0.18,
      zOffset: 1.1 + rng() * 0.02,
    });
  }

  // === INNER RING — small, brightest petals ===
  const innerCount = Math.max(3, midCount - 1);
  const innerLen = (3.5 + rng() * 1) * petalOpenness * s;
  const innerW = (2.5 + rng() * 0.8) * petalOpenness * s;

  for (let i = 0; i < innerCount; i++) {
    const angle = (i / innerCount) * Math.PI * 2 + (rng() - 0.5) * 0.3 - Math.PI / 2;

    elements.push({
      shape: { type: "petal", width: innerW, length: innerLen, roundness: 0.85 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1,
      color: colorSet.petalInner,
      opacity: 0.45 + rng() * 0.15,
      zOffset: 1.2 + rng() * 0.02,
    });

    elements.push({
      shape: { type: "petal", width: innerW * 0.5, length: innerLen * 0.65, roundness: 0.9 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1,
      color: colorSet.petalHighlight,
      opacity: 0.25 + petalOpenness * 0.18,
      zOffset: 1.25 + rng() * 0.02,
    });
  }

  // === WARM GOLDEN GLOWING CENTER ===
  if (petalOpenness > 0.15) {
    const coreRadius = (1.6 + petalOpenness * 1.2) * s;

    // Wide golden glow spread
    elements.push({
      shape: { type: "disc", radius: coreRadius * 3.5 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.goldenCenter,
      opacity: 0.12 + petalOpenness * 0.1,
      zOffset: 1.5,
    });

    // Golden core
    elements.push({
      shape: { type: "disc", radius: coreRadius * 2.0 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.goldenGlow,
      opacity: 0.3 + petalOpenness * 0.2,
      zOffset: 1.6,
    });

    // Bright golden center
    elements.push({
      shape: { type: "disc", radius: coreRadius * 1.0 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.goldenBright,
      opacity: 0.5 + petalOpenness * 0.25,
      zOffset: 1.7,
    });

    // Hot white point
    elements.push({
      shape: { type: "disc", radius: coreRadius * 0.35 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: "#FFFFFF",
      opacity: 0.4 + petalOpenness * 0.25,
      zOffset: 1.8,
    });

    // Golden stamen dots visible among inner petals
    const stamenCount = Math.floor(3 + petalOpenness * 3);
    for (let i = 0; i < stamenCount; i++) {
      const a = rng() * Math.PI * 2;
      const d = coreRadius * (0.8 + rng() * 1.0);
      elements.push({
        shape: { type: "dot", radius: (0.15 + rng() * 0.12) * s },
        position: { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d },
        rotation: 0,
        scale: 1,
        color: colorSet.goldenBright,
        opacity: 0.4 + rng() * 0.25,
        zOffset: 1.75,
      });
    }
  }
}

/* ── main builder ────────────────────────────────────────────────── */

function buildWcBlushingPeonyElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const flowerCount = traitOr(ctx.traits, "flowerCount", 6);
  const petalCount = traitOr(ctx.traits, "petalCount", 7);
  const sparkleCount = traitOr(ctx.traits, "sparkleCount", 25);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const petalOpenness = Math.max(0, (openness - 0.08) / 0.92);
  const leafOpenness = Math.max(0, (openness - 0.03) / 0.97);

  const colors =
    ctx.colorVariationName && COLORS[ctx.colorVariationName]
      ? COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const clampedCount = Math.max(5, Math.min(7, Math.round(flowerCount)));
  const layout = FLOWER_LAYOUTS[clampedCount] ?? FLOWER_LAYOUTS[6]!;

  const baseX = 32;
  const baseY = 56;

  // === ATMOSPHERIC MIST ===
  if (openness > 0.08) {
    elements.push({
      shape: { type: "disc", radius: 26 + openness * 10 },
      position: { x: baseX, y: baseY },
      rotation: 0,
      scale: 1,
      color: colors.mist,
      opacity: 0.04 + openness * 0.04,
      zOffset: 0.01,
    });

    elements.push({
      shape: { type: "disc", radius: 20 + openness * 6 },
      position: { x: baseX, y: 20 },
      rotation: 0,
      scale: 1,
      color: colors.aura,
      opacity: 0.03 + openness * 0.03,
      zOffset: 0.015,
    });
  }

  // === BROAD SERRATED LEAVES ===
  if (leafOpenness > 0) {
    // Large framing leaves
    const leafCount = 8 + Math.floor(rng() * 4);
    for (let i = 0; i < leafCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const lx = baseX + (rng() - 0.5) * 22;
      const ly = baseY - 6 - rng() * 24;
      const angle = -Math.PI / 2 + side * (0.2 + rng() * 0.5);

      elements.push({
        shape: { type: "leaf", width: 3.5 + rng() * 2.5, length: 8 + rng() * 5 },
        position: { x: lx, y: ly },
        rotation: angle,
        scale: leafOpenness * (0.35 + rng() * 0.3),
        color: rng() > 0.4 ? colors.leaf : colors.leafDark,
        opacity: 0.4 + rng() * 0.12,
        zOffset: 0.1 + rng() * 0.04,
      });
    }

    // Lower foliage
    const baseFoliage = 4 + Math.floor(rng() * 3);
    for (let i = 0; i < baseFoliage; i++) {
      const lx = baseX + (rng() - 0.5) * 26;
      const ly = baseY - 2 - rng() * 6;
      elements.push({
        shape: { type: "leaf", width: 3 + rng() * 2, length: 6 + rng() * 4 },
        position: { x: lx, y: ly },
        rotation: -Math.PI / 2 + (rng() - 0.5) * 0.7,
        scale: leafOpenness * (0.3 + rng() * 0.2),
        color: colors.leafDark,
        opacity: 0.35 + rng() * 0.1,
        zOffset: 0.08,
      });
    }
  }

  // === STEMS + FLOWERS + BUDS ===
  for (let i = 0; i < layout.length; i++) {
    const pos = layout[i]!;
    const offsetX = (rng() - 0.5) * 2;
    const offsetY = (rng() - 0.5) * 2;
    const hx = pos.cx + offsetX;
    const hy = pos.cy + offsetY;

    // Stem
    const midX = (baseX + hx) / 2 + (rng() - 0.5) * 3;
    const midY = (baseY + hy) / 2 + (rng() - 0.5) * 2;

    elements.push({
      shape: {
        type: "stem",
        points: [
          [baseX + (rng() - 0.5) * 4, baseY],
          [midX, midY + 3],
          [midX + (hx - midX) * 0.3, midY - 1],
          [hx, hy + (pos.isBud ? 2 : 4)],
        ],
        thickness: 0.4 + openness * 0.2,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: colors.stem,
      opacity: 0.4 + openness * 0.15,
      zOffset: 0.12,
    });

    if (pos.isBud) {
      renderBud(elements, hx, hy, pos.size, petalOpenness, colors, rng);
    } else {
      const headPetalCount = Math.max(5, petalCount + Math.floor((rng() - 0.5) * 3));
      renderPeony(elements, hx, hy, headPetalCount, petalOpenness, pos.size, colors, rng);
    }
  }

  // === SPARKLE PARTICLES ===
  if (openness > 0.15) {
    const sparkleOpenness = Math.min(1, (openness - 0.15) / 0.55);
    const activeSparkles = Math.round(sparkleCount * sparkleOpenness);

    for (let i = 0; i < activeSparkles; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * 24 + 3;
      const sx = baseX + Math.cos(angle) * dist * 0.8 + (rng() - 0.5) * 8;
      const sy = 22 + Math.sin(angle) * dist * 1.1 + (rng() - 0.5) * 14;

      const roll = rng();
      const isLarge = roll < 0.12;
      const isMedium = roll < 0.32;

      const sparkleRadius = isLarge
        ? 0.65 + rng() * 0.4
        : isMedium
          ? 0.3 + rng() * 0.25
          : 0.12 + rng() * 0.18;

      elements.push({
        shape: { type: "dot", radius: sparkleRadius },
        position: { x: sx, y: sy },
        rotation: 0,
        scale: 1,
        color: isLarge ? colors.goldenBright : isMedium ? colors.goldenGlow : colors.sparkle,
        opacity: (isLarge ? 0.75 : isMedium ? 0.5 : 0.3) + rng() * 0.2,
        zOffset: 3.0 + rng() * 0.5,
      });

      if (isLarge || isMedium) {
        elements.push({
          shape: { type: "disc", radius: sparkleRadius * (isLarge ? 4.0 : 2.5) },
          position: { x: sx, y: sy },
          rotation: 0,
          scale: 1,
          color: colors.aura,
          opacity: (isLarge ? 0.06 : 0.04) + rng() * 0.03,
          zOffset: 2.9,
        });
      }
    }
  }

  return elements;
}

/* ── variant definition ──────────────────────────────────────────── */

export const wcBlushingPeony: PlantVariant = {
  id: "wc-blushing-peony",
  name: "Blushing Peony",
  description:
    "Soft layered peonies with warm golden glowing centres, their concentric cupped petals surrounding luminous cores amid drifting sparkles and purple mist",
  rarity: 0.07,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      flowerCount: { signal: "entropy", range: [5, 7], default: 6, round: true },
      petalCount: { signal: "spread", range: [5, 9], default: 7, round: true },
      sparkleCount: { signal: "growth", range: [16, 34], default: 25, round: true },
    },
  },
  colorVariations: [
    {
      name: "roseglow",
      weight: 1.0,
      palettes: { bloom: ["#E8A0B8", "#F0B8C8", "#4A5838"] },
    },
    {
      name: "sunburst",
      weight: 0.8,
      palettes: { bloom: ["#D8B848", "#E8D060", "#4A5838"] },
    },
    {
      name: "amethyst",
      weight: 0.8,
      palettes: { bloom: ["#A880C8", "#B898D8", "#484850"] },
    },
    {
      name: "white",
      weight: 0.8,
      palettes: { bloom: ["#E0D8D0", "#ECE8E0", "#4A5838"] },
    },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 380,
    clusterBonus: 1.7,
    maxClusterDensity: 5,
    reseedClusterChance: 0.55,
  },
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 14 },
      { name: "sprout", duration: 18 },
      { name: "bloom", duration: 52 },
      { name: "fade", duration: 20 },
    ],
    wcEffect: { layers: 4, opacity: 0.55, spread: 0.08, colorVariation: 0.06 },
    buildElements: buildWcBlushingPeonyElements,
  },
};
