/**
 * Watercolor Crystal Lattice
 *
 * A grid of nodes connected by thin stems. Minimalist line-work style with
 * small dots at grid intersections and stems as connections between adjacent
 * nodes. Crystal-like structured pattern.
 *
 * Category: watercolor (geometric)
 * Rarity: 0.03
 * Render mode: watercolor
 * Path B: interference circuit + schema mapping
 */

import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";
import { createRng, traitOr } from "../_helpers";

// -- Color palettes -----------------------------------------------------------

interface LatticeColors {
  node: string;
  connection: string;
  highlight: string;
}

const LATTICE_COLORS: Record<string, LatticeColors> = {
  crystal: { node: "#A0C0E0", connection: "#80A8D0", highlight: "#6890B8" },
  obsidian: { node: "#606068", connection: "#808088", highlight: "#50505A" },
};

const DEFAULT_COLORS: LatticeColors = LATTICE_COLORS.crystal!;

// -- Openness curve -----------------------------------------------------------

function latticeOpenness(keyframeName: string, progress: number): number {
  switch (keyframeName) {
    case "dormant":
      return 0;
    case "nodes":
      return progress * 0.3; // 0 -> 0.3
    case "connect":
      return 0.3 + progress * 0.6; // 0.3 -> 0.9
    case "shimmer":
      return 0.9 + progress * 0.1; // 0.9 -> 1.0
    default:
      return 0.5;
  }
}

// -- Main builder -------------------------------------------------------------

function buildWcCrystalLatticeElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];
  const rng = createRng(ctx.seed);

  const nodeCount = traitOr(ctx.traits, "nodeCount", 6);
  const connectionDensity = traitOr(ctx.traits, "connectionDensity", 0.7);
  const latticeScale = traitOr(ctx.traits, "latticeScale", 1.0);

  const openness = latticeOpenness(ctx.keyframeName, ctx.keyframeProgress);

  const colors =
    ctx.colorVariationName && LATTICE_COLORS[ctx.colorVariationName]
      ? LATTICE_COLORS[ctx.colorVariationName]!
      : DEFAULT_COLORS;

  const cx = 32;
  const cy = 32;

  // Determine grid dimensions from nodeCount (approximate a square grid)
  const cols = Math.ceil(Math.sqrt(nodeCount));
  const rows = Math.ceil(nodeCount / cols);
  const spacing = 7 * latticeScale;

  // Center the grid
  const gridWidth = (cols - 1) * spacing;
  const gridHeight = (rows - 1) * spacing;
  const startX = cx - gridWidth / 2;
  const startY = cy - gridHeight / 2;

  // Build grid positions
  const gridPositions: Array<{ x: number; y: number; col: number; row: number }> = [];
  let placed = 0;
  for (let r = 0; r < rows && placed < nodeCount; r++) {
    for (let c = 0; c < cols && placed < nodeCount; c++) {
      gridPositions.push({
        x: startX + c * spacing,
        y: startY + r * spacing,
        col: c,
        row: r,
      });
      placed++;
    }
  }

  // -- Node dots (visible once openness > 0) ----------------------------------
  const nodeOpenness = Math.min(1, openness / 0.3);
  if (nodeOpenness > 0) {
    for (let i = 0; i < gridPositions.length; i++) {
      const pos = gridPositions[i]!;
      const radius = (0.8 + rng() * 0.4) * nodeOpenness * latticeScale;
      elements.push({
        shape: { type: "disc", radius },
        position: { x: pos.x, y: pos.y },
        rotation: 0,
        scale: 1,
        color: colors.node,
        opacity: 0.5 + nodeOpenness * 0.3,
        zOffset: 1.0 + i * 0.01,
      });
    }
  }

  // -- Connections (thin stems between adjacent nodes) ------------------------
  const connectOpenness = Math.max(0, (openness - 0.3) / 0.6);
  if (connectOpenness > 0) {
    for (let i = 0; i < gridPositions.length; i++) {
      const pos = gridPositions[i]!;

      // Horizontal connection (to the right neighbor)
      const rightNeighbor = gridPositions.find((p) => p.col === pos.col + 1 && p.row === pos.row);
      if (rightNeighbor && rng() < connectionDensity) {
        const midX = (pos.x + rightNeighbor.x) / 2;
        const midY = (pos.y + rightNeighbor.y) / 2;
        elements.push({
          shape: {
            type: "stem",
            points: [
              [pos.x, pos.y],
              [midX, midY + rng() * 0.3 - 0.15],
              [midX, midY - rng() * 0.3 + 0.15],
              [rightNeighbor.x, rightNeighbor.y],
            ],
            thickness: 0.3 * connectOpenness * latticeScale,
          },
          position: { x: 0, y: 0 },
          rotation: 0,
          scale: 1,
          color: colors.connection,
          opacity: 0.35 + connectOpenness * 0.25,
          zOffset: 0.5,
        });
      }

      // Vertical connection (to the bottom neighbor)
      const bottomNeighbor = gridPositions.find((p) => p.col === pos.col && p.row === pos.row + 1);
      if (bottomNeighbor && rng() < connectionDensity) {
        const midX = (pos.x + bottomNeighbor.x) / 2;
        const midY = (pos.y + bottomNeighbor.y) / 2;
        elements.push({
          shape: {
            type: "stem",
            points: [
              [pos.x, pos.y],
              [midX + rng() * 0.3 - 0.15, midY],
              [midX - rng() * 0.3 + 0.15, midY],
              [bottomNeighbor.x, bottomNeighbor.y],
            ],
            thickness: 0.3 * connectOpenness * latticeScale,
          },
          position: { x: 0, y: 0 },
          rotation: 0,
          scale: 1,
          color: colors.connection,
          opacity: 0.35 + connectOpenness * 0.25,
          zOffset: 0.5,
        });
      }
    }
  }

  // -- Shimmer highlight dots -------------------------------------------------
  if (ctx.keyframeName === "shimmer" && openness > 0.9) {
    const shimmerCount = Math.floor(gridPositions.length * 0.5);
    for (let i = 0; i < shimmerCount; i++) {
      const pos = gridPositions[Math.floor(rng() * gridPositions.length)]!;
      elements.push({
        shape: { type: "dot", radius: 0.3 + rng() * 0.3 },
        position: { x: pos.x + rng() * 2 - 1, y: pos.y + rng() * 2 - 1 },
        rotation: 0,
        scale: 1,
        color: colors.highlight,
        opacity: 0.3 + rng() * 0.4,
        zOffset: 2.0,
      });
    }
  }

  return elements;
}

// -- Variant export -----------------------------------------------------------

export const wcCrystalLattice: PlantVariant = {
  id: "wc-crystal-lattice",
  name: "Crystal Lattice",
  disabled: true,
  description:
    "A minimalist grid of nodes connected by thin crystal stems, its structure determined by quantum entropy",
  rarity: 0.03,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  circuitId: "interference",
  quantumMapping: {
    schema: {
      nodeCount: { signal: "entropy", range: [4, 9], default: 6, round: true },
      connectionDensity: { signal: "spread", range: [0.4, 1.0], default: 0.7 },
      latticeScale: { signal: "growth", range: [0.7, 1.3], default: 1.0 },
    },
  },
  colorVariations: [
    { name: "crystal", weight: 1.0, palettes: { full: ["#A0C0E0", "#80A8D0", "#6890B8"] } },
    { name: "obsidian", weight: 0.6, palettes: { full: ["#606068", "#808088", "#50505A"] } },
  ],
  watercolorConfig: {
    keyframes: [
      { name: "dormant", duration: 5 },
      { name: "nodes", duration: 15 },
      { name: "connect", duration: 35 },
      { name: "shimmer", duration: 10 },
    ],
    wcEffect: { layers: 2, opacity: 0.5, spread: 0.03, colorVariation: 0.02 },
    buildElements: buildWcCrystalLatticeElements,
  },
};
