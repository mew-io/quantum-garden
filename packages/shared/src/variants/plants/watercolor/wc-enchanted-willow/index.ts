/**
 * Enchanted Willow
 *
 * A majestic weeping willow radiating ethereal green-gold light.
 * The thick, gnarled trunk splits into sweeping branches that arch
 * upward then cascade downward in curtains of long, thin, luminous
 * fronds. Golden light emanates from the inner canopy, illuminating
 * the hundreds of trailing tendrils. Sparkle particles drift among
 * the fronds while soft mist pools at the base among wildflowers
 * and exposed roots.
 *
 * Category: watercolor (trees / ethereal)
 * Rarity: 0.05
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, standardOpenness, traitOr } from "../_helpers";

/* ── colour palettes ─────────────────────────────────────────────── */

const COLORS: Record<
  string,
  {
    frondBase: string;
    frondLight: string;
    frondGlow: string;
    innerGlow: string;
    center: string;
    sparkle: string;
    aura: string;
    mist: string;
    bark: string;
    barkLight: string;
    leaf: string;
    groundFlower: string;
  }
> = {
  emerald: {
    frondBase: "#408830",
    frondLight: "#70B850",
    frondGlow: "#B0E888",
    innerGlow: "#E8FFD0",
    center: "#FFFFF0",
    sparkle: "#C0F080",
    aura: "#387028",
    mist: "#5A8840",
    bark: "#4A3828",
    barkLight: "#685840",
    leaf: "#3A6828",
    groundFlower: "#D8A0D0",
  },
  roseglow: {
    frondBase: "#B85888",
    frondLight: "#E080B0",
    frondGlow: "#F8B0D0",
    innerGlow: "#FFE0F0",
    center: "#FFF8FC",
    sparkle: "#F8A0C8",
    aura: "#A04878",
    mist: "#C06898",
    bark: "#4A3838",
    barkLight: "#685050",
    leaf: "#684050",
    groundFlower: "#F0B0D0",
  },
  sapphire: {
    frondBase: "#3868B0",
    frondLight: "#6090D8",
    frondGlow: "#98C0F8",
    innerGlow: "#D0E8FF",
    center: "#F0F8FF",
    sparkle: "#80B0F0",
    aura: "#284890",
    mist: "#4068B0",
    bark: "#383840",
    barkLight: "#505060",
    leaf: "#304860",
    groundFlower: "#90B8E8",
  },
  sunburst: {
    frondBase: "#B89820",
    frondLight: "#D8B840",
    frondGlow: "#F0D870",
    innerGlow: "#FFF8C0",
    center: "#FFFEF0",
    sparkle: "#E8D050",
    aura: "#987810",
    mist: "#B89828",
    bark: "#4A3828",
    barkLight: "#685838",
    leaf: "#686030",
    groundFlower: "#F0D080",
  },
  amethyst: {
    frondBase: "#6838A8",
    frondLight: "#9060D0",
    frondGlow: "#B890F0",
    innerGlow: "#E0D0FF",
    center: "#F8F0FF",
    sparkle: "#A878E8",
    aura: "#5028A0",
    mist: "#7048B8",
    bark: "#383040",
    barkLight: "#504058",
    leaf: "#483860",
    groundFlower: "#B888E0",
  },
};

const DEFAULT_COLORS = COLORS.emerald!;

/* ── tree structure ──────────────────────────────────────────────── */

interface StemDef {
  points: [number, number][];
  thick: number;
}

