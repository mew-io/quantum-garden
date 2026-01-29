/**
 * EventDetailModal - Full-screen modal showing quantum event details
 *
 * Displays educational content about a selected quantum event:
 * - For observations: Circuit diagram and quantum explanation
 * - For germinations: Dormancy info and probability factors
 * - For entanglement: Partner info and correlation explanation
 *
 * Includes prev/next navigation between events.
 */

"use client";

import { useCallback, useMemo, useEffect } from "react";
import { useGardenStore } from "@/stores/garden-store";
import type { QuantumEvent, CircuitType } from "@quantum-garden/shared";

/**
 * Educational content for each quantum circuit type.
 */
interface CircuitEducation {
  name: string;
  concept: string;
  explanation: string;
  diagram: string[];
}

const CIRCUIT_EDUCATION: Record<CircuitType, CircuitEducation> = {
  superposition: {
    name: "Superposition",
    concept: "Quantum state exists in multiple states simultaneously",
    explanation:
      "This plant's form was encoded in a quantum superposition—existing as all possible patterns at once until your observation collapsed it to this single reality. The Hadamard gate (H) creates an equal probability of measuring |0⟩ or |1⟩.",
    diagram: ["     ┌───┐┌─┐", "q₀ ──┤ H ├┤M├", "     └───┘└─┘"],
  },
  bell_pair: {
    name: "Bell Pair",
    concept: "Two qubits become perfectly correlated",
    explanation:
      "This plant shared a Bell pair with its partner—observing one instantly revealed the other's form through quantum entanglement, regardless of distance. Einstein called this 'spooky action at a distance.'",
    diagram: [
      "     ┌───┐     ┌─┐",
      "q₀ ──┤ H ├──●──┤M├",
      "     └───┘  │  └─┘",
      "          ┌─┴─┐┌─┐",
      "q₁ ───────┤ X ├┤M├",
      "          └───┘└─┘",
    ],
  },
  ghz_state: {
    name: "GHZ State",
    concept: "Multi-party entanglement across three or more qubits",
    explanation:
      "A Greenberger–Horne–Zeilinger state links multiple plants in a web of quantum correlation—observing any one reveals information about all the others. This is the basis for quantum error correction.",
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
  },
  interference: {
    name: "Quantum Interference",
    concept: "Probability amplitudes combine constructively or destructively",
    explanation:
      "This plant's traits emerged from quantum interference—wave-like probability amplitudes that reinforced some outcomes and canceled others. Like light waves creating bright and dark bands, quantum states combine mathematically.",
    diagram: [
      "     ┌───┐┌───────┐┌───┐┌─┐",
      "q₀ ──┤ H ├┤ Rz(θ) ├┤ H ├┤M├",
      "     └───┘└───────┘└───┘└─┘",
    ],
  },
  variational: {
    name: "Variational Circuit",
    concept: "Parameterized gates create unique quantum states",
    explanation:
      "A variational circuit with tunable parameters generated this plant's unique form—like a quantum fingerprint that cannot be exactly replicated. These circuits are the building blocks of quantum machine learning.",
    diagram: [
      "     ┌────────┐┌────────┐┌─┐",
      "q₀ ──┤ Ry(θ₀) ├┤ Rz(φ₀) ├┤M├",
      "     └────────┘└───┬────┘└─┘",
      "     ┌────────┐┌───┴────┐┌─┐",
      "q₁ ──┤ Ry(θ₁) ├┤ Rz(φ₁) ├┤M├",
      "     └────────┘└────────┘└─┘",
    ],
  },
};

/**
 * Educational content for germination events.
 */
const GERMINATION_EDUCATION = {
  name: "Quantum Germination",
  concept: "Seeds emerge from dormancy through quantum probability",
  explanation:
    "Each dormant seed has a probability of germinating based on its quantum state. The garden's evolution system continuously evaluates these probabilities, causing seeds to sprout at seemingly random—but quantum-determined—moments.",
};

/**
 * Educational content for entanglement events.
 */
const ENTANGLEMENT_EDUCATION = {
  name: "Quantum Entanglement",
  concept: "Correlated measurements across separated systems",
  explanation:
    "When you observed one entangled plant, its quantum state collapsed—and instantaneously, its partner's state was determined too. This correlation exists regardless of the distance between plants, demonstrating one of quantum mechanics' most profound features.",
};

