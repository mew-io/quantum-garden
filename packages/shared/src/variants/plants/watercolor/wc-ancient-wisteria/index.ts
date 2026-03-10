/**
 * Ancient Wisteria
 *
 * A massive, gnarled wisteria tree with a thick trunk, exposed roots,
 * and sweeping branches that support a dark leafy canopy. Luminous
 * wisteria cascades hang through the canopy like curtains of light,
 * each a tapering column of glowing blossoms. Purple mist pools at
 * the base among scattered ground flowers and sparkle particles
 * drift through the violet haze.
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
    blossomDeep: string;
    blossomMid: string;
    blossomLight: string;
    blossomGlow: string;
    center: string;
    sparkle: string;
    aura: string;
    mist: string;
    bark: string;
    barkLight: string;
    leaf: string;
    leafDark: string;
    canopy: string;
  }
> = {
  roseglow: {
    blossomDeep: "#C058A0",
    blossomMid: "#E080C0",
    blossomLight: "#F8A8D8",
    blossomGlow: "#FFD0F0",
    center: "#FFF0F8",
    sparkle: "#F8A0D0",
    aura: "#A848A0",
    mist: "#D068B8",
    bark: "#4A3838",
    barkLight: "#6A5050",
    leaf: "#3A5030",
    leafDark: "#2A3820",
    canopy: "#2A3020",
  },
  sapphire: {
    blossomDeep: "#3860C0",
    blossomMid: "#5888E0",
    blossomLight: "#88B0F8",
    blossomGlow: "#B8D0FF",
    center: "#E0F0FF",
    sparkle: "#78A0F0",
    aura: "#2848B0",
    mist: "#4868D0",
    bark: "#383838",
    barkLight: "#505058",
    leaf: "#305040",
    leafDark: "#203828",
    canopy: "#202830",
  },
  sunburst: {
    blossomDeep: "#C09818",
    blossomMid: "#E0B838",
    blossomLight: "#F0D868",
    blossomGlow: "#FFF098",
    center: "#FFFCE0",
    sparkle: "#E8C848",
    aura: "#A08010",
    mist: "#C09828",
    bark: "#3A3828",
    barkLight: "#585038",
    leaf: "#485830",
    leafDark: "#384020",
    canopy: "#303020",
  },
  amethyst: {
    blossomDeep: "#7038B8",
    blossomMid: "#9060D8",
    blossomLight: "#B088F0",
    blossomGlow: "#D0B0FF",
    center: "#F0E8FF",
    sparkle: "#A070E8",
    aura: "#5828A8",
    mist: "#7848C0",
    bark: "#3A3040",
    barkLight: "#504058",
    leaf: "#384838",
    leafDark: "#283028",
    canopy: "#282030",
  },
  orange: {
    blossomDeep: "#C86818",
    blossomMid: "#E88830",
    blossomLight: "#F8A850",
    blossomGlow: "#FFD088",
    center: "#FFF0D0",
    sparkle: "#F09038",
    aura: "#A85010",
    mist: "#D07028",
    bark: "#3A3028",
    barkLight: "#584838",
    leaf: "#485030",
    leafDark: "#384020",
    canopy: "#302820",
  },
  rainbow: {
    // Warm-to-cool spectral gradient across layers
    blossomDeep: "#D04878",
    blossomMid: "#E8A040",
    blossomLight: "#58C890",
    blossomGlow: "#80B0F8",
    center: "#FFFFFF",
    sparkle: "#D088E8",
    aura: "#8040C0",
    mist: "#A060D0",
    bark: "#3A3038",
    barkLight: "#504050",
    leaf: "#385038",
    leafDark: "#283828",
    canopy: "#282830",
  },
};

const DEFAULT_COLORS = COLORS.amethyst!;

/* ── tree structure generation ───────────────────────────────────── */

interface BranchDef {
  points: [number, number][];
  thick: number;
}

