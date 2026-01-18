"use client";

import { useVariantSandboxStore } from "@/stores/variant-sandbox-store";
import { MiniGlyph } from "./mini-glyph";

/**
 * Timeline view showing keyframes as horizontal blocks with sprite previews.
 * Width of each block is proportional to its duration.
 * Click a keyframe to select it for editing.
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
  const keyframes = variant.keyframes;

  // Calculate cumulative times for positioning
  let cumulativeTime = 0;
  const keyframeTimes = keyframes.map((kf) => {
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

  // Get effective keyframe with color variation applied
  const getKeyframeWithColors = (keyframe: (typeof keyframes)[0]) => {
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
    <div className="bg-gray-900 rounded-lg p-4">
      {/* Timeline header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 font-medium">Timeline</span>
        <span className="text-xs text-gray-500">
          {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
        </span>
      </div>

      {/* Timeline track - scrollable on small screens */}
      <div className="relative overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {/* Keyframe blocks */}
        <div className="flex h-24 rounded overflow-hidden min-w-fit">
          {keyframes.map((keyframe, index) => {
            const widthPercent = (keyframe.duration / totalDuration) * 100;
            const isSelected = selectedKeyframeIndex === index;
            const isCurrent = currentKeyframeIndex === index;
            const keyframeWithColors = getKeyframeWithColors(keyframe);

            // Get a color from the keyframe palette for visual feedback
            const previewColor =
              keyframeWithColors.palette[1] || keyframeWithColors.palette[0] || "#666";

            return (
              <button
                key={index}
                onClick={() => {
                  selectKeyframe(index);
                  seekToKeyframe(index);
                }}
                className={`
                  relative flex flex-col items-center justify-center gap-1 py-2
                  border-r border-gray-800 last:border-r-0
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
                title={`${keyframe.name} (${keyframe.duration}s)`}
              >
                {/* Mini sprite preview */}
                <div className="bg-gray-950 rounded p-1">
                  <MiniGlyph keyframe={keyframeWithColors} size={40} />
                </div>

                {/* Keyframe name and duration */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-medium text-white truncate px-1 max-w-full">
                    {keyframe.name}
                  </span>
                  <span className="text-[9px] text-gray-500">{keyframe.duration}s</span>
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
          className="absolute top-0 w-0.5 h-full bg-white shadow-lg pointer-events-none transition-all duration-100"
          style={{ left: `${playheadPosition}%` }}
        >
          {/* Playhead handle */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
        </div>
      </div>

      {/* Loop indicator */}
      {variant.loop && (
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
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
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
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
