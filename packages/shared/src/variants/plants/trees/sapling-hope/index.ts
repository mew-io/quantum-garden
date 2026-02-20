import type { PlantVariant } from "../../../types";
import { vectorCircle, vectorLine, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const saplingHope: PlantVariant = {
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
