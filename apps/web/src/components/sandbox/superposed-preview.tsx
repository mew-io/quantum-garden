"use client";

import { useEffect, useRef, useState } from "react";
import {
  PLANT_VARIANTS,
  computeLifecycleState,
  getEffectivePalette,
  getActiveVisual,
  isVectorVariant,
  isWatercolorVariant,
  type PlantWithLifecycle,
  type InterpolatedKeyframe,
  type GlyphKeyframe,
} from "@quantum-garden/shared";
import { SandboxThreeRenderer } from "./sandbox-three-renderer";

const CANVAS_SIZE = 128;
const MAX_SUPERPOSED_VARIANTS = 10;

/**
 * Compact superposed preview showing variants overlaid.
 * Self-contained with its own animation loop.
 * Shows up to 10 pixel variants using Three.js instanced rendering.
 */
export function SuperposedPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<SandboxThreeRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Filter to pixel variants only (vector variants not supported in superposed view)
  const pixelVariants = PLANT_VARIANTS.filter(
    (v) => !isVectorVariant(v) && !isWatercolorVariant(v)
  ).slice(0, MAX_SUPERPOSED_VARIANTS);
  const variantCount = pixelVariants.length;
  const baseOpacity = 0.7 / variantCount;

  // Initialize Three.js renderer
  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new SandboxThreeRenderer({
      container: containerRef.current,
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      enablePostProcessing: false,
    });
    renderer.setInstanceCount(variantCount);
    rendererRef.current = renderer;

    return () => {
      renderer.dispose();
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render all variants superposed
  const renderFrame = () => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const currentTime = currentTimeRef.current;

    renderer.setPixelMeshVisible(true);
    renderer.setVectorGroupVisible(false);
    renderer.setBackground("garden");

    for (let i = 0; i < pixelVariants.length; i++) {
      const variant = pixelVariants[i]!;
      const totalDuration = variant.keyframes.reduce((sum, kf) => sum + kf.duration, 0);
      const variantTime = variant.loop
        ? currentTime % totalDuration
        : Math.min(currentTime, totalDuration);

      const mockPlant: PlantWithLifecycle = {
        id: `superposed-${variant.id}`,
        variantId: variant.id,
        germinatedAt: new Date(Date.now() - variantTime * 1000),
        lifecycleModifier: 1.0,
        colorVariationName: null,
      };

      const state = computeLifecycleState(mockPlant, variant, new Date());
      const visual = getActiveVisual(state, variant);

      const isInterpolated = (v: GlyphKeyframe | InterpolatedKeyframe): v is InterpolatedKeyframe =>
        "t" in v;

      let palette: string[];
      if (isInterpolated(visual)) {
        palette = visual.palette;
      } else {
        palette = getEffectivePalette(visual, variant, null);
      }

      const effectiveOpacity = (visual.opacity ?? 1.0) * (baseOpacity + 0.3);
      const effectiveScale = visual.scale ?? 1.0;

      const patternId = `superposed-${variant.id}-${state.keyframeIndex}-${
        isInterpolated(visual)
          ? `interp-${Math.round((visual as InterpolatedKeyframe).t * 100)}`
          : "static"
      }`;

      renderer.updateInstance(i, {
        pattern: visual.pattern,
        patternId,
        palette,
        opacity: effectiveOpacity,
        scale: effectiveScale,
        lifecycleProgress: state.totalProgress,
      });
    }

    renderer.updateTime(performance.now() / 1000);
    renderer.render();
  };

  // Animation loop
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
      currentTimeRef.current += deltaMs / 1000;

      renderFrame();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // Initial render
  useEffect(() => {
    renderFrame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        className="rounded-lg overflow-hidden cursor-pointer"
        style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
        onClick={() => setIsPlaying(!isPlaying)}
        title={isPlaying ? "Click to pause" : "Click to play"}
      />
      <div className="text-xs text-gray-500 mt-1">
        {Math.min(PLANT_VARIANTS.length, MAX_SUPERPOSED_VARIANTS)} of {PLANT_VARIANTS.length}{" "}
        variants
      </div>
    </div>
  );
}
