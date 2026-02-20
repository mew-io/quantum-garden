import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorPolygon,
  vectorRadialLines,
  vectorFlowerOfLife,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const metatronsCube: PlantVariant = {
  id: "metatrons-cube",
  name: "Metatron's Cube",
  description: "Sacred geometry of overlapping circles forming the Flower of Life",
  rarity: 0.08,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "circle",
      duration: 10,
      primitives: [vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8)],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.35,
      scale: 0.7,
    },
    {
      name: "six",
      duration: 15,
      primitives: [...vectorFlowerOfLife(VECTOR_CENTER, VECTOR_CENTER, 8, 1)],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.45,
      scale: 0.85,
    },
    {
      name: "connect",
      duration: 20,
      primitives: [
        ...vectorFlowerOfLife(VECTOR_CENTER, VECTOR_CENTER, 8, 1),
        // Connect center to outer circles
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 6, 0, 8, -90),
        // Hexagon outline
        vectorPolygon(VECTOR_CENTER, VECTOR_CENTER, 6, 8, -90),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.75,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.5,
      scale: 0.92,
    },
    {
      name: "complete",
      duration: 60,
      primitives: [
        ...vectorFlowerOfLife(VECTOR_CENTER, VECTOR_CENTER, 7, 2),
        // Inner hexagon
        vectorPolygon(VECTOR_CENTER, VECTOR_CENTER, 6, 7, -90),
        // Outer hexagon
        vectorPolygon(VECTOR_CENTER, VECTOR_CENTER, 6, 14, -90),
        // Radial connections
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 6, 0, 14, -90),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.0,
    },
  ],
};
