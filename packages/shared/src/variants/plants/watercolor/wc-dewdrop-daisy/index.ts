/**
 * Watercolor Dewdrop Daisy
 *
 * Thin ray petals radiating from a bright center with dewdrop dots at
 * petal tips that catch light. Sparkle effect in later keyframes.
 *
 * Category: watercolor (flowers adaptation)
 * Rarity: 0.11 (base 0.7 × 0.15)
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, standardOpenness, traitOr, buildStem } from "../_helpers";

function buildWcDewdropDaisyElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const rayCount = traitOr(ctx.traits, "rayCount", 8);
  const dewdropCount = traitOr(ctx.traits, "dewdropCount", 4);
  const petalWidth = traitOr(ctx.traits, "petalWidth", 3.5);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const cx = 32;
  const cy = 20;
  const stemBottom = 52;
  const stemFullTop = cy + 5;

  // Stem — grows upward with openness
  const stemGrowth = Math.min(1, openness / 0.3);
  if (stemGrowth > 0) {
    const stemTopY = stemBottom + (stemFullTop - stemBottom) * stemGrowth;
    buildStem(
      elements,
      cx,
      stemBottom,
      cx,
      stemTopY,
      0.1 * stemGrowth,
      0.55 + openness * 0.3,
      "#6B8A65",
      0.6 * Math.min(1, stemGrowth * 2),
      rng
    );
  }

  // Leaves — positioned along the grown portion of the stem
  const leafOpenness = Math.max(0, (openness - 0.1) / 0.9);
  const stemTopY = stemBottom + (stemFullTop - stemBottom) * stemGrowth;
  for (let i = 0; i < 2; i++) {
    if (leafOpenness <= 0) break;
    const side = i === 0 ? -1 : 1;
    const leafY = stemBottom + (stemTopY - stemBottom) * (0.4 + i * 0.25);
    elements.push({
      shape: { type: "leaf", width: 3, length: 8 },
      position: { x: cx + side * 1.5, y: leafY },
      rotation: side * (0.5 + rng() * 0.3),
      scale: leafOpenness * 0.7,
      color: "#788E6A",
      zOffset: 0.5,
    });
  }

  // Ray petals (thin, narrow)
  const petalOpenness = Math.max(0, (openness - 0.1) / 0.9);
  if (petalOpenness > 0) {
    const step = (Math.PI * 2) / rayCount;
    for (let i = 0; i < rayCount; i++) {
      const angle = step * i + rng() * 0.12;
      const pl = (10 + rng() * 4) * petalOpenness;
      const pw = (petalWidth + rng() * 0.8) * petalOpenness;

      elements.push({
        shape: { type: "petal", width: pw, length: pl, roundness: 0.3 },
        position: { x: cx, y: cy },
        rotation: angle,
        scale: 1.0,
        color: "#E8DCC8",
        zOffset: 1.0,
      });

      // Dewdrop dots at petal tips
      if (i < dewdropCount && petalOpenness > 0.5) {
        const tipDist = pl * 0.85;
        elements.push({
          shape: { type: "dot", radius: 0.4 + rng() * 0.3 },
          position: {
            x: cx + Math.cos(angle) * tipDist,
            y: cy + Math.sin(angle) * tipDist,
          },
          rotation: 0,
          scale: 1,
          color: "#C8E0F0",
          opacity: 0.5 + rng() * 0.3,
          zOffset: 1.8,
        });
      }
    }
  }

  // Golden center disc
  if (petalOpenness > 0.15) {
    const discRadius = 1.8 + petalOpenness * 1.2;
    elements.push({
      shape: { type: "disc", radius: discRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: "#D8C040",
      opacity: 0.72,
      zOffset: 2.0,
    });

    // Center dots
    const dotCount = Math.floor(2 + petalOpenness * 3);
    for (let i = 0; i < dotCount; i++) {
      const a = rng() * Math.PI * 2;
      const d = rng() * discRadius * 0.7;
      elements.push({
        shape: { type: "dot", radius: 0.2 + rng() * 0.25 },
        position: { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d },
        rotation: 0,
        scale: 1,
        color: "#C8A020",
        opacity: 0.4 + rng() * 0.3,
        zOffset: 2.1,
      });
    }
  }

  return elements;
}

export const wcDewdropDaisy: PlantVariant = {
  id: "wc-dewdrop-daisy",
  name: "Daisy",
  description:
    "A cheerful painted daisy with thin ray petals and dewdrop highlights that catch the light",
  rarity: 0.11,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      rayCount: { signal: "entropy", range: [6, 12], default: 8, round: true },
      dewdropCount: { signal: "spread", range: [2, 6], default: 4, round: true },
      petalWidth: { signal: "growth", range: [2.5, 4.5], default: 3.5 },
    },
  },
  colorVariations: [
    { name: "classic", weight: 1.0, palettes: { bloom: ["#E8DCC8", "#D8C040", "#6B8A65"] } },
    { name: "pink", weight: 0.6, palettes: { bloom: ["#D8B8C4", "#D08898", "#6B8A65"] } },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 380,
    clusterBonus: 2.0,
    maxClusterDensity: 6,
    reseedClusterChance: 0.7,
  },
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 12 },
      { name: "sprout", duration: 15 },
      { name: "bloom", duration: 45 },
      { name: "fade", duration: 20 },
    ],
    wcEffect: { layers: 3, opacity: 0.5, spread: 0.06, colorVariation: 0.04 },
    buildElements: buildWcDewdropDaisyElements,
  },
};
