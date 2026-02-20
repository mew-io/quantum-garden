/**
 * [Plant Name]
 *
 * [One-sentence description of the plant's visual character and behavior]
 *
 * Category: [ground-cover | grasses | flowers | shrubs | trees | ethereal | geometric | ethereal-vector | watercolor]
 * Rarity: [0.05–1.3 — higher = more common. 1.3 = most common, 0.05 = very rare]
 * Render mode: [vector | watercolor]
 *
 * --- HOW TO ADD THIS PLANT ---
 * 1. Copy this directory to `plants/{category}/{your-plant-id}/`
 * 2. Rename the exported const and fill in all fields below
 * 3. Open `packages/shared/src/variants/registry.ts`
 * 4. Add an import:  import { myPlant } from "./plants/{category}/{your-plant-id}";
 * 5. Add the variant to PLANT_VARIANTS in the correct category section
 * 6. Run `pnpm --filter shared typecheck` to confirm no type errors
 */

import type { PlantVariant } from "../../types";

// Vector primitives — import only what you use
import {
  vectorCircle,
  vectorLine,
  // vectorPolygon,
  // vectorStar,
  // vectorDiamond,
  // vectorArc,
  // vectorBezier,
  // vectorSpiral,
  // vectorConcentricCircles,
  // vectorRadialLines,
  // vectorFlowerOfLife,
  VECTOR_CENTER,
} from "../../../patterns/vector-builder";

// For watercolor plants, use these instead:
// import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../types";
// (no vector-builder import needed for pure watercolor plants)

// ── Private helpers ─────────────────────────────────────────────────────────
// Put any helper functions or constants here. They stay private to this module.
// Example:
// const MY_COLORS = { primary: "#A8D8A8", accent: "#88D0D0" };
// function buildMyElements(ctx: WatercolorBuildContext): WatercolorElement[] { ... }

// ── Exported variant ─────────────────────────────────────────────────────────

export const myPlant: PlantVariant = {
  id: "my-plant-id", // kebab-case, must be globally unique across all plants
  name: "My Plant Name", // Human-readable display name
  description: "A short description shown in the garden UI",
  rarity: 0.5, // 0.05 (very rare) → 1.3 (very common)
  requiresObservationToGerminate: true, // false = grows without being observed

  renderMode: "vector", // "vector" | "watercolor"

  tweenBetweenKeyframes: true, // smooth crossfade between stages
  loop: false, // true = cycle back to first keyframe after last

  // Optional: control how this plant clusters during germination
  // clusteringBehavior: {
  //   mode: "cluster",    // "cluster" | "spread" | "neutral"
  //   clusterRadius: 450,
  //   clusterBonus: 2.0,
  //   maxClusterDensity: 4,
  //   reseedClusterChance: 0.5,
  // },

  // ── Pixel mode (legacy) ──
  // For vector plants, leave this empty:
  keyframes: [],

  // ── Vector mode ──
  // Define keyframes as vector primitive arrays.
  // Each keyframe is a lifecycle stage (e.g. bud, bloom, fade).
  vectorKeyframes: [
    {
      name: "bud",
      duration: 15, // seconds at this stage (scaled by lifecycleModifier)
      primitives: [
        // Use vectorCircle, vectorLine, vectorStar, etc.
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 4, 4),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 2, VECTOR_CENTER, VECTOR_CENTER + 16),
      ],
      strokeColor: "#2A2A2A", // charcoal outline
      strokeOpacity: 0.8,
      fillColor: "#A8D8A8", // sage green
      fillOpacity: 0.6,
      scale: 0.7, // relative to plant's base size
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
      // strategy: "progressive" | "morph" | "fade"
    },
    {
      name: "bloom",
      duration: 45,
      primitives: [
        vectorCircle(VECTOR_CENTER, VECTOR_CENTER - 6, 7),
        vectorLine(VECTOR_CENTER, VECTOR_CENTER + 6, VECTOR_CENTER, VECTOR_CENTER + 18),
      ],
      strokeColor: "#2A2A2A",
      strokeOpacity: 1.0,
      fillColor: "#A8D8A8",
      fillOpacity: 0.85,
      scale: 1.0,
      transitionHint: { strategy: "progressive", easing: "easeInOut" },
    },
    // Add more keyframes as needed...
  ],

  // ── Color variations (optional) ──
  // Quantum measurement selects one color variation per plant.
  // Palette keys must match keyframe names above.
  // colorVariations: [
  //   {
  //     name: "sage",
  //     weight: 1.0, // relative probability of this color being selected
  //     palettes: {
  //       bloom: ["#A8D8A8", "#88D0D0", "#C8E8C8"], // overrides fillColor for the "bloom" keyframe
  //     },
  //   },
  //   {
  //     name: "coral",
  //     weight: 0.6,
  //     palettes: {
  //       bloom: ["#E89090", "#E8A0A0", "#F0C0C0"],
  //     },
  //   },
  // ],

  // ── Watercolor mode ──
  // Only needed if renderMode is "watercolor". Remove if using vector.
  // watercolorConfig: {
  //   keyframes: [
  //     { name: "bud", duration: 20 },
  //     { name: "bloom", duration: 60 },
  //   ],
  //   wcEffect: { layers: 3, opacity: 0.48, spread: 0.07, colorVariation: 0.045 },
  //   buildElements: buildMyElements,
  // },
};