function generateTreeStructure(rng: () => number): {
  trunk: BranchDef[];
  roots: BranchDef[];
  branches: BranchDef[];
} {
  const trunkTopY = 24 + rng() * 3;
  const trunkTopX = 32 + (rng() - 0.5) * 2;
  const baseY = 54;

  const trunk: BranchDef[] = [
    // Main trunk center
    {
      points: [
        [32, baseY],
        [32 + (rng() - 0.5) * 2, 42],
        [trunkTopX + (rng() - 0.5) * 1, 33],
        [trunkTopX, trunkTopY],
      ],
      thick: 3.2,
    },
    // Left trunk edge
    {
      points: [
        [30 + (rng() - 0.5) * 0.5, baseY],
        [30.5 + (rng() - 0.5) * 1, 43],
        [trunkTopX - 2, 34],
        [trunkTopX - 2.5, trunkTopY + 2],
      ],
      thick: 1.5,
    },
    // Right trunk edge
    {
      points: [
        [34 + (rng() - 0.5) * 0.5, baseY],
        [33.5 + (rng() - 0.5) * 1, 42],
        [trunkTopX + 2, 33],
        [trunkTopX + 2.5, trunkTopY + 2],
      ],
      thick: 1.3,
    },
    // Bark texture line
    {
      points: [
        [31.5, baseY - 1],
        [31 + (rng() - 0.5) * 1, 44],
        [trunkTopX - 0.5, 35],
        [trunkTopX - 1, trunkTopY + 3],
      ],
      thick: 0.5,
    },
  ];

  const roots: BranchDef[] = [
    // Left major root
    {
      points: [
        [30, baseY],
        [24, baseY + 2],
        [16 + rng() * 3, baseY + 3],
        [10 + rng() * 4, baseY + 4 + rng() * 2],
      ],
      thick: 1.8,
    },
    // Right major root
    {
      points: [
        [34, baseY],
        [40, baseY + 2],
        [48 + rng() * 3, baseY + 3],
        [54 + rng() * 4, baseY + 4 + rng() * 2],
      ],
      thick: 1.6,
    },
    // Left smaller root
    {
      points: [
        [31, baseY + 1],
        [26, baseY + 3],
        [20 + rng() * 2, baseY + 5],
        [14 + rng() * 3, baseY + 6],
      ],
      thick: 0.9,
    },
    // Right smaller root
    {
      points: [
        [33, baseY + 1],
        [38, baseY + 3],
        [44 + rng() * 2, baseY + 5],
        [50 + rng() * 3, baseY + 6],
      ],
      thick: 0.8,
    },
  ];

  const branches: BranchDef[] = [
    // Major left branch
    {
      points: [
        [trunkTopX - 1, trunkTopY + 3],
        [trunkTopX - 8, trunkTopY - 2 + rng() * 2],
        [trunkTopX - 14, trunkTopY - 6 + rng() * 2],
        [10 + rng() * 4, 12 + rng() * 4],
      ],
      thick: 1.6,
    },
    // Major right branch
    {
      points: [
        [trunkTopX + 1, trunkTopY + 2],
        [trunkTopX + 8, trunkTopY - 3 + rng() * 2],
        [trunkTopX + 14, trunkTopY - 6 + rng() * 2],
        [52 + rng() * 4, 10 + rng() * 4],
      ],
      thick: 1.5,
    },
    // Upper left
    {
      points: [
        [trunkTopX - 0.5, trunkTopY + 1],
        [trunkTopX - 6, trunkTopY - 5],
        [trunkTopX - 10, trunkTopY - 10 + rng() * 2],
        [18 + rng() * 4, 6 + rng() * 3],
      ],
      thick: 1.0,
    },
    // Upper right
    {
      points: [
        [trunkTopX + 0.5, trunkTopY],
        [trunkTopX + 6, trunkTopY - 6],
        [trunkTopX + 10, trunkTopY - 10 + rng() * 2],
        [44 + rng() * 4, 5 + rng() * 3],
      ],
      thick: 0.95,
    },
    // Center upward
    {
      points: [
        [trunkTopX, trunkTopY],
        [trunkTopX + (rng() - 0.5) * 2, trunkTopY - 7],
        [trunkTopX + (rng() - 0.5) * 3, trunkTopY - 13],
        [32 + (rng() - 0.5) * 4, 4 + rng() * 3],
      ],
      thick: 0.85,
    },
  ];

  return { trunk, roots, branches };
}

/* ── cascade layout for tree version ─────────────────────────────── */

interface CascadeDef {
  topX: number;
  topY: number;
  length: number;
  sway: number;
}

