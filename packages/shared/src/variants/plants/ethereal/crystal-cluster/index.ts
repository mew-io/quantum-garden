import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorLine,
  vectorDiamond,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const crystalCluster: PlantVariant = {
  id: "crystal-cluster",
  name: "Crystal Cluster",
  description: "Geometric crystals that grow with angular precision and inner light",
  rarity: 0.25, // Rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "nucleation",
      duration: 18,
      primitives: [
        // Initial crystal seed
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER, 6, 10),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.45,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.35,
      scale: 0.6,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "formation",
      duration: 25,
      primitives: [
        // Central crystal
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER, 8, 14),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        // Secondary crystals forming
        vectorDiamond(VECTOR_CENTER - 10, VECTOR_CENTER + 4, 5, 8),
        vectorDiamond(VECTOR_CENTER + 8, VECTOR_CENTER + 6, 4, 7),
        vectorDiamond(VECTOR_CENTER - 4, VECTOR_CENTER - 10, 4, 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.45,
      scale: 0.75,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "growth",
      duration: 50,
      primitives: [
        // Main crystal cluster
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER - 4, 10, 18),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 4, 6),
        // Surrounding crystals
        vectorDiamond(VECTOR_CENTER - 14, VECTOR_CENTER + 6, 6, 12),
        vectorDiamond(VECTOR_CENTER + 12, VECTOR_CENTER + 8, 5, 10),
        vectorDiamond(VECTOR_CENTER - 6, VECTOR_CENTER - 16, 5, 10),
        vectorDiamond(VECTOR_CENTER + 8, VECTOR_CENTER - 14, 4, 8),
        vectorDiamond(VECTOR_CENTER - 10, VECTOR_CENTER - 8, 4, 8),
        vectorDiamond(VECTOR_CENTER + 16, VECTOR_CENTER - 2, 4, 8),
        // Inner glow lines
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER - 14, VECTOR_CENTER + 6, VECTOR_CENTER - 14, VECTOR_CENTER - 2),
        vectorLine(VECTOR_CENTER + 12, VECTOR_CENTER + 8, VECTOR_CENTER + 12, VECTOR_CENTER + 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.8,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.55,
      scale: 0.9,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};
