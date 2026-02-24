/**
 * Watercolor Bell Cluster
 *
 * Three hanging bell-shaped flowers on arching branch stems, each opening
 * independently based on quantum-determined traits. The bells cascade open
 * one by one, driven by a GHZ-like 3-qubit entanglement circuit.
 *
 * Category: watercolor (flowers)
 * Rarity: 0.06 (base 0.4 × 0.15)
 * Render mode: watercolor
 * Path A: custom Python circuit (wc_bell_cluster) encodes bell openness directly
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr } from "../_helpers";

/**
 * Color sets for the bell cluster, keyed by color variation name.
 */
const BELL_CLUSTER_COLORS: Record<
  string,
  { primary: string; accent: string; stem: string; leaf: string }
> = {
  lilac: { primary: "#C8A8D8", accent: "#A080C0", stem: "#8EA888", leaf: "#9AAE8C" },
  white: { primary: "#F0EEF0", accent: "#D8D0E0", stem: "#8EA888", leaf: "#9AAE8C" },
  blush: { primary: "#E8C0D0", accent: "#D0A0B8", stem: "#8EA888", leaf: "#9AAE8C" },
};

const BELL_CLUSTER_DEFAULT_COLORS = BELL_CLUSTER_COLORS.lilac!;

/**
 * Bell positions in 64×64 canvas space: [cx, cy] for each bell center.
 * Left bell hangs lower-left, center bell lowest-center, right bell upper-right.
 */
const BELL_POSITIONS: [number, number][] = [
  [18, 30], // left bell
  [32, 35], // center bell
  [46, 28], // right bell
];

/**
 * Get the lifecycle openness factor for bell cluster keyframes.
 * Controls how "open" the bells are at each stage.
 */
function getBellClusterOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "dormant":
      return 0; // nothing visible
    case "hang":
      return 0.1 + progress * 0.2; // 0.1 → 0.3
    case "cascade":
      return 0.3 + progress * 0.5; // 0.3 → 0.8
    case "all-open":
      return 0.8 + progress * 0.2; // 0.8 → 1.0
    case "rest":
      return 1.0 - progress * 0.3; // 1.0 → 0.7
    default:
      return 0.5;
  }
}

/**
 * Render a single hanging bell flower at a given position.
 *
 * Each bell is an inverted tulip cup made of 3 downward-pointing petals.
 * When closed the petals are tight together; when open they spread apart.
 * An open bell reveals a small dot "clapper" inside.
 */
function renderBell(
  elements: WatercolorElement[],
  cx: number,
  cy: number,
  bellOpenness: number,
  colorSet: { primary: string; accent: string; stem: string; leaf: string },
  rng: () => number
): void {
  if (bellOpenness <= 0) return;

  const petalCount = 3;
  // When closed, petals are nearly parallel (small angle spread).
  // When open, they fan outward. Base angle is downward (π/2).
  const maxSpread = 0.6; // radians — how far petals fan out when fully open
  const angleSpread = maxSpread * bellOpenness;

  for (let i = 0; i < petalCount; i++) {
    // Center petal points straight down, others offset to each side
    const offsetIndex = i - 1; // -1, 0, 1
    const angle = Math.PI / 2 + offsetIndex * angleSpread + rng() * 0.08;

    // Petal dimensions scale slightly with openness
    const pw = (3.5 + rng() * 1.0) * (0.7 + bellOpenness * 0.3);
    const pl = (5 + rng() * 2.0) * (0.7 + bellOpenness * 0.3);

    elements.push({
      shape: {
        type: "petal",
        width: pw,
        length: pl,
        roundness: 0.9,
      },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.primary,
      zOffset: 1.0,
    });
  }

  // Clapper dot visible when bell is sufficiently open
  if (bellOpenness > 0.3) {
    const clapperOpacity = Math.min(1, (bellOpenness - 0.3) / 0.4);
    elements.push({
      shape: { type: "dot", radius: 0.5 + rng() * 0.3 },
      position: {
        x: cx + (rng() - 0.5) * 0.6,
        y: cy + 3.5 + rng() * 1.5, // slightly below bell center
      },
      rotation: 0,
      scale: 1,
      color: colorSet.accent,
      opacity: 0.5 * clapperOpacity,
      zOffset: 1.5,
    });
  }
}

