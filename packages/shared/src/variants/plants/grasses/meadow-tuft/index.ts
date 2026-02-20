import type { PlantVariant } from "../../../types";
import { vectorCircle, vectorLine, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const meadowTuft: PlantVariant = {
  id: "meadow-tuft",
  name: "Meadow Tuft",
  description: "A small cluster of grass that sways gently in an invisible breeze",
  rarity: 1.1, // Very common
  requiresObservationToGerminate: false,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 450,
    clusterBonus: 1.5,
    maxClusterDensity: 4,
    reseedClusterChance: 0.5,
  },
  keyframes: [],
  vectorKeyframes: [
    {
      name: "sway-left",
      duration: 4,
      primitives: [
        // Grass blades leaning left
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER + 14, VECTOR_CENTER - 10, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER - 2, VECTOR_CENTER + 14, VECTOR_CENTER - 5, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER + 2, VECTOR_CENTER + 14, VECTOR_CENTER, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER + 14, VECTOR_CENTER + 4, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER + 14, VECTOR_CENTER + 8, VECTOR_CENTER - 10),
        // Base cluster
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 14, 4),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.8,
      fillColor: "#A8D8A8", // Sage green (for base cluster)
      fillOpacity: 0.6,
      scale: 0.6,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "sway-right",
      duration: 4,
      primitives: [
        // Grass blades leaning right
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER + 14, VECTOR_CENTER - 4, VECTOR_CENTER - 10),
        vectorLine(VECTOR_CENTER - 2, VECTOR_CENTER + 14, VECTOR_CENTER + 1, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER + 2, VECTOR_CENTER + 14, VECTOR_CENTER + 4, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER + 14, VECTOR_CENTER + 9, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER + 14, VECTOR_CENTER + 14, VECTOR_CENTER - 12),
        // Base cluster
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 14, 4),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.8,
      fillColor: "#A8D8A8", // Sage green
      fillOpacity: 0.6,
      scale: 0.6,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};
