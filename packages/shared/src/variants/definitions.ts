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
  PATTERN_SIZE,
} from "../patterns/pattern-builder";

// ============================================================================
// PATTERN GENERATORS
// ============================================================================

/**
 * Generate patterns for Simple Bloom lifecycle
 */
function createSimpleBloomPatterns() {
  // Bud: small central oval + thin stem
  const bud = createEmptyPattern();
  drawEllipse(bud, 32, 24, 6, 8); // Small bud
  drawRect(bud, 30, 32, 33, 52); // Thin stem

  // Sprout: taller with leaves
  const sprout = createEmptyPattern();
  drawEllipse(sprout, 32, 18, 8, 10); // Growing bud
  drawRect(sprout, 30, 28, 33, 54); // Stem
  // Small leaves
  drawPetal(sprout, 24, 38, 30, 42, 4);
  drawPetal(sprout, 40, 38, 34, 42, 4);

  // Bloom: full flower with petals
  const bloom = createEmptyPattern();
  // Center
  drawCircle(bloom, 32, 22, 8);
  // Petals radiating out
  drawPetal(bloom, 32, 4, 32, 18, 8); // Top
  drawPetal(bloom, 48, 12, 38, 20, 8); // Top-right
  drawPetal(bloom, 52, 26, 40, 24, 8); // Right
  drawPetal(bloom, 48, 38, 38, 28, 8); // Bottom-right
  drawPetal(bloom, 16, 12, 26, 20, 8); // Top-left
  drawPetal(bloom, 12, 26, 24, 24, 8); // Left
  drawPetal(bloom, 16, 38, 26, 28, 8); // Bottom-left
  // Stem
  drawRect(bloom, 30, 30, 33, 56);

  // Fade: wilting, drooping petals
  const fade = createEmptyPattern();
  drawCircle(fade, 32, 24, 6);
  // Drooping petals
  drawPetal(fade, 22, 32, 28, 24, 5);
  drawPetal(fade, 42, 32, 36, 24, 5);
  drawPetal(fade, 32, 8, 32, 20, 5);
  drawPetal(fade, 18, 18, 26, 22, 4);
  drawPetal(fade, 46, 18, 38, 22, 4);
  // Shorter stem
  drawRect(fade, 30, 32, 33, 50);

  return { bud, sprout, bloom, fade };
}

/**
 * Generate patterns for Quantum Tulip lifecycle
 */
function createQuantumTulipPatterns() {
  // Bulb: underground bulb shape
  const bulb = createEmptyPattern();
  drawEllipse(bulb, 32, 40, 10, 14);
  drawRect(bulb, 30, 26, 33, 32); // Small shoot

  // Stem: tall thin stem
  const stem = createEmptyPattern();
  drawRect(stem, 30, 14, 33, 56);
  // Small leaves at base
  drawPetal(stem, 22, 48, 29, 44, 5);
  drawPetal(stem, 42, 48, 35, 44, 5);

  // Bloom: classic tulip cup
  const bloom = createEmptyPattern();
  // Tulip petals (cup shape)
  drawPetal(bloom, 20, 8, 28, 28, 10);
  drawPetal(bloom, 44, 8, 36, 28, 10);
  drawPetal(bloom, 32, 6, 32, 26, 12);
  // Center fill
  drawEllipse(bloom, 32, 22, 10, 8);
  // Stem
  drawRect(bloom, 30, 30, 33, 56);

  // Wilt: drooping tulip
  const wilt = createEmptyPattern();
  // Drooping head tilted to side
  drawPetal(wilt, 18, 18, 26, 28, 8);
  drawPetal(wilt, 24, 12, 28, 26, 8);
  drawPetal(wilt, 12, 24, 24, 28, 6);
  // Curved stem
  drawRect(wilt, 28, 28, 31, 36);
  drawRect(wilt, 30, 34, 33, 56);

  return { bulb, stem, bloom, wilt };
}

/**
 * Generate patterns for Soft Moss lifecycle
 */