/**
 * Builder function for the Watercolor Bell Cluster variant.
 *
 * Visual design:
 * - Main stem arching upward from bottom center
 * - 3 branch stems arching outward and downward to bell positions
 * - Each bell: 3 downward-pointing petals (inverted tulip cup)
 * - Small leaves on the main stem
 *
 * Path A: reads bell1Open, bell2Open, bell3Open, cascadeDelay
 * directly from ctx.traits (set by the wc_bell_cluster Python circuit).
 */
function buildWcBellClusterElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  // Path A: read properties from Python circuit's extra dict (via plant.traits).
  // Fallback values for unobserved plants (ctx.traits is null).
  const bell1Open = traitOr(ctx.traits, "bell1Open", 0.7);
  const bell2Open = traitOr(ctx.traits, "bell2Open", 0.5);
  const bell3Open = traitOr(ctx.traits, "bell3Open", 0.3);
  const cascadeDelay = traitOr(ctx.traits, "cascadeDelay", 0.15);

  const bellOpenTraits = [bell1Open, bell2Open, bell3Open];

  // Color selection
  const colorSet =
    (ctx.colorVariationName ? BELL_CLUSTER_COLORS[ctx.colorVariationName] : null) ??
    (ctx.traits?.colorPalette
      ? {
          primary: ctx.traits.colorPalette[0] ?? BELL_CLUSTER_DEFAULT_COLORS.primary,
          accent: ctx.traits.colorPalette[1] ?? BELL_CLUSTER_DEFAULT_COLORS.accent,
          stem: ctx.traits.colorPalette[2] ?? BELL_CLUSTER_DEFAULT_COLORS.stem,
          leaf: BELL_CLUSTER_DEFAULT_COLORS.leaf,
        }
      : BELL_CLUSTER_DEFAULT_COLORS);

  // Lifecycle-driven base openness
  const baseOpenness = getBellClusterOpenness(ctx.keyframeName, ctx.keyframeProgress);

  // === MAIN STEM ===
  // Arches upward from bottom center to a hub point above the bells
  const stemBottomX = 32;
  const stemBottomY = 56;
  const stemTopX = 32;
  const stemTopY = 16;
  const stemMidY = (stemBottomY + stemTopY) / 2;
  const curveDir = rng() > 0.5 ? 1 : -1;
  const curveOffset = 3 * curveDir;

  elements.push({
    shape: {
      type: "stem",
      points: [
        [stemBottomX, stemBottomY],
        [stemBottomX + curveOffset * 0.4, stemMidY + 6],
        [stemTopX + curveOffset * 0.6, stemMidY - 6],
        [stemTopX, stemTopY],
      ],
      thickness: 0.6 + baseOpenness * 0.3,
    },
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: 1,
    color: colorSet.stem,
    opacity: 0.55,
    zOffset: 0,
  });

  // === BRANCH STEMS (arching outward and down to each bell) ===
  for (let i = 0; i < 3; i++) {
    const [bellCx, bellCy] = BELL_POSITIONS[i]!;

    // Branch origin: partway up the main stem
    const branchT = 0.55 + i * 0.12;
    const originX = stemBottomX + curveOffset * branchT * 0.5;
    const originY = stemBottomY - branchT * (stemBottomY - stemTopY);

    // Mid-control point for a natural arc outward then downward
    const midX = (originX + bellCx) / 2 + (bellCx < 32 ? -3 : bellCx > 32 ? 3 : 0);
    const midY = Math.min(originY, bellCy) - 4 - rng() * 3;

    elements.push({
      shape: {
        type: "stem",
        points: [
          [originX, originY],
          [midX, midY],
          [bellCx + (rng() - 0.5) * 2, bellCy - 5],
          [bellCx, bellCy - 2],
        ],
        thickness: 0.4 + baseOpenness * 0.2,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: colorSet.stem,
      opacity: 0.5,
      zOffset: 0.2,
    });
  }

  // === LEAVES on main stem ===
  const leafOpenness = Math.max(0, (baseOpenness - 0.05) / 0.95);
  const leafCount = 2 + Math.floor(rng() * 2); // 2-3 leaves
  for (let i = 0; i < leafCount; i++) {
    if (leafOpenness <= 0) break;
    const t = (i + 0.5) / leafCount;
    const leafY = stemBottomY - t * (stemBottomY - stemTopY) * 0.6;
    const leafX = stemBottomX + curveOffset * t * 0.4;
    const side = i % 2 === 0 ? 1 : -1;
    const leafAngle = side * (0.4 + rng() * 0.5);
    const leafScale = (0.4 + rng() * 0.4) * leafOpenness;

    elements.push({
      shape: { type: "leaf", width: 3, length: 7 },
      position: { x: leafX + side * 1.5, y: leafY },
      rotation: leafAngle,
      scale: leafScale,
      color: colorSet.leaf,
      zOffset: 0.5,
    });
  }

  // === BELL FLOWERS ===
  // Each bell's effective openness: base_openness * bellNOpen (quantum trait scales max).
  // During the "cascade" keyframe, bells open one by one using cascadeDelay to stagger.
  for (let i = 0; i < 3; i++) {
    const [bellCx, bellCy] = BELL_POSITIONS[i]!;
    const bellTrait = bellOpenTraits[i]!;

    // Cascade stagger: each successive bell is delayed during the cascade phase
    let effectiveOpenness = baseOpenness;
    if (ctx.keyframeName === "cascade") {
      const delayOffset = i * cascadeDelay;
      const adjustedProgress = Math.max(0, ctx.keyframeProgress - delayOffset);
      effectiveOpenness = 0.3 + adjustedProgress * (0.5 / (1 - delayOffset));
      effectiveOpenness = Math.min(effectiveOpenness, baseOpenness);
    }

    // Quantum trait scales the maximum bell openness
    const bellOpenness = effectiveOpenness * bellTrait;

    renderBell(elements, bellCx, bellCy, bellOpenness, colorSet, rng);
  }

  return elements;
}

