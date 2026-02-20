import type { PlantVariant } from "../../../types";
import { vectorCircle, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const softMoss: PlantVariant = {
  id: "soft-moss",
  name: "Soft Moss",
  description: "A gentle ground cover that spreads slowly across the garden floor",
  rarity: 1.2, // Very common
  requiresObservationToGerminate: false, // Grows without observation
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 540,
    clusterBonus: 2.5,
    maxClusterDensity: 6,
    reseedClusterChance: 0.8,
  },
  keyframes: [],
  vectorKeyframes: [
    {
      name: "emerging",
      duration: 30,
      primitives: [
        // Central soft cluster
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        // Scattered spores emerging
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 4, 2),
        vectorCircle(VECTOR_CENTER + 5, VECTOR_CENTER - 3, 2),
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER + 5, 2),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER + 4, 1.5),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.6,
      fillColor: "#A8D8A8", // Sage green
      fillOpacity: 0.4,
      scale: 0.3,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "settled",
      duration: 120,
      primitives: [
        // Fuller moss cluster
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 14),
        // Scattered outer circles
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 6, 3),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 5, 3),
        vectorCircle(VECTOR_CENTER - 7, VECTOR_CENTER + 8, 3),
        vectorCircle(VECTOR_CENTER + 9, VECTOR_CENTER + 6, 2.5),
        vectorCircle(VECTOR_CENTER - 3, VECTOR_CENTER - 10, 2),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER + 10, 2),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 2, 2),
        vectorCircle(VECTOR_CENTER + 11, VECTOR_CENTER - 1, 2),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.7,
      fillColor: "#88D0D0", // Mint
      fillOpacity: 0.5,
      scale: 0.4,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};