function createSoftMossPatterns() {
  // Emerging: small scattered clusters
  const emerging = createEmptyPattern();
  scatterDots(emerging, 8, 2, 4, 42);

  // Settled: larger organic spread
  const settled = createEmptyPattern();
  scatterDots(settled, 20, 3, 6, 42);
  // Add some connecting blobs
  drawCircle(settled, 28, 32, 8);
  drawCircle(settled, 36, 30, 6);
  drawCircle(settled, 32, 38, 5);

  return { emerging, settled };
}

/**
 * Generate patterns for Pebble Patch
 */
function createPebblePatchPatterns() {
  const stones = createEmptyPattern();
  // Scattered stones of varying sizes
  drawEllipse(stones, 12, 20, 5, 4);
  drawEllipse(stones, 48, 16, 6, 5);
  drawCircle(stones, 28, 38, 4);
  drawEllipse(stones, 52, 44, 4, 3);
  drawCircle(stones, 16, 50, 5);
  drawEllipse(stones, 40, 32, 3, 4);
  drawCircle(stones, 8, 36, 3);
  drawEllipse(stones, 56, 28, 4, 3);

  return { stones };
}

/**
 * Generate patterns for Meadow Tuft
 */
function createMeadowTuftPatterns() {
  // Sway left: grass blades leaning left
  const swayLeft = createEmptyPattern();
  drawGrassBlade(swayLeft, 24, 56, 32, -0.4, 3);
  drawGrassBlade(swayLeft, 32, 58, 36, -0.3, 3);
  drawGrassBlade(swayLeft, 40, 56, 30, -0.5, 3);
  drawGrassBlade(swayLeft, 28, 54, 28, -0.2, 2);
  drawGrassBlade(swayLeft, 36, 54, 34, -0.4, 2);
  // Base clump
  drawEllipse(swayLeft, 32, 58, 14, 6);

  // Sway right: mirror of sway left
  const swayRight = mirrorHorizontal(swayLeft);

  return { swayLeft, swayRight };
}

/**
 * Generate patterns for Whisper Reed
 */
function createWhisperReedPatterns() {
  // Lean left: tall thin reeds
  const leanLeft = createEmptyPattern();
  drawGrassBlade(leanLeft, 22, 60, 50, -0.25, 2);
  drawGrassBlade(leanLeft, 32, 60, 54, -0.2, 2);
  drawGrassBlade(leanLeft, 42, 60, 48, -0.3, 2);
  // Small seed heads at top
  drawCircle(leanLeft, 10, 10, 3);
  drawCircle(leanLeft, 22, 6, 3);
  drawCircle(leanLeft, 30, 12, 3);

  // Lean right: mirror
  const leanRight = mirrorHorizontal(leanLeft);

  return { leanLeft, leanRight };
}

/**
 * Generate patterns for Pulsing Orb
 */
function createPulsingOrbPatterns() {
  // Dim: hollow ring
  const dim = createEmptyPattern();
  drawRing(dim, 32, 32, 16, 24);

  // Bright: filled glowing orb
  const bright = createEmptyPattern();
  drawCircle(bright, 32, 32, 26);

  return { dim, bright };
}

/**
 * Generate patterns for Dewdrop Daisy
 * A daisy-like flower with clustered thin petals and a prominent center
 */
