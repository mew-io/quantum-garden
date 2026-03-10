/**
 * Celestial Sakura
 *
 * A majestic cherry blossom tree radiating ethereal light from every
 * branch. The thick, gnarled trunk splits into sweeping limbs that
 * support a vast dome-shaped canopy of luminous pink blossoms.
 * Hundreds of glowing points shimmer throughout the crown like
 * captured starlight, while pink mist pools at the base among
 * fallen petals and small wildflowers.
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
    blossomDeep: string;
    blossomMid: string;
    blossomLight: string;
    blossomGlow: string;
    center: string;
    sparkle: string;
    aura: string;
    mist: string;
    leaf: string;
    ground: string;
  }
> = {
  roseglow: {
    bark: "#4A3040",
    barkHighlight: "#6A4858",
    blossomDeep: "#C060A0",
    blossomMid: "#E888C0",
    blossomLight: "#F8B0D8",
    blossomGlow: "#FFD8F0",
    center: "#FFF0F8",
    sparkle: "#FFB8E0",
    aura: "#B048A0",
    mist: "#D070B0",
    leaf: "#3A4830",
    ground: "#4A5838",
  },
  sapphire: {
    bark: "#303848",
    barkHighlight: "#485868",
    blossomDeep: "#4070C0",
    blossomMid: "#6898E0",
    blossomLight: "#98C0F8",
    blossomGlow: "#C8E0FF",
    center: "#E8F0FF",
    sparkle: "#88B8F8",
    aura: "#3058B0",
    mist: "#5078D0",
    leaf: "#384840",
    ground: "#405048",
  },
  sunburst: {
    bark: "#483828",
    barkHighlight: "#685838",
    blossomDeep: "#C09020",
    blossomMid: "#E0B840",
    blossomLight: "#F0D870",
    blossomGlow: "#FFF0A0",
    center: "#FFFCE8",
    sparkle: "#F0D060",
    aura: "#A87810",
    mist: "#C09828",
    leaf: "#4A5830",
    ground: "#585838",
  },
  amethyst: {
    bark: "#382848",
    barkHighlight: "#584068",
    blossomDeep: "#7838B8",
    blossomMid: "#9860D8",
    blossomLight: "#B890F0",
    blossomGlow: "#D8C0FF",
    center: "#F0E8FF",
    sparkle: "#B888F8",
    aura: "#6028A8",
    mist: "#8048C0",
    leaf: "#383848",
    ground: "#484858",
  },
};

const DEFAULT_COLORS = COLORS.roseglow!;

/* ── branch layout data ──────────────────────────────────────────── */

interface BranchDef {
  /** control points for stem spline [x,y] pairs */
  points: [number, number][];
  /** thickness multiplier */
  thick: number;
}

