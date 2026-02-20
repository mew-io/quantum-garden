import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorLine,
  vectorStar,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const starMoss: PlantVariant = {
  id: "star-moss",
  name: "Star Moss",
  description: "Bioluminescent moss forming constellations across the ground",
  rarity: 0.3, // Uncommon
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "sparse",
      duration: 25,
      primitives: [
        // Sparse star points
        vectorStar(VECTOR_CENTER - 10, VECTOR_CENTER - 8, 4, 2, 4),
        vectorStar(VECTOR_CENTER + 8, VECTOR_CENTER - 6, 3, 1.5, 4),
        vectorStar(VECTOR_CENTER - 6, VECTOR_CENTER + 10, 3, 1.5, 4),
        vectorStar(VECTOR_CENTER + 12, VECTOR_CENTER + 6, 4, 2, 4),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 5, 2.5, 4),
        // Dim connecting lines
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 8, VECTOR_CENTER, VECTOR_CENTER),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 8, VECTOR_CENTER - 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#88D0D0", // Mint fill
      fillOpacity: 0.4,
      scale: 0.85,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "growing",
      duration: 30,
      primitives: [
        // More stars forming
        vectorStar(VECTOR_CENTER - 12, VECTOR_CENTER - 10, 5, 2.5, 4),
        vectorStar(VECTOR_CENTER + 10, VECTOR_CENTER - 8, 4, 2, 4),
        vectorStar(VECTOR_CENTER - 8, VECTOR_CENTER + 12, 4, 2, 4),
        vectorStar(VECTOR_CENTER + 14, VECTOR_CENTER + 8, 5, 2.5, 4),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 6, 3, 5),
        vectorStar(VECTOR_CENTER - 4, VECTOR_CENTER - 14, 3, 1.5, 4),
        vectorStar(VECTOR_CENTER + 6, VECTOR_CENTER + 14, 3, 1.5, 4),
        // Constellation lines
        vectorLine(VECTOR_CENTER - 12, VECTOR_CENTER - 10, VECTOR_CENTER, VECTOR_CENTER),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 10, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 14, VECTOR_CENTER + 8),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER + 12, VECTOR_CENTER, VECTOR_CENTER),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.65,
      fillColor: "#88D0D0", // Mint fill
      fillOpacity: 0.5,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "galaxy",
      duration: 50,
      primitives: [
        // Dense starfield
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 8, 4, 6),
        vectorStar(VECTOR_CENTER - 14, VECTOR_CENTER - 12, 6, 3, 4),
        vectorStar(VECTOR_CENTER + 12, VECTOR_CENTER - 10, 5, 2.5, 4),
        vectorStar(VECTOR_CENTER - 10, VECTOR_CENTER + 14, 5, 2.5, 4),
        vectorStar(VECTOR_CENTER + 16, VECTOR_CENTER + 10, 6, 3, 4),
        vectorStar(VECTOR_CENTER - 6, VECTOR_CENTER - 18, 4, 2, 4),
        vectorStar(VECTOR_CENTER + 8, VECTOR_CENTER + 18, 4, 2, 4),
        vectorStar(VECTOR_CENTER - 18, VECTOR_CENTER - 4, 4, 2, 4),
        vectorStar(VECTOR_CENTER + 20, VECTOR_CENTER - 2, 4, 2, 4),
        // Galaxy spiral hint
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 12),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 20),
        // Star dust
        vectorCircle(VECTOR_CENTER - 20, VECTOR_CENTER + 8, 2),
        vectorCircle(VECTOR_CENTER + 18, VECTOR_CENTER - 14, 2),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 16, 2),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER - 22, 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#88D0D0", // Mint fill
      fillOpacity: 0.6,
      scale: 1.1,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};
