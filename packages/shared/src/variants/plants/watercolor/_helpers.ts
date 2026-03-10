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

// ── Quantum Visual Annotation ────────────────────────────────────────────────

/**
 * Quantum-derived visual parameters for animation and iridescence.
 * Computed from quantum signals and applied to all elements in a plant.
 */
export interface QuantumVisualParams {
  /** Per-element sway intensity: uncertain plants sway more (0.5–1.5) */
  swayAmplitude: number;
  /** Per-element sway speed variation (0.7–1.3) */
  swayFrequency: number;
  /** Breathing depth: dominant plants pulse more visibly (0.7–1.3) */
  breathAmplitude: number;
  /** Iridescence (hue shift) amount: high entropy = more color play (0.2–0.8) */
  iridescence: number;
  /** Saturation boost: dominant measurement = richer colors (0–0.8) */
  saturationBoost: number;
}

/**
 * Compute quantum-driven visual parameters from a plant's traits.
 * Returns safe defaults for unobserved plants (stronger iridescence to visualize uncertainty).
 */
export function computeQuantumVisuals(traits: ResolvedTraits | null): QuantumVisualParams {
  const signals = traits?.quantumSignals;
  if (!signals) {
    // Unobserved: stronger iridescence + more sway (quantum uncertainty)
    return {
      swayAmplitude: 1.3,
      swayFrequency: 1.0,
      breathAmplitude: 0.8,
      iridescence: 0.7,
      saturationBoost: 0.0,
    };
  }
  return {
    swayAmplitude: 0.5 + (1 - signals.certainty) * 1.0,
    swayFrequency: 0.7 + signals.spread * 0.6,
    breathAmplitude: 0.7 + signals.dominance * 0.6,
    iridescence: 0.2 + signals.entropy * 0.6,
    saturationBoost: signals.dominance * 0.8,
  };
}

/**
 * Stamp quantum-driven animation and iridescence parameters onto all elements.
 * Call this after building elements in a variant's buildElements function,
 * or in the overlay before merging. Each element gets slightly different
 * values via seeded RNG jitter for organic variety.
 */
export function annotateElements(
  elements: WatercolorElement[],
  traits: ResolvedTraits | null,
  rng: () => number
): WatercolorElement[] {
  const qv = computeQuantumVisuals(traits);

  return elements.map((el) => ({
    ...el,
    swayAmplitude: qv.swayAmplitude * (0.8 + rng() * 0.4),
    swayFrequency: qv.swayFrequency * (0.85 + rng() * 0.3),
    breathAmplitude: qv.breathAmplitude * (0.8 + rng() * 0.4),
    iridescence: qv.iridescence,
    saturationBoost: qv.saturationBoost,
  }));
}

// ── Quantum Aura Parameters ──────────────────────────────────────────────────

/**
 * Parameters for the quantum aura glow rendered behind each plant.
 */
export interface AuraParams {
  /** Aura color (hex string), shifted by parityBias between warm and cool */
  color: string;
  /** Aura radius in 64×64 coordinate space (8–20) */
  radius: number;
  /** Base opacity (0.08–0.35) */
  opacity: number;
  /** Pulse speed multiplier (0.5–2.0) */
  pulseSpeed: number;
}

/**
 * Compute aura glow parameters from quantum signals.
 * Unobserved plants get a dim, neutral white aura.
 */
export function computeAuraParams(traits: ResolvedTraits | null): AuraParams {
  const signals = traits?.quantumSignals;
  if (!signals) {
    return { color: "#c8c8d0", radius: 10, opacity: 0.06, pulseSpeed: 1.5 };
  }

  // parityBias shifts hue: 0 = warm amber (#FFD080), 1 = cool cyan (#80D0FF)
  const hue = 30 + signals.parityBias * 170; // 30° (amber) → 200° (cyan)
  const sat = 40 + signals.dominance * 30; // 40-70%
  const light = 70 + signals.certainty * 15; // 70-85%
  const color = hslToHex(hue, sat, light);

  return {
    color,
    radius: 8 + signals.entropy * 12,
    opacity: 0.08 + signals.dominance * 0.27,
    pulseSpeed: 0.5 + signals.spread * 1.5,
  };
}

// ── Quantum Particle Parameters ──────────────────────────────────────────────

/**
 * Parameters for ambient quantum particles emitted by a plant.
 */
export interface ParticleParams {
  /** Number of particles (2–6) */
  count: number;
  /** Upward drift speed multiplier (0.5–2.0) */
  speed: number;
  /** Particle color (hex) */
  color: string;
  /** Particle size (0.3–1.2 in 64×64 space) */
  size: number;
  /** Horizontal spread radius (4–12 in 64×64 space) */
  spreadRadius: number;
}

/**
 * Compute particle emission parameters from quantum signals.
 * Unobserved plants get fewer, flickering particles.
 */
export function computeParticleParams(
  traits: ResolvedTraits | null,
  plantColor: string
): ParticleParams {
  const signals = traits?.quantumSignals;
  if (!signals) {
    return { count: 1, speed: 0.8, color: "#e0e0e8", size: 0.4, spreadRadius: 6 };
  }

  // Shift plant's primary color by parityBias for particle tint
  const color = shiftHue(plantColor, (signals.parityBias - 0.5) * 30);

  return {
    count: Math.round(2 + signals.entropy * 4),
    speed: 0.5 + signals.growth * 1.5,
    color,
    size: 0.3 + signals.dominance * 0.9,
    spreadRadius: 4 + signals.spread * 8,
  };
}

// ── Color Utilities ──────────────────────────────────────────────────────────

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function shiftHue(hex: string, degrees: number): string {
  // Parse hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // RGB → HSL
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0,
    s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return hslToHex((h * 360 + degrees + 360) % 360, s * 100, l * 100);
}
