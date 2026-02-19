/**
 * Plant Variant Definitions
 *
 * This is the single source of truth for all plant variants.
 * Each variant defines its lifecycle keyframes, colors, and behavior.
 *
 * To add a new variant:
 * 1. Define the variant object following the PlantVariant interface
 * 2. Add it to the PLANT_VARIANTS array
 * 3. The variant will automatically be available in the sandbox
 *
 * Color approach:
 * - Fixed-color variants: Define palette in each keyframe
 * - Multi-color variants: Define colorVariations with palette overrides
 *
 * Pattern approach:
 * - All patterns are 64x64 grids for high visual quality
 * - Use pattern-builder utilities for creating patterns programmatically
 *
 * See docs/variants-and-lifecycle.md for full documentation.
 */

import type {
  PlantVariant,
  VectorPrimitive,
  WatercolorBuildContext,
  WatercolorElement,
} from "./types";
import {
  createEmptyPattern,
  drawCircle,
  drawEllipse,
  drawRect,
  drawRing,
  drawPetal,
  drawGrassBlade,
  scatterDots,
  mirrorHorizontal,
  drawStar,
  drawSpiral,
  drawDots,
  drawGlowRing,
  drawSmoothRadialBurst,
  drawBrushArc,
  drawInkSplatter,
  drawCircleOutline,
  drawDiamondOutline,
  drawPolygonOutline,
  drawConcentricCircles,
  drawRadialLines,
  drawStarOutline,
  drawLine,
  PATTERN_SIZE,
} from "../patterns/pattern-builder";
import {
  vectorCircle,
  vectorLine,
  vectorPolygon,
  vectorStar,
  vectorDiamond,
  vectorArc,
  vectorBezier,
  vectorSpiral,
  vectorConcentricCircles,
  vectorRadialLines,
  vectorFlowerOfLife,
  VECTOR_CENTER,
} from "../patterns/vector-builder";

// ============================================================================
// PATTERN GENERATORS
// ============================================================================

/**
 * Generate patterns for Simple Bloom lifecycle
 */
function createSimpleBloomPatterns() {
  // Bud: small gathering energy
  const bud = createEmptyPattern();
  // Soft cluster center
  drawCircle(bud, 32, 26, 6);
  // Few potential dots
  scatterDots(bud, 6, 1, 2, 101);
  // Thin stem
  drawRect(bud, 30, 32, 33, 52);

  // Sprout: first rays emerge
  const sprout = createEmptyPattern();
  // Growing center
  drawCircle(sprout, 32, 22, 7);
  // Smooth tapered rays (less jagged)
  drawSmoothRadialBurst(sprout, 32, 22, 8, 11, 3, 0.5, 22.5);
  // Small leaves
  drawPetal(sprout, 24, 38, 30, 42, 5);
  drawPetal(sprout, 40, 38, 34, 42, 5);
  // Thicker stem
  drawRect(sprout, 30, 28, 34, 54);

  // Bloom: sakura-inspired cherry blossom
  const bloom = createEmptyPattern();
  const bloomCenter = 22;
  // Central star
  drawStar(bloom, 32, bloomCenter, 5, 7, 3, 0);
  drawCircle(bloom, 32, bloomCenter, 3);
  // 5 rounded petals (cherry blossom style)
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const tipX = 32 + Math.cos(angle) * 20;
    const tipY = bloomCenter + Math.sin(angle) * 20;
    const baseX = 32 + Math.cos(angle) * 8;
    const baseY = bloomCenter + Math.sin(angle) * 8;
    drawPetal(bloom, tipX, tipY, baseX, baseY, 10);
  }
  // Delicate stamens
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2 + Math.PI / 10;
    const x = 32 + Math.cos(angle) * 5;
    const y = bloomCenter + Math.sin(angle) * 5;
    drawCircle(bloom, Math.round(x), Math.round(y), 1.5);
  }
  // Soft glow
  drawGlowRing(bloom, 32, bloomCenter, 24, 2);
  // Stem
  drawRect(bloom, 30, 30, 34, 56);

  // Fade: gentle cascade
  const fade = createEmptyPattern();
  // Smaller center
  drawCircle(fade, 32, 26, 5);
  // Fewer drooping petals (more elegant)
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI + Math.PI / 5;
    const tipX = 32 + Math.cos(angle) * 16;
    const tipY = 26 + Math.sin(angle) * 14 + 6; // Droop
    drawPetal(fade, tipX, tipY, 32, 26, 5);
  }
  // Shorter stem
  drawRect(fade, 30, 32, 33, 50);

  return { bud, sprout, bloom, fade };
}

/**
 * Generate patterns for Quantum Tulip lifecycle
 */
function createQuantumTulipPatterns() {
  // Bulb: underground potential
  const bulb = createEmptyPattern();
  drawEllipse(bulb, 32, 40, 10, 14);
  // Faint energy spiral
  drawSpiral(bulb, 32, 40, 2, 7, 0.4, 1);
  drawRect(bulb, 30, 26, 33, 32);

  // Stem: rising energy
  const stem = createEmptyPattern();
  drawRect(stem, 30, 14, 33, 56);
  // Elegant leaf pair
  drawPetal(stem, 22, 48, 29, 44, 5);
  drawPetal(stem, 42, 48, 35, 44, 5);
  // Subtle energy
  drawDots(
    stem,
    [
      { x: 30, y: 38 },
      { x: 34, y: 38 },
    ],
    1
  );

  // Bloom: orchid-inspired exotic flower
  const bloom = createEmptyPattern();
  const bloomY = 20;
  // Delicate center
  drawCircle(bloom, 32, bloomY, 4);
  drawStar(bloom, 32, bloomY, 4, 6, 3, 0);
  // Top two petals (orchid upper petals)
  for (let i = 0; i < 2; i++) {
    const angle = -Math.PI / 2 + ((i - 0.5) * Math.PI) / 3.5;
    const tipX = 32 + Math.cos(angle) * 20;
    const tipY = bloomY + Math.sin(angle) * 17;
    const baseX = 32 + Math.cos(angle) * 8;
    const baseY = bloomY + Math.sin(angle) * 8;
    drawPetal(bloom, tipX, tipY, baseX, baseY, 9);
  }
  // Bottom lip petal (orchid signature large bottom petal)
  drawPetal(bloom, 32, bloomY + 22, 32, bloomY + 8, 13);
  // Side petals (smaller)
  drawPetal(bloom, 32 - 16, bloomY + 4, 32 - 7, bloomY, 6);
  drawPetal(bloom, 32 + 16, bloomY + 4, 32 + 7, bloomY, 6);
  // Elegant glow
  drawGlowRing(bloom, 32, bloomY + 8, 24, 2);
  // Stem
  drawRect(bloom, 30, 30, 33, 56);

  // Wilt: gentle droop
  const wilt = createEmptyPattern();
  // Softer drooping petals
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI + Math.PI / 5;
    const tipX = 24 + Math.cos(angle) * 14;
    const tipY = 24 + Math.sin(angle) * 12 + 6; // Droop
    drawPetal(wilt, tipX, tipY, 26, 24, 6);
  }
  // Curved stem
  drawRect(wilt, 28, 28, 31, 36);
  drawRect(wilt, 30, 34, 33, 56);

  return { bulb, stem, bloom, wilt };
}

/**
 * Generate patterns for Soft Moss lifecycle
 */
function createSoftMossPatterns() {
  // Emerging: nebula-inspired delicate spore cloud
  const emerging = createEmptyPattern();
  // Diffuse center
  drawCircle(emerging, 32, 32, 6);
  // Inner glow ring (nebula core)
  drawGlowRing(emerging, 32, 32, 10, 2);
  // Mid-layer soft cloud
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const radius = 12 + Math.sin(i * 0.7) * 3;
    const x = 32 + Math.cos(angle) * radius;
    const y = 32 + Math.sin(angle) * radius;
    drawCircle(emerging, Math.round(x), Math.round(y), 2 + Math.sin(i * 1.3));
  }
  // Scattered spores (outer diffusion)
  const sporeCount = 16;
  for (let i = 0; i < sporeCount; i++) {
    const angle = (i / sporeCount) * Math.PI * 2 + Math.sin(i * 0.5) * 0.3;
    const radius = 16 + Math.cos(i * 0.8) * 4;
    const x = 32 + Math.cos(angle) * radius;
    const y = 32 + Math.sin(angle) * radius;
    drawCircle(emerging, Math.round(x), Math.round(y), 1.5);
  }
  // Outer haze
  drawGlowRing(emerging, 32, 32, 20, 1);

  // Settled: full nebula spread
  const settled = createEmptyPattern();
  // Dense center cluster
  drawCircle(settled, 32, 32, 8);
  drawGlowRing(settled, 32, 32, 12, 3);
  // Multiple organic cloud formations
  const cloudPositions = [
    { x: 24, y: 24, r: 6 },
    { x: 40, y: 26, r: 5 },
    { x: 28, y: 38, r: 7 },
    { x: 38, y: 40, r: 6 },
    { x: 20, y: 36, r: 4 },
    { x: 44, y: 34, r: 5 },
  ];
  cloudPositions.forEach(({ x, y, r }) => {
    drawCircle(settled, x, y, r);
    drawGlowRing(settled, x, y, r + 3, 1);
  });
  // Connecting wisps (24 organic connection points)
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const radius = 18 + Math.sin(i * 0.6) * 5;
    const x = 32 + Math.cos(angle) * radius;
    const y = 32 + Math.sin(angle) * radius;
    drawCircle(settled, Math.round(x), Math.round(y), 1.5 + Math.sin(i * 0.9) * 0.5);
  }
  // Outer diffusion
  drawGlowRing(settled, 32, 32, 26, 2);

  return { emerging, settled };
}

/**
 * Generate patterns for Pebble Patch
 */
function createPebblePatchPatterns() {
  const stones = createEmptyPattern();
  // Crystal-inspired geometric stones with faceted appearance

  // Large central crystal cluster
  const center = { x: 32, y: 32 };
  drawCircle(stones, center.x, center.y, 5);
  // 6-pointed star (crystal structure)
  drawStar(stones, center.x, center.y, 6, 8, 4, 0);

  // Surrounding crystal formations (8 positions)
  const crystalFormations = [
    { x: 14, y: 18, size: 5, points: 5 },
    { x: 48, y: 14, size: 6, points: 4 },
    { x: 24, y: 40, size: 4, points: 6 },
    { x: 54, y: 46, size: 5, points: 5 },
    { x: 12, y: 50, size: 6, points: 4 },
    { x: 42, y: 30, size: 4, points: 5 },
    { x: 8, y: 34, size: 3, points: 6 },
    { x: 56, y: 26, size: 5, points: 4 },
  ];

  crystalFormations.forEach(({ x, y, size, points }) => {
    // Core
    drawCircle(stones, x, y, size);
    // Faceted edges
    drawStar(stones, x, y, points, size + 2, Math.floor(size * 0.6), 0);
    // Inner detail
    if (size > 4) {
      drawCircle(stones, x, y, Math.floor(size * 0.4));
    }
  });

  // Small crystal shards scattered between
  const shards = [
    { x: 20, y: 26, r: 2 },
    { x: 38, y: 22, r: 2 },
    { x: 30, y: 50, r: 2 },
    { x: 46, y: 38, r: 2 },
    { x: 18, y: 42, r: 2 },
  ];
  shards.forEach(({ x, y, r }) => {
    drawStar(stones, x, y, 4, r + 1, r, 0);
  });

  return { stones };
}

/**
 * Generate patterns for Meadow Tuft
 */
function createMeadowTuftPatterns() {
  // Sway left: vortex-inspired flowing grass motion
  const swayLeft = createEmptyPattern();
  const baseY = 56;
  const baseX = 32;

  // Base clump with subtle vortex pattern
  drawEllipse(swayLeft, baseX, baseY, 14, 6);
  drawCircle(swayLeft, baseX, baseY - 2, 8);

  // Curved grass blades following vortex flow (left lean)
  // Inner spiral blades (tighter curve)
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI - Math.PI / 2;
    const startX = baseX + Math.cos(angle) * 6;
    const startY = baseY - 4;
    const height = 28 + i * 2;
    const curve = -0.5 - i * 0.08;
    drawGrassBlade(swayLeft, Math.round(startX), Math.round(startY), height, curve, 2);
  }

  // Outer spiral blades (wider curve)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI - Math.PI / 2 + Math.PI / 8;
    const startX = baseX + Math.cos(angle) * 10;
    const startY = baseY - 2;
    const height = 32 + i * 2;
    const curve = -0.35 - i * 0.05;
    drawGrassBlade(swayLeft, Math.round(startX), Math.round(startY), height, curve, 3);
  }

  // Accent blades (flowing ribbons)
  drawGrassBlade(swayLeft, baseX - 8, baseY - 3, 36, -0.6, 2);
  drawGrassBlade(swayLeft, baseX + 8, baseY - 3, 30, -0.3, 2);

  // Sway right: vortex-inspired flowing grass motion (mirrored)
  const swayRight = createEmptyPattern();

  // Base clump
  drawEllipse(swayRight, baseX, baseY, 14, 6);
  drawCircle(swayRight, baseX, baseY - 2, 8);

  // Curved grass blades following vortex flow (right lean)
  // Inner spiral blades
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI - Math.PI / 2;
    const startX = baseX - Math.cos(angle) * 6; // Mirrored X
    const startY = baseY - 4;
    const height = 28 + i * 2;
    const curve = 0.5 + i * 0.08; // Positive curve for right
    drawGrassBlade(swayRight, Math.round(startX), Math.round(startY), height, curve, 2);
  }

  // Outer spiral blades
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI - Math.PI / 2 + Math.PI / 8;
    const startX = baseX - Math.cos(angle) * 10; // Mirrored X
    const startY = baseY - 2;
    const height = 32 + i * 2;
    const curve = 0.35 + i * 0.05; // Positive curve for right
    drawGrassBlade(swayRight, Math.round(startX), Math.round(startY), height, curve, 3);
  }

  // Accent blades
  drawGrassBlade(swayRight, baseX + 8, baseY - 3, 36, 0.6, 2);
  drawGrassBlade(swayRight, baseX - 8, baseY - 3, 30, 0.3, 2);

  return { swayLeft, swayRight };
}

/**
 * Generate patterns for Whisper Reed
 */
function createWhisperReedPatterns() {
  // Lean left: aurora-inspired flowing reeds with wave patterns
  const leanLeft = createEmptyPattern();
  const baseY = 60;

  // Main reeds with flowing aurora curves (left lean)
  const reedPositions = [
    { x: 20, height: 52, curve: -0.35, width: 2 },
    { x: 28, height: 56, curve: -0.28, width: 2 },
    { x: 36, height: 54, curve: -0.32, width: 2 },
    { x: 44, height: 50, curve: -0.38, width: 2 },
  ];

  reedPositions.forEach(({ x, height, curve, width }) => {
    drawGrassBlade(leanLeft, x, baseY, height, curve, width);
  });

  // Delicate accent reeds (thinner, more curved)
  drawGrassBlade(leanLeft, 24, baseY - 2, 48, -0.42, 1.5);
  drawGrassBlade(leanLeft, 32, baseY - 2, 52, -0.3, 1.5);
  drawGrassBlade(leanLeft, 40, baseY - 2, 46, -0.45, 1.5);

  // Aurora-inspired seed heads (flowing arrangement)
  const seedHeads = [
    { x: 8, y: 8, r: 3.5 },
    { x: 16, y: 4, r: 3 },
    { x: 24, y: 6, r: 3.5 },
    { x: 32, y: 10, r: 3 },
    { x: 18, y: 12, r: 2.5 },
  ];

  seedHeads.forEach(({ x, y, r }) => {
    drawCircle(leanLeft, x, y, r);
    // Subtle glow around seed heads
    drawGlowRing(leanLeft, x, y, r + 2, 1);
  });

  // Connecting flow lines (subtle aurora wave effect)
  for (let i = 0; i < 3; i++) {
    const startX = 20 + i * 8;
    const startY = baseY - 10 - i * 8;
    drawGlowRing(leanLeft, startX, startY, 4, 1);
  }

  // Lean right: aurora-inspired flowing reeds (mirrored)
  const leanRight = createEmptyPattern();

  // Main reeds with flowing aurora curves (right lean)
  const reedPositionsRight = [
    { x: 44, height: 52, curve: 0.35, width: 2 },
    { x: 36, height: 56, curve: 0.28, width: 2 },
    { x: 28, height: 54, curve: 0.32, width: 2 },
    { x: 20, height: 50, curve: 0.38, width: 2 },
  ];

  reedPositionsRight.forEach(({ x, height, curve, width }) => {
    drawGrassBlade(leanRight, x, baseY, height, curve, width);
  });

  // Delicate accent reeds
  drawGrassBlade(leanRight, 40, baseY - 2, 48, 0.42, 1.5);
  drawGrassBlade(leanRight, 32, baseY - 2, 52, 0.3, 1.5);
  drawGrassBlade(leanRight, 24, baseY - 2, 46, 0.45, 1.5);

  // Aurora-inspired seed heads (mirrored)
  const seedHeadsRight = [
    { x: 56, y: 8, r: 3.5 },
    { x: 48, y: 4, r: 3 },
    { x: 40, y: 6, r: 3.5 },
    { x: 32, y: 10, r: 3 },
    { x: 46, y: 12, r: 2.5 },
  ];

  seedHeadsRight.forEach(({ x, y, r }) => {
    drawCircle(leanRight, x, y, r);
    drawGlowRing(leanRight, x, y, r + 2, 1);
  });

  // Connecting flow lines
  for (let i = 0; i < 3; i++) {
    const startX = 44 - i * 8;
    const startY = baseY - 10 - i * 8;
    drawGlowRing(leanRight, startX, startY, 4, 1);
  }

  return { leanLeft, leanRight };
}

/**
 * Generate patterns for Pulsing Orb
 */
function createPulsingOrbPatterns() {
  // Dim: elegant constellation
  const dim = createEmptyPattern();
  // Delicate ring
  drawRing(dim, 32, 32, 19, 21);
  // 4-point star reaching to edges
  drawStar(dim, 32, 32, 4, 27, 16, 0);
  // Corner stars (smaller)
  const dimDots = [
    { x: 12, y: 12 },
    { x: 52, y: 12 },
    { x: 12, y: 52 },
    { x: 52, y: 52 },
  ];
  drawDots(dim, dimDots, 2);

  // Bright: supernova-inspired explosive energy
  const bright = createEmptyPattern();
  // Dense radiating center
  drawCircle(bright, 32, 32, 7);
  drawStar(bright, 32, 32, 12, 10, 5, 0);
  // Inner burst (12 thick rays)
  drawSmoothRadialBurst(bright, 32, 32, 12, 18, 4, 1, 15);
  // Outer burst (12 thin rays)
  drawSmoothRadialBurst(bright, 32, 32, 12, 28, 2, 0.3, 0);
  // Energy rings
  drawGlowRing(bright, 32, 32, 22, 2);
  drawGlowRing(bright, 32, 32, 30, 1);
  // Scattered energy particles
  const particles = [
    { x: 7, y: 32 },
    { x: 57, y: 32 },
    { x: 32, y: 7 },
    { x: 32, y: 57 },
    { x: 16, y: 16 },
    { x: 48, y: 16 },
    { x: 16, y: 48 },
    { x: 48, y: 48 },
  ];
  drawDots(bright, particles, 1.5);

  return { dim, bright };
}

/**
 * Generate patterns for Dewdrop Daisy
 * A daisy-like flower with elegant dandelion-burst aesthetics
 */
function createDewdropDaisyPatterns() {
  // Bud: gentle gathering
  const bud = createEmptyPattern();
  drawCircle(bud, 32, 28, 6);
  scatterDots(bud, 8, 1, 2, 101);
  drawRect(bud, 30, 34, 33, 52);

  // Unfurl: first rays
  const unfurl = createEmptyPattern();
  drawCircle(unfurl, 32, 24, 7);
  // Delicate star
  drawStar(unfurl, 32, 24, 5, 9, 5, 0);
  // Smooth tapered initial rays
  drawSmoothRadialBurst(unfurl, 32, 24, 10, 12, 3, 0.5, 18);
  drawRect(unfurl, 30, 33, 34, 52);

  // Bloom: chrysanthemum-inspired layered petals
  const bloom = createEmptyPattern();
  const bloomY = 24;
  // Central star
  drawStar(bloom, 32, bloomY, 5, 6, 3, 0);
  drawCircle(bloom, 32, bloomY, 4);
  // Three layers of petals (8, 12, 16 petals)
  for (let layer = 0; layer < 3; layer++) {
    const petalCount = 8 + layer * 4;
    const length = 10 + layer * 6;
    const width = 6 - layer * 1.5;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 + (layer * Math.PI) / 24;
      const tipX = 32 + Math.cos(angle) * length;
      const tipY = bloomY + Math.sin(angle) * length;
      const baseX = 32 + Math.cos(angle) * 5;
      const baseY = bloomY + Math.sin(angle) * 5;
      drawPetal(bloom, tipX, tipY, baseX, baseY, width);
    }
  }
  // Soft glow
  drawGlowRing(bloom, 32, bloomY, 24, 2);
  drawRect(bloom, 30, 32, 34, 54);

  // Sparkle: firework-inspired radiant burst
  const sparkle = createEmptyPattern();
  const sparkleY = 24;
  // Bright center
  drawStar(sparkle, 32, sparkleY, 8, 8, 4, 22.5);
  drawCircle(sparkle, 32, sparkleY, 5);
  // Primary burst rays (12 rays)
  drawSmoothRadialBurst(sparkle, 32, sparkleY, 12, 20, 3, 0.5, 15);
  // Secondary sparkle rays (12, between primary)
  drawSmoothRadialBurst(sparkle, 32, sparkleY, 12, 14, 1.5, 0.3, 0);
  // Petals at layer positions
  for (let layer = 0; layer < 2; layer++) {
    const petalCount = 12;
    const length = 16 + layer * 6;
    const width = 4 - layer;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 + (layer * Math.PI) / 24 + Math.PI / 24;
      const tipX = 32 + Math.cos(angle) * length;
      const tipY = sparkleY + Math.sin(angle) * length;
      const baseX = 32 + Math.cos(angle) * (length - 6);
      const baseY = sparkleY + Math.sin(angle) * (length - 6);
      drawPetal(sparkle, tipX, tipY, baseX, baseY, width);
    }
  }
  // Sparkle dots at endpoints
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 16;
    const x = 32 + Math.cos(angle) * 24;
    const y = sparkleY + Math.sin(angle) * 24;
    drawCircle(sparkle, Math.round(x), Math.round(y), 2);
  }
  drawGlowRing(sparkle, 32, sparkleY, 26, 3);
  drawRect(sparkle, 30, 33, 34, 54);

  // Fade: gentle cascade
  const fade = createEmptyPattern();
  drawCircle(fade, 32, 26, 5);
  // Fewer, longer drooping rays
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI + Math.PI / 6;
    const endX = 32 + Math.cos(angle) * 15;
    const endY = 26 + Math.sin(angle) * 14 + 7; // Droop
    drawPetal(fade, endX, endY, 32, 26, 4);
  }
  drawRect(fade, 30, 32, 33, 48);

  return { bud, unfurl, bloom, sparkle, fade };
}

/**
 * Generate patterns for Midnight Poppy
 * A dramatic flower with refined sunburst when open
 */
function createMidnightPoppyPatterns() {
  // Closed: potential energy gathering
  const closed = createEmptyPattern();
  drawEllipse(closed, 32, 24, 8, 12);
  // Subtle glow
  drawGlowRing(closed, 32, 24, 13, 1);
  drawRect(closed, 30, 36, 33, 56);

  // Opening: first rays
  const opening = createEmptyPattern();
  // Center expanding
  drawCircle(opening, 32, 24, 9);
  // Smooth tapered initial rays
  drawSmoothRadialBurst(opening, 32, 24, 8, 16, 4, 1, 22.5);
  // Emerging petals
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const tipX = 32 + Math.cos(angle) * 18;
    const tipY = 24 + Math.sin(angle) * 18;
    drawPetal(opening, tipX, tipY, 32, 24, 8);
  }
  drawRect(opening, 30, 32, 34, 56);

  // Open: hibiscus-inspired dramatic tropical flower
  const open = createEmptyPattern();
  const openY = 26;
  // Prominent center
  drawStar(open, 32, openY, 6, 9, 5, 0);
  drawCircle(open, 32, openY, 6);
  drawCircle(open, 32, openY, 3);
  // 5 large overlapping petals (hibiscus style)
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const tipX = 32 + Math.cos(angle) * 24;
    const tipY = openY + Math.sin(angle) * 24;
    const baseX = 32 + Math.cos(angle) * 10;
    const baseY = openY + Math.sin(angle) * 10;
    drawPetal(open, tipX, tipY, baseX, baseY, 12);
  }
  // Dramatic glow
  drawGlowRing(open, 32, openY, 28, 3);
  // Smooth tapered rays between petals
  drawSmoothRadialBurst(open, 32, openY, 5, 20, 2, 0.5, 36);
  // Thicker stem
  drawRect(open, 30, 36, 34, 58);

  // Closing: gentle retraction with smooth rays
  const closing = createEmptyPattern();
  // Dimmer star
  drawStar(closing, 32, 26, 5, 9, 5, 0);
  // Fewer smooth rays
  drawSmoothRadialBurst(closing, 32, 26, 8, 17, 3, 0.5, 22.5);
  // Petals curling
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const tipX = 32 + Math.cos(angle) * 19;
    const tipY = 26 + Math.sin(angle) * 19;
    drawPetal(closing, tipX, tipY, 32, 26, 9);
  }
  drawRect(closing, 30, 34, 34, 56);

  return { closed, opening, open, closing };
}

/**
 * Generate patterns for Cloud Bush
 * A rounded shrub with elegant mandala structure
 */
