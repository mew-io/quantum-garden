"use client";

import { GardenScene } from "@/components/garden/three";
import { ErrorBoundary } from "@/components/error-boundary";

import { EvolutionNotifications } from "@/components/garden/evolution-notifications";
import { ObservationContextPanel } from "@/components/garden/observation-context-panel";
import { EntanglementDetailPanel } from "@/components/garden/entanglement-detail-panel";
import { EventDetailModal } from "@/components/garden/event-detail-modal";
import { KeyboardShortcutHint } from "@/components/garden/keyboard-shortcut-hint";
import { GardenDrawer } from "@/components/garden/drawer";

import { trpc } from "@/lib/trpc/client";

export default function Home() {
  // Fetch earliest plant creation time to determine garden age
  const { isLoading: isPlantsLoading } = trpc.plants.list.useQuery();

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

        {/* Consolidated drawer (replaces Toolbar, DebugPanel, QuantumEventLog) */}
        <GardenDrawer />

        {/* Independent widgets */}
        <EvolutionNotifications />
        <ObservationContextPanel />
        <EntanglementDetailPanel />
        <EventDetailModal />
        <KeyboardShortcutHint />
      </main>
    </ErrorBoundary>
  );
}
