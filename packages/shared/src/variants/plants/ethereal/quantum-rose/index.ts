import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorLine,
  vectorStar,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const quantumRose: PlantVariant = {
  id: "quantum-rose",
  name: "Quantum Rose",
  description: "A rose existing in superposition, collapsing into beauty when observed",
  rarity: 0.12, // Very rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "bud",
      duration: 18,
      primitives: [
        // Rose bud center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 7),
        // Closed petals
        vectorCircle(VECTOR_CENTER - 3, VECTOR_CENTER - 10, 4),
        vectorCircle(VECTOR_CENTER + 3, VECTOR_CENTER - 10, 4),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 16),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#E89090", // Coral fill (bud)
      fillOpacity: 0.4,
      scale: 0.7,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "superposed",
      duration: 28,
      primitives: [
        // Quantum shimmer center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 8),
        // Multiple superposed petals (ghost-like)
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 10, 5),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 10, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 5),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 4, 4),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 4, 4),
        // Quantum probability waves
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 14),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER + 18),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.65,
      fillColor: "#E89090", // Coral fill
      fillOpacity: 0.45,
      scale: 0.95,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "collapsed",
      duration: 60,
      primitives: [
        // Classical rose center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 3),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 6),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER - 6, 8, 4, 5),
        // Full bloom petals (layered)
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 10, 6),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 10, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 18, 6),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 2, 5),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 2, 5),
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 14, 5),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 14, 5),
        // Stem with thorns
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER, VECTOR_CENTER + 20),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 10, VECTOR_CENTER - 4, VECTOR_CENTER + 8),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 14, VECTOR_CENTER + 4, VECTOR_CENTER + 12),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#E89090", // Coral fill (full bloom)
      fillOpacity: 0.6,
      scale: 1.1,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};
