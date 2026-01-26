/**
 * Vector Builder Utilities
 *
 * Helper functions to create vector primitives for vector-mode variants.
 * Coordinates are in a 64x64 space to match pixel pattern dimensions.
 */

import type {
  VectorPrimitive,
  VectorCircle,
  VectorLine,
  VectorPolygon,
  VectorStar,
  VectorDiamond,
} from "../variants/types";

/** Standard coordinate space size (matches PATTERN_SIZE) */
export const VECTOR_SIZE = 64;

/** Center coordinate for convenience */
export const VECTOR_CENTER = VECTOR_SIZE / 2;

/**
 * Create a circle primitive
 */
export function vectorCircle(cx: number, cy: number, radius: number): VectorCircle {
  return { type: "circle", cx, cy, radius };
}

/**
 * Create a line primitive
 */
export function vectorLine(x1: number, y1: number, x2: number, y2: number): VectorLine {
  return { type: "line", x1, y1, x2, y2 };
}

/**
 * Create a regular polygon primitive (hexagon, octagon, etc.)
 */
export function vectorPolygon(
  cx: number,
  cy: number,
  sides: number,
  radius: number,
  rotation: number = 0
): VectorPolygon {
  return { type: "polygon", cx, cy, sides, radius, rotation };
}

/**
 * Create a star primitive
 */
export function vectorStar(
  cx: number,
  cy: number,
  points: number,
  outerRadius: number,
  innerRadius: number,
  rotation: number = 0
): VectorStar {
  return { type: "star", cx, cy, points, outerRadius, innerRadius, rotation };
}

/**
 * Create a diamond/rhombus primitive
 */
export function vectorDiamond(
  cx: number,
  cy: number,
  width: number,
  height: number
): VectorDiamond {
  return { type: "diamond", cx, cy, width, height };
}

/**
 * Create multiple concentric circles
 */
export function vectorConcentricCircles(
  cx: number,
  cy: number,
  radii: number[]
): VectorPrimitive[] {
  return radii.map((radius) => vectorCircle(cx, cy, radius));
}

/**
 * Create radial lines emanating from center
 */
export function vectorRadialLines(
  cx: number,
  cy: number,
  count: number,
  innerRadius: number,
  outerRadius: number,
  angleOffset: number = 0
): VectorPrimitive[] {
  const lines: VectorLine[] = [];
  const offsetRad = (angleOffset * Math.PI) / 180;
  const angleStep = (2 * Math.PI) / count;

  for (let i = 0; i < count; i++) {
    const angle = i * angleStep + offsetRad;
    const x1 = cx + Math.cos(angle) * innerRadius;
    const y1 = cy + Math.sin(angle) * innerRadius;
    const x2 = cx + Math.cos(angle) * outerRadius;
    const y2 = cy + Math.sin(angle) * outerRadius;
    lines.push(vectorLine(x1, y1, x2, y2));
  }

  return lines;
}

/**
 * Create diamonds arranged at cardinal or diagonal positions around a center
 */
export function vectorCardinalDiamonds(
  cx: number,
  cy: number,
  distance: number,
  width: number,
  height: number,
  count: number = 4,
  angleOffset: number = 0
): VectorPrimitive[] {
  const diamonds: VectorDiamond[] = [];
  const offsetRad = (angleOffset * Math.PI) / 180;
  const angleStep = (2 * Math.PI) / count;

  for (let i = 0; i < count; i++) {
    const angle = i * angleStep + offsetRad;
    const dx = cx + Math.cos(angle) * distance;
    const dy = cy + Math.sin(angle) * distance;
    diamonds.push(vectorDiamond(dx, dy, width, height));
  }

  return diamonds;
}

/**
 * Create a grid of diamonds (lattice pattern)
 */
export function vectorDiamondGrid(
  cx: number,
  cy: number,
  spacing: number,
  width: number,
  height: number,
  gridSize: number = 3
): VectorPrimitive[] {
  const diamonds: VectorDiamond[] = [];
  const half = Math.floor(gridSize / 2);

  for (let row = -half; row <= half; row++) {
    for (let col = -half; col <= half; col++) {
      const dx = cx + col * spacing;
      const dy = cy + row * spacing;
      diamonds.push(vectorDiamond(dx, dy, width, height));
    }
  }

  return diamonds;
}

/**
 * Create connecting lines between adjacent points in a ring
 */
export function vectorConnectingLines(
  cx: number,
  cy: number,
  radius: number,
  pointCount: number,
  angleOffset: number = 0
): VectorPrimitive[] {
  const lines: VectorLine[] = [];
  const offsetRad = (angleOffset * Math.PI) / 180;
  const angleStep = (2 * Math.PI) / pointCount;

  // Lines from center to each point
  for (let i = 0; i < pointCount; i++) {
    const angle = i * angleStep + offsetRad;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    lines.push(vectorLine(cx, cy, x, y));
  }

  return lines;
}

/**
 * Create a flower of life pattern (overlapping circles)
 */
export function vectorFlowerOfLife(
  cx: number,
  cy: number,
  radius: number,
  rings: number = 1
): VectorPrimitive[] {
  const circles: VectorCircle[] = [];

  // Center circle
  circles.push(vectorCircle(cx, cy, radius));

  // First ring of 6 circles
  if (rings >= 1) {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      circles.push(vectorCircle(x, y, radius));
    }
  }

  // Second ring (outer circles)
  if (rings >= 2) {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius * 2;
      const y = cy + Math.sin(angle) * radius * 2;
      circles.push(vectorCircle(x, y, radius));
    }
  }

  return circles;
}
