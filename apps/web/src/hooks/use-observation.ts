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
import { debugLogger } from "@/lib/debug-logger";
import type { ObservationPayload } from "@quantum-garden/shared";

/**
 * Hook that provides observation functionality.
 *
 * Returns a callback that triggers observation via the backend,
 * handling quantum measurement and state updates.
 */
export function useObservation() {
  const updatePlant = useGardenStore((state) => state.updatePlant);
  const addNotification = useGardenStore((state) => state.addNotification);
  const setObservationContext = useGardenStore((state) => state.setObservationContext);
  const utils = trpc.useUtils();

  const recordObservationMutation = trpc.observation.recordObservation.useMutation({
    onSuccess: (result) => {
      // Log the observation
      debugLogger.observation.info(`Plant observed: ${result.variantId}`, {
        plantId: result.id,
        circuitId: result.circuitId,
        executionMode: result.executionMode,
        isEntangled: result.entangledPartnersUpdated,
      });

      // Update plant in local store to reflect observed state
      // Cast through unknown because Prisma JSON type is very broad
      updatePlant(result.id, {
        observed: true,
        observedAt: result.observedAt ?? undefined,
        visualState: "collapsed",
        traits: result.traits as unknown as ReturnType<
          typeof useGardenStore.getState
        >["plants"][number]["traits"],
      });

      // Show observation context panel with quantum circuit info
      setObservationContext({
        plantId: result.id,
        circuitId: result.circuitId,
        isEntangled: result.entangledPartnersUpdated,
      });

      // If entangled partners were updated, refetch plants to get their new state
      if (result.entangledPartnersUpdated) {
        debugLogger.observation.info("Entangled partners also observed");
        utils.plants.list.invalidate();
        // Show entanglement notification
        addNotification("Entangled plants observed");
      }
    },
    onError: (error) => {
      debugLogger.observation.error("Observation failed", { error: error.message });
      // Show user-facing error notification
      addNotification("Observation failed. Please try again.");
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
