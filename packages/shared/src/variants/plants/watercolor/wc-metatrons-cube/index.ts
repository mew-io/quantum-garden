/**
 * Watercolor Metatron's Cube
 *
 * Flower-of-life overlapping discs arranged in a hexagonal pattern, with
 * connecting stem lines between disc centers. Sacred geometry pattern.
 *
 * Category: watercolor (geometric / sacred geometry)
 * Rarity: 0.03
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr, radialPositions } from "../_helpers";

// -- Color palettes -----------------------------------------------------------

interface CubeColors {
  disc: string;
  connection: string;
  center: string;
}

const CUBE_COLORS: Record<string, CubeColors> = {
  gold: { disc: "#D8B868", connection: "#C8A858", center: "#E8D088" },
  silver: { disc: "#B0B8C0", connection: "#98A0A8", center: "#C8D0D8" },
};

const DEFAULT_COLORS: CubeColors = CUBE_COLORS.gold!;

// -- Openness curve -----------------------------------------------------------

function cubeOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "void":
      return 0;
    case "circles":
      return progress * 0.4; // 0 -> 0.4
    case "connect":
      return 0.4 + progress * 0.5; // 0.4 -> 0.9
    case "complete":
      return 0.9 + progress * 0.1; // 0.9 -> 1.0
    default:
      return 0.5;
  }
}

// -- Main builder -------------------------------------------------------------

function buildWcMetatronsCubeElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const ringCount = traitOr(ctx.traits, "ringCount", 2);
  const connectingLines = traitOr(ctx.traits, "connectingLines", 5);
  const hexagonScale = traitOr(ctx.traits, "hexagonScale", 1.0);

  const openness = cubeOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const colors =
    ctx.colorVariationName && CUBE_COLORS[ctx.colorVariationName]
      ? CUBE_COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const cx = 32;
  const cy = 32;
  const baseRadius = 5 * hexagonScale; // spacing between disc centers

  // Collect all disc center positions for connecting lines later
  const discCenters: Array<{ x: number; y: number }> = [];

  // -- Central disc -----------------------------------------------------------
  const circleOpenness = Math.min(1, openness / 0.4);
  if (circleOpenness > 0) {
    const discRadius = baseRadius * 0.8 * circleOpenness;
    elements.push({
      shape: { type: "disc", radius: discRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colors.center,
      opacity: 0.35,
      zOffset: 0.5,
    });
    discCenters.push({ x: cx, y: cy });
  }

  // -- First ring: 6 discs hexagonally arranged -------------------------------
  if (circleOpenness > 0.2) {
    const ring1Openness = (circleOpenness - 0.2) / 0.8;
    const ring1Positions = radialPositions(cx, cy, baseRadius * ring1Openness, 6, -Math.PI / 6);

    for (const pos of ring1Positions) {
      const discRadius = baseRadius * 0.8 * ring1Openness;
      elements.push({
        shape: { type: "disc", radius: discRadius },
        position: { x: pos.x, y: pos.y },
        rotation: 0,
        scale: 1,
        color: colors.disc,
        opacity: 0.3 + ring1Openness * 0.1,
        zOffset: 0.4,
      });
      discCenters.push({ x: pos.x, y: pos.y });
    }
  }

  // -- Second ring: 12 discs at next hexagonal shell --------------------------
  if (ringCount >= 2 && circleOpenness > 0.5) {
    const ring2Openness = (circleOpenness - 0.5) / 0.5;
    const outerDist = baseRadius * 2 * ring2Openness;

    // 6 discs directly outward from ring 1
    const ring2a = radialPositions(cx, cy, outerDist, 6, -Math.PI / 6);
    // 6 discs between the outer positions (rotated 30 degrees)
    const ring2b = radialPositions(cx, cy, outerDist * Math.cos(Math.PI / 6), 6, 0);

    for (const pos of [...ring2a, ...ring2b]) {
      const discRadius = baseRadius * 0.8 * ring2Openness;
      elements.push({
        shape: { type: "disc", radius: discRadius },
        position: { x: pos.x, y: pos.y },
        rotation: 0,
        scale: 1,
        color: colors.disc,
        opacity: 0.25 + ring2Openness * 0.1,
        zOffset: 0.3,
      });
      discCenters.push({ x: pos.x, y: pos.y });
    }
  }

  // -- Third ring (if ringCount >= 3) -----------------------------------------
  if (ringCount >= 3 && circleOpenness > 0.7) {
    const ring3Openness = (circleOpenness - 0.7) / 0.3;
    const outerDist = baseRadius * 3 * ring3Openness;

    const ring3 = radialPositions(cx, cy, outerDist, 12, rng() * Math.PI * 0.1);
    for (const pos of ring3) {
      const discRadius = baseRadius * 0.7 * ring3Openness;
      elements.push({
        shape: { type: "disc", radius: discRadius },
        position: { x: pos.x, y: pos.y },
        rotation: 0,
        scale: 1,
        color: colors.disc,
        opacity: 0.2 + ring3Openness * 0.1,
        zOffset: 0.2,
      });
      discCenters.push({ x: pos.x, y: pos.y });
    }
  }

  // -- Connecting stem lines between disc centers -----------------------------
  const connectOpenness = Math.max(0, (openness - 0.4) / 0.5);
  if (connectOpenness > 0 && discCenters.length >= 2) {
    // Build connections by selecting pairs from disc centers
    const maxConnections = Math.min(connectingLines, discCenters.length * 2);
    let linesDrawn = 0;

    for (let i = 0; i < discCenters.length && linesDrawn < maxConnections; i++) {
      for (let j = i + 1; j < discCenters.length && linesDrawn < maxConnections; j++) {
        const a = discCenters[i]!;
        const b = discCenters[j]!;
        const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

        // Only connect relatively close centers (within ~2 base radii)
        if (dist < baseRadius * 2.5 && rng() < 0.6) {
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          elements.push({
            shape: {
              type: "stem",
              points: [
                [a.x, a.y],
                [midX + rng() * 0.3 - 0.15, midY + rng() * 0.3 - 0.15],
                [midX - rng() * 0.3 + 0.15, midY - rng() * 0.3 + 0.15],
                [b.x, b.y],
              ],
              thickness: 0.25 * connectOpenness,
            },
            position: { x: 0, y: 0 },
            rotation: 0,
            scale: 1,
            color: colors.connection,
            opacity: 0.3 + connectOpenness * 0.2,
            zOffset: 1.0,
          });
          linesDrawn++;
        }
      }
    }
  }

  return elements;
}

// -- Variant export -----------------------------------------------------------

export const wcMetatronsCube: PlantVariant = {
  id: "wc-metatrons-cube",
  name: "Metatron's Cube",
  description:
    "Overlapping flower-of-life discs in a hexagonal sacred geometry pattern, its rings shaped by quantum spread",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      ringCount: { signal: "spread", range: [1, 3], default: 2, round: true },
      connectingLines: { signal: "entropy", range: [3, 8], default: 5, round: true },
      hexagonScale: { signal: "growth", range: [0.7, 1.3], default: 1.0 },
    },
  },
  colorVariations: [
    { name: "gold", weight: 1.0, palettes: { full: ["#D8B868", "#C8A858", "#E8D088"] } },
    { name: "silver", weight: 0.7, palettes: { full: ["#B0B8C0", "#98A0A8", "#C8D0D8"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "void", duration: 5 },
      { name: "circles", duration: 20 },
      { name: "connect", duration: 35 },
      { name: "complete", duration: 15 },
    ],
    wcEffect: { layers: 3, opacity: 0.4, spread: 0.05, colorVariation: 0.03 },
    buildElements: buildWcMetatronsCubeElements,
  },
};
