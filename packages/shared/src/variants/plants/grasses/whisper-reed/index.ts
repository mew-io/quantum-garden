import type { PlantVariant } from "../../../types";
import { vectorCircle, vectorLine, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const whisperReed: PlantVariant = {
  id: "whisper-reed",
  name: "Whisper Reed",
  description: "Tall thin reeds that sway with an invisible wind",
  rarity: 0.9, // Common
  requiresObservationToGerminate: false,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "lean-left",
      duration: 5,
      primitives: [
        // Tall reed stems leaning left
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER + 16, VECTOR_CENTER - 10, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 16, VECTOR_CENTER - 4, VECTOR_CENTER - 20),
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER + 16, VECTOR_CENTER + 2, VECTOR_CENTER - 18),
        // Reed tips (small circles)
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 19, 1.5),
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER - 21, 1.5),
        vectorCircle(VECTOR_CENTER + 2, VECTOR_CENTER - 19, 1.5),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.7,
      fillColor: "#C8E0C0", // Light sage
      fillOpacity: 0.5,
      scale: 0.75,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "lean-right",
      duration: 5,
      primitives: [
        // Tall reed stems leaning right
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER + 16, VECTOR_CENTER - 2, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 16, VECTOR_CENTER + 4, VECTOR_CENTER - 20),
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER + 16, VECTOR_CENTER + 10, VECTOR_CENTER - 18),
        // Reed tips (small circles)
        vectorCircle(VECTOR_CENTER - 2, VECTOR_CENTER - 19, 1.5),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER - 21, 1.5),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 19, 1.5),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.7,
      fillColor: "#C8E0C0", // Light sage
      fillOpacity: 0.5,
      scale: 0.75,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};
