"""
Watercolor Cosmic Lotus Circuit — Custom per-plant circuit for the cosmic lotus.

Educational Concept: Multi-pair Entanglement (sacred geometry)
- Qubit 0: H gate creates superposition for inner circle pair basis
- Qubit 1: CNOT(q[0], q[1]) entangles inner circle pair
- Qubit 2: H gate creates superposition for outer petal pair basis
- Qubit 3: CNOT(q[2], q[3]) entangles outer petal pair
- Qubit 4: H + Ry(seed) biases radiance control
- CZ(q[1], q[2]): cross-pair phase correlation (inner-outer harmony)

This is the most complex circuit in the garden — 5 qubits with two entangled
pairs and cross-pair correlation. It encodes the sacred geometry principle
that inner and outer structures are harmonically related. The two CNOT pairs
create independent entanglement within each pair (inner circles and outer
petals), while the CZ gate between q[1] and q[2] introduces a phase-based
correlation between the pairs — when the inner structure is "rich" (many
circles), the outer structure tends toward complementary forms.

Circuit diagram:
     +---+                                   +--+
q[0]: | H |--*--------------------------------| M|
     +---+ +-+-+                              +==+ +--+
q[1]: ------| X |--@----------------------------||--| M|
            +---+  |                             ||  +==+
     +---+         |                             ||   || +--+
q[2]: | H |--------@---*------------------------||---||--| M|
     +---+            +-+-+                      ||   || +==+
                      | X |                      ||   ||  || +--+
q[3]: ----------------+---+---------------------||---||--||--| M|
                                                 ||   ||  || +==+
     +---+ +--------+                            ||   ||  ||  || +--+
q[4]: | H |-| Ry(s) |----------------------------||---||--||--||--| M|
     +---+ +--------+                            ||   ||  ||  || +==+
c: 5/=================================================++==++=++=++=++==+
                                                   0   1  2  3  4
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

# Color palettes for the cosmic lotus (matches TypeScript colorVariations)
LOTUS_PALETTES = [
    ["#D8A050", "#8060B8", "#F0D888"],  # celestial (golds/purples)
    ["#3050A0", "#5070C0", "#A0B8E8"],  # void (deep blues)
    ["#D8D8E8", "#B8B8D0", "#F0F0F8"],  # ethereal (whites/silvers)
]

# Placeholder pattern (unused by watercolor renderer, required by base class)
LOTUS_DEFAULT_PATTERN = [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [1, 1, 0, 1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1, 0, 1, 1],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
]


@register_circuit
class WcCosmicLotusCircuit(BaseCircuit):
    """5-qubit multi-pair entanglement circuit for the Watercolor Cosmic Lotus.

    Circuit structure:
    - q[0]: H gate -> inner circle pair basis superposition
    - q[1]: CNOT(q[0], q[1]) -> inner circle pair entangled
    - q[2]: H gate -> outer petal pair basis superposition
    - q[3]: CNOT(q[2], q[3]) -> outer petal pair entangled
    - q[4]: H + Ry(seed) -> radiance control, seed-biased
    - CZ(q[1], q[2]) -> cross-pair phase correlation

    Measurement outcomes encode:
    - innerCircleCount: distinct lower-2-bit patterns -> [3, 6]
    - outerPetalCount: distinct upper-2-bit patterns + cross-pair boost -> [5, 9]
    - radianceRadius: overall measurement entropy -> [0.6, 1.4]
    - spiralTurns: mean measurement normalized -> [0.5, 2.0]
    """

    @property
    def metadata(self) -> CircuitMetadata:
        return CircuitMetadata(
            id="wc_cosmic_lotus",
            name="Watercolor Cosmic Lotus Multi-Pair Entanglement",
            level=4,
            qubit_count=5,
            concept="Multi-pair Entanglement",
            description=(
                "The most complex circuit in the garden: 5 qubits with two entangled "
                "pairs and cross-pair correlation. Qubits 0-1 form an entangled pair "
                "encoding inner circle geometry; qubits 2-3 form a second pair "
                "encoding "
                "outer petal structure. A CZ gate between q[1] and q[2] creates "
                "cross-pair phase correlation — the sacred geometry principle that "
                "inner and outer structures are harmonically related. Qubit 4 "
                "independently controls radiance with a seed-biased Ry rotation. "
                "Measurement outcomes encode innerCircleCount, outerPetalCount, "
                "radianceRadius, and spiralTurns."
            ),
            min_rarity=0.01,
            max_rarity=0.04,
        )

    def create(self, seed: int) -> QuantumCircuit:
        """Create the 5-qubit multi-pair entanglement circuit.

        Args:
            seed: Plant-specific seed for reproducible per-plant variation.

        Returns:
            A 5-qubit QuantumCircuit ready for simulation.
        """
        q = QuantumRegister(5, "q")
        c = ClassicalRegister(5, "c")
        circuit = QuantumCircuit(q, c)

        # -- Inner pair (q[0], q[1]): sacred geometry inner circles -----------
        # q[0]: Inner circle basis superposition
        # H gate puts inner circles in superposition of few (|0>) and many (|1>)
        circuit.h(q[0])

        # q[1]: Entangled with q[0] via CNOT
        # When q[0] = |1> (many inner circles), q[1] follows
        circuit.cx(q[0], q[1])

        # -- Outer pair (q[2], q[3]): sacred geometry outer petals ------------
        # q[2]: Outer petal basis superposition
        # H gate puts outer petals in superposition
        circuit.h(q[2])

        # q[3]: Entangled with q[2] via CNOT
        # When q[2] = |1> (many outer petals), q[3] follows
        circuit.cx(q[2], q[3])

        # -- Cross-pair correlation: inner-outer harmony ----------------------
        # CZ gate between q[1] (inner pair) and q[2] (outer pair basis)
        # This creates a phase correlation between the two entangled pairs.
        # When both q[1] and q[2] are |1>, a phase flip (-1) is applied,
        # changing the interference pattern and creating harmonic relationships
        # between inner circle count and outer petal count.
        circuit.cz(q[1], q[2])

        # -- Radiance control (q[4]): independent seed-biased qubit ----------
        # H + Ry(seed) biases the probability of strong vs dim radiance
        circuit.h(q[4])
        radiance_angle = (seed % 80) * 0.025 * math.pi  # 0 -> ~6.28 rad
        circuit.ry(radiance_angle, q[4])

        circuit.measure(q, c)
        return circuit

    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map 5-qubit measurements to cosmic lotus visual properties.

        Args:
            measurements: List of integers 0-31 (5 qubits -> 32 possible outcomes)

        Returns:
            ResolvedTraits with extra keys: innerCircleCount, outerPetalCount,
            radianceRadius, spiralTurns
        """
        if not measurements:
            return ResolvedTraits(
                glyph_pattern=LOTUS_DEFAULT_PATTERN,
                color_palette=LOTUS_PALETTES[0],
                growth_rate=1.0,
                opacity=0.9,
                extra={
                    "innerCircleCount": 4,
                    "outerPetalCount": 7,
                    "radianceRadius": 1.0,
                    "spiralTurns": 1.2,
                },
            )

        counts = Counter(measurements)
        total = len(measurements)

        # -- Base traits (standard statistical mapping) -----------------------
        mean_val = sum(measurements) / total
        variance = sum((x - mean_val) ** 2 for x in measurements) / total
        max_variance = 240.25  # Max variance for 5-qubit outcomes (0-31)
        normalized_variance = min(variance / max_variance, 1.0)
        growth_rate = 0.5 + normalized_variance * 1.5  # 0.5-2.0

        most_common_count = counts.most_common(1)[0][1]
        consistency = most_common_count / total
        opacity = 0.7 + consistency * 0.3  # 0.7-1.0

        # Color palette from most common outcome (mod palette count)
        palette_idx = counts.most_common(1)[0][0] % len(LOTUS_PALETTES)

        # -- Lotus-specific properties (decoded from qubit semantics) ---------

        # innerCircleCount: distinct lower-2-bit patterns -> [3, 6]
        # Bits 0 and 1 (inner pair qubits) create 4 possible patterns (0-3).
        # More distinct patterns observed = more circles in the flower-of-life.
        inner_patterns: set[int] = set()
        for m in measurements:
            inner_patterns.add(m & 0b00011)  # lower 2 bits: q[0], q[1]
        # Map distinct patterns (1-4) to inner circle count [3, 6]
        inner_circle_count = max(3, min(6, len(inner_patterns) + 2))

        # outerPetalCount: distinct upper-2-bit patterns + cross-pair boost -> [5, 9]
        # Bits 2 and 3 (outer pair qubits) create 4 possible patterns.
        # Cross-pair correlation (CZ) may boost petal count via harmonic agreement.
        outer_patterns: set[int] = set()
        for m in measurements:
            outer_patterns.add((m >> 2) & 0b11)  # bits 2,3: q[2], q[3]
        base_outer = len(outer_patterns) + 4  # 5-8 base

        # Cross-pair harmonic boost: when inner pair and outer pair agree more,
        # add a petal (sacred geometry harmony)
        cross_agreement = sum(
            1 for m in measurements if ((m & 0b00011) > 0) == (((m >> 2) & 0b11) > 0)
        )
        cross_fraction = cross_agreement / total
        cross_boost = 1 if cross_fraction > 0.6 else 0
        outer_petal_count = max(5, min(9, base_outer + cross_boost))

        # radianceRadius: overall measurement entropy -> [0.6, 1.4]
        # Higher entropy (more diverse outcomes) = wider radiance
        distinct_outcomes = len(counts)
        max_possible = min(total, 32)  # 5-qubit max distinct
        entropy_fraction = distinct_outcomes / max_possible if max_possible > 0 else 0.5
        radiance_radius = round(0.6 + entropy_fraction * 0.8, 3)  # [0.6, 1.4]

        # spiralTurns: mean measurement normalized -> [0.5, 2.0]
        # The overall energy level of measurements determines spiral complexity
        mean_normalized = mean_val / 31.0  # normalize to 0-1 for 5-qubit (max=31)
        spiral_turns = round(0.5 + mean_normalized * 1.5, 3)  # [0.5, 2.0]

        return ResolvedTraits(
            glyph_pattern=LOTUS_DEFAULT_PATTERN,
            color_palette=LOTUS_PALETTES[palette_idx],
            growth_rate=round(growth_rate, 2),
            opacity=round(opacity, 2),
            extra={
                "innerCircleCount": inner_circle_count,
                "outerPetalCount": outer_petal_count,
                "radianceRadius": radiance_radius,
                "spiralTurns": spiral_turns,
            },
        )
