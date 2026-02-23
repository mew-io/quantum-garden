"""
Watercolor Weeping Willow Circuit — Custom per-plant circuit for the weeping willow.

Educational Concept: Entanglement (Bilateral Frond Symmetry)
- Qubit 0: H gate creates superposition for left/right frond distribution
- Qubit 1: CNOT(q[0], q[1]) entangles bilateral symmetry with frond distribution
  (when fronds go left, symmetry correlates — both sides tend to match)
- Qubit 2: H gate controls droop angle variation
- Qubit 3: H + Ry(seed) biases trunk thickness

This circuit demonstrates how entanglement can encode bilateral symmetry in a
branching structure. The CNOT between q[0] and q[1] means that when the frond
distribution collapses, the symmetry bias tends to follow — creating willows
that are either symmetric with many fronds or asymmetric with fewer.

Circuit diagram:
     +---+               +--+
q[0]: | H |--*------------| M|
     +---+ +-+-+          +==+  +--+
q[1]: ------| X |----------||--| M|
            +---+          ||  +==+
     +---+                 ||   || +--+
q[2]: | H |----------------||---||--| M|
     +---+                 ||   || +==+
     +---+ +--------+      ||   ||  || +--+
q[3]: | H |-| Ry(s) |------||---||--||--| M|
     +---+ +--------+      ||   ||  || +==+
c: 4/======================++===++==++=++=+
                            0    1   2   3
"""

import math
from collections import Counter

from qiskit import (  # type: ignore[import-untyped]
    ClassicalRegister,
    QuantumCircuit,
    QuantumRegister,
)

from ..base import BaseCircuit, CircuitMetadata, ResolvedTraits
from ..registry import register_circuit

# Color palettes for the weeping willow (matches TypeScript colorVariations)
WILLOW_PALETTES = [
    ["#8AB87C", "#B0D8A0", "#6B5B3A"],  # willow (greens)
    ["#C8B868", "#D8D080", "#7B6B4A"],  # autumn (golds)
]

# Placeholder pattern (unused by watercolor renderer, required by base class)
WILLOW_DEFAULT_PATTERN = [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
]


