import type { PlantVariant } from "../../../types";
import { vectorCircle, vectorBezier, VECTOR_CENTER } from "../../../../patterns/vector-builder";

export const auroraWisp: PlantVariant = {
  id: "aurora-wisp",
  name: "Aurora Wisp",
  description: "Northern lights captured in flowing ribbons of ethereal beauty",
  rarity: 0.18, // Very rare
  requiresObservationToGerminate: true,
  renderMode: "vector",
  loop: true, // Continuous flowing animation
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "shimmer",
      duration: 18,
      primitives: [
        // Soft flowing bezier ribbons (organic curves)
        vectorBezier(
          VECTOR_CENTER - 16,
          VECTOR_CENTER + 12, // start
          VECTOR_CENTER - 14,
          VECTOR_CENTER, // control 1
          VECTOR_CENTER - 6,
          VECTOR_CENTER - 4, // control 2
          VECTOR_CENTER - 8,
          VECTOR_CENTER - 8 // end
        ),
        vectorBezier(
          VECTOR_CENTER - 8,
          VECTOR_CENTER - 8, // start
          VECTOR_CENTER - 2,
          VECTOR_CENTER + 2, // control 1
          VECTOR_CENTER + 2,
          VECTOR_CENTER + 6, // control 2
          VECTOR_CENTER + 4,
          VECTOR_CENTER + 4 // end
        ),
        vectorBezier(
          VECTOR_CENTER + 4,
          VECTOR_CENTER + 4, // start
          VECTOR_CENTER + 8,
          VECTOR_CENTER, // control 1
          VECTOR_CENTER + 12,
          VECTOR_CENTER - 6, // control 2
          VECTOR_CENTER + 14,
          VECTOR_CENTER - 10 // end
        ),
        // Ethereal glow points
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 2, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 2, 5),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 4, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#88D0D0", // Mint fill
      fillOpacity: 0.4,
      scale: 0.85,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "flow",
      duration: 22,
      primitives: [
        // Flowing wave bezier ribbons
        vectorBezier(
          VECTOR_CENTER - 20,
          VECTOR_CENTER + 10, // start
          VECTOR_CENTER - 18,
          VECTOR_CENTER - 2, // control 1
          VECTOR_CENTER - 12,
          VECTOR_CENTER - 8, // control 2
          VECTOR_CENTER - 10,
          VECTOR_CENTER - 10 // end
        ),
        vectorBezier(
          VECTOR_CENTER - 10,
          VECTOR_CENTER - 10, // start
          VECTOR_CENTER - 6,
          VECTOR_CENTER, // control 1
          VECTOR_CENTER,
          VECTOR_CENTER + 8, // control 2
          VECTOR_CENTER + 2,
          VECTOR_CENTER + 6 // end
        ),
        vectorBezier(
          VECTOR_CENTER + 2,
          VECTOR_CENTER + 6, // start
          VECTOR_CENTER + 6,
          VECTOR_CENTER, // control 1
          VECTOR_CENTER + 12,
          VECTOR_CENTER - 8, // control 2
          VECTOR_CENTER + 16,
          VECTOR_CENTER - 12 // end
        ),
        vectorBezier(
          VECTOR_CENTER + 16,
          VECTOR_CENTER - 12, // start
          VECTOR_CENTER + 18,
          VECTOR_CENTER - 10, // control 1
          VECTOR_CENTER + 20,
          VECTOR_CENTER - 8, // control 2
          VECTOR_CENTER + 22,
          VECTOR_CENTER - 8 // end
        ),
        // Wave crests
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER, 5),
        vectorCircle(VECTOR_CENTER - 4, VECTOR_CENTER - 4, 6),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 2, 5),
        vectorCircle(VECTOR_CENTER + 18, VECTOR_CENTER - 10, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.65,
      fillColor: "#90B8E8", // Sky fill
      fillOpacity: 0.5,
      scale: 1.0,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "dance",
      duration: 30,
      primitives: [
        // Dancing bezier ribbons in full flow
        vectorBezier(
          VECTOR_CENTER - 24,
          VECTOR_CENTER + 8, // start
          VECTOR_CENTER - 20,
          VECTOR_CENTER - 4, // control 1
          VECTOR_CENTER - 16,
          VECTOR_CENTER - 12, // control 2
          VECTOR_CENTER - 12,
          VECTOR_CENTER - 14 // end
        ),
        vectorBezier(
          VECTOR_CENTER - 12,
          VECTOR_CENTER - 14, // start
          VECTOR_CENTER - 6,
          VECTOR_CENTER - 2, // control 1
          VECTOR_CENTER - 2,
          VECTOR_CENTER + 6, // control 2
          VECTOR_CENTER,
          VECTOR_CENTER + 8 // end
        ),
        vectorBezier(
          VECTOR_CENTER,
          VECTOR_CENTER + 8, // start
          VECTOR_CENTER + 4,
          VECTOR_CENTER, // control 1
          VECTOR_CENTER + 10,
          VECTOR_CENTER - 10, // control 2
          VECTOR_CENTER + 14,
          VECTOR_CENTER - 16 // end
        ),
        vectorBezier(
          VECTOR_CENTER + 14,
          VECTOR_CENTER - 16, // start
          VECTOR_CENTER + 18,
          VECTOR_CENTER - 12, // control 1
          VECTOR_CENTER + 22,
          VECTOR_CENTER - 8, // control 2
          VECTOR_CENTER + 26,
          VECTOR_CENTER - 6 // end
        ),
        // Brilliant aurora nodes
        vectorCircle(VECTOR_CENTER - 18, VECTOR_CENTER - 2, 6),
        vectorCircle(VECTOR_CENTER - 6, VECTOR_CENTER - 4, 7),
        vectorCircle(VECTOR_CENTER + 6, VECTOR_CENTER - 2, 7),
        vectorCircle(VECTOR_CENTER + 20, VECTOR_CENTER - 10, 6),
        // Shimmer particles
        vectorCircle(VECTOR_CENTER - 22, VECTOR_CENTER + 6, 3),
        vectorCircle(VECTOR_CENTER + 24, VECTOR_CENTER - 4, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#88D0D0", // Mint fill
      fillOpacity: 0.6,
      scale: 1.15,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
  ],
};
