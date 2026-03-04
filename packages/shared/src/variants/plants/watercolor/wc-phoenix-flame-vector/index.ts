/**
 * Watercolor Phoenix Flame Vector
 *
 * Path B version of the flame phoenix. Similar fire-themed elements rendered
 * through the watercolor system, but using schema mapping instead of a custom
 * Python circuit. More stylized/simplified proportions with more saturated
 * orange tones and an alternate electric-blue flame variation.
 *
 * Category: watercolor (ethereal-vector adaptation)
 * Rarity: 0.02
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr } from "../_helpers";

// -- Color palettes -----------------------------------------------------------

const FLAME_VECTOR_COLORS: Record<string, { flame: string; glow: string; core: string }> = {
  blaze: { flame: "#F07828", glow: "#F8A040", core: "#E06020" },
  electric: { flame: "#4080E0", glow: "#60A0F0", core: "#3060C0" },
};

const DEFAULT_COLORS = FLAME_VECTOR_COLORS["blaze"]!;

// -- Openness curve -----------------------------------------------------------

function flameVectorOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "ember":
      return 0.02 + progress * 0.08; // 0.02 -> 0.10
    case "ignite":
      return 0.1 + progress * 0.4; // 0.10 -> 0.50
    case "flame":
      return 0.5 + progress * 0.4; // 0.50 -> 0.90
    case "blaze":
      return 0.9 + progress * 0.1; // 0.90 -> 1.00
    default:
      return 0.5;
  }
}

// -- Builder ------------------------------------------------------------------

function buildWcPhoenixFlameVectorElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const flameHeight = traitOr(ctx.traits, "flameHeight", 1.0);
  const wingSpread = traitOr(ctx.traits, "wingSpread", 0.75);
  const emberIntensity = traitOr(ctx.traits, "emberIntensity", 0.65);

  // Color selection
  const colorSet =
    (ctx.colorVariationName ? FLAME_VECTOR_COLORS[ctx.colorVariationName] : null) ??
    (ctx.traits?.colorPalette
      ? {
          flame: ctx.traits.colorPalette[0] ?? DEFAULT_COLORS.flame,
          glow: ctx.traits.colorPalette[1] ?? DEFAULT_COLORS.glow,
          core: ctx.traits.colorPalette[2] ?? DEFAULT_COLORS.core,
        }
      : DEFAULT_COLORS);

  const openness = flameVectorOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const cx = 32;
  const flameBaseY = 44;
  const flameCenterY = 30;

  // === SPARK DOTS ===
  // Scattered throughout, visible even in early stages
  if (openness > 0.02) {
    const sparkCount = Math.floor(5 + emberIntensity * 10);
    const sparkOpenness = Math.min(1, openness / 0.15);

    for (let i = 0; i < sparkCount; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = (3 + rng() * 15) * sparkOpenness;
      const sparkRadius = 0.2 + rng() * 0.45;

      elements.push({
        shape: { type: "dot", radius: sparkRadius },
        position: {
          x: cx + Math.cos(angle) * dist,
          y: flameCenterY + Math.sin(angle) * dist * 0.75,
        },
        rotation: 0,
        scale: sparkOpenness,
        color: colorSet.glow,
        opacity: (0.2 + rng() * 0.35) * emberIntensity,
        zOffset: 2.5 + rng() * 0.3,
      });
    }
  }

  // === FIRE CORE ===
  // Inner disc at the base of the flame
  if (openness > 0.1) {
    const coreOpenness = Math.min(1, (openness - 0.1) / 0.4);
    const coreRadius = (2.5 + coreOpenness * 2) * flameHeight * 0.7;

    elements.push({
      shape: { type: "disc", radius: coreRadius },
      position: { x: cx, y: flameBaseY - 4 },
      rotation: 0,
      scale: 1,
      color: colorSet.core,
      opacity: 0.42 * coreOpenness,
      zOffset: 0.3,
    });
  }

  // === CENTRAL FLAME ===
  // Tall petal shape pointing upward -- slightly wider than Path A version
  if (openness > 0.1) {
    const flameOpenness = Math.min(1, (openness - 0.1) / 0.4);
    const flameLen = (11 + flameOpenness * 7) * flameHeight;
    const flameWidth = (4.5 + flameOpenness * 3.5) * flameHeight * 0.8;

    elements.push({
      shape: {
        type: "petal",
        width: flameWidth,
        length: flameLen,
        roundness: 0.55,
      },
      position: { x: cx, y: flameBaseY - flameLen * 0.3 },
      rotation: -Math.PI / 2,
      scale: 1.0,
      color: colorSet.flame,
      opacity: 0.55 * flameOpenness,
      zOffset: 1.0,
    });

    // Secondary inner flame (brighter, thinner)
    if (flameOpenness > 0.3) {
      elements.push({
        shape: {
          type: "petal",
          width: flameWidth * 0.45,
          length: flameLen * 0.7,
          roundness: 0.45,
        },
        position: { x: cx, y: flameBaseY - flameLen * 0.25 },
        rotation: -Math.PI / 2,
        scale: 1.0,
        color: colorSet.glow,
        opacity: 0.42 * flameOpenness,
        zOffset: 1.5,
      });
    }
  }

  // === WING PETALS ===
  // Two petals on each side, spreading outward -- slightly different proportions
  if (openness > 0.5) {
    const wingOpenness = Math.min(1, (openness - 0.5) / 0.4);
    const wingLen = (8 + wingOpenness * 5) * wingSpread;
    const wingWidth = (3.5 + wingOpenness * 2) * wingSpread;

    // Left wing petals
    for (let w = 0; w < 2; w++) {
      const wingAngle = -Math.PI * 0.68 - w * 0.22 + (rng() - 0.5) * 0.1;
      const wingX = cx - 3.5 - w * 2;
      const wingY = flameCenterY + 2 + w * 3;

      elements.push({
        shape: {
          type: "petal",
          width: wingWidth * (1 - w * 0.12),
          length: wingLen * (1 - w * 0.1),
          roundness: 0.5 + rng() * 0.2,
        },
        position: { x: wingX, y: wingY },
        rotation: wingAngle,
        scale: wingOpenness,
        color: w === 0 ? colorSet.flame : colorSet.glow,
        opacity: (0.48 - w * 0.1) * wingOpenness,
        zOffset: 0.8 - w * 0.1,
      });
    }

    // Right wing petals (mirrored)
    for (let w = 0; w < 2; w++) {
      const wingAngle = -Math.PI * 0.32 + w * 0.22 + (rng() - 0.5) * 0.1;
      const wingX = cx + 3.5 + w * 2;
      const wingY = flameCenterY + 2 + w * 3;

      elements.push({
        shape: {
          type: "petal",
          width: wingWidth * (1 - w * 0.12),
          length: wingLen * (1 - w * 0.1),
          roundness: 0.5 + rng() * 0.2,
        },
        position: { x: wingX, y: wingY },
        rotation: wingAngle,
        scale: wingOpenness,
        color: w === 0 ? colorSet.flame : colorSet.glow,
        opacity: (0.48 - w * 0.1) * wingOpenness,
        zOffset: 0.8 - w * 0.1,
      });
    }
  }

  // === EMBER DISCS ===
  // Small glowing discs floating above the flame -- more than Path A version
  if (openness > 0.3) {
    const emberOpenness = Math.min(1, (openness - 0.3) / 0.6);
    const emberCount = Math.floor(4 + emberIntensity * 3);

    for (let i = 0; i < emberCount; i++) {
      const angle = (rng() - 0.5) * Math.PI * 0.85;
      const dist = (3 + rng() * 9) * emberOpenness * flameHeight;
      const emberRadius = (0.7 + rng() * 1.3) * emberIntensity;

      elements.push({
        shape: { type: "disc", radius: emberRadius },
        position: {
          x: cx + Math.sin(angle) * dist * 0.6,
          y: flameCenterY - 5 - dist * 0.8,
        },
        rotation: 0,
        scale: emberOpenness,
        color: colorSet.glow,
        opacity: (0.3 + rng() * 0.3) * emberIntensity * emberOpenness,
        zOffset: 2.0 + i * 0.1,
      });
    }
  }

  return elements;
}

// -- Variant export -----------------------------------------------------------

export const wcPhoenixFlameVector: PlantVariant = {
  id: "wc-phoenix-flame-vector",
  name: "Phoenix Flame Vector",
  description:
    "A stylized flame phoenix painted in saturated watercolor with spreading wings and floating embers, driven by quantum interference",
  rarity: 0.02,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      flameHeight: { signal: "growth", range: [0.7, 1.3], default: 1.0 },
      wingSpread: { signal: "entropy", range: [0.5, 1.0], default: 0.75 },
      emberIntensity: { signal: "certainty", range: [0.3, 1.0], default: 0.65 },
    },
  },
  colorVariations: [
    { name: "blaze", weight: 1.0, palettes: { full: ["#F07828", "#F8A040", "#E06020"] } },
    { name: "electric", weight: 0.6, palettes: { full: ["#4080E0", "#60A0F0", "#3060C0"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "ember", duration: 5 },
      { name: "ignite", duration: 15 },
      { name: "flame", duration: 35 },
      { name: "blaze", duration: 15 },
    ],
    wcEffect: { layers: 3, opacity: 0.5, spread: 0.06, colorVariation: 0.05 },
    buildElements: buildWcPhoenixFlameVectorElements,
  },
};
