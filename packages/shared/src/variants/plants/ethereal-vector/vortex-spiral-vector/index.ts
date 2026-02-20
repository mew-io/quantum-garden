import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorStar,
  vectorSpiral,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const vortexSpiralVector: PlantVariant = {
  id: "vortex-spiral-vector",
  name: "Vortex Spiral (Vector)",
  description: "Swirling vortex patterns with hypnotic true spirals",
  rarity: 0.07,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "calm",
      duration: 12,
      primitives: [
        // Calm center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        // Gentle single spiral arm emerging
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 6, 16, 1, 0),
        // Secondary spiral offset
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 6, 14, 0.8, 180),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.35,
      scale: 0.85,
    },
    {
      name: "spin",
      duration: 8,
      primitives: [
        // Spinning center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 3),
        // Two interleaved spirals expanding
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 4, 20, 1.5, 0),
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 4, 18, 1.5, 180),
        // Third spiral for depth
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 5, 16, 1.2, 90),
        // Spiral tips as energy nodes
        vectorCircle(VECTOR_CENTER + 18, VECTOR_CENTER - 8, 3),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER + 8, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.75,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.5,
      scale: 1.0,
    },
    {
      name: "whirl",
      duration: 6,
      primitives: [
        // Intense core
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 2),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 4, 5, 2, 0),
        // Triple spiral vortex at full intensity
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 3, 24, 2, 0),
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 3, 22, 2, 120),
        vectorSpiral(VECTOR_CENTER, VECTOR_CENTER, 3, 20, 2, 240),
        // Outer energy ring
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 26),
        // Whirling energy nodes
        vectorCircle(VECTOR_CENTER + 22, VECTOR_CENTER - 10, 3),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 20, 3),
        vectorCircle(VECTOR_CENTER - 18, VECTOR_CENTER - 14, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.9,
      fillColor: "#C898E8", // Lavender fill for whirl intensity
      fillOpacity: 0.6,
      scale: 1.05,
    },
  ],
};
