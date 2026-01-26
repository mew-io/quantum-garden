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

import type { PlantVariant } from "./types";
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
const simpleBloomPatterns = createSimpleBloomPatterns();
const quantumTulipPatterns = createQuantumTulipPatterns();
const softMossPatterns = createSoftMossPatterns();
const pebblePatchPatterns = createPebblePatchPatterns();
const meadowTuftPatterns = createMeadowTuftPatterns();
const whisperReedPatterns = createWhisperReedPatterns();
const pulsingOrbPatterns = createPulsingOrbPatterns();
const dewdropDaisyPatterns = createDewdropDaisyPatterns();
const midnightPoppyPatterns = createMidnightPoppyPatterns();
const bellClusterPatterns = createBellClusterPatterns();
const cloudBushPatterns = createCloudBushPatterns();
const berryThicketPatterns = createBerryThicketPatterns();
const saplingHopePatterns = createSaplingHopePatterns();
const weepingWillowPatterns = createWeepingWillowPatterns();
const fractalBloomPatterns = createFractalBloomPatterns();
const phoenixFlamePatterns = createPhoenixFlamePatterns();
const crystalClusterPatterns = createCrystalClusterPatterns();
const kaleidoscopeStarPatterns = createKaleidoscopeStarPatterns();
const vortexSpiralPatterns = createVortexSpiralPatterns();
const nebulaBloomPatterns = createNebulaBloomPatterns();
const auroraWispPatterns = createAuroraWispPatterns();
const prismaticFernPatterns = createPrismaticFernPatterns();
const quantumRosePatterns = createQuantumRosePatterns();
const starMossPatterns = createStarMossPatterns();
const dreamVinePatterns = createDreamVinePatterns();
const cosmicLotusPatterns = createCosmicLotusPatterns();

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
  tweenBetweenKeyframes: true, // Smooth transitions between lifecycle stages
  keyframes: [
    {
      name: "bud",
      duration: 15,
      pattern: simpleBloomPatterns.bud,
      // Sage palette - quiet growth
      palette: ["#D0E8D0", "#E0F0E0", "#F0F8F0"],
      opacity: 0.6,
      scale: 0.7,
    },
    {
      name: "sprout",
      duration: 20,
      pattern: simpleBloomPatterns.sprout,
      // Mint palette - fresh clarity
      palette: ["#C0E0E0", "#D0F0E0", "#E8F8F0"],
      opacity: 0.8,
      scale: 0.85,
    },
    {
      name: "bloom",
      duration: 45,
      pattern: simpleBloomPatterns.bloom,
      // Sage palette at full
      palette: ["#D0E8D0", "#E0F0E0", "#F0F8F0"],
      opacity: 1.0,
      scale: 1.0,
    },
    {
      name: "fade",
      duration: 25,
      pattern: simpleBloomPatterns.fade,
      // Canvas palette - returning to neutral
      palette: ["#E8E8F0", "#F0F0F0", "#F8F8F8"],
      opacity: 0.5,
      scale: 0.9,
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
  tweenBetweenKeyframes: true, // Smooth transitions between lifecycle stages
  keyframes: [
    {
      name: "bulb",
      duration: 20,
      pattern: quantumTulipPatterns.bulb,
      // Canvas palette - pure potential
      palette: ["#E8E8F0", "#F0F0F0", "#F8F8F8"],
      opacity: 0.5,
      scale: 0.6,
    },
    {
      name: "stem",
      duration: 15,
      pattern: quantumTulipPatterns.stem,
      // Mint palette - fresh clarity
      palette: ["#C0E0E0", "#D0F0E0", "#E8F8F0"],
      opacity: 0.7,
      scale: 0.8,
    },
    {
      name: "bloom",
      duration: 60,
      pattern: quantumTulipPatterns.bloom,
      // Default: Blossom palette (overridden by colorVariations)
      palette: ["#F0D0E0", "#E0E8F0", "#E8F0E8"],
      opacity: 1.0,
      scale: 1.0,
    },
    {
      name: "wilt",
      duration: 30,
      pattern: quantumTulipPatterns.wilt,
      // Canvas palette - fading to neutral
      palette: ["#E8E8F0", "#F0F0F0", "#F8F8F8"],
      opacity: 0.4,
      scale: 0.85,
    },
  ],
  // Color variations - quantum selects one
  colorVariations: [
    {
      name: "coral",
      weight: 1.0, // Common
      palettes: {
        // Soft coral pink - gentle warmth
        bloom: ["#F0C0C0", "#F0D0D0", "#F8E8E8"],
        wilt: ["#E8E8F0", "#F0F0F0", "#F8F8F8"],
      },
    },
    {
      name: "peach",
      weight: 0.8, // Slightly less common
      palettes: {
        // Warm peach apricot - sunset glow
        bloom: ["#F0D0B0", "#F0E0C0", "#F8F0E0"],
        wilt: ["#E8E8F0", "#F0F0F0", "#F8F8F8"],
      },
    },
    {
      name: "lavender",
      weight: 0.5, // Rare
      palettes: {
        // Lavender lilac - dreamy calm
        bloom: ["#E0C0F0", "#E0D0F0", "#F0E8F8"],
        wilt: ["#E8E8F0", "#F0F0F0", "#F8F8F8"],
      },
    },
  ],
};

/**
 * Dewdrop Daisy
 *
 * A cheerful daisy with clustered thin petals and a sparkle effect.
 * Moderate rarity - more interesting than basic flowers.
 * Scale: 1.0x (standard)
 */
const dewdropDaisy: PlantVariant = {
  id: "dewdrop-daisy",
  name: "Dewdrop Daisy",
  description: "A cheerful daisy that sparkles like morning dew in the light",
  rarity: 0.7, // Moderate
  requiresObservationToGerminate: true,
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "bud",
      duration: 12,
      pattern: dewdropDaisyPatterns.bud,
      // Soft yellow-green for emerging bud
      palette: ["#E8F0D0", "#F0F8E0", "#F8FCF0"],
      opacity: 0.5,
      scale: 0.6,
    },
    {
      name: "unfurl",
      duration: 15,
      pattern: dewdropDaisyPatterns.unfurl,
      // Warming yellow
      palette: ["#F8F0D0", "#FCF8E0", "#FFFCF0"],
      opacity: 0.7,
      scale: 0.8,
    },
    {
      name: "bloom",
      duration: 20,
      pattern: dewdropDaisyPatterns.bloom,
      // Bright daisy white with golden center
      palette: ["#F8F0E0", "#FCF8F0", "#FFFFF8"],
      opacity: 1.0,
      scale: 1.0,
    },
    {
      name: "sparkle",
      duration: 8,
      pattern: dewdropDaisyPatterns.sparkle,
      // Bright white sparkle
      palette: ["#FFFFF0", "#FFFFF8", "#FFFFFF"],
      opacity: 1.0,
      scale: 1.05,
    },
    {
      name: "bloom-2",
      duration: 25,
      pattern: dewdropDaisyPatterns.bloom,
      // Back to normal bloom
      palette: ["#F8F0E0", "#FCF8F0", "#FFFFF8"],
      opacity: 1.0,
      scale: 1.0,
    },
    {
      name: "fade",
      duration: 20,
      pattern: dewdropDaisyPatterns.fade,
      // Fading to neutral
      palette: ["#F0F0E8", "#F8F8F0", "#FCFCF8"],
      opacity: 0.5,
      scale: 0.85,
    },
  ],
};

