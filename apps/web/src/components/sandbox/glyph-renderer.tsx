"use client";

import type { Application } from "pixi.js";
import { Graphics } from "pixi.js";
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
 * Render a glyph pattern to a PixiJS application
 */
export function renderGlyph(app: Application, options: RenderOptions): void {
  const { pattern, palette, scale, visualState, showGrid, background, superposedPatterns } =
    options;

  // Clear existing graphics
  app.stage.removeChildren();

  const gridSize = pattern.grid.length;
  const totalSize = gridSize * scale;

  // Draw background
  const bg = new Graphics();
  if (background === "checkerboard") {
    // Draw checkerboard pattern
    const checkSize = scale / 2;
    for (let y = 0; y < gridSize * 2; y++) {
      for (let x = 0; x < gridSize * 2; x++) {
        const isLight = (x + y) % 2 === 0;
        bg.rect(x * checkSize, y * checkSize, checkSize, checkSize);
        bg.fill(isLight ? "#FFFFFF" : "#E0E0E0");
      }
    }
  } else {
    bg.rect(0, 0, totalSize, totalSize);
    bg.fill(BACKGROUND_COLORS[background]);
  }
  app.stage.addChild(bg);

  if (visualState === "superposed" && superposedPatterns) {
    // Render multiple overlapping patterns at low opacity
    const patterns = [pattern, ...superposedPatterns.slice(0, 2)];
    patterns.forEach((p, idx) => {
      const graphics = createGlyphGraphics(
        p.grid,
        palette.colors,
        scale,
        0.3 // Superposed opacity
      );
      // Slight offset for visual distinction
      graphics.x = idx * 1;
      graphics.y = idx * 1;
      app.stage.addChild(graphics);
    });
  } else {
    // Render single pattern at full opacity
    const graphics = createGlyphGraphics(pattern.grid, palette.colors, scale, 1.0);
    app.stage.addChild(graphics);
  }

  // Draw grid overlay if enabled
  if (showGrid) {
    const gridGraphics = new Graphics();
    gridGraphics.setStrokeStyle({ width: 1, color: 0x888888, alpha: 0.5 });

    // Draw vertical lines
    for (let x = 0; x <= gridSize; x++) {
      gridGraphics.moveTo(x * scale, 0);
      gridGraphics.lineTo(x * scale, totalSize);
    }

    // Draw horizontal lines
    for (let y = 0; y <= gridSize; y++) {
      gridGraphics.moveTo(0, y * scale);
      gridGraphics.lineTo(totalSize, y * scale);
    }

    gridGraphics.stroke();
    app.stage.addChild(gridGraphics);
  }
}

/**
 * Create a Graphics object for a single glyph pattern
 */
function createGlyphGraphics(
  grid: number[][],
  colors: [string, string, string],
  scale: number,
  opacity: number
): Graphics {
  const graphics = new Graphics();
  graphics.alpha = opacity;

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

        const color = colors[colorIndex];
        graphics.rect(x * scale, y * scale, scale, scale);
        graphics.fill(color);
      }
    }
  }

  return graphics;
}

/**
 * Calculate the size needed for a glyph at a given scale
 */
export function getGlyphSize(pattern: GlyphPattern, scale: number): number {
  return pattern.grid.length * scale;
}
