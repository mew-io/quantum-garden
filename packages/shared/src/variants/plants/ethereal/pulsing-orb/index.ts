import type { PlantVariant } from "../../../types";
import { vectorCircle, vectorStar, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const pulsingOrb: PlantVariant = {
  id: "pulsing-orb",
  name: "Pulsing Orb",
  description: "An ethereal orb that gently pulses with morning light",
  rarity: 0.3, // Rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true, // Loops forever
  tweenBetweenKeyframes: true, // Smooth transitions
  keyframes: [],
  vectorKeyframes: [
    {
      name: "dim",
      duration: 8,
      primitives: [
        // Dim orb - concentric circles
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 14),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 18),
        // 4-point star
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 20, 10, 4),
        // Corner sparkle dots
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 16, 2),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER - 16, 2),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER + 16, 2),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER + 16, 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.3,
      scale: 0.9,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "bright",
      duration: 5,
      primitives: [
        // Bright orb - dense center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 16),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 22),
        // Bright star burst
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 24, 12, 8),
        // Energy rings
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 26),
        // Sparkle points
        vectorCircle(VECTOR_CENTER - 20, VECTOR_CENTER - 20, 2.5),
        vectorCircle(VECTOR_CENTER + 20, VECTOR_CENTER - 20, 2.5),
        vectorCircle(VECTOR_CENTER - 20, VECTOR_CENTER + 20, 2.5),
        vectorCircle(VECTOR_CENTER + 20, VECTOR_CENTER + 20, 2.5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 28, 2),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 28, 2),
        vectorCircle(VECTOR_CENTER - 28, VECTOR_CENTER, 2),
        vectorCircle(VECTOR_CENTER + 28, VECTOR_CENTER, 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.8,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.6,
      scale: 1.1,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};