function createCloudBushPatterns() {
  // Base: simple foundation
  const base = createEmptyPattern();
  // Central circle
  drawCircle(base, 32, 36, 11);
  // Inner ring (6-fold symmetry)
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = 32 + Math.cos(angle) * 15;
    const y = 36 + Math.sin(angle) * 15;
    drawCircle(base, Math.round(x), Math.round(y), 7);
  }

  // Full: intricate mandala pattern
  const full = createEmptyPattern();
  // Center star
  drawStar(full, 32, 32, 8, 10, 5, 0);
  drawCircle(full, 32, 32, 4);
  // Inner ring of circles
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = 32 + Math.cos(angle) * 12;
    const y = 32 + Math.sin(angle) * 12;
    drawCircle(full, Math.round(x), Math.round(y), 3.5);
  }
  // Mid-layer circles
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = 32 + Math.cos(angle) * 18;
    const y = 32 + Math.sin(angle) * 18;
    drawCircle(full, Math.round(x), Math.round(y), 4);
  }
  // Outer petals
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 16;
    const tipX = 32 + Math.cos(angle) * 26;
    const tipY = 32 + Math.sin(angle) * 26;
    const baseX = 32 + Math.cos(angle) * 20;
    const baseY = 32 + Math.sin(angle) * 20;
    drawPetal(full, tipX, tipY, baseX, baseY, 5);
  }
  // Thin connecting rays
  drawSmoothRadialBurst(full, 32, 32, 16, 24, 1, 0.2, 11.25);
  // Subtle glow
  drawGlowRing(full, 32, 32, 28, 2);

  // Berried: mandala with delicate berries
  const berried = createEmptyPattern();
  // Same intricate structure as full
  drawStar(berried, 32, 32, 8, 10, 5, 0);
  drawCircle(berried, 32, 32, 4);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = 32 + Math.cos(angle) * 12;
    const y = 32 + Math.sin(angle) * 12;
    drawCircle(berried, Math.round(x), Math.round(y), 3.5);
  }
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = 32 + Math.cos(angle) * 18;
    const y = 32 + Math.sin(angle) * 18;
    drawCircle(berried, Math.round(x), Math.round(y), 4);
  }
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 16;
    const tipX = 32 + Math.cos(angle) * 26;
    const tipY = 32 + Math.sin(angle) * 26;
    const baseX = 32 + Math.cos(angle) * 20;
    const baseY = 32 + Math.sin(angle) * 20;
    drawPetal(berried, tipX, tipY, baseX, baseY, 5);
  }
  drawSmoothRadialBurst(berried, 32, 32, 16, 24, 1, 0.2, 11.25);
  // Berries at mid-layer positions
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 16;
    const x = 32 + Math.cos(angle) * 23;
    const y = 32 + Math.sin(angle) * 23;
    drawCircle(berried, Math.round(x), Math.round(y), 3.5);
  }
  drawGlowRing(berried, 32, 32, 28, 2);

  return { base, full, berried };
}

/**
 * Generate patterns for Berry Thicket
 * A dense shrub pattern with fruits that materialize over lifecycle
 */
function createBerryThicketPatterns() {
  // Sparse: initial dense foliage without berries (garden-inspired leaf clusters)
  const sparse = createEmptyPattern();
  // Dense branching pattern
  drawRect(sparse, 30, 48, 33, 58); // Main trunk
  // Left branches
  drawRect(sparse, 20, 40, 30, 43);
  drawRect(sparse, 12, 32, 22, 35);
  // Left foliage clusters with petal-like leaves
  drawCircle(sparse, 14, 28, 7);
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const tipX = 14 + Math.cos(angle) * 8;
    const tipY = 28 + Math.sin(angle) * 8;
    const baseX = 14 + Math.cos(angle) * 4;
    const baseY = 28 + Math.sin(angle) * 4;
    drawPetal(sparse, tipX, tipY, baseX, baseY, 3);
  }
  drawCircle(sparse, 24, 34, 6);
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + Math.PI / 10;
    const tipX = 24 + Math.cos(angle) * 7;
    const tipY = 34 + Math.sin(angle) * 7;
    drawPetal(sparse, tipX, tipY, 24, 34, 2.5);
  }
  // Right branches
  drawRect(sparse, 34, 40, 44, 43);
  drawRect(sparse, 42, 32, 52, 35);
  // Right foliage clusters
  drawCircle(sparse, 50, 28, 7);
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const tipX = 50 + Math.cos(angle) * 8;
    const tipY = 28 + Math.sin(angle) * 8;
    const baseX = 50 + Math.cos(angle) * 4;
    const baseY = 28 + Math.sin(angle) * 4;
    drawPetal(sparse, tipX, tipY, baseX, baseY, 3);
  }
  drawCircle(sparse, 40, 34, 6);
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + Math.PI / 10;
    const tipX = 40 + Math.cos(angle) * 7;
    const tipY = 34 + Math.sin(angle) * 7;
    drawPetal(sparse, tipX, tipY, 40, 34, 2.5);
  }
  // Top foliage (larger flower-like cluster)
  drawCircle(sparse, 32, 24, 9);
  drawStar(sparse, 32, 24, 6, 10, 6, 0);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const tipX = 32 + Math.cos(angle) * 11;
    const tipY = 24 + Math.sin(angle) * 11;
    drawPetal(sparse, tipX, tipY, 32, 24, 4);
  }
  drawCircle(sparse, 26, 20, 6);
  drawCircle(sparse, 38, 20, 6);

  // Growing: more foliage, first berries appearing (expanding garden clusters)
  const growing = createEmptyPattern();
  drawRect(growing, 30, 48, 33, 58);
  drawRect(growing, 20, 40, 30, 43);
  drawRect(growing, 12, 32, 22, 35);
  // Left foliage - expanded
  drawCircle(growing, 14, 26, 9);
  drawStar(growing, 14, 26, 6, 11, 7, 0);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const tipX = 14 + Math.cos(angle) * 10;
    const tipY = 26 + Math.sin(angle) * 10;
    drawPetal(growing, tipX, tipY, 14, 26, 3.5);
  }
  drawCircle(growing, 24, 32, 8);
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const tipX = 24 + Math.cos(angle) * 9;
    const tipY = 32 + Math.sin(angle) * 9;
    drawPetal(growing, tipX, tipY, 24, 32, 3);
  }
  drawRect(growing, 34, 40, 44, 43);
  drawRect(growing, 42, 32, 52, 35);
  // Right foliage - expanded
  drawCircle(growing, 50, 26, 9);
  drawStar(growing, 50, 26, 6, 11, 7, 0);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const tipX = 50 + Math.cos(angle) * 10;
    const tipY = 26 + Math.sin(angle) * 10;
    drawPetal(growing, tipX, tipY, 50, 26, 3.5);
  }
  drawCircle(growing, 40, 32, 8);
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const tipX = 40 + Math.cos(angle) * 9;
    const tipY = 32 + Math.sin(angle) * 9;
    drawPetal(growing, tipX, tipY, 40, 32, 3);
  }
  // Top foliage - larger garden burst
  drawCircle(growing, 32, 22, 11);
  drawStar(growing, 32, 22, 8, 13, 8, 0);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const tipX = 32 + Math.cos(angle) * 13;
    const tipY = 22 + Math.sin(angle) * 13;
    drawPetal(growing, tipX, tipY, 32, 22, 4);
  }
  drawCircle(growing, 24, 16, 8);
  drawCircle(growing, 40, 16, 8);
  // First berries (small sparkles)
  drawCircle(growing, 10, 28, 3);
  drawStar(growing, 10, 28, 4, 4, 2, 0);
  drawCircle(growing, 54, 28, 3);
  drawStar(growing, 54, 28, 4, 4, 2, 0);

  // Fruiting: full berries visible throughout (lush garden with fruit sparkles)
  const fruiting = createEmptyPattern();
  drawRect(fruiting, 30, 48, 33, 58);
  drawRect(fruiting, 20, 40, 30, 43);
  drawRect(fruiting, 12, 32, 22, 35);
  // Left foliage - full garden clusters
  drawCircle(fruiting, 14, 24, 10);
  drawStar(fruiting, 14, 24, 8, 12, 8, 0);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const tipX = 14 + Math.cos(angle) * 11;
    const tipY = 24 + Math.sin(angle) * 11;
    drawPetal(fruiting, tipX, tipY, 14, 24, 4);
  }
  drawCircle(fruiting, 24, 30, 9);
  drawStar(fruiting, 24, 30, 6, 10, 6, 0);
  drawRect(fruiting, 34, 40, 44, 43);
  drawRect(fruiting, 42, 32, 52, 35);
  // Right foliage - full garden clusters
  drawCircle(fruiting, 50, 24, 10);
  drawStar(fruiting, 50, 24, 8, 12, 8, 0);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const tipX = 50 + Math.cos(angle) * 11;
    const tipY = 24 + Math.sin(angle) * 11;
    drawPetal(fruiting, tipX, tipY, 50, 24, 4);
  }
  drawCircle(fruiting, 40, 30, 9);
  drawStar(fruiting, 40, 30, 6, 10, 6, 0);
  // Top foliage - dramatic mandala burst
  drawCircle(fruiting, 32, 20, 13);
  drawStar(fruiting, 32, 20, 12, 15, 9, 0);
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const tipX = 32 + Math.cos(angle) * 14;
    const tipY = 20 + Math.sin(angle) * 14;
    drawPetal(fruiting, tipX, tipY, 32, 20, 4.5);
  }
  drawCircle(fruiting, 22, 14, 9);
  drawCircle(fruiting, 42, 14, 9);
  // Many berries scattered throughout (with sparkle accents)
  const berryPositions = [
    { x: 8, y: 26 },
    { x: 12, y: 20 },
    { x: 56, y: 26 },
    { x: 52, y: 20 },
    { x: 20, y: 12 },
    { x: 44, y: 12 },
    { x: 32, y: 10 },
    { x: 28, y: 26 },
    { x: 36, y: 26 },
  ];
  berryPositions.forEach(({ x, y }) => {
    const size = x === 32 || x === 8 || x === 56 ? 3 : 2.5;
    drawCircle(fruiting, x, y, size);
    drawStar(fruiting, x, y, 4, size + 1, size - 0.5, 0);
  });

  // Ripe: berries at peak ripeness (abundant garden with radiant berries)
  const ripe = createEmptyPattern();
  drawRect(ripe, 30, 48, 33, 58);
  drawRect(ripe, 20, 40, 30, 43);
  drawRect(ripe, 12, 32, 22, 35);
  // Left foliage - same lush clusters
  drawCircle(ripe, 14, 24, 10);
  drawStar(ripe, 14, 24, 8, 12, 8, 0);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const tipX = 14 + Math.cos(angle) * 11;
    const tipY = 24 + Math.sin(angle) * 11;
    drawPetal(ripe, tipX, tipY, 14, 24, 4);
  }
  drawCircle(ripe, 24, 30, 9);
  drawStar(ripe, 24, 30, 6, 10, 6, 0);
  drawRect(ripe, 34, 40, 44, 43);
  drawRect(ripe, 42, 32, 52, 35);
  // Right foliage - same lush clusters
  drawCircle(ripe, 50, 24, 10);
  drawStar(ripe, 50, 24, 8, 12, 8, 0);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const tipX = 50 + Math.cos(angle) * 11;
    const tipY = 24 + Math.sin(angle) * 11;
    drawPetal(ripe, tipX, tipY, 50, 24, 4);
  }
  drawCircle(ripe, 40, 30, 9);
  drawStar(ripe, 40, 30, 6, 10, 6, 0);
  // Top foliage - same dramatic mandala
  drawCircle(ripe, 32, 20, 13);
  drawStar(ripe, 32, 20, 12, 15, 9, 0);
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const tipX = 32 + Math.cos(angle) * 14;
    const tipY = 20 + Math.sin(angle) * 14;
    drawPetal(ripe, tipX, tipY, 32, 20, 4.5);
  }
  drawCircle(ripe, 22, 14, 9);
  drawCircle(ripe, 42, 14, 9);
  // Larger, riper berries with radiant glow
  const ripeBerries = [
    { x: 8, y: 26, r: 4.5 },
    { x: 12, y: 18, r: 4 },
    { x: 56, y: 26, r: 4.5 },
    { x: 52, y: 18, r: 4 },
    { x: 18, y: 10, r: 4 },
    { x: 46, y: 10, r: 4 },
    { x: 32, y: 8, r: 4.5 },
    { x: 26, y: 24, r: 3.5 },
    { x: 38, y: 24, r: 3.5 },
  ];
  ripeBerries.forEach(({ x, y, r }) => {
    drawCircle(ripe, x, y, r);
    // Radiant star around ripe berries
    drawStar(ripe, x, y, 8, r + 2, r, 0);
    // Subtle glow
    drawGlowRing(ripe, x, y, r + 3, 1);
  });

  return { sparse, growing, fruiting, ripe };
}

/**
 * Generate patterns for Bell Cluster
 * Multiple hanging bell-shaped flowers with staggered blooming
 */
function createBellClusterPatterns() {
  // Buds: small closed bells hanging (with delicate star accents)
  const buds = createEmptyPattern();
  // Main stem with decorative top
  drawRect(buds, 30, 8, 33, 24);
  drawStar(buds, 31.5, 10, 4, 4, 2, 0);
  // Branch stems
  drawRect(buds, 20, 20, 23, 32);
  drawRect(buds, 40, 20, 43, 28);
  drawRect(buds, 32, 24, 35, 36);
  // Closed buds (teardrop shapes with petal texture)
  drawEllipse(buds, 21, 38, 5, 8);
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const tipX = 21 + Math.cos(angle) * 6;
    const tipY = 38 + Math.sin(angle) * 9;
    drawPetal(buds, tipX, tipY, 21, 38, 2);
  }
  drawEllipse(buds, 41, 34, 4, 6);
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const tipX = 41 + Math.cos(angle) * 5;
    const tipY = 34 + Math.sin(angle) * 7;
    drawPetal(buds, tipX, tipY, 41, 34, 1.5);
  }
  drawEllipse(buds, 33, 42, 5, 8);
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const tipX = 33 + Math.cos(angle) * 6;
    const tipY = 42 + Math.sin(angle) * 9;
    drawPetal(buds, tipX, tipY, 33, 42, 2);
  }

  // First: first bell opens
  const first = createEmptyPattern();
  drawRect(first, 30, 8, 33, 24);
  drawRect(first, 20, 20, 23, 32);
  drawRect(first, 40, 20, 43, 28);
  drawRect(first, 32, 24, 35, 36);
  // First bell open (wider at bottom)
  drawEllipse(first, 21, 38, 8, 6);
  drawRect(first, 16, 38, 26, 44);
  drawRing(first, 21, 44, 0, 8);
  // Other bells still closed
  drawEllipse(first, 41, 34, 4, 6);
  drawEllipse(first, 33, 42, 5, 8);

  // Second: two bells open
  const second = createEmptyPattern();
  drawRect(second, 30, 8, 33, 24);
  drawRect(second, 20, 20, 23, 32);
  drawRect(second, 40, 20, 43, 28);
  drawRect(second, 32, 24, 35, 36);
  // First bell open
  drawEllipse(second, 21, 38, 8, 6);
  drawRect(second, 16, 38, 26, 44);
  drawRing(second, 21, 44, 0, 8);
  // Second bell open
  drawEllipse(second, 41, 32, 7, 5);
  drawRect(second, 36, 32, 46, 38);
  drawRing(second, 41, 38, 0, 7);
  // Third bell still closed
  drawEllipse(second, 33, 42, 5, 8);

  // Full: all bells open (with radiant inner patterns)
  const full = createEmptyPattern();
  drawRect(full, 30, 8, 33, 24);
  drawStar(full, 31.5, 10, 6, 5, 3, 0);
  drawRect(full, 20, 20, 23, 32);
  drawRect(full, 40, 20, 43, 28);
  drawRect(full, 32, 24, 35, 36);
  // First bell open (with inner starburst)
  drawEllipse(full, 21, 38, 8, 6);
  drawRect(full, 16, 38, 26, 44);
  drawRing(full, 21, 44, 0, 8);
  // Inner starburst
  drawStar(full, 21, 41, 8, 6, 3, 0);
  drawCircle(full, 21, 41, 2);
  // Second bell open (with inner mandala)
  drawEllipse(full, 41, 32, 7, 5);
  drawRect(full, 36, 32, 46, 38);
  drawRing(full, 41, 38, 0, 7);
  // Inner mandala
  drawStar(full, 41, 35, 6, 5, 2.5, 0);
  drawCircle(full, 41, 35, 2);
  // Third bell open (with inner rosette)
  drawEllipse(full, 33, 44, 8, 6);
  drawRect(full, 28, 44, 38, 50);
  drawRing(full, 33, 50, 0, 8);
  // Inner rosette
  drawStar(full, 33, 47, 8, 6, 3, 22.5);
  drawCircle(full, 33, 47, 2);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = 33 + Math.cos(angle) * 4;
    const y = 47 + Math.sin(angle) * 4;
    drawCircle(full, Math.round(x), Math.round(y), 1);
  }

  // Fade: bells wilting
  const fade = createEmptyPattern();
  drawRect(fade, 30, 8, 33, 24);
  drawRect(fade, 20, 20, 23, 32);
  drawRect(fade, 40, 20, 43, 28);
  drawRect(fade, 32, 24, 35, 36);
  // Wilted bells (smaller, less defined)
  drawEllipse(fade, 21, 40, 5, 4);
  drawEllipse(fade, 41, 34, 4, 3);
  drawEllipse(fade, 33, 46, 5, 4);

  return { buds, first, second, full, fade };
}

/**
 * Generate patterns for Sapling Hope
 * A delicate young tree with branches and leaves that unfurl progressively
 */
function createSaplingHopePatterns() {
  // Seedling: tiny sprout just emerging
  const seedling = createEmptyPattern();
  drawRect(seedling, 30, 48, 33, 60); // Tiny stem
  drawEllipse(seedling, 32, 44, 4, 6); // First leaf bud

  // Sprout: small stem with first leaves
  const sprout = createEmptyPattern();
  drawRect(sprout, 30, 36, 33, 60); // Taller stem
  // First pair of leaves
  drawPetal(sprout, 22, 38, 29, 40, 5);
  drawPetal(sprout, 42, 38, 35, 40, 5);
  drawCircle(sprout, 32, 32, 4); // Growing tip

  // Growing: developing branches and more leaves
  const growing = createEmptyPattern();
  drawRect(growing, 30, 28, 33, 60); // Main trunk
  // Left branch
  drawRect(growing, 20, 34, 30, 36);
  drawPetal(growing, 14, 30, 20, 34, 6);
  drawPetal(growing, 16, 38, 20, 36, 5);
  // Right branch
  drawRect(growing, 34, 34, 44, 36);
  drawPetal(growing, 50, 30, 44, 34, 6);
  drawPetal(growing, 48, 38, 44, 36, 5);
  // Top leaves
  drawPetal(growing, 32, 18, 32, 26, 8);
  drawPetal(growing, 24, 22, 30, 28, 6);
  drawPetal(growing, 40, 22, 34, 28, 6);

  // Young: full young tree with balanced canopy
  const young = createEmptyPattern();
  drawRect(young, 29, 32, 34, 60); // Thicker trunk
  // Left branches
  drawRect(young, 16, 36, 29, 38);
  drawRect(young, 10, 28, 18, 30);
  drawPetal(young, 6, 24, 12, 28, 6);
  drawPetal(young, 8, 32, 14, 30, 5);
  drawPetal(young, 12, 40, 18, 38, 6);
  drawPetal(young, 20, 42, 24, 38, 5);
  // Right branches
  drawRect(young, 35, 36, 48, 38);
  drawRect(young, 46, 28, 54, 30);
  drawPetal(young, 58, 24, 52, 28, 6);
  drawPetal(young, 56, 32, 50, 30, 5);
  drawPetal(young, 52, 40, 46, 38, 6);
  drawPetal(young, 44, 42, 40, 38, 5);
  // Top canopy
  drawCircle(young, 32, 20, 10);
  drawPetal(young, 32, 6, 32, 18, 10);
  drawPetal(young, 22, 12, 28, 20, 7);
  drawPetal(young, 42, 12, 36, 20, 7);

  // Mature: full tree with lush foliage (garden-inspired leaf clusters)
  const mature = createEmptyPattern();
  drawRect(mature, 28, 34, 35, 62); // Strong trunk
  // Dense left canopy with radial leaf patterns
  drawCircle(mature, 18, 28, 13);
  drawStar(mature, 18, 28, 12, 15, 10, 0);
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const tipX = 18 + Math.cos(angle) * 14;
    const tipY = 28 + Math.sin(angle) * 14;
    drawPetal(mature, tipX, tipY, 18, 28, 4);
  }
  drawCircle(mature, 12, 36, 11);
  drawStar(mature, 12, 36, 8, 12, 8, 0);
  drawCircle(mature, 22, 40, 9);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const tipX = 22 + Math.cos(angle) * 10;
    const tipY = 40 + Math.sin(angle) * 10;
    drawPetal(mature, tipX, tipY, 22, 40, 3);
  }
  // Dense right canopy with radial leaf patterns
  drawCircle(mature, 46, 28, 13);
  drawStar(mature, 46, 28, 12, 15, 10, 0);
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const tipX = 46 + Math.cos(angle) * 14;
    const tipY = 28 + Math.sin(angle) * 14;
    drawPetal(mature, tipX, tipY, 46, 28, 4);
  }
  drawCircle(mature, 52, 36, 11);
  drawStar(mature, 52, 36, 8, 12, 8, 0);
  drawCircle(mature, 42, 40, 9);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const tipX = 42 + Math.cos(angle) * 10;
    const tipY = 40 + Math.sin(angle) * 10;
    drawPetal(mature, tipX, tipY, 42, 40, 3);
  }
  // Top canopy - magnificent crown with mandala-inspired pattern
  drawCircle(mature, 32, 16, 15);
  drawStar(mature, 32, 16, 16, 18, 12, 0);
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const tipX = 32 + Math.cos(angle) * 16;
    const tipY = 16 + Math.sin(angle) * 16;
    drawPetal(mature, tipX, tipY, 32, 16, 5);
  }
  // Surrounding canopy clusters
  drawCircle(mature, 24, 22, 11);
  drawStar(mature, 24, 22, 8, 12, 8, 0);
  drawCircle(mature, 40, 22, 11);
  drawStar(mature, 40, 22, 8, 12, 8, 0);
  // Crown top with sparkle
  drawCircle(mature, 32, 8, 9);
  drawStar(mature, 32, 8, 12, 11, 7, 0);
  drawGlowRing(mature, 32, 8, 12, 2);

  return { seedling, sprout, growing, young, mature };
}

/**
 * Generate patterns for Weeping Willow
 * A tall tree with cascading fronds that create a wave animation
 */
function createWeepingWillowPatterns() {
  // Sapling: young willow with first drooping branches
  const sapling = createEmptyPattern();
  drawRect(sapling, 30, 20, 33, 60); // Thin trunk
  // First drooping fronds
  drawGrassBlade(sapling, 28, 24, 30, 0.6, 2);
  drawGrassBlade(sapling, 36, 24, 32, -0.6, 2);
  drawGrassBlade(sapling, 26, 28, 25, 0.5, 2);
  drawGrassBlade(sapling, 38, 28, 27, -0.5, 2);

  // Growing: more fronds developing
  const growing = createEmptyPattern();
  drawRect(growing, 29, 14, 34, 60); // Thicker trunk
  // Left fronds
  drawGrassBlade(growing, 24, 18, 36, 0.7, 2);
  drawGrassBlade(growing, 22, 22, 34, 0.6, 2);
  drawGrassBlade(growing, 20, 26, 32, 0.5, 2);
  drawGrassBlade(growing, 26, 30, 28, 0.4, 2);
  // Right fronds
  drawGrassBlade(growing, 40, 18, 36, -0.7, 2);
  drawGrassBlade(growing, 42, 22, 34, -0.6, 2);
  drawGrassBlade(growing, 44, 26, 32, -0.5, 2);
  drawGrassBlade(growing, 38, 30, 28, -0.4, 2);
  // Top
  drawCircle(growing, 32, 12, 6);

  // SwayLeft: full willow with fronds leaning left (decorative crown)
  const swayLeft = createEmptyPattern();
  drawRect(swayLeft, 28, 10, 35, 62); // Full trunk
  // Crown with radiant burst pattern
  drawCircle(swayLeft, 32, 8, 9);
  drawStar(swayLeft, 32, 8, 8, 11, 7, 0);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const tipX = 32 + Math.cos(angle) * 10;
    const tipY = 8 + Math.sin(angle) * 10;
    drawPetal(swayLeft, tipX, tipY, 32, 8, 3);
  }
  drawGlowRing(swayLeft, 32, 8, 12, 2);
  // Left-leaning fronds (longer cascade)
  for (let i = 0; i < 8; i++) {
    const baseX = 20 + i * 3;
    const baseY = 12 + i * 2;
    const height = 40 - i * 2;
    drawGrassBlade(swayLeft, baseX, baseY, height, 0.5 + i * 0.05, 2);
  }
  // Right fronds (shorter, less lean)
  for (let i = 0; i < 6; i++) {
    const baseX = 38 + i * 3;
    const baseY = 14 + i * 2;
    const height = 35 - i * 3;
    drawGrassBlade(swayLeft, baseX, baseY, height, -0.3 + i * 0.02, 2);
  }

  // SwayRight: mirror of swayLeft
  const swayRight = mirrorHorizontal(swayLeft);

  // Full: neutral position with decorative crown
  const full = createEmptyPattern();
  drawRect(full, 28, 10, 35, 62); // Full trunk
  // Crown with radiant burst pattern
  drawCircle(full, 32, 8, 9);
  drawStar(full, 32, 8, 8, 11, 7, 0);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const tipX = 32 + Math.cos(angle) * 10;
    const tipY = 8 + Math.sin(angle) * 10;
    drawPetal(full, tipX, tipY, 32, 8, 3);
  }
  drawGlowRing(full, 32, 8, 12, 2);
  // Balanced fronds
  for (let i = 0; i < 7; i++) {
    const baseX = 18 + i * 2;
    const baseY = 12 + i * 2;
    const height = 42 - i * 3;
    drawGrassBlade(full, baseX, baseY, height, 0.4 + i * 0.03, 2);
  }
  for (let i = 0; i < 7; i++) {
    const baseX = 46 - i * 2;
    const baseY = 12 + i * 2;
    const height = 42 - i * 3;
    drawGrassBlade(full, baseX, baseY, height, -0.4 - i * 0.03, 2);
  }

  return { sapling, growing, swayLeft, swayRight, full };
}

