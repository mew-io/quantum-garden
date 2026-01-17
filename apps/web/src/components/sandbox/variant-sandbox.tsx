"use client";

import { VariantControls } from "./variant-controls";
import { VariantTimeline } from "./variant-timeline";
import { VariantPreview } from "./variant-preview";
import { KeyframePanel } from "./keyframe-panel";
import { useVariantSandboxStore } from "@/stores/variant-sandbox-store";

/**
 * Variant Sandbox
 *
 * A visual development environment for designing plant variants and their
 * lifecycle animations. Features:
 *
 * - Variant selector with color variation support
 * - Timeline view showing keyframes with proportional widths
 * - Live preview with playback controls
 * - Keyframe detail panel
 *
 * Workflow for designers:
 * 1. Select a variant to preview
 * 2. Use playback controls to watch the lifecycle animation
 * 3. Click keyframes in the timeline to view their details
 * 4. Edit keyframe definitions in packages/shared/src/variants/definitions.ts
 * 5. Hot-reload updates the preview immediately
 */
export function VariantSandbox() {
  const { getSelectedVariant } = useVariantSandboxStore();
  const variant = getSelectedVariant();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Variant Sandbox</h1>
        <p className="text-sm text-gray-600 mt-1">Design and preview plant lifecycle animations</p>
      </header>

      {/* Controls */}
      <VariantControls />

      {/* Variant info bar */}
      {variant && (
        <div className="px-6 py-2 bg-gray-100 border-b border-gray-200 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">{variant.name}</span>
          {variant.description && (
            <span className="text-sm text-gray-500">{variant.description}</span>
          )}
          <span className="text-xs text-gray-400 ml-auto">
            Rarity: {(variant.rarity * 100).toFixed(0)}%
          </span>
          {variant.requiresObservationToGerminate && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
              Requires observation
            </span>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Preview and Keyframe Panel row */}
          <div className="flex gap-6">
            {/* Preview */}
            <div className="flex-shrink-0">
              <h2 className="text-sm font-medium text-gray-700 mb-3">Live Preview</h2>
              <VariantPreview />
            </div>

            {/* Keyframe Panel */}
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-medium text-gray-700 mb-3">Keyframe Details</h2>
              <KeyframePanel />
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Lifecycle Timeline</h2>
            <VariantTimeline />
          </div>

          {/* Color Variations info (if variant has them) */}
          {variant?.colorVariations && variant.colorVariations.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-sm font-medium text-gray-300 mb-3">Color Variations</h2>
              <div className="flex flex-wrap gap-3">
                {variant.colorVariations.map((cv) => (
                  <div
                    key={cv.name}
                    className="bg-gray-700 rounded px-3 py-2 flex items-center gap-2"
                  >
                    <span className="text-sm text-white">{cv.name}</span>
                    <span className="text-xs text-gray-400">
                      {(cv.weight * 100).toFixed(0)}% weight
                    </span>
                    {/* Color preview */}
                    <div className="flex gap-0.5 ml-2">
                      {Object.values(cv.palettes)[0]
                        ?.slice(0, 3)
                        .map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-sm border border-gray-600"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with file hints */}
      <footer className="px-6 py-3 bg-gray-100 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex gap-6">
          <span>
            <strong>Variants:</strong> packages/shared/src/variants/definitions.ts
          </span>
          <span>
            <strong>Types:</strong> packages/shared/src/variants/types.ts
          </span>
          <span>
            <strong>Docs:</strong> docs/variants-and-lifecycle.md
          </span>
        </div>
      </footer>
    </div>
  );
}
