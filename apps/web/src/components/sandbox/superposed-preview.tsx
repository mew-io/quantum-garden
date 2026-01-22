"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Application, Graphics } from "pixi.js";
import {
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
 */
export function SuperposedPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(0);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  // Initialize PixiJS
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const app = new Application();
    let mounted = true;

    const initApp = async () => {
      try {
        await app.init({
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          backgroundColor: 0x1a1a1a,
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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, []);

  // Render all variants superposed
  const render = useCallback(() => {
    if (!appRef.current) return;

    const app = appRef.current;
    app.stage.removeChildren();

    // Draw background
    const bg = new Graphics();
    bg.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    bg.fill(0x1a1a1a);
    app.stage.addChild(bg);

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

      const glyphGraphics = new Graphics();
      glyphGraphics.alpha = effectiveOpacity * (baseOpacity + 0.3);

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

            glyphGraphics.rect(
              offset + x * scaledPixelSize,
              offset + y * scaledPixelSize,
              scaledPixelSize,
              scaledPixelSize
            );
            glyphGraphics.fill(hexToNumber(color));
          }
        }
      }

      app.stage.addChild(glyphGraphics);
    }
  }, []);

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
  }, [isPlaying, render, isReady]);

  // Initial render
  useEffect(() => {
    if (isReady) {
      render();
    }
  }, [render, isReady]);

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

function hexToNumber(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}
