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
 * See docs/variants-and-lifecycle.md for full documentation.
 */

import type { PlantVariant } from "./types";

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
      pattern: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      // Sage palette - quiet growth
      palette: ["#D0E8D0", "#E0F0E0", "#F0F8F0"],
      opacity: 0.6,
      scale: 0.7,
    },
    {
      name: "sprout",
      duration: 20,
      pattern: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      // Mint palette - fresh clarity
      palette: ["#C0E0E0", "#D0F0E0", "#E8F8F0"],
      opacity: 0.8,
      scale: 0.85,
    },
    {
      name: "bloom",
      duration: 45,
      pattern: [
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
      ],
      // Sage palette at full
      palette: ["#D0E8D0", "#E0F0E0", "#F0F8F0"],
      opacity: 1.0,
      scale: 1.0,
    },
    {
      name: "fade",
      duration: 25,
      pattern: [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 0, 0, 1, 1, 0],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
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
      pattern: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      // Canvas palette - pure potential
      palette: ["#E8E8F0", "#F0F0F0", "#F8F8F8"],
      opacity: 0.5,
      scale: 0.6,
    },
    {
      name: "stem",
      duration: 15,
      pattern: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      // Mint palette - fresh clarity
      palette: ["#C0E0E0", "#D0F0E0", "#E8F8F0"],
      opacity: 0.7,
      scale: 0.8,
    },
    {
      name: "bloom",
      duration: 60,
      pattern: [
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
      ],
      // Default: Blossom palette (overridden by colorVariations)
      palette: ["#F0D0E0", "#E0E8F0", "#E8F0E8"],
      opacity: 1.0,
      scale: 1.0,
    },
    {
      name: "wilt",
      duration: 30,
      pattern: [
        [0, 1, 1, 0, 0, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
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
      pattern: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      // Muted olive green - earthy
      palette: ["#C8D8C0", "#D0E0C8", "#D8E8D0"],
      opacity: 0.3,
      scale: 0.3,
    },
    {
      name: "settled",
      duration: 120, // Long duration - just sits there
      pattern: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
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
      pattern: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
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
      pattern: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 1, 0, 0, 0],
        [0, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 1, 0, 1, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      // Soft green - fresh grass
      palette: ["#B8D8B0", "#C8E0C0", "#D8E8D0"],
      opacity: 0.7,
      scale: 0.6,
    },
    {
      name: "sway-right",
      duration: 4,
      pattern: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 1, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 0],
        [0, 1, 0, 1, 0, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
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
      pattern: [
        [0, 0, 1, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      // Pale green-gray - reed color
      palette: ["#C0D0C0", "#D0DCD0", "#E0E8E0"],
      opacity: 0.6,
      scale: 0.75,
    },
    {
      name: "lean-right",
      duration: 5,
      pattern: [
        [0, 0, 1, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 1, 0],
        [0, 0, 0, 1, 0, 0, 1, 0],
        [0, 0, 0, 1, 0, 0, 1, 0],
        [0, 0, 0, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      // Pale green-gray - reed color
      palette: ["#C0D0C0", "#D0DCD0", "#E0E8E0"],
      opacity: 0.6,
      scale: 0.75,
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
      pattern: [
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
      ],
      // Sky palette - morning light (dimmed)
      palette: ["#C0D8F0", "#D0E0F0", "#E8F0F8"],
      opacity: 0.4,
      scale: 0.9,
    },
    {
      name: "bright",
      duration: 5,
      pattern: [
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
      ],
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
 * - Flowers: simpleBloom, quantumTulip (moderate, lifecycle + color)
 * - Ethereal: pulsingOrb (rare, magical effects)
 *
 * Add new variants here to make them available in the system.
 */
export const PLANT_VARIANTS: PlantVariant[] = [
  // Ground Cover (very common)
  softMoss,
  pebblePatch,
  // Grasses (common)
  meadowTuft,
  whisperReed,
  // Flowers (moderate)
  simpleBloom,
  quantumTulip,
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
