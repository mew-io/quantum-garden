/**
 * Hook for fetching and managing plant data.
 *
 * Loads plants from the server and syncs them to the Zustand store.
 */

import { useEffect, useRef } from "react";
import type { Plant, CircuitType } from "@quantum-garden/shared";
import { trpc } from "@/lib/trpc/client";
import { useGardenStore } from "@/stores/garden-store";

/**
 * Compute a hash of plant data for change detection.
 * Only considers fields that affect visual rendering.
 */
function computePlantsHash(plants: Plant[]): string {
  return plants
    .map((p) => `${p.id}:${p.visualState}:${p.germinatedAt?.getTime() ?? "null"}:${p.observed}`)
    .join("|");
}

/**
 * Fetch plants from the server and load them into the garden store.
 *
 * This hook should be called once when the garden canvas mounts.
 * It includes polling to keep the store fresh, so other components
 * can use store data without making redundant queries.
 */
export function usePlants() {
  const setPlants = useGardenStore((state) => state.setPlants);
  const addNotification = useGardenStore((state) => state.addNotification);
  const addEvent = useGardenStore((state) => state.addEvent);
  const hasShownErrorRef = useRef(false);
  const lastPlantsHashRef = useRef<string>("");
  const previousPlantsRef = useRef<Map<string, Plant>>(new Map());

  const {
    data: plants,
    isLoading,
    error,
  } = trpc.plants.list.useQuery(undefined, {
    // Poll every 5 seconds to keep store fresh
    // Other components should use store data instead of making their own queries
    refetchInterval: 5000,
    // Retry a few times before showing error
    retry: 3,
    retryDelay: 1000,
  });

  // Sync plants to store when data ACTUALLY changes (not just reference)
  useEffect(() => {
    if (plants) {
      const hash = computePlantsHash(plants);
      if (hash !== lastPlantsHashRef.current) {
        lastPlantsHashRef.current = hash;

        // Detect server-side germinations and deaths, add events
        if (previousPlantsRef.current.size > 0) {
          for (const plant of plants) {
            const prevPlant = previousPlantsRef.current.get(plant.id);

            // Check if plant just germinated (was dormant, now germinated)
            if (prevPlant && !prevPlant.germinatedAt && plant.germinatedAt) {
              // Server-side germination detected - add event to log
              const dormancyDuration = plant.createdAt
                ? new Date(plant.germinatedAt).getTime() - new Date(plant.createdAt).getTime()
                : undefined;
              addEvent({
                type: "germination",
                timestamp: plant.germinatedAt,
                plantId: plant.id,
                variantId: plant.variantId,
                circuitId: (plant.circuitType ?? "variational") as CircuitType,
                germinationType: "normal",
                dormancyDuration,
              });
            }
          }

          // Detect plants that died (were alive, now removed from list)
          for (const [prevId, prevPlant] of previousPlantsRef.current.entries()) {
            const currentPlant = plants.find((p) => p.id === prevId);

            // Plant was in previous list but not in current list = died
            if (!currentPlant && prevPlant.germinatedAt && !prevPlant.diedAt) {
              addEvent({
                type: "death",
                timestamp: new Date(),
                plantId: prevPlant.id,
                variantId: prevPlant.variantId,
                circuitId: (prevPlant.circuitType ?? "variational") as CircuitType,
                createdAt: prevPlant.createdAt,
              });
            }
          }
        }

        // Update previous plants map
        previousPlantsRef.current = new Map(plants.map((p) => [p.id, p]));

        setPlants(plants);
      }
      // Reset error state on successful load
      hasShownErrorRef.current = false;
    }
  }, [plants, setPlants, addEvent]);

  // Show notification on error (only once per error state)
  useEffect(() => {
    if (error && !hasShownErrorRef.current) {
      hasShownErrorRef.current = true;
      addNotification("Unable to load garden. Retrying...", "error");
    }
  }, [error, addNotification]);

  return {
    plants,
    isLoading,
    error,
  };
}
