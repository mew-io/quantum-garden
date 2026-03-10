/**
 * Starlit Lotus
 *
 * Luminous lotus flowers floating on dark, reflective water. A large
 * foreground lotus with layered pink petals and a brilliant golden
 * glowing center dominates the scene, with several smaller lotuses
 * receding into the background. Round lily pads surround the flowers,
 * and the dark purple water is alive with hundreds of golden sparkle
 * reflections. The warm golden light from the flower centers casts
 * shimmering reflections on the water surface.
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
    water: string;
    waterDeep: string;
    waterHighlight: string;
    lilyPad: string;
    lilyPadDark: string;
    petalDeep: string;
    petalMid: string;
    petalLight: string;
    petalGlow: string;
    petalInner: string;
    centerGold: string;
    centerBright: string;
    centerHot: string;
    sparkle: string;
    sparkleGold: string;
    aura: string;
    reflection: string;
  }
> = {
  roseglow: {
    water: "#1A1530",
    waterDeep: "#100D20",
    waterHighlight: "#2A2048",
    lilyPad: "#3A4828",
    lilyPadDark: "#283818",
    petalDeep: "#B860A0",
    petalMid: "#D888C0",
    petalLight: "#F0B0D8",
    petalGlow: "#FFD0EC",
    petalInner: "#FFE8F4",
    centerGold: "#E8A830",
    centerBright: "#F0C850",
    centerHot: "#FFFAE0",
    sparkle: "#F0C040",
    sparkleGold: "#FFD860",
    aura: "#C06898",
    reflection: "#D8A030",
  },
  sunburst: {
    water: "#1A1828",
    waterDeep: "#101018",
    waterHighlight: "#282438",
    lilyPad: "#3A4828",
    lilyPadDark: "#283818",
    petalDeep: "#C0A030",
    petalMid: "#D8C050",
    petalLight: "#E8D870",
    petalGlow: "#F8ECA0",
    petalInner: "#FFF8D0",
    centerGold: "#E0A020",
    centerBright: "#F0C040",
    centerHot: "#FFFAE0",
    sparkle: "#E8B830",
    sparkleGold: "#F0D050",
    aura: "#B89820",
    reflection: "#D0A028",
  },
  amethyst: {
    water: "#141028",
    waterDeep: "#0C0818",
    waterHighlight: "#221840",
    lilyPad: "#303840",
    lilyPadDark: "#202830",
    petalDeep: "#7840B0",
    petalMid: "#9868D0",
    petalLight: "#B898E8",
    petalGlow: "#D4C0FF",
    petalInner: "#EAE0FF",
    centerGold: "#D0A050",
    centerBright: "#E0C070",
    centerHot: "#FFF8E0",
    sparkle: "#C8A850",
    sparkleGold: "#D8C060",
    aura: "#6830A0",
    reflection: "#B888D0",
  },
  white: {
    water: "#181828",
    waterDeep: "#101018",
    waterHighlight: "#282838",
    lilyPad: "#384838",
    lilyPadDark: "#283028",
    petalDeep: "#A8A8A0",
    petalMid: "#C8C8C0",
    petalLight: "#E0E0D8",
    petalGlow: "#F0F0E8",
    petalInner: "#FAFAF4",
    centerGold: "#E0B040",
    centerBright: "#F0D060",
    centerHot: "#FFFCE0",
    sparkle: "#E0C848",
    sparkleGold: "#F0D860",
    aura: "#989890",
    reflection: "#C8B850",
  },
};

const DEFAULT_COLORS = COLORS.roseglow!;

/* ── lotus layout data ───────────────────────────────────────────── */

interface LotusPos {
  x: number;
  y: number;
  size: number;
  petalRings: number;
}

