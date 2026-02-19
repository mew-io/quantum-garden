"use client";

import { useEffect, useRef, useMemo } from "react";
import {
  GLYPH_PATTERNS,
  COLOR_PALETTES,
  type GlyphPattern,
  type ColorPalette,
} from "@quantum-garden/shared";
import { useSandboxStore } from "@/stores/sandbox-store";
import { SandboxThreeRenderer } from "./sandbox-three-renderer";

const CELL_PADDING = 16;

/**
 * Three.js-based renderer for all glyph patterns and palettes.
 * Replaces the previous Canvas2D implementation with instanced mesh rendering.
 */
export function GlyphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<SandboxThreeRenderer | null>(null);

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

  const instanceCount = patterns.length * palettes.length;

  // Initialize and update renderer
  useEffect(() => {
    if (!containerRef.current) return;

    // Create or recreate renderer when dimensions change
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }

    const renderer = new SandboxThreeRenderer({
      container: containerRef.current,
      width: canvasWidth,
      height: canvasHeight,
      enablePostProcessing: false,
    });

    // Set camera frustum to cover the grid layout
    renderer.setCameraFrustum(0, canvasWidth, 0, canvasHeight);

    const totalInstances = visualState === "superposed" ? instanceCount * 3 : instanceCount;

    renderer.setInstanceCount(totalInstances);
    rendererRef.current = renderer;

    // Populate instances
    let instanceIdx = 0;
    patterns.forEach((pattern, rowIndex) => {
      palettes.forEach((palette, colIndex) => {
        const cellX = colIndex * cellSize + CELL_PADDING / 2 + glyphSize / 2;
        const cellY = rowIndex * cellSize + CELL_PADDING / 2 + glyphSize / 2;

        if (visualState === "superposed") {
          const actualIndex = selectedPatternIndex !== null ? selectedPatternIndex : rowIndex;
          const otherPatterns = GLYPH_PATTERNS.filter((_, i) => i !== actualIndex).slice(0, 2);
          const allPatterns = [pattern, ...otherPatterns];

          allPatterns.forEach((p, idx) => {
            renderer.updateInstance(instanceIdx++, {
              pattern: p.grid,
              patternId: `glyph-${p.name}-${palette.name}-${idx}`,
              palette: palette.colors,
              position: { x: cellX + idx * 2, y: cellY + idx * 2 },
              opacity: 0.3,
              scale: glyphSize / 64,
            });
          });
        } else {
          renderer.updateInstance(instanceIdx++, {
            pattern: pattern.grid,
            patternId: `glyph-${pattern.name}-${palette.name}`,
            palette: palette.colors,
            position: { x: cellX, y: cellY },
            opacity: 1.0,
            scale: glyphSize / 64,
          });
        }
      });
    });

    renderer.setBackground(background);
    renderer.setGrid(false);
    renderer.updateTime(0);
    renderer.render();

    return () => {
      renderer.dispose();
      rendererRef.current = null;
    };
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
    instanceCount,
  ]);

  return (
    <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
      <div ref={containerRef} style={{ width: canvasWidth, height: canvasHeight }} />
    </div>
  );
}
