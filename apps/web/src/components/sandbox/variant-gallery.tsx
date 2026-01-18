"use client";

import { PLANT_VARIANTS } from "@quantum-garden/shared";
import { useVariantSandboxStore } from "@/stores/variant-sandbox-store";
import { MiniGlyph } from "./mini-glyph";

/**
 * Gallery view showing all available variants.
 * - Mobile: Card grid layout
 * - Desktop: Table layout for better comparison
 * Click a variant to open its detail view.
 */
export function VariantGallery() {
  const { openVariantDetail } = useVariantSandboxStore();

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Gallery header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            All Variants ({PLANT_VARIANTS.length})
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Click a variant to view its details and lifecycle animation
          </p>
        </div>

        {/* Mobile: Card grid */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLANT_VARIANTS.map((variant) => {
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
                  <div className="flex-shrink-0 bg-gray-900 rounded-lg p-2">
                    {previewKeyframe && <MiniGlyph keyframe={previewKeyframe} size={64} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                      {variant.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {variant.keyframes.length} kf
                      </span>
                      {variant.rarity < 1.0 && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                          {(variant.rarity * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Desktop: Table layout for comparison */}
        <div className="hidden lg:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                <th className="py-3 px-4 font-medium">Preview</th>
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Description</th>
                <th className="py-3 px-4 font-medium text-center">Keyframes</th>
                <th className="py-3 px-4 font-medium text-center">Duration</th>
                <th className="py-3 px-4 font-medium text-center">Rarity</th>
                <th className="py-3 px-4 font-medium">Features</th>
                <th className="py-3 px-4 font-medium">Lifecycle Preview</th>
              </tr>
            </thead>
            <tbody>
              {PLANT_VARIANTS.map((variant) => {
                const previewKeyframeIndex = Math.min(
                  Math.floor(variant.keyframes.length / 2),
                  variant.keyframes.length - 1
                );
                const previewKeyframe = variant.keyframes[previewKeyframeIndex];
                const totalDuration = variant.keyframes.reduce((sum, kf) => sum + kf.duration, 0);

                return (
                  <tr
                    key={variant.id}
                    onClick={() => openVariantDetail(variant.id)}
                    className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors group"
                  >
                    {/* Preview */}
                    <td className="py-3 px-4">
                      <div className="bg-gray-900 rounded-lg p-1.5 inline-block">
                        {previewKeyframe && <MiniGlyph keyframe={previewKeyframe} size={48} />}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900 group-hover:text-blue-600">
                        {variant.name}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                        {variant.description || "—"}
                      </span>
                    </td>

                    {/* Keyframes */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm text-gray-700">{variant.keyframes.length}</span>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm text-gray-700">{totalDuration}s</span>
                    </td>

                    {/* Rarity */}
                    <td className="py-3 px-4 text-center">
                      {variant.rarity < 1.0 ? (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                          {(variant.rarity * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">100%</span>
                      )}
                    </td>

                    {/* Features */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {variant.loop && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            Loop
                          </span>
                        )}
                        {variant.tweenBetweenKeyframes && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                            Tween
                          </span>
                        )}
                        {variant.colorVariations && variant.colorVariations.length > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                            {variant.colorVariations.length} clr
                          </span>
                        )}
                        {variant.requiresObservationToGerminate && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                            Obs
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Lifecycle Preview (keyframe strip) */}
                    <td className="py-3 px-4">
                      <div className="flex gap-0.5">
                        {variant.keyframes.slice(0, 5).map((kf, i) => (
                          <div
                            key={i}
                            className="bg-gray-800 rounded overflow-hidden"
                            title={`${kf.name} (${kf.duration}s)`}
                          >
                            <MiniGlyph keyframe={kf} size={28} />
                          </div>
                        ))}
                        {variant.keyframes.length > 5 && (
                          <div className="flex items-center px-1 text-xs text-gray-400">
                            +{variant.keyframes.length - 5}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