/**
 * Educational content for wave germination events.
 */
const WAVE_EDUCATION = {
  name: "Wave Germination",
  concept: "Coherent quantum state collapse across multiple seeds",
  explanation:
    "A wave germination event occurs when multiple dormant seeds share quantum coherence. When conditions align, they germinate together in a synchronized burst—like a quantum phase transition rippling through the garden.",
};

/**
 * Get the educational content for a specific event.
 */
function getEventEducation(event: QuantumEvent): {
  name: string;
  concept: string;
  explanation: string;
  diagram?: string[];
} {
  switch (event.type) {
    case "observation":
      const circuit = event.circuitId
        ? CIRCUIT_EDUCATION[event.circuitId]
        : CIRCUIT_EDUCATION.variational;
      return circuit;
    case "germination":
      return GERMINATION_EDUCATION;
    case "entanglement":
      return ENTANGLEMENT_EDUCATION;
    case "wave_germination":
      return WAVE_EDUCATION;
    default:
      return {
        name: "Quantum Event",
        concept: "A quantum phenomenon occurred",
        explanation: "This event represents a quantum interaction in the garden.",
      };
  }
}

/**
 * Get the color class for an event type.
 */
function getEventColor(type: QuantumEvent["type"]): string {
  switch (type) {
    case "observation":
      return "text-cyan-400";
    case "germination":
      return "text-green-400";
    case "entanglement":
      return "text-purple-400";
    case "wave_germination":
      return "text-blue-400";
    default:
      return "text-green-400";
  }
}

/**
 * Format a date as a readable string.
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Simple ASCII circuit diagram renderer.
 */
function CircuitDiagram({ lines }: { lines: string[] }) {
  return (
    <pre
      className="
        mt-4 rounded-lg bg-black/60 px-4 py-3
        font-mono text-xs text-green-300/80
        overflow-x-auto border border-green-500/10
      "
    >
      {lines.join("\n")}
    </pre>
  );
}

/**
 * Detail section for additional event-specific info.
 */
