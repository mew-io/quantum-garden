import type { PlantVariant } from "../../../types";
import { vectorCircle, vectorLine, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const berryThicket: PlantVariant = {
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
