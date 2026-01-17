"use client";

import type { GlyphKeyframe } from "@quantum-garden/shared";

interface MiniGlyphProps {
  keyframe: GlyphKeyframe;
  size?: number; // Total size in pixels
  className?: string;
}

/**
 * Mini glyph preview for timeline display.
 * Renders an 8x8 pattern as a small grid of colored pixels.
 */
export function MiniGlyph({ keyframe, size = 32, className = "" }: MiniGlyphProps) {
  const { pattern, palette } = keyframe;
  const gridSize = pattern.length;
  const pixelSize = size / gridSize;

  return (
    <div
      className={`inline-grid ${className}`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridSize}, ${pixelSize}px)`,
        gridTemplateRows: `repeat(${gridSize}, ${pixelSize}px)`,
        width: size,
        height: size,
        opacity: keyframe.opacity ?? 1,
        transform: keyframe.scale ? `scale(${keyframe.scale})` : undefined,
      }}
    >
      {pattern.flatMap((row, y) =>
        row.map((cell, x) => {
          if (cell === 0) {
            return (
              <div
                key={`${x}-${y}`}
                style={{
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: "transparent",
                }}
              />
            );
          }

          // Get color based on cell value (1, 2, 3 map to palette indices 0, 1, 2)
          const colorIndex = Math.min(cell - 1, palette.length - 1);
          const color = palette[colorIndex] || palette[0] || "#888";

          return (
            <div
              key={`${x}-${y}`}
              style={{
                width: pixelSize,
                height: pixelSize,
                backgroundColor: color,
              }}
            />
          );
        })
      )}
    </div>
  );
}
