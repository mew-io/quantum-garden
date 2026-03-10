"use client";

import { useMemo } from "react";
import { useGardenStore } from "@/stores/garden-store";
import { SeedIcon, SproutIcon, EyeIcon } from "@/components/garden/icons";

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
  const { plants, lastGerminationTime } = useGardenStore();

  const { germinatedCount, dormantCount, observedCount } = useMemo(
    () => ({
      germinatedCount: plants.filter((p) => p.germinatedAt !== null).length,
      dormantCount: plants.filter((p) => p.germinatedAt === null).length,
      observedCount: plants.filter((p) => p.observed).length,
    }),
    [plants]
  );

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
        <StatusItem icon={<SeedIcon />} label="Seeds" value={dormantCount} color="gray" />
        <StatusItem icon={<SproutIcon />} label="Growing" value={germinatedCount} color="green" />
        <StatusItem icon={<EyeIcon />} label="Observed" value={observedCount} color="cyan" />
      </section>

      {/* Last germination */}
      {lastGerminationTime && (
        <section className="border-t border-[--wc-stone]/20 pt-3">
          <div className="flex justify-between text-xs">
            <span className="text-[--wc-ink-muted]">Last germination</span>
            <span className="text-emerald-700">{formatRelativeTime(lastGerminationTime)}</span>
          </div>
        </section>
      )}
    </div>
  );
}
