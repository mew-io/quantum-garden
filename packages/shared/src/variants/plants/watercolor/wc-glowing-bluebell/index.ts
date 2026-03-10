/**
 * Glowing Bluebell
 *
 * Pendulous bell-shaped flowers hanging from gracefully arching stems,
 * each bell glowing from within with a cool luminescent light. The stems
 * curve upward from a lush base of elongated leaves, then bow under
 * the weight of the bell flowers. Bright sparkle particles drift
 * through the surrounding blue atmospheric haze.
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
    bellOuter: string;
    bellInner: string;
    center: string;
    glow: string;
    sparkle: string;
    aura: string;
    stem: string;
    leaf: string;
  }
> = {
  roseglow: {
    bellOuter: "#E8A0C0",
    bellInner: "#F8D0E0",
    center: "#FFF0F4",
    glow: "#FFD0E8",
    sparkle: "#F0A0D0",
    aura: "#D870B0",
    stem: "#5A7050",
    leaf: "#607850",
  },
  sapphire: {
    bellOuter: "#88B8E0",
    bellInner: "#C0D8F0",
    center: "#E8F0FF",
    glow: "#B0D0FF",
    sparkle: "#80B8F8",
    aura: "#4870B0",
    stem: "#506858",
    leaf: "#587858",
  },
  sunburst: {
    bellOuter: "#E0C860",
    bellInner: "#F0E8A8",
    center: "#FFFDE0",
    glow: "#FFF0A0",
    sparkle: "#F0D870",
    aura: "#C8A020",
    stem: "#5A7050",
    leaf: "#607850",
  },
  amethyst: {
    bellOuter: "#9878C8",
    bellInner: "#C8B0E8",
    center: "#F0E8FF",
    glow: "#D0B8F8",
    sparkle: "#B888E8",
    aura: "#7050A8",
    stem: "#586060",
    leaf: "#606868",
  },
};

const DEFAULT_COLORS = COLORS.sapphire!;

/* ── bell flower positions: each has a stem arc endpoint ──────────── */

const BELL_LAYOUTS: Record<number, Array<{ tipX: number; tipY: number; arcHeight: number }>> = {
  4: [
    { tipX: 22, tipY: 12, arcHeight: 18 },
    { tipX: 34, tipY: 8, arcHeight: 22 },
    { tipX: 42, tipY: 14, arcHeight: 16 },
    { tipX: 28, tipY: 18, arcHeight: 14 },
  ],
  5: [
    { tipX: 20, tipY: 14, arcHeight: 18 },
    { tipX: 30, tipY: 8, arcHeight: 24 },
    { tipX: 38, tipY: 10, arcHeight: 20 },
    { tipX: 44, tipY: 16, arcHeight: 16 },
    { tipX: 26, tipY: 20, arcHeight: 14 },
  ],
  6: [
    { tipX: 18, tipY: 16, arcHeight: 16 },
    { tipX: 26, tipY: 8, arcHeight: 24 },
    { tipX: 34, tipY: 6, arcHeight: 26 },
    { tipX: 42, tipY: 10, arcHeight: 20 },
    { tipX: 46, tipY: 18, arcHeight: 14 },
    { tipX: 22, tipY: 22, arcHeight: 12 },
  ],
  7: [
    { tipX: 16, tipY: 18, arcHeight: 16 },
    { tipX: 24, tipY: 10, arcHeight: 22 },
    { tipX: 32, tipY: 6, arcHeight: 28 },
    { tipX: 40, tipY: 8, arcHeight: 24 },
    { tipX: 46, tipY: 16, arcHeight: 16 },
    { tipX: 20, tipY: 24, arcHeight: 12 },
    { tipX: 36, tipY: 22, arcHeight: 14 },
  ],
};

/* ── render a single hanging bell flower ─────────────────────────── */