function generateTrunk(rng: () => number): StemDef[] {
  const topY = 22 + rng() * 3;
  const topX = 32 + (rng() - 0.5) * 2;
  const baseY = 54;

  return [
    // Main trunk
    {
      points: [
        [32, baseY],
        [32 + (rng() - 0.5) * 2, 42],
        [topX + (rng() - 0.5) * 1, 32],
        [topX, topY],
      ],
      thick: 3.0,
    },
    // Left edge
    {
      points: [
        [30.5, baseY],
        [30.5 + (rng() - 0.5) * 1, 43],
        [topX - 2, 33],
        [topX - 2.5, topY + 2],
      ],
      thick: 1.4,
    },
    // Right edge
    {
      points: [
        [33.5, baseY],
        [33.5 + (rng() - 0.5) * 1, 42],
        [topX + 2, 32],
        [topX + 2.5, topY + 2],
      ],
      thick: 1.2,
    },
    // Bark texture
    {
      points: [
        [31.5, baseY - 1],
        [31 + (rng() - 0.5) * 1, 44],
        [topX - 0.5, 34],
        [topX - 1, topY + 3],
      ],
      thick: 0.45,
    },
  ];
}

function generateRoots(rng: () => number): StemDef[] {
  const baseY = 54;
  return [
    {
      points: [
        [30, baseY],
        [22, baseY + 2],
        [14 + rng() * 3, baseY + 3],
        [8 + rng() * 4, baseY + 4],
      ],
      thick: 1.6,
    },
    {
      points: [
        [34, baseY],
        [42, baseY + 2],
        [50 + rng() * 3, baseY + 3],
        [56 + rng() * 4, baseY + 4],
      ],
      thick: 1.5,
    },
    {
      points: [
        [31, baseY + 1],
        [25, baseY + 3],
        [18 + rng() * 2, baseY + 5],
        [12 + rng() * 3, baseY + 5.5],
      ],
      thick: 0.8,
    },
    {
      points: [
        [33, baseY + 1],
        [39, baseY + 3],
        [46 + rng() * 2, baseY + 5],
        [52 + rng() * 3, baseY + 5.5],
      ],
      thick: 0.75,
    },
  ];
}

interface BranchDef {
  /** branch stem points */
  stem: StemDef;
  /** where fronds start hanging from (tip region) */
  tipX: number;
  tipY: number;
  /** how far fronds hang */
  frondLength: number;
  /** number of fronds to hang from this branch */
  frondCount: number;
}

function generateBranches(rng: () => number): BranchDef[] {
  const topY = 22 + rng() * 3;
  const topX = 32 + (rng() - 0.5) * 2;

  return [
    // Major left branch — arches left then droops
    {
      stem: {
        points: [
          [topX - 1, topY + 3],
          [topX - 8, topY - 4],
          [topX - 16, topY - 5 + rng() * 2],
          [10 + rng() * 3, 10 + rng() * 3],
        ],
        thick: 1.4,
      },
      tipX: 10 + rng() * 3,
      tipY: 10 + rng() * 3,
      frondLength: 35 + rng() * 5,
      frondCount: 5,
    },
    // Major right branch
    {
      stem: {
        points: [
          [topX + 1, topY + 2],
          [topX + 8, topY - 4],
          [topX + 16, topY - 5 + rng() * 2],
          [54 + rng() * 3, 10 + rng() * 3],
        ],
        thick: 1.3,
      },
      tipX: 54 + rng() * 3,
      tipY: 10 + rng() * 3,
      frondLength: 35 + rng() * 5,
      frondCount: 5,
    },
    // Upper-left
    {
      stem: {
        points: [
          [topX - 0.5, topY + 1],
          [topX - 5, topY - 5],
          [topX - 10, topY - 10 + rng() * 2],
          [16 + rng() * 3, 6 + rng() * 3],
        ],
        thick: 0.9,
      },
      tipX: 16 + rng() * 3,
      tipY: 6 + rng() * 3,
      frondLength: 38 + rng() * 5,
      frondCount: 4,
    },
    // Upper-right
    {
      stem: {
        points: [
          [topX + 0.5, topY],
          [topX + 5, topY - 5],
          [topX + 10, topY - 10 + rng() * 2],
          [48 + rng() * 3, 5 + rng() * 3],
        ],
        thick: 0.85,
      },
      tipX: 48 + rng() * 3,
      tipY: 5 + rng() * 3,
      frondLength: 38 + rng() * 5,
      frondCount: 4,
    },
    // Center upward
    {
      stem: {
        points: [
          [topX, topY],
          [topX + (rng() - 0.5) * 2, topY - 7],
          [topX + (rng() - 0.5) * 3, topY - 14],
          [32 + (rng() - 0.5) * 4, 4 + rng() * 2],
        ],
        thick: 0.8,
      },
      tipX: 32 + (rng() - 0.5) * 4,
      tipY: 4 + rng() * 2,
      frondLength: 40 + rng() * 5,
      frondCount: 4,
    },
    // Mid-left
    {
      stem: {
        points: [
          [topX - 1.5, topY + 4],
          [topX - 10, topY],
          [topX - 16, topY - 2 + rng() * 2],
          [6 + rng() * 3, 14 + rng() * 3],
        ],
        thick: 0.7,
      },
      tipX: 6 + rng() * 3,
      tipY: 14 + rng() * 3,
      frondLength: 30 + rng() * 5,
      frondCount: 3,
    },
    // Mid-right
    {
      stem: {
        points: [
          [topX + 1.5, topY + 4],
          [topX + 10, topY],
          [topX + 16, topY - 2 + rng() * 2],
          [58 + rng() * 3, 14 + rng() * 3],
        ],
        thick: 0.7,
      },
      tipX: 58 + rng() * 3,
      tipY: 14 + rng() * 3,
      frondLength: 30 + rng() * 5,
      frondCount: 3,
    },
  ];
}

