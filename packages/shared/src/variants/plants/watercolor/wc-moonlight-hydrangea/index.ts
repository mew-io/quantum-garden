/**
 * Moonlight Hydrangea
 *
 * A lush cluster of large, spherical hydrangea flower heads that
 * radiate soft moonlit glow. Each snowball-shaped head is packed
 * with dozens of tiny florets that catch and scatter light. Broad,
 * serrated hydrangea leaves frame the blooms while sparkle particles
 * drift through a lavender atmospheric haze.
 *
 * Category: watercolor (flowers / ethereal)
 * Rarity: 0.06
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, standardOpenness, traitOr } from "../_helpers";

/* ── colour palettes ─────────────────────────────────────────────── */

const COLORS: Record<
  string,
  {
    floretBase: string;
    floretMid: string;
    floretLight: string;
    floretGlow: string;
    center: string;
    sparkle: string;
    aura: string;
    mist: string;
    stem: string;
    leaf: string;
    leafDark: string;
  }
> = {
  white: {
    floretBase: "#D8D0C8",
    floretMid: "#E8E4DC",
    floretLight: "#F4F0EA",
    floretGlow: "#FFFFF4",
    center: "#FFFFFF",
    sparkle: "#F8F0E0",
    aura: "#C8B8D0",
    mist: "#B8A0C8",
    stem: "#4A5838",
    leaf: "#487038",
    leafDark: "#3A5828",
  },
  roseglow: {
    floretBase: "#D080A8",
    floretMid: "#E8A0C0",
    floretLight: "#F8C0D8",
    floretGlow: "#FFE0F0",
    center: "#FFF8FC",
    sparkle: "#F8B0D0",
    aura: "#B060A0",
    mist: "#C870A8",
    stem: "#4A5838",
    leaf: "#487038",
    leafDark: "#3A5828",
  },
  sapphire: {
    floretBase: "#6888C8",
    floretMid: "#88A8E0",
    floretLight: "#A8C8F8",
    floretGlow: "#D0E0FF",
    center: "#F0F8FF",
    sparkle: "#90B8F0",
    aura: "#4868B0",
    mist: "#5878C0",
    stem: "#3A5040",
    leaf: "#406848",
    leafDark: "#305038",
  },
  sunburst: {
    floretBase: "#C8A838",
    floretMid: "#E0C050",
    floretLight: "#F0D878",
    floretGlow: "#FFF0A0",
    center: "#FFFCE0",
    sparkle: "#E8D058",
    aura: "#A88818",
    mist: "#B89828",
    stem: "#506038",
    leaf: "#507030",
    leafDark: "#3A5820",
  },
  amethyst: {
    floretBase: "#9068C0",
    floretMid: "#A888D8",
    floretLight: "#C0A8F0",
    floretGlow: "#E0D0FF",
    center: "#F8F0FF",
    sparkle: "#B898F0",
    aura: "#7050B0",
    mist: "#8060C0",
    stem: "#485048",
    leaf: "#486848",
    leafDark: "#385838",
  },
};

const DEFAULT_COLORS = COLORS.white!;

/* ── hydrangea head layout ───────────────────────────────────────── */

const HEAD_LAYOUTS: Record<number, Array<{ cx: number; cy: number; radius: number }>> = {
  4: [
    { cx: 26, cy: 16, radius: 8 },
    { cx: 38, cy: 12, radius: 9 },
    { cx: 32, cy: 22, radius: 7 },
    { cx: 42, cy: 22, radius: 7 },
  ],
  5: [
    { cx: 24, cy: 16, radius: 8 },
    { cx: 36, cy: 10, radius: 9 },
    { cx: 44, cy: 18, radius: 7.5 },
    { cx: 28, cy: 24, radius: 7 },
    { cx: 40, cy: 26, radius: 6.5 },
  ],
  6: [
    { cx: 22, cy: 18, radius: 7.5 },
    { cx: 32, cy: 10, radius: 9 },
    { cx: 42, cy: 14, radius: 8 },
    { cx: 26, cy: 26, radius: 7 },
    { cx: 38, cy: 24, radius: 7.5 },
    { cx: 46, cy: 26, radius: 6 },
  ],
};

/* ── render a single spherical hydrangea head ────────────────────── */

