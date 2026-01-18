"use client";

import { useMemo } from "react";
import type { GlyphKeyframe } from "@quantum-garden/shared";

interface MiniGlyphProps {
  keyframe: GlyphKeyframe;
  size?: number; // Total size in pixels
  className?: string;
}

/**
 * Mini glyph preview for timeline and gallery display.
 * Renders a 64x64 pattern using canvas for performance.
 * Uses distance-from-center gradient coloring to match plant-sprite.ts.
 */
export function MiniGlyph({ keyframe, size = 64, className = "" }: MiniGlyphProps) {
  const { pattern, palette } = keyframe;
  const gridSize = pattern.length;

  // Generate image data URL using canvas (more performant for 64x64 grids)
  const imageDataUrl = useMemo(() => {
    if (typeof document === "undefined") return null;

    const canvas = document.createElement("canvas");
    canvas.width = gridSize;
    canvas.height = gridSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Draw each pixel
    for (let y = 0; y < gridSize; y++) {
      const row = pattern[y];
      if (!row) continue;
      for (let x = 0; x < gridSize; x++) {
        const cell = row[x];
        if (cell && cell > 0) {
          // Determine color based on distance from center (gradient effect)
          // This matches the rendering in plant-sprite.ts
          const distFromCenter = Math.sqrt(
            Math.pow(x - gridSize / 2, 2) + Math.pow(y - gridSize / 2, 2)
          );
          const maxDist = Math.sqrt(2) * (gridSize / 2);
          const colorIndex = Math.min(
            palette.length - 1,
            Math.floor((distFromCenter / maxDist) * palette.length)
          );
          ctx.fillStyle = palette[colorIndex] || palette[0] || "#888";
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    return canvas.toDataURL();
  }, [pattern, palette, gridSize]);

  if (!imageDataUrl) {
    // SSR fallback
    return <div className={`bg-gray-700 ${className}`} style={{ width: size, height: size }} />;
  }

  return (
    <img
      src={imageDataUrl}
      alt="Glyph preview"
      className={className}
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
        opacity: keyframe.opacity ?? 1,
        transform: keyframe.scale ? `scale(${keyframe.scale})` : undefined,
      }}
    />
  );
}
