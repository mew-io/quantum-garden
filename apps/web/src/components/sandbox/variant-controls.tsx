"use client";

import { PLANT_VARIANTS } from "@quantum-garden/shared";
import {
  useVariantSandboxStore,
  type PlaybackSpeed,
  type Background,
} from "@/stores/variant-sandbox-store";

const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.5, 1, 2, 5, 10];
const SCALES = [8, 16, 24, 32];
const BACKGROUNDS: { value: Background; label: string }[] = [
  { value: "white", label: "White" },
  { value: "dark", label: "Dark" },
  { value: "checkerboard", label: "Check" },
];

/**
 * Control panel for variant sandbox.
 * Includes variant selector, color variation selector, playback controls, and view settings.
 */
export function VariantControls() {
  const {
    selectedVariantId,
    selectedColorVariation,
    isPlaying,
    playbackSpeed,
    scale,
    background,
    showGrid,
    getSelectedVariant,
    selectVariant,
    selectColorVariation,
    togglePlayback,
    setPlaybackSpeed,
    setCurrentTime,
    setScale,
    setBackground,
    toggleGrid,
    reset,
  } = useVariantSandboxStore();

  const variant = getSelectedVariant();

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-100 border-b border-gray-200">
      {/* Variant selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Variant:</label>
        <select
          value={selectedVariantId || ""}
          onChange={(e) => selectVariant(e.target.value || null)}
          className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {PLANT_VARIANTS.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      {/* Color variation selector (if variant has color variations) */}
      {variant?.colorVariations && variant.colorVariations.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Color:</label>
          <select
            value={selectedColorVariation || ""}
            onChange={(e) => selectColorVariation(e.target.value || null)}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Default</option>
            {variant.colorVariations.map((cv) => (
              <option key={cv.name} value={cv.name}>
                {cv.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Playback controls */}
      <div className="flex items-center gap-2">
        {/* Play/Pause button */}
        <button
          onClick={togglePlayback}
          className={`p-2 rounded ${
            isPlaying
              ? "bg-green-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Reset button */}
        <button
          onClick={() => setCurrentTime(0)}
          className="p-2 rounded bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          title="Reset to start"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
          </svg>
        </button>

        {/* Speed selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Speed:</span>
          <div className="flex gap-0.5">
            {PLAYBACK_SPEEDS.map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 text-xs rounded ${
                  playbackSpeed === speed
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* View settings */}
      <div className="flex items-center gap-2">
        {/* Scale selector */}
        <span className="text-sm font-medium text-gray-700">Scale:</span>
        <div className="flex gap-0.5">
          {SCALES.map((s) => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={`px-2 py-1 text-xs rounded ${
                scale === s
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {s}px
            </button>
          ))}
        </div>
      </div>

      {/* Background selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Bg:</span>
        <div className="flex gap-0.5">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.value}
              onClick={() => setBackground(bg.value)}
              className={`px-2 py-1 text-xs rounded ${
                background === bg.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {bg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid toggle */}
      <button
        onClick={toggleGrid}
        className={`px-3 py-1 text-sm rounded ${
          showGrid
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        }`}
      >
        Grid
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Reset all button */}
      <button
        onClick={reset}
        className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
      >
        Reset All
      </button>
    </div>
  );
}
