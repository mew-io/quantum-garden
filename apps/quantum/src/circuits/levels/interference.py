"""
Level 4: Quantum Interference Circuit.

Educational Concept: Quantum Interference
- Multiple quantum paths can interfere constructively or destructively
- Phase gates (Rz, S, T) control interference patterns
- Some outcomes are amplified, others suppressed
- Creates NON-UNIFORM probability distributions

Visual Outcome:
- Plants have "favorite" patterns - some appear more often
- Statistical properties (variance, consistency) affect growth rate and opacity
- Demonstrates how quantum algorithms exploit interference for speedup

This introduces the key concept behind quantum algorithm advantage.
"""

import math

from qiskit import (  # type: ignore[import-untyped]
    ClassicalRegister,
    QuantumCircuit,
    QuantumRegister,
)

from ..base import BaseCircuit, CircuitMetadata, ResolvedTraits
from ..registry import register_circuit

# Extended pattern set for Level 4 (16 possibilities)
LEVEL_4_PATTERNS = [
    # Simple geometric
    [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
    ],  # Cross
    [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
    ],  # Diamond
    [
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
    ],  # Circle hollow
    [
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
    ],  # Circle filled
    # Abstract
    [
        [1, 0, 0, 0, 0, 0, 0, 1],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [1, 0, 0, 0, 0, 0, 0, 1],
    ],  # X pattern
    [
        [0, 1, 0, 0, 0, 0, 1, 0],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [0, 1, 0, 0, 0, 0, 1, 0],
    ],  # 4 corners
    [
        [0, 0, 1, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 1, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 1, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0],
    ],  # Grid
    [
        [1, 0, 1, 0, 0, 1, 0, 1],
        [0, 1, 0, 1, 1, 0, 1, 0],
        [1, 0, 1, 0, 0, 1, 0, 1],
        [0, 1, 0, 1, 1, 0, 1, 0],
        [0, 1, 0, 1, 1, 0, 1, 0],
        [1, 0, 1, 0, 0, 1, 0, 1],
        [0, 1, 0, 1, 1, 0, 1, 0],
        [1, 0, 1, 0, 0, 1, 0, 1],
    ],  # Checkerboard
    # Stars
    [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
    ],  # 8-point star
    [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
    ],  # Ring
    # Botanical hints
    [
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [1, 0, 1, 0, 0, 1, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 1],
        [1, 0, 1, 0, 0, 1, 0, 1],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
    ],  # Flower outline
    [
        [0, 1, 1, 0, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
    ],  # Heart
    [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
    ],  # Bud
    [
        [1, 0, 0, 1, 1, 0, 0, 1],
        [0, 1, 0, 1, 1, 0, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 0, 1, 1, 0, 1, 0],
        [1, 0, 0, 1, 1, 0, 0, 1],
    ],  # Sparkle
    [
        [0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1],
    ],  # Leaf
    [
        [1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1],
    ],  # Inverse diamond
]

# Full palette set (8 options)
LEVEL_4_PALETTES = [
    ["#2D3436", "#636E72", "#B2BEC3"],  # Grayscale
    ["#6C5CE7", "#A29BFE", "#DFE6E9"],  # Purple
    ["#00B894", "#55EFC4", "#81ECEC"],  # Teal
    ["#E17055", "#FAB1A0", "#FFEAA7"],  # Warm coral
    ["#0984E3", "#74B9FF", "#DFE6E9"],  # Blue
    ["#D63031", "#FF7675", "#FD79A8"],  # Red/Pink
    ["#00CEC9", "#81ECEC", "#DFE6E9"],  # Cyan
    ["#FDCB6E", "#FFEAA7", "#F8E71C"],  # Yellow
]


@register_circuit
class InterferenceCircuit(BaseCircuit):
    """Four-qubit quantum interference circuit - Level 4 complexity."""

    @property
    def metadata(self) -> CircuitMetadata:
        return CircuitMetadata(
            id="interference",
            name="Quantum Interference",
            level=4,
            qubit_count=4,
            concept="Quantum Interference",
            description=(
                "Four qubits with Hadamard and phase gates create interference. "
                "Some outcomes are amplified, others suppressed - non-uniform "
                "probability distributions. Key principle behind quantum speedup: "
                "Grover's search amplifies correct answers while canceling wrong ones."
            ),
            min_rarity=0.4,  # Rarer plants
            max_rarity=0.7,
        )

    def create(self, seed: int) -> QuantumCircuit:
        """Create a 4-qubit interference circuit.

        This circuit creates constructive and destructive interference
        through careful application of phase gates.
        """
        # Create registers
        qubits = QuantumRegister(4, "q")
        classical = ClassicalRegister(4, "c")
        circuit = QuantumCircuit(qubits, classical)

        # Put all qubits in superposition
        for i in range(4):
            circuit.h(qubits[i])

        # Apply seed-based phase rotations to create interference
        for i in range(4):
            # Each qubit gets a different phase based on seed
            phase = (seed * (i + 1) * 0.1) % (2 * math.pi)
            circuit.rz(phase, qubits[i])

        # Entangle pairs for correlated interference
        circuit.cx(qubits[0], qubits[1])
        circuit.cx(qubits[2], qubits[3])

        # Cross-entangle for complex interference
        circuit.cz(qubits[1], qubits[2])

        # Final Hadamard on some qubits for interference
        circuit.h(qubits[0])
        circuit.h(qubits[3])

        # More seed-based phases
        for i in range(4):
            angle = (seed * (i + 3) * 0.05) % (math.pi / 2)
            circuit.ry(angle, qubits[i])

        # Measure
        circuit.measure(qubits, classical)

        return circuit

    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map 4-qubit interference measurements to weighted visual traits.

        Interference creates favorite outcomes - statistical properties
        determine growth rate and opacity.
        """
        if not measurements:
            return ResolvedTraits(
                glyph_pattern=LEVEL_4_PATTERNS[0],
                color_palette=LEVEL_4_PALETTES[0],
                growth_rate=1.0,
                opacity=1.0,
            )

        from collections import Counter

        counts = Counter(measurements)
        most_common_value, most_common_count = counts.most_common(1)[0]

        # Use lower bits for pattern, shifted bits for palette
        pattern_idx = most_common_value & 0b1111  # Lower 4 bits
        palette_idx = (most_common_value >> 1) & 0b111  # Bits 1-3

        # Ensure indices are in range
        pattern_idx = pattern_idx % len(LEVEL_4_PATTERNS)
        palette_idx = palette_idx % len(LEVEL_4_PALETTES)

        # Calculate growth rate from variance (interference = low variance = fast)
        mean_val = sum(measurements) / len(measurements)
        variance = sum((x - mean_val) ** 2 for x in measurements) / len(measurements)
        max_variance = 128  # For 4 qubits (0-15 range)
        normalized_variance = min(variance / max_variance, 1.0)
        # Low variance (strong interference) = faster growth
        growth_rate = 0.5 + (1.0 - normalized_variance) * 1.5  # 0.5 to 2.0

        # Opacity from measurement consistency
        consistency = most_common_count / len(measurements)
        opacity = 0.7 + consistency * 0.3  # 0.7 to 1.0

        return ResolvedTraits(
            glyph_pattern=LEVEL_4_PATTERNS[pattern_idx],
            color_palette=LEVEL_4_PALETTES[palette_idx],
            growth_rate=round(growth_rate, 2),
            opacity=round(opacity, 2),
        )
