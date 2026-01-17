"use client";

import { ControlPanel } from "./control-panel";
import { GlyphCanvas } from "./glyph-canvas";
import { GLYPH_PATTERNS, COLOR_PALETTES } from "@quantum-garden/shared";
import { useSandboxStore } from "@/stores/sandbox-store";

/**
 * Main sandbox component for visual development of plant sprites.
 *
 * Uses a single PixiJS canvas to render all glyph/palette combinations.
 *
 * Workflow for creative partner:
 * 1. Edit packages/shared/src/patterns/glyphs.ts to add/modify patterns
 * 2. Edit packages/shared/src/patterns/palettes.ts for colors
 * 3. Hot-reload updates this view immediately
 */
export function Sandbox() {
  const { scale, selectedPatternIndex, selectedPaletteIndex, selectPattern, selectPalette } =
    useSandboxStore();

  // Get selected items for display
  const selectedPattern =
    selectedPatternIndex !== null ? GLYPH_PATTERNS[selectedPatternIndex] : undefined;
  const selectedPalette =
    selectedPaletteIndex !== null ? COLOR_PALETTES[selectedPaletteIndex] : undefined;

  const patterns = selectedPattern ? [selectedPattern] : GLYPH_PATTERNS;
  const palettes = selectedPalette ? [selectedPalette] : COLOR_PALETTES;

  const cellSize = 8 * scale + 16;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Sprite Sandbox</h1>
        <p className="text-sm text-gray-600 mt-1">
          Visual development environment for plant glyphs
        </p>
      </header>

      {/* Controls */}
      <ControlPanel />

      {/* Selection info */}
      {(selectedPattern || selectedPalette) && (
        <div className="px-6 py-2 flex items-center gap-4 bg-gray-50 border-b">
          {selectedPattern && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Pattern: {selectedPattern.name}
              <button onClick={() => selectPattern(null)} className="hover:text-blue-600">
                &times;
              </button>
            </span>
          )}
          {selectedPalette && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Palette: {selectedPalette.name}
              <button onClick={() => selectPalette(null)} className="hover:text-purple-600">
                &times;
              </button>
            </span>
          )}
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 overflow-auto p-6">
        {/* Palette headers */}
        <div style={{ display: "flex", marginLeft: 100, marginBottom: 8 }}>
          {palettes.map((palette, pIdx) => {
            const actualIndex = selectedPaletteIndex !== null ? selectedPaletteIndex : pIdx;
            return (
              <div
                key={palette.name}
                className="flex flex-col items-center cursor-pointer hover:opacity-80"
                style={{ width: cellSize }}
                onClick={() =>
                  selectPalette(selectedPaletteIndex === actualIndex ? null : actualIndex)
                }
              >
                <span className="text-xs font-medium text-gray-600 mb-1">{palette.name}</span>
                <div className="flex gap-0.5">
                  {palette.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pattern rows with canvas */}
        <div style={{ display: "flex" }}>
          {/* Pattern labels */}
          <div className="flex flex-col" style={{ width: 100 }}>
            {patterns.map((pattern, gIdx) => {
              const actualIndex = selectedPatternIndex !== null ? selectedPatternIndex : gIdx;
              return (
                <div
                  key={pattern.name}
                  className="cursor-pointer hover:opacity-80"
                  style={{
                    height: cellSize,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                  onClick={() =>
                    selectPattern(selectedPatternIndex === actualIndex ? null : actualIndex)
                  }
                >
                  <span className="text-sm font-medium text-gray-700">{pattern.name}</span>
                  <span className="text-xs text-gray-500 truncate">
                    {pattern.description.slice(0, 20)}...
                  </span>
                </div>
              );
            })}
          </div>

          {/* Canvas */}
          <GlyphCanvas />
        </div>
      </div>

      {/* Footer with file hints */}
      <footer className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex gap-6">
          <span>
            <strong>Patterns:</strong> packages/shared/src/patterns/glyphs.ts
          </span>
          <span>
            <strong>Palettes:</strong> packages/shared/src/patterns/palettes.ts
          </span>
        </div>
      </footer>
    </div>
  );
}