const TREE_CASCADE_LAYOUTS: Record<number, CascadeDef[]> = {
  8: [
    { topX: 12, topY: 12, length: 28, sway: -2 },
    { topX: 20, topY: 8, length: 34, sway: -1.5 },
    { topX: 28, topY: 6, length: 38, sway: -0.5 },
    { topX: 36, topY: 6, length: 38, sway: 0.5 },
    { topX: 44, topY: 8, length: 34, sway: 1.5 },
    { topX: 52, topY: 12, length: 28, sway: 2 },
    { topX: 24, topY: 10, length: 32, sway: -1 },
    { topX: 40, topY: 10, length: 32, sway: 1 },
  ],
  10: [
    { topX: 10, topY: 14, length: 24, sway: -2.5 },
    { topX: 16, topY: 10, length: 30, sway: -2 },
    { topX: 22, topY: 7, length: 36, sway: -1 },
    { topX: 28, topY: 5, length: 40, sway: -0.5 },
    { topX: 34, topY: 5, length: 40, sway: 0 },
    { topX: 40, topY: 5, length: 40, sway: 0.5 },
    { topX: 46, topY: 7, length: 36, sway: 1 },
    { topX: 52, topY: 10, length: 30, sway: 2 },
    { topX: 56, topY: 14, length: 24, sway: 2.5 },
    { topX: 32, topY: 8, length: 34, sway: 0 },
  ],
  12: [
    { topX: 8, topY: 14, length: 22, sway: -3 },
    { topX: 14, topY: 11, length: 28, sway: -2.5 },
    { topX: 20, topY: 8, length: 34, sway: -1.5 },
    { topX: 26, topY: 6, length: 38, sway: -0.8 },
    { topX: 32, topY: 5, length: 42, sway: 0 },
    { topX: 38, topY: 6, length: 38, sway: 0.8 },
    { topX: 44, topY: 8, length: 34, sway: 1.5 },
    { topX: 50, topY: 11, length: 28, sway: 2.5 },
    { topX: 56, topY: 14, length: 22, sway: 3 },
    { topX: 17, topY: 10, length: 30, sway: -1.8 },
    { topX: 35, topY: 7, length: 36, sway: 0.3 },
    { topX: 47, topY: 10, length: 30, sway: 1.8 },
  ],
};

/* ── render a single hanging cascade ─────────────────────────────── */

