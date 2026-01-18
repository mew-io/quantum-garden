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

/**
 * Example: Simple Bloom
 *
 * A fixed-color plant that goes through bud → bloom → fade.
 * Uses soft sage greens from the pastel palette.
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
 * Example: Quantum Tulip
 *
 * A multi-color variant demonstrating colorVariations.
 * Quantum measurement determines whether it's coral, peach, or lavender.
 * Uses soft pastel palette. Pattern remains the same, only colors change.
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

/**
 * Example: Pulsing Orb
 *
 * A looping variant that continuously pulses.
 * Uses the sky palette. Demonstrates the loop feature for infinite animation.
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
 * Add new variants here to make them available in the system.
 */
export const PLANT_VARIANTS: PlantVariant[] = [simpleBloom, quantumTulip, pulsingOrb];

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
