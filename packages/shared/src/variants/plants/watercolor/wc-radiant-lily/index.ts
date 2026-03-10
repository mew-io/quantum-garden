/**
 * Radiant Lily
 *
 * A cluster of luminous lily flowers that glow from within, their pointed
 * petals radiating warm pink light into the surrounding darkness. Each
 * flower has a brilliant white-pink center that bleeds outward through
 * translucent petals. Glowing magenta sparkle orbs drift around the
 * composition, adding to the otherworldly radiance. A purple-pink
 * atmospheric haze surrounds the plant.
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
    petalInner: string;
    petalOuter: string;
    center: string;
    glow: string;
    sparkle: string;
    aura: string;
    stem: string;
    leaf: string;
  }
> = {
  roseglow: {
    petalInner: "#F8C0D8",
    petalOuter: "#E888B8",
    center: "#FFF0F4",
    glow: "#FFD0E8",
    sparkle: "#F0A0D0",
    aura: "#D870B0",
    stem: "#5A6848",
    leaf: "#687850",
  },
  sapphire: {
    petalInner: "#B0D0F8",
    petalOuter: "#6898E0",
    center: "#F0F4FF",
    glow: "#C0D8FF",
    sparkle: "#80B0F0",
    aura: "#5078C8",
    stem: "#4A6858",
    leaf: "#587858",
  },
  sunburst: {
    petalInner: "#F8E8A0",
    petalOuter: "#E8C840",
    center: "#FFFDE8",
    glow: "#FFF0B0",
    sparkle: "#F0D870",
    aura: "#D0A820",
    stem: "#5A6848",
    leaf: "#687850",
  },
  amethyst: {
    petalInner: "#D0B0F0",
    petalOuter: "#A070D8",
    center: "#F4F0FF",
    glow: "#D8C0FF",
    sparkle: "#B888E8",
    aura: "#8050C0",
    stem: "#585868",
    leaf: "#606070",
  },
};

const DEFAULT_COLORS = COLORS.roseglow!;

/* ── per-flower layout positions ─────────────────────────────────── */

const FLOWER_LAYOUTS: Record<number, Array<{ cx: number; tipY: number; scale: number }>> = {
  3: [
    { cx: 24, tipY: 14, scale: 1.1 },
    { cx: 36, tipY: 10, scale: 1.2 },
    { cx: 44, tipY: 18, scale: 1.0 },
  ],
  4: [
    { cx: 22, tipY: 16, scale: 1.0 },
    { cx: 32, tipY: 8, scale: 1.2 },
    { cx: 40, tipY: 12, scale: 1.1 },
    { cx: 28, tipY: 22, scale: 0.9 },
  ],
  5: [
    { cx: 20, tipY: 16, scale: 1.0 },
    { cx: 30, tipY: 8, scale: 1.2 },
    { cx: 38, tipY: 12, scale: 1.1 },
    { cx: 44, tipY: 20, scale: 0.95 },
    { cx: 26, tipY: 24, scale: 0.85 },
  ],
  6: [
    { cx: 18, tipY: 18, scale: 0.95 },
    { cx: 26, tipY: 10, scale: 1.1 },
    { cx: 34, tipY: 6, scale: 1.25 },
    { cx: 42, tipY: 12, scale: 1.1 },
    { cx: 46, tipY: 22, scale: 0.9 },
    { cx: 22, tipY: 26, scale: 0.8 },
  ],
};

/* ── render a single lily flower ─────────────────────────────────── */

