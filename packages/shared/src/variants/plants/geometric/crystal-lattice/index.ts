import type { PlantVariant } from "../../../types";
import { vectorLine, vectorDiamond, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const crystalLattice: PlantVariant = {
  id: "crystal-lattice",
  name: "Crystal Lattice",
  description: "Interlocking diamond grid evoking crystalline molecular structures",
  rarity: 0.1,
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "diamond",
      duration: 10,
      primitives: [vectorDiamond(VECTOR_CENTER, VECTOR_CENTER, 14, 18)],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.35,
      scale: 0.7,
    },
    {
      name: "grid",
      duration: 15,
      primitives: [
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER, 12, 16),
        vectorDiamond(VECTOR_CENTER - 10, VECTOR_CENTER, 8, 12),
        vectorDiamond(VECTOR_CENTER + 10, VECTOR_CENTER, 8, 12),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER - 10, 8, 12),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER + 10, 8, 12),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.45,
      scale: 0.85,
    },
    {
      name: "expand",
      duration: 20,
      primitives: [
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER, 10, 14),
        vectorDiamond(VECTOR_CENTER - 14, VECTOR_CENTER, 10, 14),
        vectorDiamond(VECTOR_CENTER + 14, VECTOR_CENTER, 10, 14),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER - 14, 10, 14),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER + 14, 10, 14),
        // Connecting lines
        vectorLine(VECTOR_CENTER - 5, VECTOR_CENTER, VECTOR_CENTER - 9, VECTOR_CENTER),
        vectorLine(VECTOR_CENTER + 5, VECTOR_CENTER, VECTOR_CENTER + 9, VECTOR_CENTER),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 7, VECTOR_CENTER, VECTOR_CENTER - 7),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 7, VECTOR_CENTER, VECTOR_CENTER + 7),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.75,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.5,
      scale: 0.95,
    },
    {
      name: "full",
      duration: 60,
      primitives: [
        // Core structure
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER, 8, 12),
        vectorDiamond(VECTOR_CENTER - 12, VECTOR_CENTER, 8, 12),
        vectorDiamond(VECTOR_CENTER + 12, VECTOR_CENTER, 8, 12),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER - 12, 8, 12),
        vectorDiamond(VECTOR_CENTER, VECTOR_CENTER + 12, 8, 12),
        // Diagonal diamonds
        vectorDiamond(VECTOR_CENTER - 9, VECTOR_CENTER - 9, 6, 8),
        vectorDiamond(VECTOR_CENTER + 9, VECTOR_CENTER - 9, 6, 8),
        vectorDiamond(VECTOR_CENTER - 9, VECTOR_CENTER + 9, 6, 8),
        vectorDiamond(VECTOR_CENTER + 9, VECTOR_CENTER + 9, 6, 8),
        // Connecting lines
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER),
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER, VECTOR_CENTER + 8, VECTOR_CENTER),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 6, VECTOR_CENTER, VECTOR_CENTER - 6),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 6, VECTOR_CENTER, VECTOR_CENTER + 6),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.6,
      scale: 1.0,
    },
  ],
};