/**
 * Generate patterns for Fractal Bloom
 * A recursive self-similar pattern that grows outward
 */
function createFractalBloomPatterns() {
  // Seed: simple center
  const seed = createEmptyPattern();
  drawCircle(seed, 32, 32, 4);
  drawStar(seed, 32, 32, 5, 6, 3, 0);

  // Sprout: first level of recursion
  const sprout = createEmptyPattern();
  drawCircle(sprout, 32, 32, 5);
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const tipX = 32 + Math.cos(angle) * 16;
    const tipY = 32 + Math.sin(angle) * 16;
    drawPetal(sprout, tipX, tipY, 32, 32, 7);
    drawCircle(sprout, Math.round(tipX), Math.round(tipY), 2);
  }

  // Bloom: full fractal pattern
  const bloom = createEmptyPattern();
  drawCircle(bloom, 32, 32, 5);
  // First level - 5 petals
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const tipX = 32 + Math.cos(angle) * 24;
    const tipY = 32 + Math.sin(angle) * 24;
    const baseX = 32 + Math.cos(angle) * 10;
    const baseY = 32 + Math.sin(angle) * 10;
    drawPetal(bloom, tipX, tipY, baseX, baseY, 10);

    // Second level - smaller petals at endpoints
    const miniTipX = tipX + Math.cos(angle) * 6;
    const miniTipY = tipY + Math.sin(angle) * 6;
    drawPetal(bloom, miniTipX, miniTipY, tipX, tipY, 4);

    // Side mini petals
    const leftAngle = angle - Math.PI / 3;
    const rightAngle = angle + Math.PI / 3;
    drawPetal(
      bloom,
      tipX + Math.cos(leftAngle) * 5,
      tipY + Math.sin(leftAngle) * 5,
      32 + Math.cos(angle) * 17,
      32 + Math.sin(angle) * 17,
      3
    );
    drawPetal(
      bloom,
      tipX + Math.cos(rightAngle) * 5,
      tipY + Math.sin(rightAngle) * 5,
      32 + Math.cos(angle) * 17,
      32 + Math.sin(angle) * 17,
      3
    );
  }

  return { seed, sprout, bloom };
}

/**
 * Generate patterns for Phoenix Flame
 * Rising fire-like pattern with wing animations
 */
function createPhoenixFlamePatterns() {
  // Ember: small spark
  const ember = createEmptyPattern();
  drawCircle(ember, 32, 36, 6);
  drawStar(ember, 32, 36, 5, 8, 4, 0);
  drawGlowRing(ember, 32, 36, 10, 2);

  // Rising: flames begin to spread
  const rising = createEmptyPattern();
  drawCircle(rising, 32, 32, 7);
  drawPetal(rising, 32, 20, 32, 28, 9);
  // Side flames
  for (let side = -1; side <= 1; side += 2) {
    const angle = (side * Math.PI) / 4;
    const tipX = 32 + Math.cos(angle) * 16;
    const tipY = 28 + Math.sin(angle) * 12;
    drawPetal(rising, tipX, tipY, 32, 30, 7);
  }
  drawGlowRing(rising, 32, 30, 18, 2);

  // Blaze: full phoenix with spread wings
  const blaze = createEmptyPattern();
  drawCircle(blaze, 32, 32, 8);
  // Body flame
  drawPetal(blaze, 32, 12, 32, 26, 12);
  // Wing-like flames (both sides)
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 4; i++) {
      const baseAngle = side * (Math.PI / 4 + (i * Math.PI) / 8);
      const yOffset = 24 - i * 3;
      const length = 20 - i * 2;
      const tipX = 32 + Math.cos(baseAngle) * length;
      const tipY = yOffset + Math.sin(baseAngle) * length;
      drawPetal(blaze, tipX, tipY, 32, yOffset, 7 - i);
    }
  }
  // Tail flames
  for (let i = 0; i < 3; i++) {
    const angle = Math.PI / 2 + ((i - 1) * Math.PI) / 6;
    drawPetal(blaze, 32 + Math.cos(angle) * 8, 44 + i * 4, 32, 36, 6);
  }
  drawGlowRing(blaze, 32, 28, 28, 3);

  return { ember, rising, blaze };
}

/**
 * Generate patterns for Crystal Cluster
 * Geometric crystal growth with faceted forms
 */
function createCrystalClusterPatterns() {
  // Nucleation: tiny crystal seed
  const nucleation = createEmptyPattern();
  drawCircle(nucleation, 32, 32, 4);
  drawStar(nucleation, 32, 32, 6, 6, 3, 0);

  // Formation: crystals begin to form
  const formation = createEmptyPattern();
  drawCircle(formation, 32, 32, 6);
  drawStar(formation, 32, 32, 6, 12, 7, 0);
  // Small crystals at cardinal points
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const x = 32 + Math.cos(angle) * 14;
    const y = 32 + Math.sin(angle) * 14;
    drawStar(formation, Math.round(x), Math.round(y), 4, 5, 3, 0);
  }

  // Growth: full crystal cluster
  const growth = createEmptyPattern();
  drawCircle(growth, 32, 32, 7);
  drawStar(growth, 32, 32, 8, 14, 8, 0);
  // Crystal formations at 8 positions
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = 32 + Math.cos(angle) * 20;
    const y = 32 + Math.sin(angle) * 20;
    drawCircle(growth, Math.round(x), Math.round(y), 5);
    drawStar(growth, Math.round(x), Math.round(y), 6, 7, 4, 0);
  }
  // Connecting rays
  drawSmoothRadialBurst(growth, 32, 32, 8, 24, 2, 0.5, 22.5);

  return { nucleation, formation, growth };
}

/**
 * Generate patterns for Kaleidoscope Star
 * Rotating geometric-organic hybrid
 */
function createKaleidoscopeStarPatterns() {
  // Rotate1: first rotation position
  const rotate1 = createEmptyPattern();
  drawCircle(rotate1, 32, 32, 5);
  drawStar(rotate1, 32, 32, 8, 12, 6, 0);
  // Mid-layer circles
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = 32 + Math.cos(angle) * 16;
    const y = 32 + Math.sin(angle) * 16;
    drawCircle(rotate1, Math.round(x), Math.round(y), 4);
  }
  // Outer petals
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 16;
    const tipX = 32 + Math.cos(angle) * 28;
    const tipY = 32 + Math.sin(angle) * 28;
    const baseX = 32 + Math.cos(angle) * 18;
    const baseY = 32 + Math.sin(angle) * 18;
    drawPetal(rotate1, tipX, tipY, baseX, baseY, 6);
  }
  drawSmoothRadialBurst(rotate1, 32, 32, 16, 26, 1, 0.2, 11.25);

  // Rotate2: 22.5° rotation
  const rotate2 = createEmptyPattern();
  drawCircle(rotate2, 32, 32, 5);
  drawStar(rotate2, 32, 32, 8, 12, 6, 22.5);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 16;
    const x = 32 + Math.cos(angle) * 16;
    const y = 32 + Math.sin(angle) * 16;
    drawCircle(rotate2, Math.round(x), Math.round(y), 4);
  }
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const tipX = 32 + Math.cos(angle) * 28;
    const tipY = 32 + Math.sin(angle) * 28;
    const baseX = 32 + Math.cos(angle) * 18;
    const baseY = 32 + Math.sin(angle) * 18;
    drawPetal(rotate2, tipX, tipY, baseX, baseY, 6);
  }
  drawSmoothRadialBurst(rotate2, 32, 32, 16, 26, 1, 0.2, 0);

  return { rotate1, rotate2 };
}

/**
 * Generate patterns for Vortex Spiral
 * Swirling energy pattern with dynamic motion
 */
function createVortexSpiralPatterns() {
  // Calm: gentle center
  const calm = createEmptyPattern();
  drawCircle(calm, 32, 32, 6);
  drawStar(calm, 32, 32, 5, 10, 5, 0);
  // Single spiral arm
  for (let step = 0; step < 6; step++) {
    const t = step / 6;
    const angle = t * Math.PI * 1.2;
    const radius = 10 + t * 16;
    const x = 32 + Math.cos(angle) * radius;
    const y = 32 + Math.sin(angle) * radius;
    drawCircle(calm, Math.round(x), Math.round(y), 5 - t * 2);
  }

  // Spin: multiple spiral arms
  const spin = createEmptyPattern();
  drawCircle(spin, 32, 32, 5);
  drawStar(spin, 32, 32, 5, 9, 4, 0);
  // 5 spiral arms
  for (let arm = 0; arm < 5; arm++) {
    const baseAngle = (arm / 5) * Math.PI * 2;
    for (let step = 0; step < 8; step++) {
      const t = step / 8;
      const angle = baseAngle + t * Math.PI * 1.2;
      const radius = 8 + t * 18;
      const x = 32 + Math.cos(angle) * radius;
      const y = 32 + Math.sin(angle) * radius;
      drawCircle(spin, Math.round(x), Math.round(y), 6 - t * 3);
    }
  }

  // Whirl: intense vortex
  const whirl = createEmptyPattern();
  drawCircle(whirl, 32, 32, 7);
  drawStar(whirl, 32, 32, 8, 11, 5, 0);
  // Dense spiral pattern
  for (let arm = 0; arm < 8; arm++) {
    const baseAngle = (arm / 8) * Math.PI * 2;
    for (let step = 0; step < 10; step++) {
      const t = step / 10;
      const angle = baseAngle + t * Math.PI * 1.5;
      const radius = 10 + t * 22;
      const x = 32 + Math.cos(angle) * radius;
      const y = 32 + Math.sin(angle) * radius;
      drawCircle(whirl, Math.round(x), Math.round(y), 7 - t * 4);
    }
  }
  drawGlowRing(whirl, 32, 32, 28, 2);

  return { calm, spin, whirl };
}

/**
 * Generate patterns for Nebula Bloom
 * Cosmic cloud-flower hybrid
 */
function createNebulaBloomPatterns() {
  // Drift: diffuse cloud forming
  const drift = createEmptyPattern();
  const driftCenters = [
    { x: 32, y: 32, r: 10 },
    { x: 24, y: 28, r: 7 },
    { x: 40, y: 28, r: 7 },
  ];
  driftCenters.forEach(({ x, y, r }) => {
    drawCircle(drift, x, y, r);
    drawGlowRing(drift, x, y, r + 4, 2);
  });

  // Coalescence: cloud forms taking shape
  const coalescence = createEmptyPattern();
  const coalCenters = [
    { x: 32, y: 32, r: 12 },
    { x: 22, y: 24, r: 9 },
    { x: 42, y: 24, r: 9 },
    { x: 24, y: 40, r: 8 },
    { x: 40, y: 40, r: 8 },
  ];
  coalCenters.forEach(({ x, y, r }) => {
    drawCircle(coalescence, x, y, r);
    drawGlowRing(coalescence, x, y, r + 3, 2);
  });
  // Emerging points
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = 32 + Math.cos(angle) * 20;
    const y = 32 + Math.sin(angle) * 20;
    drawCircle(coalescence, Math.round(x), Math.round(y), 2);
  }

  // Radiance: full nebula bloom
  const radiance = createEmptyPattern();
  const radCenters = [
    { x: 32, y: 32, r: 14 },
    { x: 20, y: 20, r: 11 },
    { x: 44, y: 20, r: 10 },
    { x: 18, y: 38, r: 12 },
    { x: 46, y: 38, r: 11 },
    { x: 32, y: 46, r: 9 },
  ];
  radCenters.forEach(({ x, y, r }) => {
    drawCircle(radiance, x, y, r);
    drawGlowRing(radiance, x, y, r + 4, 2);
  });
  // Radiant points
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const x = 32 + Math.cos(angle) * 28;
    const y = 32 + Math.sin(angle) * 28;
    drawCircle(radiance, Math.round(x), Math.round(y), 2.5);
    drawStar(radiance, Math.round(x), Math.round(y), 4, 4, 2, 0);
  }

  return { drift, coalescence, radiance };
}

/**
 * Generate patterns for Aurora Wisp
 * Northern lights captured as ethereal flowing ribbons
 */
function createAuroraWispPatterns() {
  // Shimmer: faint glow
  const shimmer = createEmptyPattern();
  drawCircle(shimmer, 32, 32, 5);
  drawGlowRing(shimmer, 32, 32, 12, 2);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = 32 + Math.cos(angle) * 8;
    const y = 32 + Math.sin(angle) * 8;
    drawCircle(shimmer, Math.round(x), Math.round(y), 1.5);
  }

  // Flow: ribbons beginning to wave
  const flow = createEmptyPattern();
  drawCircle(flow, 32, 32, 4);
  // Flowing ribbons at 4 cardinal directions
  for (let dir = 0; dir < 4; dir++) {
    const baseAngle = (dir / 4) * Math.PI * 2;
    for (let segment = 0; segment < 4; segment++) {
      const offset = segment * 5;
      const wave = Math.sin(segment * 0.8) * 3;
      const angle = baseAngle + wave * 0.1;
      const x = 32 + Math.cos(angle) * (8 + offset);
      const y = 32 + Math.sin(angle) * (8 + offset);
      drawCircle(flow, Math.round(x), Math.round(y), 2 - segment * 0.3);
    }
  }

  // Dance: full aurora ribbons
  const dance = createEmptyPattern();
  drawCircle(dance, 32, 32, 5);
  drawGlowRing(dance, 32, 32, 8, 1);
  // Complex flowing ribbons
  for (let dir = 0; dir < 8; dir++) {
    const baseAngle = (dir / 8) * Math.PI * 2;
    for (let segment = 0; segment < 6; segment++) {
      const offset = segment * 4;
      const wave = Math.sin(segment * 1.2 + dir * 0.5) * 4;
      const perpWave = Math.cos(segment * 0.9) * 2;
      const angle = baseAngle + wave * 0.08;
      const x = 32 + Math.cos(angle) * (6 + offset) + Math.cos(angle + Math.PI / 2) * perpWave;
      const y = 32 + Math.sin(angle) * (6 + offset) + Math.sin(angle + Math.PI / 2) * perpWave;
      drawCircle(dance, Math.round(x), Math.round(y), 2.5 - segment * 0.3);
    }
  }
  // Add sparkles
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const r = 24 + (i % 3) * 3;
    const x = 32 + Math.cos(angle) * r;
    const y = 32 + Math.sin(angle) * r;
    drawStar(dance, Math.round(x), Math.round(y), 4, 3, 1.5, 0);
  }

  return { shimmer, flow, dance };
}

/**
 * Generate patterns for Prismatic Fern
 * Rainbow light refracted through crystalline fronds
 */
function createPrismaticFernPatterns() {
  // Sprout: simple frond
  const sprout = createEmptyPattern();
  drawCircle(sprout, 32, 40, 4);
  // Single frond
  for (let i = 0; i < 8; i++) {
    const y = 40 - i * 4;
    const width = 2 + Math.sin(i * 0.5) * 1.5;
    for (let side = -1; side <= 1; side += 2) {
      const x = 32 + side * (width + i * 0.5);
      drawCircle(sprout, Math.round(x), y, 1.5);
    }
  }

  // Unfurling: multiple fronds
  const unfurling = createEmptyPattern();
  drawCircle(unfurling, 32, 38, 5);
  // Three fronds
  for (let frond = 0; frond < 3; frond++) {
    const frondAngle = ((frond - 1) * Math.PI) / 6;
    for (let i = 0; i < 10; i++) {
      const distance = i * 3;
      const x = 32 + Math.sin(frondAngle) * distance;
      const y = 38 - Math.cos(frondAngle) * distance;
      const width = 2 + Math.sin(i * 0.4) * 1.2;
      // Leaflets on both sides
      for (let side = -1; side <= 1; side += 2) {
        const perpAngle = frondAngle + (side * Math.PI) / 2;
        const leafX = x + Math.sin(perpAngle) * (width + i * 0.3);
        const leafY = y + Math.cos(perpAngle) * (width + i * 0.3);
        drawCircle(unfurling, Math.round(leafX), Math.round(leafY), 1.5);
      }
    }
  }

  // Prismatic: full rainbow fern
  const prismatic = createEmptyPattern();
  drawCircle(prismatic, 32, 36, 6);
  drawGlowRing(prismatic, 32, 36, 10, 1);
  // Five radial fronds
  for (let frond = 0; frond < 5; frond++) {
    const frondAngle = (frond / 5) * Math.PI * 2 - Math.PI / 2;
    for (let i = 0; i < 12; i++) {
      const distance = i * 2.5;
      const x = 32 + Math.cos(frondAngle) * distance;
      const y = 36 + Math.sin(frondAngle) * distance;
      const width = 2.5 + Math.sin(i * 0.3) * 1.5;
      // Crystal leaflets with sparkles
      for (let side = -1; side <= 1; side += 2) {
        const perpAngle = frondAngle + (side * Math.PI) / 2;
        const leafX = x + Math.cos(perpAngle) * (width + i * 0.2);
        const leafY = y + Math.sin(perpAngle) * (width + i * 0.2);
        drawCircle(prismatic, Math.round(leafX), Math.round(leafY), 1.8);
        // Add sparkle at tip
        if (i > 6 && i % 2 === 0) {
          drawStar(prismatic, Math.round(leafX), Math.round(leafY), 3, 2, 1, 0);
        }
      }
    }
  }

  return { sprout, unfurling, prismatic };
}

/**
 * Generate patterns for Quantum Rose
 * Rose petals existing in quantum superposition
 */
function createQuantumRosePatterns() {
  // Bud: tightly furled
  const bud = createEmptyPattern();
  drawCircle(bud, 32, 32, 6);
  // Spiraling bud petals
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + i * 0.3;
    const r = 8 + i * 0.5;
    const x = 32 + Math.cos(angle) * r;
    const y = 32 + Math.sin(angle) * r;
    drawPetal(bud, x, y, 32, 32, 4);
  }

  // Superposed: multiple quantum states visible
  const superposed = createEmptyPattern();
  drawCircle(superposed, 32, 32, 5);
  // Three overlapping rose patterns
  for (let state = 0; state < 3; state++) {
    const rotationOffset = (state / 3) * Math.PI * 2;
    for (let layer = 0; layer < 3; layer++) {
      const petalCount = 5 + layer * 2;
      const radius = 10 + layer * 6;
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2 + rotationOffset;
        const tipX = 32 + Math.cos(angle) * radius;
        const tipY = 32 + Math.sin(angle) * radius;
        const baseX = 32 + Math.cos(angle) * (radius - 5);
        const baseY = 32 + Math.sin(angle) * (radius - 5);
        drawPetal(superposed, tipX, tipY, baseX, baseY, 6 - layer);
      }
    }
  }

  // Collapsed: beautiful classical rose
  const collapsed = createEmptyPattern();
  drawCircle(collapsed, 32, 32, 4);
  // Tight spiral center
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + i * 0.4;
    const r = 5 + i * 0.8;
    const x = 32 + Math.cos(angle) * r;
    const y = 32 + Math.sin(angle) * r;
    drawCircle(collapsed, Math.round(x), Math.round(y), 2);
  }
  // Outer petals in perfect arrangement
  for (let layer = 0; layer < 4; layer++) {
    const petalCount = 5 + layer * 2;
    const radius = 16 + layer * 5;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 + layer * 0.3;
      const tipX = 32 + Math.cos(angle) * radius;
      const tipY = 32 + Math.sin(angle) * radius;
      const baseX = 32 + Math.cos(angle) * (radius - 6);
      const baseY = 32 + Math.sin(angle) * (radius - 6);
      drawPetal(collapsed, tipX, tipY, baseX, baseY, 7 - layer);
    }
  }

  return { bud, superposed, collapsed };
}

/**
 * Generate patterns for Star Moss
 * Bioluminescent moss forming constellation patterns
 */
function createStarMossPatterns() {
  // Sparse: few stars
  const sparse = createEmptyPattern();
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const r = 12 + (i % 2) * 6;
    const x = 32 + Math.cos(angle) * r;
    const y = 32 + Math.sin(angle) * r;
    drawStar(sparse, Math.round(x), Math.round(y), 5, 4, 2, 0);
    drawGlowRing(sparse, Math.round(x), Math.round(y), 6, 1);
  }

  // Growing: constellation forming
  const growing = createEmptyPattern();
  // Multiple star clusters
  for (let cluster = 0; cluster < 4; cluster++) {
    const clusterAngle = (cluster / 4) * Math.PI * 2;
    const clusterX = 32 + Math.cos(clusterAngle) * 16;
    const clusterY = 32 + Math.sin(clusterAngle) * 16;
    drawStar(growing, Math.round(clusterX), Math.round(clusterY), 6, 5, 2.5, 0);
    drawGlowRing(growing, Math.round(clusterX), Math.round(clusterY), 8, 2);
    // Surrounding mini stars
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const x = clusterX + Math.cos(angle) * 6;
      const y = clusterY + Math.sin(angle) * 6;
      drawStar(growing, Math.round(x), Math.round(y), 4, 3, 1.5, 0);
    }
  }

  // Galaxy: dense starfield
  const galaxy = createEmptyPattern();
  drawCircle(galaxy, 32, 32, 8);
  drawGlowRing(galaxy, 32, 32, 14, 3);
  // Spiral pattern of stars
  for (let i = 0; i < 32; i++) {
    const angle = (i / 32) * Math.PI * 2 * 3; // 3 arms
    const r = 4 + i * 0.8;
    const x = 32 + Math.cos(angle) * r;
    const y = 32 + Math.sin(angle) * r;
    const size = 3 + Math.sin(i * 0.5) * 1;
    drawStar(galaxy, Math.round(x), Math.round(y), 5, size, size * 0.6, 0);
    // Add glow for larger stars
    if (i % 4 === 0) {
      drawGlowRing(galaxy, Math.round(x), Math.round(y), size * 2, 1);
    }
  }

  return { sparse, growing, galaxy };
}

/**
 * Generate patterns for Dream Vine
 * Ethereal flowing vines with dreamlike quality
 */
function createDreamVinePatterns() {
  // Tendril: single vine
  const tendril = createEmptyPattern();
  drawCircle(tendril, 32, 44, 4);
  // Curling vine upward
  for (let i = 0; i < 16; i++) {
    const t = i / 16;
    const angle = Math.sin(t * Math.PI * 2) * 0.4;
    const x = 32 + Math.sin(angle) * (i * 1.2);
    const y = 44 - i * 2.5;
    drawCircle(tendril, Math.round(x), Math.round(y), 2);
    // Small leaves
    if (i % 4 === 0 && i > 0) {
      const leafX = x + Math.cos(angle + Math.PI / 2) * 4;
      const leafY = y + Math.sin(angle + Math.PI / 2) * 4;
      drawPetal(tendril, leafX, leafY, x, y, 3);
    }
  }

  // Weaving: multiple intertwined vines
  const weaving = createEmptyPattern();
  drawCircle(weaving, 32, 40, 5);
  // Three intertwining vines
  for (let vine = 0; vine < 3; vine++) {
    const vineOffset = (vine / 3) * Math.PI * 2;
    for (let i = 0; i < 14; i++) {
      const t = i / 14;
      const spiralAngle = t * Math.PI * 3 + vineOffset;
      const radius = 4 + i * 1.5;
      const x = 32 + Math.cos(spiralAngle) * radius;
      const y = 40 - i * 2;
      drawCircle(weaving, Math.round(x), Math.round(y), 2);
      // Leaves along vine
      if (i % 3 === 0) {
        const leafAngle = spiralAngle + Math.PI / 2;
        const leafX = x + Math.cos(leafAngle) * 4;
        const leafY = y + Math.sin(leafAngle) * 4;
        drawPetal(weaving, leafX, leafY, x, y, 3.5);
      }
    }
  }

  // Cascade: full flowing garden
  const cascade = createEmptyPattern();
  drawCircle(cascade, 32, 32, 6);
  drawGlowRing(cascade, 32, 32, 10, 2);
  // Five major vines flowing outward
  for (let vine = 0; vine < 5; vine++) {
    const baseAngle = (vine / 5) * Math.PI * 2;
    for (let i = 0; i < 16; i++) {
      const t = i / 16;
      // Flowing curve
      const curveAngle = baseAngle + Math.sin(t * Math.PI * 2) * 0.6;
      const distance = 6 + i * 1.8;
      const x = 32 + Math.cos(curveAngle) * distance;
      const y = 32 + Math.sin(curveAngle) * distance;
      drawCircle(cascade, Math.round(x), Math.round(y), 2.5 - i * 0.1);
      // Leaves and blossoms
      if (i % 2 === 0) {
        const perpAngle = curveAngle + Math.PI / 2;
        const leafX = x + Math.cos(perpAngle) * 5;
        const leafY = y + Math.sin(perpAngle) * 5;
        drawPetal(cascade, leafX, leafY, x, y, 4);
      }
      // Flowers at ends
      if (i > 12) {
        drawStar(cascade, Math.round(x), Math.round(y), 5, 3, 1.5, 0);
      }
    }
  }

  return { tendril, weaving, cascade };
}

/**
 * Generate patterns for Cosmic Lotus
 * Sacred geometry meets cosmic bloom
 */
