"use client";

import type { VectorKeyframe, VectorPrimitive } from "@quantum-garden/shared";

interface VectorMiniGlyphProps {
  keyframe: VectorKeyframe;
  size?: number;
  className?: string;
}

/**
 * Mini glyph preview for vector keyframes.
 * Renders vector primitives as SVG for crisp display at any size.
 */
export function VectorMiniGlyph({ keyframe, size = 64, className = "" }: VectorMiniGlyphProps) {
  const { primitives, strokeColor, strokeOpacity, scale = 1.0 } = keyframe;

  // SVG viewBox is 64x64 to match the coordinate space
  const viewBox = "0 0 64 64";

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      className={className}
      style={{
        opacity: strokeOpacity,
        transform: scale !== 1.0 ? `scale(${scale})` : undefined,
      }}
    >
      {primitives.map((primitive, index) => (
        <PrimitiveRenderer
          key={index}
          primitive={primitive}
          stroke={strokeColor}
          strokeOpacity={strokeOpacity}
        />
      ))}
    </svg>
  );
}

interface PrimitiveRendererProps {
  primitive: VectorPrimitive;
  stroke: string;
  strokeOpacity: number;
}

function PrimitiveRenderer({ primitive, stroke, strokeOpacity }: PrimitiveRendererProps) {
  const strokeProps = {
    stroke,
    strokeWidth: 1,
    fill: "none",
    opacity: strokeOpacity,
  };

  switch (primitive.type) {
    case "circle":
      return <circle cx={primitive.cx} cy={primitive.cy} r={primitive.radius} {...strokeProps} />;

    case "line":
      return (
        <line
          x1={primitive.x1}
          y1={primitive.y1}
          x2={primitive.x2}
          y2={primitive.y2}
          {...strokeProps}
        />
      );

    case "polygon": {
      const points = generatePolygonPoints(
        primitive.cx,
        primitive.cy,
        primitive.sides,
        primitive.radius,
        primitive.rotation ?? 0
      );
      return <polygon points={points} {...strokeProps} />;
    }

    case "star": {
      const points = generateStarPoints(
        primitive.cx,
        primitive.cy,
        primitive.points,
        primitive.outerRadius,
        primitive.innerRadius,
        primitive.rotation ?? 0
      );
      return <polygon points={points} {...strokeProps} />;
    }

    case "diamond": {
      const points = generateDiamondPoints(
        primitive.cx,
        primitive.cy,
        primitive.width,
        primitive.height
      );
      return <polygon points={points} {...strokeProps} />;
    }

    default:
      return null;
  }
}

/**
 * Generate SVG polygon points for a regular polygon.
 */
function generatePolygonPoints(
  cx: number,
  cy: number,
  sides: number,
  radius: number,
  rotation: number
): string {
  const points: string[] = [];
  const rotRad = (rotation * Math.PI) / 180;

  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + rotRad - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    points.push(`${x},${y}`);
  }

  return points.join(" ");
}

/**
 * Generate SVG polygon points for a star.
 */
function generateStarPoints(
  cx: number,
  cy: number,
  numPoints: number,
  outerRadius: number,
  innerRadius: number,
  rotation: number
): string {
  const points: string[] = [];
  const rotRad = (rotation * Math.PI) / 180;
  const totalPoints = numPoints * 2;

  for (let i = 0; i < totalPoints; i++) {
    const angle = (i / totalPoints) * Math.PI * 2 + rotRad - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    points.push(`${x},${y}`);
  }

  return points.join(" ");
}

/**
 * Generate SVG polygon points for a diamond.
 */
function generateDiamondPoints(cx: number, cy: number, width: number, height: number): string {
  const halfW = width / 2;
  const halfH = height / 2;

  return [
    `${cx},${cy - halfH}`, // Top
    `${cx + halfW},${cy}`, // Right
    `${cx},${cy + halfH}`, // Bottom
    `${cx - halfW},${cy}`, // Left
  ].join(" ");
}
