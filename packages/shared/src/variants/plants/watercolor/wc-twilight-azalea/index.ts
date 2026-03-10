/**
 * Twilight Azalea
 *
 * A lush, dome-shaped azalea bush blanketed in simple five-petal
 * flowers that glow softly in the twilight. The dense green foliage
 * forms a rounded mound while dozens of blooms cover its surface,
 * each radiating gentle light from its center. Warm golden sparkle
 * particles drift throughout and around the bush. The green bush
 * shape remains constant — only the flower colour changes across
 * variations.
 *
 * Category: watercolor (shrubs / ethereal)
 * Rarity: 0.07
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, standardOpenness, traitOr } from "../_helpers";

/* ── colour palettes ─────────────────────────────────────────────── */

// Bush foliage is always green — only flower colours change
const BUSH_COLORS = {
  leafDark: "#2A4820",
  leafMid: "#3A6028",
  leafLight: "#4A7830",
  stem: "#3A5028",
  grass: "#3A5830",
};

const FLOWER_COLORS: Record<
  string,
  {
    petalBase: string;
    petalLight: string;
    petalGlow: string;
    center: string;
    centerGlow: string;
    sparkle: string;
    aura: string;
    warmGlow: string;
  }
> = {
  white: {
    petalBase: "#E0D8D0",
    petalLight: "#F0ECE6",
    petalGlow: "#FFFFF4",
    center: "#FFE8B0",
    centerGlow: "#FFF0C8",
    sparkle: "#FFE0A0",
    aura: "#D8C8A0",
    warmGlow: "#F0D890",
  },
  roseglow: {
    petalBase: "#D888B0",
    petalLight: "#F0A8C8",
    petalGlow: "#FFD0E8",
    center: "#FFE0C0",
    centerGlow: "#FFF0D8",
    sparkle: "#F8B0C8",
    aura: "#C880A8",
    warmGlow: "#E8A0B8",
  },
  sunburst: {
    petalBase: "#D0A838",
    petalLight: "#E8C858",
    petalGlow: "#F8E088",
    center: "#FFF8C0",
    centerGlow: "#FFFCE0",
    sparkle: "#F0D060",
    aura: "#C09828",
    warmGlow: "#E0B840",
  },
  amethyst: {
    petalBase: "#9868C0",
    petalLight: "#B888D8",
    petalGlow: "#D8B0F0",
    center: "#FFE8D0",
    centerGlow: "#FFF0E0",
    sparkle: "#B898E8",
    aura: "#8058B0",
    warmGlow: "#A078C8",
  },
};

const DEFAULT_FLOWER = FLOWER_COLORS.white!;

/* ── flower positions on the bush surface ────────────────────────── */

interface FlowerPos {
  x: number;
  y: number;
  scale: number;
}

function generateFlowerPositions(rng: () => number, count: number): FlowerPos[] {
  const flowers: FlowerPos[] = [];
  const bushCx = 32;
  const bushCy = 34;
  const bushRx = 18; // horizontal radius
  const bushRy = 14; // vertical radius (shorter, dome shape)

  for (let i = 0; i < count; i++) {
    // Distribute across the bush surface (front-facing dome)
    const angle = rng() * Math.PI * 2;
    const dist = rng() * 0.85; // stay within 85% of edge
    const x = bushCx + Math.cos(angle) * bushRx * dist + (rng() - 0.5) * 3;
    const y = bushCy + Math.sin(angle) * bushRy * dist + (rng() - 0.5) * 2;

    // Flowers near the top are slightly larger (closer to viewer)
    const yNorm = (y - (bushCy - bushRy)) / (bushRy * 2);
    const scale = 0.6 + (1 - yNorm) * 0.4 + rng() * 0.2;

    flowers.push({ x, y, scale });
  }

  // Sort by y so lower flowers are rendered first (behind)
  flowers.sort((a, b) => a.y - b.y);

  return flowers;
}

/* ── render a single 5-petal azalea flower ───────────────────────── */