export const wcBellCluster: PlantVariant = {
  id: "wc-bell-cluster",
  name: "Watercolor Bell Cluster",
  description:
    "Three hanging bell flowers on arching stems, opening in a quantum-entangled cascade driven by a GHZ-like circuit",
  rarity: 0.06,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  // Path A: custom Python circuit encodes bell openness directly.
  // The wc_bell_cluster circuit maps qubit measurements to
  // bell1Open, bell2Open, bell3Open, and cascadeDelay in its extra dict.
  circuitId: "wc_bell_cluster",
  sandboxControls: [
    { key: "bell1Open", label: "Bell 1 Open", min: 0, max: 1, step: 0.05, default: 0.7 },
    { key: "bell2Open", label: "Bell 2 Open", min: 0, max: 1, step: 0.05, default: 0.5 },
    { key: "bell3Open", label: "Bell 3 Open", min: 0, max: 1, step: 0.05, default: 0.3 },
    {
      key: "cascadeDelay",
      label: "Cascade Delay",
      min: 0,
      max: 0.5,
      step: 0.05,
      default: 0.15,
    },
  ],
  colorVariations: [
    {
      name: "lilac",
      weight: 1.0,
      palettes: { bloom: ["#C8A8D8", "#A080C0", "#8EA888"] },
    },
    {
      name: "white",
      weight: 0.8,
      palettes: { bloom: ["#F0EEF0", "#D8D0E0", "#8EA888"] },
    },
    {
      name: "blush",
      weight: 0.9,
      palettes: { bloom: ["#E8C0D0", "#D0A0B8", "#8EA888"] },
    },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 350,
    clusterBonus: 2.0,
    maxClusterDensity: 5,
    reseedClusterChance: 0.7,
  },
  watercolorConfig: {
    keyframes: [
      { name: "dormant", duration: 8 },
      { name: "hang", duration: 15 },
      { name: "cascade", duration: 30 },
      { name: "all-open", duration: 30 },
      { name: "rest", duration: 20 },
    ],
    wcEffect: {
      layers: 3,
      opacity: 0.44,
      spread: 0.05,
      colorVariation: 0.04,
    },
    buildElements: buildWcBellClusterElements,
  },
};