function createDewdropDaisyPatterns() {
  // Bud: tight cluster of small dots
  const bud = createEmptyPattern();
  drawCircle(bud, 32, 28, 6);
  scatterDots(bud, 5, 2, 3, 101);
  drawRect(bud, 30, 34, 33, 52);

  // Unfurl: petals starting to emerge
  const unfurl = createEmptyPattern();
  drawCircle(unfurl, 32, 26, 7);
  // Emerging petals
  drawPetal(unfurl, 32, 14, 32, 22, 4);
  drawPetal(unfurl, 42, 20, 36, 24, 4);
  drawPetal(unfurl, 22, 20, 28, 24, 4);
  drawRect(unfurl, 30, 33, 33, 52);

  // Bloom: full daisy with many thin petals
  const bloom = createEmptyPattern();
  // Central disk
  drawCircle(bloom, 32, 24, 8);
  // Many thin petals radiating out
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const tipX = 32 + Math.cos(angle) * 22;
    const tipY = 24 + Math.sin(angle) * 22;
    const baseX = 32 + Math.cos(angle) * 8;
    const baseY = 24 + Math.sin(angle) * 8;
    drawPetal(bloom, tipX, tipY, baseX, baseY, 4);
  }
  drawRect(bloom, 30, 32, 33, 54);

  // Sparkle: slightly larger and brighter variant for animation
  const sparkle = createEmptyPattern();
  drawCircle(sparkle, 32, 24, 9);
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const tipX = 32 + Math.cos(angle) * 24;
    const tipY = 24 + Math.sin(angle) * 24;
    const baseX = 32 + Math.cos(angle) * 9;
    const baseY = 24 + Math.sin(angle) * 9;
    drawPetal(sparkle, tipX, tipY, baseX, baseY, 5);
  }
  drawRect(sparkle, 30, 33, 33, 54);

  // Fade: wilting daisy
  const fade = createEmptyPattern();
  drawCircle(fade, 32, 26, 6);
  // Drooping petals
  drawPetal(fade, 20, 32, 28, 26, 4);
  drawPetal(fade, 44, 32, 36, 26, 4);
  drawPetal(fade, 32, 12, 32, 22, 4);
  drawPetal(fade, 24, 18, 28, 24, 3);
  drawPetal(fade, 40, 18, 36, 24, 3);
  drawRect(fade, 30, 32, 33, 48);

  return { bud, unfurl, bloom, sparkle, fade };
}

/**
 * Generate patterns for Midnight Poppy
 * A dramatic flower with deep colors and curved, bowl-shaped petals
 */
function createMidnightPoppyPatterns() {
  // Closed: tightly wrapped bud
  const closed = createEmptyPattern();
  drawEllipse(closed, 32, 24, 8, 12);
  drawRect(closed, 30, 36, 33, 56);

  // Opening: petals starting to unfurl
  const opening = createEmptyPattern();
  // Bowl shape forming
  drawPetal(opening, 20, 16, 28, 28, 10);
  drawPetal(opening, 44, 16, 36, 28, 10);
  drawEllipse(opening, 32, 26, 10, 6);
  drawRect(opening, 30, 32, 33, 56);

  // Open: fully bloomed with dramatic curved petals
  const open = createEmptyPattern();
  // Large curved petals
  drawPetal(open, 12, 18, 26, 30, 14);
  drawPetal(open, 52, 18, 38, 30, 14);
  drawPetal(open, 32, 6, 32, 24, 12);
  drawPetal(open, 20, 10, 28, 26, 10);
  drawPetal(open, 44, 10, 36, 26, 10);
  // Dark center
  drawCircle(open, 32, 28, 8);
  // Stem
  drawRect(open, 30, 36, 33, 58);

  // Closing: petals curling back
  const closing = createEmptyPattern();
  drawPetal(closing, 18, 20, 28, 28, 10);
  drawPetal(closing, 46, 20, 36, 28, 10);
  drawPetal(closing, 32, 10, 32, 24, 10);
  drawEllipse(closing, 32, 26, 8, 6);
  drawRect(closing, 30, 34, 33, 56);

  return { closed, opening, open, closing };
}

/**
 * Generate patterns for Cloud Bush
 * A rounded, puffy shrub with overlapping circular shapes and berry details
 */
