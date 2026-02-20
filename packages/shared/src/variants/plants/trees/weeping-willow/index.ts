import type { PlantVariant } from "../../../types";
import { vectorLine, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const weepingWillow: PlantVariant = {
  id: "weeping-willow",
  name: "Weeping Willow",
  description: "A graceful tree with cascading fronds that dance in invisible wind",
  rarity: 0.25, // Rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true, // Continuous gentle sway
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "sapling",
      duration: 25,
      primitives: [
        // Young trunk
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 20, VECTOR_CENTER, VECTOR_CENTER - 8),
        // Early drooping branches
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER - 8, VECTOR_CENTER + 6),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER + 8, VECTOR_CENTER + 6),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 6, VECTOR_CENTER - 6, VECTOR_CENTER + 2),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 6, VECTOR_CENTER + 6, VECTOR_CENTER + 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.3,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "growing",
      duration: 30,
      primitives: [
        // Growing trunk
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 22, VECTOR_CENTER, VECTOR_CENTER - 14),
        // Upper branches (arch up then droop)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER - 10, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER + 10, VECTOR_CENTER - 16),
        // Cascading fronds
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 16, VECTOR_CENTER - 14, VECTOR_CENTER + 4),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER - 16, VECTOR_CENTER + 14, VECTOR_CENTER + 4),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER - 14, VECTOR_CENTER - 8, VECTOR_CENTER + 6),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 14, VECTOR_CENTER + 8, VECTOR_CENTER + 6),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 12, VECTOR_CENTER - 2, VECTOR_CENTER + 8),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 12, VECTOR_CENTER + 2, VECTOR_CENTER + 8),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.4,
      scale: 1.5,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "full",
      duration: 15,
      primitives: [
        // Full trunk
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 24, VECTOR_CENTER, VECTOR_CENTER - 18),
        // Upper branches arching
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER - 14, VECTOR_CENTER - 22),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER + 14, VECTOR_CENTER - 22),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER - 8, VECTOR_CENTER - 24),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER + 8, VECTOR_CENTER - 24),
        // Full cascading fronds
        vectorLine(VECTOR_CENTER - 14, VECTOR_CENTER - 22, VECTOR_CENTER - 18, VECTOR_CENTER + 8),
        vectorLine(VECTOR_CENTER + 14, VECTOR_CENTER - 22, VECTOR_CENTER + 18, VECTOR_CENTER + 8),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER - 24, VECTOR_CENTER - 12, VECTOR_CENTER + 10),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 24, VECTOR_CENTER + 12, VECTOR_CENTER + 10),
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER - 20, VECTOR_CENTER - 6, VECTOR_CENTER + 12),
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER - 20, VECTOR_CENTER + 6, VECTOR_CENTER + 12),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 18, VECTOR_CENTER, VECTOR_CENTER + 14),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.5,
      scale: 2.0,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "sway-left",
      duration: 8,
      primitives: [
        // Trunk
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 26, VECTOR_CENTER, VECTOR_CENTER - 20),
        // Branches arching
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER - 16, VECTOR_CENTER - 24),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER + 12, VECTOR_CENTER - 22),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 18, VECTOR_CENTER - 10, VECTOR_CENTER - 26),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 18, VECTOR_CENTER + 6, VECTOR_CENTER - 24),
        // Fronds swaying left
        vectorLine(VECTOR_CENTER - 16, VECTOR_CENTER - 24, VECTOR_CENTER - 24, VECTOR_CENTER + 6),
        vectorLine(VECTOR_CENTER + 12, VECTOR_CENTER - 22, VECTOR_CENTER + 8, VECTOR_CENTER + 8),
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 26, VECTOR_CENTER - 18, VECTOR_CENTER + 10),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 24, VECTOR_CENTER + 2, VECTOR_CENTER + 12),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER - 22, VECTOR_CENTER - 12, VECTOR_CENTER + 12),
        vectorLine(VECTOR_CENTER + 2, VECTOR_CENTER - 20, VECTOR_CENTER - 4, VECTOR_CENTER + 14),
        vectorLine(VECTOR_CENTER - 2, VECTOR_CENTER - 18, VECTOR_CENTER - 8, VECTOR_CENTER + 16),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.8,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.55,
      scale: 2.3,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "sway-right",
      duration: 8,
      primitives: [
        // Trunk
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 26, VECTOR_CENTER, VECTOR_CENTER - 20),
        // Branches arching
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER - 12, VECTOR_CENTER - 22),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER + 16, VECTOR_CENTER - 24),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 18, VECTOR_CENTER - 6, VECTOR_CENTER - 24),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 18, VECTOR_CENTER + 10, VECTOR_CENTER - 26),
        // Fronds swaying right
        vectorLine(VECTOR_CENTER - 12, VECTOR_CENTER - 22, VECTOR_CENTER - 8, VECTOR_CENTER + 8),
        vectorLine(VECTOR_CENTER + 16, VECTOR_CENTER - 24, VECTOR_CENTER + 24, VECTOR_CENTER + 6),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER - 24, VECTOR_CENTER - 2, VECTOR_CENTER + 12),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER - 26, VECTOR_CENTER + 18, VECTOR_CENTER + 10),
        vectorLine(VECTOR_CENTER - 2, VECTOR_CENTER - 20, VECTOR_CENTER + 4, VECTOR_CENTER + 14),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 22, VECTOR_CENTER + 12, VECTOR_CENTER + 12),
        vectorLine(VECTOR_CENTER + 2, VECTOR_CENTER - 18, VECTOR_CENTER + 8, VECTOR_CENTER + 16),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.8,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.55,
      scale: 2.3,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "rest",
      duration: 12,
      primitives: [
        // Full trunk
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 28, VECTOR_CENTER, VECTOR_CENTER - 22),
        // Upper branches arching
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 18, VECTOR_CENTER - 16, VECTOR_CENTER - 26),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 18, VECTOR_CENTER + 16, VECTOR_CENTER - 26),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 20, VECTOR_CENTER - 10, VECTOR_CENTER - 28),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 20, VECTOR_CENTER + 10, VECTOR_CENTER - 28),
        // Full resting fronds
        vectorLine(VECTOR_CENTER - 16, VECTOR_CENTER - 26, VECTOR_CENTER - 20, VECTOR_CENTER + 10),
        vectorLine(VECTOR_CENTER + 16, VECTOR_CENTER - 26, VECTOR_CENTER + 20, VECTOR_CENTER + 10),
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 28, VECTOR_CENTER - 14, VECTOR_CENTER + 14),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER - 28, VECTOR_CENTER + 14, VECTOR_CENTER + 14),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER - 24, VECTOR_CENTER - 8, VECTOR_CENTER + 16),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 24, VECTOR_CENTER + 8, VECTOR_CENTER + 16),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 22, VECTOR_CENTER, VECTOR_CENTER + 18),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.9,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.6,
      scale: 2.5,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};