function generateBranches(rng: () => number): BranchDef[] {
  const trunkTopY = 28 + rng() * 3;
  const trunkTopX = 32 + (rng() - 0.5) * 2;

  return [
    // Main trunk
    {
      points: [
        [32 + (rng() - 0.5) * 1, 58],
        [32 + (rng() - 0.5) * 2, 46],
        [trunkTopX + (rng() - 0.5) * 1.5, 36],
        [trunkTopX, trunkTopY],
      ],
      thick: 2.8,
    },
    // Left trunk edge (thickening)
    {
      points: [
        [30.5 + (rng() - 0.5) * 0.5, 58],
        [31 + (rng() - 0.5) * 1, 44],
        [trunkTopX - 1.5, 35],
        [trunkTopX - 2, trunkTopY + 1],
      ],
      thick: 1.2,
    },
    // Right trunk edge
    {
      points: [
        [33.5 + (rng() - 0.5) * 0.5, 58],
        [33 + (rng() - 0.5) * 1, 45],
        [trunkTopX + 1.5, 36],
        [trunkTopX + 2, trunkTopY + 1],
      ],
      thick: 1.0,
    },
    // Major left branch
    {
      points: [
        [trunkTopX - 1, trunkTopY + 3],
        [trunkTopX - 6, trunkTopY - 2 + rng() * 2],
        [trunkTopX - 12, trunkTopY - 5 + rng() * 2],
        [14 + rng() * 4, 16 + rng() * 4],
      ],
      thick: 1.4,
    },
    // Major right branch
    {
      points: [
        [trunkTopX + 1, trunkTopY + 2],
        [trunkTopX + 6, trunkTopY - 3 + rng() * 2],
        [trunkTopX + 12, trunkTopY - 6 + rng() * 2],
        [48 + rng() * 4, 14 + rng() * 4],
      ],
      thick: 1.3,
    },
    // Upper-left branch
    {
      points: [
        [trunkTopX - 0.5, trunkTopY + 1],
        [trunkTopX - 4, trunkTopY - 5],
        [trunkTopX - 8, trunkTopY - 10 + rng() * 2],
        [20 + rng() * 4, 8 + rng() * 4],
      ],
      thick: 0.9,
    },
    // Upper-right branch
    {
      points: [
        [trunkTopX + 0.5, trunkTopY],
        [trunkTopX + 5, trunkTopY - 6],
        [trunkTopX + 9, trunkTopY - 10 + rng() * 2],
        [42 + rng() * 4, 7 + rng() * 4],
      ],
      thick: 0.85,
    },
    // Center upward branch
    {
      points: [
        [trunkTopX, trunkTopY],
        [trunkTopX + (rng() - 0.5) * 2, trunkTopY - 6],
        [trunkTopX + (rng() - 0.5) * 3, trunkTopY - 12],
        [32 + (rng() - 0.5) * 4, 6 + rng() * 3],
      ],
      thick: 0.8,
    },
  ];
}

/* ── canopy cluster positions ────────────────────────────────────── */

interface CanopyCluster {
  x: number;
  y: number;
  radius: number;
}

function generateCanopyClusters(rng: () => number, count: number): CanopyCluster[] {
  const clusters: CanopyCluster[] = [];
  const canopyCenterX = 32;
  const canopyCenterY = 18;

  // Large background clusters forming the dome shape
  const bgClusters = [
    { x: 32, y: 16, radius: 18 },
    { x: 24, y: 18, radius: 14 },
    { x: 40, y: 17, radius: 14 },
    { x: 20, y: 22, radius: 10 },
    { x: 44, y: 21, radius: 10 },
    { x: 32, y: 10, radius: 12 },
  ];
  clusters.push(...bgClusters);

  // Smaller detail clusters scattered throughout
  for (let i = 0; i < count; i++) {
    const angle = rng() * Math.PI * 2;
    // Dome-shaped distribution: wider at bottom, narrower at top
    const yBias = rng(); // 0=top, 1=bottom of canopy
    const maxRadiusAtY = 20 - yBias * 4; // wider at top
    const dist = rng() * maxRadiusAtY * 0.8;

    const cx = canopyCenterX + Math.cos(angle) * dist + (rng() - 0.5) * 4;
    const cy = canopyCenterY - 6 + yBias * 18 + (rng() - 0.5) * 3;

    // Clamp to dome shape
    const clampedCy = Math.max(4, Math.min(32, cy));
    const radius = 3 + rng() * 5;

    clusters.push({ x: cx, y: clampedCy, radius });
  }

  return clusters;
}

/* ── main builder ────────────────────────────────────────────────── */

function buildWcCelestialSakuraElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const blossomDensity = traitOr(ctx.traits, "blossomDensity", 16);
  const sparkleCount = traitOr(ctx.traits, "sparkleCount", 50);
  const branchiness = traitOr(ctx.traits, "branchiness", 8);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const bloomOpenness = Math.max(0, (openness - 0.1) / 0.9);
  const leafOpenness = Math.max(0, (openness - 0.03) / 0.97);
  const trunkOpenness = Math.max(0, (openness - 0.01) / 0.99);

  const colors =
    ctx.colorVariationName && COLORS[ctx.colorVariationName]
      ? COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const branches = generateBranches(rng);

  // === ATMOSPHERIC GLOW behind entire tree ===
  if (openness > 0.1) {
    // Huge ambient glow
    elements.push({
      shape: { type: "disc", radius: 30 + bloomOpenness * 8 },
      position: { x: 32, y: 20 },
      rotation: 0,
      scale: 1,
      color: colors.aura,
      opacity: 0.04 + bloomOpenness * 0.04,
      zOffset: 0.01,
    });

    // Canopy-shaped glow
    elements.push({
      shape: { type: "disc", radius: 22 + bloomOpenness * 6 },
      position: { x: 32, y: 16 },
      rotation: 0,
      scale: 1,
      color: colors.mist,
      opacity: 0.05 + bloomOpenness * 0.05,
      zOffset: 0.02,
    });
  }

  // === MIST AT BASE ===
  if (openness > 0.08) {
    // Ground-level pink mist
    elements.push({
      shape: { type: "disc", radius: 26 + openness * 10 },
      position: { x: 32, y: 58 },
      rotation: 0,
      scale: 1,
      color: colors.mist,
      opacity: 0.04 + openness * 0.03,
      zOffset: 0.03,
    });

    elements.push({
      shape: { type: "disc", radius: 18 + openness * 6 },
      position: { x: 32, y: 56 },
      rotation: 0,
      scale: 1,
      color: colors.aura,
      opacity: 0.03 + openness * 0.03,
      zOffset: 0.035,
    });
  }

  // === GROUND FOLIAGE ===
  if (leafOpenness > 0) {
    // Small wildflowers at base
    const groundFlowerCount = 6 + Math.floor(rng() * 5);
    for (let i = 0; i < groundFlowerCount; i++) {
      const fx = 32 + (rng() - 0.5) * 40;
      const fy = 56 + rng() * 4;
      const fRadius = 0.4 + rng() * 0.5;

      elements.push({
        shape: { type: "dot", radius: fRadius },
        position: { x: fx, y: fy },
        rotation: 0,
        scale: leafOpenness,
        color: colors.blossomMid,
        opacity: 0.35 + rng() * 0.2,
        zOffset: 0.04,
      });

      // Tiny glow
      elements.push({
        shape: { type: "disc", radius: fRadius * 2.5 },
        position: { x: fx, y: fy },
        rotation: 0,
        scale: leafOpenness,
        color: colors.aura,
        opacity: 0.04 + rng() * 0.03,
        zOffset: 0.038,
      });
    }

    // Grass at base
    const grassCount = 8 + Math.floor(rng() * 4);
    for (let i = 0; i < grassCount; i++) {
      const gx = 32 + (rng() - 0.5) * 36;
      const gy = 57 + rng() * 3;
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

    // Fallen petals on the ground
    const fallenCount = 6 + Math.floor(rng() * 6);
    for (let i = 0; i < fallenCount; i++) {
      const px = 32 + (rng() - 0.5) * 44;
      const py = 55 + rng() * 6;

      elements.push({
        shape: {
          type: "petal",
          width: 0.5 + rng() * 0.4,
          length: 0.8 + rng() * 0.6,
          roundness: 0.8,
        },
        position: { x: px, y: py },
        rotation: rng() * Math.PI * 2,
        scale: leafOpenness * 0.7,
        color: rng() > 0.5 ? colors.blossomLight : colors.blossomMid,
        opacity: 0.25 + rng() * 0.15,
        zOffset: 0.045,
      });
    }
  }

  // === TRUNK AND BRANCHES ===
  if (trunkOpenness > 0) {
    const activeBranches = Math.min(branches.length, Math.max(3, Math.round(branchiness)));

    for (let i = 0; i < activeBranches; i++) {
      const branch = branches[i]!;
      const branchProgress = i < 3 ? trunkOpenness : Math.max(0, (trunkOpenness - 0.2) / 0.8);

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
        color: i < 3 ? colors.bark : colors.barkHighlight,
        opacity: (i < 3 ? 0.6 : 0.45) + branchProgress * 0.15,
        zOffset: 0.08 + i * 0.005,
      });
    }
  }

  // === BLOSSOM CANOPY ===
  if (bloomOpenness > 0) {
    const clusterCount = Math.max(8, Math.round(blossomDensity));
    const clusters = generateCanopyClusters(rng, clusterCount);

    // Background blossom mass (large, soft, dome-shaped)
    for (let i = 0; i < Math.min(6, clusters.length); i++) {
      const c = clusters[i]!;
      elements.push({
        shape: { type: "disc", radius: c.radius * bloomOpenness },
        position: { x: c.x, y: c.y },
        rotation: 0,
        scale: 1,
        color: colors.blossomDeep,
        opacity: 0.12 + bloomOpenness * 0.1,
        zOffset: 0.5 + rng() * 0.05,
      });

      // Inner glow layer
      elements.push({
        shape: { type: "disc", radius: c.radius * 0.7 * bloomOpenness },
        position: { x: c.x + (rng() - 0.5) * 2, y: c.y + (rng() - 0.5) * 2 },
        rotation: 0,
        scale: 1,
        color: colors.blossomMid,
        opacity: 0.1 + bloomOpenness * 0.08,
        zOffset: 0.55 + rng() * 0.05,
      });
    }

    // Detail blossom clusters (smaller, varied)
    for (let i = 6; i < clusters.length; i++) {
      const c = clusters[i]!;
      elements.push({
        shape: { type: "disc", radius: c.radius * bloomOpenness },
        position: { x: c.x, y: c.y },
        rotation: 0,
        scale: 1,
        color: rng() > 0.5 ? colors.blossomMid : colors.blossomDeep,
        opacity: 0.1 + bloomOpenness * 0.1 + rng() * 0.05,
        zOffset: 0.6 + rng() * 0.1,
      });
    }

    // Blossom petal details at canopy edges
    const edgePetalCount = 12 + Math.floor(rng() * 8);
    for (let i = 0; i < edgePetalCount; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = 14 + rng() * 10;
      const px = 32 + Math.cos(angle) * dist * 0.9;
      const py = 16 + Math.sin(angle) * dist * 0.6;

      // Only render if within dome bounds
      if (py > 2 && py < 34 && px > 6 && px < 58) {
        elements.push({
          shape: {
            type: "petal",
            width: (1.2 + rng() * 1.5) * bloomOpenness,
            length: (2 + rng() * 2.5) * bloomOpenness,
            roundness: 0.7,
          },
          position: { x: px, y: py },
          rotation: angle + (rng() - 0.5) * 0.5,
          scale: 1,
          color: rng() > 0.4 ? colors.blossomLight : colors.blossomMid,
          opacity: 0.2 + bloomOpenness * 0.15 + rng() * 0.1,
          zOffset: 0.7 + rng() * 0.1,
        });
      }
    }

    // Bright blossom highlights on top of canopy
    const highlightCount = 8 + Math.floor(rng() * 5);
    for (let i = 0; i < highlightCount; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * 16;
      const hx = 32 + Math.cos(angle) * dist * 0.85;
      const hy = 16 + Math.sin(angle) * dist * 0.55;

      if (hy > 4 && hy < 30) {
        elements.push({
          shape: { type: "disc", radius: (1.5 + rng() * 2.5) * bloomOpenness },
          position: { x: hx, y: hy },
          rotation: 0,
          scale: 1,
          color: colors.blossomGlow,
          opacity: 0.15 + bloomOpenness * 0.15 + rng() * 0.08,
          zOffset: 0.8 + rng() * 0.1,
        });
      }
    }
  }

  // === SPARKLE POINTS (the key glow feature) ===
  if (bloomOpenness > 0.1) {
    const sparkleOpenness = Math.min(1, (bloomOpenness - 0.1) / 0.6);
    const activeSparkles = Math.round(sparkleCount * sparkleOpenness);

    for (let i = 0; i < activeSparkles; i++) {
      const angle = rng() * Math.PI * 2;
      // Distribute within dome-shaped canopy
      const yBias = rng();
      const maxDist = 18 - yBias * 3;
      const dist = rng() * maxDist;

      const sx = 32 + Math.cos(angle) * dist * 0.9 + (rng() - 0.5) * 4;
      const sy = 6 + yBias * 26 + Math.sin(angle) * dist * 0.3;

      // Clamp to canopy area
      if (sy < 2 || sy > 36 || sx < 6 || sx > 58) continue;

      const roll = rng();
      const isLarge = roll < 0.1;
      const isMedium = roll < 0.3;

      const sparkleRadius = isLarge
        ? 0.8 + rng() * 0.5
        : isMedium
          ? 0.4 + rng() * 0.3
          : 0.15 + rng() * 0.2;

      // Sparkle dot
      elements.push({
        shape: { type: "dot", radius: sparkleRadius },
        position: { x: sx, y: sy },
        rotation: 0,
        scale: 1,
        color: isLarge ? colors.center : isMedium ? colors.blossomGlow : colors.sparkle,
        opacity: (isLarge ? 0.8 : isMedium ? 0.55 : 0.35) + rng() * 0.15,
        zOffset: 2.0 + rng() * 0.5,
      });

      // Glow halo around brighter sparkles
      if (isLarge || isMedium) {
        elements.push({
          shape: { type: "disc", radius: sparkleRadius * (isLarge ? 5.0 : 3.0) },
          position: { x: sx, y: sy },
          rotation: 0,
          scale: 1,
          color: colors.aura,
          opacity: (isLarge ? 0.08 : 0.04) + rng() * 0.03,
          zOffset: 1.9,
        });
      }
    }

    // Extra sparkles drifting outside the canopy (floating particles)
    const driftCount = 6 + Math.floor(rng() * 5);
    for (let i = 0; i < driftCount; i++) {
      const dx = 32 + (rng() - 0.5) * 50;
      const dy = rng() * 55 + 3;

      elements.push({
        shape: { type: "dot", radius: 0.2 + rng() * 0.25 },
        position: { x: dx, y: dy },
        rotation: 0,
        scale: 1,
        color: colors.sparkle,
        opacity: 0.25 + rng() * 0.2,
        zOffset: 2.5,
      });
    }
  }

  return elements;
}

