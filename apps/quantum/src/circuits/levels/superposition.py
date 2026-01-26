"""
Level 1: Single Qubit Superposition Circuit.

Educational Concept: Quantum Superposition
- A single qubit can exist in a superposition of |0⟩ and |1⟩ states
- The Hadamard gate creates equal superposition: H|0⟩ = (|0⟩ + |1⟩)/√2
- Measurement collapses to either |0⟩ or |1⟩ with 50% probability each

Visual Outcome:
- Plants have exactly 2 possible appearances (binary choice)
- Pattern A or Pattern B with equal probability
- Demonstrates pure quantum randomness

This is the simplest quantum circuit - perfect for introducing quantum concepts.
"""

import math

from qiskit import (  # type: ignore[import-untyped]
    ClassicalRegister,
    QuantumCircuit,
    QuantumRegister,
)

from ..base import BaseCircuit, CircuitMetadata, ResolvedTraits
from ..registry import register_circuit

# Simple patterns for Level 1 (binary choice)
LEVEL_1_PATTERNS = [
    # Pattern 0: Simple cross (8x8)
    [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
    ],
    # Pattern 1: Diamond (8x8)
    [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
    ],
]

# Soft palettes for Level 1 (calming, simple)
LEVEL_1_PALETTES = [
    ["#D0E8D0", "#E0F0E0", "#F0F8F0"],  # Sage green
    ["#E0C0F0", "#E0D0F0", "#F0E8F8"],  # Soft lavender
]


@register_circuit
class SuperpositionCircuit(BaseCircuit):
    """Single qubit superposition circuit - Level 1 complexity."""

    @property
    def metadata(self) -> CircuitMetadata:
        return CircuitMetadata(
            id="superposition",
            name="Single Qubit Superposition",
            level=1,
            qubit_count=1,
            concept="Superposition",
            description=(
                "A single qubit placed in superposition using the Hadamard gate. "
                "Before measurement, the qubit exists in both |0⟩ and |1⟩ states "
                "simultaneously. Measurement collapses it to one state with 50% "
                "probability each. This demonstrates the fundamental quantum "
                "principle that particles can exist in multiple states at once "
                "until observed."
            ),
            min_rarity=1.0,  # Common plants (grasses, simple blooms)
            max_rarity=2.0,  # Upper bound for very common
        )

    def create(self, seed: int) -> QuantumCircuit:
        """Create a single-qubit superposition circuit.

        Circuit diagram:
             ┌───┐┌─────────┐┌─┐
        q_0: ┤ H ├┤ Ry(θ)   ├┤M├
             └───┘└─────────┘└╥┘
        c: 1/═════════════════╩═
                              0

        The Ry rotation adds seed-based variation without breaking
        the educational simplicity of the superposition concept.
        """
        # Create registers
        qubit = QuantumRegister(1, "q")
        classical = ClassicalRegister(1, "c")
        circuit = QuantumCircuit(qubit, classical)

        # Apply Hadamard for superposition
        circuit.h(qubit[0])

        # Small seed-based rotation for variety
        # This slightly biases probabilities while keeping the concept clear
        angle = (seed % 100) * 0.01 * math.pi / 8  # Small angle, max ~π/8
        circuit.ry(angle, qubit[0])

        # Measure
        circuit.measure(qubit, classical)

        return circuit

    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map 1-qubit measurements to binary visual traits.

        With superposition, we expect roughly 50% 0s and 50% 1s.
        The most common outcome determines the plant appearance.
        """
        if not measurements:
            # Default to pattern 0 if no measurements
            return ResolvedTraits(
                glyph_pattern=LEVEL_1_PATTERNS[0],
                color_palette=LEVEL_1_PALETTES[0],
                growth_rate=1.0,
                opacity=1.0,
            )

        # Count outcomes
        zeros = measurements.count(0)
        ones = len(measurements) - zeros

        # Binary choice based on majority
        outcome = 0 if zeros >= ones else 1

        return ResolvedTraits(
            glyph_pattern=LEVEL_1_PATTERNS[outcome],
            color_palette=LEVEL_1_PALETTES[outcome],
            growth_rate=1.0,  # Fixed for Level 1 - focus on superposition concept
            opacity=1.0,  # Fixed for Level 1
        )
