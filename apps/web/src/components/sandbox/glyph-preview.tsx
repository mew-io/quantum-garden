"use client";

import { useEffect, useRef } from "react";
import type { GlyphPattern, ColorPalette } from "@quantum-garden/shared";
import type { VisualState, Background } from "@/stores/sandbox-store";
import { renderGlyph, getGlyphSize } from "./glyph-renderer";

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
 * React wrapper for Canvas2D glyph rendering.
 * Manages canvas lifecycle and re-renders on prop changes.
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const size = getGlyphSize(pattern, scale);

  // Render when props change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    renderGlyph(ctx, {
      pattern,
      palette,
      scale,
      visualState,
      showGrid,
      background,
      superposedPatterns,
    });
  }, [pattern, palette, scale, visualState, showGrid, background, superposedPatterns, size]);

  return (
    <div
      onClick={onClick}
      className={`inline-block ${onClick ? "cursor-pointer hover:ring-2 hover:ring-blue-500 rounded" : ""} ${className}`}
      style={{ width: size, height: size }}
      title={`${pattern.name} - ${palette.name}`}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
