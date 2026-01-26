"use client";

import { GardenScene } from "@/components/garden/three";
import { ErrorBoundary } from "@/components/error-boundary";
import { InfoOverlay } from "@/components/garden/info-overlay";
import { DebugPanel } from "@/components/garden/debug-panel";

export default function Home() {
  return (
    <ErrorBoundary>
      <main>
        <GardenScene />
        <InfoOverlay />
        <DebugPanel />
      </main>
    </ErrorBoundary>
  );
}
