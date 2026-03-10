import { Suspense } from "react";
import type { Metadata } from "next";
import { VariantSandbox } from "@/components/sandbox";
import { SandboxErrorBoundary } from "./error-boundary";

export const metadata: Metadata = {
  title: "Seed Box | Quantum Garden",
  description: "Visual development environment for plant variants and lifecycle animations",
};

/**
 * Loading fallback for sandbox while URL params are being read
 */
function SandboxLoading() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-500">Loading seed box...</div>
    </div>
  );
}

/**
 * Main Sandbox Page
 *
 * The consolidated sandbox for designing plant variants and their lifecycle animations.
 * Features:
 * - Gallery view of all variants
 * - Superposed view showing all variants in quantum superposition
 * - Detail view for individual variant inspection
 *
 * URL-based routing:
 * - /sandbox - gallery view
 * - /sandbox?view=superposed - superposed view
 * - /sandbox?variant=simple-bloom - detail view for specific variant
 * - /sandbox?variant=simple-bloom&color=red - with color variation
 */
export default function SandboxPage() {
  return (
    <SandboxErrorBoundary>
      <Suspense fallback={<SandboxLoading />}>
        <VariantSandbox />
      </Suspense>
    </SandboxErrorBoundary>
  );
}
