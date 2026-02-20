import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorLine,
  vectorStar,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const vortexSpiral: PlantVariant = {
  id: "vortex-spiral",
  name: "Vortex Spiral",
  description: "Swirling energy spirals that pulse with hypnotic rhythm",
  rarity: 0.25, // Rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "calm",
      duration: 12,
      primitives: [
        // Calm center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 12),
        // Spiral arms (3)
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER, VECTOR_CENTER + 16, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER - 2, VECTOR_CENTER + 4, VECTOR_CENTER - 14, VECTOR_CENTER + 14),
        vectorLine(VECTOR_CENTER - 2, VECTOR_CENTER - 4, VECTOR_CENTER - 12, VECTOR_CENTER - 16),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.55,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.4,
      scale: 0.85,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "spin",
      duration: 8,
      primitives: [
        // Spinning center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 7),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 14),
        // Spiral arms extended
        vectorLine(VECTOR_CENTER + 5, VECTOR_CENTER - 2, VECTOR_CENTER + 20, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER + 4, VECTOR_CENTER - 18, VECTOR_CENTER + 16),
        vectorLine(VECTOR_CENTER - 1, VECTOR_CENTER - 5, VECTOR_CENTER - 14, VECTOR_CENTER - 20),
        // Spiral tips
        vectorCircle(VECTOR_CENTER + 20, VECTOR_CENTER - 14, 3),
        vectorCircle(VECTOR_CENTER - 18, VECTOR_CENTER + 16, 3),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER - 20, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.5,
      scale: 1.0,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "whirl",
      duration: 6,
      primitives: [
        // Intense whirling center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 16),
        // Whirling arms
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 4, VECTOR_CENTER + 24, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER - 5, VECTOR_CENTER + 5, VECTOR_CENTER - 22, VECTOR_CENTER + 18),
        vectorLine(VECTOR_CENTER - 1, VECTOR_CENTER - 6, VECTOR_CENTER - 16, VECTOR_CENTER - 24),
        // Energy particles
        vectorCircle(VECTOR_CENTER + 24, VECTOR_CENTER - 18, 4),
        vectorCircle(VECTOR_CENTER - 22, VECTOR_CENTER + 18, 4),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 24, 4),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 8, 4, 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.6,
      scale: 1.05,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};
