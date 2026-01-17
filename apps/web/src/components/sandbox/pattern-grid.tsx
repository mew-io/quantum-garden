"use client";

import {
  GLYPH_PATTERNS,
  COLOR_PALETTES,
  type GlyphPattern,
  type ColorPalette,
} from "@quantum-garden/shared";
import { useSandboxStore } from "@/stores/sandbox-store";
import { GlyphPreview } from "./glyph-preview";

/**
 * Matrix display of all pattern × palette combinations.
 * Rows are patterns, columns are palettes.
 */
export function PatternGrid() {
  const {
    scale,
    visualState,
    showGrid,
    background,
    selectedPatternIndex,
    selectedPaletteIndex,
    selectPattern,
    selectPalette,
  } = useSandboxStore();

  // Get selected pattern/palette with type safety
  const selectedPattern =
    selectedPatternIndex !== null ? GLYPH_PATTERNS[selectedPatternIndex] : undefined;
  const selectedPalette =
    selectedPaletteIndex !== null ? COLOR_PALETTES[selectedPaletteIndex] : undefined;

  // Filter patterns and palettes based on selection
  const patterns: GlyphPattern[] = selectedPattern ? [selectedPattern] : GLYPH_PATTERNS;

  const palettes: ColorPalette[] = selectedPalette ? [selectedPalette] : COLOR_PALETTES;

  // Get other patterns for superposed state
  const getSuperposedPatterns = (currentIndex: number): GlyphPattern[] => {
    return GLYPH_PATTERNS.filter((_, i) => i !== currentIndex).slice(0, 2);
  };

  return (
    <div className="p-6 overflow-auto">
      {/* Selection info */}
      {(selectedPattern || selectedPalette) && (
        <div className="mb-4 flex items-center gap-4">
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

      {/* Palette headers */}
      <div className="flex mb-2 ml-24">
        {palettes.map((palette, pIdx) => {
          const actualIndex = selectedPaletteIndex !== null ? selectedPaletteIndex : pIdx;
          return (
            <div
              key={palette.name}
              className="flex flex-col items-center cursor-pointer hover:opacity-80"
              style={{ width: scale * 8 + 16 }}
              onClick={() =>
                selectPalette(selectedPaletteIndex === actualIndex ? null : actualIndex)
              }
            >
              <span className="text-xs font-medium text-gray-600 mb-1">{palette.name}</span>
              <div className="flex gap-0.5">
                {palette.colors.map((color, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pattern rows */}
      {patterns.map((pattern, gIdx) => {
        const actualPatternIndex = selectedPatternIndex !== null ? selectedPatternIndex : gIdx;
        return (
          <div key={pattern.name} className="flex items-center mb-4">
            {/* Pattern label */}
            <div
              className="w-24 flex flex-col cursor-pointer hover:opacity-80"
              onClick={() =>
                selectPattern(
                  selectedPatternIndex === actualPatternIndex ? null : actualPatternIndex
                )
              }
            >
              <span className="text-sm font-medium text-gray-700">{pattern.name}</span>
              <span className="text-xs text-gray-500 truncate">
                {pattern.description.slice(0, 20)}...
              </span>
            </div>

            {/* Glyph cells */}
            <div className="flex gap-4">
              {palettes.map((palette) => (
                <div key={`${pattern.name}-${palette.name}`} className="p-2">
                  <GlyphPreview
                    pattern={pattern}
                    palette={palette}
                    scale={scale}
                    visualState={visualState}
                    showGrid={showGrid}
                    background={background}
                    superposedPatterns={
                      visualState === "superposed"
                        ? getSuperposedPatterns(actualPatternIndex)
                        : undefined
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
