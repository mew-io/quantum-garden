/**
 * Foxglove Spire
 *
 * A tall vertical spike with 4-6 bell-like blooms arranged vertically,
 * opening sequentially from bottom to top. Lower blooms are fully open
 * while upper ones are still budding, creating a cascade effect. Like
 * a foxglove or delphinium.
 *
 * Category: watercolor (flowers)
 * Rarity: 0.10
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr, buildLeaf } from "../_helpers";

const FOXGLOVE_COLORS: Record<
  string,
  { bell: string; throat: string; stem: string; leaf: string }
> = {
  foxglove: { bell: "#D898C0", throat: "#C070A0", stem: "#6B8A58", leaf: "#7A9E68" },
  royal: { bell: "#9878C8", throat: "#7858A8", stem: "#6B8A58", leaf: "#7A9E68" },
  sunset: { bell: "#E8A888", throat: "#D08068", stem: "#6B8A58", leaf: "#7A9E68" },
  ivory: { bell: "#F0E8D8", throat: "#D8D0B8", stem: "#6B8A58", leaf: "#7A9E68" },
};

const DEFAULT_COLORS = FOXGLOVE_COLORS.foxglove!;

/**
 * Custom 5-phase lifecycle for foxglove sequential opening.
 * shoot: stem grows
 * spike: buds form along spike
 * cascade: bells open bottom-to-top
 * full: all bells open
 * fade: graceful fade
 */
function foxgloveOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "shoot":
      return 0.05 + progress * 0.1; // 0.05 -> 0.15
    case "spike":
      return 0.15 + progress * 0.25; // 0.15 -> 0.40
    case "cascade":
      return 0.4 + progress * 0.4; // 0.40 -> 0.80
    case "full":
      return 0.8 + progress * 0.2; // 0.80 -> 1.00
    case "fade":
      return 1.0 - progress * 0.35; // 1.00 -> 0.65
    default:
      return 0.5;
  }
}

/**
 * Render a single bell bloom facing outward from the spike.
 * facingLeft: true = bell faces left, false = faces right.
 */
function renderBell(
  elements: WatercolorElement[],
  cx: number,
  cy: number,
  bellOpenness: number,
  facingLeft: boolean,
  colorSet: { bell: string; throat: string; stem: string; leaf: string },
  rng: () => number
): void {
  if (bellOpenness <= 0.05) {
    // Render as a tiny bud (single narrow petal pointing up)
    elements.push({
      shape: { type: "petal", width: 1.2, length: 2.5, roundness: 0.9 },
      position: { x: cx, y: cy },
      rotation: -Math.PI / 2 + (rng() - 0.5) * 0.2,
      scale: 1.0,
      color: colorSet.bell,
      opacity: 0.6,
      zOffset: 1.0,
    });
    return;
  }

  const petalCount = 3;
  // Base direction: left-facing bells point left-downward, right-facing point right-downward
  const baseAngle = facingLeft ? Math.PI * 0.7 : Math.PI * 0.3;
  const maxSpread = 0.5 * bellOpenness;

  for (let i = 0; i < petalCount; i++) {
    const offsetIndex = i - 1; // -1, 0, 1
    const angle = baseAngle + offsetIndex * maxSpread + rng() * 0.1;
    const pw = (2.5 + rng() * 1.0) * (0.6 + bellOpenness * 0.4);
    const pl = (4.0 + rng() * 1.5) * (0.6 + bellOpenness * 0.4);

    elements.push({
      shape: { type: "petal", width: pw, length: pl, roundness: 0.85 },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.bell,
      zOffset: 1.0,
    });
  }

  // Throat dot visible when bell is open enough
  if (bellOpenness > 0.3) {
    const throatOpacity = Math.min(1, (bellOpenness - 0.3) / 0.4);
    const throatDir = facingLeft ? -1 : 1;
    elements.push({
      shape: { type: "dot", radius: 0.35 + rng() * 0.25 },
      position: {
        x: cx + throatDir * (1.5 + rng() * 0.8),
        y: cy + 1.0 + rng() * 0.8,
      },
      rotation: 0,
      scale: 1,
      color: colorSet.throat,
      opacity: 0.45 * throatOpacity,
      zOffset: 1.5,
    });
  }

  // Spotted throat markings at full bloom
  if (bellOpenness > 0.6) {
    const spotCount = 1 + Math.floor(rng() * 2);
    const spotDir = facingLeft ? -1 : 1;
    for (let i = 0; i < spotCount; i++) {
      elements.push({
        shape: { type: "dot", radius: 0.15 + rng() * 0.15 },
        position: {
          x: cx + spotDir * (1.0 + rng() * 1.2),
          y: cy + 0.5 + rng() * 1.5,
        },
        rotation: 0,
        scale: 1,
        color: colorSet.throat,
        opacity: 0.3 + rng() * 0.2,
        zOffset: 1.6,
      });
    }
  }
}

function buildWcFoxgloveSpireElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const bellCount = traitOr(ctx.traits, "bellCount", 5);
  const bellOpennessTrait = traitOr(ctx.traits, "bellOpenness", 0.75);
  const spireHeight = traitOr(ctx.traits, "spireHeight", 32);

  const openness = foxgloveOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const leafOpenness = Math.max(0, (openness - 0.1) / 0.9);

  const colors =
    ctx.colorVariationName && FOXGLOVE_COLORS[ctx.colorVariationName]
      ? FOXGLOVE_COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const cx = 32;
  const stemBottom = 56;
  const stemTop = stemBottom - spireHeight;

  // === MAIN SPIKE (tall, nearly straight) ===
  const curveDir = rng() > 0.5 ? 1 : -1;
  const curveOffset = 1.5 * curveDir; // very slight curve

  elements.push({
    shape: {
      type: "stem",
      points: [
        [cx, stemBottom],
        [cx + curveOffset * 0.3, stemBottom - spireHeight * 0.33],
        [cx + curveOffset * 0.6, stemBottom - spireHeight * 0.66],
        [cx + curveOffset * 0.2, stemTop],
      ],
      thickness: 0.7 + openness * 0.3,
    },
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: 1,
    color: colors.stem,
    opacity: 0.58,
    zOffset: 0,
  });

  // === BASAL LEAVES (2-3 broad leaves at the bottom) ===
  const leafCount = 2 + Math.floor(rng() * 2);
  for (let i = 0; i < leafCount; i++) {
    if (leafOpenness <= 0) break;
    const side = i % 2 === 0 ? 1 : -1;
    const leafY = stemBottom - 4 - i * 5;

    buildLeaf(
      elements,
      cx + side * 2.5,
      leafY,
      side * (0.35 + rng() * 0.4),
      (0.5 + rng() * 0.35) * leafOpenness,
      5,
      10,
      colors.leaf,
      0.5
    );
  }

  // === BELLS ALONG THE SPIKE ===
  const clampedBellCount = Math.max(4, Math.min(6, Math.round(bellCount)));

  // Bell zone: upper 70% of the spike
  const bellZoneTop = stemTop + spireHeight * 0.1;
  const bellZoneBottom = stemTop + spireHeight * 0.7;

  for (let i = 0; i < clampedBellCount; i++) {
    // t: 0 = bottom bell (most open), 1 = top bell (least open)
    const t = clampedBellCount > 1 ? i / (clampedBellCount - 1) : 0;
    const bellY = bellZoneBottom - t * (bellZoneBottom - bellZoneTop);

    // Alternate sides
    const facingLeft = i % 2 === 0;
    const side = facingLeft ? -1 : 1;
    const bellX = cx + side * (3 + rng() * 2);

    // Interpolate stem position at this height for branch origin
    const stemT = (stemBottom - bellY) / spireHeight;
    const stemXAtBell = cx + curveOffset * stemT * 0.5;

    // Short branch stem from spike to bell
    elements.push({
      shape: {
        type: "stem",
        points: [
          [stemXAtBell, bellY],
          [(stemXAtBell + bellX) / 2, bellY - 0.5],
          [bellX, bellY],
          [bellX, bellY],
        ],
        thickness: 0.3 + openness * 0.15,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: colors.stem,
      opacity: 0.45,
      zOffset: 0.2,
    });

    // Sequential opening: bottom bells are most open, top bells are buds
    const positionFactor = 1.0 - t * 0.6; // bottom: 1.0, top: 0.4
    const effectiveBellOpen = openness * bellOpennessTrait * positionFactor;

    renderBell(elements, bellX, bellY, effectiveBellOpen, facingLeft, colors, rng);
  }

  return elements;
}

export const wcFoxgloveSpire: PlantVariant = {
  id: "wc-foxglove-spire",
  name: "Foxglove Spire",
  description:
    "A tall spire of bell-shaped blooms opening sequentially from bottom to top, their cascade driven by quantum spread",
  rarity: 0.1,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      bellCount: { signal: "entropy", range: [4, 6], default: 5, round: true },
      bellOpenness: { signal: "spread", range: [0.5, 1.0], default: 0.75 },
      spireHeight: { signal: "growth", range: [28, 38], default: 32 },
    },
  },
  colorVariations: [
    { name: "foxglove", weight: 1.0, palettes: { bloom: ["#D898C0", "#C070A0", "#6B8A58"] } },
    { name: "royal", weight: 0.8, palettes: { bloom: ["#9878C8", "#7858A8", "#6B8A58"] } },
    { name: "sunset", weight: 0.7, palettes: { bloom: ["#E8A888", "#D08068", "#6B8A58"] } },
    { name: "ivory", weight: 0.6, palettes: { bloom: ["#F0E8D8", "#D8D0B8", "#6B8A58"] } },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 380,
    clusterBonus: 2.0,
    maxClusterDensity: 5,
    reseedClusterChance: 0.6,
  },
  watercolorConfig: {
    keyframes: [
      { name: "shoot", duration: 12 },
      { name: "spike", duration: 18 },
      { name: "cascade", duration: 35 },
      { name: "full", duration: 30 },
      { name: "fade", duration: 20 },
    ],
    wcEffect: { layers: 3, opacity: 0.46, spread: 0.055, colorVariation: 0.045 },
    buildElements: buildWcFoxgloveSpireElements,
  },
};
