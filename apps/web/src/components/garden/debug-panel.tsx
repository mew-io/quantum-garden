"use client";

import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { useGardenStore } from "@/stores/garden-store";
import { useDebugLogs, filterLogs, debugLogger } from "@/lib/debug-logger";
import type { LogCategory, LogLevel } from "@/lib/debug-logger";
import type { Plant } from "@quantum-garden/shared";

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
 * Check if debug mode is enabled via environment variable.
 * In production, set NEXT_PUBLIC_DEBUG_ENABLED=false to hide debug features.
 * Defaults to true in development for convenience.
 */
const isDebugEnabled =
  process.env.NEXT_PUBLIC_DEBUG_ENABLED !== "false" && process.env.NODE_ENV !== "production";

interface DebugPanelProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

/**
 * Debug panel for viewing quantum garden internals.
 * Toggle with backtick (`) key or via toolbar button.
 *
 * Features:
 * - Garden overview statistics
 * - Quantum service status and configuration
 * - Observation system mode toggle
 * - Live log message display with filtering
 * - System state indicators
 * - Selected plant details
 *
 * Note: Debug panel is disabled in production by default.
 * Set NEXT_PUBLIC_DEBUG_ENABLED=true to enable in production.
 */
export function DebugPanel({ isOpen, onToggle }: DebugPanelProps) {
  const [internalVisible, setInternalVisible] = useState(false);

  // Use external control if provided, otherwise internal state
  // Debug disabled check happens at render time, not before hooks
  const isVisible = isDebugEnabled && (isOpen !== undefined ? isOpen : internalVisible);
  const setIsVisible = (value: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof value === "function" ? value(isVisible) : value;
    if (onToggle) {
      onToggle(newValue);
    } else {
      setInternalVisible(newValue);
    }
  };
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [observationMode, setObservationMode] = useState<"region" | "click">("region");
  const [showModeConfirm, setShowModeConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "plants">("overview");
  const [logFilters, setLogFilters] = useState<{
    categories: LogCategory[];
    levels: LogLevel[];
  }>({
    categories: ["quantum", "observation", "evolution", "rendering", "system"],
    levels: ["debug", "info", "warn", "error"],
  });

  // Get garden store state
  const {
    isTimeTravelMode,
    evolutionPaused,
    evolutionStats,
    lastGerminationTime,
    notifications,
    observationContext,
    performanceStats,
  } = useGardenStore();

  // Get debug logs
  const allLogs = useDebugLogs();
  const filteredLogs = filterLogs(allLogs, logFilters);

  // Fetch all plants for overview
  const { data: plants, refetch: refetchPlants } = trpc.plants.list.useQuery(undefined, {
    enabled: isVisible,
    refetchInterval: isVisible ? 2000 : false,
  });

  // Fetch quantum service configuration
  const { data: quantumConfig, refetch: refetchConfig } = trpc.quantum.getConfig.useQuery(
    undefined,
    {
      enabled: isVisible,
      refetchInterval: isVisible ? 5000 : false,
    }
  );

  // Fetch job queue statistics
  const { data: jobStats, refetch: refetchJobStats } = trpc.quantum.getJobStats.useQuery(
    undefined,
    {
      enabled: isVisible,
      refetchInterval: isVisible ? 2000 : false,
    }
  );

  // Toggle visibility with backtick key (only when not externally controlled and debug is enabled)
  useEffect(() => {
    // Skip if debug is disabled or externally controlled
    if (!isDebugEnabled || isOpen !== undefined) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "`" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsVisible((v) => {
          const newVisibility = !v;
          window.dispatchEvent(
            new CustomEvent("debug-visibility-change", {
              detail: { visible: newVisibility },
            })
          );
          // Log visibility change
          if (newVisibility) {
            debugLogger.system.info("Debug panel opened");
          }
          return newVisibility;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Sync debug overlay visibility when isVisible changes from external control (toolbar button)
  useEffect(() => {
    // Only dispatch if using external control (isOpen prop is defined)
    if (isOpen !== undefined) {
      window.dispatchEvent(
        new CustomEvent("debug-visibility-change", {
          detail: { visible: isOpen },
        })
      );
      if (isOpen) {
        debugLogger.system.info("Debug panel opened via toolbar");
      }
    }
  }, [isOpen]);

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

  // Show confirmation dialog before switching observation mode
  const requestModeChange = useCallback(() => {
    setShowModeConfirm(true);
  }, []);

  // Actually perform the observation mode change after confirmation
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

  // Cancel the mode change
  const cancelModeChange = useCallback(() => {
    setShowModeConfirm(false);
  }, []);

  // Toggle category filter
  const toggleCategory = (category: LogCategory) => {
    setLogFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  // Toggle level filter
  const toggleLevel = (level: LogLevel) => {
    setLogFilters((prev) => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter((l) => l !== level)
        : [...prev.levels, level],
    }));
  };

  if (!isVisible) {
    return null;
  }

  const observedCount = plants?.filter((p: Plant) => p.observed).length ?? 0;
  const germinatedCount = plants?.filter((p: Plant) => p.germinatedAt !== null).length ?? 0;
  const dormantCount = plants?.filter((p: Plant) => p.germinatedAt === null).length ?? 0;
  const totalCount = plants?.length ?? 0;
  const selectedPlant = plants?.find((p: Plant) => p.id === selectedPlantId);

  return (
    <div className="fixed top-[var(--inset-top)] right-[var(--inset-right)] z-50 w-96 max-h-[85vh] overflow-hidden bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-2xl text-sm flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900 px-4 py-3 border-b border-gray-700/50 flex justify-between items-center">
        <h3 className="text-gray-100 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Quantum Debug
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-300 text-xs"
        >
          [`] to close
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700/50 bg-gray-800/50">
        {(["overview", "logs", "plants"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === tab
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "logs" && filteredLogs.length > 0 && (
              <span className="ml-1 text-gray-500">({filteredLogs.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {activeTab === "overview" && (
          <>
            {/* Performance Metrics */}
            {performanceStats && (
              <section>
                <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">Performance</h4>
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

            {/* System State Indicators */}
            <section>
              <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">System State</h4>
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  label="Evolution"
                  active={!evolutionPaused}
                  activeColor="green"
                  inactiveText="Paused"
                />
                <StatusBadge
                  label="Time Travel"
                  active={isTimeTravelMode}
                  activeColor="purple"
                  inactiveText="Off"
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
              {/* Evolution Stats from Store */}
              {evolutionStats && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="text-gray-500">
                    Dormant: <span className="text-yellow-400">{evolutionStats.dormantCount}</span>
                  </span>
                  <span className="text-gray-500">
                    Tracked: <span className="text-cyan-400">{evolutionStats.trackedCount}</span>
                  </span>
                  {lastGerminationTime && (
                    <span className="text-gray-500">
                      Last germination:{" "}
                      <span className="text-green-400">
                        {formatRelativeTime(lastGerminationTime)}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </section>

            {/* Garden Overview */}
            <section>
              <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">Garden Stats</h4>
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Total" value={totalCount} />
                <Stat label="Germinated" value={germinatedCount} color="green" />
                <Stat label="Dormant" value={dormantCount} color="yellow" />
                <Stat label="Observed" value={observedCount} color="cyan" />
                <Stat label="Superposed" value={totalCount - observedCount} color="purple" />
                <Stat label="Notifications" value={notifications.length} />
              </div>
            </section>

            {/* Quantum Service Status */}
            {quantumConfig && (
              <section>
                <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">
                  Quantum Service
                </h4>
                <div className="bg-gray-800/50 rounded p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">Execution Mode</span>
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded ${
                        quantumConfig.execution_mode === "simulator"
                          ? "bg-blue-900/50 text-blue-300"
                          : quantumConfig.execution_mode === "hardware"
                            ? "bg-purple-900/50 text-purple-300"
                            : "bg-gray-700/50 text-gray-400"
                      }`}
                    >
                      {quantumConfig.execution_mode.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">IonQ API Key</span>
                    <span
                      className={
                        quantumConfig.ionq_api_key_configured ? "text-green-400" : "text-gray-500"
                      }
                    >
                      {quantumConfig.ionq_api_key_configured ? "Configured" : "Not Set"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Default Shots</span>
                    <span className="text-cyan-400">{quantumConfig.default_shots}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Job Queue Stats */}
            {jobStats && (
              <section>
                <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">Quantum Jobs</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Stat label="Pending" value={jobStats.pending} />
                  <Stat label="Completed" value={jobStats.completed} color="green" />
                  <Stat label="Failed" value={jobStats.failed} color="red" />
                  <Stat label="Total" value={jobStats.total} />
                </div>
              </section>
            )}

            {/* Observation Mode Toggle */}
            <section>
              <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">Controls</h4>
              <div className="space-y-2">
                <button
                  onClick={requestModeChange}
                  className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded flex items-center justify-between"
                >
                  <span className="text-xs">Toggle Observation Mode</span>
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded ${
                      observationMode === "region"
                        ? "bg-green-900/50 text-green-300"
                        : "bg-amber-900/50 text-amber-300"
                    }`}
                  >
                    {observationMode === "region" ? "REGION" : "CLICK"}
                  </span>
                </button>
              </div>
            </section>

            {/* Keyboard Shortcuts */}
            <section>
              <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">
                Keyboard Shortcuts
              </h4>
              <div className="bg-gray-800/50 rounded p-3 space-y-1 text-xs">
                <ShortcutRow shortcut="`" description="Toggle debug panel" />
                <ShortcutRow shortcut="T" description="Toggle time-travel mode" />
              </div>
            </section>
          </>
        )}

        {activeTab === "logs" && (
          <>
            {/* Log Filters */}
            <section>
              <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">Filters</h4>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {(
                    ["quantum", "observation", "evolution", "rendering", "system"] as LogCategory[]
                  ).map((cat) => (
                    <FilterChip
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
                    <FilterChip
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

            {/* Log Messages */}
            <section>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-gray-400 text-xs uppercase tracking-wide">
                  Messages ({filteredLogs.length})
                </h4>
                <button
                  onClick={() => debugLogger.clear()}
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  Clear
                </button>
              </div>
              <div className="bg-gray-800/50 rounded max-h-96 overflow-auto">
                {filteredLogs.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-xs">No log messages</div>
                ) : (
                  <div className="divide-y divide-gray-700/30">
                    {[...filteredLogs].reverse().map((log) => (
                      <LogEntryRow key={log.id} log={log} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {activeTab === "plants" && (
          <>
            {/* Selected Plant Details */}
            {selectedPlant && (
              <section>
                <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">
                  Selected Plant
                </h4>
                <div className="bg-gray-800/50 rounded p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID</span>
                    <span className="text-gray-300 font-mono text-xs">
                      {selectedPlant.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Variant</span>
                    <span className="text-green-400">{selectedPlant.variantId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Position</span>
                    <span className="text-cyan-400 font-mono text-xs">
                      ({selectedPlant.position.x.toFixed(0)}, {selectedPlant.position.y.toFixed(0)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">State</span>
                    <span className={selectedPlant.observed ? "text-yellow-400" : "text-blue-400"}>
                      {selectedPlant.visualState}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Germinated</span>
                    <span
                      className={selectedPlant.germinatedAt ? "text-green-400" : "text-gray-500"}
                    >
                      {selectedPlant.germinatedAt ? "Yes" : "No (dormant)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Entangled</span>
                    <span
                      className={
                        selectedPlant.entanglementGroupId ? "text-purple-400" : "text-gray-500"
                      }
                    >
                      {selectedPlant.entanglementGroupId ? "Yes" : "No"}
                    </span>
                  </div>
                  {selectedPlant.traits && (
                    <>
                      <div className="border-t border-gray-700/50 pt-2 mt-2">
                        <span className="text-gray-400 text-xs">Traits (Resolved)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Growth Rate</span>
                        <span className="text-cyan-400">
                          {selectedPlant.traits.growthRate?.toFixed(2) ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Opacity</span>
                        <span className="text-cyan-400">
                          {selectedPlant.traits.opacity?.toFixed(2) ?? "—"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            {/* Plant List */}
            <section>
              <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">
                All Plants ({totalCount})
              </h4>
              <div className="max-h-64 overflow-auto space-y-1">
                {plants?.map((plant: Plant) => (
                  <button
                    key={plant.id}
                    onClick={() => {
                      setSelectedPlantId(plant.id);
                      // Dispatch event to highlight plant in debug overlay
                      window.dispatchEvent(
                        new CustomEvent("plant-debug-highlight", {
                          detail: { plantId: plant.id },
                        })
                      );
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex justify-between items-center ${
                      plant.id === selectedPlantId
                        ? "bg-blue-900/50 text-blue-200"
                        : "hover:bg-gray-800 text-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          plant.observed
                            ? "bg-yellow-400"
                            : plant.germinatedAt
                              ? "bg-green-400"
                              : "bg-gray-600"
                        }`}
                      />
                      <span>{plant.variantId}</span>
                    </div>
                    <span className="text-gray-600 font-mono">{plant.id.slice(0, 6)}</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700/50 px-4 py-2 bg-gray-800/50">
        <button
          onClick={() => {
            refetchPlants();
            refetchConfig();
            refetchJobStats();
            debugLogger.system.debug("Manual refresh triggered");
          }}
          className="w-full py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs"
        >
          Refresh All
        </button>
      </div>

      {/* Observation Mode Change Confirmation Dialog */}
      {showModeConfirm && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mx-4 max-w-xs shadow-xl">
            <h4 className="text-gray-100 font-medium mb-2">Switch Observation Mode?</h4>
            <p className="text-gray-400 text-xs mb-4">
              {observationMode === "region"
                ? "Switching to Click mode allows direct click observation (debug only)."
                : "Switching to Region mode enables automatic dwell-based observation."}
            </p>
            <div className="flex gap-2">
              <button
                onClick={cancelModeChange}
                className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmModeChange}
                className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs"
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

// Helper Components

function Stat({
  label,
  value,
  color = "white",
}: {
  label: string;
  value: string | number;
  color?: "white" | "red" | "green" | "yellow" | "cyan" | "purple";
}) {
  const colorClass = {
    white: "text-gray-100",
    red: "text-red-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    cyan: "text-cyan-400",
    purple: "text-purple-400",
  }[color];

  return (
    <div className="bg-gray-800/50 rounded px-3 py-2">
      <div className="text-gray-500 text-xs">{label}</div>
      <div className={`font-mono ${colorClass}`}>{value}</div>
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
    green: "bg-green-900/50 text-green-300 border-green-700/50",
    blue: "bg-blue-900/50 text-blue-300 border-blue-700/50",
    purple: "bg-purple-900/50 text-purple-300 border-purple-700/50",
    cyan: "bg-cyan-900/50 text-cyan-300 border-cyan-700/50",
    amber: "bg-amber-900/50 text-amber-300 border-amber-700/50",
    gray: "bg-gray-800/50 text-gray-500 border-gray-700/50",
  };

  const className = active ? colorClasses[activeColor] : colorClasses[inactiveColor];
  const text = active ? (activeText ?? "Active") : (inactiveText ?? "Inactive");

  return (
    <div className={`text-xs px-2 py-1 rounded border ${className}`}>
      <span className="opacity-60">{label}:</span> {text}
    </div>
  );
}

function ShortcutRow({ shortcut, description }: { shortcut: string; description: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{description}</span>
      <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-gray-300 font-mono">{shortcut}</kbd>
    </div>
  );
}

function FilterChip({
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
        active ? `${color} border-current` : "text-gray-500 border-gray-700 hover:border-gray-600"
      }`}
    >
      {label}
    </button>
  );
}

function getCategoryColor(category: LogCategory): string {
  const colors: Record<LogCategory, string> = {
    quantum: "text-purple-400",
    observation: "text-blue-400",
    evolution: "text-green-400",
    rendering: "text-yellow-400",
    system: "text-gray-400",
  };
  return colors[category];
}

function getLevelColor(level: LogLevel): string {
  const colors: Record<LogLevel, string> = {
    debug: "text-gray-400",
    info: "text-blue-400",
    warn: "text-amber-400",
    error: "text-red-400",
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
      className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-700/30 ${
        log.level === "error" ? "bg-red-900/10" : log.level === "warn" ? "bg-amber-900/10" : ""
      }`}
      onClick={() => log.data && setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2">
        <span className="text-gray-600 font-mono shrink-0">{time}</span>
        <span className={`shrink-0 ${getCategoryColor(log.category)}`}>[{log.category}]</span>
        <span className={getLevelColor(log.level)}>{log.message}</span>
      </div>
      {expanded && log.data !== undefined && (
        <pre className="mt-2 p-2 bg-gray-900/50 rounded text-gray-400 overflow-x-auto">
          {String(JSON.stringify(log.data, null, 2))}
        </pre>
      )}
    </div>
  );
}
