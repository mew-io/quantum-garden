"use client";

import { PLANT_VARIANTS } from "@quantum-garden/shared";
import { useVariantSandboxStore } from "@/stores/variant-sandbox-store";
import { MiniGlyph } from "./mini-glyph";

/**
 * Gallery view showing all available variants in a grid.
 * Click a variant to open its detail view.
 */
export function VariantGallery() {
  const { openVariantDetail } = useVariantSandboxStore();

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Gallery header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            All Variants ({PLANT_VARIANTS.length})
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Click a variant to view its details and lifecycle animation
          </p>
        </div>

        {/* Variant grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLANT_VARIANTS.map((variant) => {
            // Get the "bloom" or middle keyframe for preview
            const previewKeyframeIndex = Math.min(
              Math.floor(variant.keyframes.length / 2),
              variant.keyframes.length - 1
            );
            const previewKeyframe = variant.keyframes[previewKeyframeIndex];

            return (
              <button
                key={variant.id}
                onClick={() => openVariantDetail(variant.id)}
                className="group bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md transition-all text-left"
              >
                <div className="flex gap-4">
                  {/* Preview glyph */}
                  <div className="flex-shrink-0 bg-gray-900 rounded-lg p-2">
                    {previewKeyframe && <MiniGlyph keyframe={previewKeyframe} size={64} />}
                  </div>

                  {/* Variant info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                      {variant.name}
                    </h3>
                    {variant.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {variant.description}
                      </p>
                    )}

                    {/* Quick stats */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {variant.keyframes.length} keyframes
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {variant.keyframes.reduce((sum, kf) => sum + kf.duration, 0)}s total
                      </span>
                      {variant.rarity < 1.0 && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                          {(variant.rarity * 100).toFixed(0)}% rarity
                        </span>
                      )}
                    </div>

                    {/* Feature badges */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {variant.loop && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          Loops
                        </span>
                      )}
                      {variant.tweenBetweenKeyframes && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Tweens
                        </span>
                      )}
                      {variant.colorVariations && variant.colorVariations.length > 0 && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          {variant.colorVariations.length} colors
                        </span>
                      )}
                      {variant.requiresObservationToGerminate && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                          Observation
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Keyframe preview strip */}
                <div className="mt-4 flex gap-1">
                  {variant.keyframes.map((kf, i) => (
                    <div
                      key={i}
                      className="flex-1 h-8 bg-gray-800 rounded overflow-hidden flex items-center justify-center"
                      title={`${kf.name} (${kf.duration}s)`}
                    >
                      <MiniGlyph keyframe={kf} size={24} />
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
