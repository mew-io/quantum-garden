/**
 * useObservation - Hook for triggering observation events
 *
 * Provides a callback to trigger observation via tRPC mutation,
 * handling the quantum measurement flow.
 */

import { useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { useGardenStore } from "@/stores/garden-store";
import type { ObservationPayload } from "@quantum-garden/shared";

/**
 * Hook that provides observation functionality.
 *
 * Returns a callback that triggers observation via the backend,
 * handling quantum measurement and state updates.
 */
export function useObservation() {
  const updatePlant = useGardenStore((state) => state.updatePlant);

  const recordObservationMutation = trpc.observation.recordObservation.useMutation({
    onSuccess: (updatedPlant) => {
      // Update plant in local store to reflect observed state
      // Cast through unknown because Prisma JSON type is very broad
      updatePlant(updatedPlant.id, {
        observed: true,
        observedAt: updatedPlant.observedAt ?? undefined,
        visualState: "collapsed",
        traits: updatedPlant.traits as unknown as ReturnType<
          typeof useGardenStore.getState
        >["plants"][number]["traits"],
      });
    },
    onError: (error) => {
      console.error("Observation failed:", error);
    },
  });

  /**
   * Trigger observation for a plant.
   *
   * Called by the ObservationSystem when dwell duration completes.
   */
  const triggerObservation = useCallback(
    (payload: ObservationPayload) => {
      recordObservationMutation.mutate({
        plantId: payload.plantId,
        regionId: payload.regionId,
      });
    },
    [recordObservationMutation]
  );

  return {
    triggerObservation,
    isObserving: recordObservationMutation.isPending,
  };
}
