/**
 * useEvolution - Hook for garden evolution events
 *
 * Provides a callback to trigger plant germination via tRPC mutation.
 * Used by the GardenEvolutionSystem to germinate dormant plants.
 */

import { useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { useGardenStore } from "@/stores/garden-store";
import { debugLogger } from "@/lib/debug-logger";
import { hapticSuccess } from "@/utils/haptics";
import type { GerminationContext } from "@/components/garden/garden-evolution";

/**
 * Hook that provides evolution functionality.
 *
 * Returns a callback that triggers plant germination via the backend,
 * updating the plant's lifecycle state.
 *
 * For wave germinations (multiple plants at once), notifications are batched
 * into a single message like "3 plants germinated".
 */
export function useEvolution() {
  const updatePlant = useGardenStore((state) => state.updatePlant);
  const addNotification = useGardenStore((state) => state.addNotification);
  const addEvent = useGardenStore((state) => state.addEvent);
  const setLastGerminationTime = useGardenStore((state) => state.setLastGerminationTime);

  // Track wave germination plant IDs for the wave_germination event
  const waveGerminationsRef = useRef<string[]>([]);

  const germinateMutation = trpc.plants.germinate.useMutation({
    onError: (error) => {
      debugLogger.evolution.error("Germination failed", { error: error.message });
    },
  });

  // Use ref to keep mutation stable across renders
  // This prevents useEvolutionSystem from re-running its effect on every render
  const mutationRef = useRef(germinateMutation);
  mutationRef.current = germinateMutation;

  /**
   * Trigger germination for a dormant plant.
   *
   * Called by the GardenEvolutionSystem when a plant should germinate.
   * Skipped if in time-travel mode (read-only historical view).
   *
   * @param plantId - The plant to germinate
   * @param context - Wave context (if part of a wave germination event)
   */
  const triggerGermination = useCallback(
    async (plantId: string, context: GerminationContext): Promise<void> => {
      // Skip germination if in time-travel mode
      const { isTimeTravelMode } = useGardenStore.getState();
      if (isTimeTravelMode) {
        return;
      }

      const result = await mutationRef.current.mutateAsync({ plantId });

      // Update plant in local store to reflect germinated state
      updatePlant(result.id, {
        germinatedAt: result.germinatedAt,
      });

      // Update last germination time
      setLastGerminationTime(Date.now());

      // Haptic feedback for germination celebration
      hapticSuccess();

      // Log germination
      debugLogger.evolution.info(`Plant germinated: ${result.variantId}`, {
        plantId: result.id,
        variantId: result.variantId,
        isWave: context.isWave,
        waveIndex: context.waveIndex,
        waveTotal: context.waveTotal,
      });

      if (context.isWave && context.waveTotal && context.waveIndex) {
        // Wave germination: collect plant IDs and batch notification
        waveGerminationsRef.current.push(result.id);

        if (context.waveIndex === context.waveTotal) {
          // Last plant in wave - show batched notification and event
          const waveSize = context.waveTotal;
          addNotification(`Quantum wave: ${waveSize} plants germinated in phase`, "wave");

          // Add a single wave_germination event
          addEvent({
            type: "wave_germination",
            timestamp: new Date(),
            plantId: waveGerminationsRef.current[0]!, // Reference first plant
            variantId: result.variantId,
            germinationType: "wave",
            waveSize,
          });

          // Reset wave tracking
          waveGerminationsRef.current = [];
        }
        // Don't show notification for non-final wave germinations
      } else {
        // Normal (non-wave) germination: show individual notification
        addNotification("Quantum tunneling: a seed emerged from dormancy");

        // Compute dormancy duration from createdAt → germinatedAt
        const dormancyDuration =
          result.germinatedAt && result.createdAt
            ? new Date(result.germinatedAt).getTime() - new Date(result.createdAt).getTime()
            : undefined;

        // Add germination event to quantum event log
        addEvent({
          type: "germination",
          timestamp: new Date(),
          plantId: result.id,
          variantId: result.variantId,
          germinationType: "normal",
          dormancyDuration,
        });
      }
    },
    [updatePlant, addNotification, addEvent, setLastGerminationTime]
  );

  return {
    triggerGermination,
    isGerminating: germinateMutation.isPending,
  };
}
