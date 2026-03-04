/**
 * Watercolor Midnight Poppy
 *
 * Deep crimson/black broad petals with a dramatic open/close cycle.
 * 5-7 wide crepe-paper-textured petals surround a dark center disc
 * with a stamen dot ring. Quantum tunneling circuit drives openness,
 * petal spread, and dark center intensity.
 *
 * Category: watercolor (flowers)
 * Rarity: 0.06 (base 0.4 x 0.15)
 * Render mode: watercolor
 * Path A: custom Python circuit (wc_midnight_poppy) — no quantumMapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr } from "../_helpers";

/**
 * Color sets for the midnight poppy, keyed by color variation name.
 */
const POPPY_COLORS: Record<string, { petal: string; center: string; stem: string; leaf: string }> =
  {
    crimson: { petal: "#C83030", center: "#2A1A1A", stem: "#5A7A50", leaf: "#6B8A5A" },
    burgundy: { petal: "#8A2040", center: "#1A1020", stem: "#5A7A50", leaf: "#6B8A5A" },
    flame: { petal: "#E86030", center: "#3A1A10", stem: "#5A7A50", leaf: "#6B8A5A" },
  };

const POPPY_DEFAULT_COLORS = POPPY_COLORS.crimson!;

/**
 * Custom lifecycle openness for the poppy open/close cycle.
 *
 * Unlike the standard 4-phase flower openness, poppies have a dramatic
 * closed -> opening -> open -> closing loop. The poppyOpenness trait
 * (from the quantum circuit) modulates the maximum spread in the "open" phase.
 */
function getPoppyOpenness(keyframeName: string, progress: number, poppyOpenness: number): number {
  const maxOpen = 0.7 + poppyOpenness * 0.3;
  switch (keyframeName) {
    case "closed":
      return 0.1 + progress * 0.1; // 0.1 -> 0.2
    case "opening":
      return 0.2 + progress * 0.5; // 0.2 -> 0.7
    case "open":
      return maxOpen; // quantum-driven max openness (0.7 - 1.0)
    case "closing":
      return maxOpen * (1 - progress * 0.7); // maxOpen -> maxOpen * 0.3
    default:
      return 0.5;
  }
}

/**
 * Builder function for the Watercolor Midnight Poppy variant.
 *
 * Path A: reads poppyOpenness, petalSpread, and darkIntensity directly
 * from ctx.traits (set by the wc_midnight_poppy Python circuit).
 *
 * Visual design:
 * - 5-7 wide crepe-paper petals with high roundness (0.4) for organic texture
 * - Dark center disc with dramatic stamen dot ring (6-8 dots)
 * - Thick stem with 2 leaves
 * - Open/close cycle driven by keyframes and quantum traits
 */
function buildWcMidnightPoppyElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  // Path A: read properties from Python circuit's extra dict (via plant.traits).
  // Fallback values for unobserved plants (ctx.traits is null).
  const poppyOpenness = traitOr(ctx.traits, "poppyOpenness", 0.7);
  const petalSpread = traitOr(ctx.traits, "petalSpread", 0.6);
  const darkIntensity = traitOr(ctx.traits, "darkIntensity", 0.75);

  // Color selection
  const colorSet =
    (ctx.colorVariationName ? POPPY_COLORS[ctx.colorVariationName] : null) ??
    (ctx.traits?.colorPalette
      ? {
          petal: ctx.traits.colorPalette[0] ?? POPPY_DEFAULT_COLORS.petal,
          center: ctx.traits.colorPalette[1] ?? POPPY_DEFAULT_COLORS.center,
          stem: ctx.traits.colorPalette[2] ?? POPPY_DEFAULT_COLORS.stem,
          leaf: POPPY_DEFAULT_COLORS.leaf,
        }
      : POPPY_DEFAULT_COLORS);

  // Lifecycle-driven openness (custom poppy cycle)
  const openness = getPoppyOpenness(ctx.keyframeName, ctx.keyframeProgress, poppyOpenness);
  const petalOpenness = Math.max(0, (openness - 0.05) / 0.95);
  const leafOpenness = Math.max(0, (openness - 0.1) / 0.9);

  const cx = 32;
  const cy = 20;

  // === STEM ===
  const stemBottom = 54;
  const stemMidY = (cy + stemBottom) / 2;
  const curveDir = rng() > 0.5 ? 1 : -1;
  const stemCurvature = 0.15 + rng() * 0.1;
  const curveOffset = stemCurvature * 4 * curveDir;

  elements.push({
    shape: {
      type: "stem",
      points: [
        [cx, stemBottom],
        [cx + curveOffset * 0.5, stemMidY + 4],
        [cx + curveOffset, stemMidY - 4],
        [cx, cy + 5],
      ],
      thickness: 0.7 + openness * 0.35,
    },
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: 1,
    color: colorSet.stem,
    opacity: 0.6,
    zOffset: 0,
  });

  // === LEAVES (2 leaves) ===
  for (let i = 0; i < 2; i++) {
    if (leafOpenness <= 0) break;
    const side = i === 0 ? -1 : 1;
    const leafY = 36 + i * 8;
    const leafX = cx + curveOffset * ((leafY - stemBottom) / (cy + 5 - stemBottom));

    elements.push({
      shape: { type: "leaf", width: 4, length: 10 },
      position: { x: leafX + side * 1.8, y: leafY },
      rotation: side * (0.45 + rng() * 0.5),
      scale: leafOpenness * 0.75,
      color: colorSet.leaf,
      zOffset: 0.5,
    });
  }

  // === PETALS (5-7 wide crepe-paper petals) ===
  if (petalOpenness > 0) {
    const petalCount = 5 + Math.floor(rng() * 3); // 5-7 petals
    const step = (Math.PI * 2) / petalCount;

    for (let i = 0; i < petalCount; i++) {
      const angle = step * i + rng() * 0.2;
      // Wide petals: width 7-10, length 12-16
      const pw = (7 + rng() * 3) * petalOpenness * petalSpread;
      const pl = (12 + rng() * 4) * petalOpenness;

      elements.push({
        shape: {
          type: "petal",
          width: pw,
          length: pl,
          roundness: 0.4, // Crepe-paper texture feel
        },
        position: { x: cx, y: cy },
        rotation: angle,
        scale: 1.0,
        color: colorSet.petal,
        zOffset: 1.0,
      });
    }
  }

  // === DARK CENTER DISC ===
  if (petalOpenness > 0.15) {
    // Disc radius 3-4, modulated by darkIntensity
    const discRadius = 3 + darkIntensity * 1.0;
    elements.push({
      shape: { type: "disc", radius: discRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.center,
      opacity: 0.6 + darkIntensity * 0.3,
      zOffset: 2.0,
    });

    // === STAMEN DOT RING (6-8 dots) ===
    const stamenCount = 6 + Math.floor(rng() * 3); // 6-8 dots
    const ringRadius = discRadius * 0.7;
    const dotStep = (Math.PI * 2) / stamenCount;

    for (let i = 0; i < stamenCount; i++) {
      const dotAngle = dotStep * i + rng() * 0.15;
      const dotDist = ringRadius + (rng() - 0.5) * 0.8;
      elements.push({
        shape: { type: "dot", radius: 0.3 + rng() * 0.35 },
        position: {
          x: cx + Math.cos(dotAngle) * dotDist,
          y: cy + Math.sin(dotAngle) * dotDist,
        },
        rotation: 0,
        scale: 1,
        color: colorSet.center,
        opacity: 0.35 + rng() * 0.35,
        zOffset: 2.1,
      });
    }
  }

  return elements;
}

export const wcMidnightPoppy: PlantVariant = {
  id: "wc-midnight-poppy",
  name: "Midnight Poppy",
  description:
    "A dramatic painted poppy with deep crimson petals and a dark center, cycling between open and closed states driven by quantum tunneling",
  rarity: 0.06,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  loop: true,
  keyframes: [],
  // Path A: custom Python circuit encodes all visual properties directly.
  // The wc_midnight_poppy circuit maps qubit measurements to
  // poppyOpenness, petalSpread, and darkIntensity in its extra dict.
  circuitId: "wc_midnight_poppy",
  sandboxControls: [
    {
      key: "poppyOpenness",
      label: "Poppy Openness",
      min: 0.1,
      max: 1.0,
      step: 0.05,
      default: 0.7,
    },
    {
      key: "petalSpread",
      label: "Petal Spread",
      min: 0.3,
      max: 1.0,
      step: 0.05,
      default: 0.6,
    },
    {
      key: "darkIntensity",
      label: "Dark Intensity",
      min: 0.5,
      max: 1.0,
      step: 0.05,
      default: 0.75,
    },
  ],
  colorVariations: [
    {
      name: "crimson",
      weight: 1.0,
      palettes: { open: ["#C83030", "#2A1A1A", "#5A7A50"] },
    },
    {
      name: "burgundy",
      weight: 0.8,
      palettes: { open: ["#8A2040", "#1A1020", "#5A7A50"] },
    },
    {
      name: "flame",
      weight: 0.7,
      palettes: { open: ["#E86030", "#3A1A10", "#5A7A50"] },
    },
  ],
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 380,
    clusterBonus: 1.8,
    maxClusterDensity: 5,
    reseedClusterChance: 0.6,
  },
  watercolorConfig: {
    keyframes: [
      { name: "closed", duration: 15 },
      { name: "opening", duration: 12 },
      { name: "open", duration: 30 },
      { name: "closing", duration: 12 },
    ],
    wcEffect: {
      layers: 4,
      opacity: 0.5,
      spread: 0.07,
      colorVariation: 0.06,
    },
    buildElements: buildWcMidnightPoppyElements,
  },
};
