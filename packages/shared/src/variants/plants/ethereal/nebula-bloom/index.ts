import type { PlantVariant } from "../../../types";
import { vectorCircle, vectorStar, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const nebulaBloom: PlantVariant = {
  id: "nebula-bloom",
  name: "Nebula Bloom",
  description: "Cosmic clouds coalesce into a radiant bloom of stellar light",
  rarity: 0.15, // Very rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "drift",
      duration: 20,
      primitives: [
        // Diffuse cloud clusters
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 6, 8),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 4, 7),
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER + 8, 6),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER + 6, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.4,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.3,
      scale: 0.8,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "coalescence",
      duration: 25,
      primitives: [
        // Coalescing clouds
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 14),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 20),
        // Forming petals
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 6),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER + 8, 5),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER + 8, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 16, 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.4,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "radiance",
      duration: 60,
      primitives: [
        // Radiant stellar center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 12),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 16, 8, 8),
        // Full bloom petals
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 20, 8),
        vectorCircle(VECTOR_CENTER - 17, VECTOR_CENTER - 10, 7),
        vectorCircle(VECTOR_CENTER + 17, VECTOR_CENTER - 10, 7),
        vectorCircle(VECTOR_CENTER - 17, VECTOR_CENTER + 10, 7),
        vectorCircle(VECTOR_CENTER + 17, VECTOR_CENTER + 10, 7),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 20, 8),
        // Outer glow
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 26),
        // Stellar dust
        vectorCircle(VECTOR_CENTER - 22, VECTOR_CENTER - 18, 3),
        vectorCircle(VECTOR_CENTER + 22, VECTOR_CENTER - 18, 3),
        vectorCircle(VECTOR_CENTER - 24, VECTOR_CENTER + 14, 2),
        vectorCircle(VECTOR_CENTER + 24, VECTOR_CENTER + 14, 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.2,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
  ],
};
