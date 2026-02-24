/**
 * Watercolor Quantum Tulip
 *
 * A tulip rendered in watercolor style with 3 overlapping wide petals
 * forming a characteristic cup shape. The cup depth, petal overlap, and
 * color intensity are all driven by a custom 3-qubit quantum circuit.
 *
 * Category: watercolor (flowers)
 * Rarity: 0.08 (base 0.5 x 0.15)
 * Render mode: watercolor
 * Path A: custom Python circuit (wc_quantum_tulip) — no quantumMapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr } from "../_helpers";

/**
 * Color sets for the watercolor quantum tulip, keyed by color variation name.
 */
const TULIP_COLORS: Record<string, { petal: string; center: string; stem: string; leaf: string }> =
  {
    "classic-red": { petal: "#E07070", center: "#C04040", stem: "#6B8A50", leaf: "#78A060" },
    yellow: { petal: "#F0D860", center: "#D8B830", stem: "#6B8A50", leaf: "#78A060" },
    purple: { petal: "#B888D8", center: "#8858A8", stem: "#6B8A50", leaf: "#78A060" },
  };

const TULIP_DEFAULT_COLORS = TULIP_COLORS["classic-red"]!;

/**
 * Get tulip-specific openness for lifecycle keyframes.
 * Tulips have a unique 5-phase lifecycle:
 * bud (tight closed) -> emerge (stem grows) -> cup (petals form cup) -> open (petals separate) -> wilt (droop)
 */
function getTulipOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "bud":
      return 0.02 + progress * 0.08; // 0.02 -> 0.10 (very tight)
    case "emerge":
      return 0.1 + progress * 0.15; // 0.10 -> 0.25 (stem visible, bud still closed)
    case "cup":
      return 0.25 + progress * 0.5; // 0.25 -> 0.75 (petals forming cup)
    case "open":
      return 0.75 + progress * 0.25; // 0.75 -> 1.00 (full open)
    case "wilt":
      return 1.0 - progress * 0.5; // 1.00 -> 0.50 (drooping)
    default:
      return 0.5;
  }
}

/**
 * Builder function for the Watercolor Quantum Tulip variant.
 *
 * Creates a tulip with 3 overlapping wide petals forming a cup shape.
 * The cup depth, petal overlap, and color intensity are read directly
 * from ctx.traits (Path A: set by the wc_quantum_tulip Python circuit).
 *
 * Visual design:
 * - 3 wide overlapping petals converging at their bases to form an enclosed cup
 * - Thick stem with slight curve
 * - 1-2 broad leaves on the stem
 * - Lifecycle: bud (tight closed) -> emerge (stem grows) -> cup (petals form cup)
 *   -> open (petals separate) -> wilt (droop)
 */
function buildWcQuantumTulipElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  // Path A: read properties from Python circuit's extra dict (via plant.traits).
  // Fallback values for unobserved plants (ctx.traits is null).
  const cupDepth = traitOr(ctx.traits, "cupDepth", 0.65);
  const petalOverlap = traitOr(ctx.traits, "petalOverlap", 0.5);
  const colorIntensity = traitOr(ctx.traits, "colorIntensity", 0.7);

  // Stem curvature from opacity (standard base trait, not in extra dict)
  const quantumOpacity = ctx.traits?.opacity ?? 0.85;
  const stemCurvature = (1 - quantumOpacity) * 1.2; // 0-0.36

  // Color selection — colorIntensity modulates how saturated the petal looks
  const colorSet =
    (ctx.colorVariationName ? TULIP_COLORS[ctx.colorVariationName] : null) ??
    (ctx.traits?.colorPalette
      ? {
          petal: ctx.traits.colorPalette[0] ?? TULIP_DEFAULT_COLORS.petal,
          center: ctx.traits.colorPalette[1] ?? TULIP_DEFAULT_COLORS.center,
          stem: ctx.traits.colorPalette[2] ?? TULIP_DEFAULT_COLORS.stem,
          leaf: TULIP_DEFAULT_COLORS.leaf,
        }
      : TULIP_DEFAULT_COLORS);

  // Lifecycle-driven openness using tulip-specific curve
  const openness = getTulipOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const petalOpenness = Math.max(0, (openness - 0.05) / 0.95);
  const leafOpenness = Math.max(0, (openness - 0.1) / 0.9);

  const cx = 32;
  const cy = 20;
  const stemBottom = 54;

  // === STEM ===
  // Thick tulip stem with slight curve
  const stemMidY = (cy + stemBottom) / 2;
  const curveDir = rng() > 0.5 ? 1 : -1;
  const curveOffset = stemCurvature * 4 * curveDir;

  elements.push({
    shape: {
      type: "stem",
      points: [
        [cx, stemBottom],
        [cx + curveOffset * 0.4, stemMidY + 4],
        [cx + curveOffset * 0.8, stemMidY - 4],
        [cx, cy + 5],
      ],
      thickness: 0.8 + openness * 0.2,
    },
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: 1,
    color: colorSet.stem,
    opacity: 0.6,
    zOffset: 0,
  });

  // === LEAVES ===
  // 1-2 broad tulip leaves along the stem
  const leafCount = rng() > 0.5 ? 2 : 1;
  for (let i = 0; i < leafCount; i++) {
    if (leafOpenness <= 0) break;
    const t = (i + 0.4) / (leafCount + 0.2);
    const leafY = stemBottom - t * (stemBottom - cy - 5);
    const leafX = cx + curveOffset * t;
    const side = i % 2 === 0 ? 1 : -1;
    const baseAngle = side * (0.3 + rng() * 0.5);
    const leafScale = (0.5 + rng() * 0.4) * leafOpenness;

    elements.push({
      shape: {
        type: "leaf",
        width: 5,
        length: 12,
      },
      position: { x: leafX + side * 2, y: leafY },
      rotation: baseAngle,
      scale: leafScale,
      color: colorSet.leaf,
      zOffset: 0.5,
    });
  }

  // === TULIP CUP (3 overlapping petals) ===
  if (petalOpenness > 0) {
    const petalCount = 3;
    const step = (Math.PI * 2) / petalCount;

    // Cup convergence: higher cupDepth = petals converge more at base
    // At full cupDepth (1.0), petals are almost vertical (cup shape)
    // At low cupDepth (0.3), petals splay out more
    const convergeFactor = 0.3 + cupDepth * 0.7; // 0.51 - 1.0

    // Petal overlap: controls width relative to angular spacing
    // Higher overlap = wider petals that cover more of the cup
    const overlapWidth = 6 + petalOverlap * 4; // 6-8 (wide tulip petals)
    const petalLength = 8 + petalOpenness * 4; // 8-12 (tall cupped petals)

    // Roundness increases with cup depth for that cupped look
    const roundness = 1.0 + cupDepth * 0.2; // 1.0-1.2

    for (let i = 0; i < petalCount; i++) {
      const angle = step * i + rng() * 0.12;

      // Cup effect: petals tilt inward based on cupDepth
      // In cup phase, petals don't fully spread — they converge
      const spreadFactor = 1.0 - convergeFactor * (1.0 - petalOpenness * 0.4);
      const pw = overlapWidth * petalOpenness * spreadFactor;
      const pl = petalLength * petalOpenness;

      // Offset petals slightly inward for cup convergence
      const inwardOffset = convergeFactor * 1.5 * (1.0 - petalOpenness * 0.3);
      const petalX = cx + Math.cos(angle) * inwardOffset;
      const petalY = cy + Math.sin(angle) * inwardOffset * 0.5;

      elements.push({
        shape: {
          type: "petal",
          width: pw,
          length: pl,
          roundness,
        },
        position: { x: petalX, y: petalY },
        rotation: angle,
        scale: 1.0,
        color: colorSet.petal,
        opacity: colorIntensity,
        zOffset: 1.0 + i * 0.1,
      });
    }

    // Inner cup shadow/center — visible when cup is partially open
    if (petalOpenness > 0.3) {
      const centerRadius = 1.0 + petalOpenness * 1.2;
      elements.push({
        shape: { type: "disc", radius: centerRadius },
        position: { x: cx, y: cy },
        rotation: 0,
        scale: 1,
        color: colorSet.center,
        opacity: 0.55 * colorIntensity,
        zOffset: 2.0,
      });

      // Stamen dots inside the cup
      const dotCount = Math.floor(2 + petalOpenness * 3);
      for (let i = 0; i < dotCount; i++) {
        const a = rng() * Math.PI * 2;
        const d = rng() * centerRadius * 0.7;
        elements.push({
          shape: { type: "dot", radius: 0.25 + rng() * 0.3 },
          position: {
            x: cx + Math.cos(a) * d,
            y: cy + Math.sin(a) * d,
          },
          rotation: 0,
          scale: 1,
          color: colorSet.center,
          opacity: (0.3 + rng() * 0.35) * colorIntensity,
          zOffset: 2.1,
        });
      }
    }
  }

  return elements;
}

export const wcQuantumTulip: PlantVariant = {
  id: "wc-quantum-tulip",
  name: "Watercolor Tulip",
  description:
    "A tulip painted in watercolor with 3 overlapping cupped petals, its cup depth and color intensity shaped by a 3-qubit superposition circuit",
  rarity: 0.08,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  // Path A: custom Python circuit encodes all visual properties directly.
  // The wc_quantum_tulip circuit maps qubit measurements to
  // cupDepth, petalOverlap, and colorIntensity in its extra dict.
  circuitId: "wc_quantum_tulip",
  sandboxControls: [
    { key: "cupDepth", label: "Cup Depth", min: 0.3, max: 1.0, step: 0.05, default: 0.65 },
    {
      key: "petalOverlap",
      label: "Petal Overlap",
      min: 0.2,
      max: 0.8,
      step: 0.05,
      default: 0.5,
    },
    {
      key: "colorIntensity",
      label: "Color Intensity",
      min: 0.4,
      max: 1.0,
      step: 0.05,
      default: 0.7,
    },
  ],
  colorVariations: [
    {
      name: "classic-red",
      weight: 1.0,
      palettes: { bloom: ["#E07070", "#C04040", "#6B8A50"] },
    },
    {
      name: "yellow",
      weight: 0.9,
      palettes: { bloom: ["#F0D860", "#D8B830", "#6B8A50"] },
    },
    {
      name: "purple",
      weight: 0.8,
      palettes: { bloom: ["#B888D8", "#8858A8", "#6B8A50"] },
    },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 400,
    clusterBonus: 2.0,
    maxClusterDensity: 6,
    reseedClusterChance: 0.7,
  },
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 12 },
      { name: "emerge", duration: 15 },
      { name: "cup", duration: 40 },
      { name: "open", duration: 30 },
      { name: "wilt", duration: 15 },
    ],
    wcEffect: {
      layers: 4,
      opacity: 0.46,
      spread: 0.06,
      colorVariation: 0.05,
    },
    buildElements: buildWcQuantumTulipElements,
  },
};
