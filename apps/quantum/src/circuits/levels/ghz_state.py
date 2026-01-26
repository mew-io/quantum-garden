"""
Level 3: GHZ State Multi-Qubit Entanglement Circuit.

Educational Concept: N-Party Entanglement (Greenberger-Horne-Zeilinger)
- Three or more qubits entangled in a maximally correlated state
- GHZ state: |GHZ⟩ = (|000⟩ + |111⟩)/√2
- ALL qubits collapse together - all 0s or all 1s
- Demonstrates collective quantum behavior

Visual Outcome:
- Plants have completely coherent themes
- Either ALL traits are "ethereal" or ALL are "grounded"
- No mixing - demonstrates all-or-nothing quantum correlation

This shows how entanglement scales to multiple particles.
"""

import math

from qiskit import (  # type: ignore[import-untyped]
    ClassicalRegister,
    QuantumCircuit,
    QuantumRegister,
)

from ..base import BaseCircuit, CircuitMetadata, ResolvedTraits
from ..registry import register_circuit

# Themed pattern sets for GHZ (complete visual coherence)
GHZ_PATTERNS = {
    # Ethereal theme (000): Light, delicate, crystalline
    "ethereal": [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [1, 0, 0, 1, 1, 0, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 1],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
    ],
    # Grounded theme (111): Solid, earthy, substantial
    "grounded": [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
    ],
}

# Themed palettes (complete visual coherence with pattern)
GHZ_PALETTES = {
    # Ethereal: Light pastels, airy
    "ethereal": ["#E0C0F0", "#E8D0F8", "#F0E8FC"],  # Soft lavender
    # Grounded: Earthy, warm, solid
    "grounded": ["#8B7355", "#A08060", "#B89878"],  # Earth tones
}

# Growth rates match theme
GHZ_GROWTH_RATES = {
    "ethereal": 0.7,  # Slow, delicate growth
    "grounded": 1.3,  # Fast, vigorous growth
}

# Opacity matches theme
GHZ_OPACITIES = {
    "ethereal": 0.85,  # Slightly translucent
    "grounded": 1.0,  # Fully solid
}


@register_circuit
class GHZStateCircuit(BaseCircuit):
    """Three-qubit GHZ state entanglement circuit - Level 3 complexity."""

    @property
    def metadata(self) -> CircuitMetadata:
        return CircuitMetadata(
            id="ghz_state",
            name="GHZ State Entanglement",
            level=3,
            qubit_count=3,
            concept="Multi-Party Entanglement",
            description=(
                "Three qubits entangled in GHZ state. Perfect three-way correlation: "
                "all qubits collapse together - only '000' or '111' outcomes. "
                "Demonstrates how entanglement scales beyond two particles, "
                "creating collective behavior where the system acts as one."
            ),
            min_rarity=0.7,  # Medium-rare plants
            max_rarity=0.85,
        )

    def create(self, seed: int) -> QuantumCircuit:
        """Create a 3-qubit GHZ state circuit.

        Circuit diagram:
             ┌───┐               ┌─┐
        q_0: ┤ H ├──■────────────┤M├──────
             └───┘┌─┴─┐          └╥┘┌─┐
        q_1: ─────┤ X ├──■────────╫─┤M├───
                  └───┘┌─┴─┐┌───┐ ║ └╥┘┌─┐
        q_2: ──────────┤ X ├┤Ry ├─╫──╫─┤M├
                       └───┘└───┘ ║  ║ └╥┘
        c: 3/═════════════════════╩══╩══╩═
                                  0  1  2

        H on first qubit, then CNOT chain propagates entanglement.
        """
        # Create registers
        qubits = QuantumRegister(3, "q")
        classical = ClassicalRegister(3, "c")
        circuit = QuantumCircuit(qubits, classical)

        # Create GHZ state
        circuit.h(qubits[0])  # Superposition on first qubit
        circuit.cx(qubits[0], qubits[1])  # Entangle q0 → q1
        circuit.cx(qubits[1], qubits[2])  # Entangle q1 → q2

        # Seed-based variation (tiny rotation on last qubit)
        angle = (seed % 100) * 0.01 * math.pi / 12
        circuit.ry(angle, qubits[2])

        # Measure all qubits
        circuit.measure(qubits, classical)

        return circuit

    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map 3-qubit GHZ measurements to fully coherent themes.

        GHZ state should yield only 000 (0) or 111 (7).
        The all-or-nothing correlation creates complete visual themes.
        """
        if not measurements:
            return ResolvedTraits(
                glyph_pattern=GHZ_PATTERNS["ethereal"],
                color_palette=GHZ_PALETTES["ethereal"],
                growth_rate=GHZ_GROWTH_RATES["ethereal"],
                opacity=GHZ_OPACITIES["ethereal"],
            )

        # Count the outcomes
        from collections import Counter

        counts = Counter(measurements)
        most_common = counts.most_common(1)[0][0]

        # Determine theme based on GHZ outcome
        # 0 (000) -> ethereal, 7 (111) -> grounded
        if most_common == 0:  # 000 - all zeros
            theme = "ethereal"
        elif most_common == 7:  # 111 - all ones
            theme = "grounded"
        else:
            # Unexpected outcome (noise) - check which is closer
            # Count number of 1 bits
            ones = bin(most_common).count("1")
            theme = "grounded" if ones >= 2 else "ethereal"

        return ResolvedTraits(
            glyph_pattern=GHZ_PATTERNS[theme],
            color_palette=GHZ_PALETTES[theme],
            growth_rate=GHZ_GROWTH_RATES[theme],
            opacity=GHZ_OPACITIES[theme],
        )
