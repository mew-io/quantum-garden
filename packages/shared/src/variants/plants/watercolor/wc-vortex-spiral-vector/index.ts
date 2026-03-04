/**
 * Watercolor Vortex Spiral Vector
 *
 * A deeper, more dramatic version of the vortex spiral with cosmic purples
 * and blues. More spiral arms, tighter curves, and additional particle density
 * create a nebula-like swirl.
 *
 * Category: watercolor (ethereal-vector adaptation)
 * Rarity: 0.02
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr, buildDiscCluster } from "../_helpers";

// -- Color palettes -----------------------------------------------------------

const VORTEX_VECTOR_COLORS = {
  cosmic: { core: "#5040A8", arm: "#7060C8", outer: "#382888" },
  nebula: { core: "#4060C0", arm: "#8040B0", outer: "#6050D0" },
};

// -- Builder ------------------------------------------------------------------

function buildWcVortexSpiralVectorElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const armCount = traitOr(ctx.traits, "armCount", 4);
  const spiralTightness = traitOr(ctx.traits, "spiralTightness", 1.2);
  const vortexRadius = traitOr(ctx.traits, "vortexRadius", 1.1);

  // Lifecycle openness
  let openness: number;
  const kf = ctx.keyframeName;
  if (kf === "dormant") {
    openness = 0;
  } else if (kf === "form") {
    openness = ctx.keyframeProgress * 0.3;
  } else if (kf === "spiral") {
    openness = 0.3 + ctx.keyframeProgress * 0.6;
  } else if (kf === "vortex") {
    openness = 0.9 + ctx.keyframeProgress * 0.1;
  } else {
    openness = 0.5;
  }

  if (openness <= 0) return elements;

  const colors =
    ctx.colorVariationName &&
    VORTEX_VECTOR_COLORS[ctx.colorVariationName as keyof typeof VORTEX_VECTOR_COLORS]
      ? VORTEX_VECTOR_COLORS[ctx.colorVariationName as keyof typeof VORTEX_VECTOR_COLORS]!
      : VORTEX_VECTOR_COLORS.cosmic;

  const cx = 32;
  const cy = 32;

  // -- Center disc cluster (3-4 overlapping discs, denser than base) ----------
  const centerDiscCount = 3 + Math.floor(rng() * 2);
  buildDiscCluster(
    elements,
    cx,
    cy,
    centerDiscCount,
    [2.0 * openness, 3.5 * openness],
    1.8,
    colors.core,
    0.55 * openness,
    1.0,
    rng
  );

  // -- Spiral arms (only once openness > 0.3) --------------------------------
  if (openness > 0.3) {
    const armProgress = Math.min(1, (openness - 0.3) / 0.6);
    const angleStep = (Math.PI * 2) / armCount;
    const baseAngleOffset = rng() * Math.PI * 2;

    for (let a = 0; a < armCount; a++) {
      const armBaseAngle = baseAngleOffset + a * angleStep;

      // More segments for tighter spiral detail
      const segmentCount = 5 + Math.floor(rng() * 3);
      const visibleSegments = Math.ceil(segmentCount * armProgress);
      const maxArmRadius = 15 * vortexRadius;

      // Generate spiral control points
      const points: [number, number][] = [[cx, cy]];
      for (let s = 1; s <= segmentCount; s++) {
        const t = s / segmentCount;
        const spiralAngle = armBaseAngle + t * Math.PI * spiralTightness * 1.5;
        const spiralDist = t * maxArmRadius * openness;
        points.push([
          cx + Math.cos(spiralAngle) * spiralDist,
          cy + Math.sin(spiralAngle) * spiralDist,
        ]);
      }

      // Build stem from spiral points
      const visiblePoints = points.slice(0, visibleSegments + 1);
      if (visiblePoints.length >= 2) {
        // Ensure at least 4 points for CatmullRom
        while (visiblePoints.length < 4) {
          const last = visiblePoints[visiblePoints.length - 1]!;
          const secondLast = visiblePoints[visiblePoints.length - 2]!;
          const dx = last[0] - secondLast[0];
          const dy = last[1] - secondLast[1];
          visiblePoints.push([last[0] + dx * 0.5, last[1] + dy * 0.5]);
        }

        elements.push({
          shape: {
            type: "stem",
            points: visiblePoints as [number, number][],
            thickness: 1.4 + rng() * 0.5,
          },
          position: { x: 0, y: 0 },
          rotation: 0,
          scale: 1,
          color: colors.arm,
          opacity: 0.42 * armProgress,
          zOffset: 0.5,
        });
      }

      // Tip disc at arm end
      if (armProgress > 0.5) {
        const tipIdx = Math.min(visibleSegments, points.length - 1);
        const tipPoint = points[tipIdx]!;
        elements.push({
          shape: { type: "disc", radius: 1.8 + rng() * 1.2 },
          position: { x: tipPoint[0], y: tipPoint[1] },
          rotation: 0,
          scale: armProgress,
          color: colors.arm,
          opacity: 0.35 + rng() * 0.12,
          zOffset: 0.8,
        });
      }

      // Particle dots along spiral arm -- denser than base variant
      const particleCount = Math.floor(4 * armProgress);
      for (let p = 0; p < particleCount; p++) {
        const t = (p + 1) / (particleCount + 1);
        const ptIdx = Math.min(Math.floor(t * visibleSegments), points.length - 1);
        const pt = points[ptIdx]!;
        const jitterX = (rng() - 0.5) * 3.5;
        const jitterY = (rng() - 0.5) * 3.5;
        elements.push({
          shape: { type: "dot", radius: 0.3 + rng() * 0.45 },
          position: { x: pt[0] + jitterX, y: pt[1] + jitterY },
          rotation: 0,
          scale: 1,
          color: colors.outer,
          opacity: 0.3 + rng() * 0.18,
          zOffset: 1.2,
        });
      }
    }
  }

  // -- Extra vortex particles (openness > 0.9) --------------------------------
  if (openness > 0.9) {
    const vortexProgress = (openness - 0.9) / 0.1;
    const extraCount = Math.floor(8 * vortexProgress);
    for (let i = 0; i < extraCount; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = 4 + rng() * 14 * vortexRadius;
      elements.push({
        shape: { type: "dot", radius: 0.25 + rng() * 0.5 },
        position: { x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist },
        rotation: 0,
        scale: 1,
        color: rng() > 0.5 ? colors.arm : colors.outer,
        opacity: 0.28 + rng() * 0.22,
        zOffset: 1.5,
      });
    }
  }

  return elements;
}

// -- Variant export -----------------------------------------------------------

export const wcVortexSpiralVector: PlantVariant = {
  id: "wc-vortex-spiral-vector",
  name: "Vortex Spiral Vector",
  description:
    "A deep cosmic vortex of swirling purple spiral arms with dense particle clouds, like a nebula painted in watercolor",
  rarity: 0.02,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      armCount: { signal: "entropy", range: [3, 6], default: 4, round: true },
      spiralTightness: { signal: "certainty", range: [0.6, 1.8], default: 1.2 },
      vortexRadius: { signal: "growth", range: [0.7, 1.5], default: 1.1 },
    },
  },
  colorVariations: [
    { name: "cosmic", weight: 1.0, palettes: { full: ["#5040A8", "#7060C8", "#382888"] } },
    { name: "nebula", weight: 0.6, palettes: { full: ["#4060C0", "#8040B0", "#6050D0"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "dormant", duration: 5 },
      { name: "form", duration: 12 },
      { name: "spiral", duration: 38 },
      { name: "vortex", duration: 15 },
    ],
    wcEffect: { layers: 3, opacity: 0.48, spread: 0.07, colorVariation: 0.05 },
    buildElements: buildWcVortexSpiralVectorElements,
  },
};
