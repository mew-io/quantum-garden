"use client";

import { useEffect, useRef } from "react";
import { Application } from "pixi.js";
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
 * React wrapper for PixiJS glyph rendering.
 * Manages PixiJS lifecycle and re-renders on prop changes.
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
  const appRef = useRef<Application | null>(null);
  const initializingRef = useRef(false);

  const size = getGlyphSize(pattern, scale);

  // Initialize PixiJS application
  useEffect(() => {
    if (!containerRef.current || initializingRef.current) return;

    initializingRef.current = true;

    const app = new Application();

    const initApp = async () => {
      try {
        await app.init({
          width: size,
          height: size,
          backgroundAlpha: 0,
          antialias: false,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        if (containerRef.current && !appRef.current) {
          containerRef.current.appendChild(app.canvas);
          appRef.current = app;

          // Initial render
          renderGlyph(app, {
            pattern,
            palette,
            scale,
            visualState,
            showGrid,
            background,
            superposedPatterns,
          });
        }
      } finally {
        initializingRef.current = false;
      }
    };

    initApp();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
      initializingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally only runs once to initialize PixiJS app
  }, []);

  // Re-render when props change
  useEffect(() => {
    if (!appRef.current) return;

    // Resize canvas if scale changed
    appRef.current.renderer.resize(size, size);

    renderGlyph(appRef.current, {
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
      ref={containerRef}
      onClick={onClick}
      className={`inline-block ${onClick ? "cursor-pointer hover:ring-2 hover:ring-blue-500 rounded" : ""} ${className}`}
      style={{ width: size, height: size }}
      title={`${pattern.name} - ${palette.name}`}
    />
  );
}
