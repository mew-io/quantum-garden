import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";

/**
 * Color sets for the watercolor flower, keyed by color variation name.
 * Selected by quantum measurement during observation.
 */
const WATERCOLOR_FLOWER_COLORS: Record<
  string,
  { petal: string; center: string; stem: string; leaf: string }
> = {
  golden: { petal: "#F2D26B", center: "#E09520", stem: "#8EA888", leaf: "#9AAE8C" },
  coral: { petal: "#E89090", center: "#C06060", stem: "#8EA888", leaf: "#9AAE8C" },
  lavender: { petal: "#B8A0D8", center: "#7060A0", stem: "#9AAE8C", leaf: "#9AAE8C" },
  sky: { petal: "#90B8E8", center: "#4070B0", stem: "#8EA888", leaf: "#9AAE8C" },
};

const WATERCOLOR_FLOWER_DEFAULT_COLORS = WATERCOLOR_FLOWER_COLORS.golden!;

/**
 * Get the openness factor for a lifecycle keyframe.
 * Controls how much petals/leaves are "open" at each stage.
 */
function getFlowerOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "bud":
      return 0.05 + progress * 0.1; // 0.05 → 0.15
    case "sprout":
      return 0.15 + progress * 0.35; // 0.15 → 0.5
    case "bloom":
      return 0.5 + progress * 0.5; // 0.5 → 1.0
    case "fade":
      return 1.0 - progress * 0.4; // 1.0 → 0.6
    default:
      return 0.5;
  }
}

/**
 * Builder function for the watercolor flower variant.
 * Translates quantum traits + lifecycle state into watercolor elements.
 *
 * Quantum trait mapping:
 * - growthRate (0.5-2.0) → petal count (3-8), leaf count (1-5)
 * - opacity (0.7-1.0) → stem curvature (straighter when more certain)
 * - colorVariationName → color set (petal, center, stem, leaf colors)
 * - seed (from plant ID) → rotation offsets, per-plant variation
 * - keyframe + progress → openness (bud→bloom→fade animation)
 */
function buildWatercolorFlowerElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];

  // Seeded RNG for per-plant variation
  let s = ctx.seed & 0x7fffffff;
  if (s === 0) s = 1;
  const rng = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  // Quantum-derived parameters.
  // Prefer quantumMapping-resolved properties stored in traits (Path B).
  // Fall back to derivation from growthRate/opacity for backward compatibility
  // (plants observed before quantumMapping was deployed, or mock mode).
  const growthRate = ctx.traits?.growthRate ?? 1.0;
  const quantumOpacity = ctx.traits?.opacity ?? 0.85;

  const petalCount =
    typeof ctx.traits?.petalCount === "number"
      ? ctx.traits.petalCount
      : Math.floor(3 + ((growthRate - 0.5) / 1.5) * 5); // 3-8
  const leafCount =
    typeof ctx.traits?.leafCount === "number"
      ? ctx.traits.leafCount
      : Math.max(1, Math.floor(growthRate * 2.5)); // 1-5
  const stemCurvature =
    typeof ctx.traits?.stemCurvature === "number"
      ? ctx.traits.stemCurvature
      : (1 - quantumOpacity) * 1.5; // 0-0.45

  // Color selection
  const colorSet =
    (ctx.colorVariationName ? WATERCOLOR_FLOWER_COLORS[ctx.colorVariationName] : null) ??
    (ctx.traits?.colorPalette
      ? {
          petal: ctx.traits.colorPalette[0] ?? WATERCOLOR_FLOWER_DEFAULT_COLORS.petal,
          center: ctx.traits.colorPalette[1] ?? WATERCOLOR_FLOWER_DEFAULT_COLORS.center,
          stem: ctx.traits.colorPalette[2] ?? WATERCOLOR_FLOWER_DEFAULT_COLORS.stem,
          leaf: WATERCOLOR_FLOWER_DEFAULT_COLORS.leaf,
        }
      : WATERCOLOR_FLOWER_DEFAULT_COLORS);

  // Lifecycle-driven openness
  const openness = getFlowerOpenness(ctx.keyframeName, ctx.keyframeProgress);

  // Flower center position in 64x64 space
  const cx = 32;
  const cy = 22;

  // === STEM ===
  const stemBottom = 52;
  const stemMidY = (cy + stemBottom) / 2;
  const curveOffset = stemCurvature * 4 * (rng() > 0.5 ? 1 : -1);
  elements.push({
    shape: {
      type: "stem",
      points: [
        [cx, stemBottom],
        [cx + curveOffset * 0.5, stemMidY + 4],
        [cx + curveOffset, stemMidY - 4],
        [cx, cy + 4],
      ],
      thickness: 0.6 + openness * 0.4,
    },
    position: { x: 0, y: 0 }, // stem points are already in 64x64 space
    rotation: 0,
    scale: 1,
    color: colorSet.stem,
    opacity: 0.58,
    zOffset: 0,
  });

  // === LEAVES ===
  const leafOpenness = Math.max(0, (openness - 0.1) / 0.9);
  for (let i = 0; i < leafCount; i++) {
    if (leafOpenness <= 0) break;
    const t = (i + 0.5) / leafCount; // position along stem (0=bottom, 1=top)
    const leafY = stemBottom - t * (stemBottom - cy - 4);
    const leafX = cx + curveOffset * t;
    const side = i % 2 === 0 ? 1 : -1;
    const baseAngle = side * (0.4 + rng() * 0.6);
    const leafScale = (0.55 + rng() * 0.55) * leafOpenness;

    elements.push({
      shape: {
        type: "leaf",
        width: 3.5,
        length: 9,
      },
      position: { x: leafX + side * 1.5, y: leafY },
      rotation: baseAngle,
      scale: leafScale,
      color: colorSet.leaf,
      zOffset: 0.5,
    });
  }

  // === PETALS ===
  const petalOpenness = Math.max(0, (openness - 0.05) / 0.95);
  if (petalOpenness > 0) {
    const step = (Math.PI * 2) / petalCount;
    for (let i = 0; i < petalCount; i++) {
      const angle = step * i + rng() * 0.18;
      const pw = (4 + rng() * 2) * petalOpenness;
      const pl = (10 + rng() * 4) * petalOpenness;

      elements.push({
        shape: {
          type: "petal",
          width: pw,
          length: pl,
          roundness: 0.82,
        },
        position: { x: cx, y: cy },
        rotation: angle,
        scale: 1.0,
        color: colorSet.petal,
        zOffset: 1.0,
      });
    }
  }

  // === CENTER DISC ===
  if (petalOpenness > 0.2) {
    const discRadius = 1.5 + petalOpenness * 1.5;
    elements.push({
      shape: { type: "disc", radius: discRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.center,
      opacity: 0.72,
      zOffset: 2.0,
    });

    // === STAMEN DOTS ===
    const dotCount = Math.floor(3 + petalOpenness * 4);
    for (let i = 0; i < dotCount; i++) {
      const a = rng() * Math.PI * 2;
      const d = rng() * discRadius * 0.8;
      elements.push({
        shape: { type: "dot", radius: 0.3 + rng() * 0.4 },
        position: {
          x: cx + Math.cos(a) * d,
          y: cy + Math.sin(a) * d,
        },
        rotation: 0,
        scale: 1,
        color: colorSet.center,
        opacity: 0.35 + rng() * 0.4,
        zOffset: 2.1,
      });
    }
  }

  return elements;
}

export const watercolorFlower: PlantVariant = {
  id: "watercolor-flower",
  name: "Flower",
  description:
    "A painterly flower rendered with soft watercolor layers, its form shaped by quantum measurement",
  rarity: 0.15,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  // Path B: uses the interference circuit (multi-qubit entanglement)
  // and maps quantum signals to flower-specific properties at observation time.
  circuitId: "interference",
  quantumMapping: {
    schema: {
      // Shannon entropy drives petal count: high uncertainty → more petals
      petalCount: { signal: "entropy", range: [3, 8], default: 5, round: true },
      // Growth signal drives leaf count: stronger growth → more leaves
      leafCount: { signal: "growth", range: [1, 5], default: 2, round: true },
      // High certainty (opacity) → straight stem; low certainty → curved stem
      stemCurvature: { signal: "certainty", range: [0.45, 0], default: 0.15 },
    },
  },
  colorVariations: [
    {
      name: "golden",
      weight: 1.0,
      palettes: { bloom: ["#F2D26B", "#E09520", "#8EA888"] },
    },
    {
      name: "coral",
      weight: 1.0,
      palettes: { bloom: ["#E89090", "#C06060", "#8EA888"] },
    },
    {
      name: "lavender",
      weight: 0.8,
      palettes: { bloom: ["#B8A0D8", "#7060A0", "#9AAE8C"] },
    },
    {
      name: "sky",
      weight: 0.8,
      palettes: { bloom: ["#90B8E8", "#4070B0", "#8EA888"] },
    },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 15 },
      { name: "sprout", duration: 20 },
      { name: "bloom", duration: 45 },
      { name: "fade", duration: 25 },
    ],
    wcEffect: {
      layers: 3,
      opacity: 0.48,
      spread: 0.07,
      colorVariation: 0.045,
    },
    buildElements: buildWatercolorFlowerElements,
  },
};
