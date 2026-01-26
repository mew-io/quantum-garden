"use client";

import { useEffect, useRef, useCallback } from "react";
import { useVariantSandboxStore, type Background } from "@/stores/variant-sandbox-store";
import {
  computeLifecycleState,
  getEffectivePalette,
  getActiveVisual,
  isVectorVariant,
  getActiveVectorVisual,
  getVectorKeyframe,
  type PlantWithLifecycle,
  type InterpolatedKeyframe,
  type GlyphKeyframe,
  type VectorKeyframe,
  type VectorPrimitive,
  type InterpolatedVectorKeyframe,
} from "@quantum-garden/shared";

const BACKGROUND_COLORS: Record<Background, string> = {
  white: "#ffffff",
  dark: "#1a1a1a",
  checkerboard: "#e0e0e0",
};

const GRID_SIZE = 64;

/**
 * Render a vector keyframe (or interpolated vector keyframe) to a Canvas2D context.
 */
function renderVectorKeyframe(
  ctx: CanvasRenderingContext2D,
  keyframe: VectorKeyframe | InterpolatedVectorKeyframe,
  canvasSize: number,
  displayScale: number
): void {
  const { primitives, strokeColor, strokeOpacity, scale: keyframeScale = 1.0 } = keyframe;

  // Calculate offset to center the 64x64 coordinate space in the canvas
  const effectiveScale = displayScale * keyframeScale;
  const offset = (canvasSize - GRID_SIZE * effectiveScale) / 2;

  ctx.save();
  ctx.translate(offset, offset);
  ctx.scale(effectiveScale, effectiveScale);

  ctx.strokeStyle = strokeColor;
  ctx.globalAlpha = strokeOpacity;
  ctx.lineWidth = 1 / effectiveScale; // Keep consistent line width regardless of scale

  for (const primitive of primitives) {
    renderPrimitive(ctx, primitive);
  }

  ctx.restore();
}

/**
 * Render a single vector primitive to a Canvas2D context.
 */
function renderPrimitive(ctx: CanvasRenderingContext2D, primitive: VectorPrimitive): void {
  ctx.beginPath();

  switch (primitive.type) {
    case "circle":
      ctx.arc(primitive.cx, primitive.cy, primitive.radius, 0, Math.PI * 2);
      break;

    case "line":
      ctx.moveTo(primitive.x1, primitive.y1);
      ctx.lineTo(primitive.x2, primitive.y2);
      break;

    case "polygon": {
      const { cx, cy, sides, radius, rotation = 0 } = primitive;
      const rotRad = (rotation * Math.PI) / 180;

      for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + rotRad - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      break;
    }

    case "star": {
      const { cx, cy, points, outerRadius, innerRadius, rotation = 0 } = primitive;
      const rotRad = (rotation * Math.PI) / 180;
      const totalPoints = points * 2;

      for (let i = 0; i <= totalPoints; i++) {
        const angle = (i / totalPoints) * Math.PI * 2 + rotRad - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      break;
    }

    case "diamond": {
      const { cx, cy, width, height } = primitive;
      const halfW = width / 2;
      const halfH = height / 2;

      ctx.moveTo(cx, cy - halfH); // Top
      ctx.lineTo(cx + halfW, cy); // Right
      ctx.lineTo(cx, cy + halfH); // Bottom
      ctx.lineTo(cx - halfW, cy); // Left
      ctx.closePath();
      break;
    }
  }

  ctx.stroke();
}

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

    // Grid drawing needs these values regardless of render mode
    const gridScale = scale;
    const gridOffset = (canvasSize - GRID_SIZE * gridScale) / 2;

    // Check if this is a vector variant
    if (isVectorVariant(variant)) {
      // Render vector variant with tweening support
      const vectorVisual = getActiveVectorVisual(state, variant);
      renderVectorKeyframe(ctx, vectorVisual, canvasSize, scale);
    } else {
      // Render pixel variant
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
    }

    // Draw grid overlay if enabled
    if (showGrid) {
      ctx.strokeStyle = "rgba(136, 136, 136, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let x = 0; x <= GRID_SIZE; x++) {
        ctx.moveTo(gridOffset + x * gridScale, gridOffset);
        ctx.lineTo(gridOffset + x * gridScale, gridOffset + GRID_SIZE * gridScale);
      }
      for (let y = 0; y <= GRID_SIZE; y++) {
        ctx.moveTo(gridOffset, gridOffset + y * gridScale);
        ctx.lineTo(gridOffset + GRID_SIZE * gridScale, gridOffset + y * gridScale);
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
            // For vector variants, get name from vectorKeyframes
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
