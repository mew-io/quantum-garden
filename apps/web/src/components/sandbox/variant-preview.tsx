"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Application, Graphics } from "pixi.js";
import { useVariantSandboxStore, type Background } from "@/stores/variant-sandbox-store";
import {
  computeLifecycleState,
  getEffectivePalette,
  interpolateKeyframes,
  type PlantWithLifecycle,
} from "@quantum-garden/shared";

const BACKGROUND_COLORS: Record<Background, number> = {
  white: 0xffffff,
  dark: 0x1a1a1a,
  checkerboard: 0xe0e0e0,
};

const GRID_SIZE = 64;

/**
 * Live preview of the variant at the current playback time.
 * Uses PixiJS for rendering and updates during playback.
 */
export function VariantPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const [isReady, setIsReady] = useState(false);

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
  const canvasSize = GRID_SIZE * scale + 32; // Add padding

  // Initialize PixiJS
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const app = new Application();
    let mounted = true;

    const initApp = async () => {
      try {
        await app.init({
          width: canvasSize,
          height: canvasSize,
          backgroundColor: BACKGROUND_COLORS[background],
          antialias: false,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        if (!mounted) {
          app.destroy(true);
          return;
        }

        container.appendChild(app.canvas);
        appRef.current = app;
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize PixiJS:", error);
      }
    };

    initApp();

    return () => {
      mounted = false;
      setIsReady(false);
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render function
  const render = useCallback(() => {
    if (!appRef.current || !variant) return;

    const app = appRef.current;
    app.stage.removeChildren();

    // Resize if needed
    app.renderer.resize(canvasSize, canvasSize);

    // Draw background
    const bg = new Graphics();
    if (background === "checkerboard") {
      const checkSize = 8;
      for (let y = 0; y < canvasSize / checkSize; y++) {
        for (let x = 0; x < canvasSize / checkSize; x++) {
          if ((x + y) % 2 === 0) {
            bg.rect(x * checkSize, y * checkSize, checkSize, checkSize);
            bg.fill(0xcccccc);
          } else {
            bg.rect(x * checkSize, y * checkSize, checkSize, checkSize);
            bg.fill(0xffffff);
          }
        }
      }
    } else {
      bg.rect(0, 0, canvasSize, canvasSize);
      bg.fill(BACKGROUND_COLORS[background]);
    }
    app.stage.addChild(bg);

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
    const keyframe = state.currentKeyframe;

    // Get effective palette (considering color variations)
    const palette = getEffectivePalette(keyframe, variant, selectedColorVariation);

    // Interpolate if tweening is enabled and we have a next keyframe
    let pattern = keyframe.pattern;
    let effectiveOpacity = keyframe.opacity ?? 1.0;
    let effectiveScale = keyframe.scale ?? 1.0;

    if (variant.tweenBetweenKeyframes && state.nextKeyframe) {
      const interpolated = interpolateKeyframes(
        keyframe,
        state.nextKeyframe,
        state.keyframeProgress
      );
      pattern = interpolated.pattern;
      effectiveOpacity = interpolated.opacity ?? effectiveOpacity;
      effectiveScale = interpolated.scale ?? effectiveScale;
    }

    // Draw the glyph
    const glyphGraphics = new Graphics();
    glyphGraphics.alpha = effectiveOpacity;

    const pixelScale = scale * effectiveScale;
    const offset = (canvasSize - GRID_SIZE * pixelScale) / 2;

    for (let y = 0; y < GRID_SIZE; y++) {
      const row = pattern[y];
      if (!row) continue;
      for (let x = 0; x < GRID_SIZE; x++) {
        const cellValue = row[x];
        if (cellValue && cellValue > 0) {
          // Determine color based on distance from center (gradient effect)
          // This matches the rendering in plant-sprite.ts
          const distFromCenter = Math.sqrt(
            Math.pow(x - GRID_SIZE / 2, 2) + Math.pow(y - GRID_SIZE / 2, 2)
          );
          const maxDist = Math.sqrt(2) * (GRID_SIZE / 2);
          const colorIndex = Math.min(
            palette.length - 1,
            Math.floor((distFromCenter / maxDist) * palette.length)
          );
          const color = palette[colorIndex] || palette[0] || "#888888";

          glyphGraphics.rect(
            offset + x * pixelScale,
            offset + y * pixelScale,
            pixelScale,
            pixelScale
          );
          glyphGraphics.fill(hexToNumber(color));
        }
      }
    }

    app.stage.addChild(glyphGraphics);

    // Draw grid overlay if enabled
    if (showGrid) {
      const gridGraphics = new Graphics();
      gridGraphics.setStrokeStyle({ width: 1, color: 0x888888, alpha: 0.5 });

      for (let x = 0; x <= GRID_SIZE; x++) {
        gridGraphics.moveTo(offset + x * pixelScale, offset);
        gridGraphics.lineTo(offset + x * pixelScale, offset + GRID_SIZE * pixelScale);
      }
      for (let y = 0; y <= GRID_SIZE; y++) {
        gridGraphics.moveTo(offset, offset + y * pixelScale);
        gridGraphics.lineTo(offset + GRID_SIZE * pixelScale, offset + y * pixelScale);
      }
      gridGraphics.stroke();
      app.stage.addChild(gridGraphics);
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

      // Update current time based on playback speed
      const deltaSeconds = (deltaMs / 1000) * playbackSpeed;
      const totalDuration = getTotalDuration();
      const newTime = currentTime + deltaSeconds;

      if (variant?.loop) {
        setCurrentTime(newTime % totalDuration);
      } else if (newTime < totalDuration) {
        setCurrentTime(newTime);
      } else {
        setCurrentTime(totalDuration);
        // Stop playback when reaching the end
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

  // Render when state changes (only after app is ready)
  useEffect(() => {
    if (isReady) {
      render();
    }
  }, [render, isReady]);

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
        ref={containerRef}
        className="rounded-lg overflow-hidden shadow-lg"
        style={{ width: canvasSize, height: canvasSize }}
      />
      {/* Current keyframe info */}
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

function hexToNumber(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}