function createCosmicLotusPatterns() {
  // Seed: sacred geometry core
  const seed = createEmptyPattern();
  drawCircle(seed, 32, 32, 6);
  drawStar(seed, 32, 32, 6, 8, 4, 0);
  drawCircle(seed, 32, 32, 3);
  // Hexagonal pattern
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = 32 + Math.cos(angle) * 10;
    const y = 32 + Math.sin(angle) * 10;
    drawCircle(seed, Math.round(x), Math.round(y), 2);
  }

  // Opening: petals unfurling in sacred pattern
  const opening = createEmptyPattern();
  drawCircle(opening, 32, 32, 5);
  // Flower of life pattern
  for (let ring = 0; ring < 3; ring++) {
    const count = 6 * (ring + 1);
    const radius = 8 + ring * 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = 32 + Math.cos(angle) * radius;
      const y = 32 + Math.sin(angle) * radius;
      drawCircle(opening, Math.round(x), Math.round(y), 3 - ring * 0.5);
    }
  }
  // Petals emerging
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const tipX = 32 + Math.cos(angle) * 18;
    const tipY = 32 + Math.sin(angle) * 18;
    drawPetal(opening, tipX, tipY, 32, 32, 8);
  }

  // Transcendent: full cosmic bloom
  const transcendent = createEmptyPattern();
  drawCircle(transcendent, 32, 32, 6);
  drawGlowRing(transcendent, 32, 32, 12, 3);
  // Multiple layers of petals
  for (let layer = 0; layer < 3; layer++) {
    const petalCount = 8 + layer * 4;
    const radius = 14 + layer * 8;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 + layer * 0.2;
      const tipX = 32 + Math.cos(angle) * radius;
      const tipY = 32 + Math.sin(angle) * radius;
      const baseX = 32 + Math.cos(angle) * (radius - 8);
      const baseY = 32 + Math.sin(angle) * (radius - 8);
      drawPetal(transcendent, tipX, tipY, baseX, baseY, 10 - layer * 2);
    }
  }
  // Sacred geometry overlay
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const x = 32 + Math.cos(angle) * 28;
    const y = 32 + Math.sin(angle) * 28;
    drawStar(transcendent, Math.round(x), Math.round(y), 6, 4, 2, 0);
  }
  // Central mandala
  drawStar(transcendent, 32, 32, 12, 8, 4, 0);

  return { seed, opening, transcendent };
}

// Generate all patterns once at module load
// NOTE: These raster patterns are preserved for potential future raster rendering option
// but currently unused since all variants now use vector rendering.
const _simpleBloomPatterns = createSimpleBloomPatterns();
const _quantumTulipPatterns = createQuantumTulipPatterns();
const _softMossPatterns = createSoftMossPatterns();
const _pebblePatchPatterns = createPebblePatchPatterns();
const _meadowTuftPatterns = createMeadowTuftPatterns();
const _whisperReedPatterns = createWhisperReedPatterns();
const _pulsingOrbPatterns = createPulsingOrbPatterns();
const _dewdropDaisyPatterns = createDewdropDaisyPatterns();
const _midnightPoppyPatterns = createMidnightPoppyPatterns();
const _bellClusterPatterns = createBellClusterPatterns();
const _cloudBushPatterns = createCloudBushPatterns();
const _berryThicketPatterns = createBerryThicketPatterns();
const _saplingHopePatterns = createSaplingHopePatterns();
const _weepingWillowPatterns = createWeepingWillowPatterns();
const _fractalBloomPatterns = createFractalBloomPatterns();
const _phoenixFlamePatterns = createPhoenixFlamePatterns();
const _crystalClusterPatterns = createCrystalClusterPatterns();
const _kaleidoscopeStarPatterns = createKaleidoscopeStarPatterns();
const _vortexSpiralPatterns = createVortexSpiralPatterns();
const _nebulaBloomPatterns = createNebulaBloomPatterns();
const _auroraWispPatterns = createAuroraWispPatterns();
const _prismaticFernPatterns = createPrismaticFernPatterns();
const _quantumRosePatterns = createQuantumRosePatterns();
const _starMossPatterns = createStarMossPatterns();
const _dreamVinePatterns = createDreamVinePatterns();
const _cosmicLotusPatterns = createCosmicLotusPatterns();

// ============================================================================
// FLOWERS - Moderate rarity, multi-stage lifecycle, focal interest
// ============================================================================

/**
 * Simple Bloom
 *
 * A fixed-color flower that goes through bud → bloom → fade.
 * The most common flower type. Uses soft sage greens.
 * Scale: 1.0x (standard)
 */
const simpleBloom: PlantVariant = {
  id: "simple-bloom",
  name: "Simple Bloom",
  description: "A gentle plant with a classic bud-bloom-fade lifecycle",
  rarity: 1.0, // Most common
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "bud",
      duration: 15,
      primitives: [
        // Small bud
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 4, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 4, 6),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER + 16),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.8,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.6,
      scale: 0.7,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "sprout",
      duration: 20,
      primitives: [
        // Growing bud with emerging petals
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 8),
        // Petal hints
        vectorCircle(VECTOR_CENTER - 5, VECTOR_CENTER - 10, 3),
        vectorCircle(VECTOR_CENTER + 5, VECTOR_CENTER - 10, 3),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 14, 3),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER + 16),
        // Small leaves
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 8, VECTOR_CENTER - 6, VECTOR_CENTER + 4),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 8, VECTOR_CENTER + 6, VECTOR_CENTER + 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.9,
      fillColor: "#88D0D0", // Mint fill
      fillOpacity: 0.7,
      scale: 0.85,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "bloom",
      duration: 45,
      primitives: [
        // Full flower center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 7),
        // 5 petals in bloom
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 5),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 10, 5),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 10, 5),
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER + 2, 4),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER + 2, 4),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 6, VECTOR_CENTER, VECTOR_CENTER + 18),
        // Leaves
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 10, VECTOR_CENTER - 8, VECTOR_CENTER + 4),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 10, VECTOR_CENTER + 8, VECTOR_CENTER + 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 1.0,
      fillColor: "#A8D8A8", // Sage fill at full bloom
      fillOpacity: 0.85,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "fade",
      duration: 25,
      primitives: [
        // Fading flower
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 3),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 6),
        // Drooping petals
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 12, 4),
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 6, 4),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 6, 4),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER, VECTOR_CENTER + 16),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#D8D8E8", // Canvas fill - fading
      fillOpacity: 0.4,
      scale: 0.9,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};

/**
 * Quantum Tulip
 *
 * A multi-color flower with colorVariations.
 * Quantum measurement determines whether it's coral, peach, or lavender.
 * Less common than Simple Bloom due to color variation complexity.
 * Scale: 1.0x (standard)
 */
const quantumTulip: PlantVariant = {
  id: "quantum-tulip",
  name: "Quantum Tulip",
  description: "A tulip that blooms in soft pastel colors based on quantum measurement",
  rarity: 0.5, // Less common
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "bulb",
      duration: 20,
      primitives: [
        // Tulip bulb shape
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 8, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 6, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#D8D8E8", // Canvas fill - potential
      fillOpacity: 0.5,
      scale: 0.6,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "stem",
      duration: 15,
      primitives: [
        // Growing stem and bud
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 7),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 2, VECTOR_CENTER, VECTOR_CENTER + 16),
        // Leaf
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 6, VECTOR_CENTER - 6, VECTOR_CENTER + 10),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.8,
      fillColor: "#88D0D0", // Mint fill
      fillOpacity: 0.6,
      scale: 0.8,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "bloom",
      duration: 60,
      primitives: [
        // Tulip cup shape - overlapping petals
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 4),
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 10, 5),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 10, 5),
        vectorCircle(VECTOR_CENTER - 3, VECTOR_CENTER - 16, 5),
        vectorCircle(VECTOR_CENTER + 3, VECTOR_CENTER - 16, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 12, 6),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 2, VECTOR_CENTER, VECTOR_CENTER + 18),
        // Leaves
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 8, VECTOR_CENTER - 8, VECTOR_CENTER + 12),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 10, VECTOR_CENTER + 7, VECTOR_CENTER + 14),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 1.0,
      fillColor: "#E8A8C8", // Blossom fill (can be overridden by colorVariations)
      fillOpacity: 0.85,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "wilt",
      duration: 30,
      primitives: [
        // Wilting tulip
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 3),
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER - 8, 4),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER - 8, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 10, 4),
        // Drooping stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 2, VECTOR_CENTER + 2, VECTOR_CENTER + 16),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#D8D8E8", // Fading fill
      fillOpacity: 0.3,
      scale: 0.85,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
  // Color variations - quantum selects one
  colorVariations: [
    {
      name: "coral",
      weight: 1.0,
      palettes: {
        bloom: ["#F0C0C0", "#F0D0D0", "#F8E8E8"],
        wilt: ["#E8E8F0", "#F0F0F0", "#F8F8F8"],
      },
    },
    {
      name: "peach",
      weight: 0.8,
      palettes: {
        bloom: ["#F0D0B0", "#F0E0C0", "#F8F0E0"],
        wilt: ["#E8E8F0", "#F0F0F0", "#F8F8F8"],
      },
    },
    {
      name: "lavender",
      weight: 0.5,
      palettes: {
        bloom: ["#E0C0F0", "#E0D0F0", "#F0E8F8"],
        wilt: ["#E8E8F0", "#F0F0F0", "#F8F8F8"],
      },
    },
  ],
};

/**
 * Dewdrop Daisy (Vector)
 *
 * A cheerful daisy with radiating petals and a sparkle effect.
 * Moderate rarity - more interesting than basic flowers.
 * Scale: 1.0x (standard)
 */
const dewdropDaisy: PlantVariant = {
  id: "dewdrop-daisy",
  name: "Dewdrop Daisy",
  description: "A cheerful daisy that sparkles like morning dew in the light",
  rarity: 0.7, // Moderate
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "bud",
      duration: 12,
      primitives: [
        // Small bud center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 6),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 18),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.5,
      fillColor: "#E8B888", // Peach bud
      fillOpacity: 0.4,
      scale: 0.6,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "unfurl",
      duration: 15,
      primitives: [
        // Growing center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 8),
        // Initial petal hints (5 directions)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER, VECTOR_CENTER - 20),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER - 12, VECTOR_CENTER - 10, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 12, VECTOR_CENTER + 10, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER - 6, VECTOR_CENTER - 14, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 6, VECTOR_CENTER + 14, VECTOR_CENTER - 8),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 18),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.7,
      fillColor: "#E8B888", // Warming peach
      fillOpacity: 0.5,
      scale: 0.8,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "bloom",
      duration: 20,
      primitives: [
        // Golden center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 6),
        // Layer 1 petals (8 directions)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER, VECTOR_CENTER - 22),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER - 12, VECTOR_CENTER - 14, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 12, VECTOR_CENTER + 14, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 6, VECTOR_CENTER - 18, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER - 6, VECTOR_CENTER + 18, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER + 2),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER, VECTOR_CENTER + 16, VECTOR_CENTER + 2),
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER - 4, VECTOR_CENTER - 8, VECTOR_CENTER - 2),
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER - 4, VECTOR_CENTER + 8, VECTOR_CENTER - 2),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER + 20),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.9,
      fillColor: "#E8B888", // Bright peach center
      fillOpacity: 0.6,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "sparkle",
      duration: 8,
      primitives: [
        // Bright center star
        vectorStar(VECTOR_CENTER, VECTOR_CENTER - 8, 8, 4, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 3),
        // Sparkle rays (12 directions for radiance)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER, VECTOR_CENTER - 24),
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 12, VECTOR_CENTER - 18, VECTOR_CENTER - 20),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER - 12, VECTOR_CENTER + 18, VECTOR_CENTER - 20),
        vectorLine(VECTOR_CENTER - 12, VECTOR_CENTER - 6, VECTOR_CENTER - 22, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER + 12, VECTOR_CENTER - 6, VECTOR_CENTER + 22, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER + 2, VECTOR_CENTER - 20, VECTOR_CENTER + 4),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER + 2, VECTOR_CENTER + 20, VECTOR_CENTER + 4),
        // Dewdrop sparkle points
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 14, 1.5),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER - 14, 1.5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 26, 1.5),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER, VECTOR_CENTER + 20),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 1.0,
      fillColor: "#90B8E8", // Sky blue sparkle
      fillOpacity: 0.6,
      scale: 1.05,
      transitionHint: { strategy: "fade", easing: "easeInOut" },
    },
    {
      name: "bloom-2",
      duration: 25,
      primitives: [
        // Golden center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 6),
        // Layer 1 petals (8 directions)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER, VECTOR_CENTER - 22),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER - 12, VECTOR_CENTER - 14, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 12, VECTOR_CENTER + 14, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 6, VECTOR_CENTER - 18, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER - 6, VECTOR_CENTER + 18, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER + 2),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER, VECTOR_CENTER + 16, VECTOR_CENTER + 2),
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER - 4, VECTOR_CENTER - 8, VECTOR_CENTER - 2),
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER - 4, VECTOR_CENTER + 8, VECTOR_CENTER - 2),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER + 20),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.9,
      fillColor: "#E8B888", // Back to peach
      fillOpacity: 0.6,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "fade",
      duration: 20,
      primitives: [
        // Fading center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 3),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 5),
        // Drooping petals
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER - 2, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER - 8, VECTOR_CENTER - 10, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 8, VECTOR_CENTER + 10, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER - 4, VECTOR_CENTER - 12, VECTOR_CENTER - 4),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 4, VECTOR_CENTER + 12, VECTOR_CENTER - 4),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 16),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.5,
      fillColor: "#D8D0C8", // Faded neutral
      fillOpacity: 0.4,
      scale: 0.85,
      transitionHint: { strategy: "fade", easing: "easeInOut" },
    },
  ],
};

/**
 * Midnight Poppy (Vector)
 *
 * A dramatic flower with deep, rich colors and a dramatic open/close cycle.
 * Uncommon rarity - visually striking and memorable.
 * Scale: 1.1x (slightly larger for drama)
 */
const midnightPoppy: PlantVariant = {
  id: "midnight-poppy",
  name: "Midnight Poppy",
  description: "A dramatic poppy with deep colors that opens and closes in a mesmerizing cycle",
  rarity: 0.4, // Uncommon
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true, // Continuously opens and closes
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "closed",
      duration: 15,
      primitives: [
        // Closed bud - tight cup shape
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 4),
        // Tight petals folded up
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER - 2, VECTOR_CENTER - 3, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER - 2, VECTOR_CENTER + 3, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 2, VECTOR_CENTER, VECTOR_CENTER - 16),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER + 18),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#E89090", // Coral fill
      fillOpacity: 0.4,
      scale: 0.75,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "opening",
      duration: 12,
      primitives: [
        // Dark center emerging
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 7),
        // Petals starting to unfurl (cup opening)
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 14, 4),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 14, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 4),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER + 18),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#E89090", // Coral fill
      fillOpacity: 0.5,
      scale: 0.9,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "open",
      duration: 30,
      primitives: [
        // Dark dramatic center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 4, 3),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 4, 5),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER - 4, 6, 3, 5),
        // Full open petals - dramatic spread
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 6, 7),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 6, 7),
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 16, 6),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 16, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 20, 6),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER - 12, 5),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER - 12, 5),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER, VECTOR_CENTER + 20),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#E89090", // Coral fill
      fillOpacity: 0.65,
      scale: 1.1,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "closing",
      duration: 12,
      primitives: [
        // Center retreating
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 7),
        // Petals curling back inward
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 14, 4),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 14, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 4),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER + 18),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#E89090", // Coral fill
      fillOpacity: 0.5,
      scale: 0.95,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};

/**
 * Bell Cluster
 *
 * Multiple hanging bell-shaped flowers that bloom in sequence.
 * Uncommon rarity - staggered animation is visually interesting.
 * Scale: 1.2x (taller due to hanging structure)
 */
/**
 * Bell Cluster (Vector)
 *
 * Multiple hanging bell-shaped flowers that bloom in sequence.
 * Uncommon rarity - staggered animation is visually interesting.
 * Scale: 1.2x (taller due to hanging structure)
 */
const bellCluster: PlantVariant = {
  id: "bell-cluster",
  name: "Bell Cluster",
  description: "Delicate bells that bloom one after another in a gentle cascade",
  rarity: 0.4, // Uncommon
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "buds",
      duration: 18,
      primitives: [
        // Main stem arching over
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 18, VECTOR_CENTER, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER - 8, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER + 8, VECTOR_CENTER - 10),
        // Three closed bell buds hanging down
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER - 12, VECTOR_CENTER - 10, VECTOR_CENTER - 4),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 2, 3),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER, VECTOR_CENTER),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 2, 3),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 10, VECTOR_CENTER + 10, VECTOR_CENTER - 2),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.35,
      scale: 0.7,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "first",
      duration: 15,
      primitives: [
        // Main stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 18, VECTOR_CENTER, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER - 10, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER + 8, VECTOR_CENTER - 12),
        // First bell open (left)
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 14, VECTOR_CENTER - 12, VECTOR_CENTER - 4),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 2, 4),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 2, 5),
        // Second bell still closed
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER, VECTOR_CENTER),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 2, 3),
        // Third bell still closed
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 12, VECTOR_CENTER + 10, VECTOR_CENTER - 2),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.45,
      scale: 0.85,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "second",
      duration: 15,
      primitives: [
        // Main stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 18, VECTOR_CENTER, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER - 12, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER + 10, VECTOR_CENTER - 14),
        // First bell open (left)
        vectorLine(VECTOR_CENTER - 12, VECTOR_CENTER - 16, VECTOR_CENTER - 14, VECTOR_CENTER - 4),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER - 2, 4),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER + 3, 5),
        // Second bell open (center)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 12, VECTOR_CENTER, VECTOR_CENTER),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 2, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 6, 5),
        // Third bell still closed
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER - 14, VECTOR_CENTER + 12, VECTOR_CENTER - 2),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.5,
      scale: 0.95,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "full",
      duration: 40,
      primitives: [
        // Main stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 20, VECTOR_CENTER, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 12, VECTOR_CENTER - 14, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 12, VECTOR_CENTER + 12, VECTOR_CENTER - 16),
        // All three bells fully open
        // Left bell
        vectorLine(VECTOR_CENTER - 14, VECTOR_CENTER - 18, VECTOR_CENTER - 16, VECTOR_CENTER - 6),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 4, 5),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER + 2, 6),
        // Center bell (slightly lower)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER, VECTOR_CENTER - 2),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 6, 6),
        // Right bell
        vectorLine(VECTOR_CENTER + 12, VECTOR_CENTER - 16, VECTOR_CENTER + 14, VECTOR_CENTER - 4),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER - 2, 5),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER + 4, 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.2,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "fade",
      duration: 20,
      primitives: [
        // Main stem drooping slightly
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 18, VECTOR_CENTER, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER - 10, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER + 8, VECTOR_CENTER - 10),
        // Fading bells
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 12, VECTOR_CENTER - 12, VECTOR_CENTER - 4),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 2, 4),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 2, 4),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER, VECTOR_CENTER - 2),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 4, 4),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 10, VECTOR_CENTER + 10, VECTOR_CENTER - 2),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER + 4, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.35,
      scale: 1.0,
      transitionHint: { strategy: "fade", easing: "easeInOut" },
    },
  ],
};

// ============================================================================
// GROUND COVER - Very common, simple, ambient background elements
// ============================================================================

/**
 * Soft Moss (Vector)
 *
 * A very common ground cover rendered with soft vector circles.
 * Minimal visual interest - just ambient texture.
 * Scale: 0.4x (small)
 */
const softMoss: PlantVariant = {
  id: "soft-moss",
  name: "Soft Moss",
  description: "A gentle ground cover that spreads slowly across the garden floor",
  rarity: 1.2, // Very common
  requiresObservationToGerminate: false, // Grows without observation
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 540,
    clusterBonus: 2.5,
    maxClusterDensity: 6,
    reseedClusterChance: 0.8,
  },
  keyframes: [],
  vectorKeyframes: [
    {
      name: "emerging",
      duration: 30,
      primitives: [
        // Central soft cluster
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        // Scattered spores emerging
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 4, 2),
        vectorCircle(VECTOR_CENTER + 5, VECTOR_CENTER - 3, 2),
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER + 5, 2),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER + 4, 1.5),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.6,
      fillColor: "#A8D8A8", // Sage green
      fillOpacity: 0.4,
      scale: 0.3,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "settled",
      duration: 120,
      primitives: [
        // Fuller moss cluster
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 14),
        // Scattered outer circles
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 6, 3),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 5, 3),
        vectorCircle(VECTOR_CENTER - 7, VECTOR_CENTER + 8, 3),
        vectorCircle(VECTOR_CENTER + 9, VECTOR_CENTER + 6, 2.5),
        vectorCircle(VECTOR_CENTER - 3, VECTOR_CENTER - 10, 2),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER + 10, 2),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 2, 2),
        vectorCircle(VECTOR_CENTER + 11, VECTOR_CENTER - 1, 2),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.7,
      fillColor: "#88D0D0", // Mint
      fillOpacity: 0.5,
      scale: 0.4,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};

/**
 * Pebble Patch (Vector)
 *
 * Scattered circles representing small stones.
 * Completely static - the simplest possible variant.
 * Scale: 0.35x (tiny)
 */
const pebblePatch: PlantVariant = {
  id: "pebble-patch",
  name: "Pebble Patch",
  description: "Tiny stones scattered on the garden floor",
  rarity: 1.3, // Most common
  requiresObservationToGerminate: false,
  renderMode: "vector",
  tweenBetweenKeyframes: false,
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 360,
    clusterBonus: 2.0,
    maxClusterDensity: 8,
    reseedClusterChance: 0.7,
  },
  keyframes: [],
  vectorKeyframes: [
    {
      name: "stones",
      duration: 999,
      primitives: [
        // Scattered pebbles of varying sizes
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 6, 3),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 4, 2.5),
        vectorCircle(VECTOR_CENTER - 3, VECTOR_CENTER + 5, 2),
        vectorCircle(VECTOR_CENTER + 9, VECTOR_CENTER + 3, 2.5),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER + 2, 2),
        vectorCircle(VECTOR_CENTER + 2, VECTOR_CENTER - 8, 2),
        vectorCircle(VECTOR_CENTER - 5, VECTOR_CENTER - 2, 1.5),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER + 7, 2),
        vectorCircle(VECTOR_CENTER - 1, VECTOR_CENTER + 10, 1.5),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 7, 2),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.6,
      fillColor: "#D8D0C8", // Warm stone
      fillOpacity: 0.5,
      scale: 0.35,
    },
  ],
};

// ============================================================================
// GRASSES - Common, gentle motion, fill space
// ============================================================================

/**
 * Meadow Tuft (Vector)
 *
 * A cluster of grass blades that gently sways back and forth.
 * Simple 2-frame loop for subtle motion using vector lines.
 * Scale: 0.6x
 */
const meadowTuft: PlantVariant = {
  id: "meadow-tuft",
  name: "Meadow Tuft",
  description: "A small cluster of grass that sways gently in an invisible breeze",
  rarity: 1.1, // Very common
  requiresObservationToGerminate: false,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 450,
    clusterBonus: 1.5,
    maxClusterDensity: 4,
    reseedClusterChance: 0.5,
  },
  keyframes: [],
  vectorKeyframes: [
    {
      name: "sway-left",
      duration: 4,
      primitives: [
        // Grass blades leaning left
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER + 14, VECTOR_CENTER - 10, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER - 2, VECTOR_CENTER + 14, VECTOR_CENTER - 5, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER + 2, VECTOR_CENTER + 14, VECTOR_CENTER, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER + 14, VECTOR_CENTER + 4, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER + 14, VECTOR_CENTER + 8, VECTOR_CENTER - 10),
        // Base cluster
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 14, 4),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.8,
      fillColor: "#A8D8A8", // Sage green (for base cluster)
      fillOpacity: 0.6,
      scale: 0.6,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "sway-right",
      duration: 4,
      primitives: [
        // Grass blades leaning right
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER + 14, VECTOR_CENTER - 4, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER - 2, VECTOR_CENTER + 14, VECTOR_CENTER + 1, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER + 2, VECTOR_CENTER + 14, VECTOR_CENTER + 4, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER + 14, VECTOR_CENTER + 9, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER + 14, VECTOR_CENTER + 14, VECTOR_CENTER - 12),
        // Base cluster
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 14, 4),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.8,
      fillColor: "#A8D8A8", // Sage green
      fillOpacity: 0.6,
      scale: 0.6,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};

/**
 * Whisper Reed (Vector)
 *
 * Tall thin reeds that lean slightly in the wind.
 * Taller and thinner than meadow tuft.
 * Scale: 0.75x
 */
const whisperReed: PlantVariant = {
  id: "whisper-reed",
  name: "Whisper Reed",
  description: "Tall thin reeds that sway with an invisible wind",
  rarity: 0.9, // Common
  requiresObservationToGerminate: false,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "lean-left",
      duration: 5,
      primitives: [
        // Tall reed stems leaning left
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER + 16, VECTOR_CENTER - 10, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 16, VECTOR_CENTER - 4, VECTOR_CENTER - 20),
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER + 16, VECTOR_CENTER + 2, VECTOR_CENTER - 18),
        // Reed tips (small circles)
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 19, 1.5),
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER - 21, 1.5),
        vectorCircle(VECTOR_CENTER + 2, VECTOR_CENTER - 19, 1.5),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.7,
      fillColor: "#C8E0C0", // Light sage
      fillOpacity: 0.5,
      scale: 0.75,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "lean-right",
      duration: 5,
      primitives: [
        // Tall reed stems leaning right
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER + 16, VECTOR_CENTER - 2, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 16, VECTOR_CENTER + 4, VECTOR_CENTER - 20),
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER + 16, VECTOR_CENTER + 10, VECTOR_CENTER - 18),
        // Reed tips (small circles)
        vectorCircle(VECTOR_CENTER - 2, VECTOR_CENTER - 19, 1.5),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER - 21, 1.5),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 19, 1.5),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.7,
      fillColor: "#C8E0C0", // Light sage
      fillOpacity: 0.5,
      scale: 0.75,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};

// ============================================================================
// SHRUBS - Uncommon, mid-ground structure elements with more complex patterns
// ============================================================================

