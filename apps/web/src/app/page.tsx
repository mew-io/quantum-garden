"use client";

import { GardenCanvas } from "@/components/garden/garden-canvas";
import { ErrorBoundary } from "@/components/error-boundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <main>
        <GardenCanvas />
      </main>
    </ErrorBoundary>
  );
}
