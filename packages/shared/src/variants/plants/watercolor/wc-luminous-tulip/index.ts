/**
 * Luminous Tulip
 *
 * A cluster of translucent tulip flowers that glow from within, their
 * cupped petals forming chalice shapes that capture and radiate light.
 * Each tulip has overlapping petals with brighter edges and a luminous
 * interior. Stems rise relatively straight from a dense base of grass
 * and leaves. Sparkle particles drift through a violet atmospheric haze.
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
    petalBase: string;
    petalEdge: string;
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
    petalBase: "#D888B0",
    petalEdge: "#F0B0D0",
    petalGlow: "#FDD8EC",
    center: "#FFF0F4",
    halo: "#F0A8C8",
    sparkle: "#F8A0C8",
    aura: "#C860A0",
    stem: "#5A6848",
    leaf: "#607850",
  },
  sapphire: {
    petalBase: "#6890C8",
    petalEdge: "#98B8E8",
    petalGlow: "#C0D8F8",
    center: "#E8F0FF",
    halo: "#88B0E8",
    sparkle: "#80B0F0",
    aura: "#4868B0",
    stem: "#4A6858",
    leaf: "#587060",
  },
  sunburst: {
    petalBase: "#D0A830",
    petalEdge: "#E8C860",
    petalGlow: "#F8E8A0",
    center: "#FFFDE0",
    halo: "#F0D040",
    sparkle: "#F0D860",
    aura: "#C09818",
    stem: "#5A6838",
    leaf: "#607840",
  },
  amethyst: {
    petalBase: "#9060B8",
    petalEdge: "#B888D8",
    petalGlow: "#D4B0F0",
    center: "#F0E8FF",
    halo: "#A878D0",
    sparkle: "#B888E8",
    aura: "#6840A0",
    stem: "#505050",
    leaf: "#586058",
  },
};

const DEFAULT_COLORS = COLORS.amethyst!;

/* ── tulip layout positions ──────────────────────────────────────── */

const TULIP_LAYOUTS: Record<number, Array<{ cx: number; tipY: number }>> = {
  4: [
    { cx: 24, tipY: 14 },
    { cx: 34, tipY: 8 },
    { cx: 40, tipY: 16 },
    { cx: 30, tipY: 20 },
  ],
  5: [
    { cx: 22, tipY: 16 },
    { cx: 30, tipY: 8 },
    { cx: 38, tipY: 10 },
    { cx: 42, tipY: 18 },
    { cx: 26, tipY: 22 },
  ],
  6: [
    { cx: 20, tipY: 18 },
    { cx: 28, tipY: 10 },
    { cx: 34, tipY: 6 },
    { cx: 40, tipY: 12 },
    { cx: 44, tipY: 20 },
    { cx: 24, tipY: 24 },
  ],
};

/* ── render a single tulip flower ────────────────────────────────── */