/**
 * Midnight Poppy
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
  loop: true, // Continuously opens and closes
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "closed",
      duration: 15,
      pattern: midnightPoppyPatterns.closed,
      // Deep burgundy - mysterious
      palette: ["#8B2252", "#A03060", "#B84070"],
      opacity: 0.7,
      scale: 0.75,
    },
    {
      name: "opening",
      duration: 12,
      pattern: midnightPoppyPatterns.opening,
      // Deepening red-purple
      palette: ["#9B3060", "#B04070", "#C85080"],
      opacity: 0.85,
      scale: 0.9,
    },
    {
      name: "open",
      duration: 30,
      pattern: midnightPoppyPatterns.open,
      // Rich, dramatic deep red with dark center
      palette: ["#A82860", "#C03878", "#D85090"],
      opacity: 1.0,
      scale: 1.1,
    },
    {
      name: "closing",
      duration: 12,
      pattern: midnightPoppyPatterns.closing,
      // Returning to deep tones
      palette: ["#9B3060", "#B04070", "#C85080"],
      opacity: 0.85,
      scale: 0.95,
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
const bellCluster: PlantVariant = {
  id: "bell-cluster",
  name: "Bell Cluster",
  description: "Delicate bells that bloom one after another in a gentle cascade",
  rarity: 0.4, // Uncommon
  requiresObservationToGerminate: true,
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "buds",
      duration: 18,
      pattern: bellClusterPatterns.buds,
      // Soft lilac for closed buds
      palette: ["#D8C8E0", "#E0D0E8", "#E8E0F0"],
      opacity: 0.5,
      scale: 0.7,
    },
    {
      name: "first",
      duration: 15,
      pattern: bellClusterPatterns.first,
      // First bell opening - brightening
      palette: ["#E0D0E8", "#E8D8F0", "#F0E8F8"],
      opacity: 0.7,
      scale: 0.85,
    },
    {
      name: "second",
      duration: 15,
      pattern: bellClusterPatterns.second,
      // Two bells open - more vibrant
      palette: ["#E8D8F0", "#F0E0F8", "#F8F0FC"],
      opacity: 0.85,
      scale: 0.95,
    },
    {
      name: "full",
      duration: 40,
      pattern: bellClusterPatterns.full,
      // All bells open - full bloom
      palette: ["#F0E0F8", "#F8E8FC", "#FCF4FF"],
      opacity: 1.0,
      scale: 1.2,
    },
    {
      name: "fade",
      duration: 20,
      pattern: bellClusterPatterns.fade,
      // Fading bells
      palette: ["#E8E0F0", "#F0F0F8", "#F8F8FC"],
      opacity: 0.4,
      scale: 1.0,
    },
  ],
};

// ============================================================================
// GROUND COVER - Very common, simple, ambient background elements
// ============================================================================

/**
 * Soft Moss
 *
 * A very common ground cover that slowly fades in and stays static.
 * Minimal visual interest - just ambient texture.
 * Scale: 0.4x (small)
 */
const softMoss: PlantVariant = {
  id: "soft-moss",
  name: "Soft Moss",
  description: "A gentle ground cover that spreads slowly across the garden floor",
  rarity: 1.2, // Very common
  requiresObservationToGerminate: false, // Grows without observation
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "emerging",
      duration: 30,
      pattern: softMossPatterns.emerging,
      // Muted olive green - earthy
      palette: ["#C8D8C0", "#D0E0C8", "#D8E8D0"],
      opacity: 0.3,
      scale: 0.3,
    },
    {
      name: "settled",
      duration: 120, // Long duration - just sits there
      pattern: softMossPatterns.settled,
      // Muted olive green - earthy
      palette: ["#C8D8C0", "#D0E0C8", "#D8E8D0"],
      opacity: 0.5,
      scale: 0.4,
    },
  ],
};

/**
 * Pebble Patch
 *
 * Scattered dots representing small stones. Completely static.
 * The simplest possible variant - no animation at all.
 * Scale: 0.35x (tiny)
 */
