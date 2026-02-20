import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorStar,
  vectorRadialLines,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const kaleidoscopeStarVector: PlantVariant = {
  id: "kaleidoscope-star-vector",
  name: "Kaleidoscope Star (Vector)",
  description: "Mesmerizing rotating star patterns with smooth vector lines",
  rarity: 0.06,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "rotate1",
      duration: 10,
      primitives: [
        // Central star
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 8, 20, 10, 0),
        // Inner star rotated
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 8, 12, 6, 22.5),
        // Core circle
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        // Outer ring
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 24),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.5,
      scale: 1.1,
    },
    {
      name: "rotate2",
      duration: 10,
      primitives: [
        // Central star rotated
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 8, 22, 11, 22.5),
        // Inner star
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 8, 14, 7, 0),
        // Core circle
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        // Outer ring
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 26),
        // Radial accents
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 8, 22, 26, 0),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.9,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.15,
    },
  ],
};
