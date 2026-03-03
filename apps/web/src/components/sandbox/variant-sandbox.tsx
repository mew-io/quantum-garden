"use client";

import type { PlantVariant, SandboxTraitControl } from "@quantum-garden/shared";
import { VariantControls } from "./variant-controls";
import { VariantTimeline } from "./variant-timeline";
import { VariantPreview } from "./variant-preview";
import { KeyframePanel } from "./keyframe-panel";
import { VariantGallery } from "./variant-gallery";
import { VariantConfigPanel } from "./variant-config-panel";
import { useVariantSandboxStore } from "@/stores/variant-sandbox-store";
import { useSandboxUrlSync } from "@/hooks/use-sandbox-url-sync";

/**
 * Variant Sandbox
 *
 * A visual development environment for designing plant variants and their
 * lifecycle animations. Features two main views:
 *
 * Gallery View:
 * - Overview of all variants with previews
 * - Quick stats and feature badges
 * - Superposed preview showing all variants overlaid
 * - Click to open detail view
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
  const { viewMode, getSelectedVariant, goToGallery } = useVariantSandboxStore();
  const variant = getSelectedVariant();

  // Sync store state with URL query parameters
  useSandboxUrlSync();

  const getTitle = () => {
    switch (viewMode) {
      case "gallery":
        return "Variant Sandbox";
      case "detail":
        return variant?.name || "Variant Detail";
      default:
        return "Variant Sandbox";
    }
  };

  const getSubtitle = () => {
    switch (viewMode) {
      case "gallery":
        return "Browse and preview plant lifecycle animations";
      case "detail":
        return variant?.description || "View and test variant configuration";
      default:
        return "";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[--wc-cream] overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 garden-panel border-b border-[--wc-stone]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {viewMode === "detail" && (
              <button
                onClick={goToGallery}
                className="flex items-center gap-1 text-[--wc-ink-muted] hover:text-[--wc-ink] transition-colors"
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
              <h1 className="text-2xl font-bold text-[--wc-ink]">{getTitle()}</h1>
              <p className="text-sm text-[--wc-ink-soft] mt-1">{getSubtitle()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* View-specific content */}
      {viewMode === "gallery" && <GalleryView />}
      {viewMode === "detail" && <DetailView variant={variant} />}

      {/* Footer with file hints */}
      <footer className="flex-shrink-0 px-6 py-3 bg-[--wc-paper]/60 border-t border-[--wc-stone]/20 text-xs text-[--wc-ink-muted]">
        <div className="flex flex-col gap-1 md:flex-row md:gap-6">
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
    <div className="flex-1 flex flex-col min-h-0">
      {/* Controls */}
      <div className="flex-shrink-0">
        <VariantControls />
      </div>

      {/* Main content - scrollable */}
      <div className="flex-1 p-6 overflow-auto min-h-0">
        <div className="max-w-7xl mx-auto">
          {/* Two-column layout - side by side on tablet and up */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left column - Preview and Timeline */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Preview and Keyframe Panel row */}
              <div className="flex flex-col sm:flex-row gap-6">
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

              {/* Trait Controls (if variant has sandbox controls) */}
              {variant.sandboxControls && variant.sandboxControls.length > 0 && (
                <TraitControlsPanel controls={variant.sandboxControls} />
              )}
            </div>

            {/* Right column - Configuration Panel */}
            <div className="w-full md:w-72 lg:w-80 flex-shrink-0">
              <h2 className="text-sm font-medium text-gray-700 mb-3">Configuration</h2>
              <VariantConfigPanel variant={variant} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Trait controls panel — renders sliders for each sandboxControl declared on the variant.
 * Values are injected into ctx.traits when building watercolor elements, allowing
 * designers to preview all quantum-driven visual parameters without a real observation.
 */
function TraitControlsPanel({ controls }: { controls: SandboxTraitControl[] }) {
  const { traitOverrides, setTraitOverride, resetTraitOverrides } = useVariantSandboxStore();

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-300">Quantum Trait Controls</h2>
        <button
          onClick={resetTraitOverrides}
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors px-2 py-1 rounded hover:bg-gray-700"
        >
          Reset
        </button>
      </div>
      <div className="space-y-4">
        {controls.map((ctrl) => {
          const value = traitOverrides[ctrl.key] ?? ctrl.default;
          const isInteger = ctrl.step >= 1;
          const displayValue = isInteger ? Math.round(value) : value.toFixed(2);

          return (
            <div key={ctrl.key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-gray-400">{ctrl.label}</label>
                <span className="text-xs font-mono text-gray-300 bg-gray-700 px-1.5 py-0.5 rounded">
                  {displayValue}
                </span>
              </div>
              <input
                type="range"
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step}
                value={value}
                onChange={(e) => setTraitOverride(ctrl.key, parseFloat(e.target.value))}
                className="w-full h-1.5 appearance-none rounded-full bg-gray-600 accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-600">{ctrl.min}</span>
                <span className="text-xs text-gray-600">{ctrl.max}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