function renderAzaleaFlower(
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

  // === GLOW BEHIND FLOWER ===
  if (bloomOpenness > 0.3) {
    elements.push({
      shape: { type: "disc", radius: 4.5 * s },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: flowerColors.aura,
      opacity: 0.06 + bloomOpenness * 0.06,
      zOffset: 0.8,
    });
  }

  // === 5 PETALS arranged radially ===
  const petalCount = 5;
  const petalLen = 3.2 * s;
  const petalW = 2.2 * s;
  const baseAngle = rng() * Math.PI * 2; // random rotation per flower

  for (let i = 0; i < petalCount; i++) {
    const angle = baseAngle + (i / petalCount) * Math.PI * 2;

    // Base petal
    elements.push({
      shape: { type: "petal", width: petalW, length: petalLen, roundness: 0.75 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1,
      color: flowerColors.petalBase,
      opacity: 0.45 + rng() * 0.15,
      zOffset: 0.9 + rng() * 0.02,
    });

    // Light inner petal
    elements.push({
      shape: { type: "petal", width: petalW * 0.65, length: petalLen * 0.8, roundness: 0.8 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1,
      color: flowerColors.petalLight,
      opacity: 0.3 + bloomOpenness * 0.2,
      zOffset: 0.95 + rng() * 0.02,
    });
  }

  // === GLOWING CENTER ===
  if (bloomOpenness > 0.2) {
    // Center glow spread
    elements.push({
      shape: { type: "disc", radius: 1.8 * s },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: flowerColors.centerGlow,
      opacity: 0.2 + bloomOpenness * 0.15,
      zOffset: 1.1,
    });

    // Bright center dot
    elements.push({
      shape: { type: "disc", radius: 0.8 * s },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: flowerColors.center,
      opacity: 0.5 + bloomOpenness * 0.25,
      zOffset: 1.15,
    });

    // Hot point
    elements.push({
      shape: { type: "disc", radius: 0.3 * s },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: "#FFFFFF",
      opacity: 0.4 + bloomOpenness * 0.2,
      zOffset: 1.2,
    });

    // Stamen dots
    const stamenCount = 2 + Math.floor(rng() * 2);
    for (let i = 0; i < stamenCount; i++) {
      const sa = rng() * Math.PI * 2;
      const sd = 0.5 * s + rng() * 0.5 * s;
      elements.push({
        shape: { type: "dot", radius: 0.12 * s },
        position: { x: cx + Math.cos(sa) * sd, y: cy + Math.sin(sa) * sd },
        rotation: 0,
        scale: 1,
        color: flowerColors.center,
        opacity: 0.4 + rng() * 0.2,
        zOffset: 1.18,
      });
    }
  }
}

/* ── main builder ────────────────────────────────────────────────── */

function buildWcTwilightAzaleaElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const flowerCount = traitOr(ctx.traits, "flowerCount", 18);
  const sparkleCount = traitOr(ctx.traits, "sparkleCount", 30);
  const bushDensity = traitOr(ctx.traits, "bushDensity", 8);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const bloomOpenness = Math.max(0, (openness - 0.1) / 0.9);
  const leafOpenness = Math.max(0, (openness - 0.03) / 0.97);

  const flowerColors =
    ctx.colorVariationName && FLOWER_COLORS[ctx.colorVariationName]
      ? FLOWER_COLORS[ctx.colorVariationName]!
      : DEFAULT_FLOWER;

  const bushCx = 32;
  const bushCy = 34;

  // === WARM ATMOSPHERIC GLOW ===
  if (openness > 0.08) {
    // Large warm ambient glow
    elements.push({
      shape: { type: "disc", radius: 28 + openness * 10 },
      position: { x: bushCx, y: bushCy },
      rotation: 0,
      scale: 1,
      color: flowerColors.warmGlow,
      opacity: 0.03 + openness * 0.03,
      zOffset: 0.01,
    });

    // Ground mist
    elements.push({
      shape: { type: "disc", radius: 22 + openness * 8 },
      position: { x: bushCx, y: 56 },
      rotation: 0,
      scale: 1,
      color: flowerColors.aura,
      opacity: 0.03 + openness * 0.025,
      zOffset: 0.015,
    });
  }

  // === BASE GRASS ===
  if (leafOpenness > 0) {
    const grassCount = 10 + Math.floor(rng() * 6);
    for (let i = 0; i < grassCount; i++) {
      const gx = bushCx + (rng() - 0.5) * 36;
      const gy = 52 + rng() * 6;
      const angle = -Math.PI / 2 + (rng() - 0.5) * 0.7;
      const bladeLen = (2 + rng() * 4) * Math.min(leafOpenness * 1.5, 1);

      elements.push({
        shape: { type: "petal", width: 0.4 + rng() * 0.3, length: bladeLen, roundness: 0.15 },
        position: { x: gx, y: gy },
        rotation: angle,
        scale: 1,
        color: BUSH_COLORS.grass,
        opacity: 0.3 + rng() * 0.15,
        zOffset: 0.03 + rng() * 0.02,
      });
    }

    // Fallen petals on the ground
    if (bloomOpenness > 0.3) {
      const fallenCount = 5 + Math.floor(rng() * 5);
      for (let i = 0; i < fallenCount; i++) {
        const px = bushCx + (rng() - 0.5) * 40;
        const py = 52 + rng() * 7;

        elements.push({
          shape: {
            type: "petal",
            width: 0.5 + rng() * 0.4,
            length: 0.8 + rng() * 0.5,
            roundness: 0.8,
          },
          position: { x: px, y: py },
          rotation: rng() * Math.PI * 2,
          scale: bloomOpenness * 0.6,
          color: rng() > 0.5 ? flowerColors.petalLight : flowerColors.petalBase,
          opacity: 0.2 + rng() * 0.12,
          zOffset: 0.04,
        });
      }
    }
  }

  // === GREEN BUSH DOME ===
  if (leafOpenness > 0) {
    const bushLayers = Math.max(5, Math.round(bushDensity));

    // Large background bush mass
    const bgDiscs = [
      { x: bushCx, y: bushCy, r: 17 },
      { x: bushCx - 6, y: bushCy + 2, r: 13 },
      { x: bushCx + 6, y: bushCy + 1, r: 13 },
      { x: bushCx - 3, y: bushCy - 4, r: 12 },
      { x: bushCx + 3, y: bushCy - 3, r: 12 },
    ];

    for (let i = 0; i < Math.min(bushLayers, bgDiscs.length); i++) {
      const d = bgDiscs[i]!;
      elements.push({
        shape: { type: "disc", radius: d.r * leafOpenness },
        position: { x: d.x + (rng() - 0.5) * 2, y: d.y + (rng() - 0.5) * 2 },
        rotation: 0,
        scale: 1,
        color: BUSH_COLORS.leafDark,
        opacity: 0.25 + leafOpenness * 0.15,
        zOffset: 0.2 + rng() * 0.02,
      });
    }

    // Detail leaf clusters across the bush
    const leafClusterCount = 12 + Math.floor(rng() * 6);
    for (let i = 0; i < leafClusterCount; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * 14;
      const lx = bushCx + Math.cos(angle) * dist * 0.95;
      const ly = bushCy + Math.sin(angle) * dist * 0.7;

      // Check within bush bounds
      const dx = (lx - bushCx) / 18;
      const dy = (ly - bushCy) / 14;
      if (dx * dx + dy * dy > 1) continue;

      elements.push({
        shape: { type: "leaf", width: 1.5 + rng() * 1.5, length: 3 + rng() * 2.5 },
        position: { x: lx, y: ly },
        rotation: rng() * Math.PI * 2,
        scale: leafOpenness * (0.35 + rng() * 0.25),
        color: rng() > 0.4 ? BUSH_COLORS.leafMid : BUSH_COLORS.leafLight,
        opacity: 0.3 + rng() * 0.15,
        zOffset: 0.25 + rng() * 0.05,
      });
    }

    // Edge leaves (extending slightly beyond the bush dome)
    const edgeLeafCount = 8 + Math.floor(rng() * 4);
    for (let i = 0; i < edgeLeafCount; i++) {
      const angle = rng() * Math.PI * 2;
      const lx = bushCx + Math.cos(angle) * 16 + (rng() - 0.5) * 3;
      const ly = bushCy + Math.sin(angle) * 12 + (rng() - 0.5) * 2;

      elements.push({
        shape: { type: "leaf", width: 2 + rng() * 1.5, length: 4 + rng() * 3 },
        position: { x: lx, y: ly },
        rotation: angle + (rng() - 0.5) * 0.5,
        scale: leafOpenness * (0.3 + rng() * 0.2),
        color: rng() > 0.5 ? BUSH_COLORS.leafMid : BUSH_COLORS.leafDark,
        opacity: 0.3 + rng() * 0.12,
        zOffset: 0.3,
      });
    }
  }

  // === AZALEA FLOWERS covering the bush surface ===
  if (bloomOpenness > 0) {
    const activeFlowers = Math.max(12, Math.min(24, Math.round(flowerCount)));
    const flowerPositions = generateFlowerPositions(rng, activeFlowers);

    for (const fp of flowerPositions) {
      // Only render if within bush dome shape
      const dx = (fp.x - bushCx) / 18;
      const dy = (fp.y - bushCy) / 14;
      if (dx * dx + dy * dy > 0.95) continue;

      renderAzaleaFlower(elements, fp.x, fp.y, fp.scale, bloomOpenness, flowerColors, rng);
    }
  }

  // === SPARKLE PARTICLES (warm golden) ===
  if (openness > 0.15) {
    const sparkleOpenness = Math.min(1, (openness - 0.15) / 0.55);
    const activeSparkles = Math.round(sparkleCount * sparkleOpenness);

    for (let i = 0; i < activeSparkles; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * 26 + 3;
      const sx = bushCx + Math.cos(angle) * dist * 0.85 + (rng() - 0.5) * 8;
      const sy = bushCy + Math.sin(angle) * dist * 0.8 + (rng() - 0.5) * 10;

      const roll = rng();
      const isLarge = roll < 0.12;
      const isMedium = roll < 0.35;

      const sparkleRadius = isLarge
        ? 0.7 + rng() * 0.45
        : isMedium
          ? 0.35 + rng() * 0.25
          : 0.12 + rng() * 0.18;

      // Warm golden sparkles (consistent across color variations)
      elements.push({
        shape: { type: "dot", radius: sparkleRadius },
        position: { x: sx, y: sy },
        rotation: 0,
        scale: 1,
        color: isLarge ? "#FFF8E0" : isMedium ? "#FFE8B0" : "#FFD080",
        opacity: (isLarge ? 0.8 : isMedium ? 0.5 : 0.3) + rng() * 0.2,
        zOffset: 3.0 + rng() * 0.5,
      });

      if (isLarge || isMedium) {
        elements.push({
          shape: { type: "disc", radius: sparkleRadius * (isLarge ? 4.5 : 2.8) },
          position: { x: sx, y: sy },
          rotation: 0,
          scale: 1,
          color: "#D0A040",
          opacity: (isLarge ? 0.07 : 0.04) + rng() * 0.03,
          zOffset: 2.9,
        });
      }
    }
  }

  return elements;
}

/* ── variant definition ──────────────────────────────────────────── */

export const wcTwilightAzalea: PlantVariant = {
  id: "wc-twilight-azalea",
  name: "Twilight Azalea",
  description:
    "A lush dome-shaped azalea bush blanketed in glowing five-petal flowers, each radiating gentle light amid warm golden sparkles at dusk",
  rarity: 0.07,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      flowerCount: { signal: "entropy", range: [12, 24], default: 18, round: true },
      sparkleCount: { signal: "growth", range: [20, 40], default: 30, round: true },
      bushDensity: { signal: "spread", range: [5, 10], default: 8, round: true },
    },
  },
  colorVariations: [
    {
      name: "white",
      weight: 1.0,
      palettes: { bloom: ["#E0D8D0", "#F0ECE6", "#3A6028"] },
    },
    {
      name: "roseglow",
      weight: 0.8,
      palettes: { bloom: ["#D888B0", "#F0A8C8", "#3A6028"] },
    },
    {
      name: "sunburst",
      weight: 0.8,
      palettes: { bloom: ["#D0A838", "#E8C858", "#3A6028"] },
    },
    {
      name: "amethyst",
      weight: 0.8,
      palettes: { bloom: ["#9868C0", "#B888D8", "#3A6028"] },
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
    buildElements: buildWcTwilightAzaleaElements,
  },
};
