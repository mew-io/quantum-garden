"use client";

import { useSandboxStore, type Scale, type Background } from "@/stores/sandbox-store";

const SCALES: Scale[] = [8, 16, 24, 32];
const BACKGROUNDS: { value: Background; label: string }[] = [
  { value: "white", label: "White" },
  { value: "dark", label: "Dark" },
  { value: "checkerboard", label: "Check" },
];

/**
 * Control panel for sandbox settings.
 * Provides controls for scale, visual state, background, and grid overlay.
 */
export function ControlPanel() {
  const {
    scale,
    setScale,
    visualState,
    setVisualState,
    background,
    setBackground,
    showGrid,
    toggleGrid,
    reset,
  } = useSandboxStore();

  return (
    <div className="flex flex-wrap items-center gap-6 p-4 bg-gray-100 border-b border-gray-200">
      {/* Scale selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Scale:</span>
        <div className="flex gap-1">
          {SCALES.map((s) => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={`px-3 py-1 text-sm rounded ${
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

      {/* Visual state toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">State:</span>
        <div className="flex gap-1">
          <button
            onClick={() => setVisualState("collapsed")}
            className={`px-3 py-1 text-sm rounded ${
              visualState === "collapsed"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Collapsed
          </button>
          <button
            onClick={() => setVisualState("superposed")}
            className={`px-3 py-1 text-sm rounded ${
              visualState === "superposed"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Superposed
          </button>
        </div>
      </div>

      {/* Background selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Background:</span>
        <div className="flex gap-1">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.value}
              onClick={() => setBackground(bg.value)}
              className={`px-3 py-1 text-sm rounded ${
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
      <div className="flex items-center gap-2">
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
      </div>

      {/* Reset button */}
      <div className="flex-1" />
      <button
        onClick={reset}
        className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
      >
        Reset
      </button>
    </div>
  );
}
