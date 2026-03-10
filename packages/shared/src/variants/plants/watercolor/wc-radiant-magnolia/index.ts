/**
 * Radiant Magnolia
 *
 * A majestic magnolia tree with a massive gnarled trunk and thick
 * exposed roots. The wide canopy is packed with large cup-shaped
 * magnolia blossoms — each bloom rendered as a cluster of cupped
 * petals with warm inner glow. A strong golden backlight radiates
 * from within the tree, casting the entire scene in pink-gold
 * warmth. Large foreground magnolia flowers frame the base while
 * sparkle particles float through the air.
 *
 * Category: watercolor (trees / ethereal)
 * Rarity: 0.06
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, standardOpenness, traitOr } from "../_helpers";

/* ── colour palettes ─────────────────────────────────────────────── */

const COLORS: Record<
  string,
  {
    bark: string;
    barkHighlight: string;
    barkDark: string;
    blossomDeep: string;
    blossomMid: string;
    blossomLight: string;
    blossomGlow: string;
    petalInner: string;
    center: string;
    sparkle: string;
    aura: string;
    backlight: string;
    mist: string;
    leaf: string;
    ground: string;
  }
> = {
  roseglow: {
    bark: "#3D2B28",
    barkHighlight: "#5A4038",
    barkDark: "#2A1C1A",
    blossomDeep: "#C06898",
    blossomMid: "#E090B8",
    blossomLight: "#F4B8D4",
    blossomGlow: "#FFD8EC",
    petalInner: "#FFE8F4",
    center: "#FFF4F8",
    sparkle: "#FFB8D8",
    aura: "#C06898",
    backlight: "#E8A860",
    mist: "#D080A8",
    leaf: "#3A4830",
    ground: "#4A3838",
  },
  sunburst: {
    bark: "#3D3020",
    barkHighlight: "#5A4830",
    barkDark: "#2A2018",
    blossomDeep: "#C8A030",
    blossomMid: "#E0C050",
    blossomLight: "#F0D878",
    blossomGlow: "#FFF0A8",
    petalInner: "#FFF8D0",
    center: "#FFFCE8",
    sparkle: "#F0D060",
    aura: "#C09820",
    backlight: "#D8A030",
    mist: "#C0A040",
    leaf: "#4A5830",
    ground: "#484030",
  },
  amethyst: {
    bark: "#302038",
    barkHighlight: "#4A3858",
    barkDark: "#201828",
    blossomDeep: "#8040B0",
    blossomMid: "#A068D0",
    blossomLight: "#C098E8",
    blossomGlow: "#DCC0FF",
    petalInner: "#ECD8FF",
    center: "#F4ECFF",
    sparkle: "#B890F0",
    aura: "#7838A8",
    backlight: "#C888E0",
    mist: "#8858B0",
    leaf: "#383848",
    ground: "#383040",
  },
  white: {
    bark: "#3A3230",
    barkHighlight: "#584848",
    barkDark: "#2A2220",
    blossomDeep: "#B8B0A8",
    blossomMid: "#D0CCC8",
    blossomLight: "#E8E4E0",
    blossomGlow: "#F4F0EC",
    petalInner: "#FAF8F4",
    center: "#FFFFFF",
    sparkle: "#E8E0D8",
    aura: "#A8A098",
    backlight: "#E0C890",
    mist: "#B8B0A8",
    leaf: "#3A4830",
    ground: "#3A3838",
  },
};

const DEFAULT_COLORS = COLORS.roseglow!;

/* ── trunk & branch generation ───────────────────────────────────── */

interface BranchDef {
  points: [number, number][];
  thick: number;
}