@register_circuit
class WcWeepingWillowCircuit(BaseCircuit):
    """4-qubit entanglement circuit for the Watercolor Weeping Willow variant.

    Circuit structure:
    - q[0]: H gate -> left/right frond distribution superposition
    - q[1]: CNOT(q[0], q[1]) -> bilateral symmetry entangled with distribution
    - q[2]: H gate -> droop angle variation
    - q[3]: H + Ry(seed) -> trunk thickness, seed-biased

    Measurement outcomes encode:
    - frondCount: distinct bit-pair outcomes in lower 2 bits -> [4, 8]
    - droopAngle: P(q[2]=|1>) -> [0.3, 0.8]
    - symmetryBias: P(q[0] agrees with q[1]) -> [0.0, 1.0]
    - trunkThickness: P(q[3]=|1>) -> [0.6, 1.0]
    """

    @property
    def metadata(self) -> CircuitMetadata:
        return CircuitMetadata(
            id="wc_weeping_willow",
            name="Watercolor Weeping Willow Entanglement",
            level=4,
            qubit_count=4,
            concept="Entanglement",
            description=(
                "A 4-qubit circuit encoding weeping willow frond symmetry via "
                "entanglement. Qubit 0 creates a superposition for frond distribution; "
                "qubit 1 is entangled via CNOT so bilateral symmetry correlates with "
                "frond count; qubit 2 independently controls droop angle; qubit 3 "
                "uses H + Ry(seed) for trunk thickness variation. Measurement outcomes "
                "encode frondCount, droopAngle, symmetryBias, and trunkThickness."
            ),
            min_rarity=0.02,
            max_rarity=0.06,
        )

    def create(self, seed: int) -> QuantumCircuit:
        """Create the 4-qubit willow entanglement circuit.

        Args:
            seed: Plant-specific seed for reproducible per-plant variation.

        Returns:
            A 4-qubit QuantumCircuit ready for simulation.
        """
        q = QuantumRegister(4, "q")
        c = ClassicalRegister(4, "c")
        circuit = QuantumCircuit(q, c)

        # q[0]: Frond distribution superposition
        # H gate puts frond distribution in superposition of left-heavy and right-heavy
        circuit.h(q[0])

        # q[1]: Bilateral symmetry entangled with frond distribution via CNOT
        # When q[0] collapses to |1> (more fronds), q[1] flips -> high symmetry
        # This creates correlated frond-count/symmetry behavior
        circuit.cx(q[0], q[1])

        # q[2]: Droop angle -- independent superposition
        # H gate gives equal probability of steep vs gentle droop
        circuit.h(q[2])

        # q[3]: Trunk thickness -- seed-driven qubit
        # H + Ry(seed) biases the probability of thick vs thin trunk
        circuit.h(q[3])
        thickness_angle = (seed % 80) * 0.025 * math.pi  # 0 -> ~6.28 rad
        circuit.ry(thickness_angle, q[3])

        circuit.measure(q, c)
        return circuit

    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map 4-qubit measurements to weeping willow visual properties.

        Args:
            measurements: List of integers 0-15 (4 qubits -> 16 possible outcomes)

        Returns:
            ResolvedTraits with extra keys: frondCount, droopAngle,
            symmetryBias, trunkThickness
        """
        if not measurements:
            return ResolvedTraits(
                glyph_pattern=WILLOW_DEFAULT_PATTERN,
                color_palette=WILLOW_PALETTES[0],
                growth_rate=1.0,
                opacity=0.9,
                extra={
                    "frondCount": 6,
                    "droopAngle": 0.55,
                    "symmetryBias": 0.5,
                    "trunkThickness": 0.8,
                },
            )

        counts = Counter(measurements)
        total = len(measurements)

        # -- Base traits (standard statistical mapping) -----------------------
        mean_val = sum(measurements) / total
        variance = sum((x - mean_val) ** 2 for x in measurements) / total
        max_variance = 56.25  # Max variance for 4-qubit outcomes (0-15)
        normalized_variance = min(variance / max_variance, 1.0)
        growth_rate = 0.5 + normalized_variance * 1.5  # 0.5-2.0

        most_common_count = counts.most_common(1)[0][1]
        consistency = most_common_count / total
        opacity = 0.7 + consistency * 0.3  # 0.7-1.0

        # Color palette from most common outcome (mod palette count)
        palette_idx = counts.most_common(1)[0][0] % len(WILLOW_PALETTES)

        # -- Willow-specific properties (decoded from qubit semantics) --------

        # frondCount: distinct bit-pair outcomes in lower 2 bits -> [4, 8]
        # The entangled pair (H + CNOT) produces 00 or 11 typically, but
        # noise/measurement variance yields 1-4 distinct patterns.
        lower_2_bit_outcomes = {m & 0b0011 for m in measurements}
        frond_diversity = len(lower_2_bit_outcomes)  # 1-4
        # Map 1-4 diversity linearly to [4, 8]
        bonus = 1 if frond_diversity > 2 else 0
        frond_count = max(4, min(8, 3 + frond_diversity + bonus))

        # droopAngle: P(q[2]=|1>) -> [0.3, 0.8]
        # Bit 2 (value 0b0100) is the droop angle qubit
        bit2_ones = sum(1 for m in measurements if m & 0b0100)
        droop_fraction = bit2_ones / total  # 0.0-1.0
        droop_angle = round(0.3 + droop_fraction * 0.5, 3)  # 0.3-0.8

        # symmetryBias: P(q[0] agrees with q[1]) -> [0.0, 1.0]
        # Because q[1] is CNOT-entangled with q[0], they tend to agree
        # (both |0> or both |1>). Agreement = high symmetry.
        agreement_count = sum(
            1 for m in measurements if ((m & 0b0001) >> 0) == ((m & 0b0010) >> 1)
        )
        symmetry_bias = round(agreement_count / total, 3)  # 0.0-1.0

        # trunkThickness: P(q[3]=|1>) -> [0.6, 1.0]
        # Bit 3 (value 0b1000) is the trunk thickness qubit
        bit3_ones = sum(1 for m in measurements if m & 0b1000)
        thickness_fraction = bit3_ones / total  # 0.0-1.0
        trunk_thickness = round(0.6 + thickness_fraction * 0.4, 3)  # 0.6-1.0

        return ResolvedTraits(
            glyph_pattern=WILLOW_DEFAULT_PATTERN,
            color_palette=WILLOW_PALETTES[palette_idx],
            growth_rate=round(growth_rate, 2),
            opacity=round(opacity, 2),
            extra={
                "frondCount": frond_count,
                "droopAngle": droop_angle,
                "symmetryBias": symmetry_bias,
                "trunkThickness": trunk_thickness,
            },
        )
