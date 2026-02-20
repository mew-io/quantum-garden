import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorLine,
  vectorStar,
  vectorDiamond,
  vectorRadialLines,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const phoenixFlameVector: PlantVariant = {
  id: "phoenix-flame-vector",
  name: "Phoenix Flame (Vector)",
  description: "Rising flames rendered with smooth vector lines",
  rarity: 0.05,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true,
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "ember",
      duration: 12,
      primitives: [
        // Core ember
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 8, 6),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER, 8, 14),
        // Small flame tips
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER + 8, 4, 6, 12, -90),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.55,
      fillColor: "#E8B888", // Peach fill (ember)
      fillOpacity: 0.4,
      scale: 0.75,
    },
    {
      name: "rising",
      duration: 15,
      primitives: [
        // Rising core
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER - 4, 12, 22),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 6, 8),
        // Wing-like extensions
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER - 16, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 4, VECTOR_CENTER + 16, VECTOR_CENTER - 12),
        // Flame tips
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER + 6, 6, 8, 16, -90),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#E89090", // Coral fill
      fillOpacity: 0.5,
      scale: 0.95,
    },
    {
      name: "blaze",
      duration: 25,
      primitives: [
        // Full flame body
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER - 8, 16, 28),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 4, 10),
        // Spread wings
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER - 4, VECTOR_CENTER - 22, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 4, VECTOR_CENTER + 22, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER, VECTOR_CENTER - 18, VECTOR_CENTER - 6),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER, VECTOR_CENTER + 18, VECTOR_CENTER - 6),
        // Crown of flames
        ...vectorRadialLines(VECTOR_CENTER, VECTOR_CENTER + 4, 8, 10, 20, -90),
        // Inner glow
        vectorStar(VECTOR_CENTER, VECTOR_CENTER - 6, 6, 8, 4, -90),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#E89090", // Coral fill
      fillOpacity: 0.65,
      scale: 1.1,
    },
  ],
};
