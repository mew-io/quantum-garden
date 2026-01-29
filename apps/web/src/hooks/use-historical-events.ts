/**
 * useHistoricalEvents - Hook to load historical quantum events
 *
 * Fetches the evolution timeline from the server and populates
 * the event log store with historical germination and observation events.
 * This ensures the Quantum Events panel shows events from before
 * the current session.
 */

import { useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { useGardenStore } from "@/stores/garden-store";
import type { QuantumEvent, QuantumEventType } from "@quantum-garden/shared";

interface UseHistoricalEventsOptions {
  /** Garden creation timestamp (earliest possible time) */
  gardenCreatedAt: Date | null;
}

/**
 * Hook that loads historical events from the evolution timeline
 * and populates the eventLog store.
 */
export function useHistoricalEvents({ gardenCreatedAt }: UseHistoricalEventsOptions) {
  const addEvent = useGardenStore((state) => state.addEvent);
  const historicalEventsLoaded = useGardenStore((state) => state.historicalEventsLoaded);
  const setHistoricalEventsLoaded = useGardenStore((state) => state.setHistoricalEventsLoaded);

  // Memoize the end time to prevent query key changes on every render
  const endTime = useMemo(() => new Date(), []);

  // Query evolution timeline from garden creation to now
  const { data: events, isSuccess } = trpc.garden.getEvolutionTimeline.useQuery(
    {
      startTime: gardenCreatedAt!,
      endTime,
    },
    {
      enabled: !!gardenCreatedAt && !historicalEventsLoaded,
      staleTime: Infinity, // Don't refetch - this is a one-time load
    }
  );

  // Populate event log with historical events (only once)
  useEffect(() => {
    // Wait for successful query and ensure we haven't already loaded
    if (!isSuccess || !events || historicalEventsLoaded) {
      return;
    }

    // Mark as loaded FIRST to prevent re-entry
    setHistoricalEventsLoaded(true);

    // Don't add if there are no events
    if (events.length === 0) {
      return;
    }

    // Convert evolution events to quantum events and add to store
    // Process in chronological order (oldest first)
    for (const event of events) {
      const quantumEvent: Omit<QuantumEvent, "id"> = {
        type: event.type as QuantumEventType,
        timestamp: new Date(event.timestamp),
        plantId: event.plantId,
        variantId: event.variantId,
        entanglementGroupId: event.entanglementGroupId,
      };

      addEvent(quantumEvent);
    }
  }, [isSuccess, events, historicalEventsLoaded, setHistoricalEventsLoaded, addEvent]);
}
