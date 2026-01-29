/**
 * ObservationContextPanel - Educational panel shown after plant observation
 *
 * Displays quantum circuit information when a plant is observed:
 * - Circuit type and name
 * - Simplified visual circuit diagram
 * - Brief educational explanation
 * - "Learn More" link to detailed docs
 *
 * Design philosophy: Calm, dismissible, educational without being intrusive.
 * Positioned on the left side, slides in after observation.
 */

"use client";

import { useEffect, useCallback, useState } from "react";
import { useGardenStore } from "@/stores/garden-store";
import { UI_TIMING } from "@quantum-garden/shared";

/**
 * Educational content for each quantum circuit type.
 */
interface CircuitEducation {
  name: string;
  concept: string;
  explanation: string;
  diagram: string[];
  learnMoreUrl: string;
}

const CIRCUIT_EDUCATION: Record<string, CircuitEducation> = {
  superposition: {
    name: "Superposition",
    concept: "Quantum state exists in multiple states simultaneously",
    explanation:
      "This plant's form was encoded in a quantum superposition—existing as all possible patterns at once until your observation collapsed it to this single reality.",
    diagram: ["     ┌───┐┌─┐", "q₀ ──┤ H ├┤M├", "     └───┘└─┘"],
    learnMoreUrl: "/docs/quantum-circuits#superposition",
  },
  bell_pair: {
    name: "Bell Pair",
    concept: "Two qubits become perfectly correlated",
    explanation:
      "This plant shared a Bell pair with its partner—observing one instantly revealed the other's form through quantum entanglement, regardless of distance.",
    diagram: [
      "     ┌───┐     ┌─┐",
      "q₀ ──┤ H ├──●──┤M├",
      "     └───┘  │  └─┘",
      "          ┌─┴─┐┌─┐",
      "q₁ ───────┤ X ├┤M├",
      "          └───┘└─┘",
    ],
    learnMoreUrl: "/docs/quantum-circuits#bell-pair",
  },
  ghz_state: {
    name: "GHZ State",
    concept: "Multi-party entanglement across three or more qubits",
    explanation:
      "A Greenberger–Horne–Zeilinger state links multiple plants in a web of quantum correlation—observing any one reveals information about all the others.",
    diagram: [
      "     ┌───┐          ┌─┐",
      "q₀ ──┤ H ├──●───●───┤M├",
      "     └───┘  │   │   └─┘",
      "          ┌─┴─┐ │   ┌─┐",
      "q₁ ───────┤ X ├─┼───┤M├",
      "          └───┘ │   └─┘",
      "              ┌─┴─┐ ┌─┐",
      "q₂ ──────────┤ X ├─┤M├",
      "              └───┘ └─┘",
    ],
    learnMoreUrl: "/docs/quantum-circuits#ghz-state",
  },
  interference: {
    name: "Quantum Interference",
    concept: "Probability amplitudes combine constructively or destructively",
    explanation:
      "This plant's traits emerged from quantum interference—wave-like probability amplitudes that reinforced some outcomes and canceled others, shaping what you now see.",
    diagram: [
      "     ┌───┐┌───────┐┌───┐┌─┐",
      "q₀ ──┤ H ├┤ Rz(θ) ├┤ H ├┤M├",
      "     └───┘└───────┘└───┘└─┘",
    ],
    learnMoreUrl: "/docs/quantum-circuits#interference",
  },
  variational: {
    name: "Variational Circuit",
    concept: "Parameterized gates create unique quantum states",
    explanation:
      "A variational circuit with tunable parameters generated this plant's unique form—like a quantum fingerprint that cannot be exactly replicated.",
    diagram: [
      "     ┌────────┐┌────────┐┌─┐",
      "q₀ ──┤ Ry(θ₀) ├┤ Rz(φ₀) ├┤M├",
      "     └────────┘└───┬────┘└─┘",
      "     ┌────────┐┌───┴────┐┌─┐",
      "q₁ ──┤ Ry(θ₁) ├┤ Rz(φ₁) ├┤M├",
      "     └────────┘└────────┘└─┘",
    ],
    learnMoreUrl: "/docs/quantum-circuits#variational",
  },
};

