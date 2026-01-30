/**
 * Hook for fetching and managing plant data.
 *
 * Loads plants from the server and syncs them to the Zustand store.
 */

import { useEffect, useRef } from "react";
import type { Plant } from "@quantum-garden/shared";
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
  const hasShownErrorRef = useRef(false);
  const lastPlantsHashRef = useRef<string>("");

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
        setPlants(plants);
      }
      // Reset error state on successful load
      hasShownErrorRef.current = false;
    }
  }, [plants, setPlants]);

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
