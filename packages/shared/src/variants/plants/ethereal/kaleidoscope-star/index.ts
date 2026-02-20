import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorStar,
  vectorDiamond,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const kaleidoscopeStar: PlantVariant = {
  id: "kaleidoscope-star",
  name: "Kaleidoscope Star",
  description: "A complex geometric pattern that rotates in mesmerizing symmetry",
  rarity: 0.2, // Rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "rotate1",
      duration: 10,
      primitives: [
        // Central star
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 12, 6, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        // Outer star rotated
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 20, 10, 8),
        // Concentric ring
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 16),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 24),
        // Cardinal diamonds
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER - 22, 4, 6),
        vectorDiamond(VECTOR_CENTER + 22, VECTOR_CENTER, 4, 6),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER + 22, 4, 6),
        vectorDiamond(VECTOR_CENTER - 22, VECTOR_CENTER, 4, 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.5,
      scale: 1.1,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "rotate2",
      duration: 10,
      primitives: [
        // Central star (rotated position)
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 14, 7, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 9),
        // Outer star
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 22, 11, 8),
        // Concentric rings
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 18),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 26),
        // Diagonal diamonds
        vectorDiamond(VECTOR_CENTER - 16, VECTOR_CENTER - 16, 4, 6),
        vectorDiamond(VECTOR_CENTER + 16, VECTOR_CENTER - 16, 4, 6),
        vectorDiamond(VECTOR_CENTER + 16, VECTOR_CENTER + 16, 4, 6),
        vectorDiamond(VECTOR_CENTER - 16, VECTOR_CENTER + 16, 4, 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.15,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};
