"use client";

import { GardenScene } from "@/components/garden/three";
import { ErrorBoundary } from "@/components/error-boundary";
import { InfoOverlay } from "@/components/garden/info-overlay";

export default function Home() {
  return (
    <ErrorBoundary>
      <main>
        <GardenScene />
        <InfoOverlay />
      </main>
    </ErrorBoundary>
  );
}
