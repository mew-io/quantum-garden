/**
 * Ethereal Wisteria
 *
 * Long, luminous wisteria cascades hang from dark branches overhead,
 * each a tapering column of densely packed glowing blossoms — largest
 * and brightest at the top, trailing to tiny delicate buds at the
 * tips. The cascades sway gently apart, creating a curtain of light.
 * Dark green compound leaves cluster along the top branches while
 * purple mist pools below and sparkle particles drift throughout.
 *
 * Category: watercolor (flowers / ethereal)
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
    blossomDeep: string;
    blossomMid: string;
    blossomLight: string;
    blossomGlow: string;
    center: string;
    sparkle: string;
    aura: string;
    mist: string;
    branch: string;
    leaf: string;
    leafDark: string;
  }
> = {
  roseglow: {
    blossomDeep: "#C060A8",
    blossomMid: "#E080C0",
    blossomLight: "#F8A8D8",
    blossomGlow: "#FFD0F0",
    center: "#FFF0F8",
    sparkle: "#F8A0D0",
    aura: "#A848A0",
    mist: "#D068B8",
    branch: "#3A3028",
    leaf: "#3A5030",
    leafDark: "#2A3820",
  },
  sapphire: {
    blossomDeep: "#4068C0",
    blossomMid: "#6090E0",
    blossomLight: "#90B8F8",
    blossomGlow: "#C0D8FF",
    center: "#E8F0FF",
    sparkle: "#78A8F0",
    aura: "#3050B0",
    mist: "#5070D0",
    branch: "#303838",
    leaf: "#305038",
    leafDark: "#203828",
  },
  sunburst: {
    blossomDeep: "#C09820",
    blossomMid: "#E0B840",
    blossomLight: "#F0D870",
    blossomGlow: "#FFF0A0",
    center: "#FFFCE8",
    sparkle: "#E8C848",
    aura: "#A88010",
    mist: "#C89828",
    branch: "#383020",
    leaf: "#485830",
    leafDark: "#384020",
  },
  amethyst: {
    blossomDeep: "#7840B8",
    blossomMid: "#9868D8",
    blossomLight: "#B890F0",
    blossomGlow: "#D8B8FF",
    center: "#F0E8FF",
    sparkle: "#A878E8",
    aura: "#6030A8",
    mist: "#8050C8",
    branch: "#302838",
    leaf: "#384838",
    leafDark: "#283028",
  },
};

const DEFAULT_COLORS = COLORS.roseglow!;

/* ── cascade layout ──────────────────────────────────────────────── */

interface CascadeDef {
  /** x position of the cascade top attachment point */
  topX: number;
  /** y position of the attachment (on the branch) */
  topY: number;
  /** length of the cascade in canvas units */
  length: number;
  /** slight x drift at the bottom (sway) */
  sway: number;
}

