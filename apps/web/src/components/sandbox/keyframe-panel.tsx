"use client";

import { useVariantSandboxStore } from "@/stores/variant-sandbox-store";
import { getEffectivePalette } from "@quantum-garden/shared";

/**
 * Panel showing details of the currently selected keyframe.
 * Displays pattern, palette, duration, and other properties.
 * Future: Will support editing keyframe properties.
 */
export function KeyframePanel() {
  const { getSelectedVariant, selectedKeyframeIndex, selectedColorVariation, selectKeyframe } =
    useVariantSandboxStore();

  const variant = getSelectedVariant();

  if (!variant) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg text-gray-500 text-center">
        Select a variant to view keyframe details
      </div>
    );
  }

  const keyframe = selectedKeyframeIndex !== null ? variant.keyframes[selectedKeyframeIndex] : null;

  if (!keyframe) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400 text-sm mb-3">
          Click a keyframe in the timeline to view its details
        </p>
        <div className="grid grid-cols-2 gap-2">
          {variant.keyframes.map((kf, index) => (
            <button
              key={index}
              onClick={() => selectKeyframe(index)}
              className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-left transition-colors"
            >
              <span className="text-sm font-medium text-white">{kf.name}</span>
              <span className="text-xs text-gray-400 ml-2">{kf.duration}s</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Get effective palette considering color variation
  const effectivePalette = selectedColorVariation
    ? getEffectivePalette(keyframe, variant, selectedColorVariation)
    : keyframe.palette;

  return (
    <div className="p-4 bg-gray-800 rounded-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{keyframe.name}</h3>
        <button onClick={() => selectKeyframe(null)} className="text-gray-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Properties */}
      <div className="space-y-3">
        {/* Duration */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Duration</label>
          <p className="text-white font-mono">{keyframe.duration}s</p>
        </div>

        {/* Opacity (if not 1.0) */}
        {keyframe.opacity !== undefined && keyframe.opacity !== 1.0 && (
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Opacity</label>
            <p className="text-white font-mono">{keyframe.opacity}</p>
          </div>
        )}

        {/* Scale (if not 1.0) */}
        {keyframe.scale !== undefined && keyframe.scale !== 1.0 && (
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Scale</label>
            <p className="text-white font-mono">{keyframe.scale}x</p>
          </div>
        )}

        {/* Palette */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">
            Palette
            {selectedColorVariation && (
              <span className="ml-1 text-blue-400">({selectedColorVariation})</span>
            )}
          </label>
          <div className="flex gap-1 mt-1">
            {effectivePalette.map((color, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded border border-gray-600"
                  style={{ backgroundColor: color }}
                  title={color}
                />
                <span className="text-[10px] text-gray-500 font-mono">{color}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pattern preview (text representation) */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Pattern</label>
          <div className="mt-1 font-mono text-[8px] leading-none bg-gray-900 p-2 rounded overflow-auto">
            {keyframe.pattern.map((row, y) => (
              <div key={y} className="whitespace-pre">
                {row.map((cell) => (cell === 0 ? "·" : "█")).join("")}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      {selectedKeyframeIndex !== null && (
        <div className="flex gap-2 pt-2 border-t border-gray-700">
          <button
            onClick={() => selectKeyframe(Math.max(0, selectedKeyframeIndex - 1))}
            disabled={selectedKeyframeIndex === 0}
            className="flex-1 px-3 py-1.5 text-sm rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            onClick={() =>
              selectKeyframe(Math.min(variant.keyframes.length - 1, selectedKeyframeIndex + 1))
            }
            disabled={selectedKeyframeIndex === variant.keyframes.length - 1}
            className="flex-1 px-3 py-1.5 text-sm rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
