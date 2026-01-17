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
 * Uses soft greens throughout - grass-like plants are always green.
 */
const simpleBloom: PlantVariant = {
  id: "simple-bloom",
  name: "Simple Bloom",
  description: "A gentle plant with a classic bud-bloom-fade lifecycle",
  rarity: 1.0, // Most common
  requiresObservationToGerminate: true,
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
      palette: ["#4A7C59", "#68A357", "#8BC34A"],
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
      palette: ["#4A7C59", "#68A357", "#8BC34A"],
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
      palette: ["#2E7D32", "#4CAF50", "#81C784"],
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
      palette: ["#5D4037", "#795548", "#A1887F"],
      opacity: 0.5,
      scale: 0.9,
    },
  ],
};

/**
 * Example: Quantum Tulip
 *
 * A multi-color variant demonstrating colorVariations.
 * Quantum measurement determines whether it's red, yellow, or purple.
 * Pattern remains the same, only colors change.
 */
const quantumTulip: PlantVariant = {
  id: "quantum-tulip",
  name: "Quantum Tulip",
  description: "A tulip that can bloom in different colors based on quantum measurement",
  rarity: 0.5, // Less common
  requiresObservationToGerminate: true,
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
      // Default: subtle brown/green for bulb (same across variations)
      palette: ["#5D4037", "#6D4C41", "#795548"],
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
      // Green stem (same across variations)
      palette: ["#388E3C", "#4CAF50", "#66BB6A"],
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
      // Default bloom color (overridden by colorVariations)
      palette: ["#E91E63", "#F06292", "#F8BBD9"],
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
      // Faded version (also overridden by colorVariations)
      palette: ["#8D6E63", "#A1887F", "#BCAAA4"],
      opacity: 0.4,
      scale: 0.85,
    },
  ],
  // Color variations - quantum selects one
  colorVariations: [
    {
      name: "red",
      weight: 1.0, // Common
      palettes: {
        bloom: ["#C62828", "#E53935", "#EF5350"],
        wilt: ["#5D4037", "#6D4C41", "#795548"],
      },
    },
    {
      name: "yellow",
      weight: 0.8, // Slightly less common
      palettes: {
        bloom: ["#F9A825", "#FBC02D", "#FFEB3B"],
        wilt: ["#5D4037", "#6D4C41", "#795548"],
      },
    },
    {
      name: "purple",
      weight: 0.5, // Rare
      palettes: {
        bloom: ["#6A1B9A", "#8E24AA", "#AB47BC"],
        wilt: ["#4A148C", "#6A1B9A", "#7B1FA2"],
      },
    },
  ],
};

/**
 * Example: Pulsing Orb
 *
 * A looping variant that continuously pulses.
 * Demonstrates the loop feature for infinite animation.
 */
const pulsingOrb: PlantVariant = {
  id: "pulsing-orb",
  name: "Pulsing Orb",
  description: "An ethereal orb that continuously pulses with light",
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
      palette: ["#1A237E", "#283593", "#3949AB"],
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
      palette: ["#5C6BC0", "#7986CB", "#9FA8DA"],
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
