"use client";

import { useVariantSandboxStore } from "@/stores/variant-sandbox-store";
import {
  CANVAS,
  isVectorVariant,
  getEffectiveKeyframes,
  type VectorKeyframe,
  type GlyphKeyframe,
} from "@quantum-garden/shared";
import { MiniGlyph } from "./mini-glyph";
import { VectorMiniGlyph } from "./vector-mini-glyph";

/**
 * Timeline view showing keyframes as horizontal blocks with sprite previews.
 * Width of each block is proportional to its duration.
 * Click a keyframe to select it for editing.
 * Supports both pixel and vector variants.
 */
export function VariantTimeline() {
  const {
    getSelectedVariant,
    selectedKeyframeIndex,
    selectedColorVariation,
    currentTime,
    isPlaying,
    seekToKeyframe,
    selectKeyframe,
    getTotalDuration,
  } = useVariantSandboxStore();

  const variant = getSelectedVariant();
  if (!variant) {
    return (
      <div className="p-4 text-gray-500 text-center">Select a variant to view its timeline</div>
    );
  }

  const totalDuration = getTotalDuration();
  const isVector = isVectorVariant(variant);
  const effectiveKeyframes = getEffectiveKeyframes(variant);

  // Calculate cumulative times for positioning
  let cumulativeTime = 0;
  const keyframeTimes = effectiveKeyframes.map((kf) => {
    const startTime = cumulativeTime;
    cumulativeTime += kf.duration;
    return { startTime, endTime: cumulativeTime };
  });

  // Find current keyframe based on playback time
  const currentKeyframeIndex = keyframeTimes.findIndex(
    (kt) => currentTime >= kt.startTime && currentTime < kt.endTime
  );

  // Playhead position as percentage
  const playheadPosition = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  // Get the actual keyframe data (pixel or vector)
  const getPixelKeyframe = (index: number): GlyphKeyframe | null => {
    if (isVector) return null;
    return variant.keyframes[index] ?? null;
  };

  const getVectorKeyframe = (index: number): VectorKeyframe | null => {
    if (!isVector) return null;
    return variant.vectorKeyframes?.[index] ?? null;
  };

  // Get effective pixel keyframe with color variation applied
  const getKeyframeWithColors = (keyframe: GlyphKeyframe): GlyphKeyframe => {
    if (!selectedColorVariation || !variant.colorVariations) {
      return keyframe;
    }
    const variation = variant.colorVariations.find((v) => v.name === selectedColorVariation);
    if (!variation) return keyframe;

    const overridePalette = variation.palettes[keyframe.name];
    if (!overridePalette) return keyframe;

    return { ...keyframe, palette: overridePalette };
  };

  return (
    <div
      className="rounded-lg p-4 border border-gray-200"
      style={{ backgroundColor: CANVAS.BACKGROUND_COLOR }}
    >
      {/* Timeline header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-600 font-medium">Timeline</span>
        <span className="text-xs text-gray-600">
          {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
        </span>
      </div>

      {/* Timeline track - scrollable on small screens */}
      <div className="relative overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {/* Keyframe blocks */}
        <div className="flex h-24 rounded overflow-hidden min-w-fit">
          {effectiveKeyframes.map((kf, index) => {
            const widthPercent = (kf.duration / totalDuration) * 100;
            const isSelected = selectedKeyframeIndex === index;
            const isCurrent = currentKeyframeIndex === index;

            // Get preview color and keyframe data based on variant type
            let previewColor = "#666";
            const pixelKf = getPixelKeyframe(index);
            const vectorKf = getVectorKeyframe(index);

            if (pixelKf) {
              const keyframeWithColors = getKeyframeWithColors(pixelKf);
              previewColor =
                keyframeWithColors.palette[1] || keyframeWithColors.palette[0] || "#666";
            } else if (vectorKf) {
              previewColor = vectorKf.strokeColor;
            }

            return (
              <button
                key={index}
                onClick={() => {
                  selectKeyframe(index);
                  seekToKeyframe(index);
                }}
                className={`
                  relative flex flex-col items-center justify-center gap-1 py-2
                  border-r border-gray-300 last:border-r-0
                  transition-all duration-150
                  ${isSelected ? "ring-2 ring-blue-500 ring-inset z-10" : ""}
                  ${isCurrent && isPlaying ? "ring-2 ring-green-500 ring-inset" : ""}
                  hover:brightness-110 cursor-pointer
                `}
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: `${previewColor}22`, // 13% opacity version
                  minWidth: "48px", // Reduced for mobile, scrollable if needed
                }}
                title={`${kf.name} (${kf.duration}s)`}
              >
                {/* Mini sprite preview */}
                <div className="rounded p-1" style={{ backgroundColor: CANVAS.BACKGROUND_COLOR }}>
                  {isVector && vectorKf ? (
                    <VectorMiniGlyph keyframe={vectorKf} size={40} />
                  ) : pixelKf ? (
                    <MiniGlyph keyframe={getKeyframeWithColors(pixelKf)} size={40} />
                  ) : null}
                </div>

                {/* Keyframe name and duration */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-medium text-gray-800 truncate px-1 max-w-full">
                    {kf.name}
                  </span>
                  <span className="text-[9px] text-gray-600">{kf.duration}s</span>
                </div>

                {/* Color preview bar */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ backgroundColor: previewColor }}
                />
              </button>
            );
          })}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 w-0.5 h-full bg-gray-800 shadow-lg pointer-events-none transition-all duration-100"
          style={{ left: `${playheadPosition}%` }}
        >
          {/* Playhead handle */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full" />
        </div>
      </div>

      {/* Loop indicator */}
      {variant.loop && (
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Looping</span>
        </div>
      )}

      {/* Tween indicator */}
      {variant.tweenBetweenKeyframes && (
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
          <span>Tweening enabled</span>
        </div>
      )}
    </div>
  );
}