function generateTrunk(rng: () => number): BranchDef[] {
  const baseX = 32 + (rng() - 0.5) * 2;
  const topY = 26 + rng() * 2;
  const topX = baseX + (rng() - 0.5) * 2;

  return [
    // Main trunk — very thick
    {
      points: [
        [baseX, 60],
        [baseX + (rng() - 0.5) * 2, 48],
        [topX + (rng() - 0.5) * 1.5, 36],
        [topX, topY],
      ],
      thick: 3.2,
    },
    // Left trunk thickening
    {
      points: [
        [baseX - 1.5 + (rng() - 0.5) * 0.5, 60],
        [baseX - 1.2 + (rng() - 0.5) * 0.8, 46],
        [topX - 2.0, 35],
        [topX - 2.5, topY + 1],
      ],
      thick: 1.6,
    },
    // Right trunk thickening
    {
      points: [
        [baseX + 1.5 + (rng() - 0.5) * 0.5, 60],
        [baseX + 1.3 + (rng() - 0.5) * 0.8, 47],
        [topX + 2.0, 36],
        [topX + 2.5, topY + 1],
      ],
      thick: 1.4,
    },
    // Inner bark texture line left
    {
      points: [
        [baseX - 0.5, 58],
        [baseX - 0.3 + (rng() - 0.5) * 0.5, 44],
        [topX - 0.8, 34],
        [topX - 1.0, topY + 2],
      ],
      thick: 0.6,
    },
    // Inner bark texture line right
    {
      points: [
        [baseX + 0.5, 58],
        [baseX + 0.4 + (rng() - 0.5) * 0.5, 45],
        [topX + 0.9, 35],
        [topX + 1.0, topY + 2],
      ],
      thick: 0.5,
    },
  ];
}

function generateRoots(rng: () => number): BranchDef[] {
  const baseX = 32 + (rng() - 0.5) * 2;
  const roots: BranchDef[] = [];
  const rootCount = 4 + Math.floor(rng() * 3);

  for (let i = 0; i < rootCount; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const spread = 4 + rng() * 8;
    const rootLen = 4 + rng() * 6;

    roots.push({
      points: [
        [baseX + side * (0.5 + rng() * 1.5), 58 + rng() * 2],
        [baseX + side * (spread * 0.4), 58 + rng() * 2],
        [baseX + side * (spread * 0.7), 59 + rng() * 2],
        [baseX + side * spread, 58 + rootLen * 0.3 + rng() * 2],
      ],
      thick: 0.7 + rng() * 0.6,
    });
  }

  return roots;
}

function generateBranches(rng: () => number): BranchDef[] {
  const topX = 32 + (rng() - 0.5) * 2;
  const topY = 26 + rng() * 2;

  return [
    // Major left branch — sweeping out
    {
      points: [
        [topX - 1, topY + 2],
        [topX - 7, topY - 2 + rng() * 3],
        [topX - 14, topY - 6 + rng() * 2],
        [12 + rng() * 4, 14 + rng() * 4],
      ],
      thick: 1.6,
    },
    // Major right branch
    {
      points: [
        [topX + 1, topY + 1],
        [topX + 8, topY - 3 + rng() * 3],
        [topX + 14, topY - 7 + rng() * 2],
        [50 + rng() * 4, 13 + rng() * 4],
      ],
      thick: 1.5,
    },
    // Upper-left branch
    {
      points: [
        [topX - 0.5, topY],
        [topX - 5, topY - 6],
        [topX - 10, topY - 11 + rng() * 2],
        [18 + rng() * 4, 8 + rng() * 3],
      ],
      thick: 1.1,
    },
    // Upper-right branch
    {
      points: [
        [topX + 0.5, topY - 1],
        [topX + 6, topY - 7],
        [topX + 10, topY - 11 + rng() * 2],
        [44 + rng() * 4, 7 + rng() * 3],
      ],
      thick: 1.0,
    },
    // Center upward
    {
      points: [
        [topX, topY],
        [topX + (rng() - 0.5) * 2, topY - 7],
        [topX + (rng() - 0.5) * 3, topY - 13],
        [32 + (rng() - 0.5) * 4, 5 + rng() * 3],
      ],
      thick: 0.9,
    },
    // Lower-left drooping branch
    {
      points: [
        [topX - 2, topY + 3],
        [topX - 10, topY + 1 + rng() * 2],
        [topX - 16, topY - 1 + rng() * 3],
        [8 + rng() * 4, 20 + rng() * 4],
      ],
      thick: 1.0,
    },
    // Lower-right drooping branch
    {
      points: [
        [topX + 2, topY + 3],
        [topX + 10, topY + 2 + rng() * 2],
        [topX + 16, topY + rng() * 3],
        [54 + rng() * 4, 19 + rng() * 4],
      ],
      thick: 0.95,
    },
  ];
}

