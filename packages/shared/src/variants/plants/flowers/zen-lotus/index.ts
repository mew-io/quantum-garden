import type { PlantVariant } from "../../../types";
import {
  vectorCircle,
  vectorLine,
  vectorStar,
  VECTOR_CENTER,
} from "../../../../patterns/vector-builder";

export const zenLotus: PlantVariant = {
  id: "zen-lotus",
  name: "Zen Lotus",
  description: "A geometric lotus of pure form and meditative symmetry",
  rarity: 0.2, // Uncommon
  requiresObservationToGerminate: true,
  renderMode: "vector",
  tweenBetweenKeyframes: true,
  keyframes: [],
  vectorKeyframes: [
    {
      name: "seed",
      duration: 10,
      primitives: [
        // Small seed circle
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 3),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.45,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.3,
      scale: 0.5,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "bud",
      duration: 12,
      primitives: [
        // Bud center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 7),
        // First petal hints (6-fold)
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 8, VECTOR_CENTER, VECTOR_CENTER - 14),
        vectorLine(VECTOR_CENTER - 7, VECTOR_CENTER - 4, VECTOR_CENTER - 12, VECTOR_CENTER - 7),
        vectorLine(VECTOR_CENTER + 7, VECTOR_CENTER - 4, VECTOR_CENTER + 12, VECTOR_CENTER - 7),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.5,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.35,
      scale: 0.65,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "rise",
      duration: 12,
      primitives: [
        // Rising center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 9),
        // 6 petals emerging
        vectorLine(VECTOR_CENTER, VECTOR_CENTER - 10, VECTOR_CENTER, VECTOR_CENTER - 18),
        vectorLine(VECTOR_CENTER - 9, VECTOR_CENTER - 5, VECTOR_CENTER - 16, VECTOR_CENTER - 9),
        vectorLine(VECTOR_CENTER + 9, VECTOR_CENTER - 5, VECTOR_CENTER + 16, VECTOR_CENTER - 9),
        vectorLine(VECTOR_CENTER - 9, VECTOR_CENTER + 5, VECTOR_CENTER - 16, VECTOR_CENTER + 9),
        vectorLine(VECTOR_CENTER + 9, VECTOR_CENTER + 5, VECTOR_CENTER + 16, VECTOR_CENTER + 9),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 10, VECTOR_CENTER, VECTOR_CENTER + 16),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.55,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.4,
      scale: 0.75,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "open",
      duration: 15,
      primitives: [
        // Opening center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 12),
        // 6 petals opening wider
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 18, 4),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER - 9, 4),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER - 9, 4),
        vectorCircle(VECTOR_CENTER - 16, VECTOR_CENTER + 9, 4),
        vectorCircle(VECTOR_CENTER + 16, VECTOR_CENTER + 9, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 18, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.6,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.45,
      scale: 0.85,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "unfurl",
      duration: 18,
      primitives: [
        // Unfurling center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 13),
        // Inner petal layer (6)
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 5),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER - 8, 5),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER + 8, 5),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER + 8, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 16, 5),
        // Outer petal hints
        vectorCircle(VECTOR_CENTER - 8, VECTOR_CENTER - 20, 3),
        vectorCircle(VECTOR_CENTER + 8, VECTOR_CENTER - 20, 3),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.7,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.5,
      scale: 0.92,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "bloom",
      duration: 40,
      primitives: [
        // Full bloom center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 3),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 8, 4, 6),
        // Inner petal ring (6)
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 14, 5),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 7, 5),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 7, 5),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 7, 5),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER + 7, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 14, 5),
        // Outer petal ring (6)
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 22, 4),
        vectorCircle(VECTOR_CENTER - 19, VECTOR_CENTER - 11, 4),
        vectorCircle(VECTOR_CENTER + 19, VECTOR_CENTER - 11, 4),
        vectorCircle(VECTOR_CENTER - 19, VECTOR_CENTER + 11, 4),
        vectorCircle(VECTOR_CENTER + 19, VECTOR_CENTER + 11, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 22, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    {
      name: "breathe",
      duration: 25,
      primitives: [
        // Breathing - slightly expanded
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 7),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 11),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 9, 5, 6),
        // Inner ring expanded
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 16, 6),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER - 8, 6),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER - 8, 6),
        vectorCircle(VECTOR_CENTER - 14, VECTOR_CENTER + 8, 6),
        vectorCircle(VECTOR_CENTER + 14, VECTOR_CENTER + 8, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 16, 6),
        // Outer ring expanded
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 24, 5),
        vectorCircle(VECTOR_CENTER - 21, VECTOR_CENTER - 12, 5),
        vectorCircle(VECTOR_CENTER + 21, VECTOR_CENTER - 12, 5),
        vectorCircle(VECTOR_CENTER - 21, VECTOR_CENTER + 12, 5),
        vectorCircle(VECTOR_CENTER + 21, VECTOR_CENTER + 12, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 24, 5),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.85,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.6,
      scale: 1.05,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "rest",
      duration: 20,
      primitives: [
        // Resting - back to normal
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 3),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 6),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 10),
        vectorStar(VECTOR_CENTER, VECTOR_CENTER, 8, 4, 6),
        // Inner petals
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 14, 5),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER - 7, 5),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER - 7, 5),
        vectorCircle(VECTOR_CENTER - 12, VECTOR_CENTER + 7, 5),
        vectorCircle(VECTOR_CENTER + 12, VECTOR_CENTER + 7, 5),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 14, 5),
        // Outer petals
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 22, 4),
        vectorCircle(VECTOR_CENTER - 19, VECTOR_CENTER - 11, 4),
        vectorCircle(VECTOR_CENTER + 19, VECTOR_CENTER - 11, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.75,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.55,
      scale: 0.95,
      transitionHint: { strategy: "morph", easing: "easeInOut" },
    },
    {
      name: "close",
      duration: 15,
      primitives: [
        // Closing center
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER, 8),
        // Petals folding inward
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 12, 4),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER - 6, 4),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER - 6, 4),
        vectorCircle(VECTOR_CENTER - 10, VECTOR_CENTER + 6, 4),
        vectorCircle(VECTOR_CENTER + 10, VECTOR_CENTER + 6, 4),
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER + 12, 4),
      ],
      strokeColor: "#2A2A2A", // Charcoal outline
      strokeOpacity: 0.55,
      fillColor: "#C898E8", // Lavender fill
      fillOpacity: 0.4,
      scale: 0.8,
      transitionHint: { strategy: "fade", easing: "easeInOut" },
    },
  ],
  // Color variations - quantum selects one
  colorVariations: [
    {
      name: "white-jade",
      weight: 1.0,
      palettes: {
        seed: ["#E8EBE8", "#EEF1EE", "#F4F7F4"],
        bud: ["#E8EBE8", "#EEF1EE", "#F4F7F4"],
        rise: ["#E4E9E6", "#ECEFE9", "#F2F5F2"],
        open: ["#E0E5E2", "#E8EDE9", "#F0F5F1"],
        unfurl: ["#DCE2DC", "#E6ECE6", "#F0F6F0"],
        bloom: ["#D8DED8", "#E4EAE4", "#F0F6F0"],
        breathe: ["#D8DED8", "#E4EAE4", "#F0F6F0"],
        rest: ["#E0E5E0", "#E8EDE8", "#F0F5F0"],
        close: ["#E4E9E4", "#ECEFEC", "#F2F5F2"],
      },
    },
    {
      name: "blush-pink",
      weight: 0.7,
      palettes: {
        seed: ["#F2E4E8", "#F6EAEE", "#FAF0F4"],
        bud: ["#F0E0E4", "#F4E6EA", "#F8ECF0"],
        rise: ["#EEE0E6", "#F2E6EC", "#F6ECF2"],
        open: ["#EADCE2", "#F0E4EA", "#F6ECF2"],
        unfurl: ["#E8D8E0", "#EEE0E8", "#F4E8F0"],
        bloom: ["#E4D4DC", "#ECDCE6", "#F4E4EE"],
        breathe: ["#E4D4DC", "#ECDCE6", "#F4E4EE"],
        rest: ["#E8DAE0", "#EEE2E8", "#F4EAF0"],
        close: ["#ECE0E6", "#F0E6EC", "#F4ECF2"],
      },
    },
    {
      name: "morning-gold",
      weight: 0.5,
      palettes: {
        seed: ["#F2ECE4", "#F6F0EA", "#FAF4F0"],
        bud: ["#F0EAE0", "#F4EEE6", "#F8F2EC"],
        rise: ["#EEE8DE", "#F2ECE4", "#F6F0EA"],
        open: ["#EAE4D8", "#F0EAE0", "#F6F0E8"],
        unfurl: ["#E8E2D4", "#EEE8DC", "#F4EEE6"],
        bloom: ["#E4DED0", "#ECE6DA", "#F4EEE4"],
        breathe: ["#E4DED0", "#ECE6DA", "#F4EEE4"],
        rest: ["#E8E2D8", "#EEE8E0", "#F4EEE8"],
        close: ["#ECE6DE", "#F0EAE4", "#F4EEEA"],
      },
    },
  ],
};
