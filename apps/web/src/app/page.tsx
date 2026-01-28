"use client";

import { useState, useCallback, useEffect } from "react";
import { GardenScene } from "@/components/garden/three";
import { ErrorBoundary } from "@/components/error-boundary";
import { InfoOverlay } from "@/components/garden/info-overlay";
import { DebugPanel } from "@/components/garden/debug-panel";
import { TimeTravelScrubber } from "@/components/garden/time-travel-scrubber";
import { EvolutionNotifications } from "@/components/garden/evolution-notifications";
import { ObservationContextPanel } from "@/components/garden/observation-context-panel";
import { Toolbar } from "@/components/garden/toolbar";
import { useGardenStore } from "@/stores/garden-store";
import { trpc } from "@/lib/trpc/client";

export default function Home() {
  const { isTimeTravelMode, setTimeTravelMode, setTimeTravelTimestamp, setPlants } =
    useGardenStore();
  const [gardenCreatedAt, setGardenCreatedAt] = useState<Date | null>(null);

  // Panel visibility states
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // T - Toggle time-travel mode
      if (e.key === "t" || e.key === "T") {
        if (gardenCreatedAt) {
          setTimeTravelMode(!isTimeTravelMode);
          if (isTimeTravelMode) {
            handleReturnToLive();
          }
        }
      }

      // Backtick - Toggle debug panel
      if (e.key === "`" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsDebugOpen((v) => {
          const newValue = !v;
          // Dispatch event for Three.js scene to react
          window.dispatchEvent(
            new CustomEvent("debug-visibility-change", {
              detail: { visible: newValue },
            })
          );
          return newValue;
        });
      }

      // ? - Show help
      if (e.key === "?") {
        setShowHelp(true);
      }

      // Escape - Close all panels
      if (e.key === "Escape") {
        setIsDebugOpen(false);
        setShowHelp(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTimeTravelMode, setTimeTravelMode, gardenCreatedAt, handleReturnToLive]);

  return (
    <ErrorBoundary>
      <main>
        <GardenScene />

        {/* Toolbar with visible controls */}
        <Toolbar
          isDebugOpen={isDebugOpen}
          onDebugToggle={() => {
            setIsDebugOpen((v) => {
              const newValue = !v;
              window.dispatchEvent(
                new CustomEvent("debug-visibility-change", {
                  detail: { visible: newValue },
                })
              );
              return newValue;
            });
          }}
          isTimeTravelAvailable={!!gardenCreatedAt}
          onShowHelp={() => setShowHelp(true)}
        />

        {/* Panels */}
        <InfoOverlay forceShow={showHelp} onDismiss={() => setShowHelp(false)} />
        <DebugPanel
          isOpen={isDebugOpen}
          onToggle={(newValue) => {
            setIsDebugOpen(newValue);
            window.dispatchEvent(
              new CustomEvent("debug-visibility-change", {
                detail: { visible: newValue },
              })
            );
          }}
        />
        <EvolutionNotifications />
        <ObservationContextPanel />
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
