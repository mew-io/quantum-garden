/**
 * Ember Peony
 *
 * A dramatic cluster of open, multi-layered peony flowers blazing with
 * inner light. Each bloom features three concentric rings of rounded
 * petals radiating outward with a fierce luminous core. Larger and
 * more complex than simpler flowers, the layered petals create depth
 * and a sense of smoldering intensity. Red atmospheric mist pools at
 * the base while sparkle particles drift through the crimson haze.
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
    petalGlow: string;
    center: string;
    halo: string;
    sparkle: string;
    aura: string;
    stem: string;
    leaf: string;
  }
> = {
  roseglow: {
    petalOuter: "#B01820",
    petalMid: "#D83038",
    petalInner: "#F05058",
    petalGlow: "#FF8888",
    center: "#FFE0D0",
    halo: "#E84048",
    sparkle: "#FF5050",
    aura: "#A01018",
    stem: "#4A3830",
    leaf: "#3A4A30",
  },
  sapphire: {
    petalOuter: "#2050A0",
    petalMid: "#3878D0",
    petalInner: "#60A0F0",
    petalGlow: "#90C0FF",
    center: "#D8E8FF",
    halo: "#4888E0",
    sparkle: "#5098F8",
    aura: "#1840A0",
    stem: "#384850",
    leaf: "#3A5048",
  },
  sunburst: {
    petalOuter: "#B88810",
    petalMid: "#D8A828",
    petalInner: "#F0C848",
    petalGlow: "#F8E080",
    center: "#FFFCE0",
    halo: "#E8B830",
    sparkle: "#F0D050",
    aura: "#A07808",
    stem: "#4A4830",
    leaf: "#485830",
  },
  amethyst: {
    petalOuter: "#6828A0",
    petalMid: "#8848C8",
    petalInner: "#A870E8",
    petalGlow: "#C8A0F8",
    center: "#F0E0FF",
    halo: "#9058D0",
    sparkle: "#A068F0",
    aura: "#5018A0",
    stem: "#403850",
    leaf: "#3A4848",
  },
};

const DEFAULT_COLORS = COLORS.roseglow!;

/* ── peony layout positions ──────────────────────────────────────── */

const PEONY_LAYOUTS: Record<number, Array<{ cx: number; tipY: number }>> = {
  6: [
    { cx: 22, tipY: 16 },
    { cx: 34, tipY: 8 },
    { cx: 44, tipY: 14 },
    { cx: 18, tipY: 24 },
    { cx: 30, tipY: 20 },
    { cx: 42, tipY: 24 },
  ],
  7: [
    { cx: 20, tipY: 18 },
    { cx: 30, tipY: 8 },
    { cx: 40, tipY: 12 },
    { cx: 46, tipY: 22 },
    { cx: 14, tipY: 26 },
    { cx: 26, tipY: 22 },
    { cx: 38, tipY: 26 },
  ],
  8: [
    { cx: 18, tipY: 16 },
    { cx: 28, tipY: 8 },
    { cx: 38, tipY: 6 },
    { cx: 46, tipY: 14 },
    { cx: 14, tipY: 24 },
    { cx: 24, tipY: 22 },
    { cx: 36, tipY: 20 },
    { cx: 44, tipY: 26 },
  ],
};

/* ── render a single peony flower ────────────────────────────────── */

