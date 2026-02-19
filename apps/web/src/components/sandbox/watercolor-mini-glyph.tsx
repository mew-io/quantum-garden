"use client";

import { useMemo } from "react";
import {
  CANVAS,
  computeLifecycleState,
  type PlantVariant,
  type PlantWithLifecycle,
} from "@quantum-garden/shared";
import { renderWatercolorThumbnail } from "./sandbox-thumbnail-renderer";

interface WatercolorMiniGlyphProps {
  variant: PlantVariant;
  /** Which keyframe index to render (default: middle keyframe) */
  keyframeIndex?: number;
  size?: number;
  className?: string;
}

/**
 * Mini glyph preview for watercolor variants.
 * Renders a watercolor plant at a specific keyframe as a thumbnail
 * using the shared Three.js watercolor rendering pipeline.
 */
export function WatercolorMiniGlyph({
  variant,
  keyframeIndex,
  size = 64,
  className = "",
}: WatercolorMiniGlyphProps) {
  const imageDataUrl = useMemo(() => {
    const config = variant.watercolorConfig;
    if (!config) return null;

    // Compute which keyframe to show
    const kfIdx =
      keyframeIndex ??
      Math.min(Math.floor(config.keyframes.length / 2), config.keyframes.length - 1);
    const kf = config.keyframes[kfIdx];
    if (!kf) return null;

    // Compute elapsed time to reach the middle of the target keyframe
    let elapsed = 0;
    for (let i = 0; i < kfIdx; i++) {
      elapsed += config.keyframes[i]!.duration;
    }
    elapsed += kf.duration * 0.5;

    const mockPlant: PlantWithLifecycle = {
      id: `wc-thumb-${variant.id}`,
      variantId: variant.id,
      germinatedAt: new Date(Date.now() - elapsed * 1000),
      lifecycleModifier: 1.0,
      colorVariationName: null,
    };

    const state = computeLifecycleState(mockPlant, variant, new Date());
    const cacheKey = `wc-${variant.id}-kf${kfIdx}`;

    return renderWatercolorThumbnail(variant, state, null, cacheKey);
  }, [variant, keyframeIndex]);

  if (!imageDataUrl) {
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
      alt={`${variant.name} preview`}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
