import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";

/**
 * Color sets for the watercolor flower v2, keyed by color variation name.
 * Extends V1's palette with rose and sage variations.
 */
const FLOWER_V2_COLORS: Record<
  string,
  { petal: string; center: string; stem: string; leaf: string }
> = {
  golden: { petal: "#F2D26B", center: "#E09520", stem: "#8EA888", leaf: "#9AAE8C" },
  coral: { petal: "#E89090", center: "#C06060", stem: "#8EA888", leaf: "#9AAE8C" },
  lavender: { petal: "#B8A0D8", center: "#7060A0", stem: "#9AAE8C", leaf: "#9AAE8C" },
  sky: { petal: "#90B8E8", center: "#4070B0", stem: "#8EA888", leaf: "#9AAE8C" },
  rose: { petal: "#E8A0B0", center: "#C05870", stem: "#8EA888", leaf: "#9AAE8C" },
  sage: { petal: "#A0D8A8", center: "#3A8A5A", stem: "#6B9E72", leaf: "#6B9E72" },
};

const FLOWER_V2_DEFAULT_COLORS = FLOWER_V2_COLORS.golden!;

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
 * Render a single flower head (petals + center disc + stamen) at a given position.
 * Used for each bloom in a multi-flower composition.
 */
function renderFlowerHead(
  elements: WatercolorElement[],
  cx: number,
  cy: number,
  petalCount: number,
  petalRoundness: number,
  petalOpenness: number,
  colorSet: { petal: string; center: string; stem: string; leaf: string },
  rng: () => number
): void {
  if (petalOpenness <= 0) return;

  // Petals
  const step = (Math.PI * 2) / petalCount;
  for (let i = 0; i < petalCount; i++) {
    const angle = step * i + rng() * 0.18;
    const pw = (3.5 + rng() * 1.8) * petalOpenness;
    const pl = (9 + rng() * 4) * petalOpenness;

    elements.push({
      shape: {
        type: "petal",
        width: pw,
        length: pl,
        roundness: petalRoundness,
      },
      position: { x: cx, y: cy },
      rotation: angle,
      scale: 1.0,
      color: colorSet.petal,
      zOffset: 1.0,
    });
  }

  // Center disc
  if (petalOpenness > 0.2) {
    const discRadius = 1.3 + petalOpenness * 1.4;
    elements.push({
      shape: { type: "disc", radius: discRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.center,
      opacity: 0.72,
      zOffset: 2.0,
    });

    // Stamen dots
    const dotCount = Math.floor(3 + petalOpenness * 4);
    for (let i = 0; i < dotCount; i++) {
      const a = rng() * Math.PI * 2;
      const d = rng() * discRadius * 0.8;
      elements.push({
        shape: { type: "dot", radius: 0.28 + rng() * 0.38 },
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
}

/**
 * Flower positions for multi-bloom layouts in 64×64 canvas space.
 * Each entry is [cx, cy] for the flower center.
 */
const FLOWER_POSITIONS: Record<number, Array<[number, number]>> = {
  1: [[32, 20]],
  2: [
    [25, 18],
    [39, 22],
  ],
  3: [
    [20, 16],
    [32, 20],
    [43, 18],
  ],
};

/**
 * Builder function for the Watercolor Flower V2 variant.
 *
 * Enhanced over V1 with:
 * - Multi-flower composition (1–3 blooms) from flowerCount quantum trait
 * - Quantum-controlled petalRoundness (V1 hardcoded at 0.82)
 * - Branch stems connecting each bloom to the main stem
 * - Richer watercolor layering (4 layers vs V1's 3)
 * - Rose and sage color variations
 *
 * Path A: reads flowerCount, petalRoundness, petalCount, leafCount
 * directly from ctx.traits (set by the watercolor_flower_v2 Python circuit).
 */
function buildWatercolorFlowerV2Elements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];

  // Seeded RNG for per-plant variation
  let s = ctx.seed & 0x7fffffff;
  if (s === 0) s = 1;
  const rng = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  // Path A: read properties from Python circuit's extra dict (via plant.traits).
  // Fallback values for unobserved plants (ctx.traits is null).
  const flowerCount = typeof ctx.traits?.flowerCount === "number" ? ctx.traits.flowerCount : 1;
  const petalRoundness =
    typeof ctx.traits?.petalRoundness === "number" ? ctx.traits.petalRoundness : 0.82;
  const petalCount = typeof ctx.traits?.petalCount === "number" ? ctx.traits.petalCount : 5;
  const leafCount = typeof ctx.traits?.leafCount === "number" ? ctx.traits.leafCount : 2;

  // Stem curvature from opacity (standard base trait, not in extra dict)
  const quantumOpacity = ctx.traits?.opacity ?? 0.85;
  const stemCurvature = (1 - quantumOpacity) * 1.5; // 0–0.45

  // Color selection
  const colorSet =
    (ctx.colorVariationName ? FLOWER_V2_COLORS[ctx.colorVariationName] : null) ??
    (ctx.traits?.colorPalette
      ? {
          petal: ctx.traits.colorPalette[0] ?? FLOWER_V2_DEFAULT_COLORS.petal,
          center: ctx.traits.colorPalette[1] ?? FLOWER_V2_DEFAULT_COLORS.center,
          stem: ctx.traits.colorPalette[2] ?? FLOWER_V2_DEFAULT_COLORS.stem,
          leaf: FLOWER_V2_DEFAULT_COLORS.leaf,
        }
      : FLOWER_V2_DEFAULT_COLORS);

  // Lifecycle-driven openness
  const openness = getFlowerOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const petalOpenness = Math.max(0, (openness - 0.05) / 0.95);
  const leafOpenness = Math.max(0, (openness - 0.1) / 0.9);

  // Flower positions for this flowerCount (clamped to 1–3)
  const clampedCount = Math.max(1, Math.min(3, Math.round(flowerCount)));
  const positions = FLOWER_POSITIONS[clampedCount] ?? FLOWER_POSITIONS[1]!;
  const [mainCx, mainCy] = positions[0]!;

  // === MAIN STEM ===
  const stemBottom = 54;
  const stemMidY = (mainCy + stemBottom) / 2;
  const curveDir = rng() > 0.5 ? 1 : -1;
  const curveOffset = stemCurvature * 4 * curveDir;

  elements.push({
    shape: {
      type: "stem",
      points: [
        [mainCx, stemBottom],
        [mainCx + curveOffset * 0.5, stemMidY + 4],
        [mainCx + curveOffset, stemMidY - 4],
        [mainCx, mainCy + 5],
      ],
      thickness: 0.65 + openness * 0.35,
    },
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: 1,
    color: colorSet.stem,
    opacity: 0.58,
    zOffset: 0,
  });

  // === BRANCH STEMS (for flowers 2 and 3) ===
  for (let i = 1; i < clampedCount; i++) {
    const [bCx, bCy] = positions[i]!;
    // Branch origin: partway up the main stem
    const branchT = 0.4 + i * 0.15;
    const originX = mainCx + curveOffset * branchT;
    const originY = stemBottom - branchT * (stemBottom - mainCy - 5);

    // Mid-control point for natural arc
    const midX = (originX + bCx) / 2 + (rng() - 0.5) * 4;
    const midY = (originY + bCy) / 2 - 3;

    elements.push({
      shape: {
        type: "stem",
        points: [
          [originX, originY],
          [midX, midY],
          [bCx, bCy + 3],
          [bCx, bCy + 3],
        ],
        thickness: 0.45 + openness * 0.2,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: colorSet.stem,
      opacity: 0.5,
      zOffset: 0.2,
    });
  }

  // === LEAVES ===
  for (let i = 0; i < leafCount; i++) {
    if (leafOpenness <= 0) break;
    const t = (i + 0.5) / leafCount;
    const leafY = stemBottom - t * (stemBottom - mainCy - 5);
    const leafX = mainCx + curveOffset * t;
    const side = i % 2 === 0 ? 1 : -1;
    const baseAngle = side * (0.4 + rng() * 0.6);
    const leafScale = (0.5 + rng() * 0.55) * leafOpenness;

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

  // === FLOWER HEADS ===
  for (let i = 0; i < clampedCount; i++) {
    const [fCx, fCy] = positions[i]!;
    // Vary petal count slightly per head (main flower gets the full count)
    const headPetalCount = i === 0 ? petalCount : Math.max(4, petalCount - Math.floor(rng() * 2));

    renderFlowerHead(
      elements,
      fCx,
      fCy,
      headPetalCount,
      petalRoundness,
      petalOpenness,
      colorSet,
      rng
    );
  }

  return elements;
}

export const watercolorFlowerV2: PlantVariant = {
  id: "watercolor-flower-v2",
  name: "Flower II",
  description:
    "An enhanced painterly flower with quantum-cascaded multi-bloom composition and bespoke petal geometry, shaped by an entanglement circuit",
  rarity: 0.1,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  // Path A: custom Python circuit encodes all visual properties directly.
  // The watercolor_flower_v2 circuit maps qubit measurements to
  // flowerCount, petalRoundness, petalCount, and leafCount in its extra dict.
  circuitId: "watercolor_flower_v2",
  sandboxControls: [
    { key: "flowerCount", label: "Flower Count", min: 1, max: 3, step: 1, default: 1 },
    { key: "petalCount", label: "Petal Count", min: 4, max: 8, step: 1, default: 5 },
    {
      key: "petalRoundness",
      label: "Petal Roundness",
      min: 0.5,
      max: 1.2,
      step: 0.05,
      default: 0.82,
    },
    { key: "leafCount", label: "Leaf Count", min: 1, max: 4, step: 1, default: 2 },
  ],
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
    {
      name: "rose",
      weight: 0.9,
      palettes: { bloom: ["#E8A0B0", "#C05870", "#8EA888"] },
    },
    {
      name: "sage",
      weight: 0.7,
      palettes: { bloom: ["#A0D8A8", "#3A8A5A", "#6B9E72"] },
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
      layers: 4,
      opacity: 0.44,
      spread: 0.06,
      colorVariation: 0.05,
    },
    buildElements: buildWatercolorFlowerV2Elements,
  },
};
