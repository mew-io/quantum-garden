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

import { useEffect, useCallback, useState, useRef } from "react";
import { useGardenStore } from "@/stores/garden-store";
import { UI_TIMING } from "@quantum-garden/shared";
import type { CircuitType } from "@quantum-garden/shared";
import {
  getCircuitName,
  getCircuitConcept,
  getCircuitDiagram,
  getCircuitLearnMoreUrl,
  getCircuitInfo,
} from "@/lib/quantum-explanations";

/** Animation duration in ms for entry/exit transitions */
const ANIMATION_DURATION_MS = 350;

/**
 * Simple ASCII circuit diagram renderer.
 */
function CircuitDiagram({ lines }: { lines: string[] }) {
  return (
    <pre
      className="
        mt-3 rounded bg-[--wc-paper]/80 px-3 py-2
        font-mono text-xs text-emerald-800/80
        overflow-x-auto border border-[--wc-stone]/20
      "
    >
      {lines.join("\n")}
    </pre>
  );
}

/**
 * Get a brief circuit explanation for the context panel.
 * Shorter than the full modal explanation — designed for quick reading.
 */
function getCircuitExplanation(circuitId: string): string {
  const id = circuitId as CircuitType;
  const info = getCircuitInfo(id);

  switch (id) {
    case "superposition":
      return (
        "This plant's form was encoded in a quantum superposition \u2014 " +
        "existing as all possible patterns at once until your observation " +
        "collapsed it to this single reality. The Hadamard gate (H) creates " +
        `an equal probability of measuring |0\u27E9 or |1\u27E9 across ${info.qubits} qubit.`
      );
    case "bell_pair":
      return (
        "This plant shared a Bell pair with its partner \u2014 observing one instantly " +
        "revealed the other's form through quantum entanglement. Both plants share " +
        "correlated quantum properties like color palette, growth rate, and opacity. " +
        `Circuit: ${info.qubits} qubits entangled via H + CNOT gates.`
      );
    case "ghz_state":
      return (
        "A Greenberger\u2013Horne\u2013Zeilinger state links multiple plants in a web of " +
        "quantum correlation \u2014 observing any one reveals information about all the others. " +
        `Circuit: ${info.qubits} qubits in all-or-nothing entanglement.`
      );
    case "interference":
      return (
        "This plant's traits emerged from quantum interference \u2014 wave-like probability " +
        "amplitudes that reinforced some outcomes and canceled others, shaping what you now see. " +
        `Circuit: ${info.qubits} qubits with phase rotations and cross-entanglement.`
      );
    case "variational":
      return (
        "A variational circuit with tunable parameters generated this plant's unique form \u2014 " +
        "like a quantum fingerprint that cannot be exactly replicated. " +
        `Circuit: ${info.qubits} qubits with 6 layers of parameterized gates.`
      );
    default:
      return (
        `A ${info.qubits}-qubit ${info.name.toLowerCase()} circuit determined this plant's traits ` +
        "through quantum measurement."
      );
  }
}

/**
 * Panel content when observation context is active.
 * Supports both entry and exit animations via the isExiting prop.
 */
