import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorLine,
  vectorStar,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const dewdropDaisy: PlantVariant = {
  id: "dewdrop-daisy",
  name: "Dewdrop Daisy",
  description: "A cheerful daisy that sparkles like morning dew in the light",
  rarity: 0.7, // Moderate
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "bud",
      duration: 12,
      primitives: [
        // Small bud center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 6),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 18),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.5,
      fillColor: "#E8B888", // Peach bud
      fillOpacity: 0.4,
      scale: 0.6,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "unfurl",
      duration: 15,
      primitives: [
        // Growing center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 8),
        // Initial petal hints (5 directions)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER, VECTOR_CENTER - 20),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER - 12, VECTOR_CENTER - 10, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 12, VECTOR_CENTER + 10, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER - 6, VECTOR_CENTER - 14, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 6, VECTOR_CENTER + 14, VECTOR_CENTER - 8),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 18),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.7,
      fillColor: "#E8B888", // Warming peach
      fillOpacity: 0.5,
      scale: 0.8,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "bloom",
      duration: 20,
      primitives: [
        // Golden center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 6),
        // Layer 1 petals (8 directions)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER, VECTOR_CENTER - 22),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER - 12, VECTOR_CENTER - 14, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 12, VECTOR_CENTER + 14, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 6, VECTOR_CENTER - 18, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER - 6, VECTOR_CENTER + 18, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER + 2),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER, VECTOR_CENTER + 16, VECTOR_CENTER + 2),
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER - 4, VECTOR_CENTER - 8, VECTOR_CENTER - 2),
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER - 4, VECTOR_CENTER + 8, VECTOR_CENTER - 2),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER + 20),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.9,
      fillColor: "#E8B888", // Bright peach center
      fillOpacity: 0.6,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "sparkle",
      duration: 8,
      primitives: [
        // Bright center star
        vectorStar(VECTOR_CENTER, VECTOR_CENTER - 8, 8, 4, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 3),
        // Sparkle rays (12 directions for radiance)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER, VECTOR_CENTER - 24),
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 12, VECTOR_CENTER - 18, VECTOR_CENTER - 20),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER - 12, VECTOR_CENTER + 18, VECTOR_CENTER - 20),
        vectorLine(VECTOR_CENTER - 12, VECTOR_CENTER - 6, VECTOR_CENTER - 22, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER + 12, VECTOR_CENTER - 6, VECTOR_CENTER + 22, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER + 2, VECTOR_CENTER - 20, VECTOR_CENTER + 4),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER + 2, VECTOR_CENTER + 20, VECTOR_CENTER + 4),
        // Dewdrop sparkle points
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 14, 1.5),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER - 14, 1.5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 26, 1.5),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 4, VECTOR_CENTER, VECTOR_CENTER + 20),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 1.0,
      fillColor: "#90B8E8", // Sky blue sparkle
      fillOpacity: 0.6,
      scale: 1.05,
      transitionHint: { strategy: "fade", easing: "easeInOut" },
    },
    {
      name: "bloom-2",
      duration: 25,
      primitives: [
        // Golden center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 6),
        // Layer 1 petals (8 directions)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 14, VECTOR_CENTER, VECTOR_CENTER - 22),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER - 12, VECTOR_CENTER - 14, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 12, VECTOR_CENTER + 14, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER - 10, VECTOR_CENTER - 6, VECTOR_CENTER - 18, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER + 10, VECTOR_CENTER - 6, VECTOR_CENTER + 18, VECTOR_CENTER - 8),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER, VECTOR_CENTER - 16, VECTOR_CENTER + 2),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER, VECTOR_CENTER + 16, VECTOR_CENTER + 2),
        vectorLine(VECTOR_CENTER - 4, VECTOR_CENTER - 4, VECTOR_CENTER - 8, VECTOR_CENTER - 2),
        vectorLine(VECTOR_CENTER + 4, VECTOR_CENTER - 4, VECTOR_CENTER + 8, VECTOR_CENTER - 2),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER + 20),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.9,
      fillColor: "#E8B888", // Back to peach
      fillOpacity: 0.6,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "fade",
      duration: 20,
      primitives: [
        // Fading center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 3),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 8, 5),
        // Drooping petals
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER - 2, VECTOR_CENTER - 16),
        vectorLine(VECTOR_CENTER - 6, VECTOR_CENTER - 8, VECTOR_CENTER - 10, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER + 6, VECTOR_CENTER - 8, VECTOR_CENTER + 10, VECTOR_CENTER - 12),
        vectorLine(VECTOR_CENTER - 8, VECTOR_CENTER - 4, VECTOR_CENTER - 12, VECTOR_CENTER - 4),
        vectorLine(VECTOR_CENTER + 8, VECTOR_CENTER - 4, VECTOR_CENTER + 12, VECTOR_CENTER - 4),
        // Stem
        vectorLine(VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER, VECTOR_CENTER + 16),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 0.5,
      fillColor: "#D8D0C8", // Faded neutral
      fillOpacity: 0.4,
      scale: 0.85,
      transitionHint: { strategy: "fade", easing: "easeInOut" },
    },
  ],
};