function renderCascade(
  elements: WatercolorElement[],
  cascade: CascadeDef,
  bloomOpenness: number,
  colorSet: (typeof COLORS)[string],
  rng: () => number
): void {
  if (bloomOpenness <= 0) return;

  const { topX, topY, length, sway } = cascade;
  const cascadeLen = length * bloomOpenness;
  const bottomX = topX + sway * bloomOpenness;

  // === GLOW COLUMN behind cascade ===
  if (bloomOpenness > 0.2) {
    const glowY = topY + cascadeLen * 0.4;
    const glowX = topX + sway * 0.4 * bloomOpenness;

    elements.push({
      shape: { type: "disc", radius: (5 + cascadeLen * 0.1) * bloomOpenness },
      position: { x: glowX, y: glowY },
      rotation: 0,
      scale: 1,
      color: colorSet.aura,
      opacity: 0.06 + bloomOpenness * 0.06,
      zOffset: 0.5,
    });

    elements.push({
      shape: { type: "disc", radius: (3 + cascadeLen * 0.06) * bloomOpenness },
      position: { x: glowX, y: glowY - 1 },
      rotation: 0,
      scale: 1,
      color: colorSet.blossomMid,
      opacity: 0.04 + bloomOpenness * 0.05,
      zOffset: 0.55,
    });
  }

  // === BLOSSOM CLUSTERS ===
  const clusterCount = 8 + Math.floor(rng() * 5);
  for (let i = 0; i < clusterCount; i++) {
    const t = i / (clusterCount - 1); // 0=top, 1=bottom
    const cx = topX + (bottomX - topX) * t + (rng() - 0.5) * (1.8 - t * 1.2);
    const cy = topY + cascadeLen * t;

    // Taper: large at top, small at bottom
    const sizeMult = (1 - t * 0.7) * bloomOpenness;
    const r = (2.0 + rng() * 1.0) * sizeMult;
    if (r < 0.25) continue;

    // Deep base
    elements.push({
      shape: { type: "disc", radius: r },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.blossomDeep,
      opacity: 0.35 + rng() * 0.15,
      zOffset: 0.8 + t * 0.1,
    });

    // Mid glow
    elements.push({
      shape: { type: "disc", radius: r * 0.7 },
      position: { x: cx + (rng() - 0.5) * 0.4, y: cy + (rng() - 0.5) * 0.4 },
      rotation: 0,
      scale: 1,
      color: colorSet.blossomMid,
      opacity: 0.3 + bloomOpenness * 0.15,
      zOffset: 0.85 + t * 0.1,
    });

    // Bright highlight (stronger at top)
    if (t < 0.65) {
      elements.push({
        shape: { type: "disc", radius: r * 0.4 },
        position: { x: cx, y: cy },
        rotation: 0,
        scale: 1,
        color: colorSet.blossomGlow,
        opacity: (0.3 + bloomOpenness * 0.25) * (1 - t * 0.9),
        zOffset: 0.9 + t * 0.1,
      });
    }

    // Petal details
    const detailCount = Math.floor((2 + rng() * 2) * (1 - t * 0.6));
    for (let p = 0; p < detailCount; p++) {
      const pa = rng() * Math.PI * 2;
      const pd = r * (0.5 + rng() * 0.5);
      const ps = (0.5 + rng() * 0.5) * sizeMult;

      elements.push({
        shape: { type: "petal", width: ps * 0.7, length: ps, roundness: 0.8 },
        position: { x: cx + Math.cos(pa) * pd, y: cy + Math.sin(pa) * pd },
        rotation: pa + Math.PI / 2,
        scale: 1,
        color: rng() > 0.5 ? colorSet.blossomLight : colorSet.blossomMid,
        opacity: 0.22 + rng() * 0.18,
        zOffset: 0.95 + t * 0.1,
      });
    }
  }

  // === BRIGHT TOP GLOW ===
  elements.push({
    shape: { type: "disc", radius: (3.0 + rng() * 1.5) * bloomOpenness },
    position: { x: topX, y: topY + 2 },
    rotation: 0,
    scale: 1,
    color: colorSet.blossomGlow,
    opacity: 0.2 + bloomOpenness * 0.15,
    zOffset: 1.1,
  });

  elements.push({
    shape: { type: "disc", radius: (1.0 + rng() * 0.5) * bloomOpenness },
    position: { x: topX, y: topY + 1 },
    rotation: 0,
    scale: 1,
    color: colorSet.center,
    opacity: 0.35 + bloomOpenness * 0.2,
    zOffset: 1.2,
  });

  // === TRAILING BUDS at bottom ===
  const trailCount = 2 + Math.floor(rng() * 3);
  for (let i = 0; i < trailCount; i++) {
    const tt = 1 + (i + 1) * 0.07;
    const tx = topX + (bottomX - topX) * tt + (rng() - 0.5) * 0.8;
    const ty = topY + cascadeLen * tt;
    const dr = (0.25 - i * 0.04) * bloomOpenness;
    if (dr <= 0.04) continue;

    elements.push({
      shape: { type: "dot", radius: dr },
      position: { x: tx, y: ty },
      rotation: 0,
      scale: 1,
      color: colorSet.blossomLight,
      opacity: 0.18 + rng() * 0.12,
      zOffset: 1.0,
    });
  }
}

/* ── main builder ────────────────────────────────────────────────── */

function buildWcAncientWisteriaElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const cascadeCount = traitOr(ctx.traits, "cascadeCount", 10);
  const sparkleCount = traitOr(ctx.traits, "sparkleCount", 35);
  const canopyDensity = traitOr(ctx.traits, "canopyDensity", 10);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const bloomOpenness = Math.max(0, (openness - 0.1) / 0.9);
  const leafOpenness = Math.max(0, (openness - 0.03) / 0.97);
  const trunkOpenness = Math.max(0, (openness - 0.01) / 0.99);

  const colors =
    ctx.colorVariationName && COLORS[ctx.colorVariationName]
      ? COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const tree = generateTreeStructure(rng);

  // === ATMOSPHERIC GLOW ===
  if (openness > 0.1) {
    // Huge ambient glow
    elements.push({
      shape: { type: "disc", radius: 32 + bloomOpenness * 10 },
      position: { x: 32, y: 24 },
      rotation: 0,
      scale: 1,
      color: colors.aura,
      opacity: 0.04 + bloomOpenness * 0.04,
      zOffset: 0.01,
    });

    // Upper canopy glow
    elements.push({
      shape: { type: "disc", radius: 22 + bloomOpenness * 6 },
      position: { x: 32, y: 14 },
      rotation: 0,
      scale: 1,
      color: colors.mist,
      opacity: 0.04 + bloomOpenness * 0.04,
      zOffset: 0.015,
    });
  }

  // === MIST AT BASE ===
  if (openness > 0.08) {
    elements.push({
      shape: { type: "disc", radius: 30 + openness * 10 },
      position: { x: 32, y: 58 },
      rotation: 0,
      scale: 1,
      color: colors.mist,
      opacity: 0.05 + openness * 0.04,
      zOffset: 0.02,
    });

    elements.push({
      shape: { type: "disc", radius: 20 + openness * 6 },
      position: { x: 32, y: 55 },
      rotation: 0,
      scale: 1,
      color: colors.aura,
      opacity: 0.03 + openness * 0.03,
      zOffset: 0.025,
    });
  }

  // === GROUND FOLIAGE ===
  if (leafOpenness > 0) {
    // Small ground flowers scattered at base
    const groundFlowerCount = 8 + Math.floor(rng() * 6);
    for (let i = 0; i < groundFlowerCount; i++) {
      const fx = 8 + rng() * 48;
      const fy = 55 + rng() * 5;

      elements.push({
        shape: { type: "dot", radius: 0.35 + rng() * 0.4 },
        position: { x: fx, y: fy },
        rotation: 0,
        scale: leafOpenness,
        color: rng() > 0.6 ? colors.blossomLight : colors.blossomMid,
        opacity: 0.25 + rng() * 0.2,
        zOffset: 0.035,
      });

      // Tiny glow behind each ground flower
      if (rng() > 0.5) {
        elements.push({
          shape: { type: "disc", radius: 1.0 + rng() * 0.8 },
          position: { x: fx, y: fy },
          rotation: 0,
          scale: leafOpenness,
          color: colors.aura,
          opacity: 0.03 + rng() * 0.03,
          zOffset: 0.033,
        });
      }
    }

    // Ground foliage patches
    const patchCount = 4 + Math.floor(rng() * 3);
    for (let i = 0; i < patchCount; i++) {
      const px = 6 + rng() * 52;
      const py = 56 + rng() * 4;
      elements.push({
        shape: { type: "leaf", width: 2 + rng() * 1.5, length: 3 + rng() * 3 },
        position: { x: px, y: py },
        rotation: -Math.PI / 2 + (rng() - 0.5) * 0.7,
        scale: leafOpenness * 0.5,
        color: rng() > 0.5 ? colors.leaf : colors.leafDark,
        opacity: 0.3 + rng() * 0.1,
        zOffset: 0.04,
      });
    }
  }

  // === EXPOSED ROOTS ===
  if (trunkOpenness > 0) {
    for (const root of tree.roots) {
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
    for (let i = 0; i < tree.trunk.length; i++) {
      const t = tree.trunk[i]!;
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

  // === BRANCHES ===
  if (trunkOpenness > 0) {
    for (let i = 0; i < tree.branches.length; i++) {
      const b = tree.branches[i]!;
      const branchProgress = Math.max(0, (trunkOpenness - 0.15) / 0.85);
      if (branchProgress <= 0) continue;

      elements.push({
        shape: {
          type: "stem",
          points: b.points,
          thickness: b.thick * (0.3 + branchProgress * 0.7),
        },
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        color: i < 2 ? colors.bark : colors.barkLight,
        opacity: 0.4 + branchProgress * 0.15,
        zOffset: 0.08 + i * 0.004,
      });
    }
  }

  // === DARK LEAFY CANOPY ===
  if (leafOpenness > 0) {
    const canopyClusterCount = Math.max(6, Math.round(canopyDensity));

    // Large dark canopy dome shapes
    const canopyPositions = [
      { x: 32, y: 10, r: 18 },
      { x: 22, y: 12, r: 14 },
      { x: 42, y: 11, r: 14 },
      { x: 14, y: 16, r: 10 },
      { x: 50, y: 15, r: 10 },
      { x: 32, y: 6, r: 12 },
    ];

    for (let i = 0; i < Math.min(canopyClusterCount, canopyPositions.length); i++) {
      const cp = canopyPositions[i]!;
      elements.push({
        shape: { type: "disc", radius: cp.r * leafOpenness },
        position: { x: cp.x + (rng() - 0.5) * 2, y: cp.y + (rng() - 0.5) * 2 },
        rotation: 0,
        scale: 1,
        color: colors.canopy,
        opacity: 0.2 + leafOpenness * 0.15,
        zOffset: 0.35 + rng() * 0.05,
      });
    }

    // Detail leaf clusters at edges
    const leafClusterCount = 8 + Math.floor(rng() * 5);
    for (let i = 0; i < leafClusterCount; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = 12 + rng() * 10;
      const lx = 32 + Math.cos(angle) * dist * 0.9;
      const ly = 12 + Math.sin(angle) * dist * 0.5;

      if (ly > 2 && ly < 24 && lx > 4 && lx < 60) {
        elements.push({
          shape: { type: "leaf", width: 1.5 + rng() * 1.5, length: 3 + rng() * 3 },
          position: { x: lx, y: ly },
          rotation: Math.PI / 2 + (rng() - 0.5) * 1.0,
          scale: leafOpenness * (0.4 + rng() * 0.3),
          color: rng() > 0.4 ? colors.leaf : colors.leafDark,
          opacity: 0.3 + rng() * 0.15,
          zOffset: 0.4 + rng() * 0.05,
        });
      }
    }
  }

  // === WISTERIA CASCADES ===
  const clampedCascades = Math.max(8, Math.min(12, Math.round(cascadeCount)));
  const cascadeLayout = TREE_CASCADE_LAYOUTS[clampedCascades] ?? TREE_CASCADE_LAYOUTS[10]!;

  for (let i = 0; i < cascadeLayout.length; i++) {
    const c = cascadeLayout[i]!;
    const adjusted: CascadeDef = {
      topX: c.topX + (rng() - 0.5) * 2,
      topY: c.topY + (rng() - 0.5) * 1.5,
      length: c.length + (rng() - 0.5) * 4,
      sway: c.sway + (rng() - 0.5) * 0.8,
    };
    renderCascade(elements, adjusted, bloomOpenness, colors, rng);
  }

  // === SPARKLE PARTICLES ===
  if (bloomOpenness > 0.1) {
    const sparkleOpenness = Math.min(1, (bloomOpenness - 0.1) / 0.6);
    const activeSparkles = Math.round(sparkleCount * sparkleOpenness);

    for (let i = 0; i < activeSparkles; i++) {
      const sx = 6 + rng() * 52;
      const sy = 4 + rng() * 54;

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
        color: isLarge ? colors.center : isMedium ? colors.blossomGlow : colors.sparkle,
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

export const wcAncientWisteria: PlantVariant = {
  id: "wc-ancient-wisteria",
  name: "Ancient Wisteria",
  description:
    "A massive gnarled wisteria tree with exposed roots and a dark canopy, from which luminous blossom cascades hang like curtains of captured starlight amid drifting purple mist",
  rarity: 0.05,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      cascadeCount: { signal: "entropy", range: [8, 12], default: 10, round: true },
      sparkleCount: { signal: "growth", range: [25, 45], default: 35, round: true },
      canopyDensity: { signal: "spread", range: [6, 12], default: 10, round: true },
    },
  },
  colorVariations: [
    {
      name: "roseglow",
      weight: 0.8,
      palettes: { bloom: ["#C058A0", "#E080C0", "#4A3838"] },
    },
    {
      name: "sapphire",
      weight: 0.8,
      palettes: { bloom: ["#3860C0", "#5888E0", "#383838"] },
    },
    {
      name: "sunburst",
      weight: 0.8,
      palettes: { bloom: ["#C09818", "#E0B838", "#3A3828"] },
    },
    {
      name: "amethyst",
      weight: 1.0,
      palettes: { bloom: ["#7038B8", "#9060D8", "#3A3040"] },
    },
    {
      name: "orange",
      weight: 0.8,
      palettes: { bloom: ["#C86818", "#E88830", "#3A3028"] },
    },
    {
      name: "rainbow",
      weight: 0.6,
      palettes: { bloom: ["#D04878", "#E8A040", "#3A3038"] },
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
    wcEffect: { layers: 5, opacity: 0.5, spread: 0.1, colorVariation: 0.08 },
    buildElements: buildWcAncientWisteriaElements,
  },
};
