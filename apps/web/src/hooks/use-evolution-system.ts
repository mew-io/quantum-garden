/**
 * useEvolutionSystem - Manages the garden evolution system lifecycle
 *
 * This hook creates and manages a GardenEvolutionSystem instance that
 * automatically germinates dormant plants over time. The system:
 *
 * - Starts automatically on component mount
 * - Pauses during time-travel mode
 * - Syncs stats to the garden store
 * - Cleans up on unmount
 *
 * @param triggerGermination - Callback to germinate a plant by ID
 */

import { useEffect, useRef } from "react";
import type { GardenEvolutionSystem } from "@/components/garden/garden-evolution";
import { createGardenEvolutionSystem } from "@/components/garden/garden-evolution";
import { useGardenStore } from "@/stores/garden-store";
import { debugLogger } from "@/lib/debug-logger";

interface UseEvolutionSystemOptions {
  /** Callback to trigger plant germination */
  triggerGermination: (plantId: string) => Promise<void>;
}

interface EvolutionSystemState {
  /** Whether the evolution system is currently running */
  isRunning: boolean;
  /** Current stats from the evolution system */
  stats: { dormantCount: number; trackedCount: number } | null;
}

/**
 * Hook that manages the GardenEvolutionSystem lifecycle.
 *
 * Creates the system on mount, connects the germination callback,
 * pauses during time-travel mode, and cleans up on unmount.
 */
export function useEvolutionSystem({
  triggerGermination,
}: UseEvolutionSystemOptions): EvolutionSystemState {
  const systemRef = useRef<GardenEvolutionSystem | null>(null);
  const isTimeTravelMode = useGardenStore((state) => state.isTimeTravelMode);
  const setEvolutionPaused = useGardenStore((state) => state.setEvolutionPaused);
  const setEvolutionStats = useGardenStore((state) => state.setEvolutionStats);

  // Create and manage evolution system lifecycle
  useEffect(() => {
    debugLogger.evolution.info("Creating GardenEvolutionSystem");

    // Create the evolution system
    const system = createGardenEvolutionSystem();
    systemRef.current = system;

    // Set the germination callback
    system.setGerminationCallback(async (plantId: string) => {
      debugLogger.evolution.debug(`Germination triggered for plant ${plantId.slice(0, 8)}`);
      await triggerGermination(plantId);
    });

    // Start the system
    system.start();
    setEvolutionPaused(false);
    debugLogger.evolution.info("GardenEvolutionSystem started");

    // Update stats periodically
    const statsInterval = setInterval(() => {
      if (systemRef.current) {
        const stats = systemRef.current.getStats();
        setEvolutionStats(stats);
      }
    }, 5000); // Update stats every 5 seconds

    // Initial stats update
    setEvolutionStats(system.getStats());

    // Cleanup on unmount
    return () => {
      debugLogger.evolution.info("Destroying GardenEvolutionSystem");
      clearInterval(statsInterval);
      if (systemRef.current) {
        systemRef.current.destroy();
        systemRef.current = null;
      }
      setEvolutionPaused(true);
      setEvolutionStats(null);
    };
  }, [triggerGermination, setEvolutionPaused, setEvolutionStats]);

  // Handle time-travel mode changes (pause/resume)
  useEffect(() => {
    const system = systemRef.current;
    if (!system) return;

    if (isTimeTravelMode) {
      debugLogger.evolution.info("Pausing evolution (time-travel mode active)");
      system.stop();
      setEvolutionPaused(true);
    } else {
      debugLogger.evolution.info("Resuming evolution (time-travel mode inactive)");
      system.start();
      setEvolutionPaused(false);
    }
  }, [isTimeTravelMode, setEvolutionPaused]);

  return {
    isRunning: !isTimeTravelMode && systemRef.current !== null,
    stats: systemRef.current?.getStats() ?? null,
  };
}