/**
 * Cloud Bush (Vector)
 *
 * A rounded, puffy shrub with a breathing scale animation.
 * Berry details appear at maturity.
 * Scale: 1.3x (medium structure)
 */
const cloudBush: PlantVariant = {
  id: "cloud-bush",
  name: "Cloud Bush",
  description: "A soft, rounded shrub that breathes gently and grows delicate berries",
  rarity: 0.4, // Uncommon
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true, // Breathing animation loops
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "base",
      duration: 25,
      primitives: [
        // Base puffy circles (cloud shape)
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 4, 10),
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER + 2, 7),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER + 2, 7),
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER - 4, 6),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER - 4, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 5),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.6,
      fillColor: "#A8D8A8", // Sage green
      fillOpacity: 0.5,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "full",
      duration: 20,
      primitives: [
        // Fuller, expanded cloud shape
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 6, 12),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER + 3, 9),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER + 3, 9),
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 5, 8),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 5, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 7),
        // Extra fluff
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER, 5),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER, 5),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.7,
      fillColor: "#88D0D0", // Mint
      fillOpacity: 0.6,
      scale: 1.2,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "breathe-in",
      duration: 6,
      primitives: [
        // Slightly contracted
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 5, 11),
        vectorCircle(VECTOR_CENTER - 9, VECTOR_CENTER + 2, 8),
        vectorCircle(VECTOR_CENTER + 9, VECTOR_CENTER + 2, 8),
        vectorCircle(VECTOR_CENTER - 5, VECTOR_CENTER - 4, 7),
        vectorCircle(VECTOR_CENTER + 5, VECTOR_CENTER - 4, 7),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 7, 6),
        vectorCircle(VECTOR_CENTER - 13, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER + 13, VECTOR_CENTER, 4),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.75,
      fillColor: "#88D0D0", // Mint
      fillOpacity: 0.6,
      scale: 1.15,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "breathe-out",
      duration: 6,
      primitives: [
        // Expanded breathing
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 7, 13),
        vectorCircle(VECTOR_CENTER - 11, VECTOR_CENTER + 4, 10),
        vectorCircle(VECTOR_CENTER + 11, VECTOR_CENTER + 4, 10),
        vectorCircle(VECTOR_CENTER - 7, VECTOR_CENTER - 5, 9),
        vectorCircle(VECTOR_CENTER + 7, VECTOR_CENTER - 5, 9),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 9, 8),
        vectorCircle(VECTOR_CENTER - 15, VECTOR_CENTER + 1, 6),
        vectorCircle(VECTOR_CENTER + 15, VECTOR_CENTER + 1, 6),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.8,
      fillColor: "#90B8E8", // Sky blue
      fillOpacity: 0.5,
      scale: 1.25,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "berried",
      duration: 40,
      primitives: [
        // Full bush with berries
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 8, 14),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 5, 11),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER + 5, 11),
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 6, 10),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 6, 10),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 10, 9),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER + 2, 7),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER + 2, 7),
        // Berry clusters (small circles)
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER + 10, 2),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER + 12, 2),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER + 8, 2),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER + 9, 2),
        vectorCircle(VECTOR_CENTER - 2, VECTOR_CENTER + 6, 1.5),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER + 7, 1.5),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.9,
      fillColor: "#E89090", // Coral for berries
      fillOpacity: 0.6,
      scale: 1.3,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};

/**
 * Berry Thicket (Vector)
 *
 * A dense shrub with fruits that materialize over its lifecycle.
 * More complex than cloud-bush with a full fruiting progression.
 * Scale: 1.4x (larger structure)
 */
const berryThicket: PlantVariant = {
  id: "berry-thicket",
  name: "Berry Thicket",
  description: "A dense thicket that slowly produces clusters of vibrant berries",
  rarity: 0.4, // Uncommon
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "sparse",
      duration: 20,
      primitives: [
        // Sparse branches
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 16, VECTOR_CENTER, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER - 10, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER + 8, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER - 8, VECTOR_CENTER - 2),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER + 10, VECTOR_CENTER),
        // Sparse leaves
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 12, 4),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 10, 4),
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 2, 3),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER, 3),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.6,
      fillColor: "#A8D8A8", // Sage green
      fillOpacity: 0.4,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "growing",
      duration: 25,
      primitives: [
        // Denser branches
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 16, VECTOR_CENTER, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 6, VECTOR_CENTER - 12, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 6, VECTOR_CENTER + 10, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER - 14, VECTOR_CENTER - 6),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER + 14, VECTOR_CENTER - 4),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER - 10, VECTOR_CENTER - 16, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 8, VECTOR_CENTER + 14, VECTOR_CENTER - 12),
        // Fuller leaves
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 16, 5),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 14, 5),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER - 6, 5),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER - 4, 5),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 14, 4),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER - 12, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 12, 4),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.7,
      fillColor: "#A8D8A8", // Sage green
      fillOpacity: 0.5,
      scale: 1.2,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "fruiting",
      duration: 30,
      primitives: [
        // Full branches
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 18, VECTOR_CENTER, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER - 14, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER + 12, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 16, VECTOR_CENTER - 6),
        // Foliage
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER - 18, 6),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 16, 6),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 8, 6),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER - 6, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 14, 5),
        // Early berries
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 16, 2),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 14, 2),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 6, 2),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 4, 2),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.8,
      fillColor: "#E89090", // Coral for berries
      fillOpacity: 0.5,
      scale: 1.3,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "ripe",
      duration: 45,
      primitives: [
        // Full dense branches
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 20, VECTOR_CENTER, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER - 16, VECTOR_CENTER - 22),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER + 14, VECTOR_CENTER - 20),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 2, VECTOR_CENTER - 18, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 2, VECTOR_CENTER + 18, VECTOR_CENTER - 10),
        // Dense foliage
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 22, 7),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER - 20, 7),
        vectorCircle(VECTOR_CENTER - 18, VECTOR_CENTER - 12, 7),
        vectorCircle(VECTOR_CENTER + 18, VECTOR_CENTER - 10, 7),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 6),
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 18, 5),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 18, 5),
        // Ripe berry clusters
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 20, 2.5),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER - 18, 2.5),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 18, 2.5),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 16, 2.5),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 10, 2.5),
        vectorCircle(VECTOR_CENTER - 18, VECTOR_CENTER - 8, 2.5),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER - 8, 2.5),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER - 6, 2.5),
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER - 14, 2),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER - 14, 2),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.9,
      fillColor: "#E89090", // Vibrant coral berries
      fillOpacity: 0.7,
      scale: 1.4,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};

// ============================================================================
// TREES - Rare, landmark elements with impressive patterns
// ============================================================================

/**
 * Sapling Hope (Vector)
 *
 * A delicate young tree with branches and leaves that unfurl progressively.
 * Rare and memorable - a hopeful discovery in the garden.
 * Scale: 1.8x (larger landmark)
 */
const saplingHope: PlantVariant = {
  id: "sapling-hope",
  name: "Sapling Hope",
  description: "A young tree whose leaves unfurl one by one, symbol of new growth",
  rarity: 0.3, // Rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "seedling",
      duration: 20,
      primitives: [
        // Tiny seedling stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 14, VECTOR_CENTER, VECTOR_CENTER - 4),
        // First tiny leaves
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER - 6, 3),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER - 6, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.3,
      scale: 0.6,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "sprout",
      duration: 25,
      primitives: [
        // Growing trunk
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 16, VECTOR_CENTER, VECTOR_CENTER - 8),
        // First branch pair
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER - 8, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER + 8, VECTOR_CENTER - 10),
        // Growing leaves
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 10, 4),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 10, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 12, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.4,
      scale: 0.9,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "growing",
      duration: 30,
      primitives: [
        // Stronger trunk
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 18, VECTOR_CENTER, VECTOR_CENTER - 12),
        // Lower branches
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER - 12, VECTOR_CENTER - 4),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER + 12, VECTOR_CENTER - 4),
        // Upper branches
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 6, VECTOR_CENTER - 10, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 6, VECTOR_CENTER + 10, VECTOR_CENTER - 14),
        // Crown leaves
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 4, 5),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 4, 5),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 14, 5),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 14, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.5,
      scale: 1.2,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "young",
      duration: 40,
      primitives: [
        // Strong trunk
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 20, VECTOR_CENTER, VECTOR_CENTER - 16),
        // Lower branches
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 6, VECTOR_CENTER - 16, VECTOR_CENTER - 2),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 6, VECTOR_CENTER + 16, VECTOR_CENTER - 2),
        // Middle branches
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER - 14, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER + 14, VECTOR_CENTER - 14),
        // Upper branches
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER - 10, VECTOR_CENTER - 20),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER + 10, VECTOR_CENTER - 20),
        // Full crown
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 2, 6),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER - 2, 6),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER - 14, 6),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER - 14, 6),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 20, 5),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 20, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 22, 5),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.8,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.55,
      scale: 1.5,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "mature",
      duration: 60,
      primitives: [
        // Mature trunk
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 22, VECTOR_CENTER, VECTOR_CENTER - 18),
        // Lower branches
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 8, VECTOR_CENTER - 18, VECTOR_CENTER),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 8, VECTOR_CENTER + 18, VECTOR_CENTER),
        // Middle branches
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 2, VECTOR_CENTER - 16, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 2, VECTOR_CENTER + 16, VECTOR_CENTER - 12),
        // Upper branches
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER - 12, VECTOR_CENTER - 22),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER + 12, VECTOR_CENTER - 22),
        // Top crown
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER, VECTOR_CENTER - 26),
        // Dense mature crown
        vectorCircle(VECTOR_CENTER - 18, VECTOR_CENTER, 7),
        vectorCircle(VECTOR_CENTER + 18, VECTOR_CENTER, 7),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 12, 7),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER - 12, 7),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 22, 6),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 22, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 26, 6),
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 18, 5),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 18, 5),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.9,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.6,
      scale: 1.8,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};

/**
 * Weeping Willow (Vector)
 *
 * A tall tree with cascading fronds that sway in a gentle wave.
 * Rare and calming - creates a sense of shelter and peace.
 * Scale: 2.5x (tall landmark)
 */
const weepingWillow: PlantVariant = {
  id: "weeping-willow",
  name: "Weeping Willow",
  description: "A graceful tree with cascading fronds that dance in invisible wind",
  rarity: 0.25, // Rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true, // Continuous gentle sway
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "sapling",
      duration: 25,
      primitives: [
        // Young trunk
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 20, VECTOR_CENTER, VECTOR_CENTER - 8),
        // Early drooping branches
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER - 8, VECTOR_CENTER + 6),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER + 8, VECTOR_CENTER + 6),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 6, VECTOR_CENTER - 6, VECTOR_CENTER + 2),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 6, VECTOR_CENTER + 6, VECTOR_CENTER + 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.3,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "growing",
      duration: 30,
      primitives: [
        // Growing trunk
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 22, VECTOR_CENTER, VECTOR_CENTER - 14),
        // Upper branches (arch up then droop)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER - 10, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER + 10, VECTOR_CENTER - 16),
        // Cascading fronds
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 16, VECTOR_CENTER - 14, VECTOR_CENTER + 4),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER - 16, VECTOR_CENTER + 14, VECTOR_CENTER + 4),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER - 14, VECTOR_CENTER - 8, VECTOR_CENTER + 6),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 14, VECTOR_CENTER + 8, VECTOR_CENTER + 6),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 12, VECTOR_CENTER - 2, VECTOR_CENTER + 8),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 12, VECTOR_CENTER + 2, VECTOR_CENTER + 8),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.4,
      scale: 1.5,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "full",
      duration: 15,
      primitives: [
        // Full trunk
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 24, VECTOR_CENTER, VECTOR_CENTER - 18),
        // Upper branches arching
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER - 14, VECTOR_CENTER - 22),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER + 14, VECTOR_CENTER - 22),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER - 8, VECTOR_CENTER - 24),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER + 8, VECTOR_CENTER - 24),
        // Full cascading fronds
        vectorLine(VECTOR_CENTER - 14, VECTOR_CENTER - 22, VECTOR_CENTER - 18, VECTOR_CENTER + 8),
        vectorLine(VECTOR_CENTER + 14, VECTOR_CENTER - 22, VECTOR_CENTER + 18, VECTOR_CENTER + 8),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER - 24, VECTOR_CENTER - 12, VECTOR_CENTER + 10),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 24, VECTOR_CENTER + 12, VECTOR_CENTER + 10),
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER - 20, VECTOR_CENTER - 6, VECTOR_CENTER + 12),
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER - 20, VECTOR_CENTER + 6, VECTOR_CENTER + 12),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 18, VECTOR_CENTER, VECTOR_CENTER + 14),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.5,
      scale: 2.0,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "sway-left",
      duration: 8,
      primitives: [
        // Trunk
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 26, VECTOR_CENTER, VECTOR_CENTER - 20),
        // Branches arching
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER - 16, VECTOR_CENTER - 24),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER + 12, VECTOR_CENTER - 22),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 18, VECTOR_CENTER - 10, VECTOR_CENTER - 26),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 18, VECTOR_CENTER + 6, VECTOR_CENTER - 24),
        // Fronds swaying left
        vectorLine(VECTOR_CENTER - 16, VECTOR_CENTER - 24, VECTOR_CENTER - 24, VECTOR_CENTER + 6),
        vectorLine(VECTOR_CENTER + 12, VECTOR_CENTER - 22, VECTOR_CENTER + 8, VECTOR_CENTER + 8),
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 26, VECTOR_CENTER - 18, VECTOR_CENTER + 10),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 24, VECTOR_CENTER + 2, VECTOR_CENTER + 12),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER - 22, VECTOR_CENTER - 12, VECTOR_CENTER + 12),
        vectorLine(VECTOR_CENTER + 2, VECTOR_CENTER - 20, VECTOR_CENTER - 4, VECTOR_CENTER + 14),
        vectorLine(VECTOR_CENTER - 2, VECTOR_CENTER - 18, VECTOR_CENTER - 8, VECTOR_CENTER + 16),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.8,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.55,
      scale: 2.3,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "sway-right",
      duration: 8,
      primitives: [
        // Trunk
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 26, VECTOR_CENTER, VECTOR_CENTER - 20),
        // Branches arching
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER - 12, VECTOR_CENTER - 22),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER + 16, VECTOR_CENTER - 24),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 18, VECTOR_CENTER - 6, VECTOR_CENTER - 24),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 18, VECTOR_CENTER + 10, VECTOR_CENTER - 26),
        // Fronds swaying right
        vectorLine(VECTOR_CENTER - 12, VECTOR_CENTER - 22, VECTOR_CENTER - 8, VECTOR_CENTER + 8),
        vectorLine(VECTOR_CENTER + 16, VECTOR_CENTER - 24, VECTOR_CENTER + 24, VECTOR_CENTER + 6),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER - 24, VECTOR_CENTER - 2, VECTOR_CENTER + 12),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER - 26, VECTOR_CENTER + 18, VECTOR_CENTER + 10),
        vectorLine(VECTOR_CENTER - 2, VECTOR_CENTER - 20, VECTOR_CENTER + 4, VECTOR_CENTER + 14),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 22, VECTOR_CENTER + 12, VECTOR_CENTER + 12),
        vectorLine(VECTOR_CENTER + 2, VECTOR_CENTER - 18, VECTOR_CENTER + 8, VECTOR_CENTER + 16),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.8,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.55,
      scale: 2.3,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "rest",
      duration: 12,
      primitives: [
        // Full trunk
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 28, VECTOR_CENTER, VECTOR_CENTER - 22),
        // Upper branches arching
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 18, VECTOR_CENTER - 16, VECTOR_CENTER - 26),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 18, VECTOR_CENTER + 16, VECTOR_CENTER - 26),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 20, VECTOR_CENTER - 10, VECTOR_CENTER - 28),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 20, VECTOR_CENTER + 10, VECTOR_CENTER - 28),
        // Full resting fronds
        vectorLine(VECTOR_CENTER - 16, VECTOR_CENTER - 26, VECTOR_CENTER - 20, VECTOR_CENTER + 10),
        vectorLine(VECTOR_CENTER + 16, VECTOR_CENTER - 26, VECTOR_CENTER + 20, VECTOR_CENTER + 10),
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 28, VECTOR_CENTER - 14, VECTOR_CENTER + 14),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER - 28, VECTOR_CENTER + 14, VECTOR_CENTER + 14),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER - 24, VECTOR_CENTER - 8, VECTOR_CENTER + 16),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 24, VECTOR_CENTER + 8, VECTOR_CENTER + 16),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 22, VECTOR_CENTER, VECTOR_CENTER + 18),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.9,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.6,
      scale: 2.5,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};

// ============================================================================
// ETHEREAL - Rare, magical/quantum elements
// ============================================================================

/**
 * Pulsing Orb (Vector)
 *
 * An ethereal orb that continuously pulses with soft light.
 * Rare and magical - a special discovery in the garden.
 * Scale: 1.0x (standard, but feels larger due to glow)
 */
const pulsingOrb: PlantVariant = {
  id: "pulsing-orb",
  name: "Pulsing Orb",
  description: "An ethereal orb that gently pulses with morning light",
  rarity: 0.3, // Rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true, // Loops forever
  tweenBetweenKeyframes: true, // Smooth transitions
  keyframes: [],
  vectorKeyframes: [
    {
      name: "dim",
      duration: 8,
      primitives: [
        // Dim orb - concentric circles
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 14),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 18),
        // 4-point star
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 20, 10, 4),
        // Corner sparkle dots
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 16, 2),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER - 16, 2),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER + 16, 2),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER + 16, 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.3,
      scale: 0.9,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "bright",
      duration: 5,
      primitives: [
        // Bright orb - dense center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 16),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 22),
        // Bright star burst
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 24, 12, 8),
        // Energy rings
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 26),
        // Sparkle points
        vectorCircle(VECTOR_CENTER - 20, VECTOR_CENTER - 20, 2.5),
        vectorCircle(VECTOR_CENTER + 20, VECTOR_CENTER - 20, 2.5),
        vectorCircle(VECTOR_CENTER - 20, VECTOR_CENTER + 20, 2.5),
        vectorCircle(VECTOR_CENTER + 20, VECTOR_CENTER + 20, 2.5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 28, 2),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 28, 2),
        vectorCircle(VECTOR_CENTER - 28, VECTOR_CENTER, 2),
        vectorCircle(VECTOR_CENTER + 28, VECTOR_CENTER, 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.8,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.6,
      scale: 1.1,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};

/**
 * Fractal Bloom
 *
 * A self-similar recursive pattern that grows in complexity.
 * Rare abstract ethereal variant.
 * Scale: 1.0x (standard)
 */
/**
 * Fractal Bloom (Vector)
 *
 * A self-similar recursive pattern that grows in complexity.
 * Rare abstract ethereal variant.
 * Scale: 1.0x (standard)
 */
const fractalBloom: PlantVariant = {
  id: "fractal-bloom",
  name: "Fractal Bloom",
  description: "A mesmerizing recursive pattern that grows in self-similar complexity",
  rarity: 0.2, // Rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "seed",
      duration: 15,
      primitives: [
        // Central seed
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        // First fractal branches (3)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER + 6),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 10, VECTOR_CENTER + 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.35,
      scale: 0.7,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "sprout",
      duration: 20,
      primitives: [
        // Center grows
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
        // Main branches
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER + 8),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 14, VECTOR_CENTER + 8),
        // Sub-branches (first recursion)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER - 6, VECTOR_CENTER - 22),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER + 6, VECTOR_CENTER - 22),
        vectorLine(VECTOR_CENTER - 14, VECTOR_CENTER + 8, VECTOR_CENTER - 20, VECTOR_CENTER + 4),
        vectorLine(VECTOR_CENTER + 14, VECTOR_CENTER + 8, VECTOR_CENTER + 20, VECTOR_CENTER + 4),
        // Small terminal circles
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 22, 3),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 22, 3),
        vectorCircle(VECTOR_CENTER - 20, VECTOR_CENTER + 4, 3),
        vectorCircle(VECTOR_CENTER + 20, VECTOR_CENTER + 4, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.65,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.45,
      scale: 0.85,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "bloom",
      duration: 60,
      primitives: [
        // Full fractal center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 12),
        // Main branches
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER - 20),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER - 17, VECTOR_CENTER + 10),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 17, VECTOR_CENTER + 10),
        // First recursion
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 20, VECTOR_CENTER - 8, VECTOR_CENTER - 28),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 20, VECTOR_CENTER + 8, VECTOR_CENTER - 28),
        vectorLine(VECTOR_CENTER - 17, VECTOR_CENTER + 10, VECTOR_CENTER - 25, VECTOR_CENTER + 4),
        vectorLine(VECTOR_CENTER - 17, VECTOR_CENTER + 10, VECTOR_CENTER - 22, VECTOR_CENTER + 18),
        vectorLine(VECTOR_CENTER + 17, VECTOR_CENTER + 10, VECTOR_CENTER + 25, VECTOR_CENTER + 4),
        vectorLine(VECTOR_CENTER + 17, VECTOR_CENTER + 10, VECTOR_CENTER + 22, VECTOR_CENTER + 18),
        // Second recursion (smaller)
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 28, 4),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 28, 4),
        vectorCircle(VECTOR_CENTER - 25, VECTOR_CENTER + 4, 4),
        vectorCircle(VECTOR_CENTER + 25, VECTOR_CENTER + 4, 4),
        vectorCircle(VECTOR_CENTER - 22, VECTOR_CENTER + 18, 4),
        vectorCircle(VECTOR_CENTER + 22, VECTOR_CENTER + 18, 4),
        // Tertiary details
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 24, 2),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 24, 2),
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER - 30, 2),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER - 30, 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};

/**
 * Phoenix Flame (Vector)
 *
 * A rising fire-like pattern with wing animations.
 * Very rare abstract ethereal variant.
 * Scale: 1.1x (slightly larger for drama)
 */
const phoenixFlame: PlantVariant = {
  id: "phoenix-flame",
  name: "Phoenix Flame",
  description: "Rising flames take the form of a mythical bird spreading its wings",
  rarity: 0.15, // Very rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "ember",
      duration: 12,
      primitives: [
        // Glowing ember core
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 8, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 8, 10),
        // Rising flame wisps
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER + 6, VECTOR_CENTER - 8, VECTOR_CENTER - 4),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER + 6, VECTOR_CENTER + 8, VECTOR_CENTER - 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.55,
      fillColor: "#E8B888", // Peach fill (ember)
      fillOpacity: 0.4,
      scale: 0.75,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "rising",
      duration: 15,
      primitives: [
        // Core flame
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 6, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 6, 9),
        // Rising flames
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER + 4, VECTOR_CENTER - 12, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER + 4, VECTOR_CENTER + 12, VECTOR_CENTER - 10),
        // Wing hints
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER - 4, VECTOR_CENTER - 16, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 4, VECTOR_CENTER + 16, VECTOR_CENTER - 8),
        // Flame tips
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 3),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 10, 3),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 10, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#E89090", // Coral fill (flame)
      fillOpacity: 0.5,
      scale: 0.95,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "blaze",
      duration: 25,
      primitives: [
        // Blazing core
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 4, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 4, 8),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 10, 5, 6),
        // Full phoenix form
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER - 22),
        // Left wing
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER - 8, VECTOR_CENTER - 20, VECTOR_CENTER - 4),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER - 6, VECTOR_CENTER - 24, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER - 12, VECTOR_CENTER - 8, VECTOR_CENTER - 22, VECTOR_CENTER - 16),
        // Right wing
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER - 8, VECTOR_CENTER + 20, VECTOR_CENTER - 4),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 6, VECTOR_CENTER + 24, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER + 12, VECTOR_CENTER - 8, VECTOR_CENTER + 22, VECTOR_CENTER - 16),
        // Flame tips
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 22, 4),
        vectorCircle(VECTOR_CENTER - 20, VECTOR_CENTER - 4, 3),
        vectorCircle(VECTOR_CENTER + 20, VECTOR_CENTER - 4, 3),
        vectorCircle(VECTOR_CENTER - 24, VECTOR_CENTER - 10, 3),
        vectorCircle(VECTOR_CENTER + 24, VECTOR_CENTER - 10, 3),
        vectorCircle(VECTOR_CENTER - 22, VECTOR_CENTER - 16, 3),
        vectorCircle(VECTOR_CENTER + 22, VECTOR_CENTER - 16, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#E89090", // Coral fill (full blaze)
      fillOpacity: 0.65,
      scale: 1.1,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};

/**
 * Crystal Cluster (Vector)
 *
 * Geometric crystal growth with faceted forms.
 * Rare abstract ethereal variant.
 * Scale: 0.9x (compact gem)
 */
const crystalCluster: PlantVariant = {
  id: "crystal-cluster",
  name: "Crystal Cluster",
  description: "Geometric crystals that grow with angular precision and inner light",
  rarity: 0.25, // Rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "nucleation",
      duration: 18,
      primitives: [
        // Initial crystal seed
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER, 6, 10),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.45,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.35,
      scale: 0.6,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "formation",
      duration: 25,
      primitives: [
        // Central crystal
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER, 8, 14),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        // Secondary crystals forming
        vectorDiamond(VECTOR_CENTER - 10, VECTOR_CENTER + 4, 5, 8),
        vectorDiamond(VECTOR_CENTER + 8, VECTOR_CENTER + 6, 4, 7),
        vectorDiamond(VECTOR_CENTER - 4, VECTOR_CENTER - 10, 4, 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.45,
      scale: 0.75,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "growth",
      duration: 50,
      primitives: [
        // Main crystal cluster
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER - 4, 10, 18),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 4, 6),
        // Surrounding crystals
        vectorDiamond(VECTOR_CENTER - 14, VECTOR_CENTER + 6, 6, 12),
        vectorDiamond(VECTOR_CENTER + 12, VECTOR_CENTER + 8, 5, 10),
        vectorDiamond(VECTOR_CENTER - 6, VECTOR_CENTER - 16, 5, 10),
        vectorDiamond(VECTOR_CENTER + 8, VECTOR_CENTER - 14, 4, 8),
        vectorDiamond(VECTOR_CENTER - 10, VECTOR_CENTER - 8, 4, 8),
        vectorDiamond(VECTOR_CENTER + 16, VECTOR_CENTER - 2, 4, 8),
        // Inner glow lines
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER - 14, VECTOR_CENTER + 6, VECTOR_CENTER - 14, VECTOR_CENTER - 2),
        vectorLine(VECTOR_CENTER + 12, VECTOR_CENTER + 8, VECTOR_CENTER + 12, VECTOR_CENTER + 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.8,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.55,
      scale: 0.9,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};

