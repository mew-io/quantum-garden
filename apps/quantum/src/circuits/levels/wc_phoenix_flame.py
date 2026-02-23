"""
Watercolor Phoenix Flame Circuit — Custom per-plant circuit for the phoenix flame.

Educational Concept: Entanglement (Height/Spread Correlation)
- Qubit 0: H gate creates superposition for flame height
- Qubit 1: CNOT(q[0], q[1]) entangles wing spread with flame height
  (when the flame is tall, wings tend to spread wider)
- Qubit 2: H + Ry(seed) biases ember intensity

This circuit demonstrates how entanglement creates correlation between
two visual properties. The CNOT between q[0] and q[1] means that when
the flame height collapses to "tall" (|1>), wing spread tends to follow,
creating phoenixes that are either tall with wide wings or short with
narrow wings. Qubit 2 independently controls ember intensity.

Circuit diagram:
     +---+              +--+
q[0]: | H |--*-----------| M|
     +---+ +-+-+         +==+ +--+
q[1]: ------| X |----------||--| M|
            +---+          ||  +==+
     +---+ +--------+      ||   || +--+
q[2]: | H |-| Ry(s) |------||---||--| M|
     +---+ +--------+      ||   || +==+
c: 3/======================++===++=++==+
                            0    1  2
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

# Color palettes for the phoenix flame (matches TypeScript colorVariations)
PHOENIX_PALETTES = [
    ["#E85830", "#F0A030", "#D04020"],  # inferno (reds/oranges)
    ["#F0C040", "#E8A830", "#D89020"],  # solar (golds/yellows)
]

# Placeholder pattern (unused by watercolor renderer, required by base class)
PHOENIX_DEFAULT_PATTERN = [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]


@register_circuit
class WcPhoenixFlameCircuit(BaseCircuit):
    """3-qubit entanglement circuit for the Watercolor Phoenix Flame variant.

    Circuit structure:
    - q[0]: H gate -> flame height superposition (short/tall)
    - q[1]: CNOT(q[0], q[1]) -> wing spread entangled with height
    - q[2]: H + Ry(seed) -> ember intensity, seed-biased

    Measurement outcomes encode:
    - flameHeight: P(q[0]=|1>) -> [0.7, 1.3]
    - wingSpread: correlation(q[0], q[1]) -> [0.5, 1.0]
    - emberIntensity: P(q[2]=|1>) -> [0.3, 1.0]
    """

    @property
    def metadata(self) -> CircuitMetadata:
        return CircuitMetadata(
            id="wc_phoenix_flame",
            name="Watercolor Phoenix Flame Entanglement",
            level=4,
            qubit_count=3,
            concept="Entanglement",
            description=(
                "A 3-qubit circuit encoding phoenix flame dynamics via entanglement. "
                "Qubit 0 creates a superposition of short and tall flame states; "
                "qubit 1 is entangled via CNOT so wing spread correlates with flame "
                "height — tall flames produce wide wingspans; qubit 2 independently "
                "controls ember intensity with a seed-biased Ry rotation. Measurement "
                "outcomes encode flameHeight, wingSpread, and emberIntensity."
            ),
            min_rarity=0.02,
            max_rarity=0.06,
        )

    def create(self, seed: int) -> QuantumCircuit:
        """Create the 3-qubit phoenix entanglement circuit.

        Args:
            seed: Plant-specific seed for reproducible per-plant variation.

        Returns:
            A 3-qubit QuantumCircuit ready for simulation.
        """
        q = QuantumRegister(3, "q")
        c = ClassicalRegister(3, "c")
        circuit = QuantumCircuit(q, c)

        # q[0]: Flame height superposition
        # H gate puts the flame in superposition of short (|0>) and tall (|1>)
        circuit.h(q[0])

        # q[1]: Wing spread entangled with flame height via CNOT
        # When q[0] collapses to |1> (tall flame), q[1] flips -> wide wings
        # This creates correlated height/wingspan behavior
        circuit.cx(q[0], q[1])

        # q[2]: Ember intensity -- seed-driven qubit
        # H + Ry(seed) biases the probability of intense vs dim embers
        circuit.h(q[2])
        ember_angle = (seed % 80) * 0.025 * math.pi  # 0 -> ~6.28 rad
        circuit.ry(ember_angle, q[2])

        circuit.measure(q, c)
        return circuit

    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map 3-qubit measurements to phoenix flame visual properties.

        Args:
            measurements: List of integers 0-7 (3 qubits -> 8 possible outcomes)

        Returns:
            ResolvedTraits with extra keys: flameHeight, wingSpread, emberIntensity
        """
        if not measurements:
            return ResolvedTraits(
                glyph_pattern=PHOENIX_DEFAULT_PATTERN,
                color_palette=PHOENIX_PALETTES[0],
                growth_rate=1.0,
                opacity=0.9,
                extra={
                    "flameHeight": 1.0,
                    "wingSpread": 0.75,
                    "emberIntensity": 0.65,
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
        palette_idx = counts.most_common(1)[0][0] % len(PHOENIX_PALETTES)

        # -- Phoenix-specific properties (decoded from qubit semantics) -------

        # flameHeight: P(q[0]=|1>) -> [0.7, 1.3]
        # Bit 0 (value 0b001) is the flame height qubit
        # Tall flame when q[0] collapses to |1>
        bit0_ones = sum(1 for m in measurements if m & 0b001)
        height_fraction = bit0_ones / total  # 0.0-1.0
        flame_height = round(0.7 + height_fraction * 0.6, 3)  # 0.7-1.3

        # wingSpread: P(q[0] agrees with q[1]) -> [0.5, 1.0]
        # Because q[1] is CNOT-entangled with q[0], they tend to agree
        # (both |0> or both |1>). Agreement = wings spread proportionally.
        agreement_count = sum(
            1 for m in measurements if ((m & 0b001) >> 0) == ((m & 0b010) >> 1)
        )
        agreement_fraction = agreement_count / total  # 0.0-1.0
        wing_spread = round(0.5 + agreement_fraction * 0.5, 3)  # 0.5-1.0

        # emberIntensity: P(q[2]=|1>) -> [0.3, 1.0]
        # Bit 2 (value 0b100) is the ember intensity qubit
        bit2_ones = sum(1 for m in measurements if m & 0b100)
        ember_fraction = bit2_ones / total  # 0.0-1.0
        ember_intensity = round(0.3 + ember_fraction * 0.7, 3)  # 0.3-1.0

        return ResolvedTraits(
            glyph_pattern=PHOENIX_DEFAULT_PATTERN,
            color_palette=PHOENIX_PALETTES[palette_idx],
            growth_rate=round(growth_rate, 2),
            opacity=round(opacity, 2),
            extra={
                "flameHeight": flame_height,
                "wingSpread": wing_spread,
                "emberIntensity": ember_intensity,
            },
        )
