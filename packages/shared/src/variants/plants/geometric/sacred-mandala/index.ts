import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorDiamond,
  vectorConcentricCircles,
  vectorRadialLines,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const sacredMandala: PlantVariant = {
  id: "sacred-mandala",
  name: "Sacred Mandala",
  description: "Precise geometric circles and radiating lines forming a contemplative pattern",
  rarity: 0.1,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "seed",
      duration: 10,
      primitives: [vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8)],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.4,
      scale: 0.7,
    },
    {
      name: "rings",
      duration: 15,
      primitives: [...vectorConcentricCircles(VECTOR_CENTER, VECTOR_CENTER, [6, 12, 18])],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.8,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.5,
      scale: 0.85,
    },
    {
      name: "radiate",
      duration: 20,
      primitives: [
        ...vectorConcentricCircles(VECTOR_CENTER, VECTOR_CENTER, [6, 12, 18, 24]),
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 8, 6, 26),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.9,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.6,
      scale: 0.95,
    },
    {
      name: "complete",
      duration: 60,
      primitives: [
        ...vectorConcentricCircles(VECTOR_CENTER, VECTOR_CENTER, [5, 10, 15, 20, 26]),
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER, 8, 5, 28),
        // Diamonds at cardinal points
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER - 18, 5, 7),
        vectorDiamond(VECTOR_CENTER + 18, VECTOR_CENTER, 5, 7),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER + 18, 5, 7),
        vectorDiamond(VECTOR_CENTER - 18, VECTOR_CENTER, 5, 7),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 1.0,
      fillColor: "#C898E8", // Lavender fill for diamonds
      fillOpacity: 0.7,
      scale: 1.0,
    },
  ],
};
