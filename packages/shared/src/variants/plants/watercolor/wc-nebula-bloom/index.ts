/**
 * Watercolor Nebula Bloom
 *
 * A cosmic nebula rendered as large overlapping diffuse discs of varying
 * sizes creating cloud-like formations, with scattered small particle dots
 * throughout. Very ethereal and gaseous. Maximum spread, low opacity for
 * a dreamlike effect.
 *
 * Category: watercolor (cosmic flora)
 * Rarity: 0.03
 * Render mode: watercolor
 * Path B: variational circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { buildDiscCluster, createRng, traitOr } from "../_helpers";

function buildWcNebulaBloomElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const cloudDensity = traitOr(ctx.traits, "cloudDensity", 5);
  const particleCount = traitOr(ctx.traits, "particleCount", 12);
  const bloomRadius = traitOr(ctx.traits, "bloomRadius", 1.0);

  // ── Lifecycle openness ──────────────────────────────────────────────
  let openness: number;
  const kf = ctx.keyframeName;
  if (kf === "void") {
    openness = 0;
  } else if (kf === "forming") {
    openness = ctx.keyframeProgress * 0.5;
  } else if (kf === "nebula") {
    openness = 0.5 + ctx.keyframeProgress * 0.5;
  } else {
    // radiance
    openness = 1.0;
  }

  if (openness <= 0) return elements;

  const cx = 32;
  const cy = 30;

  // ── Nebula cloud colors ─────────────────────────────────────────────
  const nebulaColors = ["#7060A8", "#A870B8", "#5868C0"];

  // ── Large diffuse cloud discs ───────────────────────────────────────
  // Positions spread around the center in a roughly circular arrangement
  const cloudPositions: [number, number][] = [
    [0, 0], // center
    [-8, -4], // upper left
    [8, -3], // upper right
    [-5, 5], // lower left
    [6, 6], // lower right
    [0, -8], // top
    [-10, 1], // far left
    [10, 0], // far right
  ];

  for (let i = 0; i < Math.min(cloudDensity + 2, cloudPositions.length); i++) {
    const pos = cloudPositions[i]!;
    const radius = (5 + rng() * 7) * bloomRadius * openness;
    const color = nebulaColors[i % nebulaColors.length]!;

    elements.push({
      shape: { type: "disc", radius },
      position: {
        x: cx + pos[0] * bloomRadius + (rng() - 0.5) * 3,
        y: cy + pos[1] * bloomRadius + (rng() - 0.5) * 3,
      },
      rotation: 0,
      scale: 1,
      color,
      opacity: 0.2 + rng() * 0.15,
      zOffset: 0.3 + i * 0.08,
    });
  }

  // ── Secondary cloud layers (smaller, offset) ───────────────────────
  // Additional overlapping discs for depth
  for (let i = 0; i < cloudDensity; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * 10 * bloomRadius;
    const radius = (3 + rng() * 5) * bloomRadius * openness;
    const color = nebulaColors[Math.floor(rng() * nebulaColors.length)]!;

    elements.push({
      shape: { type: "disc", radius },
      position: {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
      },
      rotation: 0,
      scale: 1,
      color,
      opacity: 0.2 + rng() * 0.1,
      zOffset: 0.6 + i * 0.05,
    });
  }

  // ── Scattered particle dots ─────────────────────────────────────────
  // Tiny dots throughout the nebula for starfield/particle effect
  for (let i = 0; i < particleCount; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * 14 * bloomRadius;
    const dotRadius = 0.2 + rng() * 0.5;

    elements.push({
      shape: { type: "dot", radius: dotRadius },
      position: {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
      },
      rotation: 0,
      scale: openness,
      color: nebulaColors[Math.floor(rng() * nebulaColors.length)]!,
      opacity: 0.3 + rng() * 0.3,
      zOffset: 1.2 + rng() * 0.3,
    });
  }

  // ── Dense inner core cluster ────────────────────────────────────────
  // A tighter cluster of small discs at the heart of the nebula
  buildDiscCluster(
    elements,
    cx,
    cy,
    Math.floor(cloudDensity * 0.6) + 1,
    [2, 4],
    5 * bloomRadius,
    nebulaColors[1]!,
    0.25 * openness,
    0.9,
    rng
  );

  // ── Radiance glow particles (only in radiance keyframe) ─────────────
  if (kf === "radiance") {
    const glowCount = Math.floor(particleCount * 0.6);
    for (let i = 0; i < glowCount; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * 16 * bloomRadius;
      const dotRadius = 0.4 + rng() * 0.8;

      elements.push({
        shape: { type: "dot", radius: dotRadius },
        position: {
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
        },
        rotation: 0,
        scale: 1,
        color: "#D0C0E8",
        opacity: 0.45 + rng() * 0.25,
        zOffset: 1.8 + rng() * 0.2,
      });
    }
  }

  return elements;
}

export const wcNebulaBloom: PlantVariant = {
  id: "wc-nebula-bloom",
  name: "Nebula Bloom",
  description:
    "A cosmic nebula of overlapping diffuse clouds and scattered particles, painted in ethereal watercolor washes",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "variational",
  quantumMapping: {
    schema: {
      cloudDensity: { signal: "spread", range: [3, 7], default: 5, round: true },
      particleCount: { signal: "entropy", range: [8, 20], default: 12, round: true },
      bloomRadius: { signal: "growth", range: [0.7, 1.3], default: 1.0 },
    },
  },
  colorVariations: [
    { name: "cosmic", weight: 1.0, palettes: { nebula: ["#7060A8", "#A870B8", "#5868C0"] } },
    { name: "rosette", weight: 0.7, palettes: { nebula: ["#C070A0", "#D88898", "#A05888"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "void", duration: 5 },
      { name: "forming", duration: 20 },
      { name: "nebula", duration: 40 },
      { name: "radiance", duration: 15 },
    ],
    wcEffect: { layers: 4, opacity: 0.38, spread: 0.1, colorVariation: 0.08 },
    buildElements: buildWcNebulaBloomElements,
  },
};
