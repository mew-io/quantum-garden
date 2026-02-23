/**
 * Shared helpers for watercolor variant builders.
 *
 * Reduces boilerplate across 36+ watercolor plant variants by extracting
 * common patterns: RNG, lifecycle openness curves, element construction.
 */
import type { ResolvedTraits } from "../../../types";
import type { WatercolorElement } from "../../types";

// ── Seeded RNG ──────────────────────────────────────────────────────────────

/**
 * Create a seeded pseudo-random number generator using LCG.
 * Same algorithm as existing watercolor variants (multiplier 16807, modulus 2^31-1).
 * Returns a function that yields values in [0, 1) on each call.
 */
export function createRng(seed: number): () => number {
  let s = seed & 0x7fffffff;
  if (s === 0) s = 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Lifecycle Openness Curves ───────────────────────────────────────────────

/**
 * Standard 4-phase openness for flowering plants.
 * bud (0.05→0.15) → sprout (0.15→0.5) → bloom (0.5→1.0) → fade (1.0→0.6)
 */
export function standardOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "bud":
      return 0.05 + progress * 0.1;
    case "sprout":
      return 0.15 + progress * 0.35;
    case "bloom":
      return 0.5 + progress * 0.5;
    case "fade":
      return 1.0 - progress * 0.4;
    default:
      return 0.5;
  }
}

/**
 * 5-phase openness for fern-like plants.
 * dormant (0) → sprout (0→0.3) → grow (0.3→0.9) → mature (0.9→1.0) → fade (1.0→0)
 */
export function fernOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "dormant":
      return 0;
    case "sprout":
      return progress * 0.3;
    case "grow":
    case "frond":
      return 0.3 + progress * 0.6;
    case "mature":
      return 0.9 + progress * 0.1;
    case "fade":
      return Math.max(0, 1 - progress);
    default:
      return 0.5;
  }
}

/**
 * Simple 2-phase openness: appear → settled (for static plants like moss/pebbles).
 */
export function appearOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "appear":
    case "emerging":
      return progress;
    case "settled":
    case "spreading":
      return 1.0;
    default:
      return 1.0;
  }
}

// ── Trait Reading ────────────────────────────────────────────────────────────

/**
 * Safely read a trait from ResolvedTraits with type-checked fallback.
 * Handles null traits (unobserved plants) and missing keys.
 */
export function traitOr<T>(traits: ResolvedTraits | null, key: string, fallback: T): T {
  if (!traits) return fallback;
  const val = traits[key];
  return typeof val === typeof fallback ? (val as T) : fallback;
}

// ── Element Builders ────────────────────────────────────────────────────────

/**
 * Build a stem from bottom to top with optional curvature.
 * Adds a single `stem` WatercolorElement with 4 CatmullRom control points.
 */
export function buildStem(
  elements: WatercolorElement[],
  bottomX: number,
  bottomY: number,
  topX: number,
  topY: number,
  curvature: number,
  thickness: number,
  color: string,
  opacity: number,
  rng: () => number
): void {
  const midY = (bottomY + topY) / 2;
  const curveDir = rng() > 0.5 ? 1 : -1;
  const offset = curvature * 4 * curveDir;
  elements.push({
    shape: {
      type: "stem",
      points: [
        [bottomX, bottomY],
        [bottomX + offset * 0.5, midY + 4],
        [bottomX + offset, midY - 4],
        [topX, topY],
      ],
      thickness,
    },
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: 1,
    color,
    opacity,
    zOffset: 0,
  });
}

/**
 * Build a cluster of scattered discs (for moss, pebbles, orb patterns).
 */
export function buildDiscCluster(
  elements: WatercolorElement[],
  cx: number,
  cy: number,
  count: number,
  radiusRange: [number, number],
  scatterRadius: number,
  color: string,
  opacity: number,
  zOffset: number,
  rng: () => number
): void {
  for (let i = 0; i < count; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * scatterRadius;
    const radius = radiusRange[0] + rng() * (radiusRange[1] - radiusRange[0]);
    elements.push({
      shape: { type: "disc", radius },
      position: { x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist },
      rotation: 0,
      scale: 1,
      color,
      opacity,
      zOffset,
    });
  }
}

/**
 * Build a leaf at a given position with angle and scale.
 */
export function buildLeaf(
  elements: WatercolorElement[],
  x: number,
  y: number,
  angle: number,
  scale: number,
  width: number,
  length: number,
  color: string,
  zOffset: number
): void {
  elements.push({
    shape: { type: "leaf", width, length },
    position: { x, y },
    rotation: angle,
    scale,
    color,
    zOffset,
  });
}

/**
 * Generate N evenly-spaced radial positions around a center point.
 */
export function radialPositions(
  cx: number,
  cy: number,
  radius: number,
  count: number,
  offsetAngle = 0
): Array<{ x: number; y: number; angle: number }> {
  const step = (Math.PI * 2) / count;
  return Array.from({ length: count }, (_, i) => {
    const angle = step * i + offsetAngle;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      angle,
    };
  });
}

/**
 * Color set type used by many watercolor variants.
 */
export interface ColorSet {
  primary: string;
  secondary: string;
  stem: string;
  leaf: string;
  accent?: string;
}

/**
 * Resolve a color set from colorVariationName or traits, with a fallback.
 */
export function resolveColors(
  colorMap: Record<string, ColorSet>,
  variationName: string | null,
  traits: ResolvedTraits | null,
  fallback: ColorSet
): ColorSet {
  if (variationName && colorMap[variationName]) return colorMap[variationName]!;
  if (traits?.colorPalette && traits.colorPalette.length >= 3) {
    return {
      primary: traits.colorPalette[0]!,
      secondary: traits.colorPalette[1]!,
      stem: traits.colorPalette[2]!,
      leaf: fallback.leaf,
      accent: fallback.accent,
    };
  }
  return fallback;
}
