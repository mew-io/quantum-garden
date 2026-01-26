"use client";

import { useVariantSandboxStore } from "@/stores/variant-sandbox-store";
import {
  getEffectivePalette,
  isVectorVariant,
  getKeyframeCount,
  type GlyphKeyframe,
  type VectorKeyframe,
} from "@quantum-garden/shared";

/**
 * Panel showing details of the currently selected keyframe.
 * Displays pattern, palette, duration, and other properties.
 * Supports both pixel and vector keyframes.
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

  const isVector = isVectorVariant(variant);
  const keyframeCount = getKeyframeCount(variant);

  // Get keyframe based on variant type
  const pixelKeyframe =
    !isVector && selectedKeyframeIndex !== null ? variant.keyframes[selectedKeyframeIndex] : null;
  const vectorKeyframe =
    isVector && selectedKeyframeIndex !== null
      ? variant.vectorKeyframes?.[selectedKeyframeIndex]
      : null;

  const hasKeyframe = pixelKeyframe || vectorKeyframe;

  if (!hasKeyframe) {
    // Get keyframes for the button grid
    const keyframeButtons = isVector
      ? (variant.vectorKeyframes?.map((kf, index) => ({
          name: kf.name,
          duration: kf.duration,
          index,
        })) ?? [])
      : variant.keyframes.map((kf, index) => ({ name: kf.name, duration: kf.duration, index }));

    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400 text-sm mb-3">
          Click a keyframe in the timeline to view its details
        </p>
        <div className="grid grid-cols-2 gap-2">
          {keyframeButtons.map(({ name, duration, index }) => (
            <button
              key={index}
              onClick={() => selectKeyframe(index)}
              className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-left transition-colors"
            >
              <span className="text-sm font-medium text-white">{name}</span>
              <span className="text-xs text-gray-400 ml-2">{duration}s</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Render vector keyframe details
  if (isVector && vectorKeyframe) {
    return (
      <VectorKeyframeDetails
        keyframe={vectorKeyframe}
        keyframeIndex={selectedKeyframeIndex!}
        keyframeCount={keyframeCount}
        selectKeyframe={selectKeyframe}
      />
    );
  }

  // Render pixel keyframe details
  if (pixelKeyframe) {
    return (
      <PixelKeyframeDetails
        keyframe={pixelKeyframe}
        keyframeIndex={selectedKeyframeIndex!}
        keyframeCount={keyframeCount}
        selectedColorVariation={selectedColorVariation}
        variant={variant}
        selectKeyframe={selectKeyframe}
      />
    );
  }

  return null;
}

/**
 * Details panel for vector keyframes
 */
function VectorKeyframeDetails({
  keyframe,
  keyframeIndex,
  keyframeCount,
  selectKeyframe,
}: {
  keyframe: VectorKeyframe;
  keyframeIndex: number;
  keyframeCount: number;
  selectKeyframe: (index: number | null) => void;
}) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">{keyframe.name}</h3>
          <span className="text-xs bg-cyan-900 text-cyan-300 px-1.5 py-0.5 rounded">Vector</span>
        </div>
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

        {/* Stroke Color */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Stroke Color</label>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-8 h-8 rounded border border-gray-600"
              style={{ backgroundColor: keyframe.strokeColor }}
            />
            <span className="text-white font-mono">{keyframe.strokeColor}</span>
          </div>
        </div>

        {/* Stroke Opacity */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Stroke Opacity</label>
          <p className="text-white font-mono">{keyframe.strokeOpacity}</p>
        </div>

        {/* Scale (if not 1.0) */}
        {keyframe.scale !== undefined && keyframe.scale !== 1.0 && (
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Scale</label>
            <p className="text-white font-mono">{keyframe.scale}x</p>
          </div>
        )}

        {/* Primitives */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">
            Primitives ({keyframe.primitives.length})
          </label>
          <div className="mt-1 space-y-1 max-h-32 overflow-auto">
            {keyframe.primitives.map((primitive, i) => (
              <div
                key={i}
                className="text-xs text-gray-300 font-mono bg-gray-900 px-2 py-1 rounded"
              >
                {primitive.type}
                {primitive.type === "circle" && ` r=${primitive.radius}`}
                {primitive.type === "polygon" && ` ${primitive.sides}-sided`}
                {primitive.type === "star" && ` ${primitive.points}-pointed`}
                {primitive.type === "diamond" && ` ${primitive.width}×${primitive.height}`}
                {primitive.type === "line" &&
                  ` (${primitive.x1},${primitive.y1})→(${primitive.x2},${primitive.y2})`}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 pt-2 border-t border-gray-700">
        <button
          onClick={() => selectKeyframe(Math.max(0, keyframeIndex - 1))}
          disabled={keyframeIndex === 0}
          className="flex-1 px-3 py-1.5 text-sm rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <button
          onClick={() => selectKeyframe(Math.min(keyframeCount - 1, keyframeIndex + 1))}
          disabled={keyframeIndex === keyframeCount - 1}
          className="flex-1 px-3 py-1.5 text-sm rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

/**
 * Details panel for pixel keyframes
 */
function PixelKeyframeDetails({
  keyframe,
  keyframeIndex,
  keyframeCount,
  selectedColorVariation,
  variant,
  selectKeyframe,
}: {
  keyframe: GlyphKeyframe;
  keyframeIndex: number;
  keyframeCount: number;
  selectedColorVariation: string | null;
  variant: { colorVariations?: Array<{ name: string; palettes: Record<string, string[]> }> };
  selectKeyframe: (index: number | null) => void;
}) {
  // Get effective palette considering color variation
  const effectivePalette = selectedColorVariation
    ? getEffectivePalette(
        keyframe,
        variant as Parameters<typeof getEffectivePalette>[1],
        selectedColorVariation
      )
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
          <div className="mt-1 font-mono text-[8px] leading-none bg-gray-900 p-2 rounded overflow-auto max-h-32">
            {keyframe.pattern.map((row, y) => (
              <div key={y} className="whitespace-pre">
                {row.map((cell) => (cell === 0 ? "·" : "█")).join("")}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 pt-2 border-t border-gray-700">
        <button
          onClick={() => selectKeyframe(Math.max(0, keyframeIndex - 1))}
          disabled={keyframeIndex === 0}
          className="flex-1 px-3 py-1.5 text-sm rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <button
          onClick={() => selectKeyframe(Math.min(keyframeCount - 1, keyframeIndex + 1))}
          disabled={keyframeIndex === keyframeCount - 1}
          className="flex-1 px-3 py-1.5 text-sm rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
