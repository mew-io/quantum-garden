"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Application, Graphics } from "pixi.js";
import {
  PLANT_VARIANTS,
  computeLifecycleState,
  getEffectivePalette,
  interpolateKeyframes,
  type PlantWithLifecycle,
} from "@quantum-garden/shared";
import { useVariantSandboxStore, type Background } from "@/stores/variant-sandbox-store";

const BACKGROUND_COLORS: Record<Background, number> = {
  white: 0xffffff,
  dark: 0x1a1a1a,
  checkerboard: 0xe0e0e0,
};

const GRID_SIZE = 8;

/**
 * Superposed view showing all variants overlaid.
 * Creates a "quantum superposition" effect where all variants are visible simultaneously.
 * Each variant is rendered with reduced opacity so they blend together.
 */
export function SuperposedView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(0);
  const [isReady, setIsReady] = useState(false);

  const { isPlaying, playbackSpeed, scale, background, showGrid, goToGallery, openVariantDetail } =
    useVariantSandboxStore();

  const canvasSize = GRID_SIZE * scale + 32;

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

  // Render all variants superposed
  const render = useCallback(() => {
    if (!appRef.current) return;

    const app = appRef.current;
    app.stage.removeChildren();
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

    const currentTime = currentTimeRef.current;
    const variantCount = PLANT_VARIANTS.length;
    const baseOpacity = 0.7 / variantCount; // Base opacity distributed among variants

    // Render each variant
    for (const variant of PLANT_VARIANTS) {
      // Calculate time for this variant (loop around its duration)
      const totalDuration = variant.keyframes.reduce((sum, kf) => sum + kf.duration, 0);
      const variantTime = variant.loop
        ? currentTime % totalDuration
        : Math.min(currentTime, totalDuration);

      // Create mock plant
      const mockPlant: PlantWithLifecycle = {
        id: `superposed-${variant.id}`,
        variantId: variant.id,
        germinatedAt: new Date(Date.now() - variantTime * 1000),
        lifecycleModifier: 1.0,
        colorVariationName: null,
      };

      // Compute lifecycle state
      const state = computeLifecycleState(mockPlant, variant, new Date());
      const keyframe = state.currentKeyframe;
      const palette = getEffectivePalette(keyframe, variant, null);

      // Interpolate if tweening is enabled
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

      // Draw variant with reduced opacity for superposition effect
      const glyphGraphics = new Graphics();
      glyphGraphics.alpha = effectiveOpacity * (baseOpacity + 0.3);

      const pixelScale = scale * effectiveScale;
      const offset = (canvasSize - GRID_SIZE * pixelScale) / 2;

      for (let y = 0; y < GRID_SIZE; y++) {
        const row = pattern[y];
        if (!row) continue;
        for (let x = 0; x < GRID_SIZE; x++) {
          const cellValue = row[x];
          if (cellValue && cellValue > 0) {
            const colorIndex = Math.min(cellValue - 1, palette.length - 1);
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
    }

    // Draw grid overlay if enabled
    if (showGrid) {
      const gridGraphics = new Graphics();
      gridGraphics.setStrokeStyle({ width: 1, color: 0x888888, alpha: 0.5 });
      const offset = (canvasSize - GRID_SIZE * scale) / 2;

      for (let x = 0; x <= GRID_SIZE; x++) {
        gridGraphics.moveTo(offset + x * scale, offset);
        gridGraphics.lineTo(offset + x * scale, offset + GRID_SIZE * scale);
      }
      for (let y = 0; y <= GRID_SIZE; y++) {
        gridGraphics.moveTo(offset, offset + y * scale);
        gridGraphics.lineTo(offset + GRID_SIZE * scale, offset + y * scale);
      }
      gridGraphics.stroke();
      app.stage.addChild(gridGraphics);
    }
  }, [scale, background, showGrid, canvasSize]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !isReady) {
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
  }, [isPlaying, playbackSpeed, render, isReady]);

  // Render when state changes (only after app is ready)
  useEffect(() => {
    if (isReady) {
      render();
    }
  }, [render, isReady]);

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Main preview area */}
        <div className="flex flex-col items-center gap-6">
          <div className="bg-gray-900 rounded-xl p-8">
            <div
              ref={containerRef}
              className="rounded-lg overflow-hidden shadow-2xl"
              style={{ width: canvasSize, height: canvasSize }}
            />
          </div>

          {/* Superposition info */}
          <div className="text-center text-gray-400 text-sm">
            Showing {PLANT_VARIANTS.length} variants in quantum superposition
          </div>

          {/* Variant list with click to isolate */}
          <div className="w-full max-w-2xl">
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              Click a variant to view in detail
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {PLANT_VARIANTS.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => openVariantDetail(variant.id)}
                  className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all text-left group"
                >
                  <div className="font-medium text-gray-800 group-hover:text-blue-600">
                    {variant.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {variant.keyframes.length} keyframes
                    {variant.loop && " • loops"}
                  </div>
                  {/* Color palette preview */}
                  <div className="flex gap-0.5 mt-2">
                    {variant.keyframes[0]?.palette.slice(0, 3).map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-sm border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <button
            onClick={goToGallery}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Gallery
          </button>
        </div>
      </div>
    </div>
  );
}

function hexToNumber(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}
