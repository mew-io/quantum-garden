/**
 * Starfire Heath
 *
 * A dense, conical heath bush blanketed in dozens of tiny star-shaped
 * flowers that glow from their centres. The bush has thin, needle-like
 * dark green foliage creating a feathery texture. An extremely dense
 * field of warm golden sparkle particles drifts through and around
 * the bush like fairy lights. The green foliage stays constant —
 * only the small star flowers change colour across variations.
 *
 * Category: watercolor (shrubs / ethereal)
 * Rarity: 0.07
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, standardOpenness, traitOr } from "../_helpers";

/* ── colour palettes ─────────────────────────────────────────────── */

// Bush foliage always green
const BUSH_COLORS = {
  needleDark: "#2A3A20",
  needleMid: "#384A28",
  needleLight: "#486030",
  branchDark: "#3A3828",
};

const FLOWER_COLORS: Record<
  string,
  {
    starBase: string;
    starLight: string;
    starGlow: string;
    center: string;
    centerBright: string;
    aura: string;
    warmGlow: string;
  }
> = {
  white: {
    starBase: "#E0D8D0",
    starLight: "#F0EAE4",
    starGlow: "#FFFFF4",
    center: "#FFE8B0",
    centerBright: "#FFFCE0",
    aura: "#D0C0A0",
    warmGlow: "#F0D890",
  },
  roseglow: {
    starBase: "#D080A8",
    starLight: "#F0A0C0",
    starGlow: "#FFD0E8",
    center: "#FFE0C0",
    centerBright: "#FFF0E0",
    aura: "#C070A0",
    warmGlow: "#E898B8",
  },
  sunburst: {
    starBase: "#D0A838",
    starLight: "#E8C858",
    starGlow: "#F8E088",
    center: "#FFF8C0",
    centerBright: "#FFFCE0",
    aura: "#C09828",
    warmGlow: "#E0B840",
  },
  amethyst: {
    starBase: "#9868C0",
    starLight: "#B888D8",
    starGlow: "#D8B0F0",
    center: "#FFE8D0",
    centerBright: "#FFF0E0",
    aura: "#8058B0",
    warmGlow: "#A078C8",
  },
};

const DEFAULT_FLOWER = FLOWER_COLORS.white!;

/* ── render tiny star flower ─────────────────────────────────────── */