function renderHydrangeaHead(
  elements: WatercolorElement[],
  cx: number,
  cy: number,
  headRadius: number,
  bloomOpenness: number,
  colorSet: (typeof COLORS)[string],
  rng: () => number
): void {
  if (bloomOpenness <= 0) return;

  const r = headRadius * bloomOpenness;

  // === BACKGROUND GLOW behind the sphere ===
  if (bloomOpenness > 0.2) {
    // Outer atmospheric glow
    elements.push({
      shape: { type: "disc", radius: r * 1.8 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.aura,
      opacity: 0.06 + bloomOpenness * 0.05,
      zOffset: 0.6,
    });

    // Warm inner glow sphere
    elements.push({
      shape: { type: "disc", radius: r * 1.3 },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.floretGlow,
      opacity: 0.08 + bloomOpenness * 0.06,
      zOffset: 0.65,
    });
  }

  // === BASE SPHERE — solid foundation disc ===
  elements.push({
    shape: { type: "disc", radius: r },
    position: { x: cx, y: cy },
    rotation: 0,
    scale: 1,
    color: colorSet.floretBase,
    opacity: 0.35 + bloomOpenness * 0.15,
    zOffset: 0.7,
  });

  // === FLORET CLUSTERS — dots packed across the sphere surface ===
  // Outer ring of florets (at the edge of the sphere)
  const outerFloretCount = 8 + Math.floor(rng() * 4);
  for (let i = 0; i < outerFloretCount; i++) {
    const angle = (i / outerFloretCount) * Math.PI * 2 + (rng() - 0.5) * 0.3;
    const dist = r * (0.6 + rng() * 0.3);
    const fx = cx + Math.cos(angle) * dist;
    const fy = cy + Math.sin(angle) * dist;
    const floretR = (0.8 + rng() * 0.6) * bloomOpenness;

    elements.push({
      shape: { type: "dot", radius: floretR },
      position: { x: fx, y: fy },
      rotation: 0,
      scale: 1,
      color: colorSet.floretMid,
      opacity: 0.35 + rng() * 0.15,
      zOffset: 0.8 + rng() * 0.05,
    });
  }

  // Middle ring
  const midFloretCount = 6 + Math.floor(rng() * 3);
  for (let i = 0; i < midFloretCount; i++) {
    const angle = (i / midFloretCount) * Math.PI * 2 + (rng() - 0.5) * 0.4;
    const dist = r * (0.25 + rng() * 0.3);
    const fx = cx + Math.cos(angle) * dist;
    const fy = cy + Math.sin(angle) * dist;
    const floretR = (0.7 + rng() * 0.5) * bloomOpenness;

    elements.push({
      shape: { type: "dot", radius: floretR },
      position: { x: fx, y: fy },
      rotation: 0,
      scale: 1,
      color: colorSet.floretLight,
      opacity: 0.35 + rng() * 0.2,
      zOffset: 0.85 + rng() * 0.05,
    });
  }

  // === SMALL PETAL DETAILS on surface ===
  const petalDetailCount = 6 + Math.floor(rng() * 4);
  for (let i = 0; i < petalDetailCount; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = r * (0.3 + rng() * 0.55);
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist;

    elements.push({
      shape: {
        type: "petal",
        width: (0.6 + rng() * 0.5) * bloomOpenness,
        length: (0.8 + rng() * 0.6) * bloomOpenness,
        roundness: 0.85,
      },
      position: { x: px, y: py },
      rotation: angle + (rng() - 0.5) * 0.8,
      scale: 1,
      color: rng() > 0.5 ? colorSet.floretLight : colorSet.floretMid,
      opacity: 0.2 + rng() * 0.15,
      zOffset: 0.9 + rng() * 0.05,
    });
  }

  // === BRIGHT CENTER HIGHLIGHT (top-lit look) ===
  if (bloomOpenness > 0.2) {
    // Offset slightly upward to simulate top-lighting
    const highlightY = cy - r * 0.2;

    elements.push({
      shape: { type: "disc", radius: r * 0.55 },
      position: { x: cx, y: highlightY },
      rotation: 0,
      scale: 1,
      color: colorSet.floretGlow,
      opacity: 0.2 + bloomOpenness * 0.15,
      zOffset: 0.95,
    });

    elements.push({
      shape: { type: "disc", radius: r * 0.25 },
      position: { x: cx, y: highlightY },
      rotation: 0,
      scale: 1,
      color: colorSet.center,
      opacity: 0.25 + bloomOpenness * 0.2,
      zOffset: 1.0,
    });
  }

  // === EDGE GLOW DOTS ===
  if (bloomOpenness > 0.4) {
    const edgeCount = 4 + Math.floor(rng() * 3);
    for (let i = 0; i < edgeCount; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = r * (0.85 + rng() * 0.15);
      elements.push({
        shape: { type: "dot", radius: (0.2 + rng() * 0.2) * bloomOpenness },
        position: { x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist },
        rotation: 0,
        scale: 1,
        color: colorSet.floretGlow,
        opacity: 0.3 + rng() * 0.2,
        zOffset: 1.05,
      });
    }
  }
}

/* ── main builder ────────────────────────────────────────────────── */

function buildWcMoonlightHydrangeaElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const headCount = traitOr(ctx.traits, "headCount", 5);
  const sparkleCount = traitOr(ctx.traits, "sparkleCount", 25);
  const leafDensity = traitOr(ctx.traits, "leafDensity", 10);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const bloomOpenness = Math.max(0, (openness - 0.08) / 0.92);
  const leafOpenness = Math.max(0, (openness - 0.03) / 0.97);

  const colors =
    ctx.colorVariationName && COLORS[ctx.colorVariationName]
      ? COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const clampedCount = Math.max(4, Math.min(6, Math.round(headCount)));
  const layout = HEAD_LAYOUTS[clampedCount] ?? HEAD_LAYOUTS[5]!;

  const baseX = 32;
  const baseY = 56;

  // === ATMOSPHERIC HAZE ===
  if (openness > 0.08) {
    // Lavender mist behind and below
    elements.push({
      shape: { type: "disc", radius: 26 + openness * 10 },
      position: { x: baseX, y: baseY },
      rotation: 0,
      scale: 1,
      color: colors.mist,
      opacity: 0.04 + openness * 0.04,
      zOffset: 0.01,
    });

    // Upper ambient glow
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

  // === BROAD HYDRANGEA LEAVES ===
  if (leafOpenness > 0) {
    const activeLeaves = Math.max(6, Math.round(leafDensity));

    for (let i = 0; i < activeLeaves; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const lx = baseX + (rng() - 0.5) * 20;
      const ly = baseY - 6 - rng() * 22;
      const angle = -Math.PI / 2 + side * (0.2 + rng() * 0.5);

      // Large serrated hydrangea leaf
      elements.push({
        shape: { type: "leaf", width: 4 + rng() * 3, length: 8 + rng() * 5 },
        position: { x: lx, y: ly },
        rotation: angle,
        scale: leafOpenness * (0.4 + rng() * 0.3),
        color: rng() > 0.4 ? colors.leaf : colors.leafDark,
        opacity: 0.4 + rng() * 0.12,
        zOffset: 0.15 + rng() * 0.05,
      });
    }

    // Lower foliage / small leaves at base
    const baseFoliage = 4 + Math.floor(rng() * 3);
    for (let i = 0; i < baseFoliage; i++) {
      const lx = baseX + (rng() - 0.5) * 24;
      const ly = baseY - 2 - rng() * 6;
      const angle = -Math.PI / 2 + (rng() - 0.5) * 0.8;

      elements.push({
        shape: { type: "leaf", width: 2.5 + rng() * 2, length: 5 + rng() * 4 },
        position: { x: lx, y: ly },
        rotation: angle,
        scale: leafOpenness * (0.3 + rng() * 0.2),
        color: colors.leafDark,
        opacity: 0.35 + rng() * 0.1,
        zOffset: 0.1,
      });
    }
  }

  // === STEMS ===
  for (let i = 0; i < clampedCount; i++) {
    const head = layout[i]!;
    const offsetX = (rng() - 0.5) * 2;
    const offsetY = (rng() - 0.5) * 2;
    const hx = head.cx + offsetX;
    const hy = head.cy + offsetY;

    const midX = (baseX + hx) / 2 + (rng() - 0.5) * 3;
    const midY = (baseY + hy) / 2 + (rng() - 0.5) * 2;

    elements.push({
      shape: {
        type: "stem",
        points: [
          [baseX + (rng() - 0.5) * 4, baseY],
          [midX, midY + 3],
          [midX + (hx - midX) * 0.3, midY - 1],
          [hx, hy + head.radius * bloomOpenness * 0.5],
        ],
        thickness: 0.45 + openness * 0.2,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: colors.stem,
      opacity: 0.45 + openness * 0.15,
      zOffset: 0.12,
    });

    // Leaf pair near each flower head
    if (leafOpenness > 0.3) {
      for (let side = -1; side <= 1; side += 2) {
        const leafY = hy + head.radius * bloomOpenness * 0.6 + rng() * 3;
        elements.push({
          shape: { type: "leaf", width: 2.5 + rng() * 1.5, length: 5 + rng() * 3 },
          position: { x: hx + side * (2 + rng() * 2), y: leafY },
          rotation: -Math.PI / 2 + side * (0.4 + rng() * 0.3),
          scale: leafOpenness * (0.3 + rng() * 0.2),
          color: colors.leaf,
          opacity: 0.35 + rng() * 0.1,
          zOffset: 0.2,
        });
      }
    }

    // === HYDRANGEA FLOWER HEAD ===
    renderHydrangeaHead(elements, hx, hy, head.radius, bloomOpenness, colors, rng);
  }

  // === SMALL BACKGROUND HYDRANGEA CLUSTERS (depth) ===
  if (bloomOpenness > 0.3) {
    const bgCount = 2 + Math.floor(rng() * 2);
    for (let i = 0; i < bgCount; i++) {
      const bx = baseX + (rng() - 0.5) * 30;
      const by = baseY - 4 - rng() * 8;

      // Small, faded background cluster
      elements.push({
        shape: { type: "disc", radius: (3 + rng() * 2) * bloomOpenness },
        position: { x: bx, y: by },
        rotation: 0,
        scale: 1,
        color: colors.floretBase,
        opacity: 0.12 + bloomOpenness * 0.08,
        zOffset: 0.3,
      });

      // Floret dots
      const bgFlorets = 3 + Math.floor(rng() * 3);
      for (let j = 0; j < bgFlorets; j++) {
        const fa = rng() * Math.PI * 2;
        const fd = 1.5 + rng() * 1.5;
        elements.push({
          shape: { type: "dot", radius: (0.3 + rng() * 0.3) * bloomOpenness },
          position: { x: bx + Math.cos(fa) * fd, y: by + Math.sin(fa) * fd },
          rotation: 0,
          scale: 1,
          color: colors.floretMid,
          opacity: 0.15 + rng() * 0.1,
          zOffset: 0.32,
        });
      }
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
      const sy = 20 + Math.sin(angle) * dist * 1.1 + (rng() - 0.5) * 14;

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
        color: isLarge ? colors.center : isMedium ? colors.floretGlow : colors.sparkle,
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
          opacity: (isLarge ? 0.07 : 0.04) + rng() * 0.03,
          zOffset: 2.9,
        });
      }
    }
  }

  return elements;
}

