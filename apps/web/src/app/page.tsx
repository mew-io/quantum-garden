"use client";

import { useState, useCallback, useEffect } from "react";
import { GardenScene } from "@/components/garden/three";
import { ErrorBoundary } from "@/components/error-boundary";
import { InfoOverlay } from "@/components/garden/info-overlay";
import { DebugPanel } from "@/components/garden/debug-panel";
import { TimeTravelScrubber } from "@/components/garden/time-travel-scrubber";
import { EvolutionNotifications } from "@/components/garden/evolution-notifications";
import { useGardenStore } from "@/stores/garden-store";
import { trpc } from "@/lib/trpc/client";

export default function Home() {
  const { isTimeTravelMode, setTimeTravelMode, setTimeTravelTimestamp, setPlants } =
    useGardenStore();
  const [gardenCreatedAt, setGardenCreatedAt] = useState<Date | null>(null);

  // Fetch earliest plant creation time to determine garden age
  const { data: plants } = trpc.plants.list.useQuery();

  // Calculate garden creation time from earliest plant
  useEffect(() => {
    if (plants && plants.length > 0) {
      const earliest = plants.reduce((min, p) =>
        new Date(p.createdAt) < new Date(min.createdAt) ? p : min
      );
      setGardenCreatedAt(new Date(earliest.createdAt));
    }
  }, [plants]);

  // Query for historical state
  const [historicalTimestamp, setHistoricalTimestamp] = useState<Date | null>(null);
  const { data: historicalPlants } = trpc.garden.getStateAtTime.useQuery(
    { timestamp: historicalTimestamp! },
    {
      enabled: isTimeTravelMode && historicalTimestamp !== null,
    }
  );

  // Update plants when scrubbing through time
  useEffect(() => {
    if (isTimeTravelMode && historicalPlants) {
      setPlants(historicalPlants);
    }
  }, [isTimeTravelMode, historicalPlants, setPlants]);

  // Handle scrubbing to a specific timestamp
  const handleScrubToTime = useCallback(
    (timestamp: Date) => {
      setHistoricalTimestamp(timestamp);
      setTimeTravelTimestamp(timestamp);
    },
    [setTimeTravelTimestamp]
  );

  // Handle returning to live view
  const handleReturnToLive = useCallback(() => {
    setTimeTravelMode(false);
    setHistoricalTimestamp(null);
    setTimeTravelTimestamp(null);
    // Plants will be refreshed by the live query in usePlants hook
  }, [setTimeTravelMode, setTimeTravelTimestamp]);

  // Keyboard shortcut: T to toggle time-travel mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "t" || e.key === "T") {
        if (gardenCreatedAt) {
          setTimeTravelMode(!isTimeTravelMode);
          if (isTimeTravelMode) {
            // Exiting time-travel mode
            handleReturnToLive();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTimeTravelMode, setTimeTravelMode, gardenCreatedAt, handleReturnToLive]);

  return (
    <ErrorBoundary>
      <main>
        <GardenScene />
        <InfoOverlay />
        <DebugPanel />
        <EvolutionNotifications />
        {gardenCreatedAt && (
          <TimeTravelScrubber
            isActive={isTimeTravelMode}
            onScrubToTime={handleScrubToTime}
            onReturnToLive={handleReturnToLive}
            gardenCreatedAt={gardenCreatedAt}
          />
        )}
      </main>
    </ErrorBoundary>
  );
}