const LOTUS_LAYOUTS: Record<number, LotusPos[]> = {
  4: [
    { x: 32, y: 42, size: 1.0, petalRings: 3 }, // main foreground
    { x: 18, y: 30, size: 0.6, petalRings: 2 },
    { x: 48, y: 28, size: 0.55, petalRings: 2 },
    { x: 32, y: 18, size: 0.4, petalRings: 2 },
  ],
  5: [
    { x: 32, y: 44, size: 1.0, petalRings: 3 },
    { x: 16, y: 32, size: 0.6, petalRings: 2 },
    { x: 50, y: 30, size: 0.55, petalRings: 2 },
    { x: 28, y: 20, size: 0.4, petalRings: 2 },
    { x: 44, y: 16, size: 0.35, petalRings: 2 },
  ],
  6: [
    { x: 32, y: 44, size: 1.0, petalRings: 3 },
    { x: 14, y: 34, size: 0.6, petalRings: 2 },
    { x: 52, y: 32, size: 0.55, petalRings: 2 },
    { x: 24, y: 22, size: 0.45, petalRings: 2 },
    { x: 42, y: 18, size: 0.4, petalRings: 2 },
    { x: 32, y: 12, size: 0.3, petalRings: 2 },
  ],
};

/* ── lily pad layout ─────────────────────────────────────────────── */

interface LilyPadPos {
  x: number;
  y: number;
  radius: number;
  angle: number;
}

function generateLilyPads(rng: () => number, count: number): LilyPadPos[] {
  const pads: LilyPadPos[] = [];

  for (let i = 0; i < count; i++) {
    pads.push({
      x: 32 + (rng() - 0.5) * 50,
      y: 15 + rng() * 38,
      radius: 2.5 + rng() * 3.5,
      angle: rng() * Math.PI * 2,
    });
  }

  return pads;
}

/* ── lotus rendering ─────────────────────────────────────────────── */

