"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { useGardenStore } from "@/stores/garden-store";
import { useDebugLogs, filterLogs, debugLogger } from "@/lib/debug-logger";
import type { LogCategory, LogLevel } from "@/lib/debug-logger";
import type { Plant } from "@quantum-garden/shared";
import {
  BACKGROUND_ORDER,
  BACKGROUND_CONFIGS,
  type BackgroundType,
} from "../three/core/backgrounds";

interface DebugTabProps {
  isActive: boolean;
}

export function DebugTab({ isActive }: DebugTabProps) {
  const [superpositionMode, setSuperpositionMode] = useState<0 | 1>(0);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("clouds-static");
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "logs" | "plants">("overview");
  const [logFilters, setLogFilters] = useState<{
    categories: LogCategory[];
  }>({
    categories: ["quantum", "observation", "evolution", "rendering", "system"],
  });

  const performanceStats = useGardenStore((s) => s.performanceStats);

  const allLogs = useDebugLogs();
  const filteredLogs = filterLogs(allLogs, logFilters);

  const { data: plants } = trpc.plants.list.useQuery(undefined, {
    enabled: isActive,
    refetchInterval: isActive ? 2000 : false,
  });

  const { data: quantumConfig } = trpc.quantum.getConfig.useQuery(undefined, {
    enabled: isActive,
    refetchInterval: isActive ? 5000 : false,
  });

  const { data: jobStats } = trpc.quantum.getJobStats.useQuery(undefined, {
    enabled: isActive,
    refetchInterval: isActive ? 2000 : false,
  });

  const toggleSuperpositionMode = useCallback(() => {
    const newMode = superpositionMode === 0 ? 1 : 0;
    setSuperpositionMode(newMode);
    debugLogger.rendering.info(
      `Superposition mode changed to ${newMode === 0 ? "stacked ghosts" : "flickering"}`
    );
    window.dispatchEvent(
      new CustomEvent("superposition-mode-change", {
        detail: { mode: newMode },
      })
    );
  }, [superpositionMode]);

  const cycleBackground = useCallback(() => {
    const currentIndex = BACKGROUND_ORDER.indexOf(backgroundType);
    const nextIndex = (currentIndex + 1) % BACKGROUND_ORDER.length;
    const newType = BACKGROUND_ORDER[nextIndex]!;
    setBackgroundType(newType);
    debugLogger.rendering.info(`Background changed to ${newType}`);
    window.dispatchEvent(
      new CustomEvent("background-change", {
        detail: { type: newType },
      })
    );
  }, [backgroundType]);

  const toggleCategory = (category: LogCategory) => {
    setLogFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const observedCount = plants?.filter((p: Plant) => p.observed).length ?? 0;
  const germinatedCount = plants?.filter((p: Plant) => p.germinatedAt !== null).length ?? 0;
  const dormantCount = plants?.filter((p: Plant) => p.germinatedAt === null).length ?? 0;
  const totalCount = plants?.length ?? 0;
  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-[--wc-stone]/20 bg-[--wc-paper]/60 flex-shrink-0">
        {(["overview", "logs"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              activeSubTab === tab
                ? "text-emerald-700 border-b-2 border-emerald-600"
                : "text-[--wc-ink-muted] hover:text-[--wc-ink-soft]"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "logs" && filteredLogs.length > 0 && (
              <span className="ml-1 text-[--wc-ink-muted]">({filteredLogs.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Sub-tab Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {activeSubTab === "overview" && (
          <>
            {performanceStats && (
              <section>
                <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
                  Performance
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  <Stat
                    label="FPS"
                    value={performanceStats.fps.toFixed(0)}
                    color={
                      performanceStats.fps >= 55
                        ? "green"
                        : performanceStats.fps >= 30
                          ? "yellow"
                          : "red"
                    }
                  />
                  <Stat
                    label="Frame"
                    value={`${performanceStats.frameTimeMs.toFixed(1)}ms`}
                    color={
                      performanceStats.frameTimeMs <= 18
                        ? "green"
                        : performanceStats.frameTimeMs <= 33
                          ? "yellow"
                          : "red"
                    }
                  />
                  <Stat label="Draws" value={performanceStats.drawCalls} color="cyan" />
                  <Stat label="Tris" value={performanceStats.triangles} color="purple" />
                </div>
              </section>
            )}

            <section>
              <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
                Garden Stats
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Total" value={totalCount} />
                <Stat label="Germinated" value={germinatedCount} color="green" />
                <Stat label="Dormant" value={dormantCount} color="yellow" />
                <Stat label="Observed" value={observedCount} color="cyan" />
                <Stat label="Superposed" value={totalCount - observedCount} color="purple" />
              </div>
            </section>

            {quantumConfig && (
              <section>
                <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
                  Quantum Service
                </h4>
                <div className="bg-[--wc-paper]/60 rounded p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[--wc-ink-muted] text-xs">Execution Mode</span>
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded ${
                        quantumConfig.execution_mode === "simulator"
                          ? "bg-blue-50/60 text-blue-700"
                          : quantumConfig.execution_mode === "hardware"
                            ? "bg-purple-50/60 text-purple-700"
                            : "bg-black/5 text-[--wc-ink-muted]"
                      }`}
                    >
                      {quantumConfig.execution_mode.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[--wc-ink-muted]">IonQ API Key</span>
                    <span
                      className={
                        quantumConfig.ionq_api_key_configured
                          ? "text-emerald-700"
                          : "text-[--wc-ink-muted]"
                      }
                    >
                      {quantumConfig.ionq_api_key_configured ? "Configured" : "Not Set"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[--wc-ink-muted]">Default Shots</span>
                    <span className="text-cyan-700">{quantumConfig.default_shots}</span>
                  </div>
                </div>
              </section>
            )}

            {jobStats && (
              <section>
                <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
                  Quantum Jobs
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Stat label="Pending" value={jobStats.pending} />
                  <Stat label="Completed" value={jobStats.completed} color="green" />
                  <Stat label="Failed" value={jobStats.failed} color="red" />
                  <Stat label="Total" value={jobStats.total} />
                </div>
              </section>
            )}

            <section>
              <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
                Controls
              </h4>
              <div className="space-y-2">
                <button
                  onClick={toggleSuperpositionMode}
                  className="w-full py-2 px-3 bg-[--wc-paper]/60 hover:bg-[--wc-paper] text-[--wc-ink-soft] rounded flex items-center justify-between"
                >
                  <span className="text-xs">Superposition Display</span>
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded ${
                      superpositionMode === 0
                        ? "bg-purple-50/60 text-purple-700"
                        : "bg-cyan-50/60 text-cyan-700"
                    }`}
                  >
                    {superpositionMode === 0 ? "GHOSTS" : "FLICKER"}
                  </span>
                </button>
                <button
                  onClick={cycleBackground}
                  className="w-full py-2 px-3 bg-[--wc-paper]/60 hover:bg-[--wc-paper] text-[--wc-ink-soft] rounded flex items-center justify-between"
                >
                  <span className="text-xs">Background</span>
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded ${
                      backgroundType === "clouds" || backgroundType === "clouds-static"
                        ? "bg-sky-50/60 text-sky-700"
                        : backgroundType === "parchment"
                          ? "bg-amber-50/60 text-amber-700"
                          : "bg-black/5 text-[--wc-ink-muted]"
                    }`}
                  >
                    {BACKGROUND_CONFIGS[backgroundType].label}
                  </span>
                </button>
              </div>
            </section>
          </>
        )}

        {activeSubTab === "logs" && (
          <>
            <section>
              <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
                Filters
              </h4>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {(
                    ["quantum", "observation", "evolution", "rendering", "system"] as LogCategory[]
                  ).map((cat) => (
                    <DebugFilterChip
                      key={cat}
                      label={cat}
                      active={logFilters.categories.includes(cat)}
                      onClick={() => toggleCategory(cat)}
                      color={getCategoryColor(cat)}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide">
                  Messages ({filteredLogs.length})
                </h4>
                <button
                  onClick={() => debugLogger.clear()}
                  className="text-xs text-[--wc-ink-muted] hover:text-[--wc-ink-soft]"
                >
                  Clear
                </button>
              </div>
              <div className="bg-[--wc-paper]/60 rounded max-h-96 overflow-auto">
                {filteredLogs.length === 0 ? (
                  <div className="p-4 text-center text-[--wc-ink-muted] text-xs">
                    No log messages
                  </div>
                ) : (
                  <div className="divide-y divide-[--wc-stone]/20">
                    {[...filteredLogs].reverse().map((log) => (
                      <LogEntryRow key={log.id} log={log} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Helper components
// ============================================================================

function Stat({
  label,
  value,
  color = "white",
}: {
  label: string;
  value: string | number;
  color?: "white" | "red" | "green" | "yellow" | "cyan" | "purple";
}) {
  const prevValueRef = useRef<string | number>(value);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const colorClass = {
    white: "text-[--wc-ink]",
    red: "text-red-700",
    green: "text-emerald-700",
    yellow: "text-yellow-700",
    cyan: "text-cyan-700",
    purple: "text-purple-700",
  }[color];

  const flashClass = isFlashing
    ? color === "green"
      ? "bg-emerald-100/40"
      : color === "red"
        ? "bg-red-100/40"
        : color === "yellow"
          ? "bg-yellow-100/40"
          : color === "cyan"
            ? "bg-cyan-100/40"
            : color === "purple"
              ? "bg-purple-100/40"
              : "bg-black/5"
    : "";

  return (
    <div
      className={`bg-[--wc-paper]/60 rounded px-3 py-2 transition-colors duration-300 ${flashClass}`}
    >
      <div className="text-[--wc-ink-muted] text-xs">{label}</div>
      <div className={`font-mono transition-opacity duration-150 ${colorClass}`}>{value}</div>
    </div>
  );
}

function DebugFilterChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2 py-1 rounded border transition-colors ${
        active
          ? `${color} border-current`
          : "text-[--wc-ink-muted] border-[--wc-stone]/30 hover:border-[--wc-stone]/50"
      }`}
    >
      {label}
    </button>
  );
}

function getCategoryColor(category: LogCategory): string {
  const colors: Record<LogCategory, string> = {
    quantum: "text-purple-700",
    observation: "text-blue-700",
    evolution: "text-emerald-700",
    rendering: "text-yellow-700",
    system: "text-[--wc-ink-muted]",
  };
  return colors[category];
}

function getLevelColor(level: LogLevel): string {
  const colors: Record<LogLevel, string> = {
    debug: "text-[--wc-ink-muted]",
    info: "text-blue-700",
    warn: "text-amber-700",
    error: "text-red-700",
  };
  return colors[level];
}

function LogEntryRow({
  log,
}: {
  log: {
    id: string;
    timestamp: Date;
    level: LogLevel;
    category: LogCategory;
    message: string;
    data?: unknown;
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const time = log.timestamp.toLocaleTimeString("en-US", { hour12: false });

  return (
    <div
      className={`px-3 py-2 text-xs cursor-pointer hover:bg-black/5 ${
        log.level === "error" ? "bg-red-50/40" : log.level === "warn" ? "bg-amber-50/40" : ""
      }`}
      onClick={() => log.data && setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2">
        <span className="text-[--wc-ink-muted]/60 font-mono shrink-0">{time}</span>
        <span className={`shrink-0 ${getCategoryColor(log.category)}`}>[{log.category}]</span>
        <span className={getLevelColor(log.level)}>{log.message}</span>
      </div>
      {expanded && log.data !== undefined && (
        <pre className="mt-2 p-2 bg-[--wc-paper]/80 rounded text-[--wc-ink-soft] overflow-x-auto">
          {String(JSON.stringify(log.data, null, 2))}
        </pre>
      )}
    </div>
  );
}