const pebblePatch: PlantVariant = {
  id: "pebble-patch",
  name: "Pebble Patch",
  description: "Tiny stones scattered on the garden floor",
  rarity: 1.3, // Most common
  requiresObservationToGerminate: false,
  tweenBetweenKeyframes: false, // No need for tweening - static
  keyframes: [
    {
      name: "stones",
      duration: 999, // Effectively permanent
      pattern: pebblePatchPatterns.stones,
      // Warm gray - stone-like
      palette: ["#D8D8D0", "#E0E0D8", "#E8E8E0"],
      opacity: 0.4,
      scale: 0.35,
    },
  ],
};

// ============================================================================
// GRASSES - Common, gentle motion, fill space
// ============================================================================

/**
 * Meadow Tuft
 *
 * A cluster of grass blades that gently sways back and forth.
 * Simple 2-frame loop for subtle motion.
 * Scale: 0.6x
 */
const meadowTuft: PlantVariant = {
  id: "meadow-tuft",
  name: "Meadow Tuft",
  description: "A small cluster of grass that sways gently in an invisible breeze",
  rarity: 1.1, // Very common
  requiresObservationToGerminate: false,
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "sway-left",
      duration: 4,
      pattern: meadowTuftPatterns.swayLeft,
      // Soft green - fresh grass
      palette: ["#B8D8B0", "#C8E0C0", "#D8E8D0"],
      opacity: 0.7,
      scale: 0.6,
    },
    {
      name: "sway-right",
      duration: 4,
      pattern: meadowTuftPatterns.swayRight,
      // Soft green - fresh grass
      palette: ["#B8D8B0", "#C8E0C0", "#D8E8D0"],
      opacity: 0.7,
      scale: 0.6,
    },
  ],
};

