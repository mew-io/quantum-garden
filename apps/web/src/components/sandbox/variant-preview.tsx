"use client";

import { useEffect, useRef, useCallback } from "react";
import { useVariantSandboxStore, type Background } from "@/stores/variant-sandbox-store";
import {
  computeLifecycleState,
  getEffectivePalette,
  getActiveVisual,
  type PlantWithLifecycle,
  type InterpolatedKeyframe,
  type GlyphKeyframe,
} from "@quantum-garden/shared";

const BACKGROUND_COLORS: Record<Background, string> = {
  white: "#ffffff",
  dark: "#1a1a1a",
  checkerboard: "#e0e0e0",
};

const GRID_SIZE = 64;

/**
 * Live preview of the variant at the current playback time.
 * Uses Canvas2D for rendering.
 */
export function VariantPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const {
    getSelectedVariant,
    selectedColorVariation,
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

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !variant) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw background
    if (background === "checkerboard") {
      const checkSize = 8;
      for (let y = 0; y < canvasSize / checkSize; y++) {
        for (let x = 0; x < canvasSize / checkSize; x++) {
          ctx.fillStyle = (x + y) % 2 === 0 ? "#cccccc" : "#ffffff";
          ctx.fillRect(x * checkSize, y * checkSize, checkSize, checkSize);
        }
      }
    } else {
      ctx.fillStyle = BACKGROUND_COLORS[background];
      ctx.fillRect(0, 0, canvasSize, canvasSize);
    }

    // Create mock plant for lifecycle computation
    const mockPlant: PlantWithLifecycle = {
      id: "preview",
      variantId: variant.id,
      germinatedAt: new Date(Date.now() - currentTime * 1000),
      lifecycleModifier: 1.0,
      colorVariationName: selectedColorVariation,
    };

    // Compute lifecycle state
    const state = computeLifecycleState(mockPlant, variant, new Date());

    // Get the active visual
    const visual = getActiveVisual(state, variant);

    // Type guard for interpolated visual
    const isInterpolated = (v: GlyphKeyframe | InterpolatedKeyframe): v is InterpolatedKeyframe =>
      "t" in v;

    // Extract pattern, opacity, scale from the visual
    const pattern = visual.pattern;
    const effectiveOpacity = visual.opacity ?? 1.0;
    const effectiveScale = visual.scale ?? 1.0;

    // Get palette
    let palette: string[];
    if (isInterpolated(visual)) {
      palette = visual.palette;
    } else {
      palette = getEffectivePalette(visual, variant, selectedColorVariation);
    }

    // Draw the glyph
    ctx.globalAlpha = effectiveOpacity;
    const pixelScale = scale * effectiveScale;
    const offset = (canvasSize - GRID_SIZE * pixelScale) / 2;

    for (let y = 0; y < GRID_SIZE; y++) {
      const row = pattern[y];
      if (!row) continue;
      for (let x = 0; x < GRID_SIZE; x++) {
        const cellValue = row[x];
        if (cellValue && cellValue > 0) {
          // Determine color based on distance from center
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
          ctx.fillRect(offset + x * pixelScale, offset + y * pixelScale, pixelScale, pixelScale);
        }
      }
    }

    ctx.globalAlpha = 1.0;

    // Draw grid overlay if enabled
    if (showGrid) {
      ctx.strokeStyle = "rgba(136, 136, 136, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let x = 0; x <= GRID_SIZE; x++) {
        ctx.moveTo(offset + x * pixelScale, offset);
        ctx.lineTo(offset + x * pixelScale, offset + GRID_SIZE * pixelScale);
      }
      for (let y = 0; y <= GRID_SIZE; y++) {
        ctx.moveTo(offset, offset + y * pixelScale);
        ctx.lineTo(offset + GRID_SIZE * pixelScale, offset + y * pixelScale);
      }
      ctx.stroke();
    }
  }, [variant, currentTime, selectedColorVariation, scale, background, showGrid, canvasSize]);

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
    render();
  }, [render]);

  if (!variant) {
    return (
      <div
        className="flex items-center justify-center bg-gray-800 rounded-lg"
        style={{ width: canvasSize, height: canvasSize }}
      >
        <span className="text-gray-500">No variant selected</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="rounded-lg overflow-hidden shadow-lg"
        style={{ width: canvasSize, height: canvasSize }}
      >
        <canvas ref={canvasRef} />
      </div>
      <div className="text-center">
        <span className="text-sm text-gray-400">
          {
            computeLifecycleState(
              {
                id: "preview",
                variantId: variant.id,
                germinatedAt: new Date(Date.now() - currentTime * 1000),
                lifecycleModifier: 1.0,
                colorVariationName: selectedColorVariation,
              },
              variant,
              new Date()
            ).currentKeyframe.name
          }
        </span>
      </div>
    </div>
  );
}