function renderBell(
  elements: WatercolorElement[],
  cx: number,
  cy: number,
  bellOpenness: number,
  bellScale: number,
  colorSet: (typeof COLORS)[string],
  rng: () => number
): void {
  if (bellOpenness <= 0) return;

  // === GLOW AURA behind the bell ===
  if (bellOpenness > 0.25) {
    // Large diffuse aura
    elements.push({
      shape: {
        type: "disc",
        radius: (10 + rng() * 3) * bellOpenness * bellScale,
      },
      position: { x: cx, y: cy + 2 },
      rotation: 0,
      scale: 1,
      color: colorSet.aura,
      opacity: 0.05 + bellOpenness * 0.05,
      zOffset: 0.7,
    });

    // Inner glow halo
    elements.push({
      shape: {
        type: "disc",
        radius: (6 + rng() * 2) * bellOpenness * bellScale,
      },
      position: { x: cx, y: cy + 1 },
      rotation: 0,
      scale: 1,
      color: colorSet.glow,
      opacity: 0.08 + bellOpenness * 0.08,
      zOffset: 0.75,
    });
  }

  // === BELL BODY — built from overlapping petals pointing downward ===
  // The bell is 3-4 petal shapes arranged in a slight fan, all pointing
  // downward (rotation ~PI/2) to create the drooping bell silhouette.

  const petalCount = 4 + Math.floor(rng() * 2); // 4-5 overlapping petals
  const bellWidth = (4.0 + rng() * 1.5) * bellOpenness * bellScale;
  const bellLength = (8.0 + rng() * 2.5) * bellOpenness * bellScale;
  const fanSpread = 0.35 * bellOpenness; // how wide the bell flares

  for (let i = 0; i < petalCount; i++) {
    const t = (i / (petalCount - 1)) * 2 - 1; // -1 to 1
    const angle = Math.PI / 2 + t * fanSpread + (rng() - 0.5) * 0.08;

    // Outer bell layer (darker)
    elements.push({
      shape: {
        type: "petal",
        width: bellWidth,
        length: bellLength,
        roundness: 0.8,
      },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.bellOuter,
      opacity: 0.55 + rng() * 0.15,
      zOffset: 1.0,
    });

    // Inner glow layer (brighter, slightly smaller)
    elements.push({
      shape: {
        type: "petal",
        width: bellWidth * 0.6,
        length: bellLength * 0.7,
        roundness: 0.9,
      },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.bellInner,
      opacity: 0.45 + bellOpenness * 0.2,
      zOffset: 1.1,
    });
  }

  // === BRIGHT INNER CORE (the glow source inside the bell) ===
  if (bellOpenness > 0.2) {
    const coreY = cy + bellLength * 0.25; // slightly inside the bell
    const coreRadius = (1.2 + bellOpenness * 1.0) * bellScale;

    // Outer core glow
    elements.push({
      shape: { type: "disc", radius: coreRadius * 2.2 },
      position: { x: cx, y: coreY },
      rotation: 0,
      scale: 1,
      color: colorSet.glow,
      opacity: 0.2 + bellOpenness * 0.15,
      zOffset: 1.5,
    });

    // Bright center
    elements.push({
      shape: { type: "disc", radius: coreRadius },
      position: { x: cx, y: coreY },
      rotation: 0,
      scale: 1,
      color: colorSet.center,
      opacity: 0.75 + bellOpenness * 0.2,
      zOffset: 1.6,
    });

    // Hot white point
    elements.push({
      shape: { type: "disc", radius: coreRadius * 0.4 },
      position: { x: cx, y: coreY },
      rotation: 0,
      scale: 1,
      color: "#FFFFFF",
      opacity: 0.5 + bellOpenness * 0.25,
      zOffset: 1.7,
    });
  }

  // === BELL RIM — small dots along the opening edge ===
  if (bellOpenness > 0.4) {
    const rimY = cy + bellLength * 0.85;
    const rimWidth = bellWidth * 0.9;
    const dotCount = 3 + Math.floor(rng() * 2);
    for (let i = 0; i < dotCount; i++) {
      const t = (i / (dotCount - 1)) * 2 - 1;
      elements.push({
        shape: { type: "dot", radius: (0.2 + rng() * 0.2) * bellScale },
        position: { x: cx + t * rimWidth * 0.6, y: rimY + (rng() - 0.5) },
        rotation: 0,
        scale: 1,
        color: colorSet.glow,
        opacity: 0.35 + rng() * 0.25,
        zOffset: 1.8,
      });
    }
  }
}