function renderStarFlower(
  elements: WatercolorElement[],
  cx: number,
  cy: number,
  scale: number,
  bloomOpenness: number,
  flowerColors: (typeof FLOWER_COLORS)[string],
  rng: () => number
): void {
  if (bloomOpenness <= 0) return;

  const s = scale * bloomOpenness;

  // Small glow behind star
  if (bloomOpenness > 0.3 && rng() > 0.3) {
    elements.push({
      shape: { type: "disc", radius: 2.0 * s },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: flowerColors.aura,
      opacity: 0.05 + bloomOpenness * 0.05,
      zOffset: 0.75,
    });
  }

  // Star petals (5-6 thin, pointed petals)
  const petalCount = 5 + (rng() > 0.5 ? 1 : 0);
  const petalLen = 1.6 * s;
  const petalW = 0.6 * s;
  const baseAngle = rng() * Math.PI * 2;

  for (let i = 0; i < petalCount; i++) {
    const angle = baseAngle + (i / petalCount) * Math.PI * 2;

    elements.push({
      shape: { type: "petal", width: petalW, length: petalLen, roundness: 0.4 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1,
      color: rng() > 0.4 ? flowerColors.starBase : flowerColors.starLight,
      opacity: 0.4 + rng() * 0.2,
      zOffset: 0.85 + rng() * 0.02,
    });
  }

  // Glowing center
  if (bloomOpenness > 0.2) {
    elements.push({
      shape: { type: "disc", radius: 0.6 * s },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: flowerColors.center,
      opacity: 0.5 + bloomOpenness * 0.25,
      zOffset: 0.95,
    });

    // Hot bright point
    elements.push({
      shape: { type: "dot", radius: 0.2 * s },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: flowerColors.centerBright,
      opacity: 0.5 + bloomOpenness * 0.3,
      zOffset: 1.0,
    });
  }
}

/* ── main builder ────────────────────────────────────────────────── */

function buildWcStarfireHeathElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const flowerCount = traitOr(ctx.traits, "flowerCount", 35);
  const sparkleCount = traitOr(ctx.traits, "sparkleCount", 45);
  const needleDensity = traitOr(ctx.traits, "needleDensity", 10);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const bloomOpenness = Math.max(0, (openness - 0.1) / 0.9);
  const leafOpenness = Math.max(0, (openness - 0.03) / 0.97);

  const flowerColors =
    ctx.colorVariationName && FLOWER_COLORS[ctx.colorVariationName]
      ? FLOWER_COLORS[ctx.colorVariationName]!
      : DEFAULT_FLOWER;

  // Bush shape: conical, centered at (32, 38), wider at bottom, narrow at top
  const bushCx = 32;
  const bushBaseY = 50;
  const bushTopY = 14;
  const bushBaseHalfW = 18;
  const bushTopHalfW = 6;

  // Helper: check if point is within the conical bush shape
  function inBush(x: number, y: number): boolean {
    const t = (y - bushTopY) / (bushBaseY - bushTopY); // 0=top, 1=bottom
    if (t < -0.05 || t > 1.05) return false;
    const halfW = bushTopHalfW + (bushBaseHalfW - bushTopHalfW) * Math.min(1, Math.max(0, t));
    return Math.abs(x - bushCx) < halfW;
  }

  // === WARM ATMOSPHERIC GLOW ===
  if (openness > 0.08) {
    elements.push({
      shape: { type: "disc", radius: 28 + openness * 10 },
      position: { x: bushCx, y: 34 },
      rotation: 0,
      scale: 1,
      color: flowerColors.warmGlow,
      opacity: 0.03 + openness * 0.03,
      zOffset: 0.01,
    });

    elements.push({
      shape: { type: "disc", radius: 20 + openness * 6 },
      position: { x: bushCx, y: 56 },
      rotation: 0,
      scale: 1,
      color: flowerColors.aura,
      opacity: 0.03 + openness * 0.025,
      zOffset: 0.015,
    });
  }

  // === BASE GROUND ===
  if (leafOpenness > 0) {
    // Ground grass
    const grassCount = 8 + Math.floor(rng() * 5);
    for (let i = 0; i < grassCount; i++) {
      const gx = bushCx + (rng() - 0.5) * 40;
      const gy = 52 + rng() * 6;
      const angle = -Math.PI / 2 + (rng() - 0.5) * 0.7;
      const bladeLen = (2 + rng() * 3) * Math.min(leafOpenness * 1.5, 1);

      elements.push({
        shape: { type: "petal", width: 0.3 + rng() * 0.25, length: bladeLen, roundness: 0.1 },
        position: { x: gx, y: gy },
        rotation: angle,
        scale: 1,
        color: BUSH_COLORS.needleDark,
        opacity: 0.3 + rng() * 0.12,
        zOffset: 0.03 + rng() * 0.02,
      });
    }

    // Ground flowers (fallen/scattered)
    if (bloomOpenness > 0.3) {
      const groundFlowerCount = 6 + Math.floor(rng() * 5);
      for (let i = 0; i < groundFlowerCount; i++) {
        const fx = bushCx + (rng() - 0.5) * 44;
        const fy = 52 + rng() * 7;

        elements.push({
          shape: { type: "dot", radius: 0.35 + rng() * 0.3 },
          position: { x: fx, y: fy },
          rotation: 0,
          scale: bloomOpenness,
          color: rng() > 0.5 ? flowerColors.starLight : flowerColors.starBase,
          opacity: 0.25 + rng() * 0.15,
          zOffset: 0.04,
        });
      }
    }
  }

  // === GREEN CONICAL BUSH ===
  if (leafOpenness > 0) {
    // Background bush mass — conical shape using overlapping discs
    const bushDiscs = [
      { x: bushCx, y: 20, r: 8 },
      { x: bushCx - 2, y: 26, r: 11 },
      { x: bushCx + 2, y: 26, r: 11 },
      { x: bushCx, y: 32, r: 14 },
      { x: bushCx - 3, y: 38, r: 15 },
      { x: bushCx + 3, y: 38, r: 15 },
      { x: bushCx, y: 44, r: 17 },
      { x: bushCx - 4, y: 48, r: 16 },
      { x: bushCx + 4, y: 48, r: 16 },
    ];

    const activeBushDiscs = Math.min(bushDiscs.length, Math.max(5, Math.round(needleDensity)));
    for (let i = 0; i < activeBushDiscs; i++) {
      const d = bushDiscs[i]!;
      elements.push({
        shape: { type: "disc", radius: d.r * leafOpenness },
        position: { x: d.x + (rng() - 0.5) * 2, y: d.y + (rng() - 0.5) * 1 },
        rotation: 0,
        scale: 1,
        color: BUSH_COLORS.needleDark,
        opacity: 0.22 + leafOpenness * 0.12,
        zOffset: 0.18 + rng() * 0.02,
      });
    }

    // Needle-like foliage detail (thin, pointed petals)
    const needleCount = 20 + Math.floor(rng() * 10);
    for (let i = 0; i < needleCount; i++) {
      // Distribute within conical shape
      const t = rng(); // 0=top, 1=bottom
      const y = bushTopY + t * (bushBaseY - bushTopY) + (rng() - 0.5) * 3;
      const halfW = bushTopHalfW + (bushBaseHalfW - bushTopHalfW) * t;
      const x = bushCx + (rng() - 0.5) * halfW * 1.6;

      if (!inBush(x, y)) continue;

      const angle = -Math.PI / 2 + (rng() - 0.5) * 1.2;
      const needleLen = (1.5 + rng() * 2.5) * Math.min(leafOpenness * 1.5, 1);

      elements.push({
        shape: { type: "petal", width: 0.2 + rng() * 0.15, length: needleLen, roundness: 0.1 },
        position: { x, y },
        rotation: angle,
        scale: 1,
        color: rng() > 0.4 ? BUSH_COLORS.needleMid : BUSH_COLORS.needleLight,
        opacity: 0.28 + rng() * 0.15,
        zOffset: 0.22 + rng() * 0.05,
      });
    }

    // Small branch structures
    const branchCount = 4 + Math.floor(rng() * 3);
    for (let i = 0; i < branchCount; i++) {
      const by = bushBaseY - 5 - rng() * 25;
      const bx = bushCx + (rng() - 0.5) * 10;

      elements.push({
        shape: {
          type: "stem",
          points: [
            [bushCx + (rng() - 0.5) * 3, bushBaseY],
            [bushCx + (rng() - 0.5) * 4, by + 10],
            [bx, by + 4],
            [bx + (rng() - 0.5) * 3, by],
          ],
          thickness: 0.2 + openness * 0.1,
        },
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        color: BUSH_COLORS.branchDark,
        opacity: 0.25 + openness * 0.1,
        zOffset: 0.15,
      });
    }
  }

  // === STAR FLOWERS covering the bush ===
  if (bloomOpenness > 0) {
    const activeFlowers = Math.max(20, Math.min(50, Math.round(flowerCount)));

    for (let i = 0; i < activeFlowers; i++) {
      // Distribute within conical shape
      const t = rng();
      const y = bushTopY + t * (bushBaseY - bushTopY) + (rng() - 0.5) * 2;
      const halfW = bushTopHalfW + (bushBaseHalfW - bushTopHalfW) * t;
      const x = bushCx + (rng() - 0.5) * halfW * 1.5;

      if (!inBush(x, y)) continue;

      // Flowers near top are slightly smaller
      const sizeScale = 0.6 + t * 0.4 + rng() * 0.2;

      renderStarFlower(elements, x, y, sizeScale, bloomOpenness, flowerColors, rng);
    }
  }

  // === SPARKLE PARTICLES (very dense warm golden) ===
  if (openness > 0.12) {
    const sparkleOpenness = Math.min(1, (openness - 0.12) / 0.5);
    const activeSparkles = Math.round(sparkleCount * sparkleOpenness);

    for (let i = 0; i < activeSparkles; i++) {
      // Distribute both inside and around the bush
      const angle = rng() * Math.PI * 2;
      const dist = rng() * 28 + 2;
      const sx = bushCx + Math.cos(angle) * dist * 0.7 + (rng() - 0.5) * 8;
      const sy = 14 + rng() * 44 + Math.sin(angle) * dist * 0.3;

      const roll = rng();
      const isLarge = roll < 0.14;
      const isMedium = roll < 0.38;

      const sparkleRadius = isLarge
        ? 0.7 + rng() * 0.5
        : isMedium
          ? 0.35 + rng() * 0.3
          : 0.12 + rng() * 0.2;

      // Warm golden sparkles (consistent)
      elements.push({
        shape: { type: "dot", radius: sparkleRadius },
        position: { x: sx, y: sy },
        rotation: 0,
        scale: 1,
        color: isLarge ? "#FFF8E0" : isMedium ? "#FFE0A0" : "#FFD080",
        opacity: (isLarge ? 0.8 : isMedium ? 0.55 : 0.35) + rng() * 0.18,
        zOffset: 3.0 + rng() * 0.5,
      });

      if (isLarge || isMedium) {
        elements.push({
          shape: { type: "disc", radius: sparkleRadius * (isLarge ? 4.5 : 2.8) },
          position: { x: sx, y: sy },
          rotation: 0,
          scale: 1,
          color: "#D0A040",
          opacity: (isLarge ? 0.08 : 0.04) + rng() * 0.03,
          zOffset: 2.9,
        });
      }
    }
  }

  return elements;
}

