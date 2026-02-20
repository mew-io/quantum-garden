import type { PlantVariant } from "../../../types";
import { vectorCircle, vectorLine, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const bellCluster: PlantVariant = {
  id: "bell-cluster",
  name: "Bell Cluster",
  description: "Delicate bells that bloom one after another in a gentle cascade",
  rarity: 0.4, // Uncommon
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "buds",
      duration: 18,
      primitives: [
        // Main stem arching over
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 18, VECTOR_CENTER, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER - 8, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER + 8, VECTOR_CENTER - 10),
        // Three closed bell buds hanging down
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER - 12, VECTOR_CENTER - 10, VECTOR_CENTER - 4),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 2, 3),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER, VECTOR_CENTER),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 2, 3),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 10, VECTOR_CENTER + 10, VECTOR_CENTER - 2),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.35,
      scale: 0.7,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "first",
      duration: 15,
      primitives: [
        // Main stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 18, VECTOR_CENTER, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER - 10, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER + 8, VECTOR_CENTER - 12),
        // First bell open (left)
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 14, VECTOR_CENTER - 12, VECTOR_CENTER - 4),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 2, 4),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 2, 5),
        // Second bell still closed
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER, VECTOR_CENTER),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 2, 3),
        // Third bell still closed
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 12, VECTOR_CENTER + 10, VECTOR_CENTER - 2),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.45,
      scale: 0.85,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "second",
      duration: 15,
      primitives: [
        // Main stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 18, VECTOR_CENTER, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER - 12, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER + 10, VECTOR_CENTER - 14),
        // First bell open (left)
        vectorLine(VECTOR_CENTER - 12, VECTOR_CENTER - 16, VECTOR_CENTER - 14, VECTOR_CENTER - 4),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER - 2, 4),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER + 3, 5),
        // Second bell open (center)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 12, VECTOR_CENTER, VECTOR_CENTER),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 2, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 6, 5),
        // Third bell still closed
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER - 14, VECTOR_CENTER + 12, VECTOR_CENTER - 2),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.5,
      scale: 0.95,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "full",
      duration: 40,
      primitives: [
        // Main stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 20, VECTOR_CENTER, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 12, VECTOR_CENTER - 14, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 12, VECTOR_CENTER + 12, VECTOR_CENTER - 16),
        // All three bells fully open
        // Left bell
        vectorLine(VECTOR_CENTER - 14, VECTOR_CENTER - 18, VECTOR_CENTER - 16, VECTOR_CENTER - 6),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 4, 5),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER + 2, 6),
        // Center bell (slightly lower)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER, VECTOR_CENTER - 2),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 6, 6),
        // Right bell
        vectorLine(VECTOR_CENTER + 12, VECTOR_CENTER - 16, VECTOR_CENTER + 14, VECTOR_CENTER - 4),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER - 2, 5),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER + 4, 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.2,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "fade",
      duration: 20,
      primitives: [
        // Main stem drooping slightly
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 18, VECTOR_CENTER, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER - 10, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER + 8, VECTOR_CENTER - 10),
        // Fading bells
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 12, VECTOR_CENTER - 12, VECTOR_CENTER - 4),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 2, 4),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 2, 4),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER, VECTOR_CENTER - 2),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 4, 4),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 10, VECTOR_CENTER + 10, VECTOR_CENTER - 2),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER + 4, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.35,
      scale: 1.0,
      transitionHint: { strategy: "fade", easing: "easeInOut" },
    },
  ],
};
