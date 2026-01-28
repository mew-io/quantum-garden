/**
 * useObservation - Hook for triggering observation events
 *
 * Provides a callback to trigger observation via tRPC mutation,
 * handling the quantum measurement flow. When an entangled plant
 * is observed, its partners are also revealed with correlated traits.
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
  const utils = trpc.useUtils();

  const recordObservationMutation = trpc.observation.recordObservation.useMutation({
    onSuccess: (result) => {
      // Check if we're waiting for quantum computation
      const waitingForQuantum = "waitingForQuantum" in result && result.waitingForQuantum;

      // Update plant in local store to reflect observed state
      // Cast through unknown because Prisma JSON type is very broad
      updatePlant(result.id, {
        observed: true,
        observedAt: result.observedAt ?? undefined,
        // If waiting for quantum, keep in superposed state until traits arrive
        visualState: waitingForQuantum ? "superposed" : "collapsed",
        traits: result.traits as unknown as ReturnType<
          typeof useGardenStore.getState
        >["plants"][number]["traits"],
      });

      // If waiting for quantum computation, show a notification
      if (waitingForQuantum) {
        console.log(
          `[Quantum] Observation recorded for plant ${result.id}, waiting for quantum computation...`
        );
        // TODO: Show toast notification "Quantum computation in progress..."
      }

      // If entangled partners were updated, refetch plants to get their new state
      if (result.entangledPartnersUpdated) {
        utils.plants.list.invalidate();
      }
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
