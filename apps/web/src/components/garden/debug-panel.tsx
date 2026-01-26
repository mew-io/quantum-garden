"use client";

import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import type { Plant } from "@quantum-garden/shared";

interface JobStats {
  pending: number;
  completed: number;
  failed: number;
  total: number;
  execution_mode: string;
}

/**
 * Debug panel for viewing quantum garden internals.
 * Toggle with backtick (`) key.
 */
export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [jobStats, setJobStats] = useState<JobStats | null>(null);

  // Fetch all plants for overview
  const { data: plants, refetch: refetchPlants } = trpc.plants.list.useQuery(undefined, {
    enabled: isVisible,
    refetchInterval: isVisible ? 2000 : false,
  });

  const fetchJobStats = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:18742/jobs/");
      if (res.ok) {
        setJobStats(await res.json());
      }
    } catch {
      // Quantum service not available
    }
  }, []);

  // Toggle visibility with backtick key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "`" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsVisible((v) => !v);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch job stats when visible
  useEffect(() => {
    if (isVisible) {
      fetchJobStats();
      const interval = setInterval(fetchJobStats, 2000);
      return () => clearInterval(interval);
    }
  }, [isVisible, fetchJobStats]);

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
            fetchJobStats();
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
