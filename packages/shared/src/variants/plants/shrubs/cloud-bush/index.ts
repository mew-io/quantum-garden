import type { PlantVariant } from "../../../types";
import { vectorCircle, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const cloudBush: PlantVariant = {
  id: "cloud-bush",
  name: "Cloud Bush",
  description: "A soft, rounded shrub that breathes gently and grows delicate berries",
  rarity: 0.4, // Uncommon
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true, // Breathing animation loops
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "base",
      duration: 25,
      primitives: [
        // Base puffy circles (cloud shape)
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 4, 10),
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER + 2, 7),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER + 2, 7),
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER - 4, 6),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER - 4, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 5),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.6,
      fillColor: "#A8D8A8", // Sage green
      fillOpacity: 0.5,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "full",
      duration: 20,
      primitives: [
        // Fuller, expanded cloud shape
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 6, 12),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER + 3, 9),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER + 3, 9),
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 5, 8),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 5, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 7),
        // Extra fluff
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER, 5),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER, 5),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.7,
      fillColor: "#88D0D0", // Mint
      fillOpacity: 0.6,
      scale: 1.2,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "breathe-in",
      duration: 6,
      primitives: [
        // Slightly contracted
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 5, 11),
        vectorCircle(VECTOR_CENTER - 9, VECTOR_CENTER + 2, 8),
        vectorCircle(VECTOR_CENTER + 9, VECTOR_CENTER + 2, 8),
        vectorCircle(VECTOR_CENTER - 5, VECTOR_CENTER - 4, 7),
        vectorCircle(VECTOR_CENTER + 5, VECTOR_CENTER - 4, 7),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 7, 6),
        vectorCircle(VECTOR_CENTER - 13, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER + 13, VECTOR_CENTER, 4),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.75,
      fillColor: "#88D0D0", // Mint
      fillOpacity: 0.6,
      scale: 1.15,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "breathe-out",
      duration: 6,
      primitives: [
        // Expanded breathing
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 7, 13),
        vectorCircle(VECTOR_CENTER - 11, VECTOR_CENTER + 4, 10),
        vectorCircle(VECTOR_CENTER + 11, VECTOR_CENTER + 4, 10),
        vectorCircle(VECTOR_CENTER - 7, VECTOR_CENTER - 5, 9),
        vectorCircle(VECTOR_CENTER + 7, VECTOR_CENTER - 5, 9),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 9, 8),
        vectorCircle(VECTOR_CENTER - 15, VECTOR_CENTER + 1, 6),
        vectorCircle(VECTOR_CENTER + 15, VECTOR_CENTER + 1, 6),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.8,
      fillColor: "#90B8E8", // Sky blue
      fillOpacity: 0.5,
      scale: 1.25,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "berried",
      duration: 40,
      primitives: [
        // Full bush with berries
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 8, 14),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 5, 11),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER + 5, 11),
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 6, 10),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 6, 10),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 10, 9),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER + 2, 7),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER + 2, 7),
        // Berry clusters (small circles)
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER + 10, 2),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER + 12, 2),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER + 8, 2),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER + 9, 2),
        vectorCircle(VECTOR_CENTER - 2, VECTOR_CENTER + 6, 1.5),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER + 7, 1.5),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.9,
      fillColor: "#E89090", // Coral for berries
      fillOpacity: 0.6,
      scale: 1.3,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};