/**
 * Kaleidoscope Star (Vector)
 *
 * Rotating geometric-organic hybrid pattern.
 * Rare abstract ethereal variant with continuous rotation.
 * Scale: 1.15x (prominent display)
 */
const kaleidoscopeStar: PlantVariant = {
  id: "kaleidoscope-star",
  name: "Kaleidoscope Star",
  description: "A complex geometric pattern that rotates in mesmerizing symmetry",
  rarity: 0.2, // Rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "rotate1",
      duration: 10,
      primitives: [
        // Central star
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 12, 6, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        // Outer star rotated
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 20, 10, 8),
        // Concentric ring
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 16),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 24),
        // Cardinal diamonds
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER - 22, 4, 6),
        vectorDiamond(VECTOR_CENTER + 22, VECTOR_CENTER, 4, 6),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER + 22, 4, 6),
        vectorDiamond(VECTOR_CENTER - 22, VECTOR_CENTER, 4, 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.5,
      scale: 1.1,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "rotate2",
      duration: 10,
      primitives: [
        // Central star (rotated position)
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 14, 7, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 9),
        // Outer star
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 22, 11, 8),
        // Concentric rings
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 18),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 26),
        // Diagonal diamonds
        vectorDiamond(VECTOR_CENTER - 16, VECTOR_CENTER - 16, 4, 6),
        vectorDiamond(VECTOR_CENTER + 16, VECTOR_CENTER - 16, 4, 6),
        vectorDiamond(VECTOR_CENTER + 16, VECTOR_CENTER + 16, 4, 6),
        vectorDiamond(VECTOR_CENTER - 16, VECTOR_CENTER + 16, 4, 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.15,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};

/**
 * Vortex Spiral (Vector)
 *
 * Swirling energy pattern with dynamic motion.
 * Rare abstract ethereal variant with pulsing spiral arms.
 * Scale: 1.0x (standard)
 */
const vortexSpiral: PlantVariant = {
  id: "vortex-spiral",
  name: "Vortex Spiral",
  description: "Swirling energy spirals that pulse with hypnotic rhythm",
  rarity: 0.25, // Rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "calm",
      duration: 12,
      primitives: [
        // Calm center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 12),
        // Spiral arms (3)
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER, VECTOR_CENTER + 16, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER - 2, VECTOR_CENTER + 4, VECTOR_CENTER - 14, VECTOR_CENTER + 14),
        vectorLine(VECTOR_CENTER - 2, VECTOR_CENTER - 4, VECTOR_CENTER - 12, VECTOR_CENTER - 16),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.55,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.4,
      scale: 0.85,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "spin",
      duration: 8,
      primitives: [
        // Spinning center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 7),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 14),
        // Spiral arms extended
        vectorLine(VECTOR_CENTER + 5, VECTOR_CENTER - 2, VECTOR_CENTER + 20, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER + 4, VECTOR_CENTER - 18, VECTOR_CENTER + 16),
        vectorLine(VECTOR_CENTER - 1, VECTOR_CENTER - 5, VECTOR_CENTER - 14, VECTOR_CENTER - 20),
        // Spiral tips
        vectorCircle(VECTOR_CENTER + 20, VECTOR_CENTER - 14, 3),
        vectorCircle(VECTOR_CENTER - 18, VECTOR_CENTER + 16, 3),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER - 20, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.5,
      scale: 1.0,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "whirl",
      duration: 6,
      primitives: [
        // Intense whirling center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 16),
        // Whirling arms
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 4, VECTOR_CENTER + 24, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER - 5, VECTOR_CENTER + 5, VECTOR_CENTER - 22, VECTOR_CENTER + 18),
        vectorLine(VECTOR_CENTER - 1, VECTOR_CENTER - 6, VECTOR_CENTER - 16, VECTOR_CENTER - 24),
        // Energy particles
        vectorCircle(VECTOR_CENTER + 24, VECTOR_CENTER - 18, 4),
        vectorCircle(VECTOR_CENTER - 22, VECTOR_CENTER + 18, 4),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 24, 4),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 8, 4, 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.6,
      scale: 1.05,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};

/**
 * Nebula Bloom (Vector)
 *
 * Cosmic cloud-flower hybrid that forms from diffuse clouds.
 * Very rare abstract ethereal variant.
 * Scale: 1.2x (large cosmic display)
 */
const nebulaBloom: PlantVariant = {
  id: "nebula-bloom",
  name: "Nebula Bloom",
  description: "Cosmic clouds coalesce into a radiant bloom of stellar light",
  rarity: 0.15, // Very rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "drift",
      duration: 20,
      primitives: [
        // Diffuse cloud clusters
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 6, 8),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 4, 7),
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER + 8, 6),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER + 6, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.4,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.3,
      scale: 0.8,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "coalescence",
      duration: 25,
      primitives: [
        // Coalescing clouds
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 14),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 20),
        // Forming petals
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 6),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER + 8, 5),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER + 8, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 16, 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.4,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "radiance",
      duration: 60,
      primitives: [
        // Radiant stellar center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 12),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 16, 8, 8),
        // Full bloom petals
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 20, 8),
        vectorCircle(VECTOR_CENTER - 17, VECTOR_CENTER - 10, 7),
        vectorCircle(VECTOR_CENTER + 17, VECTOR_CENTER - 10, 7),
        vectorCircle(VECTOR_CENTER - 17, VECTOR_CENTER + 10, 7),
        vectorCircle(VECTOR_CENTER + 17, VECTOR_CENTER + 10, 7),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 20, 8),
        // Outer glow
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 26),
        // Stellar dust
        vectorCircle(VECTOR_CENTER - 22, VECTOR_CENTER - 18, 3),
        vectorCircle(VECTOR_CENTER + 22, VECTOR_CENTER - 18, 3),
        vectorCircle(VECTOR_CENTER - 24, VECTOR_CENTER + 14, 2),
        vectorCircle(VECTOR_CENTER + 24, VECTOR_CENTER + 14, 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.2,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};

/**
 * Aurora Wisp (Vector)
 *
 * Northern lights captured as flowing ethereal ribbons.
 * Shimmers and dances with aurora-like movement.
 * Loops for continuous ethereal flow.
 */
const auroraWisp: PlantVariant = {
  id: "aurora-wisp",
  name: "Aurora Wisp",
  description: "Northern lights captured in flowing ribbons of ethereal beauty",
  rarity: 0.18, // Very rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true, // Continuous flowing animation
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "shimmer",
      duration: 18,
      primitives: [
        // Soft flowing bezier ribbons (organic curves)
        vectorBezier(
          VECTOR_CENTER - 16,
          VECTOR_CENTER + 12, // start
          VECTOR_CENTER - 14,
          VECTOR_CENTER, // control 1
          VECTOR_CENTER - 6,
          VECTOR_CENTER - 4, // control 2
          VECTOR_CENTER - 8,
          VECTOR_CENTER - 8 // end
        ),
        vectorBezier(
          VECTOR_CENTER - 8,
          VECTOR_CENTER - 8, // start
          VECTOR_CENTER - 2,
          VECTOR_CENTER + 2, // control 1
          VECTOR_CENTER + 2,
          VECTOR_CENTER + 6, // control 2
          VECTOR_CENTER + 4,
          VECTOR_CENTER + 4 // end
        ),
        vectorBezier(
          VECTOR_CENTER + 4,
          VECTOR_CENTER + 4, // start
          VECTOR_CENTER + 8,
          VECTOR_CENTER, // control 1
          VECTOR_CENTER + 12,
          VECTOR_CENTER - 6, // control 2
          VECTOR_CENTER + 14,
          VECTOR_CENTER - 10 // end
        ),
        // Ethereal glow points
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 2, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 2, 5),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 4, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#88D0D0", // Mint fill
      fillOpacity: 0.4,
      scale: 0.85,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "flow",
      duration: 22,
      primitives: [
        // Flowing wave bezier ribbons
        vectorBezier(
          VECTOR_CENTER - 20,
          VECTOR_CENTER + 10, // start
          VECTOR_CENTER - 18,
          VECTOR_CENTER - 2, // control 1
          VECTOR_CENTER - 12,
          VECTOR_CENTER - 8, // control 2
          VECTOR_CENTER - 10,
          VECTOR_CENTER - 10 // end
        ),
        vectorBezier(
          VECTOR_CENTER - 10,
          VECTOR_CENTER - 10, // start
          VECTOR_CENTER - 6,
          VECTOR_CENTER, // control 1
          VECTOR_CENTER,
          VECTOR_CENTER + 8, // control 2
          VECTOR_CENTER + 2,
          VECTOR_CENTER + 6 // end
        ),
        vectorBezier(
          VECTOR_CENTER + 2,
          VECTOR_CENTER + 6, // start
          VECTOR_CENTER + 6,
          VECTOR_CENTER, // control 1
          VECTOR_CENTER + 12,
          VECTOR_CENTER - 8, // control 2
          VECTOR_CENTER + 16,
          VECTOR_CENTER - 12 // end
        ),
        vectorBezier(
          VECTOR_CENTER + 16,
          VECTOR_CENTER - 12, // start
          VECTOR_CENTER + 18,
          VECTOR_CENTER - 10, // control 1
          VECTOR_CENTER + 20,
          VECTOR_CENTER - 8, // control 2
          VECTOR_CENTER + 22,
          VECTOR_CENTER - 8 // end
        ),
        // Wave crests
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER, 5),
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER - 4, 6),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 2, 5),
        vectorCircle(VECTOR_CENTER + 18, VECTOR_CENTER - 10, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.65,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.5,
      scale: 1.0,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "dance",
      duration: 30,
      primitives: [
        // Dancing bezier ribbons in full flow
        vectorBezier(
          VECTOR_CENTER - 24,
          VECTOR_CENTER + 8, // start
          VECTOR_CENTER - 20,
          VECTOR_CENTER - 4, // control 1
          VECTOR_CENTER - 16,
          VECTOR_CENTER - 12, // control 2
          VECTOR_CENTER - 12,
          VECTOR_CENTER - 14 // end
        ),
        vectorBezier(
          VECTOR_CENTER - 12,
          VECTOR_CENTER - 14, // start
          VECTOR_CENTER - 6,
          VECTOR_CENTER - 2, // control 1
          VECTOR_CENTER - 2,
          VECTOR_CENTER + 6, // control 2
          VECTOR_CENTER,
          VECTOR_CENTER + 8 // end
        ),
        vectorBezier(
          VECTOR_CENTER,
          VECTOR_CENTER + 8, // start
          VECTOR_CENTER + 4,
          VECTOR_CENTER, // control 1
          VECTOR_CENTER + 10,
          VECTOR_CENTER - 10, // control 2
          VECTOR_CENTER + 14,
          VECTOR_CENTER - 16 // end
        ),
        vectorBezier(
          VECTOR_CENTER + 14,
          VECTOR_CENTER - 16, // start
          VECTOR_CENTER + 18,
          VECTOR_CENTER - 12, // control 1
          VECTOR_CENTER + 22,
          VECTOR_CENTER - 8, // control 2
          VECTOR_CENTER + 26,
          VECTOR_CENTER - 6 // end
        ),
        // Brilliant aurora nodes
        vectorCircle(VECTOR_CENTER - 18, VECTOR_CENTER - 2, 6),
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 4, 7),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 2, 7),
        vectorCircle(VECTOR_CENTER + 20, VECTOR_CENTER - 10, 6),
        // Shimmer particles
        vectorCircle(VECTOR_CENTER - 22, VECTOR_CENTER + 6, 3),
        vectorCircle(VECTOR_CENTER + 24, VECTOR_CENTER - 4, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#88D0D0", // Mint fill
      fillOpacity: 0.6,
      scale: 1.15,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};

/**
 * Prismatic Fern (Vector)
 *
 * Rainbow light refracted through crystalline fronds.
 * Each frond acts as a living prism.
 */
const prismaticFern: PlantVariant = {
  id: "prismatic-fern",
  name: "Prismatic Fern",
  description: "Crystal fronds that refract light into rainbow patterns",
  rarity: 0.2, // Rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "sprout",
      duration: 20,
      primitives: [
        // Initial fern curl
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 8, 4),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER, VECTOR_CENTER - 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 3),
        // First frond hints
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER - 6, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER + 6, VECTOR_CENTER - 10),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.4,
      scale: 0.75,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "unfurling",
      duration: 25,
      primitives: [
        // Central stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 16, VECTOR_CENTER, VECTOR_CENTER - 14),
        // Unfurling fronds (pairs)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER - 12, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER + 12, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER - 14, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER + 14, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER - 10, VECTOR_CENTER - 2),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER + 10, VECTOR_CENTER - 2),
        // Frond tips
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 18, 3),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 18, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.65,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.5,
      scale: 0.9,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "prismatic",
      duration: 55,
      primitives: [
        // Full stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 18, VECTOR_CENTER, VECTOR_CENTER - 18),
        // Full frond pairs (multiple levels)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER - 16, VECTOR_CENTER - 24),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER + 16, VECTOR_CENTER - 24),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER - 18, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER + 18, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 2, VECTOR_CENTER - 16, VECTOR_CENTER - 6),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 2, VECTOR_CENTER + 16, VECTOR_CENTER - 6),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 6, VECTOR_CENTER - 12, VECTOR_CENTER + 2),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 6, VECTOR_CENTER + 12, VECTOR_CENTER + 2),
        // Prismatic refraction points
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 24, 4),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER - 24, 4),
        vectorCircle(VECTOR_CENTER - 18, VECTOR_CENTER - 14, 3),
        vectorCircle(VECTOR_CENTER + 18, VECTOR_CENTER - 14, 3),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 6, 3),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER - 6, 3),
        // Rainbow tip
        vectorStar(VECTOR_CENTER, VECTOR_CENTER - 20, 6, 3, 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.6,
      scale: 1.1,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};

/**
 * Quantum Rose (Vector)
 *
 * Rose petals existing in quantum superposition until observed.
 * Collapses into a classical rose when measured.
 */
const quantumRose: PlantVariant = {
  id: "quantum-rose",
  name: "Quantum Rose",
  description: "A rose existing in superposition, collapsing into beauty when observed",
  rarity: 0.12, // Very rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "bud",
      duration: 18,
      primitives: [
        // Rose bud center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 7),
        // Closed petals
        vectorCircle(VECTOR_CENTER - 3, VECTOR_CENTER - 10, 4),
        vectorCircle(VECTOR_CENTER + 3, VECTOR_CENTER - 10, 4),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 16),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#E89090", // Coral fill (bud)
      fillOpacity: 0.4,
      scale: 0.7,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "superposed",
      duration: 28,
      primitives: [
        // Quantum shimmer center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 8),
        // Multiple superposed petals (ghost-like)
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 10, 5),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 10, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 5),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 4, 4),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 4, 4),
        // Quantum probability waves
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 14),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER + 18),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.65,
      fillColor: "#E89090", // Coral fill
      fillOpacity: 0.45,
      scale: 0.95,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "collapsed",
      duration: 60,
      primitives: [
        // Classical rose center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 3),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 6),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER - 6, 8, 4, 5),
        // Full bloom petals (layered)
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 10, 6),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 10, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 18, 6),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 2, 5),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 2, 5),
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 14, 5),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 14, 5),
        // Stem with thorns
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER, VECTOR_CENTER + 20),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 10, VECTOR_CENTER - 4, VECTOR_CENTER + 8),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 14, VECTOR_CENTER + 4, VECTOR_CENTER + 12),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#E89090", // Coral fill (full bloom)
      fillOpacity: 0.6,
      scale: 1.1,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};

/**
 * Star Moss (Vector)
 *
 * Bioluminescent moss forming living constellations.
 * Grows from sparse stars to dense galaxy.
 */
const starMoss: PlantVariant = {
  id: "star-moss",
  name: "Star Moss",
  description: "Bioluminescent moss forming constellations across the ground",
  rarity: 0.3, // Uncommon
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "sparse",
      duration: 25,
      primitives: [
        // Sparse star points
        vectorStar(VECTOR_CENTER - 10, VECTOR_CENTER - 8, 4, 2, 4),
        vectorStar(VECTOR_CENTER + 8, VECTOR_CENTER - 6, 3, 1.5, 4),
        vectorStar(VECTOR_CENTER - 6, VECTOR_CENTER + 10, 3, 1.5, 4),
        vectorStar(VECTOR_CENTER + 12, VECTOR_CENTER + 6, 4, 2, 4),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 5, 2.5, 4),
        // Dim connecting lines
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 8, VECTOR_CENTER, VECTOR_CENTER),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 8, VECTOR_CENTER - 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#88D0D0", // Mint fill
      fillOpacity: 0.4,
      scale: 0.85,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "growing",
      duration: 30,
      primitives: [
        // More stars forming
        vectorStar(VECTOR_CENTER - 12, VECTOR_CENTER - 10, 5, 2.5, 4),
        vectorStar(VECTOR_CENTER + 10, VECTOR_CENTER - 8, 4, 2, 4),
        vectorStar(VECTOR_CENTER - 8, VECTOR_CENTER + 12, 4, 2, 4),
        vectorStar(VECTOR_CENTER + 14, VECTOR_CENTER + 8, 5, 2.5, 4),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 6, 3, 5),
        vectorStar(VECTOR_CENTER - 4, VECTOR_CENTER - 14, 3, 1.5, 4),
        vectorStar(VECTOR_CENTER + 6, VECTOR_CENTER + 14, 3, 1.5, 4),
        // Constellation lines
        vectorLine(VECTOR_CENTER - 12, VECTOR_CENTER - 10, VECTOR_CENTER, VECTOR_CENTER),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 10, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 14, VECTOR_CENTER + 8),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER + 12, VECTOR_CENTER, VECTOR_CENTER),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.65,
      fillColor: "#88D0D0", // Mint fill
      fillOpacity: 0.5,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "galaxy",
      duration: 50,
      primitives: [
        // Dense starfield
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 8, 4, 6),
        vectorStar(VECTOR_CENTER - 14, VECTOR_CENTER - 12, 6, 3, 4),
        vectorStar(VECTOR_CENTER + 12, VECTOR_CENTER - 10, 5, 2.5, 4),
        vectorStar(VECTOR_CENTER - 10, VECTOR_CENTER + 14, 5, 2.5, 4),
        vectorStar(VECTOR_CENTER + 16, VECTOR_CENTER + 10, 6, 3, 4),
        vectorStar(VECTOR_CENTER - 6, VECTOR_CENTER - 18, 4, 2, 4),
        vectorStar(VECTOR_CENTER + 8, VECTOR_CENTER + 18, 4, 2, 4),
        vectorStar(VECTOR_CENTER - 18, VECTOR_CENTER - 4, 4, 2, 4),
        vectorStar(VECTOR_CENTER + 20, VECTOR_CENTER - 2, 4, 2, 4),
        // Galaxy spiral hint
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 12),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 20),
        // Star dust
        vectorCircle(VECTOR_CENTER - 20, VECTOR_CENTER + 8, 2),
        vectorCircle(VECTOR_CENTER + 18, VECTOR_CENTER - 14, 2),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 16, 2),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER - 22, 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#88D0D0", // Mint fill
      fillOpacity: 0.6,
      scale: 1.1,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};

/**
 * Dream Vine (Vector)
 *
 * Ethereal vines that flow like liquid dreams.
 * Weaves through space with impossible grace.
 */
const dreamVine: PlantVariant = {
  id: "dream-vine",
  name: "Dream Vine",
  description: "Ethereal vines flowing through space like liquid dreams",
  rarity: 0.22, // Rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true, // Continuous flowing
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "tendril",
      duration: 20,
      primitives: [
        // Initial tendril curl using bezier for organic flow
        vectorBezier(
          VECTOR_CENTER,
          VECTOR_CENTER + 14, // start
          VECTOR_CENTER - 4,
          VECTOR_CENTER + 8, // control 1
          VECTOR_CENTER - 8,
          VECTOR_CENTER, // control 2
          VECTOR_CENTER - 6,
          VECTOR_CENTER - 6 // end
        ),
        // Curling arc at the tip
        vectorArc(VECTOR_CENTER - 3, VECTOR_CENTER - 8, 6, 90, 270),
        // Curl tips
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 10, 3),
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 6, 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.4,
      scale: 0.8,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "weaving",
      duration: 25,
      primitives: [
        // Weaving vine path with flowing beziers
        vectorBezier(
          VECTOR_CENTER,
          VECTOR_CENTER + 16, // start
          VECTOR_CENTER - 6,
          VECTOR_CENTER + 12, // control 1
          VECTOR_CENTER - 2,
          VECTOR_CENTER + 4, // control 2
          VECTOR_CENTER - 4,
          VECTOR_CENTER + 8 // end
        ),
        vectorBezier(
          VECTOR_CENTER - 4,
          VECTOR_CENTER + 8, // start
          VECTOR_CENTER + 2,
          VECTOR_CENTER + 4, // control 1
          VECTOR_CENTER + 8,
          VECTOR_CENTER + 2, // control 2
          VECTOR_CENTER + 6,
          VECTOR_CENTER // end
        ),
        vectorBezier(
          VECTOR_CENTER + 6,
          VECTOR_CENTER, // start
          VECTOR_CENTER,
          VECTOR_CENTER - 4, // control 1
          VECTOR_CENTER - 6,
          VECTOR_CENTER - 8, // control 2
          VECTOR_CENTER - 8,
          VECTOR_CENTER - 10 // end
        ),
        // Curling arc tendril
        vectorArc(VECTOR_CENTER + 2, VECTOR_CENTER - 14, 6, 0, 180),
        // Leaf nodes
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER + 8, 3),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 10, 3),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER - 16, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.65,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.5,
      scale: 1.0,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "cascade",
      duration: 35,
      primitives: [
        // Full cascading vine with flowing bezier curves
        vectorBezier(
          VECTOR_CENTER,
          VECTOR_CENTER + 18, // start
          VECTOR_CENTER - 8,
          VECTOR_CENTER + 14, // control 1
          VECTOR_CENTER - 4,
          VECTOR_CENTER + 8, // control 2
          VECTOR_CENTER - 6,
          VECTOR_CENTER + 10 // end
        ),
        vectorBezier(
          VECTOR_CENTER - 6,
          VECTOR_CENTER + 10, // start
          VECTOR_CENTER + 4,
          VECTOR_CENTER + 6, // control 1
          VECTOR_CENTER + 10,
          VECTOR_CENTER + 4, // control 2
          VECTOR_CENTER + 8,
          VECTOR_CENTER + 2 // end
        ),
        vectorBezier(
          VECTOR_CENTER + 8,
          VECTOR_CENTER + 2, // start
          VECTOR_CENTER,
          VECTOR_CENTER - 2, // control 1
          VECTOR_CENTER - 8,
          VECTOR_CENTER - 6, // control 2
          VECTOR_CENTER - 10,
          VECTOR_CENTER - 8 // end
        ),
        vectorBezier(
          VECTOR_CENTER - 10,
          VECTOR_CENTER - 8, // start
          VECTOR_CENTER,
          VECTOR_CENTER - 12, // control 1
          VECTOR_CENTER + 8,
          VECTOR_CENTER - 14, // control 2
          VECTOR_CENTER + 6,
          VECTOR_CENTER - 16 // end
        ),
        // Curling arcs at branch tips
        vectorArc(VECTOR_CENTER - 6, VECTOR_CENTER - 20, 5, 45, 225),
        vectorArc(VECTOR_CENTER + 14, VECTOR_CENTER + 4, 4, 270, 90),
        // Secondary bezier tendrils
        vectorBezier(
          VECTOR_CENTER + 8,
          VECTOR_CENTER + 2, // start
          VECTOR_CENTER + 12,
          VECTOR_CENTER + 4, // control 1
          VECTOR_CENTER + 14,
          VECTOR_CENTER + 6, // control 2
          VECTOR_CENTER + 16,
          VECTOR_CENTER + 6 // end
        ),
        // Dream flower nodes
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER + 10, 4),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER + 2, 5),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 8, 4),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 16, 5),
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER - 22, 4),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER + 6, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.15,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};

/**
 * Cosmic Lotus (Vector)
 *
 * Sacred geometry meets cosmic bloom.
 * Unfolds according to the flower of life pattern.
 */
const cosmicLotus: PlantVariant = {
  id: "cosmic-lotus",
  name: "Cosmic Lotus",
  description: "Sacred geometry blooming into transcendent cosmic flower",
  rarity: 0.1, // Very rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "seed",
      duration: 22,
      primitives: [
        // Sacred seed geometry
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
        // Vesica piscis hint
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER, 6),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER, 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.35,
      scale: 0.75,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "opening",
      duration: 30,
      primitives: [
        // Opening sacred geometry
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 16),
        // Flower of life pattern (6 overlapping circles)
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 12, 6),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 6, 6),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 6, 6),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER + 6, 6),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER + 6, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 12, 6),
        // Petals emerging
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 18, 4),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 9, 4),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER - 9, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.65,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.45,
      scale: 0.95,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "transcendent",
      duration: 65,
      primitives: [
        // Transcendent center with mesmerizing spiral
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 2, 10, 2.5, 0),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 12, 6, 12),
        // Full flower of life
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 14, 7),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 7, 7),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 7, 7),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 7, 7),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER + 7, 7),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 14, 7),
        // Outer lotus petals
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 24, 6),
        vectorCircle(VECTOR_CENTER - 21, VECTOR_CENTER - 12, 5),
        vectorCircle(VECTOR_CENTER + 21, VECTOR_CENTER - 12, 5),
        vectorCircle(VECTOR_CENTER - 21, VECTOR_CENTER + 12, 5),
        vectorCircle(VECTOR_CENTER + 21, VECTOR_CENTER + 12, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 24, 6),
        // Cosmic radiance
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 28),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.55,
      scale: 1.2,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};

