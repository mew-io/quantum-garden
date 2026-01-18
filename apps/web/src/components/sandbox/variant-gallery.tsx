"use client";

import { PLANT_VARIANTS } from "@quantum-garden/shared";
import { useVariantSandboxStore } from "@/stores/variant-sandbox-store";
import { MiniGlyph } from "./mini-glyph";
import { SuperposedPreview } from "./superposed-preview";

/**
 * Gallery view showing all available variants.
 * - Mobile: Full-featured card layout
 * - Desktop: Table layout with superposed preview in header
 * Click a variant to open its detail view.
 */
export function VariantGallery() {
  const { openVariantDetail } = useVariantSandboxStore();

  return (
    <div className="p-6">
      {/* Gallery header with superposed preview */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            All Variants ({PLANT_VARIANTS.length})
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Click a variant to view its details and lifecycle animation
          </p>
        </div>
        {/* Superposed preview - desktop only */}
        <div className="hidden lg:block flex-shrink-0">
          <SuperposedPreview />
        </div>
      </div>

      {/* Mobile: Full-featured card layout */}
      <div className="lg:hidden space-y-4">
        {PLANT_VARIANTS.map((variant) => {
          const previewKeyframeIndex = Math.min(
            Math.floor(variant.keyframes.length / 2),
            variant.keyframes.length - 1
          );
          const previewKeyframe = variant.keyframes[previewKeyframeIndex];
          const totalDuration = variant.keyframes.reduce((sum, kf) => sum + kf.duration, 0);

          return (
            <button
              key={variant.id}
              onClick={() => openVariantDetail(variant.id)}
              className="w-full group bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md transition-all text-left"
            >
              <div className="flex gap-4">
                {/* Preview */}
                <div className="flex-shrink-0 bg-gray-900 rounded-lg p-2">
                  {previewKeyframe && <MiniGlyph keyframe={previewKeyframe} size={64} />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                    {variant.name}
                  </h3>
                  {variant.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{variant.description}</p>
                  )}

                  {/* Stats row */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {variant.keyframes.length} keyframes
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {totalDuration}s
                    </span>
                    {variant.rarity < 1.0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                        {(variant.rarity * 100).toFixed(0)}% rarity
                      </span>
                    )}
                  </div>

                  {/* Features */}
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

              {/* Keyframe strip */}
              <div className="mt-4 flex gap-1">
                {variant.keyframes.map((kf, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 bg-gray-800 rounded overflow-hidden"
                    title={`${kf.name} (${kf.duration}s)`}
                  >
                    <MiniGlyph keyframe={kf} size={32} />
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Desktop: Table layout for comparison */}
      <div className="hidden lg:block">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
              <th className="py-3 px-4 font-medium">Preview</th>
              <th className="py-3 px-4 font-medium whitespace-nowrap">Name</th>
              <th className="py-3 px-4 font-medium">Description</th>
              <th className="py-3 px-4 font-medium text-center whitespace-nowrap">Keyframes</th>
              <th className="py-3 px-4 font-medium text-center whitespace-nowrap">Duration</th>
              <th className="py-3 px-4 font-medium text-center whitespace-nowrap">Rarity</th>
              <th className="py-3 px-4 font-medium whitespace-nowrap">Features</th>
              <th className="py-3 px-4 font-medium whitespace-nowrap">Lifecycle Preview</th>
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
                  <td className="py-3 px-4 whitespace-nowrap">
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
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className="text-sm text-gray-700">{totalDuration}s</span>
                  </td>

                  {/* Rarity */}
                  <td className="py-3 px-4 text-center">
                    {variant.rarity < 1.0 ? (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded whitespace-nowrap">
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
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded whitespace-nowrap">
                          Loop
                        </span>
                      )}
                      {variant.tweenBetweenKeyframes && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded whitespace-nowrap">
                          Tween
                        </span>
                      )}
                      {variant.colorVariations && variant.colorVariations.length > 0 && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded whitespace-nowrap">
                          {variant.colorVariations.length} clr
                        </span>
                      )}
                      {variant.requiresObservationToGerminate && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded whitespace-nowrap">
                          Obs
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Lifecycle Preview (keyframe strip) - don't squish */}
                  <td className="py-3 px-4">
                    <div className="flex gap-0.5 flex-shrink-0">
                      {variant.keyframes.slice(0, 6).map((kf, i) => (
                        <div
                          key={i}
                          className="flex-shrink-0 bg-gray-800 rounded overflow-hidden"
                          title={`${kf.name} (${kf.duration}s)`}
                        >
                          <MiniGlyph keyframe={kf} size={28} />
                        </div>
                      ))}
                      {variant.keyframes.length > 6 && (
                        <div className="flex-shrink-0 flex items-center px-1 text-xs text-gray-400 whitespace-nowrap">
                          +{variant.keyframes.length - 6}
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
  );
}
