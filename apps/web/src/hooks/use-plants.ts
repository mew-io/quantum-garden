/**
 * Hook for fetching and managing plant data.
 *
 * Loads plants from the server and syncs them to the Zustand store.
 */

import { useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { useGardenStore } from "@/stores/garden-store";

/**
 * Fetch plants from the server and load them into the garden store.
 *
 * This hook should be called once when the garden canvas mounts.
 */
export function usePlants() {
  const setPlants = useGardenStore((state) => state.setPlants);

  const { data: plants, isLoading, error } = trpc.plants.list.useQuery();

  // Sync plants to store when data changes
  useEffect(() => {
    if (plants) {
      setPlants(plants);
    }
  }, [plants, setPlants]);

  return {
    plants,
    isLoading,
    error,
  };
}
