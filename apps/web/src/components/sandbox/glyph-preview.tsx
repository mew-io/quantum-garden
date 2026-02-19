"use client";

import { useEffect, useRef } from "react";
import type { GlyphPattern, ColorPalette } from "@quantum-garden/shared";
import type { VisualState, Background } from "@/stores/sandbox-store";
import { SandboxThreeRenderer } from "./sandbox-three-renderer";

interface GlyphPreviewProps {
  pattern: GlyphPattern;
  palette: ColorPalette;
  scale: number;
  visualState: VisualState;
  showGrid: boolean;
  background: Background;
  superposedPatterns?: GlyphPattern[];
  onClick?: () => void;
  className?: string;
}

/**
 * React wrapper for Three.js glyph rendering.
 * Manages renderer lifecycle and re-renders on prop changes.
 */
export function GlyphPreview({
  pattern,
  palette,
  scale,
  visualState,
  showGrid,
  background,
  superposedPatterns,
  onClick,
  className = "",
}: GlyphPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<SandboxThreeRenderer | null>(null);

  const gridSize = pattern.grid.length;
  const size = gridSize * scale;

  // Render when props change
  useEffect(() => {
    if (!containerRef.current) return;

    // Recreate renderer if container changed or first render
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }

    const renderer = new SandboxThreeRenderer({
      container: containerRef.current,
      width: size,
      height: size,
      enablePostProcessing: false,
    });

    const totalInstances =
      visualState === "superposed" && superposedPatterns
        ? 1 + superposedPatterns.slice(0, 2).length
        : 1;

    renderer.setInstanceCount(totalInstances);
    rendererRef.current = renderer;

    if (visualState === "superposed" && superposedPatterns) {
      const allPatterns = [pattern, ...superposedPatterns.slice(0, 2)];
      allPatterns.forEach((p, idx) => {
        renderer.updateInstance(idx, {
          pattern: p.grid,
          patternId: `preview-${p.name}-${palette.name}-${idx}`,
          palette: palette.colors,
          opacity: 0.3,
          scale: 1.0,
        });
      });
    } else {
      renderer.updateInstance(0, {
        pattern: pattern.grid,
        patternId: `preview-${pattern.name}-${palette.name}`,
        palette: palette.colors,
        opacity: 1.0,
        scale: 1.0,
      });
    }

    renderer.setBackground(background);
    renderer.setGrid(showGrid, gridSize);
    renderer.updateTime(0);
    renderer.render();

    return () => {
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [
    pattern,
    palette,
    scale,
    visualState,
    showGrid,
    background,
    superposedPatterns,
    size,
    gridSize,
  ]);

  return (
    <div
      onClick={onClick}
      className={`inline-block ${onClick ? "cursor-pointer hover:ring-2 hover:ring-blue-500 rounded" : ""} ${className}`}
      style={{ width: size, height: size }}
      title={`${pattern.name} - ${palette.name}`}
    >
      <div ref={containerRef} style={{ width: size, height: size }} />
    </div>
  );
}
