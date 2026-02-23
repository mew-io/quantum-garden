/**
 * Watercolor Prismatic Fern
 *
 * A fern with rainbow color shift — the frond color transitions from
 * warm (red/orange) at the base to cool (blue/purple) at the tips.
 * Classic fern shape: central rachis (stem) with pairs of leaflets
 * branching off alternately.
 *
 * Category: watercolor (ferns adaptation)
 * Rarity: 0.03
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { buildLeaf, buildStem, createRng, fernOpenness, traitOr } from "../_helpers";

/**
 * Linearly interpolate between two hex colors.
 * @param colorA - Starting hex color (e.g., "#E88070")
 * @param colorB - Ending hex color (e.g., "#7088D8")
 * @param t - Interpolation factor 0..1
 */
function lerpColor(colorA: string, colorB: string, t: number): string {
  const parseHex = (hex: string) => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  };
  const a = parseHex(colorA);
  const b = parseHex(colorB);
  const r = Math.round(a[0]! + (b[0]! - a[0]!) * t);
  const g = Math.round(a[1]! + (b[1]! - a[1]!) * t);
  const bl = Math.round(a[2]! + (b[2]! - a[2]!) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`.toUpperCase();
}

/**
 * Map a position along the rachis (0 = base, 1 = tip) to a rainbow
 * color using three gradient stops, scaled by prismaticShift.
 */
function spectrumColor(t: number, shift: number, colors: [string, string, string]): string {
  const st = Math.min(1, t * shift);
  if (st < 0.5) {
    return lerpColor(colors[0], colors[1], st * 2);
  }
  return lerpColor(colors[1], colors[2], (st - 0.5) * 2);
}

function buildWcPrismaticFernElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const branchCount = traitOr(ctx.traits, "branchCount", 6);
  const prismaticShift = traitOr(ctx.traits, "prismaticShift", 0.6);
  const leafletDensity = traitOr(ctx.traits, "leafletDensity", 1.0);

  // ── Lifecycle via fernOpenness helper ────────────────────────────────
  const openness = fernOpenness(ctx.keyframeName, ctx.keyframeProgress);

  if (openness <= 0) return elements;

  // ── Spectrum palette ────────────────────────────────────────────────
  const spectrumPalette: [string, string, string] = ["#E88070", "#A8D870", "#7088D8"];

  // ── Rachis (central stem) ───────────────────────────────────────────
  const baseX = 32;
  const baseY = 56;
  const rachisHeight = 34 * openness;
  const topX = baseX + (rng() - 0.5) * 3;
  const topY = baseY - rachisHeight;

  buildStem(
    elements,
    baseX,
    baseY,
    topX,
    topY,
    0.3, // curvature
    0.6, // thickness
    "#6B8060", // stem green
    0.55,
    rng
  );

  // ── Leaflet pairs along the rachis ──────────────────────────────────
  // Branch off alternately left and right
  const totalLeaflets = Math.round(branchCount * leafletDensity);

  for (let i = 0; i < totalLeaflets; i++) {
    // Position along the rachis (0 = base, 1 = tip)
    const tRachis = (i + 1) / (totalLeaflets + 1);

    // Skip leaflets beyond the current openness growth point
    if (tRachis > openness) break;

    // Interpolate position along the rachis curve
    const lx = baseX + (topX - baseX) * tRachis;
    const ly = baseY + (topY - baseY) * tRachis;

    // Alternating left/right with slight random variation
    const side = i % 2 === 0 ? -1 : 1;
    const branchAngle = side * (Math.PI / 4 + rng() * 0.3);

    // Leaflets near the base are larger, near the tip are smaller
    const sizeFactor = 1.0 - tRachis * 0.5;
    const leafWidth = (2.0 + rng() * 1.0) * sizeFactor * leafletDensity;
    const leafLength = (5.0 + rng() * 2.0) * sizeFactor * leafletDensity;

    // Prismatic color based on position along rachis
    const color = spectrumColor(tRachis, prismaticShift, spectrumPalette);

    // How far the leaflet has "unfurled" — closer to the growth front opens later
    const unfurl = Math.min(1, (openness - tRachis * 0.8) / 0.4);
    const leafScale = Math.max(0, unfurl);

    buildLeaf(
      elements,
      lx + Math.cos(branchAngle) * 2 * sizeFactor,
      ly + Math.sin(branchAngle) * 2 * sizeFactor,
      branchAngle,
      leafScale,
      leafWidth,
      leafLength,
      color,
      0.8 + tRachis * 0.3
    );

    // ── Sub-leaflets for denser appearance ─────────────────────────────
    if (leafletDensity > 0.8 && sizeFactor > 0.5) {
      const subAngle = branchAngle + side * 0.3;
      const subSize = sizeFactor * 0.55;
      const subColor = spectrumColor(Math.min(1, tRachis + 0.1), prismaticShift, spectrumPalette);

      buildLeaf(
        elements,
        lx + Math.cos(subAngle) * 4 * sizeFactor,
        ly + Math.sin(subAngle) * 4 * sizeFactor,
        subAngle,
        leafScale * 0.7,
        leafWidth * subSize,
        leafLength * subSize,
        subColor,
        1.0 + tRachis * 0.2
      );
    }
  }

  // ── Spore dots at leaflet bases (mature keyframe only) ──────────────
  if (ctx.keyframeName === "mature") {
    for (let i = 0; i < totalLeaflets; i++) {
      const tRachis = (i + 1) / (totalLeaflets + 1);
      const lx = baseX + (topX - baseX) * tRachis;
      const ly = baseY + (topY - baseY) * tRachis;
      const side = i % 2 === 0 ? -1 : 1;
      const branchAngle = side * (Math.PI / 4 + rng() * 0.3);

      elements.push({
        shape: { type: "dot", radius: 0.3 + rng() * 0.3 },
        position: {
          x: lx + Math.cos(branchAngle) * 1.5,
          y: ly + Math.sin(branchAngle) * 1.5,
        },
        rotation: 0,
        scale: 1,
        color: spectrumColor(tRachis, prismaticShift, spectrumPalette),
        opacity: 0.5 + rng() * 0.2,
        zOffset: 1.6,
      });
    }
  }

  return elements;
}

export const wcPrismaticFern: PlantVariant = {
  id: "wc-prismatic-fern",
  name: "Watercolor Prismatic Fern",
  description:
    "A fern with rainbow color shift from warm reds at the base to cool blues at the tips, painted in layered watercolor",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      branchCount: { signal: "entropy", range: [4, 9], default: 6, round: true },
      prismaticShift: { signal: "parityBias", range: [0.3, 1.0], default: 0.6 },
      leafletDensity: { signal: "spread", range: [0.6, 1.4], default: 1.0 },
    },
  },
  colorVariations: [
    { name: "rainbow", weight: 1.0, palettes: { frond: ["#E88070", "#A8D870", "#7088D8"] } },
    { name: "aurora", weight: 0.6, palettes: { frond: ["#70C0B0", "#A8D8E0", "#8070C8"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "dormant", duration: 5 },
      { name: "sprout", duration: 12 },
      { name: "frond", duration: 40 },
      { name: "mature", duration: 20 },
      { name: "fade", duration: 10 },
    ],
    wcEffect: { layers: 3, opacity: 0.48, spread: 0.06, colorVariation: 0.05 },
    buildElements: buildWcPrismaticFernElements,
  },
};