function renderLotus(
  elements: WatercolorElement[],
  x: number,
  y: number,
  size: number,
  petalRings: number,
  openness: number,
  colors: typeof DEFAULT_COLORS,
  rng: () => number,
  zBase: number
) {
  const baseAngle = rng() * Math.PI * 2;

  // === Water reflection glow beneath lotus ===
  elements.push({
    shape: { type: "disc", radius: 8 * size * openness },
    position: { x, y: y + 1 },
    rotation: 0,
    scale: 1,
    color: colors.reflection,
    opacity: 0.04 + openness * 0.04,
    zOffset: zBase,
  });

  // === Ambient aura around lotus ===
  elements.push({
    shape: { type: "disc", radius: 10 * size * openness },
    position: { x, y },
    rotation: 0,
    scale: 1,
    color: colors.aura,
    opacity: 0.04 + openness * 0.04,
    zOffset: zBase + 0.01,
  });

  // === Outer petal ring ===
  const outerCount = 8 + Math.floor(rng() * 3); // 8-10 petals
  for (let i = 0; i < outerCount; i++) {
    const pAngle = baseAngle + (i / outerCount) * Math.PI * 2;
    const pLen = (5.5 * size + rng() * 1.5 * size) * openness;
    const pWidth = (2.2 * size + rng() * 0.6 * size) * openness;
    const px = x + Math.cos(pAngle) * 1.5 * size * openness;
    const py = y + Math.sin(pAngle) * 0.8 * size * openness;

    // Glow sublayer
    elements.push({
      shape: { type: "petal", width: pWidth + 0.3, length: pLen + 0.3, roundness: 0.7 },
      position: { x: px, y: py },
      rotation: pAngle,
      scale: 1,
      color: colors.petalGlow,
      opacity: 0.06 + rng() * 0.03,
      zOffset: zBase + 0.02,
    });

    // Main petal
    elements.push({
      shape: { type: "petal", width: pWidth, length: pLen, roundness: 0.7 },
      position: { x: px, y: py },
      rotation: pAngle,
      scale: 1,
      color: rng() > 0.4 ? colors.petalMid : colors.petalDeep,
      opacity: 0.35 + openness * 0.2 + rng() * 0.1,
      zOffset: zBase + 0.03 + rng() * 0.005,
    });
  }

  // === Middle petal ring ===
  if (petalRings >= 2) {
    const midCount = 6 + Math.floor(rng() * 2); // 6-7 petals
    for (let i = 0; i < midCount; i++) {
      const pAngle = baseAngle + ((i + 0.4) / midCount) * Math.PI * 2;
      const pLen = (4.0 * size + rng() * 1.0 * size) * openness;
      const pWidth = (1.8 * size + rng() * 0.5 * size) * openness;
      const px = x + Math.cos(pAngle) * 0.8 * size * openness;
      const py = y + Math.sin(pAngle) * 0.4 * size * openness;

      // Glow sublayer
      elements.push({
        shape: { type: "petal", width: pWidth + 0.2, length: pLen + 0.2, roundness: 0.75 },
        position: { x: px, y: py },
        rotation: pAngle,
        scale: 1,
        color: colors.petalGlow,
        opacity: 0.05 + rng() * 0.03,
        zOffset: zBase + 0.05,
      });

      // Main petal
      elements.push({
        shape: { type: "petal", width: pWidth, length: pLen, roundness: 0.75 },
        position: { x: px, y: py },
        rotation: pAngle,
        scale: 1,
        color: rng() > 0.3 ? colors.petalLight : colors.petalMid,
        opacity: 0.3 + openness * 0.2 + rng() * 0.1,
        zOffset: zBase + 0.06 + rng() * 0.005,
      });
    }
  }

  // === Inner petal ring (only on main lotus) ===
  if (petalRings >= 3) {
    const innerCount = 5 + Math.floor(rng() * 2);
    for (let i = 0; i < innerCount; i++) {
      const pAngle = baseAngle + ((i + 0.2) / innerCount) * Math.PI * 2;
      const pLen = (2.8 * size + rng() * 0.8 * size) * openness;
      const pWidth = (1.4 * size + rng() * 0.4 * size) * openness;

      elements.push({
        shape: { type: "petal", width: pWidth, length: pLen, roundness: 0.8 },
        position: { x, y },
        rotation: pAngle,
        scale: 1,
        color: rng() > 0.3 ? colors.petalInner : colors.petalLight,
        opacity: 0.3 + openness * 0.2 + rng() * 0.1,
        zOffset: zBase + 0.08 + rng() * 0.005,
      });
    }
  }

  // === Brilliant golden glowing center (5 layers) ===

  // Layer 1: wide golden aura
  elements.push({
    shape: { type: "disc", radius: 3.5 * size * openness },
    position: { x, y },
    rotation: 0,
    scale: 1,
    color: colors.centerGold,
    opacity: 0.1 + openness * 0.08,
    zOffset: zBase + 0.1,
  });

  // Layer 2: golden spread
  elements.push({
    shape: { type: "disc", radius: 2.5 * size * openness },
    position: { x, y },
    rotation: 0,
    scale: 1,
    color: colors.centerGold,
    opacity: 0.15 + openness * 0.12,
    zOffset: zBase + 0.11,
  });

  // Layer 3: bright golden core
  elements.push({
    shape: { type: "disc", radius: 1.6 * size * openness },
    position: { x, y },
    rotation: 0,
    scale: 1,
    color: colors.centerBright,
    opacity: 0.25 + openness * 0.2,
    zOffset: zBase + 0.12,
  });

  // Layer 4: hot golden center
  elements.push({
    shape: { type: "dot", radius: 0.9 * size * openness },
    position: { x, y },
    rotation: 0,
    scale: 1,
    color: colors.centerHot,
    opacity: 0.6 + openness * 0.3,
    zOffset: zBase + 0.13,
  });

  // Layer 5: white-hot point
  elements.push({
    shape: { type: "dot", radius: 0.35 * size * openness },
    position: { x, y },
    rotation: 0,
    scale: 1,
    color: "#FFFFF0",
    opacity: 0.8 + openness * 0.2,
    zOffset: zBase + 0.14,
  });

  // === Stamen dots around center ===
  const stamenCount = 6 + Math.floor(rng() * 4);
  for (let i = 0; i < stamenCount; i++) {
    const sAngle = rng() * Math.PI * 2;
    const sDist = (1.2 + rng() * 1.0) * size * openness;
    const sx = x + Math.cos(sAngle) * sDist;
    const sy = y + Math.sin(sAngle) * sDist * 0.5;

    elements.push({
      shape: { type: "dot", radius: (0.2 + rng() * 0.15) * size },
      position: { x: sx, y: sy },
      rotation: 0,
      scale: openness,
      color: colors.centerBright,
      opacity: 0.5 + rng() * 0.2,
      zOffset: zBase + 0.12,
    });
  }
}

/* ── main builder ────────────────────────────────────────────────── */

function buildWcStarlitLotusElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const lotusCount = traitOr(ctx.traits, "lotusCount", 5);
  const sparkleCount = traitOr(ctx.traits, "sparkleCount", 55);
  const lilyPadCount = traitOr(ctx.traits, "lilyPadCount", 8);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const bloomOpenness = Math.max(0, (openness - 0.1) / 0.9);
  const leafOpenness = Math.max(0, (openness - 0.03) / 0.97);

  const colors =
    ctx.colorVariationName && COLORS[ctx.colorVariationName]
      ? COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  // === LILY PADS ===
  if (leafOpenness > 0) {
    const pads = generateLilyPads(rng, Math.round(lilyPadCount));

    for (const pad of pads) {
      // Dark pad base
      elements.push({
        shape: { type: "disc", radius: pad.radius * leafOpenness },
        position: { x: pad.x, y: pad.y },
        rotation: 0,
        scale: 1,
        color: colors.lilyPadDark,
        opacity: 0.25 + leafOpenness * 0.15,
        zOffset: 0.03 + rng() * 0.01,
      });

      // Lighter pad surface
      elements.push({
        shape: { type: "disc", radius: pad.radius * 0.85 * leafOpenness },
        position: { x: pad.x + 0.2, y: pad.y - 0.2 },
        rotation: 0,
        scale: 1,
        color: colors.lilyPad,
        opacity: 0.2 + leafOpenness * 0.12,
        zOffset: 0.035 + rng() * 0.01,
      });

      // Water droplet dots on pad
      if (rng() > 0.4) {
        const dropCount = 1 + Math.floor(rng() * 3);
        for (let d = 0; d < dropCount; d++) {
          const dAngle = rng() * Math.PI * 2;
          const dDist = rng() * pad.radius * 0.6;
          elements.push({
            shape: { type: "dot", radius: 0.15 + rng() * 0.15 },
            position: {
              x: pad.x + Math.cos(dAngle) * dDist,
              y: pad.y + Math.sin(dAngle) * dDist,
            },
            rotation: 0,
            scale: leafOpenness,
            color: colors.sparkleGold,
            opacity: 0.3 + rng() * 0.2,
            zOffset: 0.04,
          });
        }
      }
    }
  }

  // === WATER REFLECTIONS (golden light on water from lotus centers) ===
  if (bloomOpenness > 0.05) {
    // Central golden reflection path (like moonlight on water)
    const reflectionSegments = 6 + Math.floor(rng() * 4);
    for (let i = 0; i < reflectionSegments; i++) {
      const rx = 32 + (rng() - 0.5) * 20;
      const ry = 15 + rng() * 35;
      const rWidth = 2 + rng() * 4;

      elements.push({
        shape: { type: "disc", radius: rWidth * bloomOpenness },
        position: { x: rx, y: ry },
        rotation: 0,
        scale: 1,
        color: colors.reflection,
        opacity: 0.04 + bloomOpenness * 0.04 + rng() * 0.02,
        zOffset: 0.05,
      });
    }
  }

  // === LOTUS FLOWERS ===
  if (bloomOpenness > 0) {
    const activeLotusCount = Math.min(6, Math.max(4, Math.round(lotusCount)));
    const layout = LOTUS_LAYOUTS[activeLotusCount] ?? LOTUS_LAYOUTS[5]!;

    for (let i = 0; i < layout.length; i++) {
      const lotus = layout[i]!;
      // Jitter positions slightly
      const lx = lotus.x + (rng() - 0.5) * 3;
      const ly = lotus.y + (rng() - 0.5) * 2;

      // Background lotuses appear later
      const lotusOpenness =
        i === 0 ? bloomOpenness : Math.max(0, (bloomOpenness - 0.1 * i) / (1 - 0.1 * i));

      if (lotusOpenness <= 0) continue;

      renderLotus(
        elements,
        lx,
        ly,
        lotus.size,
        lotus.petalRings,
        lotusOpenness,
        colors,
        rng,
        0.3 + i * 0.08
      );
    }
  }

  // === SPARKLE PARTICLES (golden dots all over the water) ===
  if (bloomOpenness > 0.05) {
    const sparkleOpenness = Math.min(1, (bloomOpenness - 0.05) / 0.6);
    const activeSparkles = Math.round(sparkleCount * sparkleOpenness);

    for (let i = 0; i < activeSparkles; i++) {
      const sx = 32 + (rng() - 0.5) * 56;
      const sy = 8 + rng() * 50;

      const roll = rng();
      const isLarge = roll < 0.08;
      const isMedium = roll < 0.25;

      const sparkleRadius = isLarge
        ? 0.6 + rng() * 0.4
        : isMedium
          ? 0.3 + rng() * 0.25
          : 0.1 + rng() * 0.15;

      // Golden sparkle dot
      elements.push({
        shape: { type: "dot", radius: sparkleRadius },
        position: { x: sx, y: sy },
        rotation: 0,
        scale: 1,
        color: isLarge ? colors.centerHot : isMedium ? colors.sparkleGold : colors.sparkle,
        opacity: (isLarge ? 0.75 : isMedium ? 0.5 : 0.3) + rng() * 0.15,
        zOffset: 2.0 + rng() * 0.5,
      });

      // Glow halo for brighter sparkles
      if (isLarge || isMedium) {
        elements.push({
          shape: { type: "disc", radius: sparkleRadius * (isLarge ? 5 : 3) },
          position: { x: sx, y: sy },
          rotation: 0,
          scale: 1,
          color: colors.reflection,
          opacity: (isLarge ? 0.06 : 0.03) + rng() * 0.02,
          zOffset: 1.9,
        });
      }
    }

    // Extra-bright sparkles near the lotus flowers
    const nearSparkleCount = 10 + Math.floor(rng() * 6);
    for (let i = 0; i < nearSparkleCount; i++) {
      // Cluster near center of scene
      const sx = 32 + (rng() - 0.5) * 30;
      const sy = 25 + (rng() - 0.5) * 25;

      elements.push({
        shape: { type: "dot", radius: 0.25 + rng() * 0.35 },
        position: { x: sx, y: sy },
        rotation: 0,
        scale: 1,
        color: colors.sparkleGold,
        opacity: 0.45 + rng() * 0.25,
        zOffset: 2.3,
      });

      // Warm halo
      elements.push({
        shape: { type: "disc", radius: 1.0 + rng() * 1.5 },
        position: { x: sx, y: sy },
        rotation: 0,
        scale: 1,
        color: colors.reflection,
        opacity: 0.04 + rng() * 0.03,
        zOffset: 2.2,
      });
    }
  }

  return elements;
}

