/**
 * Watercolor Stellar Geometry
 *
 * Star polygon -- sharp petal points radiating from center + connecting stem
 * lines between alternate points (creating the inner polygon). Like a star
 * of David or pentagram drawn in watercolor.
 *
 * Category: watercolor (geometric)
 * Rarity: 0.03
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr, radialPositions } from "../_helpers";

// -- Color palettes -----------------------------------------------------------

interface StellarColors {
  point: string;
  connection: string;
  center: string;
}

const STELLAR_COLORS: Record<string, StellarColors> = {
  stellar: { point: "#A8B8D0", connection: "#8898B8", center: "#C0D0E0" },
  ruby: { point: "#B85060", connection: "#D07080", center: "#A04050" },
};

const DEFAULT_COLORS: StellarColors = STELLAR_COLORS.stellar!;

// -- Openness curve -----------------------------------------------------------

function stellarOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "void":
      return 0;
    case "points":
      return progress * 0.35; // 0 -> 0.35
    case "connect":
      return 0.35 + progress * 0.55; // 0.35 -> 0.9
    case "glow":
      return 0.9 + progress * 0.1; // 0.9 -> 1.0
    default:
      return 0.5;
  }
}

// -- Main builder -------------------------------------------------------------

function buildWcStellarGeometryElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const pointCount = traitOr(ctx.traits, "pointCount", 6);
  const innerRadiusRatio = traitOr(ctx.traits, "innerRadiusRatio", 0.45);
  const rotationAngle = traitOr(ctx.traits, "rotationAngle", 0.2);

  const openness = stellarOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const colors =
    ctx.colorVariationName && STELLAR_COLORS[ctx.colorVariationName]
      ? STELLAR_COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const cx = 32;
  const cy = 32;
  const outerRadius = 14;
  const innerRadius = outerRadius * innerRadiusRatio;
  const baseRotation = rotationAngle * Math.PI;

  // -- Center disc ------------------------------------------------------------
  if (openness > 0) {
    const centerR = 1.2 + openness * 0.8;
    elements.push({
      shape: { type: "disc", radius: centerR },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colors.center,
      opacity: 0.55 + openness * 0.2,
      zOffset: 2.0,
    });
  }

  // -- Star point petals (sharp, low roundness) -------------------------------
  const pointOpenness = Math.min(1, openness / 0.35);
  if (pointOpenness > 0) {
    const pointPositions = radialPositions(cx, cy, 0, pointCount, baseRotation);

    for (const pos of pointPositions) {
      const petalLength = outerRadius * pointOpenness;
      const petalWidth = (2.0 + rng() * 1.0) * pointOpenness;

      elements.push({
        shape: { type: "petal", width: petalWidth, length: petalLength, roundness: 0.25 },
        position: { x: cx, y: cy },
        rotation: pos.angle,
        scale: 1.0,
        color: colors.point,
        zOffset: 0.5,
      });

      // Small dot at each point tip
      if (pointOpenness > 0.4) {
        const tipX = cx + Math.cos(pos.angle) * (outerRadius * pointOpenness);
        const tipY = cy + Math.sin(pos.angle) * (outerRadius * pointOpenness);
        elements.push({
          shape: { type: "dot", radius: 0.35 + rng() * 0.3 },
          position: { x: tipX, y: tipY },
          rotation: 0,
          scale: 1,
          color: colors.center,
          opacity: 0.45 + rng() * 0.25,
          zOffset: 2.5,
        });
      }
    }
  }

  // -- Inner polygon: stems connecting every-other point (skip-1) -------------
  const connectOpenness = Math.max(0, (openness - 0.35) / 0.55);
  if (connectOpenness > 0) {
    // Compute the tip positions at the outer radius
    const tipPositions = radialPositions(
      cx,
      cy,
      outerRadius * connectOpenness,
      pointCount,
      baseRotation
    );

    // Connect every-other point to create the inner star polygon
    for (let i = 0; i < pointCount; i++) {
      const from = tipPositions[i]!;
      const to = tipPositions[(i + 2) % pointCount]!;

      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;

      elements.push({
        shape: {
          type: "stem",
          points: [
            [from.x, from.y],
            [midX + rng() * 0.4 - 0.2, midY + rng() * 0.4 - 0.2],
            [midX - rng() * 0.4 + 0.2, midY - rng() * 0.4 + 0.2],
            [to.x, to.y],
          ],
          thickness: 0.3 * connectOpenness,
        },
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        color: colors.connection,
        opacity: 0.35 + connectOpenness * 0.2,
        zOffset: 1.0,
      });
    }

    // Inner disc ring at the inner radius
    if (connectOpenness > 0.3) {
      elements.push({
        shape: { type: "disc", radius: innerRadius * connectOpenness },
        position: { x: cx, y: cy },
        rotation: 0,
        scale: 1,
        color: colors.connection,
        opacity: 0.15 + connectOpenness * 0.1,
        zOffset: 0.3,
      });
    }
  }

  // -- Glow phase: highlight dots along connecting lines ----------------------
  if (ctx.keyframeName === "glow" && openness > 0.9) {
    const tipPositions = radialPositions(cx, cy, outerRadius, pointCount, baseRotation);

    for (let i = 0; i < pointCount; i++) {
      const from = tipPositions[i]!;
      const to = tipPositions[(i + 2) % pointCount]!;

      // Place 2-3 dots along each connecting line
      const dotCount = 2 + Math.floor(rng() * 2);
      for (let d = 0; d < dotCount; d++) {
        const t = (d + 1) / (dotCount + 1);
        const dx = from.x + (to.x - from.x) * t + rng() * 0.6 - 0.3;
        const dy = from.y + (to.y - from.y) * t + rng() * 0.6 - 0.3;

        elements.push({
          shape: { type: "dot", radius: 0.2 + rng() * 0.25 },
          position: { x: dx, y: dy },
          rotation: 0,
          scale: 1,
          color: colors.center,
          opacity: 0.3 + rng() * 0.35,
          zOffset: 3.0,
        });
      }
    }
  }

  return elements;
}

// -- Variant export -----------------------------------------------------------

export const wcStellarGeometry: PlantVariant = {
  id: "wc-stellar-geometry",
  name: "Stellar Geometry",
  description:
    "A star polygon of sharp radiating points with an inner connecting polygon, its form driven by quantum entropy",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      pointCount: { signal: "entropy", range: [5, 8], default: 6, round: true },
      innerRadiusRatio: { signal: "certainty", range: [0.3, 0.6], default: 0.45 },
      rotationAngle: { signal: "parityBias", range: [0, 0.5], default: 0.2 },
    },
  },
  colorVariations: [
    { name: "stellar", weight: 1.0, palettes: { full: ["#A8B8D0", "#8898B8", "#C0D0E0"] } },
    { name: "ruby", weight: 0.6, palettes: { full: ["#B85060", "#D07080", "#A04050"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "void", duration: 5 },
      { name: "points", duration: 15 },
      { name: "connect", duration: 35 },
      { name: "glow", duration: 15 },
    ],
    wcEffect: { layers: 3, opacity: 0.5, spread: 0.04, colorVariation: 0.03 },
    buildElements: buildWcStellarGeometryElements,
  },
};
