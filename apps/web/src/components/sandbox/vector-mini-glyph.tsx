"use client";

import type {
  VectorKeyframe,
  VectorPrimitive,
  InterpolatedVectorKeyframe,
} from "@quantum-garden/shared";

interface VectorMiniGlyphProps {
  keyframe: VectorKeyframe | InterpolatedVectorKeyframe;
  size?: number;
  className?: string;
  /** Optional per-primitive draw fractions for progressive drawing */
  drawFractions?: number[];
}

/**
 * Compute the bounding box of a set of vector primitives,
 * then return a viewBox string that tightly frames them with padding.
 */
function computeViewBox(primitives: VectorPrimitive[], padding = 2): string {
  if (primitives.length === 0) return "0 0 64 64";

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const p of primitives) {
    switch (p.type) {
      case "circle":
      case "arc":
        minX = Math.min(minX, p.cx - p.radius);
        minY = Math.min(minY, p.cy - p.radius);
        maxX = Math.max(maxX, p.cx + p.radius);
        maxY = Math.max(maxY, p.cy + p.radius);
        break;
      case "line":
        minX = Math.min(minX, p.x1, p.x2);
        minY = Math.min(minY, p.y1, p.y2);
        maxX = Math.max(maxX, p.x1, p.x2);
        maxY = Math.max(maxY, p.y1, p.y2);
        break;
      case "polygon":
        minX = Math.min(minX, p.cx - p.radius);
        minY = Math.min(minY, p.cy - p.radius);
        maxX = Math.max(maxX, p.cx + p.radius);
        maxY = Math.max(maxY, p.cy + p.radius);
        break;
      case "star":
        minX = Math.min(minX, p.cx - p.outerRadius);
        minY = Math.min(minY, p.cy - p.outerRadius);
        maxX = Math.max(maxX, p.cx + p.outerRadius);
        maxY = Math.max(maxY, p.cy + p.outerRadius);
        break;
      case "diamond":
        minX = Math.min(minX, p.cx - p.width / 2);
        minY = Math.min(minY, p.cy - p.height / 2);
        maxX = Math.max(maxX, p.cx + p.width / 2);
        maxY = Math.max(maxY, p.cy + p.height / 2);
        break;
      case "bezier":
        minX = Math.min(minX, p.x1, p.cx1, p.cx2, p.x2);
        minY = Math.min(minY, p.y1, p.cy1, p.cy2, p.y2);
        maxX = Math.max(maxX, p.x1, p.cx1, p.cx2, p.x2);
        maxY = Math.max(maxY, p.y1, p.cy1, p.cy2, p.y2);
        break;
      case "spiral":
        minX = Math.min(minX, p.cx - p.endRadius);
        minY = Math.min(minY, p.cy - p.endRadius);
        maxX = Math.max(maxX, p.cx + p.endRadius);
        maxY = Math.max(maxY, p.cy + p.endRadius);
        break;
    }
  }

  // Fallback if bounds are degenerate
  if (!isFinite(minX)) return "0 0 64 64";

  // Apply padding and ensure square aspect ratio for uniform scaling
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;
  const w = maxX - minX;
  const h = maxY - minY;
  const side = Math.max(w, h);
  // Center the shorter axis
  const cx = minX + w / 2;
  const cy = minY + h / 2;

  return `${cx - side / 2} ${cy - side / 2} ${side} ${side}`;
}

/**
 * Mini glyph preview for vector keyframes.
 * Renders vector primitives as SVG for crisp display at any size.
 * Supports progressive drawing via drawFractions.
 */
export function VectorMiniGlyph({
  keyframe,
  size = 64,
  className = "",
  drawFractions,
}: VectorMiniGlyphProps) {
  const { primitives, strokeColor, strokeOpacity, scale = 1.0 } = keyframe;

  // Use draw fractions from keyframe if not provided as prop
  const effectiveDrawFractions =
    drawFractions ?? ("drawFractions" in keyframe ? keyframe.drawFractions : undefined);

  // Compute tight viewBox from primitive bounds
  const viewBox = computeViewBox(primitives);

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
      {primitives.map((primitive, index) => {
        const drawFraction = effectiveDrawFractions?.[index] ?? 1;
        // Skip fully hidden primitives
        if (drawFraction <= 0) return null;

        return (
          <PrimitiveRenderer
            key={index}
            primitive={primitive}
            stroke={strokeColor}
            strokeOpacity={strokeOpacity}
            drawFraction={drawFraction}
          />
        );
      })}
    </svg>
  );
}

interface PrimitiveRendererProps {
  primitive: VectorPrimitive;
  stroke: string;
  strokeOpacity: number;
  /** How much of the primitive to draw (0-1) for progressive drawing */
  drawFraction?: number;
}

function PrimitiveRenderer({
  primitive,
  stroke,
  strokeOpacity,
  drawFraction = 1,
}: PrimitiveRendererProps) {
  // Adjust opacity for partially drawn primitives (fade in during first half of draw)
  const effectiveOpacity = strokeOpacity * Math.min(1, drawFraction * 2);

  const strokeProps = {
    stroke,
    strokeWidth: 1,
    fill: "none",
    opacity: effectiveOpacity,
  };

  switch (primitive.type) {
    case "circle": {
      // For partial circles, draw as an arc path
      if (drawFraction < 1) {
        const arcPath = generatePartialCirclePath(
          primitive.cx,
          primitive.cy,
          primitive.radius,
          drawFraction
        );
        return <path d={arcPath} {...strokeProps} />;
      }
      return <circle cx={primitive.cx} cy={primitive.cy} r={primitive.radius} {...strokeProps} />;
    }

    case "line": {
      // For partial lines, calculate the end point based on draw fraction
      const fraction = Math.max(0, Math.min(1, drawFraction));
      const x2 = primitive.x1 + (primitive.x2 - primitive.x1) * fraction;
      const y2 = primitive.y1 + (primitive.y2 - primitive.y1) * fraction;
      return <line x1={primitive.x1} y1={primitive.y1} x2={x2} y2={y2} {...strokeProps} />;
    }

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
 * Generate SVG path for a partial circle (arc).
 */
function generatePartialCirclePath(
  cx: number,
  cy: number,
  radius: number,
  fraction: number
): string {
  const startAngle = 0;
  const endAngle = 2 * Math.PI * fraction;

  const startX = cx + radius * Math.cos(startAngle);
  const startY = cy + radius * Math.sin(startAngle);
  const endX = cx + radius * Math.cos(endAngle);
  const endY = cy + radius * Math.sin(endAngle);

  const largeArcFlag = fraction > 0.5 ? 1 : 0;

  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
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
