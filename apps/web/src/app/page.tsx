"use client";

import { useState, useEffect } from "react";
import { GardenScene } from "@/components/garden/three";
import { ErrorBoundary } from "@/components/error-boundary";
import { InfoOverlay } from "@/components/garden/info-overlay";
import { DebugPanel } from "@/components/garden/debug-panel";
import { EvolutionNotifications } from "@/components/garden/evolution-notifications";
import { ObservationContextPanel } from "@/components/garden/observation-context-panel";
import { EntanglementDetailPanel } from "@/components/garden/entanglement-detail-panel";
import { QuantumEventLog } from "@/components/garden/quantum-event-log";
import { EventDetailModal } from "@/components/garden/event-detail-modal";
import { Toolbar } from "@/components/garden/toolbar";
import { CooldownIndicator } from "@/components/garden/cooldown-indicator";
import { EvolutionPausedIndicator } from "@/components/garden/evolution-paused-indicator";
import { KeyboardShortcutHint } from "@/components/garden/keyboard-shortcut-hint";
import { OnboardingTour } from "@/components/garden/onboarding-tour";
import { trpc } from "@/lib/trpc/client";

export default function Home() {
  // Panel visibility states
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);

  // Fetch earliest plant creation time to determine garden age
  const { isLoading: isPlantsLoading } = trpc.plants.list.useQuery();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
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
  }, []);

  return (
    <ErrorBoundary>
      <main>
        <GardenScene />

        {/* Loading indicator during initial plant fetch */}
        {isPlantsLoading && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 garden-panel rounded-lg text-sm font-mono pointer-events-none z-[100] animate-in fade-in duration-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-[--wc-sage] rounded-full animate-organic-pulse" />
            The garden is awakening...
          </div>
        )}

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
          onShowHelp={() => setShowHelp(true)}
        />

        {/* Panels */}
        <InfoOverlay
          forceShow={showHelp}
          onDismiss={() => setShowHelp(false)}
          onStartTour={() => setIsTourActive(true)}
        />
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
        <EntanglementDetailPanel />
        <QuantumEventLog />
        <EventDetailModal />
        <CooldownIndicator />
        <EvolutionPausedIndicator />
        <KeyboardShortcutHint />
        <OnboardingTour isActive={isTourActive} onComplete={() => setIsTourActive(false)} />
      </main>
    </ErrorBoundary>
  );
}