/* ── magnolia bloom rendering ────────────────────────────────────── */

interface MagnoliaPos {
  x: number;
  y: number;
  size: number;
  angle: number;
}

function generateCanopyBlooms(rng: () => number, count: number): MagnoliaPos[] {
  const blooms: MagnoliaPos[] = [];
  const cx = 32;
  const cy = 16;

  for (let i = 0; i < count; i++) {
    const angle = rng() * Math.PI * 2;
    const yBias = rng();
    const maxDist = 18 - yBias * 4;
    const dist = rng() * maxDist;

    const bx = cx + Math.cos(angle) * dist * 0.95 + (rng() - 0.5) * 3;
    const by = cy - 4 + yBias * 18 + Math.sin(angle) * dist * 0.3;

    if (by < 3 || by > 34 || bx < 5 || bx > 59) continue;

    blooms.push({
      x: bx,
      y: by,
      size: 2.0 + rng() * 2.5,
      angle: rng() * Math.PI * 2,
    });
  }

  return blooms;
}

function renderMagnoliaBlossom(
  elements: WatercolorElement[],
  x: number,
  y: number,
  size: number,
  baseAngle: number,
  openness: number,
  colors: typeof DEFAULT_COLORS,
  rng: () => number,
  zBase: number
) {
  const petalCount = 6 + Math.floor(rng() * 3); // 6-8 petals
  const cupDepth = size * 0.6;

  // Cup-shaped base glow (the warm inner glow of magnolia)
  elements.push({
    shape: { type: "disc", radius: size * 1.2 * openness },
    position: { x, y },
    rotation: 0,
    scale: 1,
    color: colors.blossomGlow,
    opacity: 0.12 + openness * 0.1,
    zOffset: zBase,
  });

  // Outer petals — wide, cupped, slightly open
  for (let i = 0; i < petalCount; i++) {
    const pAngle = baseAngle + (i / petalCount) * Math.PI * 2;
    const pLen = (size * 1.1 + rng() * size * 0.3) * openness;
    const pWidth = size * 0.55 + rng() * size * 0.15;
    const px = x + Math.cos(pAngle) * cupDepth * 0.4 * openness;
    const py = y + Math.sin(pAngle) * cupDepth * 0.25 * openness;

    elements.push({
      shape: {
        type: "petal",
        width: pWidth * openness,
        length: pLen,
        roundness: 0.75,
      },
      position: { x: px, y: py },
      rotation: pAngle,
      scale: 1,
      color: rng() > 0.4 ? colors.blossomMid : colors.blossomLight,
      opacity: 0.35 + openness * 0.2 + rng() * 0.1,
      zOffset: zBase + 0.02 + rng() * 0.01,
    });
  }

  // Inner petals — slightly smaller, brighter, cupped inward
  const innerCount = 4 + Math.floor(rng() * 2);
  for (let i = 0; i < innerCount; i++) {
    const pAngle = baseAngle + ((i + 0.3) / innerCount) * Math.PI * 2;
    const pLen = (size * 0.7 + rng() * size * 0.2) * openness;
    const pWidth = size * 0.4 + rng() * size * 0.12;

    elements.push({
      shape: {
        type: "petal",
        width: pWidth * openness,
        length: pLen,
        roundness: 0.8,
      },
      position: { x, y },
      rotation: pAngle,
      scale: 1,
      color: rng() > 0.3 ? colors.blossomLight : colors.petalInner,
      opacity: 0.3 + openness * 0.2 + rng() * 0.1,
      zOffset: zBase + 0.04 + rng() * 0.01,
    });
  }

  // Warm golden center glow (4 layers)
  // Layer 1: wide warm spread
  elements.push({
    shape: { type: "disc", radius: size * 0.8 * openness },
    position: { x, y },
    rotation: 0,
    scale: 1,
    color: colors.backlight,
    opacity: 0.08 + openness * 0.06,
    zOffset: zBase + 0.06,
  });

  // Layer 2: golden core
  elements.push({
    shape: { type: "disc", radius: size * 0.45 * openness },
    position: { x, y },
    rotation: 0,
    scale: 1,
    color: colors.backlight,
    opacity: 0.12 + openness * 0.1,
    zOffset: zBase + 0.065,
  });

  // Layer 3: bright center
  elements.push({
    shape: { type: "dot", radius: size * 0.25 * openness },
    position: { x, y },
    rotation: 0,
    scale: 1,
    color: colors.center,
    opacity: 0.5 + openness * 0.3,
    zOffset: zBase + 0.07,
  });

  // Layer 4: hot white point
  elements.push({
    shape: { type: "dot", radius: size * 0.1 * openness },
    position: { x, y },
    rotation: 0,
    scale: 1,
    color: "#FFFEF8",
    opacity: 0.7 + openness * 0.25,
    zOffset: zBase + 0.075,
  });
}

