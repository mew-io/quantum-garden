import type { Metadata } from "next";
import { Sandbox } from "@/components/sandbox";

export const metadata: Metadata = {
  title: "Pattern Sandbox | Quantum Garden",
  description: "Visual development environment for glyph patterns",
};

/**
 * Pattern Sandbox Page
 *
 * Displays all glyph patterns across all color palettes for visual development.
 * Shows the 28 patterns (4 legacy + 8 firework + 8 smooth + 8 curve-generated)
 * combined with 8 color palettes for 224 total combinations.
 */
export default function PatternsPage() {
  return <Sandbox />;
}
