/**
 * useEvolutionSystem - Manages the garden evolution system lifecycle
 *
 * This hook creates and manages a GardenEvolutionSystem instance that
 * automatically germinates dormant plants over time. The system:
 *
 * - Starts automatically on component mount
 * - Pauses during time-travel mode
 * - Syncs stats to the garden store every 5 seconds
 * - Cleans up on unmount
 *
 * The evolution system periodically checks dormant plants and triggers
 * germination based on various factors including:
 * - Time since dormancy began (guaranteed after 15 minutes)
 * - Proximity to observed plants (2x bonus)
 * - Clustering prevention (avoids crowded areas)
 * - Per-plant cooldowns (reduced chance near recent germinations)
 * - Wave events (3-5 plants germinate together, 5% chance)
 *
 * @module hooks/use-evolution-system
 * @see {@link GardenEvolutionSystem} for the underlying system implementation
 * @see {@link useEvolution} for the germination callback provider
 */

import { useEffect, useRef } from "react";
import type {
  GardenEvolutionSystem,
  GerminationContext,
} from "@/components/garden/garden-evolution";
import { createGardenEvolutionSystem } from "@/components/garden/garden-evolution";
import { useGardenStore } from "@/stores/garden-store";
import { debugLogger } from "@/lib/debug-logger";

/**
 * Options for the useEvolutionSystem hook.
 */
interface UseEvolutionSystemOptions {
  /**
   * Callback to trigger plant germination.
   * Called by the evolution system when a plant should germinate.
   *
   * @param plantId - The unique identifier of the plant to germinate
   * @param context - Wave context indicating if this is part of a wave event
   * @returns Promise that resolves when germination is complete
   */
  triggerGermination: (plantId: string, context: GerminationContext) => Promise<void>;
}

/**
 * Return value from the useEvolutionSystem hook.
 */
interface EvolutionSystemState {
  /**
   * Whether the evolution system is currently running.
   * False during time-travel mode or when system is paused.
   */
  isRunning: boolean;
  /**
   * Current statistics from the evolution system.
   * Updated every 5 seconds while the system is running.
   * Null before initialization or after unmount.
   */
  stats: { dormantCount: number; trackedCount: number } | null;
}

/**
 * Hook that manages the GardenEvolutionSystem lifecycle.
 *
 * Creates the system on mount, connects the germination callback,
 * pauses during time-travel mode, and cleans up on unmount.
 *
 * @param options - Configuration options including the germination callback
 * @returns Current state of the evolution system
 *
 * @example
 * ```tsx
 * function GardenScene() {
 *   const { triggerGermination } = useEvolution();
 *   const { isRunning, stats } = useEvolutionSystem({ triggerGermination });
 *
 *   return (
 *     <div>
 *       <span>Evolution: {isRunning ? 'Active' : 'Paused'}</span>
 *       {stats && <span>Dormant plants: {stats.dormantCount}</span>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @remarks
 * This hook should be used in the GardenScene component to integrate
 * the evolution system with React's lifecycle. The system automatically:
 *
 * 1. Creates a new GardenEvolutionSystem instance on mount
 * 2. Connects the provided germination callback
 * 3. Starts the periodic evolution checks (every 15 seconds)
 * 4. Syncs evolution stats to the Zustand store (every 5 seconds)
 * 5. Pauses when entering time-travel mode
 * 6. Resumes when exiting time-travel mode
 * 7. Destroys the system and clears intervals on unmount
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
    system.setGerminationCallback(async (plantId: string, context: GerminationContext) => {
      debugLogger.evolution.debug(`Germination triggered for plant ${plantId.slice(0, 8)}`, {
        isWave: context.isWave,
        waveIndex: context.waveIndex,
        waveTotal: context.waveTotal,
      });
      await triggerGermination(plantId, context);
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