/* ── foreground magnolia rendering ───────────────────────────────── */

function renderForegroundMagnolia(
  elements: WatercolorElement[],
  x: number,
  y: number,
  size: number,
  openness: number,
  colors: typeof DEFAULT_COLORS,
  rng: () => number,
  zBase: number
) {
  const petalCount = 7 + Math.floor(rng() * 3); // 7-9 large petals
  const baseAngle = rng() * Math.PI * 2;

  // Large ambient glow behind the flower
  elements.push({
    shape: { type: "disc", radius: size * 2.0 * openness },
    position: { x, y },
    rotation: 0,
    scale: 1,
    color: colors.aura,
    opacity: 0.05 + openness * 0.04,
    zOffset: zBase,
  });

  // Outer petals — large, thick, cupped
  for (let i = 0; i < petalCount; i++) {
    const pAngle = baseAngle + (i / petalCount) * Math.PI * 2;
    const pLen = (size * 1.3 + rng() * size * 0.4) * openness;
    const pWidth = size * 0.6 + rng() * size * 0.2;
    const px = x + Math.cos(pAngle) * size * 0.2 * openness;
    const py = y + Math.sin(pAngle) * size * 0.12 * openness;

    // Glow sublayer
    elements.push({
      shape: {
        type: "petal",
        width: (pWidth + 0.4) * openness,
        length: pLen + 0.3,
        roundness: 0.8,
      },
      position: { x: px, y: py },
      rotation: pAngle,
      scale: 1,
      color: colors.blossomGlow,
      opacity: 0.08 + rng() * 0.04,
      zOffset: zBase + 0.01,
    });

    // Main petal
    elements.push({
      shape: {
        type: "petal",
        width: pWidth * openness,
        length: pLen,
        roundness: 0.75,
      },
      position: { x: px, y: py },
      rotation: pAngle,
      scale: 1,
      color: rng() > 0.3 ? colors.blossomMid : colors.blossomLight,
      opacity: 0.4 + openness * 0.25 + rng() * 0.1,
      zOffset: zBase + 0.02 + rng() * 0.01,
    });
  }

  // Inner petals
  const innerCount = 5 + Math.floor(rng() * 2);
  for (let i = 0; i < innerCount; i++) {
    const pAngle = baseAngle + ((i + 0.5) / innerCount) * Math.PI * 2;
    const pLen = (size * 0.8 + rng() * size * 0.25) * openness;
    const pWidth = size * 0.45 + rng() * size * 0.1;

    elements.push({
      shape: {
        type: "petal",
        width: pWidth * openness,
        length: pLen,
        roundness: 0.8,
      },
      position: { x, y },
      rotation: pAngle,
      scale: 1,
      color: colors.blossomLight,
      opacity: 0.35 + openness * 0.2 + rng() * 0.1,
      zOffset: zBase + 0.04,
    });
  }

  // Warm golden center — 3 layers
  elements.push({
    shape: { type: "disc", radius: size * 0.6 * openness },
    position: { x, y },
    rotation: 0,
    scale: 1,
    color: colors.backlight,
    opacity: 0.1 + openness * 0.08,
    zOffset: zBase + 0.06,
  });

  elements.push({
    shape: { type: "dot", radius: size * 0.3 * openness },
    position: { x, y },
    rotation: 0,
    scale: 1,
    color: colors.center,
    opacity: 0.5 + openness * 0.3,
    zOffset: zBase + 0.065,
  });

  elements.push({
    shape: { type: "dot", radius: size * 0.12 * openness },
    position: { x, y },
    rotation: 0,
    scale: 1,
    color: "#FFFEF8",
    opacity: 0.7 + openness * 0.25,
    zOffset: zBase + 0.07,
  });
}

