/**
 * EntanglementDetailPanel - Educational panel shown after entangled plant observation
 *
 * Displays side-by-side comparison of entangled plants showing:
 * - Both plant icons/species
 * - Correlated traits (color palette, growth rate, opacity, pattern)
 * - Different traits (species, lifecycle)
 * - Educational explanation of quantum entanglement
 *
 * Design philosophy: Clear, educational, shows correlation explicitly.
 * Positioned on the right side (opposite of observation context panel).
 */

"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useGardenStore } from "@/stores/garden-store";
import { trpc } from "@/lib/trpc/client";
import { getVariantById } from "@quantum-garden/shared";

/** Animation duration in ms for entry/exit transitions */
const ANIMATION_DURATION_MS = 350;

/** Auto-dismiss duration in ms */
const AUTO_DISMISS_DURATION_MS = 8000;

/**
 * Panel content when entanglement is revealed.
 * Supports both entry and exit animations via the isExiting prop.
 */
function PanelContent({
  entanglementGroupId,
  onDismiss,
  isExiting,
}: {
  entanglementGroupId: string;
  onDismiss: () => void;
  isExiting: boolean;
}) {
  const { data: partnerPlants, isLoading } = trpc.plants.getByEntanglementGroup.useQuery({
    groupId: entanglementGroupId,
  });

  // Animation classes based on entry/exit state
  const animationClasses = isExiting
    ? "animate-out fade-out slide-out-to-right-5 duration-300 ease-in"
    : "animate-in fade-in slide-in-from-right-5 duration-350 ease-out";

  // Show loading state
  if (isLoading || !partnerPlants || partnerPlants.length < 2) {
    return (
      <div
        className={`
          w-full sm:w-[320px] rounded-xl garden-panel
          p-4
          ${animationClasses}
        `}
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-[--wc-ink-muted]">Loading entanglement data...</div>
        </div>
      </div>
    );
  }

  // Get the first two plants for comparison
  const plant1 = partnerPlants[0];
  const plant2 = partnerPlants[1];

  // Safety check - should not happen due to earlier length check
  if (!plant1 || !plant2) {
    return null;
  }

  const variant1 = getVariantById(plant1.variantId);
  const variant2 = getVariantById(plant2.variantId);

  // Check if traits are correlated (both plants should have same traits due to entanglement)
  const hasTraits = plant1.traits && plant2.traits;
  const sameVariant = plant1.variantId === plant2.variantId;

  return (
    <div
      className={`
        w-[min(320px,calc(100vw-2*var(--inset-right)))] rounded-xl garden-panel
        p-4
        ${animationClasses}
      `}
      role="dialog"
      aria-labelledby="entanglement-title"
    >
      {/* Header */}
      <div
        className={`mb-3 flex items-start justify-between ${!isExiting ? "animate-in fade-in duration-300" : ""}`}
        style={{ animationDelay: isExiting ? "0ms" : "50ms", animationFillMode: "backwards" }}
      >
        <div>
          <h3 id="entanglement-title" className="text-sm font-medium text-[--wc-ink]">
            Quantum Entanglement Revealed
          </h3>
          <p className="mt-0.5 text-xs text-[--wc-ink-muted]">Correlated quantum states</p>
        </div>
        <button
          onClick={onDismiss}
          className="
            -mr-1 -mt-1 rounded p-1
            text-[--wc-ink-muted] hover:text-[--wc-ink]
            transition-colors
          "
          aria-label="Dismiss"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Plant Icons/Names */}
      <div
        className={`mb-3 flex items-center justify-between ${!isExiting ? "animate-in fade-in duration-300" : ""}`}
        style={{ animationDelay: isExiting ? "0ms" : "100ms", animationFillMode: "backwards" }}
      >
        <div className="flex-1 text-center">
          <div className="text-xs font-medium text-[--wc-ink]">{variant1?.name ?? "Unknown"}</div>
          {plant1.colorVariationName && (
            <div className="text-xs text-[--wc-ink-muted]">({plant1.colorVariationName})</div>
          )}
        </div>
        <div className="mx-2 text-rose-600">↔</div>
        <div className="flex-1 text-center">
          <div className="text-xs font-medium text-[--wc-ink]">{variant2?.name ?? "Unknown"}</div>
          {plant2.colorVariationName && (
            <div className="text-xs text-[--wc-ink-muted]">({plant2.colorVariationName})</div>
          )}
        </div>
      </div>

      {/* Correlated Traits */}
      {hasTraits && (
        <div
          className={`mb-3 rounded bg-rose-50/60 border border-rose-200/30 p-3 ${!isExiting ? "animate-in fade-in duration-300" : ""}`}
          style={{ animationDelay: isExiting ? "0ms" : "150ms", animationFillMode: "backwards" }}
        >
          <div className="mb-2 text-xs font-medium text-emerald-700">✓ Correlated Traits</div>

          {/* Color Palette */}
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-[--wc-ink-soft]">Color Palette</span>
            <div className="flex gap-1">
              {(plant1.traits?.colorPalette ?? []).slice(0, 4).map((color: string, i: number) => (
                <div
                  key={i}
                  className="h-3 w-3 rounded-sm border border-[--wc-stone]/30"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Growth Rate */}
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-[--wc-ink-soft]">Growth Rate</span>
            <span className="font-mono text-[--wc-ink]">
              {typeof plant1.traits?.growthRate === "number"
                ? plant1.traits.growthRate.toFixed(2)
                : "—"}
              x
            </span>
          </div>

          {/* Opacity */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[--wc-ink-soft]">Opacity</span>
            <span className="font-mono text-[--wc-ink]">
              {typeof plant1.traits?.opacity === "number" ? plant1.traits.opacity.toFixed(2) : "—"}
            </span>
          </div>
        </div>
      )}

      {/* Different Traits */}
      {!sameVariant && (
        <div
          className={`mb-3 rounded bg-[--wc-paper]/60 p-3 ${!isExiting ? "animate-in fade-in duration-300" : ""}`}
          style={{ animationDelay: isExiting ? "0ms" : "200ms", animationFillMode: "backwards" }}
        >
          <div className="mb-2 text-xs font-medium text-[--wc-ink-muted]">• Different Traits</div>

          {/* Species */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[--wc-ink-muted]">Species</span>
            <span className="text-[--wc-ink-soft]">
              {variant1?.name ?? plant1.variantId} vs {variant2?.name ?? plant2.variantId}
            </span>
          </div>
        </div>
      )}

      {/* Educational Note */}
      <p
        className={`text-xs leading-relaxed text-[--wc-ink-soft] ${!isExiting ? "animate-in fade-in duration-300" : ""}`}
        style={{ animationDelay: isExiting ? "0ms" : "250ms", animationFillMode: "backwards" }}
      >
        In quantum mechanics, entanglement links measurement outcomes, not physical appearance.
        These plants share quantum properties even though they may be different species.
      </p>
    </div>
  );
}

/**
 * Main entanglement detail panel component.
 *
 * Shows side-by-side comparison of entangled plants when entanglement is revealed.
 * Positioned on the right side of the screen (opposite of observation context panel).
 *
 * Auto-dismisses after 8 seconds.
 */
export function EntanglementDetailPanel() {
  const { entanglementRevealedGroupId, setEntanglementRevealed } = useGardenStore();
  const [isExiting, setIsExiting] = useState(false);
  const [visibleGroupId, setVisibleGroupId] = useState(entanglementRevealedGroupId);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track group ID changes for exit animation
  useEffect(() => {
    // Clear any pending exit timer
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    if (entanglementRevealedGroupId) {
      // New entanglement revealed - show immediately
      setIsExiting(false);
      setVisibleGroupId(entanglementRevealedGroupId);
    } else if (visibleGroupId && !isExiting) {
      // Entanglement cleared - start exit animation
      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setVisibleGroupId(null);
        setIsExiting(false);
      }, ANIMATION_DURATION_MS);
    }
  }, [entanglementRevealedGroupId, visibleGroupId, isExiting]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  // Handle dismiss with exit animation
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    exitTimerRef.current = setTimeout(() => {
      setEntanglementRevealed(null);
      setVisibleGroupId(null);
      setIsExiting(false);
    }, ANIMATION_DURATION_MS);
  }, [setEntanglementRevealed]);

  // Auto-dismiss after configured duration
  useEffect(() => {
    if (entanglementRevealedGroupId && !isExiting) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, AUTO_DISMISS_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [entanglementRevealedGroupId, isExiting, handleDismiss]);

  // Don't render if no visible group ID
  if (!visibleGroupId) {
    return null;
  }

  return (
    <div
      className="
        pointer-events-none fixed bottom-[var(--inset-bottom)] left-[var(--inset-left)] sm:left-auto right-[var(--inset-right)] z-40
        flex flex-col items-end
      "
    >
      <div className="pointer-events-auto">
        <PanelContent
          entanglementGroupId={visibleGroupId}
          onDismiss={handleDismiss}
          isExiting={isExiting}
        />
      </div>
    </div>
  );
}
