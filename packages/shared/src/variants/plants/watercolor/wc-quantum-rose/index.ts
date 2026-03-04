/**
 * Watercolor Quantum Rose
 *
 * Nested rose petal layers: tight inner petals with high roundness (0.85)
 * spiraling inward, open outer petals with moderate roundness (0.6)
 * spreading outward. A stem with thorn-like leaves. The inner/outer petal
 * count has a conservation relationship (more inner = fewer outer, and
 * vice versa), encoded via CNOT + X anti-correlation in the quantum circuit.
 *
 * Category: watercolor (flowers)
 * Rarity: 0.03
 * Render mode: watercolor
 * Path A: custom Python circuit (wc_quantum_rose) — no quantumMapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { buildStem, createRng, radialPositions, traitOr } from "../_helpers";

/**
 * Color sets for the quantum rose, keyed by color variation name.
 */
const ROSE_COLORS: Record<string, { petal: string; inner: string; stem: string }> = {
  crimson: { petal: "#C83848", inner: "#E86878", stem: "#5A7A4A" },
  ivory: { petal: "#F0E8D8", inner: "#E8D8C8", stem: "#5A7A4A" },
  pink: { petal: "#E8A0B0", inner: "#F0C0D0", stem: "#5A7A4A" },
};

const DEFAULT_COLORS = ROSE_COLORS["crimson"]!;

/**
 * Get rose-specific openness for lifecycle keyframes.
 * bud -> unfurl -> rose -> wilt
 */
function getRoseOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "bud":
      return 0.05 + progress * 0.05; // 0.05 -> 0.10 (tight cluster)
    case "unfurl":
      return 0.1 + progress * 0.4; // 0.10 -> 0.50 (outer petals spread)
    case "rose":
      return 0.5 + progress * 0.5; // 0.50 -> 1.00 (full bloom)
    case "wilt":
      return 1.0 - progress * 0.25; // 1.00 -> 0.75 (slight closing)
    default:
      return 0.5;
  }
}

/**
 * Builder function for the Watercolor Quantum Rose variant.
 *
 * Creates a rose with nested petal layers, a stem with thorn-like leaves,
 * and a center disc with dot accents. Inner/outer petal counts are
 * anti-correlated (conservation) via the quantum circuit.
 *
 * Visual design:
 * - Stem from bottom with slight curve (buildStem)
 * - Thorn leaves along stem (small pointed leaf shapes angled sharply)
 * - Outer petals: arranged radially, wide and open (roundness 0.6)
 * - Inner petals: smaller, tighter, overlapping (roundness 0.85), spiraled
 * - Center disc (stamens)
 * - Dot accents in center
 */
function buildWcQuantumRoseElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  // Path A: read properties from Python circuit's extra dict (via plant.traits).
  // Fallback values for unobserved plants (ctx.traits is null).
  const innerPetals = traitOr(ctx.traits, "innerPetals", 5);
  const outerPetals = traitOr(ctx.traits, "outerPetals", 6);
  const unfurlDepth = traitOr(ctx.traits, "unfurlDepth", 0.65);
  const thornDensity = traitOr(ctx.traits, "thornDensity", 2);

  // Color selection
  const colorSet =
    (ctx.colorVariationName ? ROSE_COLORS[ctx.colorVariationName] : null) ??
    (ctx.traits?.colorPalette
      ? {
          petal: ctx.traits.colorPalette[0] ?? DEFAULT_COLORS.petal,
          inner: ctx.traits.colorPalette[1] ?? DEFAULT_COLORS.inner,
          stem: ctx.traits.colorPalette[2] ?? DEFAULT_COLORS.stem,
        }
      : DEFAULT_COLORS);

  // Lifecycle-driven openness
  const openness = getRoseOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const cx = 32;
  const bloomCenterY = 22;
  const stemBottomY = 58;
  const stemTopY = 30;

  // === STEM ===
  // Visible from bud stage onward, with a gentle curve
  if (openness > 0.05) {
    const stemOpenness = Math.min(1, openness / 0.3);
    buildStem(
      elements,
      cx,
      stemBottomY,
      cx,
      stemTopY,
      0.3, // curvature
      1.0 + stemOpenness * 0.3, // thickness
      colorSet.stem,
      0.5 * stemOpenness,
      rng
    );
  }

  // === THORN LEAVES ===
  // Small pointed leaf shapes along the stem, angled sharply outward
  if (openness > 0.15) {
    const thornOpenness = Math.min(1, (openness - 0.15) / 0.35);
    const thornCount = Math.round(thornDensity);

    for (let i = 0; i < thornCount; i++) {
      const t = (i + 0.5) / thornCount; // distribute along stem
      const thornY = stemBottomY + (stemTopY - stemBottomY) * t;
      const side = i % 2 === 0 ? -1 : 1; // alternate sides
      const thornAngle = side * (Math.PI * 0.3 + rng() * 0.2);

      elements.push({
        shape: {
          type: "petal",
          width: 1.5 * thornOpenness,
          length: 3.5 * thornOpenness,
          roundness: 0.3, // pointed thorn shape
        },
        position: { x: cx + side * 1.5, y: thornY },
        rotation: thornAngle,
        scale: thornOpenness,
        color: colorSet.stem,
        opacity: 0.45 * thornOpenness,
        zOffset: 0.2,
      });
    }
  }

  // === OUTER PETALS ===
  // Wide, open petals arranged radially (roundness 0.6)
  if (openness > 0.2) {
    const outerOpenness = Math.min(1, (openness - 0.2) / 0.5) * unfurlDepth;
    const outerRadius = 8 * outerOpenness;
    const outerPositions = radialPositions(cx, bloomCenterY, outerRadius, outerPetals, 0);

    for (let i = 0; i < outerPositions.length; i++) {
      const pos = outerPositions[i]!;
      const pw = (5 + rng() * 1.5) * outerOpenness;
      const pl = (10 + rng() * 2) * outerOpenness;

      elements.push({
        shape: {
          type: "petal",
          width: pw,
          length: pl,
          roundness: 0.6,
        },
        position: { x: cx, y: bloomCenterY },
        rotation: pos.angle + rng() * 0.1,
        scale: 1.0,
        color: colorSet.petal,
        opacity: 0.45 * outerOpenness,
        zOffset: 0.5,
      });
    }
  }

  // === INNER PETALS ===
  // Smaller, tighter, overlapping petals (roundness 0.85), slightly rotated for spiral
  if (openness > 0.35) {
    const innerOpenness = Math.min(1, (openness - 0.35) / 0.5);
    const innerRadius = 4 * innerOpenness;
    // Offset by half-step from outer petals for layered look
    const innerOffset = Math.PI / innerPetals;
    const innerPositions = radialPositions(cx, bloomCenterY, innerRadius, innerPetals, innerOffset);

    for (let i = 0; i < innerPositions.length; i++) {
      const pos = innerPositions[i]!;
      const pw = (3.5 + rng() * 1) * innerOpenness;
      const pl = (6 + rng() * 1.5) * innerOpenness;
      // Slight spiral offset: each petal rotated inward a bit more
      const spiralOffset = i * 0.08;

      elements.push({
        shape: {
          type: "petal",
          width: pw,
          length: pl,
          roundness: 0.85,
        },
        position: { x: cx, y: bloomCenterY },
        rotation: pos.angle + spiralOffset + rng() * 0.06,
        scale: 1.0,
        color: colorSet.inner,
        opacity: 0.5 * innerOpenness,
        zOffset: 1.0,
      });
    }
  }

  // === CENTER DISC (stamens) ===
  if (openness > 0.5) {
    const centerOpenness = Math.min(1, (openness - 0.5) / 0.4);
    const discRadius = 2.5 * centerOpenness;

    elements.push({
      shape: { type: "disc", radius: discRadius },
      position: { x: cx, y: bloomCenterY },
      rotation: 0,
      scale: 1,
      color: colorSet.inner,
      opacity: 0.55 * centerOpenness,
      zOffset: 1.8,
    });

    // === DOT ACCENTS ===
    // Small dots scattered in the center disc area
    if (centerOpenness > 0.3) {
      const dotCount = 4 + Math.floor(rng() * 3);

      for (let i = 0; i < dotCount; i++) {
        const angle = rng() * Math.PI * 2;
        const dist = rng() * discRadius * 0.8;
        const dotRadius = 0.2 + rng() * 0.25;

        elements.push({
          shape: { type: "dot", radius: dotRadius },
          position: {
            x: cx + Math.cos(angle) * dist,
            y: bloomCenterY + Math.sin(angle) * dist,
          },
          rotation: 0,
          scale: 1,
          color: colorSet.petal,
          opacity: 0.35 + rng() * 0.25,
          zOffset: 2.0,
        });
      }
    }
  }

  return elements;
}

export const wcQuantumRose: PlantVariant = {
  id: "wc-quantum-rose",
  name: "Quantum Rose",
  description:
    "A rose with nested petal layers whose inner and outer counts are anti-correlated through quantum conservation, with thorn-studded stems and spiraling inner petals",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  // Path A: custom Python circuit encodes all visual properties directly.
  // The wc_quantum_rose circuit maps qubit measurements to
  // innerPetals, outerPetals, unfurlDepth, and thornDensity in its extra dict.
  circuitId: "wc_quantum_rose",
  sandboxControls: [
    { key: "innerPetals", label: "Inner Petals", min: 3, max: 6, step: 1, default: 5 },
    { key: "outerPetals", label: "Outer Petals", min: 4, max: 8, step: 1, default: 6 },
    { key: "unfurlDepth", label: "Unfurl Depth", min: 0.3, max: 1.0, step: 0.05, default: 0.65 },
    { key: "thornDensity", label: "Thorn Density", min: 1, max: 4, step: 1, default: 2 },
  ],
  colorVariations: [
    {
      name: "crimson",
      weight: 1.0,
      palettes: { bloom: ["#C83848", "#E86878", "#5A7A4A"] },
    },
    {
      name: "ivory",
      weight: 0.7,
      palettes: { bloom: ["#F0E8D8", "#E8D8C8", "#5A7A4A"] },
    },
    {
      name: "pink",
      weight: 0.8,
      palettes: { bloom: ["#E8A0B0", "#F0C0D0", "#5A7A4A"] },
    },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 8 },
      { name: "unfurl", duration: 20 },
      { name: "rose", duration: 40 },
      { name: "wilt", duration: 15 },
    ],
    wcEffect: {
      layers: 3,
      opacity: 0.5,
      spread: 0.05,
      colorVariation: 0.04,
    },
    buildElements: buildWcQuantumRoseElements,
  },
};
