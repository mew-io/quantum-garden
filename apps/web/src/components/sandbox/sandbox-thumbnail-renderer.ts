/**
 * Sandbox Thumbnail Renderer
 *
 * Singleton offscreen Three.js renderer for generating thumbnail data URLs.
 * Uses the same shader pipeline as the garden for consistent rendering,
 * replacing the previous Canvas2D-based MiniGlyph implementation.
 */

import type { GlyphKeyframe, PlantVariant, ComputedLifecycleState } from "@quantum-garden/shared";

import { SandboxThreeRenderer } from "./sandbox-three-renderer";

/** Cached thumbnail data URLs keyed by content hash */
const thumbnailCache = new Map<string, string>();

/** Lazy-initialized singleton renderer */
let renderer: SandboxThreeRenderer | null = null;

/**
 * Hash a keyframe's visual content for cache lookup.
 */
function hashKeyframe(keyframe: GlyphKeyframe): string {
  // Fast hash from palette + pattern structure
  let hash = 0;
  for (const color of keyframe.palette) {
    for (let i = 0; i < color.length; i++) {
      hash = ((hash << 5) - hash + color.charCodeAt(i)) | 0;
    }
  }
  // Include pattern dimensions and a sample of pattern data
  const pattern = keyframe.pattern;
  hash = ((hash << 5) - hash + pattern.length) | 0;
  for (let y = 0; y < Math.min(pattern.length, 16); y += 4) {
    const row = pattern[y];
    if (!row) continue;
    for (let x = 0; x < Math.min(row.length, 16); x += 4) {
      hash = ((hash << 5) - hash + (row[x] ?? 0)) | 0;
    }
  }
  // Include opacity and scale
  hash = ((hash << 5) - hash + Math.round((keyframe.opacity ?? 1) * 100)) | 0;
  hash = ((hash << 5) - hash + Math.round((keyframe.scale ?? 1) * 100)) | 0;
  return hash.toString(36);
}

/**
 * Get or create the singleton offscreen renderer.
 */
function getRenderer(): SandboxThreeRenderer {
  if (!renderer) {
    renderer = new SandboxThreeRenderer({
      width: 64,
      height: 64,
      enablePostProcessing: false,
    });
    renderer.setInstanceCount(1);
  }
  return renderer;
}

/**
 * Render a keyframe thumbnail as a data URL using Three.js.
 *
 * Returns null during SSR (no document available).
 * Results are cached by keyframe content hash.
 */
export function renderThumbnail(keyframe: GlyphKeyframe): string | null {
  if (typeof document === "undefined") return null;

  const cacheKey = hashKeyframe(keyframe);
  const cached = thumbnailCache.get(cacheKey);
  if (cached) return cached;

  const r = getRenderer();

  // Generate a pattern ID for atlas caching
  const patternId = `thumb-${cacheKey}`;

  r.updateInstance(0, {
    pattern: keyframe.pattern,
    patternId,
    palette: keyframe.palette,
    opacity: keyframe.opacity ?? 1.0,
    scale: keyframe.scale ?? 1.0,
  });

  r.setPixelMeshVisible(true);
  r.setVectorGroupVisible(false);
  r.setBackground("garden");
  r.updateTime(0);

  const dataUrl = r.toDataURL();
  thumbnailCache.set(cacheKey, dataUrl);
  return dataUrl;
}

/**
 * Clear the thumbnail cache (e.g., when variants change during hot reload).
 */
export function clearThumbnailCache(): void {
  thumbnailCache.clear();
}

/**
 * Dispose the singleton renderer and clear the cache.
 */
export function disposeThumbnailRenderer(): void {
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
  thumbnailCache.clear();
}

// =============================================================================
// Watercolor Thumbnail Rendering
// =============================================================================

/** Cached watercolor thumbnail data URLs */
const watercolorThumbnailCache = new Map<string, string>();

/** Lazy-initialized singleton renderer for watercolor thumbnails */
let watercolorRenderer: SandboxThreeRenderer | null = null;

function getWatercolorRenderer(): SandboxThreeRenderer {
  if (!watercolorRenderer) {
    watercolorRenderer = new SandboxThreeRenderer({
      width: 64,
      height: 64,
      enablePostProcessing: false,
    });
  }
  return watercolorRenderer;
}

/**
 * Render a watercolor variant thumbnail as a data URL.
 * Uses the same watercolor rendering pipeline as the main garden.
 */
export function renderWatercolorThumbnail(
  variant: PlantVariant,
  lifecycleState: ComputedLifecycleState,
  colorVariationName: string | null,
  cacheKey: string
): string | null {
  if (typeof document === "undefined") return null;

  const cached = watercolorThumbnailCache.get(cacheKey);
  if (cached) return cached;

  const r = getWatercolorRenderer();

  r.setPixelMeshVisible(false);
  r.setVectorGroupVisible(false);
  r.setWatercolorGroupVisible(true);
  r.setBackground("garden");

  r.updateWatercolorPlant(variant, lifecycleState, colorVariationName, `thumb-${cacheKey}`);
  r.updateTime(0);

  const dataUrl = r.toDataURL();
  watercolorThumbnailCache.set(cacheKey, dataUrl);
  return dataUrl;
}