/* ── render hanging willow fronds from a branch tip ──────────────── */

function renderFronds(
  elements: WatercolorElement[],
  tipX: number,
  tipY: number,
  frondCount: number,
  frondLength: number,
  bloomOpenness: number,
  colorSet: (typeof COLORS)[string],
  rng: () => number
): void {
  if (bloomOpenness <= 0) return;

  const len = frondLength * bloomOpenness;

  for (let i = 0; i < frondCount; i++) {
    // Each frond starts near the branch tip and hangs straight down with slight sway
    const startX = tipX + (rng() - 0.5) * 6;
    const startY = tipY + rng() * 3;
    const sway = (rng() - 0.5) * 6;
    const thisLen = len * (0.6 + rng() * 0.4);
    const endX = startX + sway;
    const endY = startY + thisLen;

    // Frond as thin stem
    elements.push({
      shape: {
        type: "stem",
        points: [
          [startX, startY],
          [startX + sway * 0.2, startY + thisLen * 0.3],
          [startX + sway * 0.6, startY + thisLen * 0.65],
          [endX, endY],
        ],
        thickness: 0.15 + rng() * 0.12,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: colorSet.frondBase,
      opacity: 0.3 + bloomOpenness * 0.2 + rng() * 0.1,
      zOffset: 0.6 + rng() * 0.1,
    });

    // Tiny leaf-like nodes along the frond
    const nodeCount = 3 + Math.floor(rng() * 4);
    for (let j = 0; j < nodeCount; j++) {
      const t = (j + 1) / (nodeCount + 1);
      const nx = startX + (endX - startX) * t + (rng() - 0.5) * 1;
      const ny = startY + thisLen * t;
      const side = rng() > 0.5 ? 1 : -1;

      elements.push({
        shape: {
          type: "petal",
          width: (0.3 + rng() * 0.25) * bloomOpenness,
          length: (0.8 + rng() * 0.6) * bloomOpenness,
          roundness: 0.5,
        },
        position: { x: nx, y: ny },
        rotation: Math.PI / 2 + side * (0.3 + rng() * 0.4),
        scale: 1,
        color: rng() > 0.4 ? colorSet.frondLight : colorSet.frondBase,
        opacity: 0.25 + rng() * 0.15,
        zOffset: 0.65 + rng() * 0.1,
      });
    }

    // Glow along the frond (especially near top)
    if (bloomOpenness > 0.3 && rng() > 0.3) {
      elements.push({
        shape: { type: "disc", radius: (1.5 + rng() * 1.0) * bloomOpenness },
        position: { x: startX + sway * 0.15, y: startY + thisLen * 0.15 },
        rotation: 0,
        scale: 1,
        color: colorSet.frondGlow,
        opacity: 0.06 + bloomOpenness * 0.06,
        zOffset: 0.55,
      });
    }
  }
}

/* ── main builder ────────────────────────────────────────────────── */

function buildWcEnchantedWillowElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const frondDensity = traitOr(ctx.traits, "frondDensity", 7);
  const sparkleCount = traitOr(ctx.traits, "sparkleCount", 35);
  const branchCount = traitOr(ctx.traits, "branchCount", 7);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const bloomOpenness = Math.max(0, (openness - 0.1) / 0.9);
  const leafOpenness = Math.max(0, (openness - 0.03) / 0.97);
  const trunkOpenness = Math.max(0, (openness - 0.01) / 0.99);

  const colors =
    ctx.colorVariationName && COLORS[ctx.colorVariationName]
      ? COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const trunk = generateTrunk(rng);
  const roots = generateRoots(rng);
  const branches = generateBranches(rng);
  const activeBranches = Math.max(5, Math.min(7, Math.round(branchCount)));

  // === ATMOSPHERIC GLOW ===
  if (openness > 0.1) {
    // Large ambient glow behind the whole tree
    elements.push({
      shape: { type: "disc", radius: 30 + bloomOpenness * 8 },
      position: { x: 32, y: 20 },
      rotation: 0,
      scale: 1,
      color: colors.aura,
      opacity: 0.04 + bloomOpenness * 0.04,
      zOffset: 0.01,
    });

    // Inner canopy golden glow
    elements.push({
      shape: { type: "disc", radius: 16 + bloomOpenness * 5 },
      position: { x: 32, y: 14 },
      rotation: 0,
      scale: 1,
      color: colors.innerGlow,
      opacity: 0.05 + bloomOpenness * 0.06,
      zOffset: 0.015,
    });

    // Bright center core light
    elements.push({
      shape: { type: "disc", radius: 8 + bloomOpenness * 3 },
      position: { x: 32, y: 12 },
      rotation: 0,
      scale: 1,
      color: colors.center,
      opacity: 0.04 + bloomOpenness * 0.05,
      zOffset: 0.018,
    });
  }

  // === MIST AT BASE ===
  if (openness > 0.08) {
    elements.push({
      shape: { type: "disc", radius: 28 + openness * 10 },
      position: { x: 32, y: 58 },
      rotation: 0,
      scale: 1,
      color: colors.mist,
      opacity: 0.04 + openness * 0.03,
      zOffset: 0.02,
    });

    elements.push({
      shape: { type: "disc", radius: 18 + openness * 6 },
      position: { x: 32, y: 55 },
      rotation: 0,
      scale: 1,
      color: colors.aura,
      opacity: 0.03 + openness * 0.03,
      zOffset: 0.025,
    });
  }

  // === GROUND FLOWERS AND FOLIAGE ===
  if (leafOpenness > 0) {
    // Small wildflowers at base (pink/purple in photo)
    const flowerCount = 10 + Math.floor(rng() * 8);
    for (let i = 0; i < flowerCount; i++) {
      const fx = 8 + rng() * 48;
      const fy = 54 + rng() * 6;

      elements.push({
        shape: { type: "dot", radius: 0.3 + rng() * 0.4 },
        position: { x: fx, y: fy },
        rotation: 0,
        scale: leafOpenness,
        color: colors.groundFlower,
        opacity: 0.25 + rng() * 0.2,
        zOffset: 0.035,
      });
    }

    // Ground grass
    const grassCount = 8 + Math.floor(rng() * 5);
    for (let i = 0; i < grassCount; i++) {
      const gx = 8 + rng() * 48;
      const gy = 55 + rng() * 4;
      const angle = -Math.PI / 2 + (rng() - 0.5) * 0.7;
      const bladeLen = (2 + rng() * 4) * Math.min(leafOpenness * 1.5, 1);

      elements.push({
        shape: { type: "petal", width: 0.4 + rng() * 0.3, length: bladeLen, roundness: 0.15 },
        position: { x: gx, y: gy },
        rotation: angle,
        scale: 1,
        color: colors.leaf,
        opacity: 0.3 + rng() * 0.15,
        zOffset: 0.04 + rng() * 0.02,
      });
    }

    // Moss patches near roots
    const mossCount = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < mossCount; i++) {
      const mx = 26 + rng() * 12;
      const my = 53 + rng() * 3;
      elements.push({
        shape: { type: "disc", radius: 2 + rng() * 2 },
        position: { x: mx, y: my },
        rotation: 0,
        scale: leafOpenness,
        color: colors.leaf,
        opacity: 0.15 + rng() * 0.1,
        zOffset: 0.038,
      });
    }
  }

  // === ROOTS ===
  if (trunkOpenness > 0) {
    for (const root of roots) {
      elements.push({
        shape: {
          type: "stem",
          points: root.points,
          thickness: root.thick * (0.3 + trunkOpenness * 0.7),
        },
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        color: colors.bark,
        opacity: 0.5 + trunkOpenness * 0.15,
        zOffset: 0.06,
      });
    }
  }

  // === TRUNK ===
  if (trunkOpenness > 0) {
    for (let i = 0; i < trunk.length; i++) {
      const t = trunk[i]!;
      elements.push({
        shape: {
          type: "stem",
          points: t.points,
          thickness: t.thick * (0.3 + trunkOpenness * 0.7),
        },
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        color: i < 3 ? colors.bark : colors.barkLight,
        opacity: (i === 0 ? 0.65 : i < 3 ? 0.5 : 0.3) + trunkOpenness * 0.1,
        zOffset: 0.07 + i * 0.003,
      });
    }
  }

  // === BRANCHES + HANGING FRONDS ===
  for (let i = 0; i < Math.min(activeBranches, branches.length); i++) {
    const branch = branches[i]!;
    const branchProgress = i < 2 ? trunkOpenness : Math.max(0, (trunkOpenness - 0.15) / 0.85);

    if (branchProgress <= 0) continue;

    // Draw the branch stem
    elements.push({
      shape: {
        type: "stem",
        points: branch.stem.points,
        thickness: branch.stem.thick * (0.3 + branchProgress * 0.7),
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: i < 2 ? colors.bark : colors.barkLight,
      opacity: 0.4 + branchProgress * 0.15,
      zOffset: 0.08 + i * 0.004,
    });

    // Render hanging fronds from this branch
    const adjustedFrondCount = Math.max(2, Math.round(branch.frondCount * (frondDensity / 7)));
    renderFronds(
      elements,
      branch.tipX,
      branch.tipY,
      adjustedFrondCount,
      branch.frondLength,
      bloomOpenness,
      colors,
      rng
    );
  }

  // === CANOPY GLOW PATCHES (light filtering through fronds) ===
  if (bloomOpenness > 0.2) {
    const glowPatches = 6 + Math.floor(rng() * 4);
    for (let i = 0; i < glowPatches; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = 4 + rng() * 12;
      const gx = 32 + Math.cos(angle) * dist * 0.8;
      const gy = 10 + Math.sin(angle) * dist * 0.5 + rng() * 8;

      if (gy > 4 && gy < 24) {
        elements.push({
          shape: { type: "disc", radius: (2 + rng() * 3) * bloomOpenness },
          position: { x: gx, y: gy },
          rotation: 0,
          scale: 1,
          color: rng() > 0.5 ? colors.frondGlow : colors.innerGlow,
          opacity: 0.08 + bloomOpenness * 0.08 + rng() * 0.04,
          zOffset: 0.45 + rng() * 0.05,
        });
      }
    }
  }

  // === SPARKLE PARTICLES ===
  if (bloomOpenness > 0.1) {
    const sparkleOpenness = Math.min(1, (bloomOpenness - 0.1) / 0.6);
    const activeSparkles = Math.round(sparkleCount * sparkleOpenness);

    for (let i = 0; i < activeSparkles; i++) {
      // Concentrate sparkles in the frond area (hanging curtain region)
      const sx = 6 + rng() * 52;
      const sy = 6 + rng() * 50;

      const roll = rng();
      const isLarge = roll < 0.1;
      const isMedium = roll < 0.3;

      const sparkleRadius = isLarge
        ? 0.7 + rng() * 0.45
        : isMedium
          ? 0.35 + rng() * 0.25
          : 0.12 + rng() * 0.18;

      elements.push({
        shape: { type: "dot", radius: sparkleRadius },
        position: { x: sx, y: sy },
        rotation: 0,
        scale: 1,
        color: isLarge ? colors.center : isMedium ? colors.frondGlow : colors.sparkle,
        opacity: (isLarge ? 0.8 : isMedium ? 0.5 : 0.3) + rng() * 0.15,
        zOffset: 2.0 + rng() * 0.5,
      });

      if (isLarge || isMedium) {
        elements.push({
          shape: { type: "disc", radius: sparkleRadius * (isLarge ? 4.5 : 2.8) },
          position: { x: sx, y: sy },
          rotation: 0,
          scale: 1,
          color: colors.aura,
          opacity: (isLarge ? 0.07 : 0.04) + rng() * 0.03,
          zOffset: 1.9,
        });
      }
    }
  }

  return elements;
}