function createCloudBushPatterns() {
  // Base: rounded bush foundation
  const base = createEmptyPattern();
  // Overlapping circles for cloud-like shape
  drawCircle(base, 32, 40, 16);
  drawCircle(base, 20, 38, 12);
  drawCircle(base, 44, 38, 12);
  drawCircle(base, 26, 30, 10);
  drawCircle(base, 38, 30, 10);
  drawCircle(base, 32, 28, 12);

  // Full: fully expanded bush
  const full = createEmptyPattern();
  // Larger cloud shape
  drawCircle(full, 32, 38, 18);
  drawCircle(full, 16, 36, 14);
  drawCircle(full, 48, 36, 14);
  drawCircle(full, 24, 26, 12);
  drawCircle(full, 40, 26, 12);
  drawCircle(full, 32, 22, 14);
  drawCircle(full, 20, 44, 10);
  drawCircle(full, 44, 44, 10);

  // Berried: bush with berry details appearing
  const berried = createEmptyPattern();
  // Same cloud shape as full
  drawCircle(berried, 32, 38, 18);
  drawCircle(berried, 16, 36, 14);
  drawCircle(berried, 48, 36, 14);
  drawCircle(berried, 24, 26, 12);
  drawCircle(berried, 40, 26, 12);
  drawCircle(berried, 32, 22, 14);
  drawCircle(berried, 20, 44, 10);
  drawCircle(berried, 44, 44, 10);
  // Berry clusters (small dots) - these will show in a different color
  drawCircle(berried, 18, 32, 3);
  drawCircle(berried, 22, 36, 2);
  drawCircle(berried, 46, 32, 3);
  drawCircle(berried, 42, 36, 2);
  drawCircle(berried, 30, 20, 2);
  drawCircle(berried, 36, 22, 3);

  return { base, full, berried };
}

/**
 * Generate patterns for Berry Thicket
 * A dense shrub pattern with fruits that materialize over lifecycle
 */
function createBerryThicketPatterns() {
  // Sparse: initial dense foliage without berries
  const sparse = createEmptyPattern();
  // Dense branching pattern
  drawRect(sparse, 30, 48, 33, 58); // Main trunk
  // Left branches
  drawRect(sparse, 20, 40, 30, 43);
  drawRect(sparse, 12, 32, 22, 35);
  drawCircle(sparse, 14, 28, 6);
  drawCircle(sparse, 24, 34, 5);
  // Right branches
  drawRect(sparse, 34, 40, 44, 43);
  drawRect(sparse, 42, 32, 52, 35);
  drawCircle(sparse, 50, 28, 6);
  drawCircle(sparse, 40, 34, 5);
  // Top foliage
  drawCircle(sparse, 32, 24, 8);
  drawCircle(sparse, 26, 20, 6);
  drawCircle(sparse, 38, 20, 6);

  // Growing: more foliage, first berries appearing
  const growing = createEmptyPattern();
  drawRect(growing, 30, 48, 33, 58);
  drawRect(growing, 20, 40, 30, 43);
  drawRect(growing, 12, 32, 22, 35);
  drawCircle(growing, 14, 26, 8);
  drawCircle(growing, 24, 32, 7);
  drawRect(growing, 34, 40, 44, 43);
  drawRect(growing, 42, 32, 52, 35);
  drawCircle(growing, 50, 26, 8);
  drawCircle(growing, 40, 32, 7);
  drawCircle(growing, 32, 22, 10);
  drawCircle(growing, 24, 16, 7);
  drawCircle(growing, 40, 16, 7);
  // First berries
  drawCircle(growing, 10, 28, 3);
  drawCircle(growing, 54, 28, 3);

  // Fruiting: full berries visible throughout
  const fruiting = createEmptyPattern();
  drawRect(fruiting, 30, 48, 33, 58);
  drawRect(fruiting, 20, 40, 30, 43);
  drawRect(fruiting, 12, 32, 22, 35);
  drawCircle(fruiting, 14, 24, 9);
  drawCircle(fruiting, 24, 30, 8);
  drawRect(fruiting, 34, 40, 44, 43);
  drawRect(fruiting, 42, 32, 52, 35);
  drawCircle(fruiting, 50, 24, 9);
  drawCircle(fruiting, 40, 30, 8);
  drawCircle(fruiting, 32, 20, 12);
  drawCircle(fruiting, 22, 14, 8);
  drawCircle(fruiting, 42, 14, 8);
  // Many berries scattered throughout
  drawCircle(fruiting, 8, 26, 3);
  drawCircle(fruiting, 12, 20, 3);
  drawCircle(fruiting, 56, 26, 3);
  drawCircle(fruiting, 52, 20, 3);
  drawCircle(fruiting, 20, 12, 3);
  drawCircle(fruiting, 44, 12, 3);
  drawCircle(fruiting, 32, 10, 3);
  drawCircle(fruiting, 28, 26, 2);
  drawCircle(fruiting, 36, 26, 2);

  // Ripe: berries at peak ripeness (slightly larger berries)
  const ripe = createEmptyPattern();
  drawRect(ripe, 30, 48, 33, 58);
  drawRect(ripe, 20, 40, 30, 43);
  drawRect(ripe, 12, 32, 22, 35);
  drawCircle(ripe, 14, 24, 9);
  drawCircle(ripe, 24, 30, 8);
  drawRect(ripe, 34, 40, 44, 43);
  drawRect(ripe, 42, 32, 52, 35);
  drawCircle(ripe, 50, 24, 9);
  drawCircle(ripe, 40, 30, 8);
  drawCircle(ripe, 32, 20, 12);
  drawCircle(ripe, 22, 14, 8);
  drawCircle(ripe, 42, 14, 8);
  // Larger, riper berries
  drawCircle(ripe, 8, 26, 4);
  drawCircle(ripe, 12, 18, 4);
  drawCircle(ripe, 56, 26, 4);
  drawCircle(ripe, 52, 18, 4);
  drawCircle(ripe, 18, 10, 4);
  drawCircle(ripe, 46, 10, 4);
  drawCircle(ripe, 32, 8, 4);
  drawCircle(ripe, 26, 24, 3);
  drawCircle(ripe, 38, 24, 3);

  return { sparse, growing, fruiting, ripe };
}