/* ── variant definition ──────────────────────────────────────────── */

export const wcStarlitLotus: PlantVariant = {
  id: "wc-starlit-lotus",
  name: "Starlit Lotus",
  description:
    "Luminous lotus flowers floating on dark reflective water, their brilliant golden centers casting shimmering light across the surface while hundreds of golden sparkles dance around them",
  rarity: 0.07,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      lotusCount: { signal: "entropy", range: [4, 6], default: 5, round: true },
      sparkleCount: { signal: "growth", range: [40, 70], default: 55, round: true },
      lilyPadCount: { signal: "spread", range: [6, 12], default: 8, round: true },
    },
  },
  colorVariations: [
    {
      name: "roseglow",
      weight: 1.0,
      palettes: { bloom: ["#B860A0", "#D888C0", "#1A1530"] },
    },
    {
      name: "sunburst",
      weight: 0.8,
      palettes: { bloom: ["#C0A030", "#D8C050", "#1A1828"] },
    },
    {
      name: "amethyst",
      weight: 0.8,
      palettes: { bloom: ["#7840B0", "#9868D0", "#141028"] },
    },
    {
      name: "white",
      weight: 0.8,
      palettes: { bloom: ["#A8A8A0", "#C8C8C0", "#181828"] },
    },
  ],
  clusteringBehavior: {
    mode: "spread",
    clusterRadius: 400,
    clusterBonus: 1.2,
    maxClusterDensity: 3,
    reseedClusterChance: 0.3,
  },
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 16 },
      { name: "sprout", duration: 20 },
      { name: "bloom", duration: 55 },
      { name: "fade", duration: 20 },
    ],
    wcEffect: { layers: 5, opacity: 0.5, spread: 0.09, colorVariation: 0.06 },
    buildElements: buildWcStarlitLotusElements,
  },
};