/**
 * Get the appropriate circuit education for a given circuit ID.
 * Falls back to variational if circuit type not found.
 */
function getCircuitEducation(circuitId: string): CircuitEducation {
  return CIRCUIT_EDUCATION[circuitId] ?? CIRCUIT_EDUCATION.variational!;
}

/**
 * Simple ASCII circuit diagram renderer.
 */
function CircuitDiagram({ lines }: { lines: string[] }) {
  return (
    <pre
      className="
        mt-3 rounded bg-black/40 px-3 py-2
        font-mono text-xs text-green-300/80
        overflow-x-auto
      "
    >
      {lines.join("\n")}
    </pre>
  );
}

/**
 * Panel content when observation context is active.
 */
function PanelContent({
  circuitId,
  onDismiss,
  onDontShowAgain,
}: {
  circuitId: string;
  onDismiss: () => void;
  onDontShowAgain: () => void;
}) {
  const education = getCircuitEducation(circuitId);

  return (
    <div
      className="
        w-[320px] rounded-lg border border-green-500/20
        bg-black/85 p-4 shadow-xl backdrop-blur-md
        animate-in slide-in-from-left-5 duration-300
      "
      role="dialog"
      aria-labelledby="context-title"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 id="context-title" className="text-sm font-medium text-green-100">
            {education.name}
          </h3>
          <p className="mt-0.5 text-xs text-green-100/60">{education.concept}</p>
        </div>
        <button
          onClick={onDismiss}
          className="
            -mr-1 -mt-1 rounded p-1
            text-green-100/40 hover:text-green-100/80
            transition-colors
          "
          aria-label="Dismiss"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Circuit Diagram */}
      <CircuitDiagram lines={education.diagram} />

      {/* Explanation */}
      <p className="mt-3 text-xs leading-relaxed text-green-100/70">{education.explanation}</p>

      {/* Footer actions */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <a
          href={education.learnMoreUrl}
          className="
            text-green-400/80 hover:text-green-400
            transition-colors underline-offset-2 hover:underline
          "
        >
          Learn More
        </a>
        <button
          onClick={onDontShowAgain}
          className="
            text-green-100/40 hover:text-green-100/60
            transition-colors
          "
        >
          Don&apos;t show again
        </button>
      </div>
    </div>
  );
}

/**
 * Main observation context panel component.
 *
 * Shows educational content about the quantum circuit used when a plant
 * is observed. Positioned on the left side of the screen.
 *
 * User preferences (hide permanently) are stored in localStorage.
 */
export function ObservationContextPanel() {
  const { observationContext, clearObservationContext } = useGardenStore();
  const [isHiddenPermanently, setIsHiddenPermanently] = useState(false);

  // Check localStorage preference on mount
  useEffect(() => {
    const hidden = localStorage.getItem("quantum-garden-hide-context-panel");
    if (hidden === "true") {
      setIsHiddenPermanently(true);
    }
  }, []);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    clearObservationContext();
  }, [clearObservationContext]);

  // Handle "don't show again"
  const handleDontShowAgain = useCallback(() => {
    localStorage.setItem("quantum-garden-hide-context-panel", "true");
    setIsHiddenPermanently(true);
    clearObservationContext();
  }, [clearObservationContext]);

  // Auto-dismiss after configured duration (see UI_TIMING.CONTEXT_PANEL_DISMISS_MS)
  useEffect(() => {
    if (observationContext) {
      const timer = setTimeout(() => {
        clearObservationContext();
      }, UI_TIMING.CONTEXT_PANEL_DISMISS_MS);
      return () => clearTimeout(timer);
    }
  }, [observationContext, clearObservationContext]);

  // Don't render if hidden permanently or no context
  if (isHiddenPermanently || !observationContext) {
    return null;
  }

  return (
    <div
      className="
        pointer-events-none fixed bottom-[var(--inset-bottom)] left-[var(--inset-left)] z-40
        flex flex-col items-start
      "
    >
      <div className="pointer-events-auto">
        <PanelContent
          circuitId={observationContext.circuitId}
          onDismiss={handleDismiss}
          onDontShowAgain={handleDontShowAgain}
        />
      </div>
    </div>
  );
}