/**
 * Whisper Reed
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
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "lean-left",
      duration: 5,
      pattern: whisperReedPatterns.leanLeft,
      // Pale green-gray - reed color
      palette: ["#C0D0C0", "#D0DCD0", "#E0E8E0"],
      opacity: 0.6,
      scale: 0.75,
    },
    {
      name: "lean-right",
      duration: 5,
      pattern: whisperReedPatterns.leanRight,
      // Pale green-gray - reed color
      palette: ["#C0D0C0", "#D0DCD0", "#E0E8E0"],
      opacity: 0.6,
      scale: 0.75,
    },
  ],
};

// ============================================================================
// SHRUBS - Uncommon, mid-ground structure elements with more complex patterns
// ============================================================================

/**
 * Cloud Bush
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
  loop: true, // Breathing animation loops
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "base",
      duration: 25,
      pattern: cloudBushPatterns.base,
      // Soft sage green - foundation
      palette: ["#A8C8A8", "#B8D8B8", "#C8E0C8"],
      opacity: 0.6,
      scale: 1.0,
    },
    {
      name: "full",
      duration: 20,
      pattern: cloudBushPatterns.full,
      // Richer green - expanded
      palette: ["#98C098", "#A8D0A8", "#B8DCB8"],
      opacity: 0.8,
      scale: 1.2,
    },
    {
      name: "breathe-in",
      duration: 6,
      pattern: cloudBushPatterns.full,
      // Same full pattern, slightly smaller scale
      palette: ["#98C098", "#A8D0A8", "#B8DCB8"],
      opacity: 0.85,
      scale: 1.15,
    },
    {
      name: "breathe-out",
      duration: 6,
      pattern: cloudBushPatterns.full,
      // Expand slightly
      palette: ["#98C098", "#A8D0A8", "#B8DCB8"],
      opacity: 0.9,
      scale: 1.25,
    },
    {
      name: "berried",
      duration: 40,
      pattern: cloudBushPatterns.berried,
      // Green with hints of berry color
      palette: ["#90B890", "#A0C8A0", "#E0A8B0"],
      opacity: 1.0,
      scale: 1.3,
    },
  ],
};

/**
 * Berry Thicket
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
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "sparse",
      duration: 20,
      pattern: berryThicketPatterns.sparse,
      // Dark green foliage - dense base
      palette: ["#708870", "#809880", "#90A890"],
      opacity: 0.5,
      scale: 1.0,
    },
    {
      name: "growing",
      duration: 25,
      pattern: berryThicketPatterns.growing,
      // Richer green, first berry hints
      palette: ["#688868", "#789878", "#88A888"],
      opacity: 0.7,
      scale: 1.2,
    },
    {
      name: "fruiting",
      duration: 30,
      pattern: berryThicketPatterns.fruiting,
      // Green with berry accents
      palette: ["#608060", "#709070", "#C87890"],
      opacity: 0.9,
      scale: 1.3,
    },
    {
      name: "ripe",
      duration: 45,
      pattern: berryThicketPatterns.ripe,
      // Full berry colors - rich and vibrant
      palette: ["#587858", "#689068", "#D86080"],
      opacity: 1.0,
      scale: 1.4,
    },
  ],
};

// ============================================================================
// TREES - Rare, landmark elements with impressive patterns
// ============================================================================

/**
 * Sapling Hope
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
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "seedling",
      duration: 20,
      pattern: saplingHopePatterns.seedling,
      // Fresh spring green - new life
      palette: ["#C0E0B0", "#D0E8C0", "#E0F0D0"],
      opacity: 0.4,
      scale: 0.6,
    },
    {
      name: "sprout",
      duration: 25,
      pattern: saplingHopePatterns.sprout,
      // Brightening green
      palette: ["#B0D8A0", "#C0E0B0", "#D8F0C8"],
      opacity: 0.6,
      scale: 0.9,
    },
    {
      name: "growing",
      duration: 30,
      pattern: saplingHopePatterns.growing,
      // Healthy green
      palette: ["#A0D090", "#B0D8A0", "#C8E8B8"],
      opacity: 0.8,
      scale: 1.2,
    },
    {
      name: "young",
      duration: 40,
      pattern: saplingHopePatterns.young,
      // Rich verdant green
      palette: ["#90C880", "#A8D898", "#C0E8B0"],
      opacity: 0.95,
      scale: 1.5,
    },
    {
      name: "mature",
      duration: 60,
      pattern: saplingHopePatterns.mature,
      // Deep forest green with golden highlights
      palette: ["#80B870", "#98C888", "#B8D8A0"],
      opacity: 1.0,
      scale: 1.8,
    },
  ],
};

/**
 * Weeping Willow
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
  loop: true, // Continuous gentle sway
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "sapling",
      duration: 25,
      pattern: weepingWillowPatterns.sapling,
      // Pale willow green
      palette: ["#B8D0A0", "#C8D8B0", "#D8E8C8"],
      opacity: 0.5,
      scale: 1.0,
    },
    {
      name: "growing",
      duration: 30,
      pattern: weepingWillowPatterns.growing,
      // Silvery green
      palette: ["#A8C898", "#B8D4A8", "#C8E0B8"],
      opacity: 0.7,
      scale: 1.5,
    },
    {
      name: "full",
      duration: 15,
      pattern: weepingWillowPatterns.full,
      // Full willow green
      palette: ["#98C088", "#A8D098", "#B8DCB0"],
      opacity: 0.9,
      scale: 2.0,
    },
    {
      name: "sway-left",
      duration: 8,
      pattern: weepingWillowPatterns.swayLeft,
      // Slightly lighter during movement
      palette: ["#A0C890", "#B0D8A0", "#C0E4B8"],
      opacity: 1.0,
      scale: 2.3,
    },
    {
      name: "sway-right",
      duration: 8,
      pattern: weepingWillowPatterns.swayRight,
      // Slightly lighter during movement
      palette: ["#A0C890", "#B0D8A0", "#C0E4B8"],
      opacity: 1.0,
      scale: 2.3,
    },
    {
      name: "rest",
      duration: 12,
      pattern: weepingWillowPatterns.full,
      // Return to full color
      palette: ["#98C088", "#A8D098", "#B8DCB0"],
      opacity: 1.0,
      scale: 2.5,
    },
  ],
};

// ============================================================================
// ETHEREAL - Rare, magical/quantum elements
// ============================================================================

/**
 * Pulsing Orb
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
  loop: true, // Loops forever
  tweenBetweenKeyframes: true, // Smooth transitions
  keyframes: [
    {
      name: "dim",
      duration: 8,
      pattern: pulsingOrbPatterns.dim,
      // Sky palette - morning light (dimmed)
      palette: ["#C0D8F0", "#D0E0F0", "#E8F0F8"],
      opacity: 0.4,
      scale: 0.9,
    },
    {
      name: "bright",
      duration: 5,
      pattern: pulsingOrbPatterns.bright,
      // Sky palette - morning light (bright)
      palette: ["#C0D8F0", "#D0E0F0", "#E8F0F8"],
      opacity: 1.0,
      scale: 1.1,
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
const fractalBloom: PlantVariant = {
  id: "fractal-bloom",
  name: "Fractal Bloom",
  description: "A mesmerizing recursive pattern that grows in self-similar complexity",
  rarity: 0.2, // Rare
  requiresObservationToGerminate: true,
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "seed",
      duration: 15,
      pattern: fractalBloomPatterns.seed,
      // Lavender - mysterious origin
      palette: ["#E0C0F0", "#E8D0F0", "#F0E0F8"],
      opacity: 0.5,
      scale: 0.7,
    },
    {
      name: "sprout",
      duration: 20,
      pattern: fractalBloomPatterns.sprout,
      // Brightening purple
      palette: ["#D0B0E8", "#E0C0F0", "#E8D0F8"],
      opacity: 0.75,
      scale: 0.85,
    },
    {
      name: "bloom",
      duration: 60,
      pattern: fractalBloomPatterns.bloom,
      // Full vibrant purple
      palette: ["#C8A8E0", "#D8B8F0", "#E8C8F8"],
      opacity: 1.0,
      scale: 1.0,
    },
  ],
};

/**
 * Phoenix Flame
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
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "ember",
      duration: 12,
      pattern: phoenixFlamePatterns.ember,
      // Warm ember orange
      palette: ["#F0A850", "#F8B860", "#FCC870"],
      opacity: 0.6,
      scale: 0.75,
    },
    {
      name: "rising",
      duration: 15,
      pattern: phoenixFlamePatterns.rising,
      // Brightening flame
      palette: ["#F89840", "#FCA850", "#FCB860"],
      opacity: 0.85,
      scale: 0.95,
    },
    {
      name: "blaze",
      duration: 25,
      pattern: phoenixFlamePatterns.blaze,
      // Full radiant flame
      palette: ["#F88830", "#FC9840", "#FCA850"],
      opacity: 1.0,
      scale: 1.1,
    },
  ],
};

/**
 * Crystal Cluster
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
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "nucleation",
      duration: 18,
      pattern: crystalClusterPatterns.nucleation,
      // Ice blue - crystal seed
      palette: ["#B0D8F0", "#C0E0F8", "#D0E8FC"],
      opacity: 0.4,
      scale: 0.6,
    },
    {
      name: "formation",
      duration: 25,
      pattern: crystalClusterPatterns.formation,
      // Brightening crystalline
      palette: ["#A0D0E8", "#B0D8F0", "#C0E0F8"],
      opacity: 0.7,
      scale: 0.75,
    },
    {
      name: "growth",
      duration: 50,
      pattern: crystalClusterPatterns.growth,
      // Full radiant crystal
      palette: ["#90C8E0", "#A0D0E8", "#B0D8F0"],
      opacity: 1.0,
      scale: 0.9,
    },
  ],
};

/**
 * Kaleidoscope Star
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
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "rotate1",
      duration: 10,
      pattern: kaleidoscopeStarPatterns.rotate1,
      // Rainbow pastel - shifting colors
      palette: ["#F0C0D0", "#D0E0F0", "#E0F0D0"],
      opacity: 0.9,
      scale: 1.1,
    },
    {
      name: "rotate2",
      duration: 10,
      pattern: kaleidoscopeStarPatterns.rotate2,
      // Shifted pastel colors
      palette: ["#E0D0F0", "#F0E0C0", "#C0F0E0"],
      opacity: 1.0,
      scale: 1.15,
    },
  ],
};

/**
 * Vortex Spiral
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
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "calm",
      duration: 12,
      pattern: vortexSpiralPatterns.calm,
      // Deep blue-purple - calm center
      palette: ["#9080C0", "#A090D0", "#B0A0E0"],
      opacity: 0.6,
      scale: 0.85,
    },
    {
      name: "spin",
      duration: 8,
      pattern: vortexSpiralPatterns.spin,
      // Vibrant purple - spinning
      palette: ["#A090D0", "#B0A0E0", "#C0B0F0"],
      opacity: 0.85,
      scale: 1.0,
    },
    {
      name: "whirl",
      duration: 6,
      pattern: vortexSpiralPatterns.whirl,
      // Bright radiant purple - peak intensity
      palette: ["#B0A0E0", "#C0B0F0", "#D0C0F8"],
      opacity: 1.0,
      scale: 1.05,
    },
  ],
};

/**
 * Nebula Bloom
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
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "drift",
      duration: 20,
      pattern: nebulaBloomPatterns.drift,
      // Soft nebula colors - diffuse
      palette: ["#D0C0E0", "#E0D0F0", "#E8E0F8"],
      opacity: 0.3,
      scale: 0.8,
    },
    {
      name: "coalescence",
      duration: 25,
      pattern: nebulaBloomPatterns.coalescence,
      // Forming nebula - brightening
      palette: ["#C0B0D8", "#D0C0E8", "#E0D0F8"],
      opacity: 0.6,
      scale: 1.0,
    },
    {
      name: "radiance",
      duration: 60,
      pattern: nebulaBloomPatterns.radiance,
      // Full stellar bloom - radiant
      palette: ["#B0A0D0", "#C0B0E0", "#D0C0F0"],
      opacity: 1.0,
      scale: 1.2,
    },
  ],
};

/**
 * Aurora Wisp
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
  loop: true, // Continuous flowing animation
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "shimmer",
      duration: 18,
      pattern: auroraWispPatterns.shimmer,
      // Soft cyan-green aurora
      palette: ["#B8E8E0", "#C8F0E8", "#D8F8F0"],
      opacity: 0.5,
      scale: 0.85,
    },
    {
      name: "flow",
      duration: 22,
      pattern: auroraWispPatterns.flow,
      // Brightening aurora
      palette: ["#A8E0D8", "#B8E8E0", "#C8F0E8"],
      opacity: 0.75,
      scale: 1.0,
    },
    {
      name: "dance",
      duration: 30,
      pattern: auroraWispPatterns.dance,
      // Full aurora brilliance
      palette: ["#98D8D0", "#A8E0D8", "#B8E8E0"],
      opacity: 1.0,
      scale: 1.15,
    },
  ],
};

/**
 * Prismatic Fern
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
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "sprout",
      duration: 20,
      pattern: prismaticFernPatterns.sprout,
      // Soft pastel rainbow start
      palette: ["#E8D0F0", "#F0D8F8", "#F8E0FF"],
      opacity: 0.6,
      scale: 0.75,
    },
    {
      name: "unfurling",
      duration: 25,
      pattern: prismaticFernPatterns.unfurling,
      // Vibrant spectrum emerging
      palette: ["#D8C0E8", "#E8D0F0", "#F0D8F8"],
      opacity: 0.8,
      scale: 0.9,
    },
    {
      name: "prismatic",
      duration: 55,
      pattern: prismaticFernPatterns.prismatic,
      // Full rainbow refraction
      palette: ["#C8B0E0", "#D8C0E8", "#E8D0F0"],
      opacity: 1.0,
      scale: 1.1,
    },
  ],
};

/**
 * Quantum Rose
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
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "bud",
      duration: 18,
      pattern: quantumRosePatterns.bud,
      // Rose petal colors - soft
      palette: ["#F0C8D8", "#F8D0E0", "#FFD8E8"],
      opacity: 0.6,
      scale: 0.7,
    },
    {
      name: "superposed",
      duration: 28,
      pattern: quantumRosePatterns.superposed,
      // Quantum shimmer - multiple states
      palette: ["#E8B8D0", "#F0C0D8", "#F8C8E0"],
      opacity: 0.7,
      scale: 0.95,
    },
    {
      name: "collapsed",
      duration: 60,
      pattern: quantumRosePatterns.collapsed,
      // Classical rose - deep color
      palette: ["#E0A8C8", "#E8B0D0", "#F0B8D8"],
      opacity: 1.0,
      scale: 1.1,
    },
  ],
};

/**
 * Star Moss
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
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "sparse",
      duration: 25,
      pattern: starMossPatterns.sparse,
      // Soft starlight
      palette: ["#D0D8F0", "#D8E0F8", "#E0E8FF"],
      opacity: 0.5,
      scale: 0.85,
    },
    {
      name: "growing",
      duration: 30,
      pattern: starMossPatterns.growing,
      // Constellation forming
      palette: ["#C0D0E8", "#C8D8F0", "#D0E0F8"],
      opacity: 0.75,
      scale: 1.0,
    },
    {
      name: "galaxy",
      duration: 50,
      pattern: starMossPatterns.galaxy,
      // Dense starfield
      palette: ["#B0C8E0", "#B8D0E8", "#C0D8F0"],
      opacity: 1.0,
      scale: 1.1,
    },
  ],
};

/**
 * Dream Vine
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
  loop: true, // Continuous flowing
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "tendril",
      duration: 20,
      pattern: dreamVinePatterns.tendril,
      // Soft dreamy purple
      palette: ["#D8C8E8", "#E0D0F0", "#E8D8F8"],
      opacity: 0.5,
      scale: 0.8,
    },
    {
      name: "weaving",
      duration: 25,
      pattern: dreamVinePatterns.weaving,
      // Flowing lavender
      palette: ["#C8B8E0", "#D0C0E8", "#D8C8F0"],
      opacity: 0.75,
      scale: 1.0,
    },
    {
      name: "cascade",
      duration: 35,
      pattern: dreamVinePatterns.cascade,
      // Full ethereal bloom
      palette: ["#B8A8D8", "#C0B0E0", "#C8B8E8"],
      opacity: 1.0,
      scale: 1.15,
    },
  ],
};

/**
 * Cosmic Lotus
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
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "seed",
      duration: 22,
      pattern: cosmicLotusPatterns.seed,
      // Sacred gold tones
      palette: ["#F0E0C8", "#F8E8D0", "#FFF0D8"],
      opacity: 0.6,
      scale: 0.75,
    },
    {
      name: "opening",
      duration: 30,
      pattern: cosmicLotusPatterns.opening,
      // Brightening sacred light
      palette: ["#E8D8B8", "#F0E0C0", "#F8E8C8"],
      opacity: 0.8,
      scale: 0.95,
    },
    {
      name: "transcendent",
      duration: 65,
      pattern: cosmicLotusPatterns.transcendent,
      // Full cosmic radiance
      palette: ["#E0D0B0", "#E8D8B8", "#F0E0C0"],
      opacity: 1.0,
      scale: 1.2,
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

const sumiSpiritPatterns = createSumiSpiritPatterns();

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
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "touch",
      duration: 8,
      pattern: sumiSpiritPatterns.touch,
      // Spirit blue - initial ink touch
      palette: ["#1E3A5F", "#2D4A6F", "#3D5A7F"],
      opacity: 0.6,
      scale: 0.8,
    },
    {
      name: "draw",
      duration: 12,
      pattern: sumiSpiritPatterns.draw,
      // Spirit blue - stroke extending
      palette: ["#1E3A5F", "#3A5A8F", "#5A7AAF"],
      opacity: 0.75,
      scale: 0.9,
    },
    {
      name: "flow",
      duration: 18,
      pattern: sumiSpiritPatterns.flow,
      // Spirit blue - flowing ink
      palette: ["#1E3A5F", "#4A6FA5", "#7A9FC5"],
      opacity: 0.85,
      scale: 0.95,
    },
    {
      name: "settle",
      duration: 25,
      pattern: sumiSpiritPatterns.settle,
      // Spirit blue - settling
      palette: ["#1E3A5F", "#4A6FA5", "#A8C5E5"],
      opacity: 0.95,
      scale: 1.0,
    },
    {
      name: "rest",
      duration: 60,
      pattern: sumiSpiritPatterns.rest,
      // Spirit blue - final form
      palette: ["#1E3A5F", "#4A6FA5", "#A8C5E5"],
      opacity: 1.0,
      scale: 1.0,
    },
  ],
  // Color variations - quantum selects one
  colorVariations: [
    {
      name: "spirit-blue",
      weight: 1.0, // Primary (most common)
      palettes: {
        // Deep indigo to pale blue - like Haku's dragon form
        touch: ["#1E3A5F", "#2D4A6F", "#3D5A7F"],
        draw: ["#1E3A5F", "#3A5A8F", "#5A7AAF"],
        flow: ["#1E3A5F", "#4A6FA5", "#7A9FC5"],
        settle: ["#1E3A5F", "#4A6FA5", "#A8C5E5"],
        rest: ["#1E3A5F", "#4A6FA5", "#A8C5E5"],
      },
    },
    {
      name: "classic-sumi",
      weight: 0.7, // Traditional ink
      palettes: {
        // Deep black to gray wash - traditional sumi ink
        touch: ["#1A1A2E", "#2A2A3E", "#3A3A4E"],
        draw: ["#1A1A2E", "#3A3A4E", "#5A5A6E"],
        flow: ["#1A1A2E", "#4A4A5E", "#6A6A7E"],
        settle: ["#1A1A2E", "#4A4A5E", "#8A8A9E"],
        rest: ["#1A1A2E", "#4A4A5E", "#8A8A9E"],
      },
    },
    {
      name: "autumn-red",
      weight: 0.4, // Rare - vermillion seal ink
      palettes: {
        // Vermillion to pale gold - like autumn leaves or seal ink
        touch: ["#8B2635", "#9B3645", "#AB4655"],
        draw: ["#8B2635", "#A84A3C", "#C56A5C"],
        flow: ["#8B2635", "#C85A3C", "#D89070"],
        settle: ["#8B2635", "#C85A3C", "#E8C4A8"],
        rest: ["#8B2635", "#C85A3C", "#E8C4A8"],
      },
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
function createZenLotusPatterns() {
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

const zenLotusPatterns = createZenLotusPatterns();

/**
 * Zen Lotus
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
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "seed",
      duration: 10,
      pattern: zenLotusPatterns.seed,
      palette: ["#E8EBE8", "#EEF1EE", "#F4F7F4"],
      opacity: 0.5,
      scale: 0.5,
    },
    {
      name: "bud",
      duration: 12,
      pattern: zenLotusPatterns.bud,
      palette: ["#E8EBE8", "#EEF1EE", "#F4F7F4"],
      opacity: 0.6,
      scale: 0.65,
    },
    {
      name: "rise",
      duration: 12,
      pattern: zenLotusPatterns.rise,
      palette: ["#E4E9E6", "#ECEFE9", "#F2F5F2"],
      opacity: 0.7,
      scale: 0.75,
    },
    {
      name: "open",
      duration: 15,
      pattern: zenLotusPatterns.open,
      palette: ["#E0E5E2", "#E8EDE9", "#F0F5F1"],
      opacity: 0.8,
      scale: 0.85,
    },
    {
      name: "unfurl",
      duration: 18,
      pattern: zenLotusPatterns.unfurl,
      palette: ["#DCE2DC", "#E6ECE6", "#F0F6F0"],
      opacity: 0.9,
      scale: 0.92,
    },
    {
      name: "bloom",
      duration: 40,
      pattern: zenLotusPatterns.bloom,
      palette: ["#D8DED8", "#E4EAE4", "#F0F6F0"],
      opacity: 1.0,
      scale: 1.0,
    },
    {
      name: "breathe",
      duration: 25,
      pattern: zenLotusPatterns.breathe,
      palette: ["#D8DED8", "#E4EAE4", "#F0F6F0"],
      opacity: 1.0,
      scale: 1.05,
    },
    {
      name: "rest",
      duration: 20,
      pattern: zenLotusPatterns.rest,
      palette: ["#E0E5E0", "#E8EDE8", "#F0F5F0"],
      opacity: 0.9,
      scale: 0.95,
    },
    {
      name: "close",
      duration: 15,
      pattern: zenLotusPatterns.close,
      palette: ["#E4E9E4", "#ECEFEC", "#F2F5F2"],
      opacity: 0.7,
      scale: 0.8,
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

const sacredMandalaPatterns = createSacredMandalaPatterns();

/**
 * Sacred Mandala - Concentric circles and radiating lines forming a contemplative pattern
 */
