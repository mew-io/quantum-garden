"""
Watercolor Sumi Spirit Circuit — Custom per-plant circuit for the sumi spirit.

Educational Concept: Collapse (enso completeness)
- Qubit 0: H gate creates superposition for completeness
  (the enso exists between complete and gapped until measured)
- Qubit 1: H + Ry(seed) biases gap angle position
- Qubit 2: H gate creates superposition for brush pressure

This circuit demonstrates quantum collapse: the enso circle exists in
superposition between complete (|0>) and gapped (|1>) until measured.
This mirrors the Zen philosophy of the enso — its completeness is
uncertain until the brush lifts. The act of observation (measurement)
determines whether the circle is whole or broken.

Circuit diagram:
     +---+          +--+
q[0]: | H |----------| M|
     +---+           +==+ +--+
     +---+ +--------+  ||  | M|
q[1]: | H |-| Ry(s) |--||--+==+
     +---+ +--------+  ||   || +--+
     +---+              ||   ||  | M|
q[2]: | H |-------------||---||--+==+
     +---+              ||   ||   ||
c: 3/===================++===++===++
                         0    1    2
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

# Color palettes for the sumi spirit (matches TypeScript colorVariations)
SUMI_PALETTES = [
    ["#2A2A2A", "#4A4A4A", "#8A8A8A"],  # ink (blacks/grays)
    ["#3A3028", "#5A5048", "#9A8878"],  # warm-ink (warm grays)
]

# Placeholder pattern (unused by watercolor renderer, required by base class)
SUMI_DEFAULT_PATTERN = [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
]


@register_circuit
class WcSumiSpiritCircuit(BaseCircuit):
    """3-qubit collapse circuit for the Watercolor Sumi Spirit variant.

    Circuit structure:
    - q[0]: H gate -> completeness superposition (complete/gapped)
    - q[1]: H + Ry(seed) -> gap angle, seed-biased
    - q[2]: H gate -> brush pressure superposition

    Measurement outcomes encode:
    - completeness: P(q[0]=|0>) -> [0.5, 1.0] (more |0> = more complete)
    - gapAngle: mean measurement mapped to [0, 2pi]
    - brushPressure: P(q[2]=|1>) -> [0.3, 1.0]
    """

    @property
    def metadata(self) -> CircuitMetadata:
        return CircuitMetadata(
            id="wc_sumi_spirit",
            name="Watercolor Sumi Spirit Collapse",
            level=4,
            qubit_count=3,
            concept="Collapse",
            description=(
                "A 3-qubit circuit encoding the enso spirit's form via "
                "quantum collapse. Qubit 0 creates a superposition of complete "
                "and gapped circle states — the enso exists in both forms "
                "until observed, echoing the Zen philosophy that the circle's "
                "completeness is uncertain until the brush lifts. "
                "Qubit 1 encodes the gap angle with a seed-biased Ry, "
                "and qubit 2 controls brush pressure. Measurement outcomes encode "
                "completeness, gapAngle, and brushPressure."
            ),
            min_rarity=0.02,
            max_rarity=0.06,
        )

    def create(self, seed: int) -> QuantumCircuit:
        """Create the 3-qubit collapse circuit.

        Args:
            seed: Plant-specific seed for reproducible per-plant variation.

        Returns:
            A 3-qubit QuantumCircuit ready for simulation.
        """
        q = QuantumRegister(3, "q")
        c = ClassicalRegister(3, "c")
        circuit = QuantumCircuit(q, c)

        # q[0]: Completeness superposition
        # H gate puts the enso in superposition of complete (|0>) and gapped (|1>)
        # The act of measurement "collapses" the circle into its final form
        circuit.h(q[0])

        # q[1]: Gap angle -- seed-driven qubit
        # H + Ry(seed) biases where the gap appears on the circle
        circuit.h(q[1])
        gap_angle = (seed % 80) * 0.025 * math.pi  # 0 -> ~6.28 rad
        circuit.ry(gap_angle, q[1])

        # q[2]: Brush pressure superposition
        # H gate creates superposition of light (|0>) and heavy (|1>) pressure
        circuit.h(q[2])

        circuit.measure(q, c)
        return circuit

    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map 3-qubit measurements to sumi spirit visual properties.

        Args:
            measurements: List of integers 0-7 (3 qubits -> 8 possible outcomes)

        Returns:
            ResolvedTraits with extra keys: completeness, gapAngle, brushPressure
        """
        if not measurements:
            return ResolvedTraits(
                glyph_pattern=SUMI_DEFAULT_PATTERN,
                color_palette=SUMI_PALETTES[0],
                growth_rate=1.0,
                opacity=0.9,
                extra={
                    "completeness": 0.8,
                    "gapAngle": 1.57,
                    "brushPressure": 0.65,
                },
            )

        counts = Counter(measurements)
        total = len(measurements)

        # -- Base traits (standard statistical mapping) -----------------------
        mean_val = sum(measurements) / total
        variance = sum((x - mean_val) ** 2 for x in measurements) / total
        max_variance = 12.25  # Max variance for 3-qubit outcomes (0-7)
        normalized_variance = min(variance / max_variance, 1.0)
        growth_rate = 0.5 + normalized_variance * 1.5  # 0.5-2.0

        most_common_count = counts.most_common(1)[0][1]
        consistency = most_common_count / total
        opacity = 0.7 + consistency * 0.3  # 0.7-1.0

        # Color palette from most common outcome (mod palette count)
        palette_idx = counts.most_common(1)[0][0] % len(SUMI_PALETTES)

        # -- Sumi-specific properties (decoded from qubit semantics) ----------

        # completeness: P(q[0]=|0>) -> [0.5, 1.0]
        # Bit 0 (value 0b001) is the completeness qubit
        # More |0> outcomes = more complete circle (inverse: fewer |1>)
        bit0_zeros = sum(1 for m in measurements if not (m & 0b001))
        complete_fraction = bit0_zeros / total  # 0.0-1.0
        completeness = round(0.5 + complete_fraction * 0.5, 3)  # [0.5, 1.0]

        # gapAngle: mean measurement mapped to [0, 2*pi]
        # The overall measurement distribution determines where the gap falls
        mean_normalized = mean_val / 7.0  # normalize to 0-1 for 3-qubit (max=7)
        gap_angle = round(mean_normalized * math.pi * 2, 3)  # [0, 2*pi]

        # brushPressure: P(q[2]=|1>) -> [0.3, 1.0]
        # Bit 2 (value 0b100) is the brush pressure qubit
        bit2_ones = sum(1 for m in measurements if m & 0b100)
        pressure_fraction = bit2_ones / total  # 0.0-1.0
        brush_pressure = round(0.3 + pressure_fraction * 0.7, 3)  # [0.3, 1.0]

        return ResolvedTraits(
            glyph_pattern=SUMI_DEFAULT_PATTERN,
            color_palette=SUMI_PALETTES[palette_idx],
            growth_rate=round(growth_rate, 2),
            opacity=round(opacity, 2),
            extra={
                "completeness": completeness,
                "gapAngle": gap_angle,
                "brushPressure": brush_pressure,
            },
        )
