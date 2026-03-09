"use client";

import { useMemo } from "react";
import { useGardenStore } from "@/stores/garden-store";
import { useAudio } from "@/lib/audio";
import {
  SeedIcon,
  SproutIcon,
  EyeIcon,
  SpeakerOnIcon,
  SpeakerOffIcon,
} from "@/components/garden/icons";

function StatusItem({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "gray" | "green" | "cyan" | "purple";
}) {
  const colorClasses = {
    gray: "text-[--wc-ink-muted]",
    green: "text-emerald-700",
    cyan: "text-cyan-700",
    purple: "text-purple-700",
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-[--wc-paper]/60 rounded">
      <div className="flex items-center gap-2">
        <span className={colorClasses[color]}>{icon}</span>
        <span className="text-xs text-[--wc-ink-muted]">{label}</span>
      </div>
      <span className={`text-sm font-mono ${colorClasses[color]}`}>{value}</span>
    </div>
  );
}

export function GardenTab() {
  const { plants, evolutionPaused, evolutionStats, lastGerminationTime } = useGardenStore();
  const { isEnabled: isSoundEnabled, toggleEnabled: toggleSound, init: initAudio } = useAudio();

  const { germinatedCount, dormantCount, observedCount } = useMemo(
    () => ({
      germinatedCount: plants.filter((p) => p.germinatedAt !== null).length,
      dormantCount: plants.filter((p) => p.germinatedAt === null).length,
      observedCount: plants.filter((p) => p.observed).length,
    }),
    [plants]
  );

  const handleSoundToggle = () => {
    initAudio();
    toggleSound();
  };

  const formatRelativeTime = (timestamp: number | null): string => {
    if (!timestamp) return "—";
    const diff = Date.now() - timestamp;
    if (diff < 10_000) return "just now";
    if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
    return `${Math.floor(diff / 3600_000)}h ago`;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Plant counts */}
      <section className="space-y-1.5">
        <StatusItem icon={<SeedIcon />} label="Dormant" value={dormantCount} color="gray" />
        <StatusItem icon={<SproutIcon />} label="Growing" value={germinatedCount} color="green" />
        <StatusItem icon={<EyeIcon />} label="Observed" value={observedCount} color="cyan" />
      </section>

      {/* Evolution state */}
      <section className="border-t border-[--wc-stone]/20 pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[--wc-ink-muted]">Evolution</span>
          <span className={evolutionPaused ? "text-amber-700" : "text-emerald-700"}>
            {evolutionPaused ? "Paused" : "Active"}
          </span>
        </div>
        {evolutionStats && (
          <div className="mt-2 text-xs text-[--wc-ink-muted] space-y-1">
            <div className="flex justify-between">
              <span>Tracked</span>
              <span className="text-cyan-700">{evolutionStats.trackedCount}</span>
            </div>
          </div>
        )}
        {lastGerminationTime && (
          <div className="mt-1 flex justify-between text-xs">
            <span className="text-[--wc-ink-muted]">Last germination</span>
            <span className="text-emerald-700">{formatRelativeTime(lastGerminationTime)}</span>
          </div>
        )}
      </section>

      {/* Sound toggle */}
      <section className="border-t border-[--wc-stone]/20 pt-3">
        <button
          onClick={handleSoundToggle}
          className={`
            w-full flex items-center justify-between px-3 py-2 rounded border transition-colors
            ${
              isSoundEnabled
                ? "bg-cyan-50/60 text-cyan-800 border-cyan-300/40"
                : "bg-[--wc-paper]/40 border-[--wc-stone]/20 text-[--wc-ink-soft] hover:bg-[--wc-paper]/70"
            }
          `}
        >
          <div className="flex items-center gap-2">
            {isSoundEnabled ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
            <span className="text-xs font-medium">{isSoundEnabled ? "Sound On" : "Sound Off"}</span>
          </div>
        </button>
      </section>
    </div>
  );
}
