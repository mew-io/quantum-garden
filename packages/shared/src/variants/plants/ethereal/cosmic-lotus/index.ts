import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorStar,
  vectorSpiral,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const cosmicLotus: PlantVariant = {
  id: "cosmic-lotus",
  name: "Cosmic Lotus",
  description: "Sacred geometry blooming into transcendent cosmic flower",
  rarity: 0.1, // Very rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "seed",
      duration: 22,
      primitives: [
        // Sacred seed geometry
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
        // Vesica piscis hint
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER, 6),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER, 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.35,
      scale: 0.75,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "opening",
      duration: 30,
      primitives: [
        // Opening sacred geometry
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 16),
        // Flower of life pattern (6 overlapping circles)
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 12, 6),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 6, 6),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 6, 6),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER + 6, 6),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER + 6, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 12, 6),
        // Petals emerging
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 18, 4),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 9, 4),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER - 9, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.65,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.45,
      scale: 0.95,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "transcendent",
      duration: 65,
      primitives: [
        // Transcendent center with mesmerizing spiral
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 2, 10, 2.5, 0),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 12, 6, 12),
        // Full flower of life
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 14, 7),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 7, 7),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 7, 7),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 7, 7),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER + 7, 7),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 14, 7),
        // Outer lotus petals
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 24, 6),
        vectorCircle(VECTOR_CENTER - 21, VECTOR_CENTER - 12, 5),
        vectorCircle(VECTOR_CENTER + 21, VECTOR_CENTER - 12, 5),
        vectorCircle(VECTOR_CENTER - 21, VECTOR_CENTER + 12, 5),
        vectorCircle(VECTOR_CENTER + 21, VECTOR_CENTER + 12, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 24, 6),
        // Cosmic radiance
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 28),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.55,
      scale: 1.2,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};
