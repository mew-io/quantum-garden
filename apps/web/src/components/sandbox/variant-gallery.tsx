"use client";

import {
  CANVAS,
  PLANT_VARIANTS,
  QUANTUM,
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
    <div className="px-8 py-10">
      {/* Gallery header */}
      <div className="mb-8">
        <p className="text-sm font-medium tracking-widest uppercase text-[--wc-sage] mb-1">
          {PLANT_VARIANTS.length} varieties
        </p>
        <p className="text-sm text-[--wc-ink-muted] mt-2 max-w-lg">
          Click any plant to explore its full lifecycle animation
        </p>
        <div className="mt-4 w-16 h-px bg-[--wc-stone]/30" />
      </div>

      {/* Responsive card grid — narrow, tall cards to maximize plant density */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}
      >
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

  // Top accent color per renderer type
  const accentBorderColor = isWatercolor
    ? "border-t-[--wc-rose]"
    : isVector
      ? "border-t-[--wc-sky]"
      : "border-t-[--wc-sage]";

  // Count quantum traits from mapping schema or sandbox controls
  const traitCount =
    (variant.quantumMapping?.schema ? Object.keys(variant.quantumMapping.schema).length : 0) +
    (variant.sandboxControls?.length ?? 0);

  // Circuit label (strip "wc_" prefix, replace _ with space)
  const circuitLabel = variant.circuitId
    ? variant.circuitId.replace(/^wc_/, "").replace(/_/g, " ")
    : null;

  // Collect feature badges
  const features: { label: string; className: string }[] = [];
  if (variant.circuitId)
    features.push({ label: circuitLabel!, className: "bg-sky-100/80 text-sky-700" });
  if (traitCount > 0)
    features.push({
      label: `${traitCount} traits`,
      className: "bg-violet-100/80 text-violet-700",
    });
  if (variant.colorVariations && variant.colorVariations.length > 0)
    features.push({
      label: `${variant.colorVariations.length} colors`,
      className: "bg-purple-100/80 text-purple-700",
    });
  if (variant.requiresObservationToGerminate)
    features.push({ label: "Observe", className: "bg-indigo-100/80 text-indigo-700" });
  if (variant.loop) features.push({ label: "Loop", className: "bg-blue-100/80 text-blue-700" });
  if (variant.tweenBetweenKeyframes)
    features.push({ label: "Tween", className: "bg-green-100/80 text-green-700" });

  return (
    <button
      onClick={onSelect}
      className={`group garden-panel rounded-xl overflow-hidden transition-all duration-200 ease-out hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[--wc-sage]/50 focus-visible:outline-none text-left cursor-pointer flex flex-col border-t-2 ${accentBorderColor} ${variant.disabled ? "opacity-50" : ""}`}
    >
      {/* Preview area — plant fills the card */}
      <div
        className="flex items-center justify-center p-2"
        style={{
          backgroundColor: CANVAS.BACKGROUND_COLOR,
          boxShadow: "inset 0 -8px 16px -8px rgba(0,0,0,0.04)",
        }}
      >
        {isWatercolor ? (
          <WatercolorMiniGlyph variant={variant} size={120} />
        ) : previewKeyframe && isVector ? (
          <VectorMiniGlyph keyframe={previewKeyframe as VectorKeyframe} size={120} />
        ) : previewKeyframe ? (
          <MiniGlyph keyframe={previewKeyframe as GlyphKeyframe} size={120} />
        ) : (
          <div style={{ width: 120, height: 120 }} />
        )}
      </div>

      {/* Info area */}
      <div className="px-4 py-3.5 flex-1 flex flex-col gap-2">
        <h3 className="font-medium text-base text-[--wc-ink] group-hover:text-[--wc-sage] transition-colors line-clamp-1">
          {variant.name}
        </h3>

        {variant.description && (
          <p className="text-xs text-[--wc-ink-muted] line-clamp-2 leading-relaxed">
            {variant.description}
          </p>
        )}

        {/* Stats */}
        <div className="text-[11px] text-[--wc-ink-muted]">
          {keyframeCount} keyframes &middot; {totalDuration}s
          {variant.circuitId && <> &middot; {QUANTUM.DEFAULT_TRAIT_QUBITS}q</>}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mt-auto pt-1">
          {variant.disabled && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100/80 text-red-700">
              Disabled
            </span>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${rendererBadgeClass}`}>
            {rendererLabel}
          </span>
          {variant.rarity < 1.0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-700">
              {(variant.rarity * 100).toFixed(0)}%
            </span>
          )}
          {features.map((f) => (
            <span key={f.label} className={`text-[10px] px-1.5 py-0.5 rounded ${f.className}`}>
              {f.label}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
