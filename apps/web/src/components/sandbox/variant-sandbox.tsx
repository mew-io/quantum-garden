"use client";

import type { PlantVariant } from "@quantum-garden/shared";
import { VariantControls } from "./variant-controls";
import { VariantTimeline } from "./variant-timeline";
import { VariantPreview } from "./variant-preview";
import { KeyframePanel } from "./keyframe-panel";
import { VariantGallery } from "./variant-gallery";
import { VariantConfigPanel } from "./variant-config-panel";
import { SuperposedView } from "./superposed-view";
import { useVariantSandboxStore } from "@/stores/variant-sandbox-store";

/**
 * Variant Sandbox
 *
 * A visual development environment for designing plant variants and their
 * lifecycle animations. Features three main views:
 *
 * Gallery View:
 * - Overview of all variants with previews
 * - Quick stats and feature badges
 * - Click to open detail view
 *
 * Superposed View:
 * - All variants overlaid in quantum superposition
 * - Visual comparison of all variants at once
 * - Click variant to isolate and view details
 *
 * Detail View:
 * - Live preview with playback controls
 * - Timeline showing keyframes with sprites
 * - Full configuration panel showing all options
 * - Color variation selector
 *
 * Workflow for designers:
 * 1. Browse variants in gallery view
 * 2. Click a variant to open detail view
 * 3. Use playback controls to watch the lifecycle animation
 * 4. Review all configuration options in the config panel
 * 5. Edit definitions in packages/shared/src/variants/definitions.ts
 * 6. Hot-reload updates the preview immediately
 */
export function VariantSandbox() {
  const { viewMode, getSelectedVariant, goToGallery, goToSuperposed } = useVariantSandboxStore();
  const variant = getSelectedVariant();

  const getTitle = () => {
    switch (viewMode) {
      case "gallery":
        return "Variant Sandbox";
      case "superposed":
        return "Quantum Superposition";
      case "detail":
        return variant?.name || "Variant Detail";
    }
  };

  const getSubtitle = () => {
    switch (viewMode) {
      case "gallery":
        return "Browse and preview plant lifecycle animations";
      case "superposed":
        return "All variants overlaid in quantum superposition";
      case "detail":
        return variant?.description || "View and test variant configuration";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {(viewMode === "detail" || viewMode === "superposed") && (
              <button
                onClick={goToGallery}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="text-sm">All Variants</span>
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
              <p className="text-sm text-gray-600 mt-1">{getSubtitle()}</p>
            </div>
          </div>

          {/* Superposed button (only in gallery view) */}
          {viewMode === "gallery" && (
            <button
              onClick={goToSuperposed}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
              <span className="text-sm font-medium">View Superposed</span>
            </button>
          )}
        </div>
      </header>

      {/* View-specific content */}
      {viewMode === "gallery" && <GalleryView />}
      {viewMode === "superposed" && <SuperposedView />}
      {viewMode === "detail" && <DetailView variant={variant} />}

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

/**
 * Gallery view showing all variants
 */
function GalleryView() {
  return (
    <div className="flex-1 overflow-auto">
      <VariantGallery />
    </div>
  );
}

/**
 * Detail view for a single variant
 */
function DetailView({ variant }: { variant: PlantVariant | null }) {
  if (!variant) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        No variant selected
      </div>
    );
  }

  return (
    <>
      {/* Controls */}
      <VariantControls />

      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Two-column layout */}
          <div className="flex gap-6">
            {/* Left column - Preview and Timeline */}
            <div className="flex-1 min-w-0 space-y-6">
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

              {/* Color Variations selector (if variant has them) */}
              {variant.colorVariations && variant.colorVariations.length > 0 && (
                <ColorVariationSelector variant={variant} />
              )}
            </div>

            {/* Right column - Configuration Panel */}
            <div className="w-80 flex-shrink-0">
              <h2 className="text-sm font-medium text-gray-700 mb-3">Configuration</h2>
              <VariantConfigPanel variant={variant} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Color variation selector with visual preview
 */
function ColorVariationSelector({ variant }: { variant: PlantVariant }) {
  const { selectedColorVariation, selectColorVariation } = useVariantSandboxStore();

  if (!variant.colorVariations || variant.colorVariations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-sm font-medium text-gray-300 mb-3">Color Variations</h2>
      <div className="flex flex-wrap gap-2">
        {/* Default option */}
        <button
          onClick={() => selectColorVariation(null)}
          className={`px-3 py-2 rounded flex items-center gap-2 transition-colors ${
            !selectedColorVariation
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <span className="text-sm">Default</span>
        </button>

        {/* Color variations */}
        {variant.colorVariations.map((cv) => (
          <button
            key={cv.name}
            onClick={() => selectColorVariation(cv.name)}
            className={`px-3 py-2 rounded flex items-center gap-2 transition-colors ${
              selectedColorVariation === cv.name
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <span className="text-sm">{cv.name}</span>
            <span className="text-xs opacity-70">{(cv.weight * 100).toFixed(0)}%</span>
            {/* Color preview dots */}
            <div className="flex gap-0.5 ml-1">
              {Object.values(cv.palettes)[0]
                ?.slice(0, 3)
                .map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full border border-white/30"
                    style={{ backgroundColor: color }}
                  />
                ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
