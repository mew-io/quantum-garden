"use client";

import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import type { Plant } from "@quantum-garden/shared";

/**
 * Debug panel for viewing quantum garden internals.
 * Toggle with backtick (`) key.
 */
export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [observationMode, setObservationMode] = useState<"region" | "click">("region");

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
      refetchInterval: isVisible ? 5000 : false, // Poll every 5 seconds
    }
  );

  // Fetch job queue statistics
  const { data: jobStats, refetch: refetchJobStats } = trpc.quantum.getJobStats.useQuery(
    undefined,
    {
      enabled: isVisible,
      refetchInterval: isVisible ? 2000 : false, // Poll every 2 seconds
    }
  );

  // Toggle visibility with backtick key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "`" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsVisible((v) => {
          const newVisibility = !v;
          // Dispatch visibility change event
          window.dispatchEvent(
            new CustomEvent("debug-visibility-change", {
              detail: { visible: newVisibility },
            })
          );
          return newVisibility;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  // Handle observation mode changes
  const toggleObservationMode = useCallback(() => {
    const newMode = observationMode === "region" ? "click" : "region";
    setObservationMode(newMode);

    // Dispatch custom event to notify GardenScene
    window.dispatchEvent(
      new CustomEvent("observation-mode-change", {
        detail: { mode: newMode, debugMode: newMode === "click" },
      })
    );
  }, [observationMode]);

  if (!isVisible) {
    return null;
  }

  const observedCount = plants?.filter((p: Plant) => p.observed).length ?? 0;
  const totalCount = plants?.length ?? 0;
  const selectedPlant = plants?.find((p: Plant) => p.id === selectedPlantId);

  // Group plants by variant
  const variantCounts: Record<string, number> = {};
  plants?.forEach((p: Plant) => {
    variantCounts[p.variantId] = (variantCounts[p.variantId] ?? 0) + 1;
  });

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-h-[80vh] overflow-auto bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-2xl text-sm">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900 px-4 py-3 border-b border-gray-700/50 flex justify-between items-center">
        <h3 className="text-gray-100 font-medium">Quantum Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-300 text-xs"
        >
          [`] to close
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Overview Stats */}
        <section>
          <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">Garden Overview</h4>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Total Plants" value={totalCount} />
            <Stat label="Observed" value={`${observedCount}/${totalCount}`} />
          </div>
        </section>

        {/* Quantum Service Status */}
        {quantumConfig && (
          <section>
            <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">Quantum Service</h4>
            <div className="space-y-2">
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
            </div>
          </section>
        )}

        {/* Observation Mode Toggle */}
        <section>
          <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">Observation System</h4>
          <div className="space-y-2">
            <button
              onClick={toggleObservationMode}
              className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded flex items-center justify-between"
            >
              <span className="text-xs">Observation Mode</span>
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
            <div className="text-xs text-gray-500 px-1">
              {observationMode === "region"
                ? "Observation triggers when reticle aligns with plant in region"
                : "Click plants directly to observe (debug mode)"}
            </div>
          </div>
        </section>

        {/* Job Queue Stats */}
        {jobStats && (
          <section>
            <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">Quantum Jobs</h4>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Pending" value={jobStats.pending} />
              <Stat label="Completed" value={jobStats.completed} />
              <Stat label="Failed" value={jobStats.failed} color="red" />
              <Stat label="Mode" value={jobStats.execution_mode} />
            </div>
          </section>
        )}

        {/* Selected Plant Details */}
        {selectedPlant && (
          <section>
            <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">Selected Plant</h4>
            <div className="bg-gray-800/50 rounded p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Variant</span>
                <span className="text-green-400">{selectedPlant.variantId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">State</span>
                <span className={selectedPlant.observed ? "text-yellow-400" : "text-blue-400"}>
                  {selectedPlant.visualState}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Circuit</span>
                <span className="text-purple-400">{selectedPlant.quantumCircuitId ?? "—"}</span>
              </div>
              {selectedPlant.traits && (
                <>
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
            Plants ({totalCount})
          </h4>
          <div className="max-h-48 overflow-auto space-y-1">
            {plants?.slice(0, 20).map((plant: Plant) => (
              <button
                key={plant.id}
                onClick={() => setSelectedPlantId(plant.id)}
                className={`w-full text-left px-2 py-1 rounded text-xs flex justify-between items-center ${
                  plant.id === selectedPlantId
                    ? "bg-blue-900/50 text-blue-200"
                    : "hover:bg-gray-800 text-gray-400"
                }`}
              >
                <span>{plant.variantId}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    plant.observed ? "bg-yellow-400" : "bg-blue-400"
                  }`}
                />
              </button>
            ))}
            {(plants?.length ?? 0) > 20 && (
              <div className="text-gray-600 text-xs text-center py-1">
                ... and {(plants?.length ?? 0) - 20} more
              </div>
            )}
          </div>
        </section>

        {/* Refresh Button */}
        <button
          onClick={() => {
            refetchPlants();
            refetchConfig();
            refetchJobStats();
          }}
          className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color = "white",
}: {
  label: string;
  value: string | number;
  color?: "white" | "red" | "green" | "yellow";
}) {
  const colorClass = {
    white: "text-gray-100",
    red: "text-red-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
  }[color];

  return (
    <div className="bg-gray-800/50 rounded px-3 py-2">
      <div className="text-gray-500 text-xs">{label}</div>
      <div className={`font-mono ${colorClass}`}>{value}</div>
    </div>
  );
}
