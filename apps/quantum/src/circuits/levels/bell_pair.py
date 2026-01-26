"""
Level 2: Bell Pair Entanglement Circuit.

Educational Concept: Quantum Entanglement
- Two qubits become correlated in a way impossible classically
- Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2
- Measuring one qubit instantly determines the other's value
- Outcomes are ALWAYS correlated: both 0 or both 1, never mixed

Visual Outcome:
- Plants have correlated trait pairs (pattern↔color, growth↔opacity)
- If pattern is "warm", palette is warm; if "cool", palette is cool
- Demonstrates non-classical correlations

This introduces the powerful concept of quantum entanglement.
"""

import math

from qiskit import (  # type: ignore[import-untyped]
    ClassicalRegister,
    QuantumCircuit,
    QuantumRegister,
)

from ..base import BaseCircuit, CircuitMetadata, ResolvedTraits
from ..registry import register_circuit

# Botanical patterns for Level 2 (4 options, organized in correlated pairs)
LEVEL_2_PATTERNS = [
    # Pair 0 (cool/ethereal)
    # Pattern 0: Circle (hollow)
    [
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
    ],
    # Pattern 1: Circle (filled - same pair, different detail)
    [
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
    ],
    # Pair 1 (warm/grounded)
    # Pattern 2: Square (hollow)
    [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    # Pattern 3: Square (filled)
    [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
    ],
]

# Palettes organized in warm/cool pairs
LEVEL_2_PALETTES = [
    ["#00B894", "#55EFC4", "#81ECEC"],  # Cool: Teal (pairs with 0)
    ["#0984E3", "#74B9FF", "#DFE6E9"],  # Cool: Blue (pairs with 0)
    ["#E17055", "#FAB1A0", "#FFEAA7"],  # Warm: Coral (pairs with 1)
    ["#FDCB6E", "#FFEAA7", "#F8E71C"],  # Warm: Yellow (pairs with 1)
]


@register_circuit
class BellPairCircuit(BaseCircuit):
    """Two-qubit Bell pair entanglement circuit - Level 2 complexity."""

    @property
    def metadata(self) -> CircuitMetadata:
        return CircuitMetadata(
            id="bell_pair",
            name="Bell Pair Entanglement",
            level=2,
            qubit_count=2,
            concept="Entanglement",
            description=(
                "Two qubits are entangled into the Bell state |Φ+⟩. "
                "This creates perfect correlation: both qubits always measure to "
                "the same value. You'll never see '01' or '10' - only '00' or '11'. "
                "This demonstrates quantum entanglement, where measuring one "
                "particle instantly determines the state of its partner."
            ),
            min_rarity=0.85,  # Moderately common plants
            max_rarity=1.0,
        )

    def create(self, seed: int) -> QuantumCircuit:
        """Create a Bell pair circuit.

        Circuit diagram:
             ┌───┐          ┌─┐
        q_0: ┤ H ├──■───────┤M├───
             └───┘┌─┴─┐┌───┐└╥┘┌─┐
        q_1: ─────┤ X ├┤Ry ├─╫─┤M├
                  └───┘└───┘ ║ └╥┘
        c: 2/════════════════╩══╩═
                             0  1

        H gate creates superposition, CNOT entangles the qubits.
        Small Ry rotation adds seed variation.
        """
        # Create registers
        qubits = QuantumRegister(2, "q")
        classical = ClassicalRegister(2, "c")
        circuit = QuantumCircuit(qubits, classical)

        # Create Bell state |Φ+⟩
        circuit.h(qubits[0])  # Superposition on first qubit
        circuit.cx(qubits[0], qubits[1])  # Entangle with second

        # Seed-based variation (small rotation on second qubit)
        angle = (seed % 100) * 0.01 * math.pi / 10
        circuit.ry(angle, qubits[1])

        # Measure both qubits
        circuit.measure(qubits, classical)

        return circuit

    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map 2-qubit entangled measurements to correlated visual traits.

        Bell state measurements should only yield 00 (0) or 11 (3).
        The entanglement creates correlation: pattern and palette are linked.
        """
        if not measurements:
            return ResolvedTraits(
                glyph_pattern=LEVEL_2_PATTERNS[0],
                color_palette=LEVEL_2_PALETTES[0],
                growth_rate=1.0,
                opacity=1.0,
            )

        # Count the outcomes
        from collections import Counter

        counts = Counter(measurements)
        most_common = counts.most_common(1)[0][0]

        # Extract correlated bits
        # In a perfect Bell state: 00 (0) or 11 (3)
        # bit0 = most_common & 1
        # bit1 = (most_common >> 1) & 1
        # These should be equal due to entanglement!

        # Use the outcome to select correlated pattern and palette
        # 0 (00) -> cool theme, 3 (11) -> warm theme
        if most_common == 0:  # 00 - cool/ethereal
            theme_idx = 0
            growth_rate = 0.8  # Slower, more delicate
        elif most_common == 3:  # 11 - warm/grounded
            theme_idx = 1
            growth_rate = 1.2  # Faster, more vigorous
        else:
            # Unexpected outcome (noise or decoherence) - default to cool
            theme_idx = 0
            growth_rate = 1.0

        # Select from the appropriate pair
        pattern_detail = (measurements[0] if measurements else 0) % 2  # 0 or 1
        pattern_idx = theme_idx * 2 + pattern_detail
        palette_idx = theme_idx * 2 + pattern_detail

        return ResolvedTraits(
            glyph_pattern=LEVEL_2_PATTERNS[pattern_idx],
            color_palette=LEVEL_2_PALETTES[palette_idx],
            growth_rate=growth_rate,
            opacity=1.0,
        )
