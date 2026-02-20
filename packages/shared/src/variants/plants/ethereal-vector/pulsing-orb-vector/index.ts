import type { PlantVariant } from "../../../types";
import { vectorCircle, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const pulsingOrbVector: PlantVariant = {
  id: "pulsing-orb-vector",
  name: "Pulsing Orb (Vector)",
  description: "An ethereal orb rendered with smooth vector circles",
  rarity: 0.08,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "dim",
      duration: 8,
      primitives: [
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 12),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.35,
      scale: 0.9,
    },
    {
      name: "bright",
      duration: 5,
      primitives: [
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 16),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 11),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.6,
      scale: 1.1,
    },
  ],
};
