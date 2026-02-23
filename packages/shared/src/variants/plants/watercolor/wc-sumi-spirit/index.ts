/**
 * Watercolor Sumi Spirit
 *
 * A sumi-e (Japanese ink wash) inspired spirit: a concentric ink circle
 * (enso) made of disc rings with a deliberate gap segment. Inside, brush
 * splash dots suggest movement and life. The enso may be complete or have
 * an opening — its completeness exists in quantum superposition until
 * observed, mirroring the Zen philosophy of the enso. Monochromatic
 * blacks/grays with subtle warm tones.
 *
 * Category: watercolor (abstract)
 * Rarity: 0.03
 * Render mode: watercolor
 * Path A: custom Python circuit (wc_sumi_spirit) — no quantumMapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr } from "../_helpers";

/**
 * Color sets for the sumi spirit, keyed by color variation name.
 */
const SUMI_COLORS: Record<string, { dark: string; mid: string; light: string }> = {
  ink: { dark: "#2A2A2A", mid: "#4A4A4A", light: "#8A8A8A" },
  "warm-ink": { dark: "#3A3028", mid: "#5A5048", light: "#9A8878" },
};

const DEFAULT_COLORS = SUMI_COLORS["ink"]!;

/**
 * Get sumi-specific openness for lifecycle keyframes.
 * void -> stroke -> enso -> settle
 */
function getSumiOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "void":
      return progress * 0.02; // 0.00 -> 0.02 (nearly empty)
    case "stroke":
      return 0.02 + progress * 0.68; // 0.02 -> 0.70 (circle being drawn)
    case "enso":
      return 0.7 + progress * 0.3; // 0.70 -> 1.00 (circle complete/near-complete)
    case "settle":
      return 1.0; // 1.00 (ink settles, splash dots appear)
    default:
      return 0.5;
  }
}

/**
 * Builder function for the Watercolor Sumi Spirit variant.
 *
 * Creates a sumi-e inspired spirit with an enso circle (with optional gap),
 * inner ink wash, brush splash dots, and spirit "eye" dots. The enso
 * completeness, gap angle, and brush pressure are driven by the quantum circuit.
 *
 * Visual design:
 * - Outer enso ring: multiple disc segments arranged in a circle with a gap
 * - Inner wash: semi-transparent large disc at center (ink wash)
 * - Brush splash dots: scattered around the enso
 * - Spirit eye: two small dots near center suggesting a presence
 */
function buildWcSumiSpiritElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  // Path A: read properties from Python circuit's extra dict (via plant.traits).
  // Fallback values for unobserved plants (ctx.traits is null).
  const completeness = traitOr(ctx.traits, "completeness", 0.8);
  const gapAngle = traitOr(ctx.traits, "gapAngle", Math.PI * 0.5);
  const brushPressure = traitOr(ctx.traits, "brushPressure", 0.65);

  // Color selection
  const colorSet =
    (ctx.colorVariationName ? SUMI_COLORS[ctx.colorVariationName] : null) ??
    (ctx.traits?.colorPalette
      ? {
          dark: ctx.traits.colorPalette[0] ?? DEFAULT_COLORS.dark,
          mid: ctx.traits.colorPalette[1] ?? DEFAULT_COLORS.mid,
          light: ctx.traits.colorPalette[2] ?? DEFAULT_COLORS.light,
        }
      : DEFAULT_COLORS);

  // Lifecycle-driven openness
  const openness = getSumiOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const cx = 32;
  const cy = 32;
  const ensoRadius = 16;

  // Gap parameters: the gap width is determined by (1 - completeness)
  // gapAngle is the center of the gap
  const gapWidth = (1 - completeness) * Math.PI * 2; // radians of gap
  const gapStart = gapAngle - gapWidth / 2;
  const gapEnd = gapAngle + gapWidth / 2;

  // Helper to check if an angle falls within the gap
  function isInGap(angle: number): boolean {
    // Normalize angle to [0, 2pi)
    const a = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const gs = ((gapStart % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const ge = ((gapEnd % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    if (gs <= ge) {
      return a >= gs && a <= ge;
    }
    // Gap wraps around 0
    return a >= gs || a <= ge;
  }

  // === INNER WASH ===
  // Semi-transparent large disc at center representing ink wash
  if (openness > 0.1) {
    const washOpenness = Math.min(1, (openness - 0.1) / 0.5);
    const washRadius = ensoRadius * 0.65 * washOpenness;

    elements.push({
      shape: { type: "disc", radius: washRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.light,
      opacity: 0.12 * washOpenness * brushPressure,
      zOffset: -0.5,
    });
  }

  // === OUTER ENSO RING ===
  // Multiple disc segments arranged in a circle, with a gap at gapAngle
  if (openness > 0.05) {
    const ensoOpenness = Math.min(1, openness / 0.7);
    const segmentCount = 24; // number of disc segments forming the circle
    const segmentStep = (Math.PI * 2) / segmentCount;

    // Only draw segments up to the current progress in the stroke phase
    const maxAngleDrawn = ensoOpenness * Math.PI * 2;

    for (let i = 0; i < segmentCount; i++) {
      const angle = segmentStep * i;

      // Skip segments beyond what has been "drawn" so far
      if (angle > maxAngleDrawn) break;

      // Skip segments that fall in the gap
      if (isInGap(angle)) continue;

      const segX = cx + Math.cos(angle) * ensoRadius;
      const segY = cy + Math.sin(angle) * ensoRadius;
      const segRadius = 2.0 + rng() * 0.8; // slight variation in disc size

      // Brush pressure affects opacity (thicker = more opaque)
      const pressureVariation = 0.8 + rng() * 0.4; // 0.8-1.2
      const segOpacity = 0.4 * brushPressure * pressureVariation * ensoOpenness;

      elements.push({
        shape: { type: "disc", radius: segRadius },
        position: { x: segX, y: segY },
        rotation: 0,
        scale: 1,
        color: colorSet.dark,
        opacity: Math.min(segOpacity, 0.7),
        zOffset: 0.5,
      });

      // Add a slightly lighter outer halo on some segments for ink bleed
      if (rng() > 0.6) {
        elements.push({
          shape: { type: "disc", radius: segRadius * 1.4 },
          position: { x: segX + (rng() - 0.5) * 0.5, y: segY + (rng() - 0.5) * 0.5 },
          rotation: 0,
          scale: 1,
          color: colorSet.mid,
          opacity: segOpacity * 0.3,
          zOffset: 0.3,
        });
      }
    }
  }

  // === BRUSH SPLASH DOTS ===
  // Scattered around the enso, varying sizes (ink splatters)
  if (openness > 0.4) {
    const splashOpenness = Math.min(1, (openness - 0.4) / 0.5);
    // More splash dots appear in the "settle" keyframe
    const isSettling = ctx.keyframeName === "settle";
    const splashCount = isSettling
      ? Math.floor(8 + brushPressure * 6)
      : Math.floor(3 + brushPressure * 4);

    for (let i = 0; i < splashCount; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = (ensoRadius * 0.3 + rng() * ensoRadius * 0.9) * splashOpenness;
      const dotRadius = 0.3 + rng() * 0.7;

      elements.push({
        shape: { type: "dot", radius: dotRadius },
        position: {
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
        },
        rotation: 0,
        scale: splashOpenness,
        color: rng() > 0.5 ? colorSet.dark : colorSet.mid,
        opacity: (0.2 + rng() * 0.3) * brushPressure * splashOpenness,
        zOffset: 1.0 + rng() * 0.5,
      });
    }
  }

  // === SPIRIT EYE ===
  // Two small dots near center suggesting a face/presence
  if (openness > 0.7) {
    const eyeOpenness = Math.min(1, (openness - 0.7) / 0.3);
    const eyeSpacing = 3;
    const eyeY = cy - 1;

    // Left eye
    elements.push({
      shape: { type: "dot", radius: 0.5 },
      position: { x: cx - eyeSpacing, y: eyeY },
      rotation: 0,
      scale: eyeOpenness,
      color: colorSet.dark,
      opacity: 0.5 * eyeOpenness * brushPressure,
      zOffset: 2.0,
    });

    // Right eye
    elements.push({
      shape: { type: "dot", radius: 0.5 },
      position: { x: cx + eyeSpacing, y: eyeY },
      rotation: 0,
      scale: eyeOpenness,
      color: colorSet.dark,
      opacity: 0.5 * eyeOpenness * brushPressure,
      zOffset: 2.0,
    });
  }

  return elements;
}

export const wcSumiSpirit: PlantVariant = {
  id: "wc-sumi-spirit",
  name: "Watercolor Sumi Spirit",
  description:
    "A sumi-e ink wash spirit formed as an enso circle with a quantum-determined gap, its completeness collapsing from superposition upon observation like the Zen circle itself",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  // Path A: custom Python circuit encodes all visual properties directly.
  // The wc_sumi_spirit circuit maps qubit measurements to
  // completeness, gapAngle, and brushPressure in its extra dict.
  circuitId: "wc_sumi_spirit",
  sandboxControls: [
    {
      key: "completeness",
      label: "Completeness",
      min: 0.5,
      max: 1.0,
      step: 0.05,
      default: 0.8,
    },
    {
      key: "gapAngle",
      label: "Gap Angle",
      min: 0,
      max: 6.28,
      step: 0.1,
      default: 1.57,
    },
    {
      key: "brushPressure",
      label: "Brush Pressure",
      min: 0.3,
      max: 1.0,
      step: 0.05,
      default: 0.65,
    },
  ],
  colorVariations: [
    {
      name: "ink",
      weight: 1.0,
      palettes: { bloom: ["#2A2A2A", "#4A4A4A", "#8A8A8A"] },
    },
    {
      name: "warm-ink",
      weight: 0.6,
      palettes: { bloom: ["#3A3028", "#5A5048", "#9A8878"] },
    },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "void", duration: 5 },
      { name: "stroke", duration: 20 },
      { name: "enso", duration: 40 },
      { name: "settle", duration: 15 },
    ],
    wcEffect: {
      layers: 3,
      opacity: 0.55,
      spread: 0.04,
      colorVariation: 0.02,
    },
    buildElements: buildWcSumiSpiritElements,
  },
};