function EventDetails({ event }: { event: QuantumEvent }) {
  const details: { label: string; value: string }[] = [];

  if (event.variantId) {
    details.push({ label: "Variant", value: event.variantId });
  }
  if (event.circuitId) {
    details.push({ label: "Circuit", value: event.circuitId });
  }
  if (event.executionMode) {
    details.push({ label: "Execution", value: event.executionMode });
  }
  if (event.entanglementGroupId) {
    details.push({ label: "Entanglement Group", value: event.entanglementGroupId.slice(0, 8) });
  }
  if (event.germinationType) {
    details.push({ label: "Germination Type", value: event.germinationType });
  }
  if (event.waveSize) {
    details.push({ label: "Wave Size", value: `${event.waveSize} plants` });
  }
  if (event.resolvedTraits?.colorPalette) {
    details.push({ label: "Colors", value: event.resolvedTraits.colorPalette.length.toString() });
  }

  if (details.length === 0) return null;

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {details.map((detail) => (
        <div key={detail.label} className="bg-black/40 rounded px-3 py-2">
          <p className="text-[10px] text-green-100/40 uppercase tracking-wide">{detail.label}</p>
          <p className="text-xs text-green-100/80 font-mono">{detail.value}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Main EventDetailModal component.
 */
export function EventDetailModal() {
  const { eventLog, selectedEventId, setSelectedEventId } = useGardenStore();

  // Find the selected event
  const selectedEvent = useMemo(
    () => eventLog.find((e) => e.id === selectedEventId),
    [eventLog, selectedEventId]
  );

  // Find index for navigation
  const selectedIndex = useMemo(
    () => eventLog.findIndex((e) => e.id === selectedEventId),
    [eventLog, selectedEventId]
  );

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) {
      const prevEvent = eventLog[selectedIndex - 1];
      if (prevEvent) {
        setSelectedEventId(prevEvent.id);
      }
    }
  }, [selectedIndex, eventLog, setSelectedEventId]);

  const handleNext = useCallback(() => {
    if (selectedIndex < eventLog.length - 1) {
      const nextEvent = eventLog[selectedIndex + 1];
      if (nextEvent) {
        setSelectedEventId(nextEvent.id);
      }
    }
  }, [selectedIndex, eventLog, setSelectedEventId]);

  const handleClose = useCallback(() => {
    setSelectedEventId(null);
  }, [setSelectedEventId]);

  // Keyboard navigation
  useEffect(() => {
    if (!selectedEventId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          handleClose();
          break;
        case "ArrowLeft":
          handlePrev();
          break;
        case "ArrowRight":
          handleNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEventId, handleClose, handlePrev, handleNext]);

  // Don't render if no event selected
  if (!selectedEvent) {
    return null;
  }

  const education = getEventEducation(selectedEvent);
  const colorClass = getEventColor(selectedEvent.type);

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/80 backdrop-blur-sm
        animate-in fade-in duration-200
      "
      onClick={handleClose}
    >
      <div
        className="
          relative w-full max-w-lg mx-4 rounded-xl
          border border-green-500/20 bg-gray-900/95
          shadow-2xl backdrop-blur-md
          animate-in zoom-in-95 duration-200
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-green-500/10">
          <div className="flex items-center gap-3">
            <span className={`${colorClass}`}>
              <EventTypeIcon type={selectedEvent.type} />
            </span>
            <div>
              <h2 className="text-lg font-medium text-green-100">{education.name}</h2>
              <p className="text-xs text-green-100/50">{formatDate(selectedEvent.timestamp)}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="
              rounded p-2
              text-green-100/40 hover:text-green-100/80
              transition-colors
            "
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Concept */}
          <p className={`text-sm font-medium ${colorClass}`}>{education.concept}</p>

          {/* Circuit diagram for observation events */}
          {education.diagram && <CircuitDiagram lines={education.diagram} />}

          {/* Explanation */}
          <p className="mt-4 text-sm leading-relaxed text-green-100/70">{education.explanation}</p>

          {/* Event-specific details */}
          <EventDetails event={selectedEvent} />
        </div>

        {/* Footer with navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-green-500/10">
          <button
            onClick={handlePrev}
            disabled={selectedIndex === 0}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium
              transition-colors
              ${
                selectedIndex === 0
                  ? "text-green-100/20 cursor-not-allowed"
                  : "text-green-100/60 hover:text-green-100 hover:bg-green-500/10"
              }
            `}
          >
            <ChevronLeftIcon /> Previous
          </button>
          <span className="text-xs text-green-100/40">
            {selectedIndex + 1} / {eventLog.length}
          </span>
          <button
            onClick={handleNext}
            disabled={selectedIndex === eventLog.length - 1}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium
              transition-colors
              ${
                selectedIndex === eventLog.length - 1
                  ? "text-green-100/20 cursor-not-allowed"
                  : "text-green-100/60 hover:text-green-100 hover:bg-green-500/10"
              }
            `}
          >
            Next <ChevronRightIcon />
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="px-6 pb-4 flex justify-center">
          <p className="text-[10px] text-green-100/30">
            Use <kbd className="px-1 py-0.5 bg-black/40 rounded">←</kbd>{" "}
            <kbd className="px-1 py-0.5 bg-black/40 rounded">→</kbd> to navigate,{" "}
            <kbd className="px-1 py-0.5 bg-black/40 rounded">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}

// Icons
function EventTypeIcon({ type }: { type: QuantumEvent["type"] }) {
  switch (type) {
    case "observation":
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "germination":
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M7 20h10M12 20v-8" />
          <path d="M12 12c-3 0-5-2-5-5 2 0 5 2 5 5z" />
          <path d="M12 12c3 0 5-2 5-5-2 0-5 2-5 5z" />
        </svg>
      );
    case "entanglement":
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    case "wave_germination":
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M2 12c.6-.5 1.5-1 2.5-1s2 1 3 1 2-.5 3-1 2-1 3-1 2 .5 3 1 2 1 3 1 1.9-.5 2.5-1" />
          <path d="M2 6c.6-.5 1.5-1 2.5-1s2 1 3 1 2-.5 3-1 2-1 3-1 2 .5 3 1 2 1 3 1 1.9-.5 2.5-1" />
          <path d="M2 18c.6-.5 1.5-1 2.5-1s2 1 3 1 2-.5 3-1 2-1 3-1 2 .5 3 1 2 1 3 1 1.9-.5 2.5-1" />
        </svg>
      );
  }
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
