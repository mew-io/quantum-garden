import type { PlantVariant } from "../../../types";
import { vectorCircle, VECTOR_CENTER } from "../../../../patterns/vector-builder";
import { vectorArcSegments } from "../../utils/vector-arc-segments";

export const sumiSpirit: PlantVariant = {
  id: "sumi-spirit",
  name: "Sumi Spirit",
  description: "An ink brush stroke enso that embodies the beauty of imperfection",
  rarity: 0.15, // Rare - contemplative piece
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "touch",
      duration: 8,
      primitives: [
        // Initial brush touch - small arc starting the stroke
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 16, 180, 240, 6),
        // Small dot where brush touches
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER + 8, 2),
      ],
      strokeColor: "#1E3A5F", // Deep indigo
      strokeOpacity: 0.6,
      fillColor: "#90B8E8", // Sky fill - subtle ink wash
      fillOpacity: 0.15,
      scale: 0.8,
      transitionHint: { strategy: "progressive", easing: "brushStroke" },
    },
    {
      name: "draw",
      duration: 12,
      primitives: [
        // Brush extending - larger arc
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 18, 150, 300, 12),
        // Inner stroke following the arc
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 14, 160, 280, 8),
      ],
      strokeColor: "#3A5A8F", // Mid indigo-blue
      strokeOpacity: 0.75,
      fillColor: "#90B8E8", // Sky fill - ink wash
      fillOpacity: 0.2,
      scale: 0.9,
      transitionHint: { strategy: "progressive", easing: "brushStroke" },
    },
    {
      name: "flow",
      duration: 18,
      primitives: [
        // Flowing ink - most of the enso
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 20, 120, 350, 18),
        // Inner flow
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 16, 130, 340, 14),
        // Brush thickness variation
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 12, 150, 320, 10),
      ],
      strokeColor: "#4A6FA5", // Spirit blue
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill - ethereal wash
      fillOpacity: 0.2,
      scale: 0.95,
      transitionHint: { strategy: "progressive", easing: "brushStroke" },
    },
    {
      name: "settle",
      duration: 25,
      primitives: [
        // Nearly complete enso with characteristic gap at top
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 22, 100, 380, 22),
        // Inner rings showing brush texture
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 18, 110, 370, 18),
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 14, 120, 360, 14),
        // Small accent at brush end
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER - 21, 2),
      ],
      strokeColor: "#5A8FC5", // Lighter spirit blue
      strokeOpacity: 0.95,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.25,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "brushStroke" },
    },
    {
      name: "rest",
      duration: 60,
      primitives: [
        // Final enso form - beautiful imperfection with gap at ~70° (top-right)
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 24, 80, 400, 24),
        // Inner strokes showing brush character
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 20, 90, 390, 20),
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 16, 100, 380, 16),
        // Subtle inner detail
        ...vectorArcSegments(VECTOR_CENTER, VECTOR_CENTER, 11, 120, 360, 10),
        // Brush lift point
        vectorCircle(VECTOR_CENTER + 20, VECTOR_CENTER - 13, 1.5),
      ],
      strokeColor: "#7A9FC5", // Pale spirit blue
      strokeOpacity: 1.0,
      fillColor: "#C898E8", // Lavender fill - settled ink wash
      fillOpacity: 0.3,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "brushStroke" },
    },
  ],
};
