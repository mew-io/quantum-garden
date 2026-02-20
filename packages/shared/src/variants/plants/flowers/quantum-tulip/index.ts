import type { PlantVariant } from "../../../types";
import { vectorCircle, vectorLine, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const quantumTulip: PlantVariant = {
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