function renderPeony(
  elements: WatercolorElement[],
  cx: number,
  cy: number,
  petalCount: number,
  petalOpenness: number,
  scale: number,
  colorSet: (typeof COLORS)[string],
  rng: () => number
): void {
  if (petalOpenness <= 0) return;

  // === GLOW HALO behind the peony ===
  if (petalOpenness > 0.2) {
    // Large outer atmospheric glow
    elements.push({
      shape: { type: "disc", radius: (16 + rng() * 4) * petalOpenness * scale },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.aura,
      opacity: 0.06 + petalOpenness * 0.06,
      zOffset: 0.65,
    });

    // Inner warm halo
    elements.push({
      shape: { type: "disc", radius: (10 + rng() * 2) * petalOpenness * scale },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.halo,
      opacity: 0.08 + petalOpenness * 0.08,
      zOffset: 0.7,
    });
  }

  // === OUTER RING — larger, darker petals spreading outward ===
  const outerCount = petalCount;
  const outerLen = (8 + rng() * 3) * petalOpenness * scale;
  const outerW = (4.5 + rng() * 1.5) * petalOpenness * scale;

  for (let i = 0; i < outerCount; i++) {
    const angle = (i / outerCount) * Math.PI * 2 + (rng() - 0.5) * 0.15 - Math.PI / 2;

    // Base outer petal
    elements.push({
      shape: { type: "petal", width: outerW, length: outerLen, roundness: 0.7 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petalOuter,
      opacity: 0.55 + rng() * 0.15,
      zOffset: 1.0 + rng() * 0.02,
    });

    // Glow layer on outer petals
    elements.push({
      shape: { type: "petal", width: outerW * 0.7, length: outerLen * 0.85, roundness: 0.75 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petalMid,
      opacity: 0.3 + petalOpenness * 0.15,
      zOffset: 1.05 + rng() * 0.02,
    });
  }

  // === MIDDLE RING — medium petals, rotated offset ===
  const midCount = Math.max(4, outerCount - 1);
  const midLen = (6 + rng() * 2) * petalOpenness * scale;
  const midW = (3.5 + rng() * 1.2) * petalOpenness * scale;
  const midOffset = Math.PI / outerCount;

  for (let i = 0; i < midCount; i++) {
    const angle = (i / midCount) * Math.PI * 2 + midOffset + (rng() - 0.5) * 0.2 - Math.PI / 2;

    elements.push({
      shape: { type: "petal", width: midW, length: midLen, roundness: 0.75 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petalMid,
      opacity: 0.5 + rng() * 0.15,
      zOffset: 1.15 + rng() * 0.02,
    });

    // Inner glow on mid petals
    elements.push({
      shape: { type: "petal", width: midW * 0.65, length: midLen * 0.8, roundness: 0.8 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petalInner,
      opacity: 0.35 + petalOpenness * 0.2,
      zOffset: 1.2 + rng() * 0.02,
    });
  }

  // === INNER RING — small, brightest petals ===
  const innerCount = Math.max(3, midCount - 1);
  const innerLen = (4 + rng() * 1.5) * petalOpenness * scale;
  const innerW = (2.5 + rng() * 1.0) * petalOpenness * scale;

  for (let i = 0; i < innerCount; i++) {
    const angle = (i / innerCount) * Math.PI * 2 + (rng() - 0.5) * 0.25 - Math.PI / 2;

    elements.push({
      shape: { type: "petal", width: innerW, length: innerLen, roundness: 0.8 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petalInner,
      opacity: 0.5 + rng() * 0.15,
      zOffset: 1.3 + rng() * 0.02,
    });

    elements.push({
      shape: { type: "petal", width: innerW * 0.6, length: innerLen * 0.75, roundness: 0.85 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petalGlow,
      opacity: 0.35 + petalOpenness * 0.2,
      zOffset: 1.35 + rng() * 0.02,
    });
  }

  // === BLAZING CENTER ===
  if (petalOpenness > 0.15) {
    const coreRadius = (1.8 + petalOpenness * 1.4) * scale;

    // Wide core glow spread
    elements.push({
      shape: { type: "disc", radius: coreRadius * 2.8 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.halo,
      opacity: 0.2 + petalOpenness * 0.12,
      zOffset: 1.8,
    });

    // Bright center disc
    elements.push({
      shape: { type: "disc", radius: coreRadius * 1.4 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.center,
      opacity: 0.6 + petalOpenness * 0.25,
      zOffset: 1.9,
    });

    // Hot white point
    elements.push({
      shape: { type: "disc", radius: coreRadius * 0.5 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: "#FFFFFF",
      opacity: 0.5 + petalOpenness * 0.3,
      zOffset: 2.0,
    });

    // Stamen dots around center
    const stamenCount = Math.floor(3 + petalOpenness * 3);
    for (let i = 0; i < stamenCount; i++) {
      const a = rng() * Math.PI * 2;
      const d = coreRadius * (0.6 + rng() * 0.8);
      elements.push({
        shape: { type: "dot", radius: (0.15 + rng() * 0.15) * scale },
        position: { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d },
        rotation: 0,
        scale: 1,
        color: colorSet.center,
        opacity: 0.5 + rng() * 0.3,
        zOffset: 2.1,
      });
    }
  }
}

/* ── main builder ────────────────────────────────────────────────── */

function buildWcEmberPeonyElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const flowerCount = traitOr(ctx.traits, "flowerCount", 7);
  const petalCount = traitOr(ctx.traits, "petalCount", 7);
  const sparkleCount = traitOr(ctx.traits, "sparkleCount", 28);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const petalOpenness = Math.max(0, (openness - 0.08) / 0.92);
  const leafOpenness = Math.max(0, (openness - 0.03) / 0.97);

  const colors =
    ctx.colorVariationName && COLORS[ctx.colorVariationName]
      ? COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const clampedCount = Math.max(6, Math.min(8, Math.round(flowerCount)));
  const layout = PEONY_LAYOUTS[clampedCount] ?? PEONY_LAYOUTS[7]!;

  const baseX = 32;
  const baseY = 56;

  // === RED ATMOSPHERIC MIST at the base ===
  if (openness > 0.08) {
    // Large foggy base
    elements.push({
      shape: { type: "disc", radius: 28 + openness * 12 },
      position: { x: baseX, y: baseY + 2 },
      rotation: 0,
      scale: 1,
      color: colors.aura,
      opacity: 0.05 + openness * 0.04,
      zOffset: 0.01,
    });

    // Brighter mist closer to base
    elements.push({
      shape: { type: "disc", radius: 18 + openness * 8 },
      position: { x: baseX, y: baseY },
      rotation: 0,
      scale: 1,
      color: colors.halo,
      opacity: 0.03 + openness * 0.03,
      zOffset: 0.02,
    });
  }

  // === DENSE BASE FOLIAGE ===
  if (leafOpenness > 0) {
    // Dark broad leaves at the base
    const broadLeafCount = 6 + Math.floor(rng() * 4);
    for (let i = 0; i < broadLeafCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const lx = baseX + (rng() - 0.5) * 16;
      const ly = baseY - 1 - rng() * 3;
      const angle = -Math.PI / 2 + side * (0.15 + rng() * 0.5);

      elements.push({
        shape: { type: "leaf", width: 3.0 + rng() * 2.0, length: 10 + rng() * 7 },
        position: { x: lx, y: ly },
        rotation: angle,
        scale: leafOpenness * (0.4 + rng() * 0.3),
        color: colors.leaf,
        opacity: 0.4 + rng() * 0.12,
        zOffset: 0.05 + rng() * 0.03,
      });
    }

    // Smaller grass-like filler
    const grassCount = 8 + Math.floor(rng() * 5);
    for (let i = 0; i < grassCount; i++) {
      const gx = baseX + (rng() - 0.5) * 20;
      const gy = baseY - rng() * 3;
      const angle = -Math.PI / 2 + (rng() - 0.5) * 0.8;
      const bladeLen = (3 + rng() * 5) * Math.min(leafOpenness * 1.5, 1);

      elements.push({
        shape: { type: "petal", width: 0.5 + rng() * 0.4, length: bladeLen, roundness: 0.2 },
        position: { x: gx, y: gy },
        rotation: angle,
        scale: 1,
        color: colors.stem,
        opacity: 0.3 + rng() * 0.2,
        zOffset: 0.04 + rng() * 0.03,
      });
    }
  }

  // === STEMS + PEONY FLOWERS ===
  for (let i = 0; i < clampedCount; i++) {
    const { cx: peonyCx, tipY } = layout[i]!;

    const offsetX = (rng() - 0.5) * 2;
    const offsetY = (rng() - 0.5) * 2;
    const finalCx = peonyCx + offsetX;
    const finalTipY = tipY + offsetY;

    // Thin stems with slight curve
    const midX = (baseX + finalCx) / 2 + (rng() - 0.5) * 3;
    const midY = (baseY + finalTipY) / 2 + (rng() - 0.5) * 2;

    elements.push({
      shape: {
        type: "stem",
        points: [
          [baseX + (rng() - 0.5) * 4, baseY],
          [midX, midY + 4],
          [midX + (finalCx - midX) * 0.3, midY],
          [finalCx, finalTipY + 3],
        ],
        thickness: 0.35 + openness * 0.2,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: colors.stem,
      opacity: 0.45 + openness * 0.15,
      zOffset: 0.1,
    });

    // Small leaf on each stem
    if (leafOpenness > 0.3) {
      const leafY = midY + 2 + rng() * 4;
      const leafSide = rng() > 0.5 ? 1 : -1;
      elements.push({
        shape: { type: "leaf", width: 1.5 + rng() * 1.0, length: 4 + rng() * 3 },
        position: { x: midX + leafSide * 1.5, y: leafY },
        rotation: -Math.PI / 2 + leafSide * (0.5 + rng() * 0.4),
        scale: leafOpenness * 0.6,
        color: colors.leaf,
        opacity: 0.35 + rng() * 0.1,
        zOffset: 0.12,
      });
    }

    // Peony flower
    const flowerScale = 0.75 + rng() * 0.35;
    const headPetalCount = Math.max(5, petalCount + Math.floor((rng() - 0.5) * 3));

    renderPeony(
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

  // === SPARKLE PARTICLES ===
  if (openness > 0.15) {
    const sparkleOpenness = Math.min(1, (openness - 0.15) / 0.55);
    const activeSparkles = Math.round(sparkleCount * sparkleOpenness);

    for (let i = 0; i < activeSparkles; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * 26 + 3;
      const sx = baseX + Math.cos(angle) * dist * 0.8 + (rng() - 0.5) * 10;
      const sy = 28 + Math.sin(angle) * dist * 1.1 + (rng() - 0.5) * 14;

      const roll = rng();
      const isLarge = roll < 0.14;
      const isMedium = roll < 0.35;

      const sparkleRadius = isLarge
        ? 0.7 + rng() * 0.45
        : isMedium
          ? 0.35 + rng() * 0.25
          : 0.12 + rng() * 0.18;

      elements.push({
        shape: { type: "dot", radius: sparkleRadius },
        position: { x: sx, y: sy },
        rotation: 0,
        scale: 1,
        color: isLarge ? colors.center : colors.sparkle,
        opacity: (isLarge ? 0.75 : isMedium ? 0.5 : 0.3) + rng() * 0.2,
        zOffset: 3.0 + rng() * 0.5,
      });

      // Glow halos around larger sparkles
      if (isLarge || isMedium) {
        elements.push({
          shape: { type: "disc", radius: sparkleRadius * (isLarge ? 4.5 : 2.8) },
          position: { x: sx, y: sy },
          rotation: 0,
          scale: 1,
          color: colors.aura,
          opacity: (isLarge ? 0.08 : 0.05) + rng() * 0.03,
          zOffset: 2.9,
        });
      }
    }
  }

  return elements;
}

/* ── variant definition ──────────────────────────────────────────── */

export const wcEmberPeony: PlantVariant = {
  id: "wc-ember-peony",
  name: "Ember Peony",
  description:
    "Multi-layered peony flowers blazing with inner fire, their concentric petal rings radiating crimson light through drifting embers and scarlet mist",
  rarity: 0.07,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      flowerCount: { signal: "entropy", range: [6, 8], default: 7, round: true },
      petalCount: { signal: "spread", range: [5, 9], default: 7, round: true },
      sparkleCount: { signal: "growth", range: [18, 36], default: 28, round: true },
    },
  },
  colorVariations: [
    {
      name: "roseglow",
      weight: 1.0,
      palettes: { bloom: ["#B01820", "#D83038", "#4A3830"] },
    },
    {
      name: "sapphire",
      weight: 0.8,
      palettes: { bloom: ["#2050A0", "#3878D0", "#384850"] },
    },
    {
      name: "sunburst",
      weight: 0.8,
      palettes: { bloom: ["#B88810", "#D8A828", "#4A4830"] },
    },
    {
      name: "amethyst",
      weight: 0.8,
      palettes: { bloom: ["#6828A0", "#8848C8", "#403850"] },
    },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 350,
    clusterBonus: 1.8,
    maxClusterDensity: 5,
    reseedClusterChance: 0.55,
  },
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 14 },
      { name: "sprout", duration: 18 },
      { name: "bloom", duration: 50 },
      { name: "fade", duration: 20 },
    ],
    wcEffect: { layers: 4, opacity: 0.55, spread: 0.08, colorVariation: 0.06 },
    buildElements: buildWcEmberPeonyElements,
  },
};
