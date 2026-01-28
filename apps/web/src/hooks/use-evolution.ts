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

/**
 * Hook that provides evolution functionality.
 *
 * Returns a callback that triggers plant germination via the backend,
 * updating the plant's lifecycle state.
 */
export function useEvolution() {
  const updatePlant = useGardenStore((state) => state.updatePlant);
  const addNotification = useGardenStore((state) => state.addNotification);

  const germinateMutation = trpc.plants.germinate.useMutation({
    onSuccess: (result) => {
      // Update plant in local store to reflect germinated state
      updatePlant(result.id, {
        germinatedAt: result.germinatedAt,
      });

      // Log germination
      debugLogger.evolution.info(`Plant germinated: ${result.variantId}`, {
        plantId: result.id,
        variantId: result.variantId,
      });

      // Show notification
      addNotification("A plant has germinated");
    },
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
   */
  const triggerGermination = useCallback(async (plantId: string): Promise<void> => {
    // Skip germination if in time-travel mode
    const { isTimeTravelMode } = useGardenStore.getState();
    if (isTimeTravelMode) {
      return;
    }

    await mutationRef.current.mutateAsync({ plantId });
  }, []);

  return {
    triggerGermination,
    isGerminating: germinateMutation.isPending,
  };
}
