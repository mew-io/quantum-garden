/**
 * Centralized quantum explanation generation.
 *
 * Generates structured, multi-layer explanations for all quantum events
 * in the garden. Replaces scattered static text with dynamic, data-driven
 * content that communicates the actual quantum mechanics at play.
 *
 * Each explanation has two layers:
 * - friendly: Accessible 2-3 sentence explanation for general audience
 * - technical: Quantum mechanics details with measurement data
 */

import type { QuantumEvent, CircuitType } from "@quantum-garden/shared";

// =============================================================================
// Public Types
// =============================================================================

/**
 * Structured explanation generated from a quantum event.
 * Every event type produces all four fields — no generic fallbacks.
 */
export interface QuantumExplanation {
  /** ~50 char summary for event log list */
  summary: string;
  /** 2-3 sentence accessible explanation */
  friendly: string;
  /** Quantum mechanics details with specific data */
  technical: string;
}

// =============================================================================
// Circuit Reference Data (consolidated from duplicated sources)
// =============================================================================

export interface CircuitInfo {
  name: string;
  qubits: number;
  level: number;
  concept: string;
  gateDescription: string;
  diagram: string[];
  learnMoreUrl: string;
}

const CIRCUIT_INFO: Record<CircuitType, CircuitInfo> = {
  superposition: {
    name: "Superposition",
    qubits: 1,
    level: 1,
    concept: "Quantum state exists in multiple states simultaneously",
    gateDescription:
      "Hadamard (H) gate creates equal superposition, followed by a seed-based Ry rotation",
    diagram: ["     ┌───┐┌─┐", "q₀ ──┤ H ├┤M├", "     └───┘└─┘"],
    learnMoreUrl: "/docs/quantum-circuits#superposition",
  },
  bell_pair: {
    name: "Bell Pair",
    qubits: 2,
    level: 2,
    concept: "Two qubits become perfectly correlated",
    gateDescription: "Hadamard (H) on q₀, then CNOT entangles q₀→q₁, creating the Bell state |Φ+⟩",
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
    qubits: 3,
    level: 3,
    concept: "Multi-party entanglement across three or more qubits",
    gateDescription:
      "Hadamard (H) on q₀, then CNOT chain q₀→q₁→q₂ propagates entanglement across all three qubits",
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
    qubits: 4,
    level: 4,
    concept: "Probability amplitudes combine constructively or destructively",
    gateDescription:
      "H gates on all 4 qubits, Rz phase rotations, CNOT pairs (q₀→q₁, q₂→q₃), CZ cross-entanglement (q₁-q₂), final H and Ry layers",
    diagram: [
      "     ┌───┐┌───────┐┌───┐┌─┐",
      "q₀ ──┤ H ├┤ Rz(θ) ├┤ H ├┤M├",
      "     └───┘└───────┘└───┘└─┘",
    ],
    learnMoreUrl: "/docs/quantum-circuits#interference",
  },
  variational: {
    name: "Variational Circuit",
    qubits: 5,
    level: 5,
    concept: "Parameterized gates create unique quantum states",
    gateDescription:
      "6-layer circuit: H layer, parameterized Ry rotations, linear CNOT entanglement chain, Rz phase gates, cross-CNOT entanglement, final Ry rotations",
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

// =============================================================================
// Public Accessors for Circuit Data
// =============================================================================

export function getCircuitInfo(circuitId: CircuitType): CircuitInfo {
  return CIRCUIT_INFO[circuitId] ?? CIRCUIT_INFO.variational;
}

export function getCircuitDiagram(circuitId: CircuitType): string[] {
  return getCircuitInfo(circuitId).diagram;
}

export function getCircuitName(circuitId: CircuitType): string {
  return getCircuitInfo(circuitId).name;
}

export function getCircuitConcept(circuitId: CircuitType): string {
  return getCircuitInfo(circuitId).concept;
}

export function getCircuitLearnMoreUrl(circuitId: CircuitType): string {
  return getCircuitInfo(circuitId).learnMoreUrl;
}

// =============================================================================
// Explanation Generation
// =============================================================================

/**
 * Generate a structured, multi-layer explanation for any quantum event.
 */
export function generateExplanation(event: QuantumEvent): QuantumExplanation {
  switch (event.type) {
    case "observation":
      return generateObservationExplanation(event);
    case "germination":
      return generateGerminationExplanation(event);
    case "entanglement":
      return generateEntanglementExplanation(event);
    case "wave_germination":
      return generateWaveGerminationExplanation(event);
    case "death":
      return generateDeathExplanation(event);
    default:
      return generateDeathExplanation(event);
  }
}

// =============================================================================
// Per-Event-Type Generators
// =============================================================================

function generateObservationExplanation(event: QuantumEvent): QuantumExplanation {
  const circuit = getCircuitInfo(event.circuitId ?? "variational");
  const variant = event.variantId ?? "plant";
  const ms = event.measurementSummary;

  // Build execution mode description
  let executionNote = "";
  if (event.executionMode === "simulator") {
    executionNote =
      " These traits were determined by a real IonQ quantum simulator — actual quantum noise and probabilistic behavior shaped this outcome.";
  } else if (event.executionMode === "hardware") {
    executionNote =
      " These traits were determined by real IonQ trapped-ion quantum hardware — genuine quantum mechanics at work.";
  }

  // Build circuit-specific friendly explanation
  let circuitFriendly: string;
  switch (event.circuitId) {
    case "superposition":
      circuitFriendly = `Your observation collapsed this plant's quantum superposition. A single qubit was placed into an equal superposition of |0⟩ and |1⟩ using a Hadamard gate — meaning it existed as both states simultaneously. The moment you observed it, the wave function collapsed and forced a definite outcome, determining this plant's visual form.${executionNote}`;
      break;
    case "bell_pair":
      circuitFriendly = `Your observation collapsed a Bell pair — two qubits entangled so their measurement outcomes are perfectly correlated. A Hadamard gate and CNOT gate created the state (|00⟩ + |11⟩)/√2, meaning both qubits are in superposition but when measured, they always agree. Einstein called this "spooky action at a distance."${executionNote}`;
      break;
    case "ghz_state":
      circuitFriendly = `Your observation collapsed a GHZ state — a 3-qubit entangled state where all qubits are correlated in an "all-or-nothing" fashion. The system existed as (|000⟩ + |111⟩)/√2, meaning all three qubits measured the same value. This demonstrates multi-party entanglement, one of the most striking features of quantum mechanics.${executionNote}`;
      break;
    case "interference":
      circuitFriendly = `This plant's traits emerged from quantum interference across 4 qubits. Phase rotations caused some measurement outcomes to be amplified (constructive interference) while others were suppressed (destructive interference). Like light waves creating bright and dark bands, quantum probability amplitudes combined mathematically to favor certain outcomes over others.${executionNote}`;
      break;
    case "variational":
      circuitFriendly = `A variational quantum circuit with 5 qubits and tunable parameters generated this plant's unique form. Six layers of parameterized gates — Hadamard, Ry rotations, CNOT entanglement chains, Rz phase gates, and cross-qubit entanglement — created a quantum state unique to this plant's seed. This is the same class of circuit used in real quantum optimization and machine learning.${executionNote}`;
      break;
    default:
      circuitFriendly = `Your observation collapsed this plant's quantum state. Its form was encoded in a ${circuit.qubits}-qubit ${circuit.name.toLowerCase()} circuit — until you observed it, it existed as a superposition of all possible patterns. The measurement forced a single definite outcome.${executionNote}`;
  }

  // Build technical details
  const technicalParts: string[] = [
    `Circuit: ${circuit.name} (Level ${circuit.level}, ${circuit.qubits} qubit${circuit.qubits > 1 ? "s" : ""}).`,
    `Gate sequence: ${circuit.gateDescription}.`,
  ];

  if (ms) {
    technicalParts.push(
      `Measured ${ms.shots} shots.`,
      `Most common outcome: |${ms.dominantBitstring}⟩ (${(ms.dominantProbability * 100).toFixed(1)}% probability).`,
      `Distinct outcomes observed: ${ms.distinctOutcomes} of ${Math.pow(2, circuit.qubits)} possible.`
    );
  }

  technicalParts.push(`Execution mode: ${event.executionMode ?? "mock"}.`);

  if (event.resolvedTraits) {
    technicalParts.push(
      `Resolved traits — growth rate: ${event.resolvedTraits.growthRate.toFixed(2)}x, opacity: ${(event.resolvedTraits.opacity * 100).toFixed(0)}%, colors: ${event.resolvedTraits.colorPalette.length} in palette.`
    );
  }

  return {
    summary: `Wave function collapsed: ${variant} (${circuit.name})`,
    friendly: circuitFriendly,
    technical: technicalParts.join(" "),
  };
}

function generateGerminationExplanation(event: QuantumEvent): QuantumExplanation {
  const variant = event.variantId ?? "Seed";
  const dormancyStr = event.dormancyDuration ? formatDuration(event.dormancyDuration) : null;

  const typeLabel =
    event.germinationType === "guaranteed"
      ? "reached its guaranteed germination threshold"
      : event.germinationType === "wave"
        ? "emerged as part of a synchronized quantum wave"
        : "passed its probabilistic germination check";

  const dormancyNote = dormancyStr ? ` after ${dormancyStr} in a dormant state` : "";

  return {
    summary: dormancyStr
      ? `${variant} germinated (${dormancyStr} dormancy)`
      : `${variant} germinated`,

    friendly:
      `A dormant seed has sprouted${dormancyNote}. This plant ${typeLabel}. ` +
      `In quantum mechanics, this is analogous to quantum tunneling — a particle ` +
      `trapped behind an energy barrier that suddenly appears on the other side. ` +
      `It doesn't climb over the barrier; instead, the wave function extends through it, ` +
      `giving a non-zero probability of appearing beyond. Each evaluation cycle, ` +
      `this seed's quantum probability was tested, and this time it tunneled through.`,

    technical:
      `Germination type: ${event.germinationType ?? "normal"}. ` +
      (dormancyStr ? `Dormancy duration: ${dormancyStr}. ` : "") +
      `The garden evaluates germination probability every evolution cycle. ` +
      `Base probability: 25%. Modifiers: proximity to observed plants (2x bonus), ` +
      `age weighting (up to 2.5x for older seeds), clustering prevention/bonus ` +
      `based on variant distribution. Guaranteed germination occurs after 10 minutes of dormancy.` +
      (event.germinationType === "guaranteed"
        ? " This plant reached the guaranteed threshold."
        : ""),
  };
}

function generateEntanglementExplanation(event: QuantumEvent): QuantumExplanation {
  const partnerCount = event.partnerPlantIds?.length ?? 0;
  const totalPlants = partnerCount + 1;
  const groupShort = event.entanglementGroupId?.slice(0, 8) ?? "unknown";

  return {
    summary: `Entanglement: ${totalPlants} plants correlated instantly`,

    friendly:
      `Observing this plant instantly revealed ${partnerCount} entangled partner${partnerCount !== 1 ? "s" : ""}. ` +
      `These plants shared a quantum Bell pair — their measurement outcomes were determined ` +
      `by the same entangled quantum state. When you measured one, the other${partnerCount !== 1 ? "s" : ""} ` +
      `collapsed to correlated values instantaneously, regardless of their positions in the garden. ` +
      `This is not communication — no information traveled between them. Rather, the correlations ` +
      `were established when the entangled state was created, and measurement simply revealed them.`,

    technical:
      `Entanglement group: ${groupShort}. ` +
      `${totalPlants} plants share correlated quantum states derived from the same Bell pair circuit. ` +
      `All plants in this group used the entanglement group ID as their pool seed, ensuring ` +
      `identical quantum measurement outcomes. ` +
      `Correlated traits: color palette, glyph pattern, growth rate, opacity (determined by shared quantum measurement). ` +
      `Independent traits: species/variant, position (determined classically). ` +
      `This mirrors real entanglement: measurement outcomes are correlated, but the physical systems can otherwise differ.`,
  };
}

function generateWaveGerminationExplanation(event: QuantumEvent): QuantumExplanation {
  const count = event.waveSize ?? 0;

  return {
    summary: `Quantum wave: ${count} plants germinated in phase`,

    friendly:
      `A wave of ${count} plants germinated simultaneously! ` +
      `When multiple dormant seeds share quantum coherence — meaning their quantum states ` +
      `evolve in a coordinated, phase-locked manner — they can undergo a collective transition ` +
      `together. This is analogous to a quantum phase transition, where a system suddenly shifts ` +
      `from one quantum state to another across all its components at once, like water freezing ` +
      `into ice throughout a container simultaneously.`,

    technical:
      `Wave size: ${count} plants. ` +
      `Wave germination triggers with 8% probability when 5 or more dormant plants exist. ` +
      `3-5 spatially distributed plants are selected to maximize visual spread across the garden. ` +
      `This models quantum phase transitions — abrupt, collective changes in a many-body ` +
      `quantum system's ground state driven by a parameter crossing a critical threshold.`,
  };
}

function generateDeathExplanation(event: QuantumEvent): QuantumExplanation {
  const variant = event.variantId ?? "Plant";
  const lifespanStr =
    event.createdAt && event.timestamp
      ? formatDuration(new Date(event.timestamp).getTime() - new Date(event.createdAt).getTime())
      : null;

  return {
    summary: `${variant} decohered — returned to ground state`,

    friendly:
      `This plant has completed its lifecycle and decohered — losing its quantum properties ` +
      `as it interacted with the environment.${lifespanStr ? ` It lived for ${lifespanStr}.` : ""} ` +
      `In quantum mechanics, decoherence is the process by which a quantum system loses ` +
      `its "quantumness" through unavoidable interactions with its surroundings. ` +
      `The plant's quantum information is not destroyed — it becomes entangled with the ` +
      `environment, effectively spreading out and becoming inaccessible. ` +
      `Its record in the garden's history preserves what was once a coherent quantum state.`,

    technical:
      `Plant ${event.plantId.slice(0, 8)} (${variant}) has decohered. ` +
      (lifespanStr ? `Total lifespan: ${lifespanStr}. ` : "") +
      `Decoherence occurs when a quantum system's phase relationships are disrupted ` +
      `by interaction with environmental degrees of freedom. Mathematically, the system's ` +
      `density matrix transitions from a pure state (off-diagonal elements present) to a ` +
      `mixed state (off-diagonal elements approach zero). The decoherence time T₂ is the ` +
      `characteristic timescale — after T₂, quantum information is effectively lost to the environment.`,
  };
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Format a millisecond duration as a human-readable string.
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}
