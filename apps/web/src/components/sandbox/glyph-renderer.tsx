"use client";

import type { GlyphPattern, ColorPalette } from "@quantum-garden/shared";
import type { VisualState, Background } from "@/stores/sandbox-store";

const BACKGROUND_COLORS: Record<Background, string> = {
  white: "#FFFFFF",
  dark: "#1a1a1a",
  checkerboard: "#E0E0E0",
};

interface RenderOptions {
  pattern: GlyphPattern;
  palette: ColorPalette;
  scale: number;
  visualState: VisualState;
  showGrid: boolean;
  background: Background;
  superposedPatterns?: GlyphPattern[];
}

/**
 * Render a glyph pattern to a Canvas2D context
 */
export function renderGlyph(ctx: CanvasRenderingContext2D, options: RenderOptions): void {
  const { pattern, palette, scale, visualState, showGrid, background, superposedPatterns } =
    options;

  const gridSize = pattern.grid.length;
  const totalSize = gridSize * scale;

  // Clear canvas
  ctx.clearRect(0, 0, totalSize, totalSize);

  // Draw background
  if (background === "checkerboard") {
    // Draw checkerboard pattern
    const checkSize = scale / 2;
    for (let y = 0; y < gridSize * 2; y++) {
      for (let x = 0; x < gridSize * 2; x++) {
        const isLight = (x + y) % 2 === 0;
        ctx.fillStyle = isLight ? "#FFFFFF" : "#E0E0E0";
        ctx.fillRect(x * checkSize, y * checkSize, checkSize, checkSize);
      }
    }
  } else {
    ctx.fillStyle = BACKGROUND_COLORS[background];
    ctx.fillRect(0, 0, totalSize, totalSize);
  }

  if (visualState === "superposed" && superposedPatterns) {
    // Render multiple overlapping patterns at low opacity
    const patterns = [pattern, ...superposedPatterns.slice(0, 2)];
    patterns.forEach((p, idx) => {
      ctx.globalAlpha = 0.3;
      renderGlyphPattern(ctx, p.grid, palette.colors, scale, idx, idx);
    });
    ctx.globalAlpha = 1.0;
  } else {
    // Render single pattern at full opacity
    renderGlyphPattern(ctx, pattern.grid, palette.colors, scale, 0, 0);
  }

  // Draw grid overlay if enabled
  if (showGrid) {
    ctx.strokeStyle = "rgba(136, 136, 136, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Draw vertical lines
    for (let x = 0; x <= gridSize; x++) {
      ctx.moveTo(x * scale, 0);
      ctx.lineTo(x * scale, totalSize);
    }

    // Draw horizontal lines
    for (let y = 0; y <= gridSize; y++) {
      ctx.moveTo(0, y * scale);
      ctx.lineTo(totalSize, y * scale);
    }

    ctx.stroke();
  }
}

/**
 * Render a single glyph pattern to the canvas
 */
function renderGlyphPattern(
  ctx: CanvasRenderingContext2D,
  grid: number[][],
  colors: [string, string, string],
  scale: number,
  offsetX: number,
  offsetY: number
): void {
  const gridSize = grid.length;

  for (let y = 0; y < gridSize; y++) {
    const row = grid[y];
    if (!row) continue;
    for (let x = 0; x < gridSize; x++) {
      if (row[x] === 1) {
        // Determine color based on position (simple gradient effect)
        const distFromCenter = Math.sqrt(
          Math.pow(x - gridSize / 2, 2) + Math.pow(y - gridSize / 2, 2)
        );
        const maxDist = Math.sqrt(2) * (gridSize / 2);
        const colorIndex = Math.min(2, Math.floor((distFromCenter / maxDist) * 3));

        const color = colors[colorIndex] ?? colors[0];
        ctx.fillStyle = color;
        ctx.fillRect(offsetX + x * scale, offsetY + y * scale, scale, scale);
      }
    }
  }
}

/**
 * Calculate the size needed for a glyph at a given scale
 */
export function getGlyphSize(pattern: GlyphPattern, scale: number): number {
  return pattern.grid.length * scale;
}