function PanelContent({
  circuitId,
  onDismiss,
  onDontShowAgain,
  isExiting,
}: {
  circuitId: string;
  onDismiss: () => void;
  onDontShowAgain: () => void;
  isExiting: boolean;
}) {
  const name = getCircuitName(circuitId as CircuitType);
  const concept = getCircuitConcept(circuitId as CircuitType);
  const diagram = getCircuitDiagram(circuitId as CircuitType);
  const learnMoreUrl = getCircuitLearnMoreUrl(circuitId as CircuitType);
  const explanation = getCircuitExplanation(circuitId);

  // Animation classes based on entry/exit state
  // Use ease-out for entry (decelerating), ease-in for exit (accelerating away)
  const animationClasses = isExiting
    ? "animate-out fade-out slide-out-to-left-5 duration-300 ease-in"
    : "animate-in fade-in slide-in-from-left-5 duration-350 ease-out";

  return (
    <div
      className={`
        w-[min(320px,calc(100vw-2*var(--inset-left)))] rounded-xl garden-panel
        p-4
        ${animationClasses}
      `}
      role="dialog"
      aria-labelledby="context-title"
    >
      {/* Header - appears first */}
      <div
        className={`mb-3 flex items-start justify-between ${!isExiting ? "animate-in fade-in duration-300" : ""}`}
        style={{
          animationDelay: isExiting ? "0ms" : "50ms",
          animationFillMode: "backwards",
        }}
      >
        <div>
          <h3 id="context-title" className="text-sm font-medium text-[--wc-ink]">
            {name}
          </h3>
          <p className="mt-0.5 text-xs text-[--wc-ink-muted]">{concept}</p>
        </div>
        <button
          onClick={onDismiss}
          className="
            -mr-1 -mt-1 rounded p-1
            text-[--wc-ink-muted] hover:text-[--wc-ink]
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

      {/* Circuit Diagram - appears second */}
      <div
        className={!isExiting ? "animate-in fade-in duration-300" : ""}
        style={{
          animationDelay: isExiting ? "0ms" : "100ms",
          animationFillMode: "backwards",
        }}
      >
        <CircuitDiagram lines={diagram} />
      </div>

      {/* Explanation - appears third */}
      <p
        className={`mt-3 text-xs leading-relaxed text-[--wc-ink-soft] ${!isExiting ? "animate-in fade-in duration-300" : ""}`}
        style={{
          animationDelay: isExiting ? "0ms" : "150ms",
          animationFillMode: "backwards",
        }}
      >
        {explanation}
      </p>

      {/* Footer actions - appears last */}
      <div
        className={`mt-4 flex items-center justify-between text-xs ${!isExiting ? "animate-in fade-in duration-300" : ""}`}
        style={{
          animationDelay: isExiting ? "0ms" : "200ms",
          animationFillMode: "backwards",
        }}
      >
        <a
          href={learnMoreUrl}
          className="
            text-emerald-700 hover:text-emerald-800
            transition-colors underline-offset-2 hover:underline
          "
        >
          Learn More
        </a>
        <button
          onClick={onDontShowAgain}
          className="
            text-[--wc-ink-muted] hover:text-[--wc-ink-soft]
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
 *
 * Features improved animations:
 * - Entry: Fade in + slide from left
 * - Exit: Fade out + slide to left (with delayed removal)
 */
export function ObservationContextPanel() {
  const { observationContext, clearObservationContext } = useGardenStore();
  const [isHiddenPermanently, setIsHiddenPermanently] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [visibleContext, setVisibleContext] = useState(observationContext);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check localStorage preference on mount
  useEffect(() => {
    const hidden = localStorage.getItem("quantum-garden-hide-context-panel");
    if (hidden === "true") {
      setIsHiddenPermanently(true);
    }
  }, []);

  // Track context changes for exit animation
  useEffect(() => {
    // Clear any pending exit timer
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    if (observationContext) {
      // New context arrived - show immediately
      setIsExiting(false);
      setVisibleContext(observationContext);
    } else if (visibleContext && !isExiting) {
      // Context cleared - start exit animation
      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setVisibleContext(null);
        setIsExiting(false);
      }, ANIMATION_DURATION_MS);
    }
  }, [observationContext, visibleContext, isExiting]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  // Handle dismiss with exit animation
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    exitTimerRef.current = setTimeout(() => {
      clearObservationContext();
      setVisibleContext(null);
      setIsExiting(false);
    }, ANIMATION_DURATION_MS);
  }, [clearObservationContext]);

  // Handle "don't show again" with exit animation
  const handleDontShowAgain = useCallback(() => {
    localStorage.setItem("quantum-garden-hide-context-panel", "true");
    setIsHiddenPermanently(true);
    setIsExiting(true);
    exitTimerRef.current = setTimeout(() => {
      clearObservationContext();
      setVisibleContext(null);
      setIsExiting(false);
    }, ANIMATION_DURATION_MS);
  }, [clearObservationContext]);

  // Auto-dismiss after configured duration (see UI_TIMING.CONTEXT_PANEL_DISMISS_MS)
  useEffect(() => {
    if (observationContext && !isExiting) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, UI_TIMING.CONTEXT_PANEL_DISMISS_MS);
      return () => clearTimeout(timer);
    }
  }, [observationContext, isExiting, handleDismiss]);

  // Don't render if hidden permanently or no visible context
  if (isHiddenPermanently || !visibleContext) {
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
          circuitId={visibleContext.circuitId}
          onDismiss={handleDismiss}
          onDontShowAgain={handleDontShowAgain}
          isExiting={isExiting}
        />
      </div>
    </div>
  );
}