function renderLily(
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

  // === OUTER AURA GLOW (large soft disc behind the flower) ===
  if (petalOpenness > 0.2) {
    // Large diffuse aura
    elements.push({
      shape: { type: "disc", radius: (14 + rng() * 4) * petalOpenness * flowerScale },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.aura,
      opacity: 0.04 + petalOpenness * 0.04,
      zOffset: 0.6,
    });

    // Medium glow halo
    elements.push({
      shape: { type: "disc", radius: (10 + rng() * 2) * petalOpenness * flowerScale },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.glow,
      opacity: 0.06 + petalOpenness * 0.06,
      zOffset: 0.7,
    });
  }

  // === PETALS — pointed lily shape with inner glow ===
  for (let i = 0; i < petalCount; i++) {
    const angle = step * i + rng() * 0.12;
    const pl = (9 + rng() * 3) * petalOpenness * flowerScale;
    const pw = (2.8 + rng() * 1.0) * petalOpenness * flowerScale;

    // Outer petal layer (darker pink edge)
    elements.push({
      shape: { type: "petal", width: pw, length: pl, roundness: 0.25 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petalOuter,
      opacity: 0.65 + rng() * 0.15,
      zOffset: 1.0,
    });

    // Inner petal glow layer (brighter, slightly smaller — simulates light from center)
    elements.push({
      shape: { type: "petal", width: pw * 0.65, length: pl * 0.75, roundness: 0.3 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petalInner,
      opacity: 0.5 + petalOpenness * 0.25,
      zOffset: 1.1,
    });

    // Petal tip glow dot
    if (petalOpenness > 0.4) {
      const tipDist = pl * 0.8;
      elements.push({
        shape: { type: "dot", radius: (0.4 + rng() * 0.3) * flowerScale },
        position: {
          x: cx + Math.cos(angle) * tipDist,
          y: cy + Math.sin(angle) * tipDist,
        },
        rotation: 0,
        scale: 1,
        color: colorSet.glow,
        opacity: 0.25 + rng() * 0.2,
        zOffset: 1.5,
      });
    }
  }

  // === BRIGHT CENTER (white-pink core that radiates outward) ===
  if (petalOpenness > 0.15) {
    const coreRadius = (2.2 + petalOpenness * 1.5) * flowerScale;

    // Outer center glow
    elements.push({
      shape: { type: "disc", radius: coreRadius * 1.8 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.glow,
      opacity: 0.2 + petalOpenness * 0.15,
      zOffset: 2.0,
    });

    // Main bright center
    elements.push({
      shape: { type: "disc", radius: coreRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.center,
      opacity: 0.8 + petalOpenness * 0.15,
      zOffset: 2.1,
    });

    // Hot white inner core
    elements.push({
      shape: { type: "disc", radius: coreRadius * 0.45 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: "#FFFFFF",
      opacity: 0.6 + petalOpenness * 0.2,
      zOffset: 2.2,
    });

    // Stamen dots radiating from center
    const stamenCount = Math.floor(3 + petalOpenness * 3);
    for (let i = 0; i < stamenCount; i++) {
      const a = rng() * Math.PI * 2;
      const d = coreRadius * (0.6 + rng() * 0.8);
      elements.push({
        shape: { type: "dot", radius: (0.15 + rng() * 0.2) * flowerScale },
        position: { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d },
        rotation: 0,
        scale: 1,
        color: colorSet.center,
        opacity: 0.5 + rng() * 0.3,
        zOffset: 2.3,
      });
    }
  }
}

/* ── main builder ────────────────────────────────────────────────── */

function buildWcRadiantLilyElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  // Quantum-driven traits
  const flowerCount = traitOr(ctx.traits, "flowerCount", 4);
  const petalCount = traitOr(ctx.traits, "petalCount", 6);
  const sparkleCount = traitOr(ctx.traits, "sparkleCount", 20);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const petalOpenness = Math.max(0, (openness - 0.06) / 0.94);
  const leafOpenness = Math.max(0, (openness - 0.04) / 0.96);

  const colors =
    ctx.colorVariationName && COLORS[ctx.colorVariationName]
      ? COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  // Clamp flower count and get layout
  const clampedCount = Math.max(3, Math.min(6, Math.round(flowerCount)));
  const layout = FLOWER_LAYOUTS[clampedCount] ?? FLOWER_LAYOUTS[4]!;

  const baseX = 32;
  const baseY = 56;

  // === ATMOSPHERIC HAZE (purple-pink ground fog) ===
  if (openness > 0.1) {
    elements.push({
      shape: { type: "disc", radius: 20 + openness * 8 },
      position: { x: baseX, y: baseY - 4 },
      rotation: 0,
      scale: 1,
      color: colors.aura,
      opacity: 0.03 + openness * 0.02,
      zOffset: 0.01,
    });
  }

  // === BASE GRASS TUFTS ===
  if (openness > 0.02) {
    const grassCount = 6 + Math.floor(rng() * 4);
    for (let i = 0; i < grassCount; i++) {
      const gx = baseX + (rng() - 0.5) * 18;
      const gy = baseY - rng() * 3;
      const angle = (rng() - 0.5) * 0.7;
      const bladeLen = (3 + rng() * 5) * Math.min(openness * 2, 1);

      elements.push({
        shape: { type: "petal", width: 0.5 + rng() * 0.4, length: bladeLen, roundness: 0.2 },
        position: { x: gx, y: gy },
        rotation: -Math.PI / 2 + angle,
        scale: 1,
        color: colors.leaf,
        opacity: 0.4 + rng() * 0.15,
        zOffset: 0.05,
      });
    }
  }

  // === STEMS + FLOWERS ===
  for (let i = 0; i < clampedCount; i++) {
    const { cx: flowerCx, tipY, scale: layoutScale } = layout[i]!;

    // Per-flower seed variation
    const offsetX = (rng() - 0.5) * 2;
    const offsetY = (rng() - 0.5) * 2;
    const finalCx = flowerCx + offsetX;
    const finalTipY = tipY + offsetY;

    // Stem — thin curved line from base to flower
    const midX = (baseX + finalCx) / 2 + (rng() - 0.5) * 3;
    const midY = (baseY + finalTipY) / 2 + (rng() - 0.5) * 3;
    const ctrl1X = baseX + (midX - baseX) * 0.5 + (rng() - 0.5) * 2;
    const ctrl1Y = baseY - (baseY - midY) * 0.35;
    const ctrl2X = midX + (finalCx - midX) * 0.5 + (rng() - 0.5) * 1.5;
    const ctrl2Y = midY - (midY - finalTipY) * 0.3;

    elements.push({
      shape: {
        type: "stem",
        points: [
          [baseX, baseY],
          [ctrl1X, ctrl1Y],
          [midX, midY],
          [ctrl2X, ctrl2Y],
          [finalCx, finalTipY + 4],
        ],
        thickness: 0.35 + openness * 0.15,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: colors.stem,
      opacity: 0.5 + openness * 0.15,
      zOffset: 0.1,
    });

    // Leaves — 1-2 per stem
    if (leafOpenness > 0 && rng() > 0.2) {
      const leafT = 0.35 + rng() * 0.25;
      const leafX = baseX + (finalCx - baseX) * leafT + (rng() - 0.5) * 2;
      const leafY = baseY + (finalTipY - baseY) * leafT;
      const side = i % 2 === 0 ? 1 : -1;

      buildLeaf(
        elements,
        leafX,
        leafY,
        side * (0.4 + rng() * 0.4),
        (0.4 + rng() * 0.3) * leafOpenness,
        2.5,
        6,
        colors.leaf,
        0.45
      );
    }

    // Render lily flower
    renderLily(elements, finalCx, finalTipY, petalCount, petalOpenness, layoutScale, colors, rng);
  }

  // === SPARKLE ORB PARTICLES (glowing magenta orbs) ===
  if (openness > 0.12) {
    const sparkleOpenness = Math.min(1, (openness - 0.12) / 0.55);
    const activeSparkles = Math.round(sparkleCount * sparkleOpenness);

    for (let i = 0; i < activeSparkles; i++) {
      // Distribute in an elongated cloud around the plant
      const angle = rng() * Math.PI * 2;
      const dist = rng() * 24 + 2;
      const sx = baseX + Math.cos(angle) * dist * 0.75 + (rng() - 0.5) * 10;
      const sy = 30 + Math.sin(angle) * dist * 1.1 + (rng() - 0.5) * 12;

      // Three tiers of sparkle: large glowing orbs, medium, and tiny
      const roll = rng();
      const isLarge = roll < 0.12;
      const isMedium = roll < 0.35;

      const sparkleRadius = isLarge
        ? 0.7 + rng() * 0.5
        : isMedium
          ? 0.35 + rng() * 0.3
          : 0.12 + rng() * 0.2;

      // Sparkle core
      elements.push({
        shape: { type: "dot", radius: sparkleRadius },
        position: { x: sx, y: sy },
        rotation: 0,
        scale: 1,
        color: isLarge ? colors.glow : colors.sparkle,
        opacity: (isLarge ? 0.7 : isMedium ? 0.5 : 0.3) + rng() * 0.25,
        zOffset: 3.0 + rng() * 0.5,
      });

      // Glow halo behind larger sparkles
      if (isLarge || isMedium) {
        elements.push({
          shape: { type: "disc", radius: sparkleRadius * (isLarge ? 4.0 : 2.5) },
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

export const wcRadiantLily: PlantVariant = {
  id: "wc-radiant-lily",
  name: "Radiant Lily",
  description:
    "Luminous lily flowers that glow from within, their pointed petals radiating pink light through a haze of drifting sparkle orbs",
  rarity: 0.07,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      flowerCount: { signal: "entropy", range: [3, 6], default: 4, round: true },
      petalCount: { signal: "spread", range: [5, 8], default: 6, round: true },
      sparkleCount: { signal: "growth", range: [12, 28], default: 20, round: true },
    },
  },
  colorVariations: [
    {
      name: "roseglow",
      weight: 1.0,
      palettes: { bloom: ["#F8C0D8", "#E888B8", "#5A6848"] },
    },
    {
      name: "sapphire",
      weight: 0.8,
      palettes: { bloom: ["#B0D0F8", "#6898E0", "#4A6858"] },
    },
    {
      name: "sunburst",
      weight: 0.8,
      palettes: { bloom: ["#F8E8A0", "#E8C840", "#5A6848"] },
    },
    {
      name: "amethyst",
      weight: 0.8,
      palettes: { bloom: ["#D0B0F0", "#A070D8", "#585868"] },
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
    buildElements: buildWcRadiantLilyElements,
  },
};
