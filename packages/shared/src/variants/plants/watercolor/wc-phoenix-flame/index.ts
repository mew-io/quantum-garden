/**
 * Watercolor Phoenix Flame
 *
 * A phoenix made of flame rendered in watercolor style with a tall central
 * flame body, wing petals spreading outward, ember discs floating above,
 * and spark dots scattered around. Fiery reds/oranges/golds. Flame height,
 * wing spread, and ember intensity are driven by a custom 3-qubit
 * entanglement circuit.
 *
 * Category: watercolor (mythical flora)
 * Rarity: 0.03
 * Render mode: watercolor
 * Path A: custom Python circuit (wc_phoenix_flame) — no quantumMapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr } from "../_helpers";

/**
 * Color sets for the phoenix flame, keyed by color variation name.
 */
const PHOENIX_COLORS: Record<string, { flame: string; glow: string; core: string }> = {
  inferno: { flame: "#E85830", glow: "#F0A030", core: "#D04020" },
  solar: { flame: "#F0C040", glow: "#E8A830", core: "#D89020" },
};

const PHOENIX_DEFAULT_COLORS = PHOENIX_COLORS["inferno"]!;

/**
 * Get phoenix-specific openness for lifecycle keyframes.
 * ember -> ignite -> flame -> blaze
 */
function getPhoenixOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "ember":
      return 0.02 + progress * 0.08; // 0.02 -> 0.10 (just spark dots)
    case "ignite":
      return 0.1 + progress * 0.4; // 0.10 -> 0.50 (central flame grows)
    case "flame":
      return 0.5 + progress * 0.4; // 0.50 -> 0.90 (wings spread)
    case "blaze":
      return 0.9 + progress * 0.1; // 0.90 -> 1.00 (full intensity)
    default:
      return 0.5;
  }
}

/**
 * Builder function for the Watercolor Phoenix Flame variant.
 *
 * Creates a phoenix made of flame with a central fire body, wing petals,
 * floating ember discs, and scattered spark dots. The flame height, wing
 * spread, and ember intensity are read directly from ctx.traits
 * (Path A: set by the wc_phoenix_flame Python circuit).
 *
 * Visual design:
 * - Central flame: tall petal shape pointing upward
 * - Wing petals: 2 petals on each side, angled diagonally up
 * - Ember discs: 3-5 small glowing discs floating above
 * - Spark dots: scattered small dots around the flame
 * - Fire core: inner disc at base of flame
 */
function buildWcPhoenixFlameElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  // Path A: read properties from Python circuit's extra dict (via plant.traits).
  // Fallback values for unobserved plants (ctx.traits is null).
  const flameHeight = traitOr(ctx.traits, "flameHeight", 1.0);
  const wingSpread = traitOr(ctx.traits, "wingSpread", 0.75);
  const emberIntensity = traitOr(ctx.traits, "emberIntensity", 0.65);

  // Color selection
  const colorSet =
    (ctx.colorVariationName ? PHOENIX_COLORS[ctx.colorVariationName] : null) ??
    (ctx.traits?.colorPalette
      ? {
          flame: ctx.traits.colorPalette[0] ?? PHOENIX_DEFAULT_COLORS.flame,
          glow: ctx.traits.colorPalette[1] ?? PHOENIX_DEFAULT_COLORS.glow,
          core: ctx.traits.colorPalette[2] ?? PHOENIX_DEFAULT_COLORS.core,
        }
      : PHOENIX_DEFAULT_COLORS);

  // Lifecycle-driven openness
  const openness = getPhoenixOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const cx = 32;
  const flameBaseY = 46;
  const flameCenterY = 30;

  // === SPARK DOTS ===
  // Scattered throughout, visible even in early stages
  if (openness > 0.02) {
    const sparkCount = Math.floor(4 + emberIntensity * 8);
    const sparkOpenness = Math.min(1, openness / 0.15);

    for (let i = 0; i < sparkCount; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = (4 + rng() * 14) * sparkOpenness;
      const sparkRadius = 0.2 + rng() * 0.4;

      elements.push({
        shape: { type: "dot", radius: sparkRadius },
        position: {
          x: cx + Math.cos(angle) * dist,
          y: flameCenterY + Math.sin(angle) * dist * 0.8,
        },
        rotation: 0,
        scale: sparkOpenness,
        color: colorSet.glow,
        opacity: (0.2 + rng() * 0.3) * emberIntensity,
        zOffset: 2.5 + rng() * 0.3,
      });
    }
  }

  // === FIRE CORE ===
  // Inner disc at the base of the flame
  if (openness > 0.1) {
    const coreOpenness = Math.min(1, (openness - 0.1) / 0.4);
    const coreRadius = (2 + coreOpenness * 2.5) * flameHeight * 0.7;

    elements.push({
      shape: { type: "disc", radius: coreRadius },
      position: { x: cx, y: flameBaseY - 4 },
      rotation: 0,
      scale: 1,
      color: colorSet.core,
      opacity: 0.4 * coreOpenness,
      zOffset: 0.3,
    });
  }

  // === CENTRAL FLAME ===
  // Tall petal shape pointing upward
  if (openness > 0.1) {
    const flameOpenness = Math.min(1, (openness - 0.1) / 0.4);
    const flameLen = (10 + flameOpenness * 8) * flameHeight;
    const flameWidth = (4 + flameOpenness * 3) * flameHeight * 0.8;

    elements.push({
      shape: {
        type: "petal",
        width: flameWidth,
        length: flameLen,
        roundness: 0.6,
      },
      position: { x: cx, y: flameBaseY - flameLen * 0.3 },
      rotation: -Math.PI / 2, // Point upward
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
          width: flameWidth * 0.5,
          length: flameLen * 0.75,
          roundness: 0.5,
        },
        position: { x: cx, y: flameBaseY - flameLen * 0.25 },
        rotation: -Math.PI / 2,
        scale: 1.0,
        color: colorSet.glow,
        opacity: 0.4 * flameOpenness,
        zOffset: 1.5,
      });
    }
  }

  // === WING PETALS ===
  // Two petals on each side, spreading outward and diagonally up
  if (openness > 0.5) {
    const wingOpenness = Math.min(1, (openness - 0.5) / 0.4);
    const wingLen = (7 + wingOpenness * 5) * wingSpread;
    const wingWidth = (3 + wingOpenness * 2.5) * wingSpread;

    // Left wing petals
    for (let w = 0; w < 2; w++) {
      const wingAngle = -Math.PI * 0.65 - w * 0.25 + (rng() - 0.5) * 0.1;
      const wingX = cx - 3 - w * 2;
      const wingY = flameCenterY + 2 + w * 3;

      elements.push({
        shape: {
          type: "petal",
          width: wingWidth * (1 - w * 0.15),
          length: wingLen * (1 - w * 0.1),
          roundness: 0.5 + rng() * 0.2,
        },
        position: { x: wingX, y: wingY },
        rotation: wingAngle,
        scale: wingOpenness,
        color: w === 0 ? colorSet.flame : colorSet.glow,
        opacity: (0.45 - w * 0.1) * wingOpenness,
        zOffset: 0.8 - w * 0.1,
      });
    }

    // Right wing petals (mirrored)
    for (let w = 0; w < 2; w++) {
      const wingAngle = -Math.PI * 0.35 + w * 0.25 + (rng() - 0.5) * 0.1;
      const wingX = cx + 3 + w * 2;
      const wingY = flameCenterY + 2 + w * 3;

      elements.push({
        shape: {
          type: "petal",
          width: wingWidth * (1 - w * 0.15),
          length: wingLen * (1 - w * 0.1),
          roundness: 0.5 + rng() * 0.2,
        },
        position: { x: wingX, y: wingY },
        rotation: wingAngle,
        scale: wingOpenness,
        color: w === 0 ? colorSet.flame : colorSet.glow,
        opacity: (0.45 - w * 0.1) * wingOpenness,
        zOffset: 0.8 - w * 0.1,
      });
    }
  }

  // === EMBER DISCS ===
  // Small glowing discs floating above the flame
  if (openness > 0.3) {
    const emberOpenness = Math.min(1, (openness - 0.3) / 0.6);
    const emberCount = Math.floor(3 + emberIntensity * 2);

    for (let i = 0; i < emberCount; i++) {
      const angle = (rng() - 0.5) * Math.PI * 0.8;
      const dist = (3 + rng() * 8) * emberOpenness * flameHeight;
      const emberRadius = (0.8 + rng() * 1.2) * emberIntensity;

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

export const wcPhoenixFlame: PlantVariant = {
  id: "wc-phoenix-flame",
  name: "Watercolor Phoenix Flame",
  description:
    "A phoenix made of flame painted in watercolor with spreading wings and floating embers, its flame height and wing spread shaped by a 3-qubit entanglement circuit",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  // Path A: custom Python circuit encodes all visual properties directly.
  // The wc_phoenix_flame circuit maps qubit measurements to
  // flameHeight, wingSpread, and emberIntensity in its extra dict.
  circuitId: "wc_phoenix_flame",
  sandboxControls: [
    {
      key: "flameHeight",
      label: "Flame Height",
      min: 0.7,
      max: 1.3,
      step: 0.05,
      default: 1.0,
    },
    { key: "wingSpread", label: "Wing Spread", min: 0.5, max: 1.0, step: 0.05, default: 0.75 },
    {
      key: "emberIntensity",
      label: "Ember Intensity",
      min: 0.3,
      max: 1.0,
      step: 0.05,
      default: 0.65,
    },
  ],
  colorVariations: [
    {
      name: "inferno",
      weight: 1.0,
      palettes: { bloom: ["#E85830", "#F0A030", "#D04020"] },
    },
    {
      name: "solar",
      weight: 0.7,
      palettes: { bloom: ["#F0C040", "#E8A830", "#D89020"] },
    },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "ember", duration: 5 },
      { name: "ignite", duration: 15 },
      { name: "flame", duration: 40 },
      { name: "blaze", duration: 15 },
    ],
    wcEffect: {
      layers: 3,
      opacity: 0.52,
      spread: 0.06,
      colorVariation: 0.05,
    },
    buildElements: buildWcPhoenixFlameElements,
  },
};
