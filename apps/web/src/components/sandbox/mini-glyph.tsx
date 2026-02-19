"use client";

import { useMemo } from "react";
import { CANVAS, type GlyphKeyframe } from "@quantum-garden/shared";
import { renderThumbnail } from "./sandbox-thumbnail-renderer";

interface MiniGlyphProps {
  keyframe: GlyphKeyframe;
  size?: number;
  className?: string;
}

/**
 * Mini glyph preview for timeline and gallery display.
 * Uses the Three.js thumbnail renderer for consistent rendering
 * with the main garden simulation.
 */
export function MiniGlyph({ keyframe, size = 64, className = "" }: MiniGlyphProps) {
  const imageDataUrl = useMemo(() => {
    return renderThumbnail(keyframe);
  }, [keyframe]);

  if (!imageDataUrl) {
    // SSR fallback
    return (
      <div
        className={className}
        style={{ width: size, height: size, backgroundColor: CANVAS.BACKGROUND_COLOR }}
      />
    );
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
