import type { PlantVariant } from "../../../types";
import { vectorCircle, vectorLine, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const simpleBloom: PlantVariant = {
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