const sacredMandala: PlantVariant = {
  id: "sacred-mandala",
  name: "Sacred Mandala",
  description: "Precise geometric circles and radiating lines forming a contemplative pattern",
  rarity: 0.1,
  requiresObservationToGerminate: true,
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "seed",
      duration: 10,
      pattern: sacredMandalaPatterns.seed,
      palette: ["#909090", "#909090", "#909090"],
      opacity: 0.5,
      scale: 0.7,
    },
    {
      name: "rings",
      duration: 15,
      pattern: sacredMandalaPatterns.rings,
      palette: ["#808080", "#808080", "#808080"],
      opacity: 0.7,
      scale: 0.85,
    },
    {
      name: "radiate",
      duration: 20,
      pattern: sacredMandalaPatterns.radiate,
      palette: ["#707070", "#707070", "#707070"],
      opacity: 0.85,
      scale: 0.95,
    },
    {
      name: "complete",
      duration: 60,
      pattern: sacredMandalaPatterns.complete,
      palette: ["#606060", "#606060", "#606060"],
      opacity: 1.0,
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

const crystalLatticePatterns = createCrystalLatticePatterns();

/**
 * Crystal Lattice - Interlocking diamond grid with thin connecting lines
 */
const crystalLattice: PlantVariant = {
  id: "crystal-lattice",
  name: "Crystal Lattice",
  description: "Interlocking diamond grid evoking crystalline molecular structures",
  rarity: 0.1,
  requiresObservationToGerminate: true,
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "diamond",
      duration: 10,
      pattern: crystalLatticePatterns.diamond,
      palette: ["#888888", "#888888", "#888888"],
      opacity: 0.5,
      scale: 0.7,
    },
    {
      name: "grid",
      duration: 15,
      pattern: crystalLatticePatterns.grid,
      palette: ["#787878", "#787878", "#787878"],
      opacity: 0.7,
      scale: 0.85,
    },
    {
      name: "expand",
      duration: 20,
      pattern: crystalLatticePatterns.expand,
      palette: ["#686868", "#686868", "#686868"],
      opacity: 0.85,
      scale: 0.95,
    },
    {
      name: "full",
      duration: 60,
      pattern: crystalLatticePatterns.full,
      palette: ["#585858", "#585858", "#585858"],
      opacity: 1.0,
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

const stellarGeometryPatterns = createStellarGeometryPatterns();

/**
 * Stellar Geometry - Star outlines with radiating lines
 */
const stellarGeometry: PlantVariant = {
  id: "stellar-geometry",
  name: "Stellar Geometry",
  description: "Nested star outlines radiating with precise mathematical beauty",
  rarity: 0.1,
  requiresObservationToGerminate: true,
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "point",
      duration: 8,
      pattern: stellarGeometryPatterns.point,
      palette: ["#909090", "#909090", "#909090"],
      opacity: 0.5,
      scale: 0.6,
    },
    {
      name: "star",
      duration: 12,
      pattern: stellarGeometryPatterns.star,
      palette: ["#808080", "#808080", "#808080"],
      opacity: 0.7,
      scale: 0.8,
    },
    {
      name: "rays",
      duration: 18,
      pattern: stellarGeometryPatterns.rays,
      palette: ["#707070", "#707070", "#707070"],
      opacity: 0.85,
      scale: 0.9,
    },
    {
      name: "nested",
      duration: 60,
      pattern: stellarGeometryPatterns.nested,
      palette: ["#606060", "#606060", "#606060"],
      opacity: 1.0,
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

const metatronsCubePatterns = createMetatronsCubePatterns();

/**
 * Metatron's Cube - Sacred geometry pattern of overlapping circles and lines
 */
const metatronsCube: PlantVariant = {
  id: "metatrons-cube",
  name: "Metatron's Cube",
  description: "Sacred geometry of overlapping circles forming the Flower of Life",
  rarity: 0.08,
  requiresObservationToGerminate: true,
  tweenBetweenKeyframes: true,
  keyframes: [
    {
      name: "circle",
      duration: 10,
      pattern: metatronsCubePatterns.circle,
      palette: ["#888888", "#888888", "#888888"],
      opacity: 0.5,
      scale: 0.7,
    },
    {
      name: "six",
      duration: 15,
      pattern: metatronsCubePatterns.six,
      palette: ["#787878", "#787878", "#787878"],
      opacity: 0.7,
      scale: 0.85,
    },
    {
      name: "connect",
      duration: 20,
      pattern: metatronsCubePatterns.connect,
      palette: ["#686868", "#686868", "#686868"],
      opacity: 0.85,
      scale: 0.92,
    },
    {
      name: "complete",
      duration: 60,
      pattern: metatronsCubePatterns.complete,
      palette: ["#585858", "#585858", "#585858"],
      opacity: 1.0,
      scale: 1.0,
    },
  ],
};

// ============================================================================
// VECTOR VARIANTS
// ============================================================================
// True vector rendering using Three.js Line primitives.
// These render with smooth lines, no pixelation.

/**
 * Sacred Mandala (Vector) - Smooth vector version
 * Concentric circles with 8-fold radial symmetry
 */
const sacredMandalaVector: PlantVariant = {
  id: "sacred-mandala-vector",
  name: "Sacred Mandala (Vector)",
  description: "Precise geometric circles rendered with smooth vector lines",
  rarity: 0.06,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  keyframes: [], // Required but unused for vector mode
  vectorKeyframes: [
    {
      name: "seed",
      duration: 10,
      primitives: [vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8)],
      strokeColor: "#909090",
      strokeOpacity: 0.5,
      scale: 0.7,
    },
    {
      name: "rings",
      duration: 15,
      primitives: [...vectorConcentricCircles(VECTOR_CENTER, VECTOR_CENTER, [6, 12, 18])],
      strokeColor: "#808080",
      strokeOpacity: 0.7,
      scale: 0.85,
    },
    {
      name: "radiate",
      duration: 20,
      primitives: [
        ...vectorConcentricCircles(VECTOR_CENTER, VECTOR_CENTER, [6, 12, 18, 24]),
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 8, 6, 26),
      ],
      strokeColor: "#707070",
      strokeOpacity: 0.85,
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
      strokeColor: "#606060",
      strokeOpacity: 1.0,
      scale: 1.0,
    },
  ],
};

/**
 * Crystal Lattice (Vector) - Smooth vector version
 * Interlocking diamond grid pattern
 */
const crystalLatticeVector: PlantVariant = {
  id: "crystal-lattice-vector",
  name: "Crystal Lattice (Vector)",
  description: "Interlocking diamond grid with smooth vector lines",
  rarity: 0.06,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  keyframes: [],
  vectorKeyframes: [
    {
      name: "diamond",
      duration: 10,
      primitives: [vectorDiamond(VECTOR_CENTER, VECTOR_CENTER, 14, 18)],
      strokeColor: "#888888",
      strokeOpacity: 0.5,
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
      strokeColor: "#787878",
      strokeOpacity: 0.7,
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
      strokeColor: "#686868",
      strokeOpacity: 0.85,
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
      strokeColor: "#585858",
      strokeOpacity: 1.0,
      scale: 1.0,
    },
  ],
};

/**
 * Stellar Geometry (Vector) - Smooth vector version
 * Star outlines with radiating lines
 */
const stellarGeometryVector: PlantVariant = {
  id: "stellar-geometry-vector",
  name: "Stellar Geometry (Vector)",
  description: "Nested star outlines with smooth vector rendering",
  rarity: 0.06,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  keyframes: [],
  vectorKeyframes: [
    {
      name: "point",
      duration: 8,
      primitives: [
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 3),
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 6, 4, 7),
      ],
      strokeColor: "#909090",
      strokeOpacity: 0.5,
      scale: 0.6,
    },
    {
      name: "star",
      duration: 12,
      primitives: [
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 6, 16, 8, -90),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
      ],
      strokeColor: "#808080",
      strokeOpacity: 0.7,
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
      strokeColor: "#707070",
      strokeOpacity: 0.85,
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
      strokeColor: "#606060",
      strokeOpacity: 1.0,
      scale: 1.0,
    },
  ],
};

