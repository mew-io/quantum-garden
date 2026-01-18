/**
 * useEvolution - Hook for garden evolution events
 *
 * Provides a callback to trigger plant germination via tRPC mutation.
 * Used by the GardenEvolutionSystem to germinate dormant plants.
 */

import { useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { useGardenStore } from "@/stores/garden-store";

/**
 * Hook that provides evolution functionality.
 *
 * Returns a callback that triggers plant germination via the backend,
 * updating the plant's lifecycle state.
 */
export function useEvolution() {
  const updatePlant = useGardenStore((state) => state.updatePlant);

  const germinateMutation = trpc.plants.germinate.useMutation({
    onSuccess: (result) => {
      // Update plant in local store to reflect germinated state
      updatePlant(result.id, {
        germinatedAt: result.germinatedAt,
      });
    },
    onError: (error) => {
      console.error("Germination failed:", error);
    },
  });

  /**
   * Trigger germination for a dormant plant.
   *
   * Called by the GardenEvolutionSystem when a plant should germinate.
   */
  const triggerGermination = useCallback(
    async (plantId: string): Promise<void> => {
      await germinateMutation.mutateAsync({ plantId });
    },
    [germinateMutation]
  );

  return {
    triggerGermination,
    isGerminating: germinateMutation.isPending,
  };
}