/* ── variant definition ──────────────────────────────────────────── */

export const wcStarfireHeath: PlantVariant = {
  id: "wc-starfire-heath",
  name: "Starfire Heath",
  description:
    "A dense conical heath bush covered in tiny star-shaped glowing flowers, surrounded by a dazzling field of warm golden sparkles like fairy lights at twilight",
  rarity: 0.07,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      flowerCount: { signal: "entropy", range: [20, 50], default: 35, round: true },
      sparkleCount: { signal: "growth", range: [30, 60], default: 45, round: true },
      needleDensity: { signal: "spread", range: [6, 12], default: 10, round: true },
    },
  },
  colorVariations: [
    {
      name: "white",
      weight: 1.0,
      palettes: { bloom: ["#E0D8D0", "#F0EAE4", "#384A28"] },
    },
    {
      name: "roseglow",
      weight: 0.8,
      palettes: { bloom: ["#D080A8", "#F0A0C0", "#384A28"] },
    },
    {
      name: "sunburst",
      weight: 0.8,
      palettes: { bloom: ["#D0A838", "#E8C858", "#384A28"] },
    },
    {
      name: "amethyst",
      weight: 0.8,
      palettes: { bloom: ["#9868C0", "#B888D8", "#384A28"] },
    },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 380,
    clusterBonus: 1.7,
    maxClusterDensity: 5,
    reseedClusterChance: 0.5,
  },
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 12 },
      { name: "sprout", duration: 16 },
      { name: "bloom", duration: 50 },
      { name: "fade", duration: 18 },
    ],
    wcEffect: { layers: 4, opacity: 0.55, spread: 0.08, colorVariation: 0.06 },
    buildElements: buildWcStarfireHeathElements,
  },
};