/* ── variant definition ──────────────────────────────────────────── */

export const wcEnchantedWillow: PlantVariant = {
  id: "wc-enchanted-willow",
  name: "Enchanted Willow",
  description:
    "A majestic weeping willow aglow with inner light, its long trailing fronds forming luminous curtains that shimmer with golden-green radiance amid drifting sparkles",
  rarity: 0.05,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      frondDensity: { signal: "entropy", range: [5, 9], default: 7, round: true },
      sparkleCount: { signal: "growth", range: [25, 45], default: 35, round: true },
      branchCount: { signal: "spread", range: [5, 7], default: 7, round: true },
    },
  },
  colorVariations: [
    {
      name: "emerald",
      weight: 1.0,
      palettes: { bloom: ["#408830", "#70B850", "#4A3828"] },
    },
    {
      name: "roseglow",
      weight: 0.8,
      palettes: { bloom: ["#B85888", "#E080B0", "#4A3838"] },
    },
    {
      name: "sapphire",
      weight: 0.8,
      palettes: { bloom: ["#3868B0", "#6090D8", "#383840"] },
    },
    {
      name: "sunburst",
      weight: 0.8,
      palettes: { bloom: ["#B89820", "#D8B840", "#4A3828"] },
    },
    {
      name: "amethyst",
      weight: 0.8,
      palettes: { bloom: ["#6838A8", "#9060D0", "#383040"] },
    },
  ],
  clusteringBehavior: {
    mode: "spread",
    clusterRadius: 550,
    clusterBonus: 1.1,
    maxClusterDensity: 2,
    reseedClusterChance: 0.25,
  },
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 20 },
      { name: "sprout", duration: 24 },
      { name: "bloom", duration: 55 },
      { name: "fade", duration: 24 },
    ],
    wcEffect: { layers: 5, opacity: 0.5, spread: 0.1, colorVariation: 0.07 },
    buildElements: buildWcEnchantedWillowElements,
  },
};