/**
 * Metatron's Cube (Vector) - Smooth vector version
 * Flower of Life pattern with connecting lines
 */
const metatronsCubeVector: PlantVariant = {
  id: "metatrons-cube-vector",
  name: "Metatron's Cube (Vector)",
  description: "Sacred geometry Flower of Life with smooth vector lines",
  rarity: 0.05,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  keyframes: [],
  vectorKeyframes: [
    {
      name: "circle",
      duration: 10,
      primitives: [vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8)],
      strokeColor: "#888888",
      strokeOpacity: 0.5,
      scale: 0.7,
    },
    {
      name: "six",
      duration: 15,
      primitives: [...vectorFlowerOfLife(VECTOR_CENTER, VECTOR_CENTER, 8, 1)],
      strokeColor: "#787878",
      strokeOpacity: 0.7,
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
      strokeColor: "#686868",
      strokeOpacity: 0.85,
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
      strokeColor: "#585858",
      strokeOpacity: 1.0,
      scale: 1.0,
    },
  ],
};

/**
 * All registered plant variants.
 *
 * Organized by category:
 * - Ground Cover: softMoss, pebblePatch (very common, ambient)
 * - Grasses: meadowTuft, whisperReed (common, gentle motion)
 * - Flowers: simpleBloom, quantumTulip, dewdropDaisy, midnightPoppy, bellCluster,
 *            zenLotus
 * - Shrubs: cloudBush, berryThicket (uncommon, mid-ground structure)
 * - Trees: saplingHope, weepingWillow (rare, landmark elements)
 * - Ethereal: pulsingOrb, fractalBloom, phoenixFlame, crystalCluster,
 *             kaleidoscopeStar, vortexSpiral, nebulaBloom, auroraWisp,
 *             prismaticFern, quantumRose, starMoss, dreamVine, cosmicLotus,
 *             sumiSpirit (rare, abstract magical effects)
 * - Geometric: sacredMandala, crystalLattice, stellarGeometry, metatronsCube
 *              (rare, minimalist line-work patterns)
 * - Geometric Vector: sacredMandalaVector, crystalLatticeVector,
 *                     stellarGeometryVector, metatronsCubeVector
 *                     (very rare, smooth vector line rendering)
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
  // Geometric Vector (very rare - smooth vector line-work)
  sacredMandalaVector,
  crystalLatticeVector,
  stellarGeometryVector,
  metatronsCubeVector,
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