/**
 * Generate patterns for Bell Cluster
 * Multiple hanging bell-shaped flowers with staggered blooming
 */
function createBellClusterPatterns() {
  // Buds: small closed bells hanging
  const buds = createEmptyPattern();
  // Main stem
  drawRect(buds, 30, 8, 33, 24);
  // Branch stems
  drawRect(buds, 20, 20, 23, 32);
  drawRect(buds, 40, 20, 43, 28);
  drawRect(buds, 32, 24, 35, 36);
  // Closed buds (teardrop shapes pointing down)
  drawEllipse(buds, 21, 38, 5, 8);
  drawEllipse(buds, 41, 34, 4, 6);
  drawEllipse(buds, 33, 42, 5, 8);

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

  // Full: all bells open
  const full = createEmptyPattern();
  drawRect(full, 30, 8, 33, 24);
  drawRect(full, 20, 20, 23, 32);
  drawRect(full, 40, 20, 43, 28);
  drawRect(full, 32, 24, 35, 36);
  // All bells open
  drawEllipse(full, 21, 38, 8, 6);
  drawRect(full, 16, 38, 26, 44);
  drawRing(full, 21, 44, 0, 8);
  drawEllipse(full, 41, 32, 7, 5);
  drawRect(full, 36, 32, 46, 38);
  drawRing(full, 41, 38, 0, 7);
  drawEllipse(full, 33, 44, 8, 6);
  drawRect(full, 28, 44, 38, 50);
  drawRing(full, 33, 50, 0, 8);

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
 * All registered plant variants.
 *
 * Organized by category:
 * - Ground Cover: softMoss, pebblePatch (very common, ambient)
 * - Grasses: meadowTuft, whisperReed (common, gentle motion)
 * - Flowers: simpleBloom, quantumTulip, dewdropDaisy, midnightPoppy, bellCluster
 * - Shrubs: cloudBush, berryThicket (uncommon, mid-ground structure)
 * - Ethereal: pulsingOrb (rare, magical effects)
 *
 * Total: 12 variants
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
  // Shrubs (uncommon)
  cloudBush,
  berryThicket,
  // Ethereal (rare)
  pulsingOrb,
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