/* ── variant definition ──────────────────────────────────────────── */

export const wcCelestialSakura: PlantVariant = {
  id: "wc-celestial-sakura",
  name: "Celestial Sakura",
  description:
    "A majestic cherry blossom tree glowing with captured starlight, its vast dome canopy shimmering with hundreds of luminous points above pink mist and fallen petals",
  rarity: 0.06,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      blossomDensity: { signal: "entropy", range: [10, 22], default: 16, round: true },
      sparkleCount: { signal: "growth", range: [35, 65], default: 50, round: true },
      branchiness: { signal: "spread", range: [5, 8], default: 8, round: true },
    },
  },
  colorVariations: [
    {
      name: "roseglow",
      weight: 1.0,
      palettes: { bloom: ["#C060A0", "#E888C0", "#4A3040"] },
    },
    {
      name: "sapphire",
      weight: 0.8,
      palettes: { bloom: ["#4070C0", "#6898E0", "#303848"] },
    },
    {
      name: "sunburst",
      weight: 0.8,
      palettes: { bloom: ["#C09020", "#E0B840", "#483828"] },
    },
    {
      name: "amethyst",
      weight: 0.8,
      palettes: { bloom: ["#7838B8", "#9860D8", "#382848"] },
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
    buildElements: buildWcCelestialSakuraElements,
  },
};
