/**
 * EvolutionPausedIndicator - Shows when evolution is paused during time-travel
 *
 * Displays a subtle indicator that the garden evolution system is paused.
 * This helps users understand why no new germinations are occurring
 * while they're viewing historical states.
 */

"use client";

import { useGardenStore } from "@/stores/garden-store";

/**
 * Indicator shown when evolution is paused (typically during time-travel).
 * Positioned near the top of the screen to be visible but not intrusive.
 */
export function EvolutionPausedIndicator() {
  const isTimeTravelMode = useGardenStore((state) => state.isTimeTravelMode);
  const evolutionPaused = useGardenStore((state) => state.evolutionPaused);

  // Only show when in time-travel mode AND evolution is paused
  if (!isTimeTravelMode || !evolutionPaused) {
    return null;
  }

  return (
    <div
      className="
        fixed top-20 left-1/2 -translate-x-1/2 z-40
        flex items-center gap-2
        px-4 py-2
        bg-amber-900/80 backdrop-blur-sm
        border border-amber-500/30
        rounded-full
        text-amber-200 text-sm
        shadow-lg
        animate-in fade-in slide-in-from-top-2 duration-300
        pointer-events-none
      "
      role="status"
      aria-live="polite"
    >
      {/* Pause icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="opacity-80">
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
      <span>Evolution Paused</span>
    </div>
  );
}
