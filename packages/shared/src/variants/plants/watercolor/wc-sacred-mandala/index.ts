/**
 * Watercolor Sacred Mandala
 *
 * Concentric disc rings + radial stem lines + diamond-shaped petals.
 * Classic mandala pattern with radial symmetry. Center disc glows bright
 * while outer rings fade in opacity.
 *
 * Category: watercolor (geometric / sacred geometry)
 * Rarity: 0.03
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr, radialPositions } from "../_helpers";

// -- Color palettes -----------------------------------------------------------

interface MandalaColors {
  ring: string;
  radial: string;
  petal: string;
  center: string;
}

const MANDALA_COLORS: Record<string, MandalaColors> = {
  lotus: { ring: "#D88098", radial: "#D8A868", petal: "#C07088", center: "#E8A0B0" },
  ocean: { ring: "#5890B8", radial: "#70A8D0", petal: "#4878A0", center: "#80C0E0" },
};

const DEFAULT_COLORS: MandalaColors = MANDALA_COLORS.lotus!;

// -- Openness curve -----------------------------------------------------------

function mandalaOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "void":
      return 0;
    case "rings":
      return progress * 0.3; // 0 -> 0.3
    case "radial":
      return 0.3 + progress * 0.5; // 0.3 -> 0.8
    case "mandala":
      return 0.8 + progress * 0.2; // 0.8 -> 1.0
    default:
      return 0.5;
  }
}

// -- Main builder -------------------------------------------------------------

function buildWcSacredMandalaElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const ringCount = traitOr(ctx.traits, "ringCount", 3);
  const radialLineCount = traitOr(ctx.traits, "radialLineCount", 6);
  const diamondSize = traitOr(ctx.traits, "diamondSize", 1.0);

  const openness = mandalaOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const colors =
    ctx.colorVariationName && MANDALA_COLORS[ctx.colorVariationName]
      ? MANDALA_COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const cx = 32;
  const cy = 32;
  const maxRadius = 16;

  // -- Center disc (bright) ---------------------------------------------------
  if (openness > 0) {
    const centerRadius = 1.5 + openness * 1.0;
    elements.push({
      shape: { type: "disc", radius: centerRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colors.center,
      opacity: 0.6 + openness * 0.2,
      zOffset: 2.0,
    });
  }

  // -- Concentric disc rings --------------------------------------------------
  const ringOpenness = Math.min(1, openness / 0.3);
  if (ringOpenness > 0) {
    for (let r = 1; r <= ringCount; r++) {
      const ringRadius = ((maxRadius * r) / (ringCount + 1)) * ringOpenness;
      const ringOpacity = 0.25 - (r - 1) * 0.04; // dimmer toward outer rings
      elements.push({
        shape: { type: "disc", radius: ringRadius },
        position: { x: cx, y: cy },
        rotation: 0,
        scale: 1,
        color: colors.ring,
        opacity: Math.max(0.1, ringOpacity) * ringOpenness,
        zOffset: 0.1 + r * 0.05,
      });
    }
  }

  // -- Radial stem lines from center outward ----------------------------------
  const radialOpenness = Math.max(0, (openness - 0.3) / 0.5);
  if (radialOpenness > 0) {
    const lineLength = maxRadius * radialOpenness;
    const angleStep = (Math.PI * 2) / radialLineCount;

    for (let i = 0; i < radialLineCount; i++) {
      const angle = angleStep * i + rng() * 0.05;
      const endX = cx + Math.cos(angle) * lineLength;
      const endY = cy + Math.sin(angle) * lineLength;
      const midX = (cx + endX) / 2;
      const midY = (cy + endY) / 2;

      elements.push({
        shape: {
          type: "stem",
          points: [
            [cx, cy],
            [midX + rng() * 0.4 - 0.2, midY + rng() * 0.4 - 0.2],
            [midX - rng() * 0.4 + 0.2, midY - rng() * 0.4 + 0.2],
            [endX, endY],
          ],
          thickness: 0.3 * radialOpenness,
        },
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        color: colors.radial,
        opacity: 0.35 + radialOpenness * 0.2,
        zOffset: 0.8,
      });
    }
  }

  // -- Diamond-shaped petals between rings ------------------------------------
  const petalOpenness = Math.max(0, (openness - 0.5) / 0.5);
  if (petalOpenness > 0 && ringCount >= 2) {
    // Place petals at radial positions between each pair of adjacent rings
    for (let r = 1; r < ringCount; r++) {
      const innerRingR = (maxRadius * r) / (ringCount + 1);
      const outerRingR = (maxRadius * (r + 1)) / (ringCount + 1);
      const petalRadius = (innerRingR + outerRingR) / 2;
      const petalLen = (outerRingR - innerRingR) * 0.6 * diamondSize * petalOpenness;
      const petalW = petalLen * 0.5;

      const petalPositions = radialPositions(cx, cy, petalRadius * petalOpenness, radialLineCount);

      for (const pos of petalPositions) {
        elements.push({
          shape: { type: "petal", width: petalW, length: petalLen, roundness: 0.3 },
          position: { x: pos.x, y: pos.y },
          rotation: pos.angle + Math.PI / 2,
          scale: petalOpenness,
          color: colors.petal,
          opacity: 0.3 + petalOpenness * 0.15,
          zOffset: 1.0 + r * 0.1,
        });
      }
    }
  }

  // -- Dot accents at ring-line intersections ----------------------------------
  const dotOpenness = Math.max(0, (openness - 0.8) / 0.2);
  if (dotOpenness > 0) {
    for (let r = 1; r <= ringCount; r++) {
      const ringRadius = (maxRadius * r) / (ringCount + 1);
      const intersections = radialPositions(cx, cy, ringRadius * dotOpenness, radialLineCount);

      for (const pos of intersections) {
        elements.push({
          shape: { type: "dot", radius: 0.3 + rng() * 0.3 },
          position: { x: pos.x, y: pos.y },
          rotation: 0,
          scale: 1,
          color: colors.center,
          opacity: 0.4 + rng() * 0.3,
          zOffset: 2.5,
        });
      }
    }
  }

  return elements;
}

// -- Variant export -----------------------------------------------------------

export const wcSacredMandala: PlantVariant = {
  id: "wc-sacred-mandala",
  name: "Sacred Mandala",
  description:
    "A radially symmetric mandala of concentric rings, radial lines, and diamond petals, its complexity shaped by quantum entropy",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      ringCount: { signal: "entropy", range: [2, 5], default: 3, round: true },
      radialLineCount: { signal: "spread", range: [4, 8], default: 6, round: true },
      diamondSize: { signal: "growth", range: [0.6, 1.4], default: 1.0 },
    },
  },
  colorVariations: [
    { name: "lotus", weight: 1.0, palettes: { full: ["#D88098", "#D8A868", "#C07088"] } },
    { name: "ocean", weight: 0.7, palettes: { full: ["#5890B8", "#70A8D0", "#4878A0"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "void", duration: 5 },
      { name: "rings", duration: 15 },
      { name: "radial", duration: 30 },
      { name: "mandala", duration: 25 },
    ],
    wcEffect: { layers: 3, opacity: 0.48, spread: 0.05, colorVariation: 0.04 },
    buildElements: buildWcSacredMandalaElements,
  },
};
