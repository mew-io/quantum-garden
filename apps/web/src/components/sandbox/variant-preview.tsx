"use client";

import { useEffect, useRef, useCallback } from "react";
import { useVariantSandboxStore } from "@/stores/variant-sandbox-store";
import {
  CANVAS,
  computeLifecycleState,
  getEffectivePalette,
  getActiveVisual,
  isVectorVariant,
  isWatercolorVariant,
  getActiveVectorVisual,
  getVectorKeyframe,
  type PlantWithLifecycle,
  type InterpolatedKeyframe,
  type GlyphKeyframe,
} from "@quantum-garden/shared";
import { SandboxThreeRenderer } from "./sandbox-three-renderer";

const GRID_SIZE = 64;

/**
 * Live preview of the variant at the current playback time.
 * Uses Three.js for rendering, matching the main garden simulation.
 */
export function VariantPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<SandboxThreeRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const {
    getSelectedVariant,
    selectedColorVariation,
    traitOverrides,
    currentTime,
    isPlaying,
    playbackSpeed,
    scale,
    background,
    showGrid,
    setCurrentTime,
    getTotalDuration,
  } = useVariantSandboxStore();

  const variant = getSelectedVariant();
  const canvasSize = GRID_SIZE * scale + 32;

  // Initialize Three.js renderer
  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new SandboxThreeRenderer({
      container: containerRef.current,
      width: canvasSize,
      height: canvasSize,
      enablePostProcessing: false,
    });
    renderer.setInstanceCount(1);
    rendererRef.current = renderer;

    return () => {
      renderer.dispose();
      rendererRef.current = null;
    };
    // Only create once on mount — resize handles dimension changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle resize when scale changes
  useEffect(() => {
    rendererRef.current?.resize(canvasSize, canvasSize);
  }, [canvasSize]);

  // Render function
  const renderFrame = useCallback(() => {
    const renderer = rendererRef.current;
    if (!renderer || !variant) return;

    // Create mock plant for lifecycle computation
    const mockPlant: PlantWithLifecycle = {
      id: "preview",
      variantId: variant.id,
      germinatedAt: new Date(Date.now() - currentTime * 1000),
      lifecycleModifier: 1.0,
      colorVariationName: selectedColorVariation,
    };

    const state = computeLifecycleState(mockPlant, variant, new Date());

    if (isWatercolorVariant(variant)) {
      // Watercolor variant rendering
      renderer.setPixelMeshVisible(false);
      renderer.setVectorGroupVisible(false);
      renderer.setWatercolorGroupVisible(true);

      // Pass trait overrides when the variant declares sandboxControls
      const traits =
        variant.sandboxControls && variant.sandboxControls.length > 0
          ? (traitOverrides as Record<string, unknown>)
          : null;
      renderer.updateWatercolorPlant(variant, state, selectedColorVariation, traits);
    } else if (isVectorVariant(variant)) {
      // Vector variant rendering
      renderer.setPixelMeshVisible(false);
      renderer.setVectorGroupVisible(true);
      renderer.setWatercolorGroupVisible(false);

      const vectorVisual = getActiveVectorVisual(state, variant);
      renderer.updateVectorPlant(vectorVisual, scale);
    } else {
      // Pixel variant rendering
      renderer.setPixelMeshVisible(true);
      renderer.setVectorGroupVisible(false);
      renderer.setWatercolorGroupVisible(false);

      const visual = getActiveVisual(state, variant);
      const isInterpolated = (v: GlyphKeyframe | InterpolatedKeyframe): v is InterpolatedKeyframe =>
        "t" in v;

      let palette: string[];
      if (isInterpolated(visual)) {
        palette = visual.palette;
      } else {
        palette = getEffectivePalette(visual, variant, selectedColorVariation);
      }

      const patternId = `preview-${variant.id}-${state.keyframeIndex}-${
        isInterpolated(visual)
          ? `interp-${Math.round((visual as InterpolatedKeyframe).t * 100)}`
          : "static"
      }`;

      renderer.updateInstance(0, {
        pattern: visual.pattern,
        patternId,
        palette,
        opacity: visual.opacity ?? 1.0,
        scale: visual.scale ?? 1.0,
        lifecycleProgress: state.totalProgress,
      });
    }

    renderer.setBackground(background);
    renderer.setGrid(showGrid);
    renderer.updateTime(performance.now() / 1000);
    renderer.render();
  }, [variant, currentTime, selectedColorVariation, traitOverrides, scale, background, showGrid]);

  // Animation loop for playback
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const animate = (timestamp: number) => {
      const deltaMs = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      const deltaSeconds = (deltaMs / 1000) * playbackSpeed;
      const totalDuration = getTotalDuration();
      const newTime = currentTime + deltaSeconds;

      if (variant?.loop) {
        setCurrentTime(newTime % totalDuration);
      } else if (newTime < totalDuration) {
        setCurrentTime(newTime);
      } else {
        setCurrentTime(totalDuration);
        useVariantSandboxStore.getState().pause();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, currentTime, setCurrentTime, getTotalDuration, variant?.loop]);

  // Render when state changes
  useEffect(() => {
    renderFrame();
  }, [renderFrame]);

  if (!variant) {
    return (
      <div
        className="flex items-center justify-center rounded-lg"
        style={{ width: canvasSize, height: canvasSize, backgroundColor: CANVAS.BACKGROUND_COLOR }}
      >
        <span className="text-gray-500">No variant selected</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={containerRef}
        className="rounded-lg overflow-hidden shadow-lg"
        style={{ width: canvasSize, height: canvasSize }}
      />
      <div className="text-center">
        <span className="text-sm text-gray-400">
          {(() => {
            const state = computeLifecycleState(
              {
                id: "preview",
                variantId: variant.id,
                germinatedAt: new Date(Date.now() - currentTime * 1000),
                lifecycleModifier: 1.0,
                colorVariationName: selectedColorVariation,
              },
              variant,
              new Date()
            );
            if (isWatercolorVariant(variant)) {
              const wcKf = variant.watercolorConfig?.keyframes[state.keyframeIndex];
              return wcKf?.name ?? "unknown";
            }
            if (isVectorVariant(variant)) {
              const vectorKf = getVectorKeyframe(variant, state.keyframeIndex);
              return vectorKf?.name ?? "unknown";
            }
            return state.currentKeyframe.name;
          })()}
        </span>
      </div>
    </div>
  );
}
