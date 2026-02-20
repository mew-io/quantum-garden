import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorLine,
  vectorStar,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const phoenixFlame: PlantVariant = {
  id: "phoenix-flame",
  name: "Phoenix Flame",
  description: "Rising flames take the form of a mythical bird spreading its wings",
  rarity: 0.15, // Very rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "ember",
      duration: 12,
      primitives: [
        // Glowing ember core
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 8, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 8, 10),
        // Rising flame wisps
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER + 6, VECTOR_CENTER - 8, VECTOR_CENTER - 4),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER + 6, VECTOR_CENTER + 8, VECTOR_CENTER - 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.55,
      fillColor: "#E8B888", // Peach fill (ember)
      fillOpacity: 0.4,
      scale: 0.75,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "rising",
      duration: 15,
      primitives: [
        // Core flame
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 6, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 6, 9),
        // Rising flames
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER + 4, VECTOR_CENTER - 12, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER + 4, VECTOR_CENTER + 12, VECTOR_CENTER - 10),
        // Wing hints
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER - 4, VECTOR_CENTER - 16, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 4, VECTOR_CENTER + 16, VECTOR_CENTER - 8),
        // Flame tips
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 3),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 10, 3),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 10, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#E89090", // Coral fill (flame)
      fillOpacity: 0.5,
      scale: 0.95,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "blaze",
      duration: 25,
      primitives: [
        // Blazing core
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 4, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 4, 8),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 10, 5, 6),
        // Full phoenix form
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER - 22),
        // Left wing
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER - 8, VECTOR_CENTER - 20, VECTOR_CENTER - 4),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER - 6, VECTOR_CENTER - 24, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER - 12, VECTOR_CENTER - 8, VECTOR_CENTER - 22, VECTOR_CENTER - 16),
        // Right wing
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER - 8, VECTOR_CENTER + 20, VECTOR_CENTER - 4),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 6, VECTOR_CENTER + 24, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER + 12, VECTOR_CENTER - 8, VECTOR_CENTER + 22, VECTOR_CENTER - 16),
        // Flame tips
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 22, 4),
        vectorCircle(VECTOR_CENTER - 20, VECTOR_CENTER - 4, 3),
        vectorCircle(VECTOR_CENTER + 20, VECTOR_CENTER - 4, 3),
        vectorCircle(VECTOR_CENTER - 24, VECTOR_CENTER - 10, 3),
        vectorCircle(VECTOR_CENTER + 24, VECTOR_CENTER - 10, 3),
        vectorCircle(VECTOR_CENTER - 22, VECTOR_CENTER - 16, 3),
        vectorCircle(VECTOR_CENTER + 22, VECTOR_CENTER - 16, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#E89090", // Coral fill (full blaze)
      fillOpacity: 0.65,
      scale: 1.1,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};
