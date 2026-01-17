"use client";

import { useEffect, useRef, useMemo } from "react";
import { Application, Container, Graphics } from "pixi.js";
import {
  GLYPH_PATTERNS,
  COLOR_PALETTES,
  type GlyphPattern,
  type ColorPalette,
} from "@quantum-garden/shared";
import { useSandboxStore } from "@/stores/sandbox-store";

const BACKGROUND_COLORS = {
  white: 0xffffff,
  dark: 0x1a1a1a,
  checkerboard: 0xe0e0e0,
};

const CELL_PADDING = 16;

/**
 * Single PixiJS canvas that renders all glyph patterns and palettes.
 * Uses one WebGL context for all rendering.
 */
export function GlyphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

  const { scale, visualState, showGrid, background, selectedPatternIndex, selectedPaletteIndex } =
    useSandboxStore();

  // Get filtered patterns and palettes (memoized to prevent unnecessary re-renders)
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

  // Calculate canvas size (labels are in HTML, canvas only contains glyphs)
  const glyphSize = 8 * scale;
  const cellSize = glyphSize + CELL_PADDING;
  const canvasWidth = palettes.length * cellSize + CELL_PADDING;
  const canvasHeight = patterns.length * cellSize + CELL_PADDING;

  // Initialize PixiJS application once
  useEffect(() => {
    if (!containerRef.current) return;

    const app = new Application();

    const initApp = async () => {
      await app.init({
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: BACKGROUND_COLORS[background],
        antialias: false,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      containerRef.current?.appendChild(app.canvas);
      appRef.current = app;

      // Initial render
      renderAllGlyphs(app, {
        patterns,
        palettes,
        scale,
        visualState,
        showGrid,
        background,
        selectedPatternIndex,
      });
    };

    initApp();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only run once on mount
  }, []);

  // Re-render when props change
  useEffect(() => {
    if (!appRef.current) return;

    // Resize canvas if needed
    appRef.current.renderer.resize(canvasWidth, canvasHeight);

    renderAllGlyphs(appRef.current, {
      patterns,
      palettes,
      scale,
      visualState,
      showGrid,
      background,
      selectedPatternIndex,
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
  ]);

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ maxHeight: "calc(100vh - 200px)" }}
    />
  );
}

interface RenderOptions {
  patterns: GlyphPattern[];
  palettes: ColorPalette[];
  scale: number;
  visualState: "superposed" | "collapsed";
  showGrid: boolean;
  background: "white" | "dark" | "checkerboard";
  selectedPatternIndex: number | null;
}

function renderAllGlyphs(app: Application, options: RenderOptions) {
  const { patterns, palettes, scale, visualState, showGrid, background, selectedPatternIndex } =
    options;

  // Clear stage
  app.stage.removeChildren();

  const glyphSize = 8 * scale;
  const cellSize = glyphSize + CELL_PADDING;

  // Draw background
  const bg = new Graphics();
  bg.rect(0, 0, app.renderer.width, app.renderer.height);
  bg.fill(BACKGROUND_COLORS[background]);
  app.stage.addChild(bg);

  // Draw checkerboard pattern if selected
  if (background === "checkerboard") {
    const checker = new Graphics();
    const checkSize = 10;
    for (let y = 0; y < app.renderer.height / checkSize; y++) {
      for (let x = 0; x < app.renderer.width / checkSize; x++) {
        if ((x + y) % 2 === 0) {
          checker.rect(x * checkSize, y * checkSize, checkSize, checkSize);
          checker.fill(0xcccccc);
        }
      }
    }
    app.stage.addChild(checker);
  }

  // Render each pattern row
  patterns.forEach((pattern, rowIndex) => {
    // Render each palette column
    palettes.forEach((palette, colIndex) => {
      const cellX = colIndex * cellSize + CELL_PADDING / 2;
      const cellY = rowIndex * cellSize + CELL_PADDING / 2;

      // Create container for this glyph
      const glyphContainer = new Container();
      glyphContainer.x = cellX;
      glyphContainer.y = cellY;

      if (visualState === "superposed") {
        // Render multiple overlapping patterns
        const actualIndex = selectedPatternIndex !== null ? selectedPatternIndex : rowIndex;
        const otherPatterns = GLYPH_PATTERNS.filter((_, i) => i !== actualIndex).slice(0, 2);
        const allPatterns = [pattern, ...otherPatterns];

        allPatterns.forEach((p, idx) => {
          const glyph = renderGlyph(p.grid, palette.colors, scale, 0.3);
          glyph.x = idx * 2;
          glyph.y = idx * 2;
          glyphContainer.addChild(glyph);
        });
      } else {
        // Render single pattern
        const glyph = renderGlyph(pattern.grid, palette.colors, scale, 1.0);
        glyphContainer.addChild(glyph);
      }

      // Draw grid overlay if enabled
      if (showGrid) {
        const gridGraphics = new Graphics();
        gridGraphics.setStrokeStyle({ width: 1, color: 0x888888, alpha: 0.5 });

        for (let x = 0; x <= 8; x++) {
          gridGraphics.moveTo(x * scale, 0);
          gridGraphics.lineTo(x * scale, glyphSize);
        }
        for (let y = 0; y <= 8; y++) {
          gridGraphics.moveTo(0, y * scale);
          gridGraphics.lineTo(glyphSize, y * scale);
        }
        gridGraphics.stroke();
        glyphContainer.addChild(gridGraphics);
      }

      app.stage.addChild(glyphContainer);
    });
  });
}

/**
 * Convert hex color string to numeric color for PixiJS
 */
function hexToNumber(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

function renderGlyph(
  grid: number[][],
  colors: [string, string, string],
  scale: number,
  opacity: number
): Graphics {
  const graphics = new Graphics();
  graphics.alpha = opacity;

  const gridSize = grid.length;
  const numericColors = colors.map(hexToNumber);

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

        const color = numericColors[colorIndex];
        graphics.rect(x * scale, y * scale, scale, scale);
        graphics.fill(color);
      }
    }
  }

  return graphics;
}