// ============================================================================
// SUMI SPIRIT (ENSO)
// ============================================================================

/**
 * Generate patterns for Sumi Spirit (Enso) lifecycle
 *
 * Ghibli-inspired ink brush stroke forming an incomplete circle (enso).
 * The gap represents Zen imperfection - the beauty of incompleteness.
 */
function createSumiSpiritPatterns() {
  const center = PATTERN_SIZE / 2;
  const radius = 22;

  // Touch: Initial ink pool where brush contacts paper
  const touch = createEmptyPattern();
  // Small ink pool at the starting point (right side of where arc will begin)
  const touchX = center + radius * Math.cos((-135 * Math.PI) / 180);
  const touchY = center + radius * Math.sin((-135 * Math.PI) / 180);
  drawCircle(touch, Math.round(touchX), Math.round(touchY), 4);
  // Tiny splatter from initial contact
  drawInkSplatter(touch, Math.round(touchX), Math.round(touchY), 3, 4, 8, 0.5, 1.5, 111);

  // Draw: Arc begins extending (about 90 degrees)
  const draw = createEmptyPattern();
  // Short arc from bottom-left, variable thickness
  drawBrushArc(draw, center, center, radius, -135, -45, 2, 5, 3);
  // Small ink pool at start
  drawCircle(
    draw,
    Math.round(center + radius * Math.cos((-135 * Math.PI) / 180)),
    Math.round(center + radius * Math.sin((-135 * Math.PI) / 180)),
    3
  );

  // Flow: Most of the circle formed (about 220 degrees)
  const flow = createEmptyPattern();
  // Longer arc with thick middle section
  drawBrushArc(flow, center, center, radius, -135, 85, 2, 7, 3);
  // Slight ink pooling at start
  drawCircle(
    flow,
    Math.round(center + radius * Math.cos((-135 * Math.PI) / 180)),
    Math.round(center + radius * Math.sin((-135 * Math.PI) / 180)),
    2.5
  );

  // Settle: Complete enso with gap, ink splatters appear
  const settle = createEmptyPattern();
  // Full enso arc (~270 degrees, gap at top-right)
  drawBrushArc(settle, center, center, radius, -135, 135, 2, 7, 1.5);
  // Ink splatter near the thick part of the stroke
  const splatterAngle = (-25 * Math.PI) / 180;
  const splatterX = center + (radius + 8) * Math.cos(splatterAngle);
  const splatterY = center + (radius + 8) * Math.sin(splatterAngle);
  drawInkSplatter(settle, Math.round(splatterX), Math.round(splatterY), 4, 2, 10, 0.5, 1.5, 222);
  // Small splatter on inner edge too
  const innerSplatterX = center + (radius - 10) * Math.cos(splatterAngle + 0.5);
  const innerSplatterY = center + (radius - 10) * Math.sin(splatterAngle + 0.5);
  drawInkSplatter(
    settle,
    Math.round(innerSplatterX),
    Math.round(innerSplatterY),
    2,
    2,
    6,
    0.5,
    1,
    333
  );

  // Rest: Final settled form (same as settle but with subtle differences)
  const rest = createEmptyPattern();
  // Full enso arc
  drawBrushArc(rest, center, center, radius, -135, 135, 2, 7, 1.5);
  // Settled ink splatters (slightly different positions for visual variety)
  drawInkSplatter(rest, Math.round(splatterX), Math.round(splatterY), 5, 2, 12, 0.5, 1.5, 444);
  drawInkSplatter(
    rest,
    Math.round(innerSplatterX),
    Math.round(innerSplatterY),
    3,
    2,
    7,
    0.5,
    1,
    555
  );

  return { touch, draw, flow, settle, rest };
}

const _sumiSpiritPatterns = createSumiSpiritPatterns();

/**
 * Sumi Spirit
 *
 * A Ghibli-inspired ink brush stroke forming an enso (incomplete circle).
 * The gap represents the Zen concept of imperfection and incompleteness.
 * Quantum measurement determines the color variation.
 *
 * Inspired by the calligraphic elements in Studio Ghibli films.
 */
const sumiSpirit: PlantVariant = {
  id: "sumi-spirit",
  name: "Sumi Spirit",
  description: "An ink brush stroke enso that embodies the beauty of imperfection",
  rarity: 0.15, // Rare - contemplative piece
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "touch",
      duration: 8,
      primitives: [
        // Initial brush touch - small arc starting the stroke
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 16, 180, 240, 6),
        // Small dot where brush touches
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER + 8, 2),
      ],
      strokeColor: "#1E3A5F", // Deep indigo
      strokeOpacity: 0.6,
      fillColor: "#90B8E8", // Sky fill - subtle ink wash
      fillOpacity: 0.15,
      scale: 0.8,
      transitionHint: { strategy: "progressive", easing: "brushStroke" },
    },
    {
      name: "draw",
      duration: 12,
      primitives: [
        // Brush extending - larger arc
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 18, 150, 300, 12),
        // Inner stroke following the arc
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 14, 160, 280, 8),
      ],
      strokeColor: "#3A5A8F", // Mid indigo-blue
      strokeOpacity: 0.75,
      fillColor: "#90B8E8", // Sky fill - ink wash
      fillOpacity: 0.2,
      scale: 0.9,
      transitionHint: { strategy: "progressive", easing: "brushStroke" },
    },
    {
      name: "flow",
      duration: 18,
      primitives: [
        // Flowing ink - most of the enso
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 20, 120, 350, 18),
        // Inner flow
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 16, 130, 340, 14),
        // Brush thickness variation
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 12, 150, 320, 10),
      ],
      strokeColor: "#4A6FA5", // Spirit blue
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill - ethereal wash
      fillOpacity: 0.2,
      scale: 0.95,
      transitionHint: { strategy: "progressive", easing: "brushStroke" },
    },
    {
      name: "settle",
      duration: 25,
      primitives: [
        // Nearly complete enso with characteristic gap at top
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 22, 100, 380, 22),
        // Inner rings showing brush texture
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 18, 110, 370, 18),
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 14, 120, 360, 14),
        // Small accent at brush end
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER - 21, 2),
      ],
      strokeColor: "#5A8FC5", // Lighter spirit blue
      strokeOpacity: 0.95,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.25,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "brushStroke" },
    },
    {
      name: "rest",
      duration: 60,
      primitives: [
        // Final enso form - beautiful imperfection with gap at ~70° (top-right)
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 24, 80, 400, 24),
        // Inner strokes showing brush character
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 20, 90, 390, 20),
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 16, 100, 380, 16),
        // Subtle inner detail
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 11, 120, 360, 10),
        // Brush lift point
        vectorCircle(VECTOR_CENTER + 20, VECTOR_CENTER - 13, 1.5),
      ],
      strokeColor: "#7A9FC5", // Pale spirit blue
      strokeOpacity: 1.0,
      fillColor: "#C898E8", // Lavender fill - settled ink wash
      fillOpacity: 0.3,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "brushStroke" },
    },
  ],
};

// ============================================================================
// ZEN LOTUS
// ============================================================================

/**
 * Generate patterns for Zen Lotus lifecycle
 *
 * Simple, geometric lotus with clean lines and perfect symmetry.
 * 6 petals arranged in a hexagonal pattern for meditative clarity.
 * Extended 8-stage lifecycle for slow, meditative unfolding.
 */
function _createZenLotusPatterns() {
  const center = PATTERN_SIZE / 2;

  // Seed: Simple circular seed, potential contained
  const seed = createEmptyPattern();
  drawCircle(seed, center, center, 4);
  drawCircle(seed, center, center + 8, 2);

  // Bud: Teardrop shape forming
  const bud = createEmptyPattern();
  drawEllipse(bud, center, center - 2, 6, 12);
  drawCircle(bud, center, center + 12, 3);

  // Rise: Bud elongating upward
  const rise = createEmptyPattern();
  drawEllipse(rise, center, center - 4, 7, 14);
  drawCircle(rise, center, center + 12, 3);
  drawCircle(rise, center, center - 16, 2);

  // Open: First petals separating
  const open = createEmptyPattern();
  drawCircle(open, center, center, 5);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const tipX = center + Math.cos(angle) * 14;
    const tipY = center + Math.sin(angle) * 14;
    const baseX = center + Math.cos(angle) * 5;
    const baseY = center + Math.sin(angle) * 5;
    drawPetal(open, tipX, tipY, baseX, baseY, 6);
  }

  // Unfurl: Petals extending outward
  const unfurl = createEmptyPattern();
  drawCircle(unfurl, center, center, 5);
  drawRing(unfurl, center, center, 2, 3);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const tipX = center + Math.cos(angle) * 18;
    const tipY = center + Math.sin(angle) * 18;
    const baseX = center + Math.cos(angle) * 5;
    const baseY = center + Math.sin(angle) * 5;
    drawPetal(unfurl, tipX, tipY, baseX, baseY, 7);
  }

  // Bloom: Full symmetric bloom
  const bloom = createEmptyPattern();
  drawCircle(bloom, center, center, 6);
  drawRing(bloom, center, center, 3, 4);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const tipX = center + Math.cos(angle) * 22;
    const tipY = center + Math.sin(angle) * 22;
    const baseX = center + Math.cos(angle) * 6;
    const baseY = center + Math.sin(angle) * 6;
    drawPetal(bloom, tipX, tipY, baseX, baseY, 9);
  }

  // Breathe: Subtle expansion
  const breathe = createEmptyPattern();
  drawCircle(breathe, center, center, 6);
  drawRing(breathe, center, center, 3, 4);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const tipX = center + Math.cos(angle) * 24;
    const tipY = center + Math.sin(angle) * 24;
    const baseX = center + Math.cos(angle) * 6;
    const baseY = center + Math.sin(angle) * 6;
    drawPetal(breathe, tipX, tipY, baseX, baseY, 10);
  }

  // Rest: Settling inward
  const rest = createEmptyPattern();
  drawCircle(rest, center, center, 5);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const tipX = center + Math.cos(angle) * 18;
    const tipY = center + Math.sin(angle) * 18;
    const baseX = center + Math.cos(angle) * 5;
    const baseY = center + Math.sin(angle) * 5;
    drawPetal(rest, tipX, tipY, baseX, baseY, 7);
  }

  // Close: Returning toward bud
  const close = createEmptyPattern();
  drawCircle(close, center, center, 5);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const tipX = center + Math.cos(angle) * 12;
    const tipY = center + Math.sin(angle) * 12;
    const baseX = center + Math.cos(angle) * 5;
    const baseY = center + Math.sin(angle) * 5;
    drawPetal(close, tipX, tipY, baseX, baseY, 5);
  }

  return { seed, bud, rise, open, unfurl, bloom, breathe, rest, close };
}

/**
 * Zen Lotus (Vector)
 *
 * A simple, geometric lotus with clean lines and perfect 6-fold symmetry.
 * Embodies meditative clarity and stillness.
 * Distinct from Cosmic Lotus - no sacred geometry overlays, just pure form.
 */
const zenLotus: PlantVariant = {
  id: "zen-lotus",
  name: "Zen Lotus",
  description: "A geometric lotus of pure form and meditative symmetry",
  rarity: 0.2, // Uncommon
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "seed",
      duration: 10,
      primitives: [
        // Small seed circle
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 3),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.45,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.3,
      scale: 0.5,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "bud",
      duration: 12,
      primitives: [
        // Bud center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 7),
        // First petal hints (6-fold)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER - 7, VECTOR_CENTER - 4, VECTOR_CENTER - 12, VECTOR_CENTER - 7),
        vectorLine(VECTOR_CENTER + 7, VECTOR_CENTER - 4, VECTOR_CENTER + 12, VECTOR_CENTER - 7),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.35,
      scale: 0.65,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "rise",
      duration: 12,
      primitives: [
        // Rising center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 9),
        // 6 petals emerging
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER - 9, VECTOR_CENTER - 5, VECTOR_CENTER - 16, VECTOR_CENTER - 9),
        vectorLine(VECTOR_CENTER + 9, VECTOR_CENTER - 5, VECTOR_CENTER + 16, VECTOR_CENTER - 9),
        vectorLine(VECTOR_CENTER - 9, VECTOR_CENTER + 5, VECTOR_CENTER - 16, VECTOR_CENTER + 9),
        vectorLine(VECTOR_CENTER + 9, VECTOR_CENTER + 5, VECTOR_CENTER + 16, VECTOR_CENTER + 9),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 10, VECTOR_CENTER, VECTOR_CENTER + 16),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.55,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.4,
      scale: 0.75,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "open",
      duration: 15,
      primitives: [
        // Opening center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 12),
        // 6 petals opening wider
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 18, 4),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 9, 4),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER - 9, 4),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER + 9, 4),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER + 9, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 18, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.45,
      scale: 0.85,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "unfurl",
      duration: 18,
      primitives: [
        // Unfurling center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 13),
        // Inner petal layer (6)
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 5),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER + 8, 5),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER + 8, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 16, 5),
        // Outer petal hints
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 20, 3),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 20, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.5,
      scale: 0.92,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "bloom",
      duration: 40,
      primitives: [
        // Full bloom center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 3),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 8, 4, 6),
        // Inner petal ring (6)
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 14, 5),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 7, 5),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 7, 5),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 7, 5),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER + 7, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 14, 5),
        // Outer petal ring (6)
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 22, 4),
        vectorCircle(VECTOR_CENTER - 19, VECTOR_CENTER - 11, 4),
        vectorCircle(VECTOR_CENTER + 19, VECTOR_CENTER - 11, 4),
        vectorCircle(VECTOR_CENTER - 19, VECTOR_CENTER + 11, 4),
        vectorCircle(VECTOR_CENTER + 19, VECTOR_CENTER + 11, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 22, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "breathe",
      duration: 25,
      primitives: [
        // Breathing - slightly expanded
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 7),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 11),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 9, 5, 6),
        // Inner ring expanded
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 6),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER - 8, 6),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER - 8, 6),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER + 8, 6),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER + 8, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 16, 6),
        // Outer ring expanded
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 24, 5),
        vectorCircle(VECTOR_CENTER - 21, VECTOR_CENTER - 12, 5),
        vectorCircle(VECTOR_CENTER + 21, VECTOR_CENTER - 12, 5),
        vectorCircle(VECTOR_CENTER - 21, VECTOR_CENTER + 12, 5),
        vectorCircle(VECTOR_CENTER + 21, VECTOR_CENTER + 12, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 24, 5),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.05,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "rest",
      duration: 20,
      primitives: [
        // Resting - back to normal
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 3),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 8, 4, 6),
        // Inner petals
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 14, 5),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 7, 5),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 7, 5),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 7, 5),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER + 7, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 14, 5),
        // Outer petals
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 22, 4),
        vectorCircle(VECTOR_CENTER - 19, VECTOR_CENTER - 11, 4),
        vectorCircle(VECTOR_CENTER + 19, VECTOR_CENTER - 11, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.75,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.55,
      scale: 0.95,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "close",
      duration: 15,
      primitives: [
        // Closing center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        // Petals folding inward
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 12, 4),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 6, 4),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 6, 4),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER + 6, 4),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER + 6, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 12, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.55,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.4,
      scale: 0.8,
      transitionHint: { strategy: "fade", easing: "easeInOut" },
    },
  ],
  // Color variations - quantum selects one
  colorVariations: [
    {
      name: "white-jade",
      weight: 1.0,
      palettes: {
        seed: ["#E8EBE8", "#EEF1EE", "#F4F7F4"],
        bud: ["#E8EBE8", "#EEF1EE", "#F4F7F4"],
        rise: ["#E4E9E6", "#ECEFE9", "#F2F5F2"],
        open: ["#E0E5E2", "#E8EDE9", "#F0F5F1"],
        unfurl: ["#DCE2DC", "#E6ECE6", "#F0F6F0"],
        bloom: ["#D8DED8", "#E4EAE4", "#F0F6F0"],
        breathe: ["#D8DED8", "#E4EAE4", "#F0F6F0"],
        rest: ["#E0E5E0", "#E8EDE8", "#F0F5F0"],
        close: ["#E4E9E4", "#ECEFEC", "#F2F5F2"],
      },
    },
    {
      name: "blush-pink",
      weight: 0.7,
      palettes: {
        seed: ["#F2E4E8", "#F6EAEE", "#FAF0F4"],
        bud: ["#F0E0E4", "#F4E6EA", "#F8ECF0"],
        rise: ["#EEE0E6", "#F2E6EC", "#F6ECF2"],
        open: ["#EADCE2", "#F0E4EA", "#F6ECF2"],
        unfurl: ["#E8D8E0", "#EEE0E8", "#F4E8F0"],
        bloom: ["#E4D4DC", "#ECDCE6", "#F4E4EE"],
        breathe: ["#E4D4DC", "#ECDCE6", "#F4E4EE"],
        rest: ["#E8DAE0", "#EEE2E8", "#F4EAF0"],
        close: ["#ECE0E6", "#F0E6EC", "#F4ECF2"],
      },
    },
    {
      name: "morning-gold",
      weight: 0.5,
      palettes: {
        seed: ["#F2ECE4", "#F6F0EA", "#FAF4F0"],
        bud: ["#F0EAE0", "#F4EEE6", "#F8F2EC"],
        rise: ["#EEE8DE", "#F2ECE4", "#F6F0EA"],
        open: ["#EAE4D8", "#F0EAE0", "#F6F0E8"],
        unfurl: ["#E8E2D4", "#EEE8DC", "#F4EEE6"],
        bloom: ["#E4DED0", "#ECE6DA", "#F4EEE4"],
        breathe: ["#E4DED0", "#ECE6DA", "#F4EEE4"],
        rest: ["#E8E2D8", "#EEE8E0", "#F4EEE8"],
        close: ["#ECE6DE", "#F0EAE4", "#F4EEEA"],
      },
    },
  ],
};

// ============================================================================
// GEOMETRIC LINE-WORK VARIANTS
// ============================================================================
// Modern minimalist geometric illustrations using fine gray line work.
// Symmetrical radial compositions built from circles, diamonds, and angular patterns.
// No color fills - just outlines. Evokes generative art and sacred geometry.

/**
 * Generate patterns for Sacred Mandala
 * Concentric circle outlines with 8-fold radial symmetry
 */
function createSacredMandalaPatterns() {
  const center = PATTERN_SIZE / 2;

  // Seed: Single thin ring
  const seed = createEmptyPattern();
  drawCircleOutline(seed, center, center, 8);

  // Rings: Concentric circles emerge
  const rings = createEmptyPattern();
  drawConcentricCircles(rings, center, center, [6, 12, 18]);

  // Radiate: Add 8-fold radial lines
  const radiate = createEmptyPattern();
  drawConcentricCircles(radiate, center, center, [6, 12, 18, 24]);
  drawRadialLines(radiate, center, center, 8, 6, 26);

  // Complete: Full mandala with diamonds at cardinal points
  const complete = createEmptyPattern();
  drawConcentricCircles(complete, center, center, [5, 10, 15, 20, 26]);
  drawRadialLines(complete, center, center, 8, 5, 28);
  // Add small diamonds at cardinal points
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const dx = center + Math.cos(angle) * 18;
    const dy = center + Math.sin(angle) * 18;
    drawDiamondOutline(complete, dx, dy, 5, 7);
  }

  return { seed, rings, radiate, complete };
}

const _sacredMandalaPatterns = createSacredMandalaPatterns();

/**
 * Sacred Mandala - Concentric circles and radiating lines forming a contemplative pattern
 */
const sacredMandala: PlantVariant = {
  id: "sacred-mandala",
  name: "Sacred Mandala",
  description: "Precise geometric circles and radiating lines forming a contemplative pattern",
  rarity: 0.1,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "seed",
      duration: 10,
      primitives: [vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8)],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.4,
      scale: 0.7,
    },
    {
      name: "rings",
      duration: 15,
      primitives: [...vectorConcentricCircles(VECTOR_CENTER, VECTOR_CENTER, [6, 12, 18])],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.8,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.5,
      scale: 0.85,
    },
    {
      name: "radiate",
      duration: 20,
      primitives: [
        ...vectorConcentricCircles(VECTOR_CENTER, VECTOR_CENTER, [6, 12, 18, 24]),
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 8, 6, 26),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.9,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.6,
      scale: 0.95,
    },
    {
      name: "complete",
      duration: 60,
      primitives: [
        ...vectorConcentricCircles(VECTOR_CENTER, VECTOR_CENTER, [5, 10, 15, 20, 26]),
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 8, 5, 28),
        // Diamonds at cardinal points
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER - 18, 5, 7),
        vectorDiamond(VECTOR_CENTER + 18, VECTOR_CENTER, 5, 7),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER + 18, 5, 7),
        vectorDiamond(VECTOR_CENTER - 18, VECTOR_CENTER, 5, 7),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 1.0,
      fillColor: "#C898E8", // Lavender fill for diamonds
      fillOpacity: 0.7,
      scale: 1.0,
    },
  ],
};

/**
 * Generate patterns for Crystal Lattice
 * Interlocking diamond grid pattern
 */
function createCrystalLatticePatterns() {
  const center = PATTERN_SIZE / 2;

  // Diamond: Single central diamond
  const diamond = createEmptyPattern();
  drawDiamondOutline(diamond, center, center, 14, 18);

  // Grid: 2x2 diamond arrangement
  const grid = createEmptyPattern();
  drawDiamondOutline(grid, center, center, 12, 16);
  drawDiamondOutline(grid, center - 10, center, 8, 12);
  drawDiamondOutline(grid, center + 10, center, 8, 12);
  drawDiamondOutline(grid, center, center - 10, 8, 12);
  drawDiamondOutline(grid, center, center + 10, 8, 12);

  // Expand: Larger interconnected lattice
  const expand = createEmptyPattern();
  // Central diamond
  drawDiamondOutline(expand, center, center, 10, 14);
  // Cardinal diamonds
  const offset = 14;
  drawDiamondOutline(expand, center - offset, center, 10, 14);
  drawDiamondOutline(expand, center + offset, center, 10, 14);
  drawDiamondOutline(expand, center, center - offset, 10, 14);
  drawDiamondOutline(expand, center, center + offset, 10, 14);
  // Connecting lines
  drawLine(expand, center - 5, center, center - offset + 5, center);
  drawLine(expand, center + 5, center, center + offset - 5, center);
  drawLine(expand, center, center - 7, center, center - offset + 7);
  drawLine(expand, center, center + 7, center, center + offset - 7);

  // Full: Complete lattice with corner elements
  const full = createEmptyPattern();
  // Core structure
  drawDiamondOutline(full, center, center, 8, 12);
  const off = 12;
  drawDiamondOutline(full, center - off, center, 8, 12);
  drawDiamondOutline(full, center + off, center, 8, 12);
  drawDiamondOutline(full, center, center - off, 8, 12);
  drawDiamondOutline(full, center, center + off, 8, 12);
  // Diagonal diamonds
  const diagOff = 9;
  drawDiamondOutline(full, center - diagOff, center - diagOff, 6, 8);
  drawDiamondOutline(full, center + diagOff, center - diagOff, 6, 8);
  drawDiamondOutline(full, center - diagOff, center + diagOff, 6, 8);
  drawDiamondOutline(full, center + diagOff, center + diagOff, 6, 8);
  // Connecting lines
  drawLine(full, center - 4, center, center - off + 4, center);
  drawLine(full, center + 4, center, center + off - 4, center);
  drawLine(full, center, center - 6, center, center - off + 6);
  drawLine(full, center, center + 6, center, center + off - 6);

  return { diamond, grid, expand, full };
}

const _crystalLatticePatterns = createCrystalLatticePatterns();

/**
 * Crystal Lattice - Interlocking diamond grid with thin connecting lines
 */
const crystalLattice: PlantVariant = {
  id: "crystal-lattice",
  name: "Crystal Lattice",
  description: "Interlocking diamond grid evoking crystalline molecular structures",
  rarity: 0.1,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "diamond",
      duration: 10,
      primitives: [vectorDiamond(VECTOR_CENTER, VECTOR_CENTER, 14, 18)],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.35,
      scale: 0.7,
    },
    {
      name: "grid",
      duration: 15,
      primitives: [
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER, 12, 16),
        vectorDiamond(VECTOR_CENTER - 10, VECTOR_CENTER, 8, 12),
        vectorDiamond(VECTOR_CENTER + 10, VECTOR_CENTER, 8, 12),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER - 10, 8, 12),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER + 10, 8, 12),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.45,
      scale: 0.85,
    },
    {
      name: "expand",
      duration: 20,
      primitives: [
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER, 10, 14),
        vectorDiamond(VECTOR_CENTER - 14, VECTOR_CENTER, 10, 14),
        vectorDiamond(VECTOR_CENTER + 14, VECTOR_CENTER, 10, 14),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER - 14, 10, 14),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER + 14, 10, 14),
        // Connecting lines
        vectorLine(VECTOR_CENTER - 5, VECTOR_CENTER, VECTOR_CENTER - 9, VECTOR_CENTER),
        vectorLine(VECTOR_CENTER + 5, VECTOR_CENTER, VECTOR_CENTER + 9, VECTOR_CENTER),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 7, VECTOR_CENTER, VECTOR_CENTER - 7),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 7, VECTOR_CENTER, VECTOR_CENTER + 7),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.75,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.5,
      scale: 0.95,
    },
    {
      name: "full",
      duration: 60,
      primitives: [
        // Core structure
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER, 8, 12),
        vectorDiamond(VECTOR_CENTER - 12, VECTOR_CENTER, 8, 12),
        vectorDiamond(VECTOR_CENTER + 12, VECTOR_CENTER, 8, 12),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER - 12, 8, 12),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER + 12, 8, 12),
        // Diagonal diamonds
        vectorDiamond(VECTOR_CENTER - 9, VECTOR_CENTER - 9, 6, 8),
        vectorDiamond(VECTOR_CENTER + 9, VECTOR_CENTER - 9, 6, 8),
        vectorDiamond(VECTOR_CENTER - 9, VECTOR_CENTER + 9, 6, 8),
        vectorDiamond(VECTOR_CENTER + 9, VECTOR_CENTER + 9, 6, 8),
        // Connecting lines
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER),
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER, VECTOR_CENTER + 8, VECTOR_CENTER),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 6, VECTOR_CENTER, VECTOR_CENTER - 6),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 6, VECTOR_CENTER, VECTOR_CENTER + 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.6,
      scale: 1.0,
    },
  ],
};

