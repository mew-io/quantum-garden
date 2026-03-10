/**
 * Watercolor Vortex Spiral
 *
 * Spiral arms emanating from a center point, like a galaxy or whirlpool.
 * Concentric discs at center, spiral stem arms curving outward, and
 * dot particles at arm tips.
 *
 * Category: watercolor (abstract/cosmic)
 * Rarity: 0.03
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr, buildDiscCluster } from "../_helpers";

const VORTEX_COLORS = {
  storm: { core: "#6080A8", arm: "#8098C0", outer: "#485878" },
  fire: { core: "#D88050", arm: "#E8A070", outer: "#C07040" },
};

function buildWcVortexSpiralElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const armCount = traitOr(ctx.traits, "armCount", 3);
  const spiralTightness = traitOr(ctx.traits, "spiralTightness", 1.0);
  const vortexRadius = traitOr(ctx.traits, "vortexRadius", 1.0);

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
    ctx.colorVariationName && VORTEX_COLORS[ctx.colorVariationName as keyof typeof VORTEX_COLORS]
      ? VORTEX_COLORS[ctx.colorVariationName as keyof typeof VORTEX_COLORS]!
      : VORTEX_COLORS.storm;

  const cx = 32;
  const cy = 32;

  // Center disc cluster (2-3 overlapping discs)
  const centerDiscCount = 2 + Math.floor(rng() * 2);
  buildDiscCluster(
    elements,
    cx,
    cy,
    centerDiscCount,
    [2.5 * openness, 4.0 * openness],
    1.5,
    colors.core,
    0.55 * openness,
    1.0,
    rng
  );

  // Spiral arms (only once openness > 0.3)
  if (openness > 0.3) {
    const armProgress = Math.min(1, (openness - 0.3) / 0.6);
    const angleStep = (Math.PI * 2) / armCount;
    const baseAngleOffset = rng() * Math.PI * 2;

    for (let a = 0; a < armCount; a++) {
      const armBaseAngle = baseAngleOffset + a * angleStep;

      // Each arm is a series of stem segments curving outward in a spiral
      const segmentCount = 4 + Math.floor(rng() * 3);
      const visibleSegments = Math.ceil(segmentCount * armProgress);
      const maxArmRadius = 14 * vortexRadius;

      // Generate spiral control points for this arm
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

      // Build the stem from the spiral points (up to visible segments)
      const visiblePoints = points.slice(0, visibleSegments + 1);
      if (visiblePoints.length >= 2) {
        // Ensure at least 4 points for CatmullRom by padding if needed
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
            thickness: 1.2 + rng() * 0.6,
          },
          position: { x: 0, y: 0 },
          rotation: 0,
          scale: 1,
          color: colors.arm,
          opacity: 0.4 * armProgress,
          zOffset: 0.5,
        });
      }

      // Small disc at arm tip for visual weight
      if (armProgress > 0.5) {
        const tipIdx = Math.min(visibleSegments, points.length - 1);
        const tipPoint = points[tipIdx]!;
        elements.push({
          shape: { type: "disc", radius: 1.5 + rng() * 1.0 },
          position: { x: tipPoint[0], y: tipPoint[1] },
          rotation: 0,
          scale: armProgress,
          color: colors.arm,
          opacity: 0.35 + rng() * 0.1,
          zOffset: 0.8,
        });
      }

      // Dot particles along spiral arm
      const particleCount = Math.floor(3 * armProgress);
      for (let p = 0; p < particleCount; p++) {
        const t = (p + 1) / (particleCount + 1);
        const ptIdx = Math.min(Math.floor(t * visibleSegments), points.length - 1);
        const pt = points[ptIdx]!;
        const jitterX = (rng() - 0.5) * 3;
        const jitterY = (rng() - 0.5) * 3;
        elements.push({
          shape: { type: "dot", radius: 0.3 + rng() * 0.4 },
          position: { x: pt[0] + jitterX, y: pt[1] + jitterY },
          rotation: 0,
          scale: 1,
          color: colors.outer,
          opacity: 0.3 + rng() * 0.15,
          zOffset: 1.2,
        });
      }
    }
  }

  // Extra particles in vortex phase (openness > 0.9)
  if (openness > 0.9) {
    const vortexProgress = (openness - 0.9) / 0.1;
    const extraCount = Math.floor(6 * vortexProgress);
    for (let i = 0; i < extraCount; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = 4 + rng() * 12 * vortexRadius;
      elements.push({
        shape: { type: "dot", radius: 0.2 + rng() * 0.5 },
        position: { x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist },
        rotation: 0,
        scale: 1,
        color: rng() > 0.5 ? colors.arm : colors.outer,
        opacity: 0.25 + rng() * 0.2,
        zOffset: 1.5,
      });
    }
  }

  return elements;
}

export const wcVortexSpiral: PlantVariant = {
  id: "wc-vortex-spiral",
  name: "Vortex Spiral",
  disabled: true,
  description:
    "Spiral arms emanating from a center point like a galaxy or whirlpool, painted in swirling watercolor washes",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      armCount: { signal: "entropy", range: [2, 5], default: 3, round: true },
      spiralTightness: { signal: "certainty", range: [0.5, 1.5], default: 1.0 },
      vortexRadius: { signal: "growth", range: [0.6, 1.4], default: 1.0 },
    },
  },
  colorVariations: [
    { name: "storm", weight: 1.0, palettes: { full: ["#6080A8", "#8098C0", "#485878"] } },
    { name: "fire", weight: 0.6, palettes: { full: ["#D88050", "#E8A070", "#C07040"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "dormant", duration: 5 },
      { name: "form", duration: 15 },
      { name: "spiral", duration: 40 },
      { name: "vortex", duration: 15 },
    ],
    wcEffect: { layers: 3, opacity: 0.48, spread: 0.06, colorVariation: 0.04 },
    buildElements: buildWcVortexSpiralElements,
  },
};
