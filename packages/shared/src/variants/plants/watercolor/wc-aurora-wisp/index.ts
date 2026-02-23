/**
 * Watercolor Aurora Wisp
 *
 * Flowing aurora borealis ribbons — multiple sinusoidal stem curves flowing
 * vertically with gentle horizontal waves. Glow discs at wave intersections.
 * Like northern lights translated to watercolor. Colors shift between ribbons:
 * green, blue, purple, pink.
 *
 * Category: watercolor (atmospheric flora)
 * Rarity: 0.03
 * Render mode: watercolor
 * Path A: custom Python circuit (wc_aurora_wisp) — no quantumMapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr } from "../_helpers";

/**
 * Color sets for the aurora wisp, keyed by color variation name.
 */
const AURORA_COLORS: Record<string, { ribbon: string; glow: string; shimmer: string }> = {
  boreal: { ribbon: "#50C888", glow: "#40A0B0", shimmer: "#8060C0" },
  solar: { ribbon: "#D860A0", glow: "#A050C0", shimmer: "#6040D0" },
};

const AURORA_DEFAULT_COLORS = AURORA_COLORS["boreal"]!;

/**
 * Get aurora-specific openness for lifecycle keyframes.
 * dark -> shimmer -> aurora -> fade
 */
function getAuroraOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "dark":
      return 0; // nothing visible
    case "shimmer":
      return progress * 0.4; // 0 -> 0.4 (first ribbon appears)
    case "aurora":
      return 0.4 + progress * 0.6; // 0.4 -> 1.0 (all ribbons flowing)
    case "fade":
      return 1.0 - progress * 0.4; // 1.0 -> 0.6 (ribbons dim)
    default:
      return 0.5;
  }
}

/**
 * Builder function for the Watercolor Aurora Wisp variant.
 *
 * Creates flowing aurora borealis ribbons using stem shapes with sinusoidal
 * control points. Glow discs at wave peaks, dot particles for sparkle.
 *
 * Visual design:
 * - Multiple vertical ribbons (stems) with sinusoidal x-offset creating wave patterns
 * - Each ribbon has 4-6 control points creating the flowing sine curve
 * - Glow discs placed at wave peaks (where ribbons bow out)
 * - Dot particles scattered along ribbons for sparkle
 * - Colors shift between ribbons: green, blue, purple, pink
 */
function buildWcAuroraWispElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  // Path A: read properties from Python circuit's extra dict (via plant.traits).
  // Fallback values for unobserved plants (ctx.traits is null).
  const ribbonCount = traitOr(ctx.traits, "ribbonCount", 3);
  const waveAmplitude = traitOr(ctx.traits, "waveAmplitude", 5);
  const waveFrequency = traitOr(ctx.traits, "waveFrequency", 3);
  const curtainHeight = traitOr(ctx.traits, "curtainHeight", 0.9);

  // Color selection
  const colorSet =
    (ctx.colorVariationName ? AURORA_COLORS[ctx.colorVariationName] : null) ??
    (ctx.traits?.colorPalette
      ? {
          ribbon: ctx.traits.colorPalette[0] ?? AURORA_DEFAULT_COLORS.ribbon,
          glow: ctx.traits.colorPalette[1] ?? AURORA_DEFAULT_COLORS.glow,
          shimmer: ctx.traits.colorPalette[2] ?? AURORA_DEFAULT_COLORS.shimmer,
        }
      : AURORA_DEFAULT_COLORS);

  // Lifecycle-driven openness
  const openness = getAuroraOpenness(ctx.keyframeName, ctx.keyframeProgress);

  if (openness <= 0) return elements;

  const cx = 32;
  const baseY = 56; // bottom of the aurora curtain
  const topY = 10; // top of the aurora curtain

  // Per-ribbon colors that shift across the spectrum
  const ribbonColors = [colorSet.ribbon, colorSet.glow, colorSet.shimmer, colorSet.ribbon];

  // === RIBBONS (stems with sinusoidal curves) ===
  // Each ribbon flows vertically with horizontal wave offset
  const activeRibbons = Math.min(ribbonCount, Math.ceil(openness * ribbonCount));

  for (let r = 0; r < activeRibbons; r++) {
    const ribbonProgress = r < activeRibbons - 1 ? 1.0 : Math.min(1, openness * ribbonCount - r);
    if (ribbonProgress <= 0) continue;

    // Spread ribbons horizontally across the canvas
    const ribbonBaseX = cx + (r - (ribbonCount - 1) / 2) * 8 + (rng() - 0.5) * 3;
    const ribbonColor = ribbonColors[r % ribbonColors.length]!;

    // Generate sinusoidal control points for this ribbon
    const pointCount = 4 + Math.floor(rng() * 2); // 4-5 control points
    const points: [number, number][] = [];
    const curtainLen = (baseY - topY) * curtainHeight;

    for (let p = 0; p < pointCount; p++) {
      const t = p / (pointCount - 1);
      const y = baseY - t * curtainLen * ribbonProgress;
      // Sinusoidal x offset: amplitude increases toward the top
      const phase = rng() * Math.PI * 0.5; // per-ribbon phase offset
      const amp = waveAmplitude * t * ribbonProgress;
      const x = ribbonBaseX + Math.sin(t * waveFrequency * Math.PI + phase) * amp;
      points.push([x, y]);
    }

    // Draw the ribbon as a thin stem
    elements.push({
      shape: {
        type: "stem",
        points,
        thickness: 0.6 + rng() * 0.4,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: ribbonColor,
      opacity: (0.35 + rng() * 0.15) * ribbonProgress,
      zOffset: 0.5 + r * 0.15,
    });

    // === GLOW DISCS at wave peaks ===
    // Place discs where the sine wave reaches its peak (maximum displacement)
    if (openness > 0.3) {
      const glowOpenness = Math.min(1, (openness - 0.3) / 0.5);
      for (let p = 1; p < points.length - 1; p++) {
        const pt = points[p]!;
        // Only place glow at peaks (where curve bows outward most)
        if (Math.abs(pt[0] - ribbonBaseX) > waveAmplitude * 0.3) {
          const glowRadius = (1.5 + rng() * 2) * glowOpenness;
          elements.push({
            shape: { type: "disc", radius: glowRadius },
            position: { x: pt[0], y: pt[1] },
            rotation: 0,
            scale: glowOpenness,
            color: colorSet.glow,
            opacity: (0.2 + rng() * 0.15) * glowOpenness,
            zOffset: 1.0 + r * 0.1,
          });
        }
      }
    }
  }

  // === SPARKLE DOT PARTICLES ===
  // Scattered along and around the ribbons
  if (openness > 0.15) {
    const sparkOpenness = Math.min(1, (openness - 0.15) / 0.5);
    const sparkCount = Math.floor(6 + ribbonCount * 3);

    for (let i = 0; i < sparkCount; i++) {
      const t = rng(); // vertical position fraction
      const curtainLen = (baseY - topY) * curtainHeight;
      const y = baseY - t * curtainLen * openness;
      // Horizontal scatter based on wave amplitude
      const x = cx + (rng() - 0.5) * (waveAmplitude * 2 + ribbonCount * 4);
      const dotRadius = 0.15 + rng() * 0.35;
      const sparkColor = ribbonColors[Math.floor(rng() * ribbonColors.length)]!;

      elements.push({
        shape: { type: "dot", radius: dotRadius },
        position: { x, y },
        rotation: 0,
        scale: sparkOpenness,
        color: sparkColor,
        opacity: (0.2 + rng() * 0.3) * sparkOpenness,
        zOffset: 2.0 + rng() * 0.5,
      });
    }
  }

  // === DIFFUSE GLOW BACKDROP ===
  // Large, very transparent discs behind the ribbons for ambient glow
  if (openness > 0.4) {
    const glowOpenness = Math.min(1, (openness - 0.4) / 0.4);
    const backdropCount = Math.min(3, activeRibbons);

    for (let i = 0; i < backdropCount; i++) {
      const y = baseY - (baseY - topY) * curtainHeight * (0.3 + rng() * 0.4);
      const x = cx + (rng() - 0.5) * 12;
      const radius = (6 + rng() * 5) * glowOpenness;
      const backdropColor = ribbonColors[i % ribbonColors.length]!;

      elements.push({
        shape: { type: "disc", radius },
        position: { x, y },
        rotation: 0,
        scale: 1,
        color: backdropColor,
        opacity: (0.1 + rng() * 0.08) * glowOpenness,
        zOffset: 0.1,
      });
    }
  }

  return elements;
}

export const wcAuroraWisp: PlantVariant = {
  id: "wc-aurora-wisp",
  name: "Watercolor Aurora Wisp",
  description:
    "Flowing aurora borealis ribbons painted in watercolor, with sinusoidal curtains of light and glowing wave peaks, shaped by a 4-qubit phase interference circuit",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  // Path A: custom Python circuit encodes all visual properties directly.
  // The wc_aurora_wisp circuit maps qubit measurements to
  // ribbonCount, waveAmplitude, waveFrequency, and curtainHeight in its extra dict.
  circuitId: "wc_aurora_wisp",
  sandboxControls: [
    { key: "ribbonCount", label: "Ribbon Count", min: 2, max: 5, step: 1, default: 3 },
    {
      key: "waveAmplitude",
      label: "Wave Amplitude",
      min: 3,
      max: 8,
      step: 0.5,
      default: 5,
    },
    {
      key: "waveFrequency",
      label: "Wave Frequency",
      min: 2,
      max: 5,
      step: 0.5,
      default: 3,
    },
    {
      key: "curtainHeight",
      label: "Curtain Height",
      min: 0.6,
      max: 1.2,
      step: 0.05,
      default: 0.9,
    },
  ],
  colorVariations: [
    {
      name: "boreal",
      weight: 1.0,
      palettes: { bloom: ["#50C888", "#40A0B0", "#8060C0"] },
    },
    {
      name: "solar",
      weight: 0.6,
      palettes: { bloom: ["#D860A0", "#A050C0", "#6040D0"] },
    },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "dark", duration: 5 },
      { name: "shimmer", duration: 15 },
      { name: "aurora", duration: 40 },
      { name: "fade", duration: 15 },
    ],
    wcEffect: {
      layers: 4,
      opacity: 0.42,
      spread: 0.08,
      colorVariation: 0.06,
    },
    buildElements: buildWcAuroraWispElements,
  },
};
