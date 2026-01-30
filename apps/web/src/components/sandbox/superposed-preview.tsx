"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  CANVAS,
  PLANT_VARIANTS,
  computeLifecycleState,
  getEffectivePalette,
  getActiveVisual,
  type PlantWithLifecycle,
  type InterpolatedKeyframe,
  type GlyphKeyframe,
} from "@quantum-garden/shared";

const GRID_SIZE = 64;
const CANVAS_SIZE = 128;
const MAX_SUPERPOSED_VARIANTS = 10; // Limit for performance

/**
 * Compact superposed preview showing variants overlaid.
 * Self-contained with its own animation loop.
 * Shows up to 10 variants to maintain performance.
 * Uses Canvas2D for rendering.
 */
export function SuperposedPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Render all variants superposed
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    canvas.style.width = `${CANVAS_SIZE}px`;
    canvas.style.height = `${CANVAS_SIZE}px`;
    ctx.scale(dpr, dpr);

    // Draw background (garden color to match actual display)
    ctx.fillStyle = CANVAS.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const currentTime = currentTimeRef.current;

    // Limit variants for performance
    const variantsToRender = PLANT_VARIANTS.slice(0, MAX_SUPERPOSED_VARIANTS);
    const variantCount = variantsToRender.length;
    const baseOpacity = 0.7 / variantCount;

    const pixelScale = CANVAS_SIZE / GRID_SIZE;

    // Type guard
    const isInterpolated = (v: GlyphKeyframe | InterpolatedKeyframe): v is InterpolatedKeyframe =>
      "t" in v;

    // Render each variant
    for (const variant of variantsToRender) {
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

      const pattern = visual.pattern;
      const effectiveOpacity = visual.opacity ?? 1.0;
      const effectiveScale = visual.scale ?? 1.0;

      let palette: string[];
      if (isInterpolated(visual)) {
        palette = visual.palette;
      } else {
        palette = getEffectivePalette(visual, variant, null);
      }

      ctx.globalAlpha = effectiveOpacity * (baseOpacity + 0.3);

      const scaledPixelSize = pixelScale * effectiveScale;
      const offset = (CANVAS_SIZE - GRID_SIZE * scaledPixelSize) / 2;

      for (let y = 0; y < GRID_SIZE; y++) {
        const row = pattern[y];
        if (!row) continue;
        for (let x = 0; x < GRID_SIZE; x++) {
          const cellValue = row[x];
          if (cellValue && cellValue > 0) {
            const distFromCenter = Math.sqrt(
              Math.pow(x - GRID_SIZE / 2, 2) + Math.pow(y - GRID_SIZE / 2, 2)
            );
            const maxDist = Math.sqrt(2) * (GRID_SIZE / 2);
            const colorIndex = Math.min(
              palette.length - 1,
              Math.floor((distFromCenter / maxDist) * palette.length)
            );
            const color = palette[colorIndex] || palette[0] || "#888888";

            ctx.fillStyle = color;
            ctx.fillRect(
              offset + x * scaledPixelSize,
              offset + y * scaledPixelSize,
              scaledPixelSize,
              scaledPixelSize
            );
          }
        }
      }
    }

    ctx.globalAlpha = 1.0;
  }, []);

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

      const deltaSeconds = deltaMs / 1000;
      currentTimeRef.current += deltaSeconds;

      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, render]);

  // Initial render
  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="flex flex-col items-center">
      <div
        className="rounded-lg overflow-hidden cursor-pointer"
        style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
        onClick={() => setIsPlaying(!isPlaying)}
        title={isPlaying ? "Click to pause" : "Click to play"}
      >
        <canvas ref={canvasRef} />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {Math.min(PLANT_VARIANTS.length, MAX_SUPERPOSED_VARIANTS)} of {PLANT_VARIANTS.length}{" "}
        variants
      </div>
    </div>
  );
}