/**
 * Generate patterns for Stellar Geometry
 * Star outlines with radiating lines
 */
function createStellarGeometryPatterns() {
  const center = PATTERN_SIZE / 2;

  // Point: Central dot with tiny star hint
  const point = createEmptyPattern();
  drawCircleOutline(point, center, center, 3);
  drawRadialLines(point, center, center, 6, 4, 7, 0);

  // Star: First 6-pointed star outline
  const star = createEmptyPattern();
  drawStarOutline(star, center, center, 6, 16, 8, -90);
  drawCircleOutline(star, center, center, 4);

  // Rays: Add radiating lines to star points
  const rays = createEmptyPattern();
  drawStarOutline(rays, center, center, 6, 18, 9, -90);
  drawCircleOutline(rays, center, center, 5);
  drawRadialLines(rays, center, center, 6, 18, 26, -90);

  // Nested: Multiple nested star outlines
  const nested = createEmptyPattern();
  drawStarOutline(nested, center, center, 6, 24, 12, -90);
  drawStarOutline(nested, center, center, 6, 16, 8, -90);
  drawStarOutline(nested, center, center, 6, 10, 5, -90);
  drawCircleOutline(nested, center, center, 3);
  // Subtle outer rays
  drawRadialLines(nested, center, center, 12, 24, 28, -90);

  return { point, star, rays, nested };
}

const _stellarGeometryPatterns = createStellarGeometryPatterns();

/**
 * Stellar Geometry - Star outlines with radiating lines
 */
const stellarGeometry: PlantVariant = {
  id: "stellar-geometry",
  name: "Stellar Geometry",
  description: "Nested star outlines radiating with precise mathematical beauty",
  rarity: 0.1,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "point",
      duration: 8,
      primitives: [
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 3),
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 6, 4, 7),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#E8B888", // Peach fill
      fillOpacity: 0.35,
      scale: 0.6,
    },
    {
      name: "star",
      duration: 12,
      primitives: [
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 6, 16, 8, -90),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#E8B888", // Peach fill
      fillOpacity: 0.45,
      scale: 0.8,
    },
    {
      name: "rays",
      duration: 18,
      primitives: [
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 6, 18, 9, -90),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 6, 18, 26, -90),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.75,
      fillColor: "#E8B888", // Peach fill
      fillOpacity: 0.5,
      scale: 0.9,
    },
    {
      name: "nested",
      duration: 60,
      primitives: [
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 6, 24, 12, -90),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 6, 16, 8, -90),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 6, 10, 5, -90),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 3),
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 12, 24, 28, -90),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#E8B888", // Peach fill
      fillOpacity: 0.6,
      scale: 1.0,
    },
  ],
};

/**
 * Generate patterns for Metatron's Cube
 * Overlapping circles with connecting lines (sacred geometry)
 */
function createMetatronsCubePatterns() {
  const center = PATTERN_SIZE / 2;
  const r = 8; // Base circle radius

  // Circle: Central circle
  const circle = createEmptyPattern();
  drawCircleOutline(circle, center, center, r);

  // Six: Flower of Life base - 6 circles around center
  const six = createEmptyPattern();
  drawCircleOutline(six, center, center, r);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const cx = center + Math.cos(angle) * r;
    const cy = center + Math.sin(angle) * r;
    drawCircleOutline(six, cx, cy, r);
  }

  // Connect: Add connecting lines between circle centers
  const connect = createEmptyPattern();
  // Draw the circles
  drawCircleOutline(connect, center, center, r);
  const centers: { x: number; y: number }[] = [{ x: center, y: center }];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const cx = center + Math.cos(angle) * r;
    const cy = center + Math.sin(angle) * r;
    drawCircleOutline(connect, cx, cy, r);
    centers.push({ x: cx, y: cy });
  }
  // Connect all centers to form hexagon + star
  for (let i = 1; i <= 6; i++) {
    // Connect to center
    drawLine(
      connect,
      Math.round(centers[0]!.x),
      Math.round(centers[0]!.y),
      Math.round(centers[i]!.x),
      Math.round(centers[i]!.y)
    );
    // Connect to neighbors
    const next = i === 6 ? 1 : i + 1;
    drawLine(
      connect,
      Math.round(centers[i]!.x),
      Math.round(centers[i]!.y),
      Math.round(centers[next]!.x),
      Math.round(centers[next]!.y)
    );
  }

  // Complete: Full Metatron's Cube with outer hexagon
  const complete = createEmptyPattern();
  // Inner flower of life
  drawCircleOutline(complete, center, center, r - 1);
  const innerCenters: { x: number; y: number }[] = [{ x: center, y: center }];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const cx = center + Math.cos(angle) * (r - 1);
    const cy = center + Math.sin(angle) * (r - 1);
    drawCircleOutline(complete, cx, cy, r - 1);
    innerCenters.push({ x: cx, y: cy });
  }
  // Outer larger circles
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const cx = center + Math.cos(angle) * (r * 2 - 2);
    const cy = center + Math.sin(angle) * (r * 2 - 2);
    drawCircleOutline(complete, cx, cy, r - 1);
  }
  // Connect all points - inner hexagon
  for (let i = 1; i <= 6; i++) {
    drawLine(
      complete,
      Math.round(innerCenters[0]!.x),
      Math.round(innerCenters[0]!.y),
      Math.round(innerCenters[i]!.x),
      Math.round(innerCenters[i]!.y)
    );
    const next = i === 6 ? 1 : i + 1;
    drawLine(
      complete,
      Math.round(innerCenters[i]!.x),
      Math.round(innerCenters[i]!.y),
      Math.round(innerCenters[next]!.x),
      Math.round(innerCenters[next]!.y)
    );
  }
  // Outer hexagon
  drawPolygonOutline(complete, center, center, 6, r * 2 - 2, -90);

  return { circle, six, connect, complete };
}

const _metatronsCubePatterns = createMetatronsCubePatterns();

/**
 * Metatron's Cube - Sacred geometry pattern of overlapping circles and lines
 */
const metatronsCube: PlantVariant = {
  id: "metatrons-cube",
  name: "Metatron's Cube",
  description: "Sacred geometry of overlapping circles forming the Flower of Life",
  rarity: 0.08,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "circle",
      duration: 10,
      primitives: [vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8)],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.35,
      scale: 0.7,
    },
    {
      name: "six",
      duration: 15,
      primitives: [...vectorFlowerOfLife(VECTOR_CENTER, VECTOR_CENTER, 8, 1)],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.45,
      scale: 0.85,
    },
    {
      name: "connect",
      duration: 20,
      primitives: [
        ...vectorFlowerOfLife(VECTOR_CENTER, VECTOR_CENTER, 8, 1),
        // Connect center to outer circles
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 6, 0, 8, -90),
        // Hexagon outline
        vectorPolygon(VECTOR_CENTER, VECTOR_CENTER, 6, 8, -90),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.75,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.5,
      scale: 0.92,
    },
    {
      name: "complete",
      duration: 60,
      primitives: [
        ...vectorFlowerOfLife(VECTOR_CENTER, VECTOR_CENTER, 7, 2),
        // Inner hexagon
        vectorPolygon(VECTOR_CENTER, VECTOR_CENTER, 6, 7, -90),
        // Outer hexagon
        vectorPolygon(VECTOR_CENTER, VECTOR_CENTER, 6, 14, -90),
        // Radial connections
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 6, 0, 14, -90),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.0,
    },
  ],
};

// ============================================================================
// LOOPING VECTOR VARIANTS
// ============================================================================
// Colorful vector variants with animation loops.

/**
 * Pulsing Orb (Vector) - Smooth vector version
 * Simple pulsing circles with sky blue tones
 */
const pulsingOrbVector: PlantVariant = {
  id: "pulsing-orb-vector",
  name: "Pulsing Orb (Vector)",
  description: "An ethereal orb rendered with smooth vector circles",
  rarity: 0.08,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "dim",
      duration: 8,
      primitives: [
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 12),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.35,
      scale: 0.9,
    },
    {
      name: "bright",
      duration: 5,
      primitives: [
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 16),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 11),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.6,
      scale: 1.1,
    },
  ],
};

/**
 * Phoenix Flame (Vector) - Smooth vector version
 * Rising flame shapes with wing-like radiating lines
 */
const phoenixFlameVector: PlantVariant = {
  id: "phoenix-flame-vector",
  name: "Phoenix Flame (Vector)",
  description: "Rising flames rendered with smooth vector lines",
  rarity: 0.05,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "ember",
      duration: 12,
      primitives: [
        // Core ember
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 8, 6),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER, 8, 14),
        // Small flame tips
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER + 8, 4, 6, 12, -90),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.55,
      fillColor: "#E8B888", // Peach fill (ember)
      fillOpacity: 0.4,
      scale: 0.75,
    },
    {
      name: "rising",
      duration: 15,
      primitives: [
        // Rising core
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER - 4, 12, 22),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 6, 8),
        // Wing-like extensions
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER - 16, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER + 16, VECTOR_CENTER - 12),
        // Flame tips
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER + 6, 6, 8, 16, -90),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#E89090", // Coral fill
      fillOpacity: 0.5,
      scale: 0.95,
    },
    {
      name: "blaze",
      duration: 25,
      primitives: [
        // Full flame body
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER - 8, 16, 28),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 4, 10),
        // Spread wings
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER - 4, VECTOR_CENTER - 22, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 4, VECTOR_CENTER + 22, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER, VECTOR_CENTER - 18, VECTOR_CENTER - 6),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER, VECTOR_CENTER + 18, VECTOR_CENTER - 6),
        // Crown of flames
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER + 4, 8, 10, 20, -90),
        // Inner glow
        vectorStar(VECTOR_CENTER, VECTOR_CENTER - 6, 6, 8, 4, -90),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#E89090", // Coral fill
      fillOpacity: 0.65,
      scale: 1.1,
    },
  ],
};

/**
 * Kaleidoscope Star (Vector) - Smooth vector version
 * Rotating star patterns with shifting pastel colors
 */
const kaleidoscopeStarVector: PlantVariant = {
  id: "kaleidoscope-star-vector",
  name: "Kaleidoscope Star (Vector)",
  description: "Mesmerizing rotating star patterns with smooth vector lines",
  rarity: 0.06,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "rotate1",
      duration: 10,
      primitives: [
        // Central star
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 8, 20, 10, 0),
        // Inner star rotated
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 8, 12, 6, 22.5),
        // Core circle
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        // Outer ring
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 24),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.5,
      scale: 1.1,
    },
    {
      name: "rotate2",
      duration: 10,
      primitives: [
        // Central star rotated
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 8, 22, 11, 22.5),
        // Inner star
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 8, 14, 7, 0),
        // Core circle
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        // Outer ring
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 26),
        // Radial accents
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 8, 22, 26, 0),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.9,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.15,
    },
  ],
};

/**
 * Vortex Spiral (Vector) - Smooth vector version
 * True spirals creating mesmerizing vortex patterns with purple tones
 */
const vortexSpiralVector: PlantVariant = {
  id: "vortex-spiral-vector",
  name: "Vortex Spiral (Vector)",
  description: "Swirling vortex patterns with hypnotic true spirals",
  rarity: 0.07,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "calm",
      duration: 12,
      primitives: [
        // Calm center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        // Gentle single spiral arm emerging
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 6, 16, 1, 0),
        // Secondary spiral offset
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 6, 14, 0.8, 180),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.35,
      scale: 0.85,
    },
    {
      name: "spin",
      duration: 8,
      primitives: [
        // Spinning center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 3),
        // Two interleaved spirals expanding
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 4, 20, 1.5, 0),
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 4, 18, 1.5, 180),
        // Third spiral for depth
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 5, 16, 1.2, 90),
        // Spiral tips as energy nodes
        vectorCircle(VECTOR_CENTER + 18, VECTOR_CENTER - 8, 3),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER + 8, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.75,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.5,
      scale: 1.0,
    },
    {
      name: "whirl",
      duration: 6,
      primitives: [
        // Intense core
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 2),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 4, 5, 2, 0),
        // Triple spiral vortex at full intensity
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 3, 24, 2, 0),
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 3, 22, 2, 120),
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 3, 20, 2, 240),
        // Outer energy ring
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 26),
        // Whirling energy nodes
        vectorCircle(VECTOR_CENTER + 22, VECTOR_CENTER - 10, 3),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 20, 3),
        vectorCircle(VECTOR_CENTER - 18, VECTOR_CENTER - 14, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.9,
      fillColor: "#C898E8", // Lavender fill for whirl intensity
      fillOpacity: 0.6,
      scale: 1.05,
    },
  ],
};

// ============================================================================
// SUMI SPIRIT VECTOR
// ============================================================================

/**
 * Helper function to generate arc segments (lines along a circular path).
 * Used to create enso (incomplete circle) brush stroke effects.
 *
 * @param cx - Center X
 * @param cy - Center Y
 * @param radius - Radius of the arc
 * @param startAngle - Start angle in degrees (0 = right, 90 = bottom)
 * @param endAngle - End angle in degrees
 * @param segments - Number of line segments to use
 */
function vectorArcSegments(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  segments: number
): VectorPrimitive[] {
  const lines: VectorPrimitive[] = [];
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const angleStep = (endRad - startRad) / segments;

  for (let i = 0; i < segments; i++) {
    const a1 = startRad + i * angleStep;
    const a2 = startRad + (i + 1) * angleStep;
    lines.push(
      vectorLine(
        cx + Math.cos(a1) * radius,
        cy + Math.sin(a1) * radius,
        cx + Math.cos(a2) * radius,
        cy + Math.sin(a2) * radius
      )
    );
  }
  return lines;
}

// ============================================================================
// WATERCOLOR FLOWER
// ============================================================================

/**
 * Color sets for the watercolor flower, keyed by color variation name.
 * Selected by quantum measurement during observation.
 */
const WATERCOLOR_FLOWER_COLORS: Record<
  string,
  { petal: string; center: string; stem: string; leaf: string }
> = {
  golden: { petal: "#F2D26B", center: "#E09520", stem: "#8EA888", leaf: "#9AAE8C" },
  coral: { petal: "#E89090", center: "#C06060", stem: "#8EA888", leaf: "#9AAE8C" },
  lavender: { petal: "#B8A0D8", center: "#7060A0", stem: "#9AAE8C", leaf: "#9AAE8C" },
  sky: { petal: "#90B8E8", center: "#4070B0", stem: "#8EA888", leaf: "#9AAE8C" },
};

const WATERCOLOR_FLOWER_DEFAULT_COLORS = WATERCOLOR_FLOWER_COLORS.golden!;

/**
 * Get the openness factor for a lifecycle keyframe.
 * Controls how much petals/leaves are "open" at each stage.
 */
function getFlowerOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "bud":
      return 0.05 + progress * 0.1; // 0.05 → 0.15
    case "sprout":
      return 0.15 + progress * 0.35; // 0.15 → 0.5
    case "bloom":
      return 0.5 + progress * 0.5; // 0.5 → 1.0
    case "fade":
      return 1.0 - progress * 0.4; // 1.0 → 0.6
    default:
      return 0.5;
  }
}

/**
 * Builder function for the watercolor flower variant.
 * Translates quantum traits + lifecycle state into watercolor elements.
 *
 * Quantum trait mapping:
 * - growthRate (0.5-2.0) → petal count (3-8), leaf count (1-5)
 * - opacity (0.7-1.0) → stem curvature (straighter when more certain)
 * - colorVariationName → color set (petal, center, stem, leaf colors)
 * - seed (from plant ID) → rotation offsets, per-plant variation
 * - keyframe + progress → openness (bud→bloom→fade animation)
 */
function buildWatercolorFlowerElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];

  // Seeded RNG for per-plant variation
  let s = ctx.seed & 0x7fffffff;
  if (s === 0) s = 1;
  const rng = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  // Quantum-derived parameters
  const growthRate = ctx.traits?.growthRate ?? 1.0;
  const quantumOpacity = ctx.traits?.opacity ?? 0.85;

  const petalCount = Math.floor(3 + ((growthRate - 0.5) / 1.5) * 5); // 3-8
  const leafCount = Math.max(1, Math.floor(growthRate * 2.5)); // 1-5
  const stemCurvature = (1 - quantumOpacity) * 1.5; // 0-0.45

  // Color selection
  const colorSet =
    (ctx.colorVariationName ? WATERCOLOR_FLOWER_COLORS[ctx.colorVariationName] : null) ??
    (ctx.traits?.colorPalette
      ? {
          petal: ctx.traits.colorPalette[0] ?? WATERCOLOR_FLOWER_DEFAULT_COLORS.petal,
          center: ctx.traits.colorPalette[1] ?? WATERCOLOR_FLOWER_DEFAULT_COLORS.center,
          stem: ctx.traits.colorPalette[2] ?? WATERCOLOR_FLOWER_DEFAULT_COLORS.stem,
          leaf: WATERCOLOR_FLOWER_DEFAULT_COLORS.leaf,
        }
      : WATERCOLOR_FLOWER_DEFAULT_COLORS);

  // Lifecycle-driven openness
  const openness = getFlowerOpenness(ctx.keyframeName, ctx.keyframeProgress);

  // Flower center position in 64x64 space
  const cx = 32;
  const cy = 22;

  // === STEM ===
  const stemBottom = 52;
  const stemMidY = (cy + stemBottom) / 2;
  const curveOffset = stemCurvature * 4 * (rng() > 0.5 ? 1 : -1);
  elements.push({
    shape: {
      type: "stem",
      points: [
        [cx, stemBottom],
        [cx + curveOffset * 0.5, stemMidY + 4],
        [cx + curveOffset, stemMidY - 4],
        [cx, cy + 4],
      ],
      thickness: 0.6 + openness * 0.4,
    },
    position: { x: 0, y: 0 }, // stem points are already in 64x64 space
    rotation: 0,
    scale: 1,
    color: colorSet.stem,
    opacity: 0.58,
    zOffset: 0,
  });

  // === LEAVES ===
  const leafOpenness = Math.max(0, (openness - 0.1) / 0.9);
  for (let i = 0; i < leafCount; i++) {
    if (leafOpenness <= 0) break;
    const t = (i + 0.5) / leafCount; // position along stem (0=bottom, 1=top)
    const leafY = stemBottom - t * (stemBottom - cy - 4);
    const leafX = cx + curveOffset * t;
    const side = i % 2 === 0 ? 1 : -1;
    const baseAngle = side * (0.4 + rng() * 0.6);
    const leafScale = (0.55 + rng() * 0.55) * leafOpenness;

    elements.push({
      shape: {
        type: "leaf",
        width: 3.5,
        length: 9,
      },
      position: { x: leafX + side * 1.5, y: leafY },
      rotation: baseAngle,
      scale: leafScale,
      color: colorSet.leaf,
      zOffset: 0.5,
    });
  }

  // === PETALS ===
  const petalOpenness = Math.max(0, (openness - 0.05) / 0.95);
  if (petalOpenness > 0) {
    const step = (Math.PI * 2) / petalCount;
    for (let i = 0; i < petalCount; i++) {
      const angle = step * i + rng() * 0.18;
      const pw = (4 + rng() * 2) * petalOpenness;
      const pl = (10 + rng() * 4) * petalOpenness;

      elements.push({
        shape: {
          type: "petal",
          width: pw,
          length: pl,
          roundness: 0.82,
        },
        position: { x: cx, y: cy },
        rotation: angle,
        scale: 1.0,
        color: colorSet.petal,
        zOffset: 1.0,
      });
    }
  }

  // === CENTER DISC ===
  if (petalOpenness > 0.2) {
    const discRadius = 1.5 + petalOpenness * 1.5;
    elements.push({
      shape: { type: "disc", radius: discRadius },
      position: { x: cx, y: cy },
      rotation: 0,
      scale: 1,
      color: colorSet.center,
      opacity: 0.72,
      zOffset: 2.0,
    });

    // === STAMEN DOTS ===
    const dotCount = Math.floor(3 + petalOpenness * 4);
    for (let i = 0; i < dotCount; i++) {
      const a = rng() * Math.PI * 2;
      const d = rng() * discRadius * 0.8;
      elements.push({
        shape: { type: "dot", radius: 0.3 + rng() * 0.4 },
        position: {
          x: cx + Math.cos(a) * d,
          y: cy + Math.sin(a) * d,
        },
        rotation: 0,
        scale: 1,
        color: colorSet.center,
        opacity: 0.35 + rng() * 0.4,
        zOffset: 2.1,
      });
    }
  }

  return elements;
}

/**
 * Watercolor Flower
 *
 * The first variant using the watercolor rendering framework.
 * Uses layered semi-transparent shapes to create a painterly flower effect.
 * Quantum traits drive petal count, colors, stem curvature, and leaf count.
 * Rarity: 0.15 (rare)
 */
const watercolorFlower: PlantVariant = {
  id: "watercolor-flower",
  name: "Watercolor Flower",
  description:
    "A painterly flower rendered with soft watercolor layers, its form shaped by quantum measurement",
  rarity: 0.15,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  colorVariations: [
    {
      name: "golden",
      weight: 1.0,
      palettes: { bloom: ["#F2D26B", "#E09520", "#8EA888"] },
    },
    {
      name: "coral",
      weight: 1.0,
      palettes: { bloom: ["#E89090", "#C06060", "#8EA888"] },
    },
    {
      name: "lavender",
      weight: 0.8,
      palettes: { bloom: ["#B8A0D8", "#7060A0", "#9AAE8C"] },
    },
    {
      name: "sky",
      weight: 0.8,
      palettes: { bloom: ["#90B8E8", "#4070B0", "#8EA888"] },
    },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "bud", duration: 15 },
      { name: "sprout", duration: 20 },
      { name: "bloom", duration: 45 },
      { name: "fade", duration: 25 },
    ],
    wcEffect: {
      layers: 3,
      opacity: 0.48,
      spread: 0.07,
      colorVariation: 0.045,
    },
    buildElements: buildWatercolorFlowerElements,
  },
};

/**
 * All registered plant variants.
 *
 * All variants now use vector rendering for smooth, resolution-independent visuals.
 *
 * Organized by category:
 * - Ground Cover: softMoss, pebblePatch (very common, ambient)
 * - Grasses: meadowTuft, whisperReed (common, gentle motion)
 * - Flowers: simpleBloom, quantumTulip, dewdropDaisy, midnightPoppy, bellCluster,
 *            zenLotus (moderate to uncommon)
 * - Shrubs: cloudBush, berryThicket (uncommon, mid-ground structure)
 * - Trees: saplingHope, weepingWillow (rare, landmark elements)
 * - Ethereal: pulsingOrb, fractalBloom, phoenixFlame, crystalCluster,
 *             kaleidoscopeStar, vortexSpiral, nebulaBloom, auroraWisp,
 *             prismaticFern, quantumRose, starMoss, dreamVine, cosmicLotus,
 *             sumiSpirit (rare, abstract magical effects)
 * - Geometric: sacredMandala, crystalLattice, stellarGeometry, metatronsCube
 *              (rare, minimalist line-work patterns)
 * - Looping Vector: pulsingOrbVector, phoenixFlameVector,
 *                   kaleidoscopeStarVector, vortexSpiralVector
 *                   (very rare, colorful smooth vectors with animation loops)
 *
 * Total: 36 variants
 * Add new variants here to make them available in the system.
 */
export const PLANT_VARIANTS: PlantVariant[] = [
  // Ground Cover (very common)
  softMoss,
  pebblePatch,
  // Grasses (common)
  meadowTuft,
  whisperReed,
  // Flowers (moderate to uncommon)
  simpleBloom,
  quantumTulip,
  dewdropDaisy,
  midnightPoppy,
  bellCluster,
  zenLotus,
  // Shrubs (uncommon)
  cloudBush,
  berryThicket,
  // Trees (rare)
  saplingHope,
  weepingWillow,
  // Ethereal (rare - abstract artistic patterns)
  pulsingOrb,
  fractalBloom,
  phoenixFlame,
  crystalCluster,
  kaleidoscopeStar,
  vortexSpiral,
  nebulaBloom,
  auroraWisp,
  prismaticFern,
  quantumRose,
  starMoss,
  dreamVine,
  cosmicLotus,
  sumiSpirit,
  // Geometric (rare - minimalist line-work patterns)
  sacredMandala,
  crystalLattice,
  stellarGeometry,
  metatronsCube,
  // Ethereal Vector (very rare - colorful smooth vectors with looping)
  pulsingOrbVector,
  phoenixFlameVector,
  kaleidoscopeStarVector,
  vortexSpiralVector,
  // Watercolor (rare - painterly layered transparency)
  watercolorFlower,
];

/**
 * Get a variant by its ID.
 *
 * @param id - Variant ID to look up
 * @returns The variant, or undefined if not found
 */
export function getVariantById(id: string): PlantVariant | undefined {
  return PLANT_VARIANTS.find((v) => v.id === id);
}

/**
 * Get all registered variants.
 *
 * @returns Array of all variants
 */
export function getAllVariants(): PlantVariant[] {
  return [...PLANT_VARIANTS];
}

// Re-export pattern size for consumers that need it
export { PATTERN_SIZE };
