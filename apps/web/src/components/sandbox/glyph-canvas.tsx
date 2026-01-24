"use client";

import { useEffect, useRef, useMemo } from "react";
import {
  GLYPH_PATTERNS,
  COLOR_PALETTES,
  type GlyphPattern,
  type ColorPalette,
} from "@quantum-garden/shared";
import { useSandboxStore } from "@/stores/sandbox-store";

const BACKGROUND_COLORS = {
  white: "#ffffff",
  dark: "#1a1a1a",
  checkerboard: "#e0e0e0",
};

const CELL_PADDING = 16;

/**
 * Canvas2D-based renderer for all glyph patterns and palettes.
 */
export function GlyphCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { scale, visualState, showGrid, background, selectedPatternIndex, selectedPaletteIndex } =
    useSandboxStore();

  // Get filtered patterns and palettes
  const patterns = useMemo<GlyphPattern[]>(() => {
    const selectedPattern =
      selectedPatternIndex !== null ? GLYPH_PATTERNS[selectedPatternIndex] : undefined;
    return selectedPattern ? [selectedPattern] : GLYPH_PATTERNS;
  }, [selectedPatternIndex]);

  const palettes = useMemo<ColorPalette[]>(() => {
    const selectedPalette =
      selectedPaletteIndex !== null ? COLOR_PALETTES[selectedPaletteIndex] : undefined;
    return selectedPalette ? [selectedPalette] : COLOR_PALETTES;
  }, [selectedPaletteIndex]);

  // Calculate canvas size
  const glyphSize = 8 * scale;
  const cellSize = glyphSize + CELL_PADDING;
  const canvasWidth = palettes.length * cellSize + CELL_PADDING;
  const canvasHeight = patterns.length * cellSize + CELL_PADDING;

  // Render when props change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    ctx.scale(dpr, dpr);

    // Clear and draw background
    ctx.fillStyle = BACKGROUND_COLORS[background];
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw checkerboard pattern if selected
    if (background === "checkerboard") {
      const checkSize = 10;
      ctx.fillStyle = "#cccccc";
      for (let y = 0; y < canvasHeight / checkSize; y++) {
        for (let x = 0; x < canvasWidth / checkSize; x++) {
          if ((x + y) % 2 === 0) {
            ctx.fillRect(x * checkSize, y * checkSize, checkSize, checkSize);
          }
        }
      }
    }

    // Render each pattern row
    patterns.forEach((pattern, rowIndex) => {
      palettes.forEach((palette, colIndex) => {
        const cellX = colIndex * cellSize + CELL_PADDING / 2;
        const cellY = rowIndex * cellSize + CELL_PADDING / 2;

        if (visualState === "superposed") {
          // Render multiple overlapping patterns
          const actualIndex = selectedPatternIndex !== null ? selectedPatternIndex : rowIndex;
          const otherPatterns = GLYPH_PATTERNS.filter((_, i) => i !== actualIndex).slice(0, 2);
          const allPatterns = [pattern, ...otherPatterns];

          allPatterns.forEach((p, idx) => {
            ctx.globalAlpha = 0.3;
            renderGlyph(ctx, p.grid, palette.colors, scale, cellX + idx * 2, cellY + idx * 2);
          });
          ctx.globalAlpha = 1.0;
        } else {
          // Render single pattern
          renderGlyph(ctx, pattern.grid, palette.colors, scale, cellX, cellY);
        }

        // Draw grid overlay if enabled
        if (showGrid) {
          ctx.strokeStyle = "rgba(136, 136, 136, 0.5)";
          ctx.lineWidth = 1;
          ctx.beginPath();

          for (let x = 0; x <= 8; x++) {
            ctx.moveTo(cellX + x * scale, cellY);
            ctx.lineTo(cellX + x * scale, cellY + glyphSize);
          }
          for (let y = 0; y <= 8; y++) {
            ctx.moveTo(cellX, cellY + y * scale);
            ctx.lineTo(cellX + glyphSize, cellY + y * scale);
          }
          ctx.stroke();
        }
      });
    });
  }, [
    patterns,
    palettes,
    scale,
    visualState,
    showGrid,
    background,
    canvasWidth,
    canvasHeight,
    selectedPatternIndex,
    cellSize,
    glyphSize,
  ]);

  return (
    <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

function renderGlyph(
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
        // Determine color based on distance from center
        const distFromCenter = Math.sqrt(
          Math.pow(x - gridSize / 2, 2) + Math.pow(y - gridSize / 2, 2)
        );
        const maxDist = Math.sqrt(2) * (gridSize / 2);
        const colorIndex = Math.min(2, Math.floor((distFromCenter / maxDist) * 3));

        ctx.fillStyle = colors[colorIndex] ?? colors[0];
        ctx.fillRect(offsetX + x * scale, offsetY + y * scale, scale, scale);
      }
    }
  }
}
