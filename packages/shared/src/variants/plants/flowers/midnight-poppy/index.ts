import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorLine,
  vectorStar,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const midnightPoppy: PlantVariant = {
  id: "midnight-poppy",
  name: "Midnight Poppy",
  description: "A dramatic poppy with deep colors that opens and closes in a mesmerizing cycle",
  rarity: 0.4, // Uncommon
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true, // Continuously opens and closes
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "closed",
      duration: 15,
      primitives: [
        // Closed bud - tight cup shape
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 4),
        // Tight petals folded up
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER - 2, VECTOR_CENTER - 3, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER - 2, VECTOR_CENTER + 3, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 2, VECTOR_CENTER, VECTOR_CENTER - 16),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER + 18),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#E89090", // Coral fill
      fillOpacity: 0.4,
      scale: 0.75,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "opening",
      duration: 12,
      primitives: [
        // Dark center emerging
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 7),
        // Petals starting to unfurl (cup opening)
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 14, 4),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 14, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 4),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER + 18),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#E89090", // Coral fill
      fillOpacity: 0.5,
      scale: 0.9,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "open",
      duration: 30,
      primitives: [
        // Dark dramatic center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 4, 3),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 4, 5),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER - 4, 6, 3, 5),
        // Full open petals - dramatic spread
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 6, 7),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 6, 7),
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 16, 6),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 16, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 20, 6),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER - 12, 5),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER - 12, 5),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER, VECTOR_CENTER + 20),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#E89090", // Coral fill
      fillOpacity: 0.65,
      scale: 1.1,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "closing",
      duration: 12,
      primitives: [
        // Center retreating
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 7),
        // Petals curling back inward
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 14, 4),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 14, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 4),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER + 18),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#E89090", // Coral fill
      fillOpacity: 0.5,
      scale: 0.95,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};
