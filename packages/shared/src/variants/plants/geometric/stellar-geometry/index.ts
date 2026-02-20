import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorStar,
  vectorRadialLines,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const stellarGeometry: PlantVariant = {
  id: "stellar-geometry",
  name: "Stellar Geometry",
  description: "Nested star outlines radiating with precise mathematical beauty",
  rarity: 0.1,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "point",
      duration: 8,
      primitives: [
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 3),
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 6, 4, 7),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#E8B888", // Peach fill
      fillOpacity: 0.35,
      scale: 0.6,
    },
    {
      name: "star",
      duration: 12,
      primitives: [
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 6, 16, 8, -90),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#E8B888", // Peach fill
      fillOpacity: 0.45,
      scale: 0.8,
    },
    {
      name: "rays",
      duration: 18,
      primitives: [
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 6, 18, 9, -90),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 6, 18, 26, -90),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.75,
      fillColor: "#E8B888", // Peach fill
      fillOpacity: 0.5,
      scale: 0.9,
    },
    {
      name: "nested",
      duration: 60,
      primitives: [
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 6, 24, 12, -90),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 6, 16, 8, -90),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 6, 10, 5, -90),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 3),
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 12, 24, 28, -90),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#E8B888", // Peach fill
      fillOpacity: 0.6,
      scale: 1.0,
    },
  ],
};
