import type { Metadata } from "next";
import { VariantSandbox } from "@/components/sandbox";
import { SandboxErrorBoundary } from "./error-boundary";

export const metadata: Metadata = {
  title: "Sandbox | Quantum Garden",
  description: "Visual development environment for plant variants and lifecycle animations",
};

/**
 * Main Sandbox Page
 *
 * The consolidated sandbox for designing plant variants and their lifecycle animations.
 * Features:
 * - Gallery view of all variants
 * - Superposed view showing all variants in quantum superposition
 * - Detail view for individual variant inspection
 */
export default function SandboxPage() {
  return (
    <SandboxErrorBoundary>
      <VariantSandbox />
    </SandboxErrorBoundary>
  );
}
