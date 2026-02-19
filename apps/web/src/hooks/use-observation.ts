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
import { isFirstObservation, markFirstObservationComplete } from "@/lib/first-observation";
import type { ObservationPayload, CircuitType, ResolvedTraits } from "@quantum-garden/shared";

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
  const setEntanglementRevealed = useGardenStore((state) => state.setEntanglementRevealed);
  const addEvent = useGardenStore((state) => state.addEvent);
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

      // Add observation event to quantum event log
      addEvent({
        type: "observation",
        timestamp: new Date(),
        plantId: result.id,
        variantId: result.variantId,
        circuitId: result.circuitId as CircuitType,
        executionMode: result.executionMode as "mock" | "simulator" | "hardware",
        resolvedTraits: result.traits as unknown as ResolvedTraits,
        entanglementGroupId: result.entangledPartnersUpdated
          ? (result.entanglementGroupId ?? undefined)
          : undefined,
        measurementSummary: result.measurementSummary ?? undefined,
      });

      // Show special notification for first observation
      if (isFirstObservation()) {
        addNotification("Wave function collapsed \u2014 your first observation!", "germination");
        markFirstObservationComplete();
      }

      // If entangled partners were updated, refetch plants to get their new state
      if (result.entangledPartnersUpdated) {
        debugLogger.observation.info("Entangled partners also observed");
        utils.plants.list.invalidate();
        // Show entanglement notification
        addNotification("Spooky action at a distance: entangled plants revealed", "entanglement");

        // Show entanglement detail panel
        if (result.entanglementGroupId) {
          setEntanglementRevealed(result.entanglementGroupId);
        }

        // Find partner plant IDs from the store
        const allPlants = useGardenStore.getState().plants;
        const partnerIds = allPlants
          .filter((p) => p.entanglementGroupId === result.entanglementGroupId && p.id !== result.id)
          .map((p) => p.id);

        // Add entanglement correlation event to log
        addEvent({
          type: "entanglement",
          timestamp: new Date(),
          plantId: result.id,
          variantId: result.variantId,
          entanglementGroupId: result.entanglementGroupId ?? undefined,
          partnerPlantIds: partnerIds.length > 0 ? partnerIds : undefined,
        });
      }
    },
    onError: (error) => {
      debugLogger.observation.error("Observation failed", { error: error.message });
      // Show user-facing error notification
      addNotification("Observation failed. Please try again.", "error");
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
