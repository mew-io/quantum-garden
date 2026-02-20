/**
 * EventDetailModal - Full-screen modal showing quantum event details
 *
 * Displays multi-layer educational content about a selected quantum event:
 * - Friendly explanation (always visible)
 * - Technical quantum mechanics details
 * - Circuit diagram (for any event with a circuit)
 * - Event metadata
 *
 * Includes prev/next navigation between events.
 */

"use client";

import { useCallback, useMemo, useEffect } from "react";
import { useGardenStore } from "@/stores/garden-store";
import type { QuantumEvent } from "@quantum-garden/shared";
import { generateExplanation, getCircuitInfo, getCircuitDiagram } from "@/lib/quantum-explanations";

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
    case "death":
      return "text-gray-400";
    default:
      return "text-green-400";
  }
}

/**
 * Get a display title for an event type.
 */
function getEventTitle(event: QuantumEvent): string {
  switch (event.type) {
    case "observation": {
      const circuit = event.circuitId
        ? getCircuitInfo(event.circuitId)
        : getCircuitInfo("variational");
      return circuit.name;
    }
    case "germination": {
      const gCircuit = event.circuitId ? getCircuitInfo(event.circuitId) : null;
      return gCircuit ? `Quantum Germination (${gCircuit.name})` : "Quantum Germination";
    }
    case "entanglement": {
      const eCircuit = event.circuitId ? getCircuitInfo(event.circuitId) : null;
      return eCircuit ? `Quantum Entanglement (${eCircuit.name})` : "Quantum Entanglement";
    }
    case "wave_germination": {
      const wCircuit = event.circuitId ? getCircuitInfo(event.circuitId) : null;
      return wCircuit ? `Wave Germination (${wCircuit.name})` : "Wave Germination";
    }
    case "death": {
      const dCircuit = event.circuitId ? getCircuitInfo(event.circuitId) : null;
      return dCircuit ? `Decoherence (${dCircuit.name})` : "Quantum Decoherence";
    }
    default:
      return "Quantum Event";
  }
}

/**
 * Get the concept tagline for an event type.
 */
function getEventConcept(event: QuantumEvent): string {
  switch (event.type) {
    case "observation": {
      const circuit = event.circuitId
        ? getCircuitInfo(event.circuitId)
        : getCircuitInfo("variational");
      return circuit.concept;
    }
    case "germination":
      return "Seeds emerge from dormancy through quantum probability";
    case "entanglement":
      return "Correlated measurements across separated systems";
    case "wave_germination":
      return "Coherent quantum state collapse across multiple seeds";
    case "death":
      return "Quantum system loses coherence through environmental interaction";
    default:
      return "Quantum interaction in the garden";
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
 * Section with a subtle heading for visual separation.
 */
function ExplanationSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="mt-4">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-green-100/40 mb-1.5">
        {title}
      </h4>
      <p className="text-sm leading-relaxed text-green-100/70">{content}</p>
    </div>
  );
}

/**
 * Detail section for additional event-specific metadata.
 */
function EventDetails({ event }: { event: QuantumEvent }) {
  const details: { label: string; value: string }[] = [];

  if (event.variantId) {
    details.push({ label: "Variant", value: event.variantId });
  }
  if (event.circuitId) {
    const circuit = getCircuitInfo(event.circuitId);
    details.push({
      label: "Circuit",
      value: `${circuit.name} (L${circuit.level}, ${circuit.qubits}q)`,
    });
  }
  if (event.executionMode) {
    const modeLabels: Record<string, string> = {
      mock: "Local Simulation",
      simulator: "IonQ Simulator",
      hardware: "IonQ Hardware",
    };
    details.push({
      label: "Execution",
      value: modeLabels[event.executionMode] ?? event.executionMode,
    });
  }
  if (event.measurementSummary) {
    const ms = event.measurementSummary;
    details.push({
      label: "Shots",
      value: ms.shots.toString(),
    });
    details.push({
      label: "Dominant Outcome",
      value: `|${ms.dominantBitstring}\u27E9 (${(ms.dominantProbability * 100).toFixed(1)}%)`,
    });
  }
  if (event.entanglementGroupId) {
    details.push({
      label: "Entanglement Group",
      value: event.entanglementGroupId.slice(0, 8),
    });
  }
  if (event.partnerPlantIds && event.partnerPlantIds.length > 0) {
    details.push({
      label: "Partners",
      value: `${event.partnerPlantIds.length} entangled plant${event.partnerPlantIds.length !== 1 ? "s" : ""}`,
    });
  }
  if (event.germinationType) {
    details.push({ label: "Germination Type", value: event.germinationType });
  }
  if (event.waveSize) {
    details.push({ label: "Wave Size", value: `${event.waveSize} plants` });
  }
  if (event.resolvedTraits) {
    const t = event.resolvedTraits;
    if (typeof t.growthRate === "number") {
      details.push({ label: "Growth Rate", value: `${t.growthRate.toFixed(2)}x` });
    }
    if (typeof t.opacity === "number") {
      details.push({ label: "Opacity", value: `${(t.opacity * 100).toFixed(0)}%` });
    }
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

  const explanation = generateExplanation(selectedEvent);
  const colorClass = getEventColor(selectedEvent.type);
  const title = getEventTitle(selectedEvent);
  const concept = getEventConcept(selectedEvent);

  // Get circuit diagram for any event that has a circuit
  const diagram = selectedEvent.circuitId ? getCircuitDiagram(selectedEvent.circuitId) : undefined;

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
          max-h-[85vh] flex flex-col
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-green-500/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className={`${colorClass}`}>
              <EventTypeIcon type={selectedEvent.type} />
            </span>
            <div>
              <h2 className="text-lg font-medium text-green-100">{title}</h2>
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

        {/* Scrollable Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {/* Concept tagline */}
          <p className={`text-sm font-medium ${colorClass}`}>{concept}</p>

          {/* Circuit diagram for observation events */}
          {diagram && <CircuitDiagram lines={diagram} />}

          {/* What Happened — friendly explanation (always visible) */}
          <ExplanationSection title="What Happened" content={explanation.friendly} />

          {/* Quantum Details — technical explanation */}
          <ExplanationSection title="Quantum Details" content={explanation.technical} />

          {/* Event-specific metadata */}
          <EventDetails event={selectedEvent} />
        </div>

        {/* Footer with navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-green-500/10 flex-shrink-0">
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
        <div className="px-6 pb-4 flex justify-center flex-shrink-0">
          <p className="text-[10px] text-green-100/30">
            Use <kbd className="px-1 py-0.5 bg-black/40 rounded">&larr;</kbd>{" "}
            <kbd className="px-1 py-0.5 bg-black/40 rounded">&rarr;</kbd> to navigate,{" "}
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
    case "death":
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
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
