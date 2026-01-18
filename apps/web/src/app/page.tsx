"use client";

import { GardenCanvas } from "@/components/garden/garden-canvas";
import { ErrorBoundary } from "@/components/error-boundary";
import { InfoOverlay } from "@/components/garden/info-overlay";

export default function Home() {
  return (
    <ErrorBoundary>
      <main>
        <GardenCanvas />
        <InfoOverlay />
      </main>
    </ErrorBoundary>
  );
}
