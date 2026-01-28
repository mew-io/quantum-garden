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
 * It includes polling to keep the store fresh, so other components
 * can use store data without making redundant queries.
 */
export function usePlants() {
  const setPlants = useGardenStore((state) => state.setPlants);

  const {
    data: plants,
    isLoading,
    error,
  } = trpc.plants.list.useQuery(undefined, {
    // Poll every 5 seconds to keep store fresh
    // Other components should use store data instead of making their own queries
    refetchInterval: 5000,
  });

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
