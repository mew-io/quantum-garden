"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { useGardenStore } from "@/stores/garden-store";
import { useDebugLogs, filterLogs, debugLogger } from "@/lib/debug-logger";
import {
  getUIPreferences,
  resetAllUIPreferences,
  UI_PREFERENCE_LABELS,
} from "@/lib/ui-preferences";
import type { LogCategory, LogLevel } from "@/lib/debug-logger";
import type { Plant } from "@quantum-garden/shared";

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

interface DebugTabProps {
  isActive: boolean;
}

export function DebugTab({ isActive }: DebugTabProps) {
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [observationMode, setObservationMode] = useState<"region" | "click">("region");
  const [showModeConfirm, setShowModeConfirm] = useState(false);
  const [superpositionMode, setSuperpositionMode] = useState<0 | 1>(0);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "logs" | "plants">("overview");
  const [logFilters, setLogFilters] = useState<{
    categories: LogCategory[];
    levels: LogLevel[];
  }>({
    categories: ["quantum", "observation", "evolution", "rendering", "system"],
    levels: ["debug", "info", "warn", "error"],
  });

  const {
    evolutionPaused,
    evolutionStats,
    lastGerminationTime,
    notifications,
    observationContext,
    performanceStats,
  } = useGardenStore();

  const allLogs = useDebugLogs();
  const filteredLogs = filterLogs(allLogs, logFilters);

  const { data: plants, refetch: refetchPlants } = trpc.plants.list.useQuery(undefined, {
    enabled: isActive,
    refetchInterval: isActive ? 2000 : false,
  });

  const { data: quantumConfig, refetch: refetchConfig } = trpc.quantum.getConfig.useQuery(
    undefined,
    {
      enabled: isActive,
      refetchInterval: isActive ? 5000 : false,
    }
  );

  const { data: jobStats, refetch: refetchJobStats } = trpc.quantum.getJobStats.useQuery(
    undefined,
    {
      enabled: isActive,
      refetchInterval: isActive ? 2000 : false,
    }
  );

  // Listen for plant selection events from the canvas
  useEffect(() => {
    const handlePlantSelect = (e: CustomEvent<{ plantId: string }>) => {
      setSelectedPlantId(e.detail.plantId);
    };

    window.addEventListener(
      "plant-debug-select" as keyof WindowEventMap,
      handlePlantSelect as EventListener
    );
    return () =>
      window.removeEventListener(
        "plant-debug-select" as keyof WindowEventMap,
        handlePlantSelect as EventListener
      );
  }, []);

  const requestModeChange = useCallback(() => {
    setShowModeConfirm(true);
  }, []);

  const confirmModeChange = useCallback(() => {
    const newMode = observationMode === "region" ? "click" : "region";
    setObservationMode(newMode);
    setShowModeConfirm(false);
    debugLogger.observation.info(`Observation mode changed to ${newMode}`);
    window.dispatchEvent(
      new CustomEvent("observation-mode-change", {
        detail: { mode: newMode, debugMode: newMode === "click" },
      })
    );
  }, [observationMode]);

  const cancelModeChange = useCallback(() => {
    setShowModeConfirm(false);
  }, []);

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

  const toggleCategory = (category: LogCategory) => {
    setLogFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleLevel = (level: LogLevel) => {
    setLogFilters((prev) => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter((l) => l !== level)
        : [...prev.levels, level],
    }));
  };

  const observedCount = plants?.filter((p: Plant) => p.observed).length ?? 0;
  const germinatedCount = plants?.filter((p: Plant) => p.germinatedAt !== null).length ?? 0;
  const dormantCount = plants?.filter((p: Plant) => p.germinatedAt === null).length ?? 0;
  const totalCount = plants?.length ?? 0;
  const selectedPlant = plants?.find((p: Plant) => p.id === selectedPlantId);

  return (
    <div className="flex flex-col h-full relative">
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-[--wc-stone]/20 bg-[--wc-paper]/60 flex-shrink-0">
        {(["overview", "logs", "plants"] as const).map((tab) => (
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
      <div className="flex-1 overflow-auto p-4 space-y-4">
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
                System State
              </h4>
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  label="Evolution"
                  active={!evolutionPaused}
                  activeColor="green"
                  inactiveText="Paused"
                />
                <StatusBadge
                  label="Observation"
                  active={observationMode === "region"}
                  activeColor="blue"
                  activeText="Region"
                  inactiveText="Click"
                  inactiveColor="amber"
                />
                {observationContext && (
                  <StatusBadge
                    label="Context Panel"
                    active={true}
                    activeColor="cyan"
                    activeText="Visible"
                  />
                )}
              </div>
              {evolutionStats && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="text-[--wc-ink-muted]">
                    Dormant: <span className="text-yellow-700">{evolutionStats.dormantCount}</span>
                  </span>
                  <span className="text-[--wc-ink-muted]">
                    Tracked: <span className="text-cyan-700">{evolutionStats.trackedCount}</span>
                  </span>
                  {lastGerminationTime && (
                    <span className="text-[--wc-ink-muted]">
                      Last germination:{" "}
                      <span className="text-emerald-700">
                        {formatRelativeTime(lastGerminationTime)}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </section>

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
                <Stat label="Notifications" value={notifications.length} />
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
                  onClick={requestModeChange}
                  className="w-full py-2 px-3 bg-[--wc-paper]/60 hover:bg-[--wc-paper] text-[--wc-ink-soft] rounded flex items-center justify-between"
                >
                  <span className="text-xs">Toggle Observation Mode</span>
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded ${
                      observationMode === "region"
                        ? "bg-emerald-50/60 text-emerald-700"
                        : "bg-amber-50/60 text-amber-700"
                    }`}
                  >
                    {observationMode === "region" ? "REGION" : "CLICK"}
                  </span>
                </button>
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
              </div>
            </section>

            <section>
              <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
                UI Preferences
              </h4>
              <UIPreferencesSection />
            </section>

            <section>
              <div className="flex justify-between items-center">
                <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide">Actions</h4>
              </div>
              <button
                onClick={() => {
                  refetchPlants();
                  refetchConfig();
                  refetchJobStats();
                  debugLogger.system.debug("Manual refresh triggered");
                }}
                className="mt-2 w-full py-1.5 bg-[--wc-paper] hover:bg-[--wc-stone]/30 text-[--wc-ink-soft] rounded text-xs"
              >
                Refresh All
              </button>
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
                <div className="flex flex-wrap gap-1">
                  {(["debug", "info", "warn", "error"] as LogLevel[]).map((level) => (
                    <DebugFilterChip
                      key={level}
                      label={level}
                      active={logFilters.levels.includes(level)}
                      onClick={() => toggleLevel(level)}
                      color={getLevelColor(level)}
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

        {activeSubTab === "plants" && (
          <>
            {selectedPlant && (
              <section>
                <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
                  Selected Plant
                </h4>
                <div className="bg-[--wc-paper]/60 rounded p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[--wc-ink-muted]">ID</span>
                    <span className="text-[--wc-ink-soft] font-mono text-xs">
                      {selectedPlant.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[--wc-ink-muted]">Variant</span>
                    <span className="text-emerald-700">{selectedPlant.variantId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[--wc-ink-muted]">Position</span>
                    <span className="text-cyan-700 font-mono text-xs">
                      ({selectedPlant.position.x.toFixed(0)}, {selectedPlant.position.y.toFixed(0)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[--wc-ink-muted]">State</span>
                    <span className={selectedPlant.observed ? "text-yellow-700" : "text-blue-700"}>
                      {selectedPlant.visualState}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[--wc-ink-muted]">Germinated</span>
                    <span
                      className={
                        selectedPlant.germinatedAt ? "text-emerald-700" : "text-[--wc-ink-muted]"
                      }
                    >
                      {selectedPlant.germinatedAt ? "Yes" : "No (dormant)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[--wc-ink-muted]">Entangled</span>
                    <span
                      className={
                        selectedPlant.entanglementGroupId
                          ? "text-purple-700"
                          : "text-[--wc-ink-muted]"
                      }
                    >
                      {selectedPlant.entanglementGroupId ? "Yes" : "No"}
                    </span>
                  </div>
                  {selectedPlant.traits && (
                    <>
                      <div className="border-t border-[--wc-stone]/20 pt-2 mt-2">
                        <span className="text-[--wc-ink-muted] text-xs">Traits (Resolved)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[--wc-ink-muted]">Growth Rate</span>
                        <span className="text-cyan-700">
                          {selectedPlant.traits.growthRate?.toFixed(2) ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[--wc-ink-muted]">Opacity</span>
                        <span className="text-cyan-700">
                          {selectedPlant.traits.opacity?.toFixed(2) ?? "—"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            <section>
              <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
                All Plants ({totalCount})
              </h4>
              <div className="max-h-64 overflow-auto space-y-1">
                {plants?.map((plant: Plant) => (
                  <button
                    key={plant.id}
                    onClick={() => {
                      setSelectedPlantId(plant.id);
                      window.dispatchEvent(
                        new CustomEvent("plant-debug-highlight", {
                          detail: { plantId: plant.id },
                        })
                      );
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex justify-between items-center ${
                      plant.id === selectedPlantId
                        ? "bg-blue-50/60 text-blue-700"
                        : "hover:bg-[--wc-paper]/60 text-[--wc-ink-muted]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          plant.observed
                            ? "bg-yellow-400"
                            : plant.germinatedAt
                              ? "bg-green-500"
                              : "bg-[--wc-stone]/40"
                        }`}
                      />
                      <span>{plant.variantId}</span>
                    </div>
                    <span className="text-[--wc-ink-muted]/60 font-mono">
                      {plant.id.slice(0, 6)}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Observation Mode Change Confirmation Dialog */}
      {showModeConfirm && (
        <div className="absolute inset-0 bg-[#3A352E]/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="bg-[--wc-cream] rounded-lg border border-[--wc-stone]/30 p-4 mx-4 max-w-xs shadow-xl">
            <h4 className="text-[--wc-ink] font-medium mb-2">Switch Observation Mode?</h4>
            <p className="text-[--wc-ink-soft] text-xs mb-4">
              {observationMode === "region"
                ? "Switching to Click mode allows direct click observation (debug only)."
                : "Switching to Region mode enables automatic dwell-based observation."}
            </p>
            <div className="flex gap-2">
              <button
                onClick={cancelModeChange}
                className="flex-1 py-2 px-3 bg-[--wc-paper] hover:bg-[--wc-stone]/30 text-[--wc-ink-soft] rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmModeChange}
                className="flex-1 py-2 px-3 bg-[--wc-bark] hover:bg-[#6A5E4D] text-white rounded text-xs"
              >
                Switch Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components

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

function StatusBadge({
  label,
  active,
  activeColor,
  activeText,
  inactiveText,
  inactiveColor = "gray",
}: {
  label: string;
  active: boolean;
  activeColor: "green" | "blue" | "purple" | "cyan" | "amber";
  activeText?: string;
  inactiveText?: string;
  inactiveColor?: "gray" | "amber";
}) {
  const colorClasses = {
    green: "bg-emerald-50/60 text-emerald-700 border-emerald-300/40",
    blue: "bg-blue-50/60 text-blue-700 border-blue-300/40",
    purple: "bg-purple-50/60 text-purple-700 border-purple-300/40",
    cyan: "bg-cyan-50/60 text-cyan-700 border-cyan-300/40",
    amber: "bg-amber-50/60 text-amber-700 border-amber-300/40",
    gray: "bg-black/5 text-[--wc-ink-muted] border-[--wc-stone]/30",
  };

  const className = active ? colorClasses[activeColor] : colorClasses[inactiveColor];
  const text = active ? (activeText ?? "Active") : (inactiveText ?? "Inactive");

  return (
    <div className={`text-xs px-2 py-1 rounded border transition-all duration-300 ${className}`}>
      <span className="opacity-60">{label}:</span> {text}
    </div>
  );
}

function UIPreferencesSection() {
  const [preferences, setPreferences] = useState(() => getUIPreferences());
  const [showConfirm, setShowConfirm] = useState(false);

  const dismissedCount = Object.values(preferences).filter(Boolean).length;

  const handleReset = () => {
    resetAllUIPreferences();
    setPreferences(getUIPreferences());
    setShowConfirm(false);
    debugLogger.system.info("UI preferences reset");
  };

  if (dismissedCount === 0) {
    return (
      <div className="bg-[--wc-paper]/60 rounded p-3 text-xs text-[--wc-ink-muted]">
        No dismissed UI elements
      </div>
    );
  }

  return (
    <div className="bg-[--wc-paper]/60 rounded p-3 space-y-2">
      <div className="text-xs text-[--wc-ink-muted] mb-2">
        Dismissed UI elements ({dismissedCount}):
      </div>
      <div className="space-y-1">
        {(Object.keys(UI_PREFERENCE_LABELS) as Array<keyof typeof UI_PREFERENCE_LABELS>).map(
          (key) =>
            preferences[key] && (
              <div key={key} className="flex items-center gap-2 text-xs text-[--wc-ink-muted]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
                {UI_PREFERENCE_LABELS[key]}
              </div>
            )
        )}
      </div>
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full mt-2 py-1.5 px-3 bg-[--wc-paper] hover:bg-[--wc-stone]/30 text-[--wc-ink-soft] rounded text-xs"
        >
          Reset All Preferences
        </button>
      ) : (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-amber-700">
            This will restore all dismissed panels and hints.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-1.5 px-2 bg-[--wc-paper] hover:bg-[--wc-stone]/30 text-[--wc-ink-soft] rounded text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-1.5 px-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs"
            >
              Reset
            </button>
          </div>
        </div>
      )}
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
