/**
 * Watercolor Pulsing Orb Vector
 *
 * An ice-blue/silver crystalline orb with more concentric rings than the
 * standard pulsing orb. Cooler palette, finer detail, and additional inner
 * sparkle dots give it a frozen, ethereal feel.
 *
 * Category: watercolor (ethereal-vector adaptation)
 * Rarity: 0.02
 * Render mode: watercolor
 * Path B: bell_pair circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr, radialPositions } from "../_helpers";

// -- Color palettes -----------------------------------------------------------

const ORB_VECTOR_COLORS = {
  ice: { core: "#88C0E8", ring: "#A8D8F0", outer: "#6090B8" },
  silver: { core: "#B8C0D0", ring: "#D0D8E0", outer: "#9098A8" },
};

// -- Builder ------------------------------------------------------------------

function buildWcPulsingOrbVectorElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const pulseRadius = traitOr(ctx.traits, "pulseRadius", 1.0);
  const glowIntensity = traitOr(ctx.traits, "glowIntensity", 0.65);
  const ringCount = traitOr(ctx.traits, "ringCount", 4);

  // Lifecycle openness
  let openness: number;
  const kf = ctx.keyframeName;
  if (kf === "dormant") {
    openness = 0;
  } else if (kf === "glow") {
    openness = ctx.keyframeProgress * 0.4;
  } else if (kf === "pulse") {
    openness = 0.4 + ctx.keyframeProgress * 0.5;
  } else if (kf === "radiate") {
    openness = 0.9 + ctx.keyframeProgress * 0.1;
  } else {
    openness = 0.5;
  }

  if (openness <= 0) return elements;

  const colors =
    ctx.colorVariationName &&
    ORB_VECTOR_COLORS[ctx.colorVariationName as keyof typeof ORB_VECTOR_COLORS]
      ? ORB_VECTOR_COLORS[ctx.colorVariationName as keyof typeof ORB_VECTOR_COLORS]!
      : ORB_VECTOR_COLORS.ice;

  const cx = 32;
  const cy = 32;

  // -- Central bright disc ----------------------------------------------------
  const coreRadius = 3.5 * pulseRadius * openness;
  elements.push({
    shape: { type: "disc", radius: coreRadius },
    position: { x: cx, y: cy },
    rotation: 0,
    scale: 1,
    color: colors.core,
    opacity: glowIntensity * openness,
    zOffset: 1.0,
  });

  // -- Concentric ring discs (more rings than the regular orb) ----------------
  if (openness > 0.35) {
    const ringProgress = Math.min(1, (openness - 0.35) / 0.5);
    const visibleRings = Math.ceil(ringCount * ringProgress);

    for (let i = 0; i < visibleRings; i++) {
      const ringFraction = (i + 1) / ringCount;
      const ringRadius = (5 + i * 3.2) * pulseRadius * openness;
      // Opacity tapers outward with a softer falloff for the crystalline look
      const ringOpacity = glowIntensity * (1 - ringFraction * 0.55) * ringProgress;

      elements.push({
        shape: { type: "disc", radius: ringRadius },
        position: { x: cx, y: cy },
        rotation: 0,
        scale: 1,
        color: colors.ring,
        opacity: ringOpacity * 0.35,
        zOffset: 0.5 - i * 0.08,
      });
    }
  }

  // -- Outer halo dots (radiate phase, openness > 0.88) -----------------------
  if (openness > 0.88) {
    const haloProgress = (openness - 0.88) / 0.12;
    const outerRingRadius = (5 + (ringCount - 1) * 3.2) * pulseRadius;
    const haloRadius = outerRingRadius + 3.5;
    const haloCount = 10 + Math.floor(rng() * 6);

    const positions = radialPositions(cx, cy, haloRadius, haloCount, rng() * Math.PI * 2);
    for (const pos of positions) {
      const jitterX = (rng() - 0.5) * 1.8;
      const jitterY = (rng() - 0.5) * 1.8;
      elements.push({
        shape: { type: "dot", radius: 0.35 + rng() * 0.45 },
        position: { x: pos.x + jitterX, y: pos.y + jitterY },
        rotation: 0,
        scale: haloProgress,
        color: colors.outer,
        opacity: 0.3 + rng() * 0.2,
        zOffset: 1.5,
      });
    }
  }

  // -- Small inner sparkle dots -----------------------------------------------
  if (openness > 0.25) {
    const sparkProgress = Math.min(1, (openness - 0.25) / 0.4);
    const sparkCount = 5 + Math.floor(rng() * 4);
    const sparkRadius = 3 * pulseRadius * openness;

    for (let i = 0; i < sparkCount; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * sparkRadius;
      elements.push({
        shape: { type: "dot", radius: 0.25 + rng() * 0.3 },
        position: {
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
        },
        rotation: 0,
        scale: sparkProgress,
        color: "#FFFFFF",
        opacity: (0.25 + rng() * 0.25) * glowIntensity,
        zOffset: 2.0 + rng() * 0.3,
      });
    }
  }

  // -- Central highlight dot --------------------------------------------------
  if (openness > 0.2) {
    elements.push({
      shape: { type: "dot", radius: 0.8 * pulseRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: "#FFFFFF",
      opacity: glowIntensity * 0.55 * openness,
      zOffset: 2.5,
    });
  }

  return elements;
}

// -- Variant export -----------------------------------------------------------

export const wcPulsingOrbVector: PlantVariant = {
  id: "wc-pulsing-orb-vector",
  name: "Pulsing Orb Vector",
  description:
    "A crystalline ice-blue orb with fine concentric rings and inner sparkle dots, like frozen light pulsing in watercolor",
  rarity: 0.02,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "bell_pair",
  quantumMapping: {
    schema: {
      pulseRadius: { signal: "dominance", range: [0.7, 1.3], default: 1.0 },
      glowIntensity: { signal: "certainty", range: [0.4, 0.9], default: 0.65 },
      ringCount: { signal: "spread", range: [3, 6], default: 4, round: true },
    },
  },
  colorVariations: [
    { name: "ice", weight: 1.0, palettes: { full: ["#88C0E8", "#A8D8F0", "#6090B8"] } },
    { name: "silver", weight: 0.7, palettes: { full: ["#B8C0D0", "#D0D8E0", "#9098A8"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "dormant", duration: 5 },
      { name: "glow", duration: 12 },
      { name: "pulse", duration: 35 },
      { name: "radiate", duration: 15 },
    ],
    wcEffect: { layers: 3, opacity: 0.45, spread: 0.06, colorVariation: 0.03 },
    buildElements: buildWcPulsingOrbVectorElements,
  },
};