/* ── main builder ────────────────────────────────────────────────── */

function buildWcRadiantMagnoliaElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const bloomCount = traitOr(ctx.traits, "bloomCount", 18);
  const sparkleCount = traitOr(ctx.traits, "sparkleCount", 50);
  const branchiness = traitOr(ctx.traits, "branchiness", 7);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const bloomOpenness = Math.max(0, (openness - 0.1) / 0.9);
  const leafOpenness = Math.max(0, (openness - 0.03) / 0.97);
  const trunkOpenness = Math.max(0, (openness - 0.01) / 0.99);

  const colors =
    ctx.colorVariationName && COLORS[ctx.colorVariationName]
      ? COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  // === GOLDEN BACKLIGHT (the key glow feature) ===
  if (openness > 0.08) {
    // Huge warm backlight from behind/within the tree
    elements.push({
      shape: { type: "disc", radius: 28 + bloomOpenness * 10 },
      position: { x: 32, y: 24 },
      rotation: 0,
      scale: 1,
      color: colors.backlight,
      opacity: 0.04 + bloomOpenness * 0.06,
      zOffset: 0.01,
    });

    // Secondary warm glow — canopy region
    elements.push({
      shape: { type: "disc", radius: 22 + bloomOpenness * 6 },
      position: { x: 32, y: 18 },
      rotation: 0,
      scale: 1,
      color: colors.backlight,
      opacity: 0.05 + bloomOpenness * 0.06,
      zOffset: 0.015,
    });

    // Canopy aura (blossom-tinted)
    elements.push({
      shape: { type: "disc", radius: 24 + bloomOpenness * 7 },
      position: { x: 32, y: 16 },
      rotation: 0,
      scale: 1,
      color: colors.aura,
      opacity: 0.04 + bloomOpenness * 0.04,
      zOffset: 0.02,
    });
  }

  // === GROUND MIST ===
  if (openness > 0.08) {
    elements.push({
      shape: { type: "disc", radius: 28 + openness * 8 },
      position: { x: 32, y: 58 },
      rotation: 0,
      scale: 1,
      color: colors.mist,
      opacity: 0.04 + openness * 0.03,
      zOffset: 0.03,
    });

    // Warm light spill on ground
    elements.push({
      shape: { type: "disc", radius: 16 + openness * 6 },
      position: { x: 32, y: 52 },
      rotation: 0,
      scale: 1,
      color: colors.backlight,
      opacity: 0.03 + openness * 0.03,
      zOffset: 0.035,
    });
  }

  // === FALLEN PETALS ===
  if (leafOpenness > 0) {
    const fallenCount = 8 + Math.floor(rng() * 8);
    for (let i = 0; i < fallenCount; i++) {
      const px = 32 + (rng() - 0.5) * 46;
      const py = 54 + rng() * 7;

      elements.push({
        shape: {
          type: "petal",
          width: 0.6 + rng() * 0.5,
          length: 1.0 + rng() * 0.8,
          roundness: 0.8,
        },
        position: { x: px, y: py },
        rotation: rng() * Math.PI * 2,
        scale: leafOpenness * 0.7,
        color: rng() > 0.5 ? colors.blossomLight : colors.blossomMid,
        opacity: 0.2 + rng() * 0.15,
        zOffset: 0.04,
      });
    }

    // Grass at base
    const grassCount = 8 + Math.floor(rng() * 4);
    for (let i = 0; i < grassCount; i++) {
      const gx = 32 + (rng() - 0.5) * 38;
      const gy = 57 + rng() * 3;
      const angle = -Math.PI / 2 + (rng() - 0.5) * 0.7;
      const bladeLen = (2 + rng() * 3) * Math.min(leafOpenness * 1.5, 1);

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
  }

  // === FOREGROUND MAGNOLIA FLOWERS (large, framing the base) ===
  if (bloomOpenness > 0.05) {
    const fgOpenness = Math.min(1, bloomOpenness * 1.2);

    // Left foreground flower
    renderForegroundMagnolia(
      elements,
      10 + rng() * 4,
      56 + rng() * 3,
      4.0 + rng() * 1.0,
      fgOpenness,
      colors,
      rng,
      0.05
    );

    // Right foreground flower
    renderForegroundMagnolia(
      elements,
      50 + rng() * 4,
      55 + rng() * 3,
      3.8 + rng() * 1.2,
      fgOpenness,
      colors,
      rng,
      0.055
    );

    // Center-left foreground flower
    renderForegroundMagnolia(
      elements,
      20 + rng() * 4,
      57 + rng() * 2,
      3.5 + rng() * 0.8,
      fgOpenness,
      colors,
      rng,
      0.06
    );

    // Center-right foreground flower (slightly hidden)
    if (rng() > 0.3) {
      renderForegroundMagnolia(
        elements,
        42 + rng() * 4,
        57 + rng() * 2,
        3.0 + rng() * 0.8,
        fgOpenness * 0.8,
        colors,
        rng,
        0.058
      );
    }
  }

  // === EXPOSED ROOTS ===
  if (trunkOpenness > 0) {
    const roots = generateRoots(rng);
    for (let i = 0; i < roots.length; i++) {
      const root = roots[i]!;
      const rootProgress = Math.max(0, (trunkOpenness - 0.1) / 0.9);
      if (rootProgress <= 0) continue;

      elements.push({
        shape: {
          type: "stem",
          points: root.points,
          thickness: root.thick * (0.4 + rootProgress * 0.6),
        },
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        color: colors.barkDark,
        opacity: 0.4 + rootProgress * 0.15,
        zOffset: 0.07 + i * 0.002,
      });
    }
  }

  // === TRUNK ===
  if (trunkOpenness > 0) {
    const trunk = generateTrunk(rng);
    for (let i = 0; i < trunk.length; i++) {
      const seg = trunk[i]!;
      const progress = i < 3 ? trunkOpenness : Math.max(0, (trunkOpenness - 0.15) / 0.85);
      if (progress <= 0) continue;

      elements.push({
        shape: {
          type: "stem",
          points: seg.points,
          thickness: seg.thick * (0.3 + progress * 0.7),
        },
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        color: i < 3 ? colors.bark : colors.barkHighlight,
        opacity: (i < 3 ? 0.6 : 0.35) + progress * 0.15,
        zOffset: 0.08 + i * 0.004,
      });
    }
  }

  // === BRANCHES ===
  if (trunkOpenness > 0.1) {
    const branches = generateBranches(rng);
    const activeBranches = Math.min(branches.length, Math.max(4, Math.round(branchiness)));
    const branchProgress = Math.max(0, (trunkOpenness - 0.15) / 0.85);

    for (let i = 0; i < activeBranches; i++) {
      const branch = branches[i]!;
      if (branchProgress <= 0) continue;

      elements.push({
        shape: {
          type: "stem",
          points: branch.points,
          thickness: branch.thick * (0.3 + branchProgress * 0.7),
        },
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        color: colors.barkHighlight,
        opacity: 0.4 + branchProgress * 0.15,
        zOffset: 0.1 + i * 0.005,
      });
    }
  }

  // === BLOSSOM CANOPY (large dome of magnolia blossoms) ===
  if (bloomOpenness > 0) {
    // Background canopy mass — soft dome
    const bgClusters = [
      { x: 32, y: 14, r: 20 },
      { x: 22, y: 18, r: 14 },
      { x: 42, y: 17, r: 14 },
      { x: 18, y: 22, r: 10 },
      { x: 46, y: 21, r: 10 },
      { x: 32, y: 8, r: 13 },
    ];

    for (const c of bgClusters) {
      elements.push({
        shape: { type: "disc", radius: c.r * bloomOpenness },
        position: { x: c.x, y: c.y },
        rotation: 0,
        scale: 1,
        color: colors.blossomDeep,
        opacity: 0.1 + bloomOpenness * 0.08,
        zOffset: 0.5 + rng() * 0.05,
      });

      // Lighter inner
      elements.push({
        shape: { type: "disc", radius: c.r * 0.65 * bloomOpenness },
        position: { x: c.x + (rng() - 0.5) * 2, y: c.y + (rng() - 0.5) * 2 },
        rotation: 0,
        scale: 1,
        color: colors.blossomMid,
        opacity: 0.08 + bloomOpenness * 0.06,
        zOffset: 0.55 + rng() * 0.05,
      });
    }

    // Individual magnolia blossoms in canopy
    const activeBloomCount = Math.max(10, Math.round(bloomCount));
    const canopyBlooms = generateCanopyBlooms(rng, activeBloomCount);

    for (const bloom of canopyBlooms) {
      renderMagnoliaBlossom(
        elements,
        bloom.x,
        bloom.y,
        bloom.size * bloomOpenness,
        bloom.angle,
        bloomOpenness,
        colors,
        rng,
        0.6 + rng() * 0.15
      );
    }

    // Bright glow highlights — light shining through canopy
    const highlightCount = 10 + Math.floor(rng() * 6);
    for (let i = 0; i < highlightCount; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * 16;
      const hx = 32 + Math.cos(angle) * dist * 0.85;
      const hy = 16 + Math.sin(angle) * dist * 0.55;

      if (hy > 3 && hy < 32) {
        elements.push({
          shape: { type: "disc", radius: (1.5 + rng() * 3) * bloomOpenness },
          position: { x: hx, y: hy },
          rotation: 0,
          scale: 1,
          color: colors.blossomGlow,
          opacity: 0.12 + bloomOpenness * 0.12 + rng() * 0.06,
          zOffset: 0.8 + rng() * 0.1,
        });
      }
    }

    // Inner canopy golden glow (backlight showing through)
    elements.push({
      shape: { type: "disc", radius: 10 + bloomOpenness * 4 },
      position: { x: 32, y: 22 },
      rotation: 0,
      scale: 1,
      color: colors.backlight,
      opacity: 0.06 + bloomOpenness * 0.06,
      zOffset: 0.85,
    });

    elements.push({
      shape: { type: "disc", radius: 6 + bloomOpenness * 3 },
      position: { x: 32, y: 24 },
      rotation: 0,
      scale: 1,
      color: colors.backlight,
      opacity: 0.08 + bloomOpenness * 0.08,
      zOffset: 0.86,
    });
  }

  // === SPARKLE PARTICLES ===
  if (bloomOpenness > 0.1) {
    const sparkleOpenness = Math.min(1, (bloomOpenness - 0.1) / 0.6);
    const activeSparkles = Math.round(sparkleCount * sparkleOpenness);

    for (let i = 0; i < activeSparkles; i++) {
      const angle = rng() * Math.PI * 2;
      const yBias = rng();
      const maxDist = 20 - yBias * 3;
      const dist = rng() * maxDist;

      const sx = 32 + Math.cos(angle) * dist * 0.9 + (rng() - 0.5) * 4;
      const sy = 6 + yBias * 28 + Math.sin(angle) * dist * 0.3;

      if (sy < 2 || sy > 38 || sx < 4 || sx > 60) continue;

      const roll = rng();
      const isLarge = roll < 0.1;
      const isMedium = roll < 0.3;

      const sparkleRadius = isLarge
        ? 0.7 + rng() * 0.5
        : isMedium
          ? 0.35 + rng() * 0.3
          : 0.12 + rng() * 0.18;

      // Sparkle dot
      elements.push({
        shape: { type: "dot", radius: sparkleRadius },
        position: { x: sx, y: sy },
        rotation: 0,
        scale: 1,
        color: isLarge ? colors.center : isMedium ? colors.blossomGlow : colors.sparkle,
        opacity: (isLarge ? 0.8 : isMedium ? 0.5 : 0.3) + rng() * 0.15,
        zOffset: 2.0 + rng() * 0.5,
      });

      // Glow halo
      if (isLarge || isMedium) {
        elements.push({
          shape: { type: "disc", radius: sparkleRadius * (isLarge ? 5 : 3) },
          position: { x: sx, y: sy },
          rotation: 0,
          scale: 1,
          color: colors.backlight,
          opacity: (isLarge ? 0.07 : 0.035) + rng() * 0.02,
          zOffset: 1.9,
        });
      }
    }

    // Drifting particles outside canopy
    const driftCount = 8 + Math.floor(rng() * 5);
    for (let i = 0; i < driftCount; i++) {
      const dx = 32 + (rng() - 0.5) * 54;
      const dy = rng() * 56 + 3;

      elements.push({
        shape: { type: "dot", radius: 0.15 + rng() * 0.25 },
        position: { x: dx, y: dy },
        rotation: 0,
        scale: 1,
        color: rng() > 0.5 ? colors.sparkle : colors.backlight,
        opacity: 0.2 + rng() * 0.2,
        zOffset: 2.5,
      });
    }
  }

  return elements;
}