/* ── main builder ────────────────────────────────────────────────── */

function buildWcGlowingBluebellElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  // Quantum-driven traits
  const bellCount = traitOr(ctx.traits, "bellCount", 5);
  const bellSize = traitOr(ctx.traits, "bellSize", 1.0);
  const sparkleCount = traitOr(ctx.traits, "sparkleCount", 20);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const bellOpenness = Math.max(0, (openness - 0.1) / 0.9);
  const leafOpenness = Math.max(0, (openness - 0.03) / 0.97);

  const colors =
    ctx.colorVariationName && COLORS[ctx.colorVariationName]
      ? COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const clampedCount = Math.max(4, Math.min(7, Math.round(bellCount)));
  const layout = BELL_LAYOUTS[clampedCount] ?? BELL_LAYOUTS[5]!;

  const baseX = 32;
  const baseY = 56;

  // === ATMOSPHERIC HAZE ===
  if (openness > 0.1) {
    elements.push({
      shape: { type: "disc", radius: 22 + openness * 8 },
      position: { x: baseX, y: baseY - 6 },
      rotation: 0,
      scale: 1,
      color: colors.aura,
      opacity: 0.03 + openness * 0.02,
      zOffset: 0.01,
    });
  }

  // === LUSH BASE FOLIAGE (prominent elongated leaves) ===
  if (leafOpenness > 0) {
    const leafCount = 8 + Math.floor(rng() * 5); // 8-12 leaves
    for (let i = 0; i < leafCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const spreadAngle = (rng() - 0.5) * 1.2;
      const baseAngle = -Math.PI / 2 + side * (0.3 + rng() * 0.5) + spreadAngle * 0.3;
      const leafLen = (6 + rng() * 8) * leafOpenness;
      const leafW = 1.2 + rng() * 0.8;
      const lx = baseX + (rng() - 0.5) * 10;
      const ly = baseY - rng() * 4;

      elements.push({
        shape: {
          type: "petal",
          width: leafW,
          length: leafLen,
          roundness: 0.25,
        },
        position: { x: lx, y: ly },
        rotation: baseAngle,
        scale: 1,
        color: colors.leaf,
        opacity: 0.4 + rng() * 0.2,
        zOffset: 0.05 + rng() * 0.05,
      });
    }

    // A few darker accent leaves
    for (let i = 0; i < 3; i++) {
      const lx = baseX + (rng() - 0.5) * 8;
      const ly = baseY - 1 - rng() * 3;
      const angle = -Math.PI / 2 + (rng() - 0.5) * 0.8;

      elements.push({
        shape: {
          type: "leaf",
          width: 2.5 + rng(),
          length: 8 + rng() * 5,
        },
        position: { x: lx, y: ly },
        rotation: angle,
        scale: leafOpenness * (0.5 + rng() * 0.3),
        color: colors.stem,
        opacity: 0.35,
        zOffset: 0.08,
      });
    }
  }

  // === ARCHING STEMS + HANGING BELLS ===
  for (let i = 0; i < clampedCount; i++) {
    const { tipX, tipY, arcHeight } = layout[i]!;

    // Per-flower seed variation
    const offsetX = (rng() - 0.5) * 2;
    const offsetY = (rng() - 0.5) * 2;
    const finalTipX = tipX + offsetX;
    const finalTipY = tipY + offsetY;

    // The stem arcs upward from the base, peaks, then curves down to
    // the bell hanging point. We model this with a 5-point spline.
    const peakX = (baseX + finalTipX) / 2 + (rng() - 0.5) * 4;
    const peakY = finalTipY - arcHeight + (rng() - 0.5) * 3;

    // Control points for smooth arc
    const c1x = baseX + (peakX - baseX) * 0.4 + (rng() - 0.5) * 2;
    const c1y = baseY - (baseY - peakY) * 0.35;
    const c2x = peakX + (finalTipX - peakX) * 0.3 + (rng() - 0.5) * 1.5;
    const c2y = peakY + (rng() - 0.5) * 2;

    elements.push({
      shape: {
        type: "stem",
        points: [
          [baseX, baseY],
          [c1x, c1y],
          [peakX, peakY],
          [c2x, c2y],
          [finalTipX, finalTipY],
        ],
        thickness: 0.3 + openness * 0.15,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: colors.stem,
      opacity: 0.45 + openness * 0.15,
      zOffset: 0.1,
    });

    // Bell flower hanging from the stem tip
    const bScale = (0.8 + rng() * 0.3) * bellSize;
    renderBell(elements, finalTipX, finalTipY, bellOpenness, bScale, colors, rng);
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
      const isMedium = roll < 0.3;

      const sparkleRadius = isLarge
        ? 0.6 + rng() * 0.4
        : isMedium
          ? 0.3 + rng() * 0.25
          : 0.12 + rng() * 0.18;

      // Sparkle core
      elements.push({
        shape: { type: "dot", radius: sparkleRadius },
        position: { x: sx, y: sy },
        rotation: 0,
        scale: 1,
        color: isLarge ? colors.glow : colors.sparkle,
        opacity: (isLarge ? 0.7 : isMedium ? 0.45 : 0.3) + rng() * 0.2,
        zOffset: 3.0 + rng() * 0.5,
      });

      // Glow halo behind larger sparkles
      if (isLarge || isMedium) {
        elements.push({
          shape: {
            type: "disc",
            radius: sparkleRadius * (isLarge ? 4.0 : 2.5),
          },
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

export const wcGlowingBluebell: PlantVariant = {
  id: "wc-glowing-bluebell",
  name: "Glowing Bluebell",
  description:
    "Pendulous bell flowers hanging from gracefully arching stems, each bell glowing from within amid drifting sparkle particles",
  rarity: 0.07,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      bellCount: {
        signal: "entropy",
        range: [4, 7],
        default: 5,
        round: true,
      },
      bellSize: { signal: "spread", range: [0.7, 1.3], default: 1.0 },
      sparkleCount: {
        signal: "growth",
        range: [12, 28],
        default: 20,
        round: true,
      },
    },
  },
  colorVariations: [
    {
      name: "roseglow",
      weight: 0.8,
      palettes: { bloom: ["#E8A0C0", "#F8D0E0", "#5A7050"] },
    },
    {
      name: "sapphire",
      weight: 1.0,
      palettes: { bloom: ["#88B8E0", "#C0D8F0", "#506858"] },
    },
    {
      name: "sunburst",
      weight: 0.8,
      palettes: { bloom: ["#E0C860", "#F0E8A8", "#5A7050"] },
    },
    {
      name: "amethyst",
      weight: 0.8,
      palettes: { bloom: ["#9878C8", "#C8B0E8", "#586060"] },
    },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 350,
    clusterBonus: 1.6,
    maxClusterDensity: 5,
    reseedClusterChance: 0.5,
  },
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 14 },
      { name: "sprout", duration: 18 },
      { name: "bloom", duration: 50 },
      { name: "fade", duration: 20 },
    ],
    wcEffect: { layers: 4, opacity: 0.55, spread: 0.08, colorVariation: 0.06 },
    buildElements: buildWcGlowingBluebellElements,
  },
};
