import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorArc,
  vectorBezier,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const dreamVine: PlantVariant = {
  id: "dream-vine",
  name: "Dream Vine",
  description: "Ethereal vines flowing through space like liquid dreams",
  rarity: 0.22, // Rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true, // Continuous flowing
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "tendril",
      duration: 20,
      primitives: [
        // Initial tendril curl using bezier for organic flow
        vectorBezier(
          VECTOR_CENTER,
          VECTOR_CENTER + 14, // start
          VECTOR_CENTER - 4,
          VECTOR_CENTER + 8, // control 1
          VECTOR_CENTER - 8,
          VECTOR_CENTER, // control 2
          VECTOR_CENTER - 6,
          VECTOR_CENTER - 6 // end
        ),
        // Curling arc at the tip
        vectorArc(VECTOR_CENTER - 3, VECTOR_CENTER - 8, 6, 90, 270),
        // Curl tips
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 10, 3),
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 6, 2),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.4,
      scale: 0.8,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "weaving",
      duration: 25,
      primitives: [
        // Weaving vine path with flowing beziers
        vectorBezier(
          VECTOR_CENTER,
          VECTOR_CENTER + 16, // start
          VECTOR_CENTER - 6,
          VECTOR_CENTER + 12, // control 1
          VECTOR_CENTER - 2,
          VECTOR_CENTER + 4, // control 2
          VECTOR_CENTER - 4,
          VECTOR_CENTER + 8 // end
        ),
        vectorBezier(
          VECTOR_CENTER - 4,
          VECTOR_CENTER + 8, // start
          VECTOR_CENTER + 2,
          VECTOR_CENTER + 4, // control 1
          VECTOR_CENTER + 8,
          VECTOR_CENTER + 2, // control 2
          VECTOR_CENTER + 6,
          VECTOR_CENTER // end
        ),
        vectorBezier(
          VECTOR_CENTER + 6,
          VECTOR_CENTER, // start
          VECTOR_CENTER,
          VECTOR_CENTER - 4, // control 1
          VECTOR_CENTER - 6,
          VECTOR_CENTER - 8, // control 2
          VECTOR_CENTER - 8,
          VECTOR_CENTER - 10 // end
        ),
        // Curling arc tendril
        vectorArc(VECTOR_CENTER + 2, VECTOR_CENTER - 14, 6, 0, 180),
        // Leaf nodes
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER + 8, 3),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 10, 3),
        vectorCircle(VECTOR_CENTER + 4, VECTOR_CENTER - 16, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.65,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.5,
      scale: 1.0,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "cascade",
      duration: 35,
      primitives: [
        // Full cascading vine with flowing bezier curves
        vectorBezier(
          VECTOR_CENTER,
          VECTOR_CENTER + 18, // start
          VECTOR_CENTER - 8,
          VECTOR_CENTER + 14, // control 1
          VECTOR_CENTER - 4,
          VECTOR_CENTER + 8, // control 2
          VECTOR_CENTER - 6,
          VECTOR_CENTER + 10 // end
        ),
        vectorBezier(
          VECTOR_CENTER - 6,
          VECTOR_CENTER + 10, // start
          VECTOR_CENTER + 4,
          VECTOR_CENTER + 6, // control 1
          VECTOR_CENTER + 10,
          VECTOR_CENTER + 4, // control 2
          VECTOR_CENTER + 8,
          VECTOR_CENTER + 2 // end
        ),
        vectorBezier(
          VECTOR_CENTER + 8,
          VECTOR_CENTER + 2, // start
          VECTOR_CENTER,
          VECTOR_CENTER - 2, // control 1
          VECTOR_CENTER - 8,
          VECTOR_CENTER - 6, // control 2
          VECTOR_CENTER - 10,
          VECTOR_CENTER - 8 // end
        ),
        vectorBezier(
          VECTOR_CENTER - 10,
          VECTOR_CENTER - 8, // start
          VECTOR_CENTER,
          VECTOR_CENTER - 12, // control 1
          VECTOR_CENTER + 8,
          VECTOR_CENTER - 14, // control 2
          VECTOR_CENTER + 6,
          VECTOR_CENTER - 16 // end
        ),
        // Curling arcs at branch tips
        vectorArc(VECTOR_CENTER - 6, VECTOR_CENTER - 20, 5, 45, 225),
        vectorArc(VECTOR_CENTER + 14, VECTOR_CENTER + 4, 4, 270, 90),
        // Secondary bezier tendrils
        vectorBezier(
          VECTOR_CENTER + 8,
          VECTOR_CENTER + 2, // start
          VECTOR_CENTER + 12,
          VECTOR_CENTER + 4, // control 1
          VECTOR_CENTER + 14,
          VECTOR_CENTER + 6, // control 2
          VECTOR_CENTER + 16,
          VECTOR_CENTER + 6 // end
        ),
        // Dream flower nodes
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER + 10, 4),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER + 2, 5),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 8, 4),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 16, 5),
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER - 22, 4),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER + 6, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.15,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};
