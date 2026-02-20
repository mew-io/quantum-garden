import type { PlantVariant } from "../../../types";
import { vectorCircle, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const pebblePatch: PlantVariant = {
  id: "pebble-patch",
  name: "Pebble Patch",
  description: "Tiny stones scattered on the garden floor",
  rarity: 1.3, // Most common
  requiresObservationToGerminate: false,
  renderMode: "vector",
  tweenBetweenKeyframes: false,
  clusteringBehavior: {
    mode: "cluster",
    clusterRadius: 360,
    clusterBonus: 2.0,
    maxClusterDensity: 8,
    reseedClusterChance: 0.7,
  },
  keyframes: [],
  vectorKeyframes: [
    {
      name: "stones",
      duration: 999,
      primitives: [
        // Scattered pebbles of varying sizes
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 6, 3),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 4, 2.5),
        vectorCircle(VECTOR_CENTER - 3, VECTOR_CENTER + 5, 2),
        vectorCircle(VECTOR_CENTER + 9, VECTOR_CENTER + 3, 2.5),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER + 2, 2),
        vectorCircle(VECTOR_CENTER + 2, VECTOR_CENTER - 8, 2),
        vectorCircle(VECTOR_CENTER - 5, VECTOR_CENTER - 2, 1.5),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER + 7, 2),
        vectorCircle(VECTOR_CENTER - 1, VECTOR_CENTER + 10, 1.5),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 7, 2),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.6,
      fillColor: "#D8D0C8", // Warm stone
      fillOpacity: 0.5,
      scale: 0.35,
    },
  ],
};
