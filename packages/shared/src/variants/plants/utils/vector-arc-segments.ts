import type { VectorPrimitive } from "../../types";
import { vectorLine } from "../../../patterns/vector-builder";

/**
 * Helper function to generate arc segments (lines along a circular path).
 * Used to create enso (incomplete circle) brush stroke effects.
 *
 * @param cx - Center X
 * @param cy - Center Y
 * @param radius - Radius of the arc
 * @param startAngle - Start angle in degrees (0 = right, 90 = bottom)
 * @param endAngle - End angle in degrees
 * @param segments - Number of line segments to use
 */
export function vectorArcSegments(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  segments: number
): VectorPrimitive[] {
  const lines: VectorPrimitive[] = [];
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const angleStep = (endRad - startRad) / segments;

  for (let i = 0; i < segments; i++) {
    const a1 = startRad + i * angleStep;
    const a2 = startRad + (i + 1) * angleStep;
    lines.push(
      vectorLine(
        cx + Math.cos(a1) * radius,
        cy + Math.sin(a1) * radius,
        cx + Math.cos(a2) * radius,
        cy + Math.sin(a2) * radius
      )
    );
  }
  return lines;
}