function renderTulip(
  elements: WatercolorElement[],
  cx: number,
  cy: number,
  petalCount: number,
  petalOpenness: number,
  tulipScale: number,
  colorSet: (typeof COLORS)[string],
  rng: () => number
): void {
  if (petalOpenness <= 0) return;

  // === GLOW HALO behind the tulip ===
  if (petalOpenness > 0.2) {
    // Outer atmospheric glow
    elements.push({
      shape: { type: "disc", radius: (12 + rng() * 3) * petalOpenness * tulipScale },
      position: { x: cx, y: cy - 1 },
      rotation: 0,
      scale: 1,
      color: colorSet.aura,
      opacity: 0.05 + petalOpenness * 0.05,
      zOffset: 0.65,
    });

    // Inner warm halo
    elements.push({
      shape: { type: "disc", radius: (7 + rng() * 2) * petalOpenness * tulipScale },
      position: { x: cx, y: cy - 1 },
      rotation: 0,
      scale: 1,
      color: colorSet.halo,
      opacity: 0.07 + petalOpenness * 0.07,
      zOffset: 0.7,
    });
  }

  // === CUPPED TULIP PETALS ===
  // Tulip petals overlap in a cup shape, pointing upward.
  // We use 3-4 broader petals arranged in a tight fan pointing up (-PI/2).
  const cupSpread = 0.4 * petalOpenness; // how wide the cup opens
  const petalLen = (10 + rng() * 3) * petalOpenness * tulipScale;
  const petalW = (4.0 + rng() * 1.5) * petalOpenness * tulipScale;

  for (let i = 0; i < petalCount; i++) {
    const t = (i / (petalCount - 1)) * 2 - 1; // -1 to 1
    const angle = -Math.PI / 2 + t * cupSpread + (rng() - 0.5) * 0.06;

    // Base petal (darker, full size)
    elements.push({
      shape: { type: "petal", width: petalW, length: petalLen, roundness: 0.75 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petalBase,
      opacity: 0.5 + rng() * 0.15,
      zOffset: 1.0 + i * 0.02,
    });

    // Mid glow layer (translucent inner light)
    elements.push({
      shape: { type: "petal", width: petalW * 0.7, length: petalLen * 0.85, roundness: 0.8 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petalGlow,
      opacity: 0.35 + petalOpenness * 0.2,
      zOffset: 1.1 + i * 0.02,
    });

    // Bright edge highlight (lighter at the petal rim)
    elements.push({
      shape: { type: "petal", width: petalW * 1.05, length: petalLen * 0.5, roundness: 0.9 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petalEdge,
      opacity: 0.25 + petalOpenness * 0.2,
      zOffset: 1.15 + i * 0.02,
    });
  }

  // === LUMINOUS INTERIOR (the light source inside the cup) ===
  if (petalOpenness > 0.15) {
    const coreY = cy - petalLen * 0.15; // slightly inside the cup
    const coreRadius = (1.5 + petalOpenness * 1.2) * tulipScale;

    // Core glow spread
    elements.push({
      shape: { type: "disc", radius: coreRadius * 2.0 },
      position: { x: cx, y: coreY },
      rotation: 0,
      scale: 1,
      color: colorSet.halo,
      opacity: 0.18 + petalOpenness * 0.12,
      zOffset: 1.8,
    });

    // Bright center
    elements.push({
      shape: { type: "disc", radius: coreRadius },
      position: { x: cx, y: coreY },
      rotation: 0,
      scale: 1,
      color: colorSet.center,
      opacity: 0.7 + petalOpenness * 0.2,
      zOffset: 1.9,
    });

    // Hot white point
    elements.push({
      shape: { type: "disc", radius: coreRadius * 0.35 },
      position: { x: cx, y: coreY },
      rotation: 0,
      scale: 1,
      color: "#FFFFFF",
      opacity: 0.45 + petalOpenness * 0.25,
      zOffset: 2.0,
    });

    // Stamen dots inside the cup
    const stamenCount = Math.floor(2 + petalOpenness * 2);
    for (let i = 0; i < stamenCount; i++) {
      const a = rng() * Math.PI * 2;
      const d = coreRadius * (0.5 + rng() * 0.6);
      elements.push({
        shape: { type: "dot", radius: (0.12 + rng() * 0.15) * tulipScale },
        position: { x: cx + Math.cos(a) * d, y: coreY + Math.sin(a) * d },
        rotation: 0,
        scale: 1,
        color: colorSet.center,
        opacity: 0.4 + rng() * 0.3,
        zOffset: 2.1,
      });
    }
  }

  // === PETAL RIM GLOW DOTS ===
  if (petalOpenness > 0.4) {
    const rimCount = 3 + Math.floor(rng() * 2);
    for (let i = 0; i < rimCount; i++) {
      const t = (i / (rimCount - 1)) * 2 - 1;
      const rimAngle = -Math.PI / 2 + t * cupSpread * 1.1;
      const rimDist = petalLen * 0.88;
      elements.push({
        shape: { type: "dot", radius: (0.25 + rng() * 0.2) * tulipScale },
        position: {
          x: cx + Math.cos(rimAngle) * rimDist * 0.3,
          y: cy + Math.sin(rimAngle) * rimDist,
        },
        rotation: 0,
        scale: 1,
        color: colorSet.petalEdge,
        opacity: 0.35 + rng() * 0.25,
        zOffset: 1.5,
      });
    }
  }
}

/* ── main builder ────────────────────────────────────────────────── */

function buildWcLuminousTulipElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const tulipCount = traitOr(ctx.traits, "tulipCount", 5);
  const petalCount = traitOr(ctx.traits, "petalCount", 4);
  const sparkleCount = traitOr(ctx.traits, "sparkleCount", 20);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const petalOpenness = Math.max(0, (openness - 0.08) / 0.92);
  const leafOpenness = Math.max(0, (openness - 0.03) / 0.97);

  const colors =
    ctx.colorVariationName && COLORS[ctx.colorVariationName]
      ? COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const clampedCount = Math.max(4, Math.min(6, Math.round(tulipCount)));
  const layout = TULIP_LAYOUTS[clampedCount] ?? TULIP_LAYOUTS[5]!;

  const baseX = 32;
  const baseY = 56;

  // === ATMOSPHERIC HAZE ===
  if (openness > 0.08) {
    elements.push({
      shape: { type: "disc", radius: 24 + openness * 10 },
      position: { x: baseX, y: baseY - 2 },
      rotation: 0,
      scale: 1,
      color: colors.aura,
      opacity: 0.04 + openness * 0.03,
      zOffset: 0.01,
    });
  }

  // === DENSE BASE FOLIAGE ===
  if (leafOpenness > 0) {
    // Grass blades (many, dense)
    const grassCount = 10 + Math.floor(rng() * 6);
    for (let i = 0; i < grassCount; i++) {
      const gx = baseX + (rng() - 0.5) * 20;
      const gy = baseY - rng() * 4;
      const angle = -Math.PI / 2 + (rng() - 0.5) * 0.9;
      const bladeLen = (4 + rng() * 7) * Math.min(leafOpenness * 1.5, 1);

      elements.push({
        shape: { type: "petal", width: 0.6 + rng() * 0.5, length: bladeLen, roundness: 0.2 },
        position: { x: gx, y: gy },
        rotation: angle,
        scale: 1,
        color: colors.leaf,
        opacity: 0.35 + rng() * 0.2,
        zOffset: 0.04 + rng() * 0.04,
      });
    }

    // Broader tulip leaves (elongated, arching)
    const broadLeafCount = 4 + Math.floor(rng() * 3);
    for (let i = 0; i < broadLeafCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const lx = baseX + (rng() - 0.5) * 12;
      const ly = baseY - 1 - rng() * 3;
      const angle = -Math.PI / 2 + side * (0.2 + rng() * 0.4);

      elements.push({
        shape: { type: "leaf", width: 2.5 + rng() * 1.5, length: 10 + rng() * 6 },
        position: { x: lx, y: ly },
        rotation: angle,
        scale: leafOpenness * (0.4 + rng() * 0.3),
        color: colors.stem,
        opacity: 0.35 + rng() * 0.1,
        zOffset: 0.06,
      });
    }
  }

  // === STEMS + TULIPS ===
  for (let i = 0; i < clampedCount; i++) {
    const { cx: tulipCx, tipY } = layout[i]!;

    const offsetX = (rng() - 0.5) * 2;
    const offsetY = (rng() - 0.5) * 2;
    const finalCx = tulipCx + offsetX;
    const finalTipY = tipY + offsetY;

    // Stems are relatively straight with slight curve
    const midX = (baseX + finalCx) / 2 + (rng() - 0.5) * 2;
    const midY = (baseY + finalTipY) / 2 + (rng() - 0.5) * 2;

    elements.push({
      shape: {
        type: "stem",
        points: [
          [baseX + (rng() - 0.5) * 3, baseY],
          [midX, midY + 4],
          [midX + (finalCx - midX) * 0.3, midY],
          [finalCx, finalTipY + 4],
        ],
        thickness: 0.4 + openness * 0.2,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: colors.stem,
      opacity: 0.5 + openness * 0.15,
      zOffset: 0.1,
    });

    // Tulip flower
    const tulipScale = 0.8 + rng() * 0.3;
    const headPetalCount = Math.max(3, petalCount + Math.floor((rng() - 0.5) * 2));

    renderTulip(
      elements,
      finalCx,
      finalTipY,
      headPetalCount,
      petalOpenness,
      tulipScale,
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
      const dist = rng() * 24 + 3;
      const sx = baseX + Math.cos(angle) * dist * 0.8 + (rng() - 0.5) * 8;
      const sy = 30 + Math.sin(angle) * dist * 1.1 + (rng() - 0.5) * 12;

      const roll = rng();
      const isLarge = roll < 0.12;
      const isMedium = roll < 0.32;

      const sparkleRadius = isLarge
        ? 0.6 + rng() * 0.4
        : isMedium
          ? 0.3 + rng() * 0.25
          : 0.12 + rng() * 0.18;

      elements.push({
        shape: { type: "dot", radius: sparkleRadius },
        position: { x: sx, y: sy },
        rotation: 0,
        scale: 1,
        color: isLarge ? colors.center : colors.sparkle,
        opacity: (isLarge ? 0.7 : isMedium ? 0.45 : 0.3) + rng() * 0.2,
        zOffset: 3.0 + rng() * 0.5,
      });

      if (isLarge || isMedium) {
        elements.push({
          shape: { type: "disc", radius: sparkleRadius * (isLarge ? 4.0 : 2.5) },
          position: { x: sx, y: sy },
          rotation: 0,
          scale: 1,
          color: colors.aura,
          opacity: (isLarge ? 0.07 : 0.04) + rng() * 0.03,
          zOffset: 2.9,
        });
      }
    }
  }

  return elements;
}

/* ── variant definition ──────────────────────────────────────────── */

export const wcLuminousTulip: PlantVariant = {
  id: "wc-luminous-tulip",
  name: "Luminous Tulip",
  description:
    "Translucent tulip flowers glowing from within, their cupped petals forming chalices of captured light amid drifting sparkles",
  rarity: 0.07,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      tulipCount: { signal: "entropy", range: [4, 6], default: 5, round: true },
      petalCount: { signal: "spread", range: [3, 5], default: 4, round: true },
      sparkleCount: { signal: "growth", range: [12, 28], default: 20, round: true },
    },
  },
  colorVariations: [
    {
      name: "roseglow",
      weight: 0.8,
      palettes: { bloom: ["#D888B0", "#F0B0D0", "#5A6848"] },
    },
    {
      name: "sapphire",
      weight: 0.8,
      palettes: { bloom: ["#6890C8", "#98B8E8", "#4A6858"] },
    },
    {
      name: "sunburst",
      weight: 0.8,
      palettes: { bloom: ["#D0A830", "#E8C860", "#5A6838"] },
    },
    {
      name: "amethyst",
      weight: 1.0,
      palettes: { bloom: ["#9060B8", "#B888D8", "#505050"] },
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
    buildElements: buildWcLuminousTulipElements,
  },
};