/* ── variant definition ──────────────────────────────────────────── */

export const wcMoonlightHydrangea: PlantVariant = {
  id: "wc-moonlight-hydrangea",
  name: "Moonlight Hydrangea",
  description:
    "Lush spherical hydrangea heads packed with tiny glowing florets, radiating soft moonlit luminance amid broad green leaves and drifting sparkles",
  rarity: 0.06,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      headCount: { signal: "entropy", range: [4, 6], default: 5, round: true },
      sparkleCount: { signal: "growth", range: [15, 35], default: 25, round: true },
      leafDensity: { signal: "spread", range: [6, 14], default: 10, round: true },
    },
  },
  colorVariations: [
    {
      name: "white",
      weight: 1.0,
      palettes: { bloom: ["#D8D0C8", "#E8E4DC", "#4A5838"] },
    },
    {
      name: "roseglow",
      weight: 0.8,
      palettes: { bloom: ["#D080A8", "#E8A0C0", "#4A5838"] },
    },
    {
      name: "sapphire",
      weight: 0.8,
      palettes: { bloom: ["#6888C8", "#88A8E0", "#3A5040"] },
    },
    {
      name: "sunburst",
      weight: 0.8,
      palettes: { bloom: ["#C8A838", "#E0C050", "#506038"] },
    },
    {
      name: "amethyst",
      weight: 0.8,
      palettes: { bloom: ["#9068C0", "#A888D8", "#485048"] },
    },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 400,
    clusterBonus: 1.6,
    maxClusterDensity: 4,
    reseedClusterChance: 0.5,
  },
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 14 },
      { name: "sprout", duration: 18 },
      { name: "bloom", duration: 52 },
      { name: "fade", duration: 20 },
    ],
    wcEffect: { layers: 4, opacity: 0.55, spread: 0.08, colorVariation: 0.06 },
    buildElements: buildWcMoonlightHydrangeaElements,
  },
};