/* ── variant definition ──────────────────────────────────────────── */

export const wcRadiantMagnolia: PlantVariant = {
  id: "wc-radiant-magnolia",
  name: "Radiant Magnolia",
  description:
    "A majestic magnolia tree with a massive gnarled trunk, its wide canopy bursting with large cup-shaped blossoms that glow with warm golden light from within",
  rarity: 0.06,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      bloomCount: { signal: "entropy", range: [12, 24], default: 18, round: true },
      sparkleCount: { signal: "growth", range: [35, 65], default: 50, round: true },
      branchiness: { signal: "spread", range: [5, 7], default: 7, round: true },
    },
  },
  colorVariations: [
    {
      name: "roseglow",
      weight: 1.0,
      palettes: { bloom: ["#C06898", "#E090B8", "#3D2B28"] },
    },
    {
      name: "sunburst",
      weight: 0.8,
      palettes: { bloom: ["#C8A030", "#E0C050", "#3D3020"] },
    },
    {
      name: "amethyst",
      weight: 0.8,
      palettes: { bloom: ["#8040B0", "#A068D0", "#302038"] },
    },
    {
      name: "white",
      weight: 0.8,
      palettes: { bloom: ["#B8B0A8", "#D0CCC8", "#3A3230"] },
    },
  ],
  clusteringBehavior: {
    mode: "spread",
    clusterRadius: 500,
    clusterBonus: 1.2,
    maxClusterDensity: 3,
    reseedClusterChance: 0.3,
  },
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 18 },
      { name: "sprout", duration: 22 },
      { name: "bloom", duration: 55 },
      { name: "fade", duration: 22 },
    ],
    wcEffect: { layers: 5, opacity: 0.5, spread: 0.1, colorVariation: 0.07 },
    buildElements: buildWcRadiantMagnoliaElements,
  },
};
