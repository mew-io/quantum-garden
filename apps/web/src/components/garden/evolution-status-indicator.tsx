/**
 * EvolutionStatusIndicator - Shows real-time evolution system status
 *
 * Displays a compact indicator showing:
 * - Evolution system state (running/paused)
 * - Dormant plant count
 * - Time since last germination
 *
 * Designed to be subtle and non-intrusive while providing
 * at-a-glance visibility into garden evolution activity.
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useGardenStore } from "@/stores/garden-store";

/**
 * Format relative time since a timestamp.
 * Returns human-readable strings like "just now", "2m ago", "1h ago"
 */
function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return "—";

  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 10_000) return "just now";
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86400_000)}d ago`;
}

/**
 * Compact indicator showing evolution system status.
 * Positioned in the bottom-right, above the notifications area.
 */
export function EvolutionStatusIndicator() {
  const evolutionPaused = useGardenStore((state) => state.evolutionPaused);
  const evolutionStats = useGardenStore((state) => state.evolutionStats);
  const lastGerminationTime = useGardenStore((state) => state.lastGerminationTime);

  // Update relative time display periodically
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(interval);
  }, []);

  // Compute display values
  const relativeTime = useMemo(
    () => formatRelativeTime(lastGerminationTime),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lastGerminationTime, Math.floor(Date.now() / 10_000)] // Update every 10s
  );

  const dormantCount = evolutionStats?.dormantCount ?? 0;

  // Don't render if evolution system hasn't initialized
  if (!evolutionStats) {
    return null;
  }

  return (
    <div
      className="
        fixed z-40
        flex items-center gap-3
        px-3 py-2
        garden-panel rounded-lg
        text-xs
        animate-in fade-in slide-in-from-bottom-2 duration-300
      "
      style={{
        bottom: "calc(var(--inset-bottom) + 5rem)",
        right: "var(--inset-right)",
      }}
      role="status"
      aria-label={`Evolution ${evolutionPaused ? "paused" : "active"}, ${dormantCount} dormant plants, last germination ${relativeTime}`}
    >
      {/* Status indicator dot */}
      <div className="flex items-center gap-1.5">
        <span
          className={`
            w-2 h-2 rounded-full
            ${evolutionPaused ? "bg-amber-500" : "bg-green-500 animate-pulse"}
          `}
        />
        <span className={evolutionPaused ? "text-amber-700" : "text-emerald-700"}>
          {evolutionPaused ? "Paused" : "Evolving"}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-black/10" />

      {/* Dormant count */}
      <div className="flex items-center gap-1.5">
        <SeedIcon className="w-3 h-3 text-[--wc-ink-muted]" />
        <span className="text-[--wc-ink-soft]">
          {dormantCount} <span className="hidden sm:inline">dormant</span>
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-black/10" />

      {/* Last germination */}
      <div className="flex items-center gap-1.5">
        <SproutIcon className="w-3 h-3 text-[--wc-ink-muted]" />
        <span className="text-[--wc-ink-soft]">{relativeTime}</span>
      </div>
    </div>
  );
}

// Icons
function SeedIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22c4-4 8-7.582 8-12a8 8 0 10-16 0c0 4.418 4 8 8 12z" />
    </svg>
  );
}

function SproutIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 20h10M12 20v-8" />
      <path d="M12 12c-3 0-5-2-5-5 2 0 5 2 5 5z" />
      <path d="M12 12c3 0 5-2 5-5-2 0-5 2-5 5z" />
    </svg>
  );
}
