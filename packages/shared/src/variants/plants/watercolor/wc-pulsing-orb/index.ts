/**
 * Watercolor Pulsing Orb
 *
 * A glowing central orb with concentric pulse rings emanating outward
 * and halo dots surrounding it. Like a heartbeat visualized as watercolor.
 *
 * Category: watercolor (abstract/energy)
 * Rarity: 0.03
 * Render mode: watercolor
 * Path B: bell_pair circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr, radialPositions } from "../_helpers";

const ORB_COLORS = {
  azure: { core: "#5888D0", ring: "#7AAAE8", outer: "#4070B0" },
  amber: { core: "#D8A850", ring: "#E8C070", outer: "#C09040" },
};

function buildWcPulsingOrbElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const pulseRadius = traitOr(ctx.traits, "pulseRadius", 1.0);
  const glowIntensity = traitOr(ctx.traits, "glowIntensity", 0.65);
  const ringCount = traitOr(ctx.traits, "ringCount", 3);

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
    ctx.colorVariationName && ORB_COLORS[ctx.colorVariationName as keyof typeof ORB_COLORS]
      ? ORB_COLORS[ctx.colorVariationName as keyof typeof ORB_COLORS]!
      : ORB_COLORS.azure;

  const cx = 32;
  const cy = 32;

  // Central glow disc (bright, high opacity)
  const coreRadius = 4 * pulseRadius * openness;
  elements.push({
    shape: { type: "disc", radius: coreRadius },
    position: { x: cx, y: cy },
    rotation: 0,
    scale: 1,
    color: colors.core,
    opacity: glowIntensity * openness,
    zOffset: 1.0,
  });

  // Concentric pulse rings (only visible once openness > 0.4)
  if (openness > 0.4) {
    const ringProgress = Math.min(1, (openness - 0.4) / 0.5);
    const visibleRings = Math.ceil(ringCount * ringProgress);

    for (let i = 0; i < visibleRings; i++) {
      const ringFraction = (i + 1) / ringCount;
      const ringRadius = (6 + i * 4) * pulseRadius * openness;
      // Opacity decreases as rings go outward
      const ringOpacity = glowIntensity * (1 - ringFraction * 0.6) * ringProgress;

      elements.push({
        shape: { type: "disc", radius: ringRadius },
        position: { x: cx, y: cy },
        rotation: 0,
        scale: 1,
        color: colors.ring,
        opacity: ringOpacity * 0.4,
        zOffset: 0.5 - i * 0.1,
      });
    }
  }

  // Halo dots (only in radiate phase, openness > 0.9)
  if (openness > 0.9) {
    const haloProgress = (openness - 0.9) / 0.1;
    const outerRingRadius = (6 + (ringCount - 1) * 4) * pulseRadius;
    const haloRadius = outerRingRadius + 4;
    const haloCount = 8 + Math.floor(rng() * 5);

    const positions = radialPositions(cx, cy, haloRadius, haloCount, rng() * Math.PI * 2);
    for (const pos of positions) {
      const jitterX = (rng() - 0.5) * 2;
      const jitterY = (rng() - 0.5) * 2;
      elements.push({
        shape: { type: "dot", radius: 0.4 + rng() * 0.5 },
        position: { x: pos.x + jitterX, y: pos.y + jitterY },
        rotation: 0,
        scale: haloProgress,
        color: colors.outer,
        opacity: 0.35 + rng() * 0.2,
        zOffset: 1.5,
      });
    }
  }

  // Inner highlight dot at center
  if (openness > 0.2) {
    elements.push({
      shape: { type: "dot", radius: 1.0 * pulseRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: "#FFFFFF",
      opacity: glowIntensity * 0.5 * openness,
      zOffset: 2.0,
    });
  }

  return elements;
}

export const wcPulsingOrb: PlantVariant = {
  id: "wc-pulsing-orb",
  name: "Watercolor Pulsing Orb",
  description:
    "A glowing central orb with concentric pulse rings emanating outward, like a heartbeat visualized in watercolor",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "bell_pair",
  quantumMapping: {
    schema: {
      pulseRadius: { signal: "dominance", range: [0.7, 1.3], default: 1.0 },
      glowIntensity: { signal: "certainty", range: [0.4, 0.9], default: 0.65 },
      ringCount: { signal: "spread", range: [2, 5], default: 3, round: true },
    },
  },
  colorVariations: [
    { name: "azure", weight: 1.0, palettes: { full: ["#5888D0", "#7AAAE8", "#4070B0"] } },
    { name: "amber", weight: 0.7, palettes: { full: ["#D8A850", "#E8C070", "#C09040"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "dormant", duration: 5 },
      { name: "glow", duration: 15 },
      { name: "pulse", duration: 35 },
      { name: "radiate", duration: 20 },
    ],
    wcEffect: { layers: 3, opacity: 0.48, spread: 0.07, colorVariation: 0.04 },
    buildElements: buildWcPulsingOrbElements,
  },
};
