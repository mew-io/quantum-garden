import type { PlantVariant } from "../../../types";
import { vectorCircle, vectorLine, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const fractalBloom: PlantVariant = {
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
