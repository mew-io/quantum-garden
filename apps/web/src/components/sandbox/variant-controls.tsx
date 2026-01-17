"use client";

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
 * Control panel for variant detail view.
 * Includes playback controls and view settings.
 * Note: Variant selection is handled via the gallery view.
 */
export function VariantControls() {
  const {
    isPlaying,
    playbackSpeed,
    scale,
    background,
    showGrid,
    togglePlayback,
    setPlaybackSpeed,
    setCurrentTime,
    setScale,
    setBackground,
    toggleGrid,
    goToGallery,
  } = useVariantSandboxStore();

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-100 border-b border-gray-200">
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

      {/* Back to gallery button */}
      <button
        onClick={goToGallery}
        className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
        All Variants
      </button>
    </div>
  );
}
