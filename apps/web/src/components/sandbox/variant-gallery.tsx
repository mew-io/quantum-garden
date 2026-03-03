"use client";

import {
  CANVAS,
  PLANT_VARIANTS,
  isVectorVariant,
  isWatercolorVariant,
  getKeyframeCount,
  getBaseTotalDuration,
  type PlantVariant,
  type VectorKeyframe,
  type GlyphKeyframe,
} from "@quantum-garden/shared";
import { useVariantSandboxStore } from "@/stores/variant-sandbox-store";
import { MiniGlyph } from "./mini-glyph";
import { VectorMiniGlyph } from "./vector-mini-glyph";
import { WatercolorMiniGlyph } from "./watercolor-mini-glyph";

/**
 * Gallery view showing all available variants in a responsive card grid.
 * Click a variant card to open its detail view.
 */
export function VariantGallery() {
  const { openVariantDetail } = useVariantSandboxStore();

  return (
    <div className="p-6">
      {/* Gallery header */}
      <div className="mb-6">
        <h2 className="text-xl text-[--wc-ink]">
          All Variants
          <span className="text-[--wc-ink-muted] text-base ml-2">({PLANT_VARIANTS.length})</span>
        </h2>
        <p className="text-sm text-[--wc-ink-muted] mt-1">
          Click a variant to view its details and lifecycle animation
        </p>
      </div>

      {/* Responsive card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {PLANT_VARIANTS.map((variant) => (
          <VariantCard
            key={variant.id}
            variant={variant}
            onSelect={() => openVariantDetail(variant.id)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual variant card with preview glyph, name, description, and feature badges.
 */
function VariantCard({ variant, onSelect }: { variant: PlantVariant; onSelect: () => void }) {
  const isVector = isVectorVariant(variant);
  const isWatercolor = isWatercolorVariant(variant);
  const keyframeCount = getKeyframeCount(variant);
  const totalDuration = getBaseTotalDuration(variant);

  // Middle keyframe for preview
  const previewKeyframeIndex = Math.min(Math.floor(keyframeCount / 2), keyframeCount - 1);
  const previewKeyframe = isVector
    ? variant.vectorKeyframes?.[previewKeyframeIndex]
    : !isWatercolor
      ? variant.keyframes[previewKeyframeIndex]
      : undefined;

  const rendererLabel = isWatercolor ? "Watercolor" : isVector ? "Vector" : "Raster";
  const rendererBadgeClass = isWatercolor
    ? "bg-rose-100/80 text-rose-700"
    : isVector
      ? "bg-cyan-100/80 text-cyan-700"
      : "bg-[--wc-paper] text-[--wc-ink-muted]";

  // Collect feature badges (max 3 visible)
  const features: { label: string; className: string }[] = [];
  if (variant.loop) features.push({ label: "Loop", className: "bg-blue-100/80 text-blue-700" });
  if (variant.tweenBetweenKeyframes)
    features.push({ label: "Tween", className: "bg-green-100/80 text-green-700" });
  if (variant.colorVariations && variant.colorVariations.length > 0)
    features.push({
      label: `${variant.colorVariations.length} colors`,
      className: "bg-purple-100/80 text-purple-700",
    });
  if (variant.requiresObservationToGerminate)
    features.push({ label: "Observe", className: "bg-indigo-100/80 text-indigo-700" });

  const visibleFeatures = features.slice(0, 3);
  const extraCount = Math.max(0, features.length - 3);

  return (
    <button
      onClick={onSelect}
      className="group garden-panel rounded-xl overflow-hidden transition-all duration-200 ease-out hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[--wc-sage]/50 focus-visible:outline-none text-left cursor-pointer flex flex-col"
    >
      {/* Preview area */}
      <div
        className="flex items-center justify-center p-4"
        style={{ backgroundColor: CANVAS.BACKGROUND_COLOR }}
      >
        {isWatercolor ? (
          <WatercolorMiniGlyph variant={variant} size={96} />
        ) : previewKeyframe && isVector ? (
          <VectorMiniGlyph keyframe={previewKeyframe as VectorKeyframe} size={96} />
        ) : previewKeyframe ? (
          <MiniGlyph keyframe={previewKeyframe as GlyphKeyframe} size={96} />
        ) : (
          <div style={{ width: 96, height: 96 }} />
        )}
      </div>

      {/* Info area */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <h3 className="font-medium text-sm text-[--wc-ink] group-hover:text-[--wc-sage] transition-colors line-clamp-1">
          {variant.name}
        </h3>

        {variant.description && (
          <p className="text-xs text-[--wc-ink-muted] line-clamp-2 leading-relaxed">
            {variant.description}
          </p>
        )}

        {/* Stats */}
        <div className="text-[10px] text-[--wc-ink-muted]">
          {keyframeCount} keyframes &middot; {totalDuration}s
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mt-auto">
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${rendererBadgeClass}`}>
            {rendererLabel}
          </span>
          {variant.rarity < 1.0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-700">
              {(variant.rarity * 100).toFixed(0)}%
            </span>
          )}
          {visibleFeatures.map((f) => (
            <span key={f.label} className={`text-[10px] px-1.5 py-0.5 rounded ${f.className}`}>
              {f.label}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 text-[--wc-ink-muted]">+{extraCount}</span>
          )}
        </div>
      </div>
    </button>
  );
}