const CASCADE_LAYOUTS: Record<number, CascadeDef[]> = {
  5: [
    { topX: 12, topY: 8, length: 34, sway: -3 },
    { topX: 22, topY: 6, length: 40, sway: -1 },
    { topX: 32, topY: 5, length: 44, sway: 0 },
    { topX: 42, topY: 6, length: 40, sway: 1.5 },
    { topX: 52, topY: 8, length: 34, sway: 3 },
  ],
  6: [
    { topX: 10, topY: 9, length: 30, sway: -3.5 },
    { topX: 19, topY: 7, length: 38, sway: -2 },
    { topX: 28, topY: 5, length: 44, sway: -0.5 },
    { topX: 37, topY: 5, length: 42, sway: 0.5 },
    { topX: 46, topY: 7, length: 38, sway: 2 },
    { topX: 54, topY: 9, length: 30, sway: 3.5 },
  ],
  7: [
    { topX: 8, topY: 10, length: 28, sway: -4 },
    { topX: 16, topY: 7, length: 36, sway: -2.5 },
    { topX: 24, topY: 5, length: 42, sway: -1 },
    { topX: 32, topY: 4, length: 46, sway: 0 },
    { topX: 40, topY: 5, length: 42, sway: 1 },
    { topX: 48, topY: 7, length: 36, sway: 2.5 },
    { topX: 56, topY: 10, length: 28, sway: 4 },
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
  const _bottomY = topY + cascadeLen;
  const bottomX = topX + sway * bloomOpenness;

  // === GLOW COLUMN behind the entire cascade ===
  if (bloomOpenness > 0.2) {
    // Tall oval glow behind cascade
    const glowCenterY = topY + cascadeLen * 0.4;
    const glowCenterX = topX + sway * 0.4 * bloomOpenness;

    elements.push({
      shape: { type: "disc", radius: (6 + cascadeLen * 0.12) * bloomOpenness },
      position: { x: glowCenterX, y: glowCenterY },
      rotation: 0,
      scale: 1,
      color: colorSet.aura,
      opacity: 0.06 + bloomOpenness * 0.06,
      zOffset: 0.5,
    });

    // Brighter core glow
    elements.push({
      shape: { type: "disc", radius: (3.5 + cascadeLen * 0.08) * bloomOpenness },
      position: { x: glowCenterX, y: glowCenterY - 2 },
      rotation: 0,
      scale: 1,
      color: colorSet.blossomMid,
      opacity: 0.05 + bloomOpenness * 0.05,
      zOffset: 0.55,
    });
  }

  // === BLOSSOM CLUSTERS along the cascade ===
  // Dense at top, tapering toward bottom
  const clusterCount = 10 + Math.floor(rng() * 6);
  for (let i = 0; i < clusterCount; i++) {
    const t = i / (clusterCount - 1); // 0 = top, 1 = bottom
    const progress = t;

    // Position along the cascade with slight curve
    const cx = topX + (bottomX - topX) * progress + (rng() - 0.5) * (2 - t * 1.5);
    const cy = topY + cascadeLen * progress;

    // Size tapers: large at top, small at bottom
    const sizeMult = (1 - t * 0.7) * bloomOpenness;
    const blossomRadius = (2.2 + rng() * 1.2) * sizeMult;

    if (blossomRadius < 0.3) continue;

    // Base blossom (deeper color)
    elements.push({
      shape: { type: "disc", radius: blossomRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.blossomDeep,
      opacity: 0.35 + rng() * 0.15,
      zOffset: 0.8 + t * 0.1,
    });

    // Mid glow layer
    elements.push({
      shape: { type: "disc", radius: blossomRadius * 0.75 },
      position: { x: cx + (rng() - 0.5) * 0.5, y: cy + (rng() - 0.5) * 0.5 },
      rotation: 0,
      scale: 1,
      color: colorSet.blossomMid,
      opacity: 0.3 + bloomOpenness * 0.15,
      zOffset: 0.85 + t * 0.1,
    });

    // Bright center highlight (stronger at top)
    if (t < 0.7) {
      elements.push({
        shape: { type: "disc", radius: blossomRadius * 0.45 },
        position: { x: cx, y: cy },
        rotation: 0,
        scale: 1,
        color: colorSet.blossomGlow,
        opacity: (0.3 + bloomOpenness * 0.25) * (1 - t * 0.8),
        zOffset: 0.9 + t * 0.1,
      });
    }

    // Individual small petal details around each cluster node
    const petalDetailCount = Math.floor((2 + rng() * 2) * (1 - t * 0.6));
    for (let p = 0; p < petalDetailCount; p++) {
      const pa = rng() * Math.PI * 2;
      const pd = blossomRadius * (0.5 + rng() * 0.5);
      const petalSize = (0.6 + rng() * 0.6) * sizeMult;

      elements.push({
        shape: { type: "petal", width: petalSize * 0.7, length: petalSize, roundness: 0.8 },
        position: { x: cx + Math.cos(pa) * pd, y: cy + Math.sin(pa) * pd },
        rotation: pa + Math.PI / 2,
        scale: 1,
        color: rng() > 0.5 ? colorSet.blossomLight : colorSet.blossomMid,
        opacity: 0.25 + rng() * 0.2,
        zOffset: 0.95 + t * 0.1,
      });
    }
  }

  // === BRIGHT TIP GLOW at cascade top ===
  elements.push({
    shape: { type: "disc", radius: (3.5 + rng() * 1.5) * bloomOpenness },
    position: { x: topX, y: topY + 2 },
    rotation: 0,
    scale: 1,
    color: colorSet.blossomGlow,
    opacity: 0.2 + bloomOpenness * 0.15,
    zOffset: 1.1,
  });

  // Hot white glow point at very top
  elements.push({
    shape: { type: "disc", radius: (1.2 + rng() * 0.5) * bloomOpenness },
    position: { x: topX, y: topY + 1 },
    rotation: 0,
    scale: 1,
    color: colorSet.center,
    opacity: 0.4 + bloomOpenness * 0.2,
    zOffset: 1.2,
  });

  // === TRAILING BUD DOTS at cascade bottom ===
  const trailCount = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < trailCount; i++) {
    const tt = 1 + (i + 1) * 0.08;
    const tx = topX + (bottomX - topX) * tt + (rng() - 0.5) * 1;
    const ty = topY + cascadeLen * tt;
    const dotR = (0.3 - i * 0.05) * bloomOpenness;
    if (dotR <= 0.05) continue;

    elements.push({
      shape: { type: "dot", radius: dotR },
      position: { x: tx, y: ty },
      rotation: 0,
      scale: 1,
      color: colorSet.blossomLight,
      opacity: 0.2 + rng() * 0.15,
      zOffset: 1.0,
    });
  }
}

/* ── main builder ────────────────────────────────────────────────── */

function buildWcEtherealWisteriaElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const cascadeCount = traitOr(ctx.traits, "cascadeCount", 6);
  const sparkleCount = traitOr(ctx.traits, "sparkleCount", 30);
  const leafDensity = traitOr(ctx.traits, "leafDensity", 12);

  const openness = standardOpenness(ctx.keyframeName, ctx.keyframeProgress);
  const bloomOpenness = Math.max(0, (openness - 0.08) / 0.92);
  const leafOpenness = Math.max(0, (openness - 0.03) / 0.97);

  const colors =
    ctx.colorVariationName && COLORS[ctx.colorVariationName]
      ? COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const clampedCascades = Math.max(5, Math.min(7, Math.round(cascadeCount)));
  const layout = CASCADE_LAYOUTS[clampedCascades] ?? CASCADE_LAYOUTS[6]!;

  // === ATMOSPHERIC MIST at bottom ===
  if (openness > 0.08) {
    // Wide purple mist at base
    elements.push({
      shape: { type: "disc", radius: 30 + openness * 10 },
      position: { x: 32, y: 56 },
      rotation: 0,
      scale: 1,
      color: colors.mist,
      opacity: 0.05 + openness * 0.04,
      zOffset: 0.01,
    });

    // Brighter mist core
    elements.push({
      shape: { type: "disc", radius: 20 + openness * 6 },
      position: { x: 32, y: 52 },
      rotation: 0,
      scale: 1,
      color: colors.aura,
      opacity: 0.04 + openness * 0.04,
      zOffset: 0.02,
    });

    // Upper ambient glow behind cascades
    elements.push({
      shape: { type: "disc", radius: 24 + openness * 6 },
      position: { x: 32, y: 22 },
      rotation: 0,
      scale: 1,
      color: colors.aura,
      opacity: 0.03 + openness * 0.03,
      zOffset: 0.015,
    });
  }

  // === TOP BRANCHES (horizontal structure cascades hang from) ===
  if (openness > 0.02) {
    // Main horizontal branch spanning left to right
    elements.push({
      shape: {
        type: "stem",
        points: [
          [2, 6 + rng() * 2],
          [18, 4 + rng() * 2],
          [46, 4 + rng() * 2],
          [62, 6 + rng() * 2],
        ],
        thickness: 1.2 + openness * 0.4,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: colors.branch,
      opacity: 0.5 + openness * 0.15,
      zOffset: 0.06,
    });

    // Secondary branch slightly lower
    elements.push({
      shape: {
        type: "stem",
        points: [
          [6, 8 + rng() * 2],
          [22, 6 + rng() * 2],
          [42, 7 + rng() * 2],
          [58, 9 + rng() * 2],
        ],
        thickness: 0.7 + openness * 0.3,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: colors.branch,
      opacity: 0.4 + openness * 0.1,
      zOffset: 0.07,
    });

    // Short vertical stem connections (cascade hangers)
    for (let i = 0; i < clampedCascades; i++) {
      const c = layout[i]!;
      elements.push({
        shape: {
          type: "stem",
          points: [
            [c.topX + (rng() - 0.5) * 1.5, c.topY - 2],
            [c.topX, c.topY],
            [c.topX + c.sway * 0.1, c.topY + 3],
            [c.topX + c.sway * 0.2, c.topY + 5],
          ],
          thickness: 0.3 + openness * 0.15,
        },
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        color: colors.branch,
        opacity: 0.35 + openness * 0.1,
        zOffset: 0.08,
      });
    }
  }

  // === COMPOUND LEAVES along top branches ===
  if (leafOpenness > 0) {
    const activeLeafCount = Math.max(8, Math.round(leafDensity));
    for (let i = 0; i < activeLeafCount; i++) {
      const lx = 6 + rng() * 52;
      const ly = 2 + rng() * 8;
      const side = rng() > 0.5 ? 1 : -1;
      const angle = Math.PI / 2 + side * (0.3 + rng() * 0.5); // pointing downward-ish

      // Wisteria compound leaf (elongated leaflets)
      const leafletCount = 3 + Math.floor(rng() * 3);
      for (let j = 0; j < leafletCount; j++) {
        const leafletOffset = j * 1.8;
        const leafletAngle = angle + (rng() - 0.5) * 0.3;
        const ox = Math.cos(leafletAngle - Math.PI / 2) * leafletOffset;
        const oy = Math.sin(leafletAngle - Math.PI / 2) * leafletOffset;

        elements.push({
          shape: {
            type: "leaf",
            width: 1.0 + rng() * 0.6,
            length: 2.5 + rng() * 1.5,
          },
          position: { x: lx + ox, y: ly + oy },
          rotation: leafletAngle,
          scale: leafOpenness * (0.5 + rng() * 0.3),
          color: rng() > 0.4 ? colors.leaf : colors.leafDark,
          opacity: 0.35 + rng() * 0.15,
          zOffset: 0.3 + rng() * 0.05,
        });
      }
    }
  }

  // === WISTERIA CASCADES ===
  for (let i = 0; i < clampedCascades; i++) {
    const cascade = layout[i]!;
    // Add randomness to each cascade
    const adjusted: CascadeDef = {
      topX: cascade.topX + (rng() - 0.5) * 2,
      topY: cascade.topY + (rng() - 0.5) * 1,
      length: cascade.length + (rng() - 0.5) * 4,
      sway: cascade.sway + (rng() - 0.5) * 1,
    };
    renderCascade(elements, adjusted, bloomOpenness, colors, rng);
  }

  // === GROUND FOLIAGE at bottom edges ===
  if (leafOpenness > 0) {
    // Left side ground plants
    const groundLeft = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < groundLeft; i++) {
      const gx = 4 + rng() * 14;
      const gy = 54 + rng() * 6;
      elements.push({
        shape: { type: "leaf", width: 1.5 + rng() * 1, length: 3 + rng() * 3 },
        position: { x: gx, y: gy },
        rotation: -Math.PI / 2 + (rng() - 0.5) * 0.6,
        scale: leafOpenness * 0.5,
        color: colors.leafDark,
        opacity: 0.3 + rng() * 0.1,
        zOffset: 0.04,
      });
    }

    // Right side ground plants
    const groundRight = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < groundRight; i++) {
      const gx = 48 + rng() * 14;
      const gy = 54 + rng() * 6;
      elements.push({
        shape: { type: "leaf", width: 1.5 + rng() * 1, length: 3 + rng() * 3 },
        position: { x: gx, y: gy },
        rotation: -Math.PI / 2 + (rng() - 0.5) * 0.6,
        scale: leafOpenness * 0.5,
        color: colors.leafDark,
        opacity: 0.3 + rng() * 0.1,
        zOffset: 0.04,
      });
    }

    // Small ground flowers
    const groundFlowers = 4 + Math.floor(rng() * 4);
    for (let i = 0; i < groundFlowers; i++) {
      const fx = 8 + rng() * 48;
      const fy = 56 + rng() * 5;
      elements.push({
        shape: { type: "dot", radius: 0.3 + rng() * 0.35 },
        position: { x: fx, y: fy },
        rotation: 0,
        scale: leafOpenness,
        color: colors.blossomLight,
        opacity: 0.25 + rng() * 0.2,
        zOffset: 0.045,
      });
    }
  }

  // === SPARKLE PARTICLES ===
  if (bloomOpenness > 0.1) {
    const sparkleOpenness = Math.min(1, (bloomOpenness - 0.1) / 0.6);
    const activeSparkles = Math.round(sparkleCount * sparkleOpenness);

    for (let i = 0; i < activeSparkles; i++) {
      // Distribute throughout the cascade area
      const sx = 8 + rng() * 48;
      const sy = 6 + rng() * 52;

      const roll = rng();
      const isLarge = roll < 0.12;
      const isMedium = roll < 0.32;

      const sparkleRadius = isLarge
        ? 0.7 + rng() * 0.4
        : isMedium
          ? 0.35 + rng() * 0.25
          : 0.12 + rng() * 0.18;

      elements.push({
        shape: { type: "dot", radius: sparkleRadius },
        position: { x: sx, y: sy },
        rotation: 0,
        scale: 1,
        color: isLarge ? colors.center : isMedium ? colors.blossomGlow : colors.sparkle,
        opacity: (isLarge ? 0.75 : isMedium ? 0.5 : 0.3) + rng() * 0.2,
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

export const wcEtherealWisteria: PlantVariant = {
  id: "wc-ethereal-wisteria",
  name: "Ethereal Wisteria",
  description:
    "Luminous wisteria cascades hang like curtains of captured starlight, their tapering blossom chains glowing from within as purple mist drifts below",
  rarity: 0.06,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      cascadeCount: { signal: "entropy", range: [5, 7], default: 6, round: true },
      sparkleCount: { signal: "growth", range: [20, 40], default: 30, round: true },
      leafDensity: { signal: "spread", range: [8, 16], default: 12, round: true },
    },
  },
  colorVariations: [
    {
      name: "roseglow",
      weight: 1.0,
      palettes: { bloom: ["#C060A8", "#E080C0", "#3A3028"] },
    },
    {
      name: "sapphire",
      weight: 0.8,
      palettes: { bloom: ["#4068C0", "#6090E0", "#303838"] },
    },
    {
      name: "sunburst",
      weight: 0.8,
      palettes: { bloom: ["#C09820", "#E0B840", "#383020"] },
    },
    {
      name: "amethyst",
      weight: 0.8,
      palettes: { bloom: ["#7840B8", "#9868D8", "#302838"] },
    },
  ],
  clusteringBehavior: {
    mode: "spread",
    clusterRadius: 450,
    clusterBonus: 1.3,
    maxClusterDensity: 3,
    reseedClusterChance: 0.35,
  },
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 16 },
      { name: "sprout", duration: 20 },
      { name: "bloom", duration: 52 },
      { name: "fade", duration: 20 },
    ],
    wcEffect: { layers: 5, opacity: 0.5, spread: 0.1, colorVariation: 0.07 },
    buildElements: buildWcEtherealWisteriaElements,
  },
};
