import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorLine,
  vectorStar,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const prismaticFern: PlantVariant = {
  id: "prismatic-fern",
  name: "Prismatic Fern",
  description: "Crystal fronds that refract light into rainbow patterns",
  rarity: 0.2, // Rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "sprout",
      duration: 20,
      primitives: [
        // Initial fern curl
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 8, 4),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER, VECTOR_CENTER - 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 3),
        // First frond hints
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER - 6, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER + 6, VECTOR_CENTER - 10),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.4,
      scale: 0.75,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "unfurling",
      duration: 25,
      primitives: [
        // Central stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 16, VECTOR_CENTER, VECTOR_CENTER - 14),
        // Unfurling fronds (pairs)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER - 12, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER + 12, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER - 14, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER + 14, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER - 10, VECTOR_CENTER - 2),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER + 10, VECTOR_CENTER - 2),
        // Frond tips
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 18, 3),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 18, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.65,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.5,
      scale: 0.9,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "prismatic",
      duration: 55,
      primitives: [
        // Full stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 18, VECTOR_CENTER, VECTOR_CENTER - 18),
        // Full frond pairs (multiple levels)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER - 16, VECTOR_CENTER - 24),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER + 16, VECTOR_CENTER - 24),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER - 18, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER + 18, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 2, VECTOR_CENTER - 16, VECTOR_CENTER - 6),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 2, VECTOR_CENTER + 16, VECTOR_CENTER - 6),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 6, VECTOR_CENTER - 12, VECTOR_CENTER + 2),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 6, VECTOR_CENTER + 12, VECTOR_CENTER + 2),
        // Prismatic refraction points
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 24, 4),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER - 24, 4),
        vectorCircle(VECTOR_CENTER - 18, VECTOR_CENTER - 14, 3),
        vectorCircle(VECTOR_CENTER + 18, VECTOR_CENTER - 14, 3),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 6, 3),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER - 6, 3),
        // Rainbow tip
        vectorStar(VECTOR_CENTER, VECTOR_CENTER - 20, 6, 3, 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#A8D8A8", // Sage fill
      fillOpacity: 0.6,
      scale: 1.1,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};
