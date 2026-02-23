"""
Watercolor Midnight Poppy Circuit — Custom per-plant circuit for the dramatic poppy.

Educational Concept: Quantum Tunneling
- Qubit 0: H gate creates open/closed tunneling superposition
- Qubit 1: CNOT(q[0], q[1]) entangles petal spread with openness state
- Qubit 2: H + Ry(seed) drives dark center intensity independently

This circuit demonstrates quantum tunneling as a metaphor for the poppy's
dramatic open/close cycle. The H gate on q[0] creates a superposition where
the poppy exists in both "open" and "closed" states simultaneously until
observation collapses it. The CNOT gate entangles petal spread with the
openness qubit — when the poppy tunnels to the open state, petal spread
follows. Meanwhile q[2] independently controls the dark center intensity
through a seed-biased rotation.

The `extra` dict carries poppyOpenness, petalSpread, and darkIntensity
directly to the TypeScript renderer — no intermediate mapping needed.

Circuit diagram:
     ┌───┐                 ┌─┐
q[0]: ┤ H ├──■──────────────┤M├
     └───┘┌─┴─┐            └╥┘┌─┐
q[1]: ────┤ X ├──────────────╫─┤M├
          └───┘              ║ └╥┘
     ┌───┐┌──────────┐       ║  ║ ┌─┐
q[2]: ┤ H ├┤ Ry(θ_s) ├───────╫──╫─┤M├
     └───┘└──────────┘       ║  ║ └╥┘
c: 3/══════════════════════╩══╩══╝
                            0  1  2
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

# Color palettes for the midnight poppy (matches TypeScript colorVariations)
MIDNIGHT_POPPY_PALETTES = [
    ["#C83030", "#2A1A1A", "#5A7A50"],  # crimson
    ["#8A2040", "#1A1020", "#5A7A50"],  # burgundy
    ["#E86030", "#3A1A10", "#5A7A50"],  # flame
]

# Placeholder pattern (unused by watercolor renderer, required by base class)
MIDNIGHT_POPPY_DEFAULT_PATTERN = [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
]


@register_circuit
class WcMidnightPoppyCircuit(BaseCircuit):
    """3-qubit tunneling circuit for the Watercolor Midnight Poppy variant.

    Circuit structure:
    - q[0]: H gate → open/closed tunneling superposition
    - q[1]: CNOT(q[0]) → petal spread entangled with openness
    - q[2]: H + Ry(seed) → dark center intensity (independent)

    Measurement outcomes directly encode:
    - poppyOpenness: P(q[0]=|1>) → how open the poppy is [0.1, 1.0]
    - petalSpread: q[0]/q[1] agreement fraction → petal width [0.3, 1.0]
    - darkIntensity: P(q[2]=|1>) → center darkness [0.5, 1.0]
    """

    @property
    def metadata(self) -> CircuitMetadata:
        return CircuitMetadata(
            id="wc_midnight_poppy",
            name="Watercolor Midnight Poppy Tunneling",
            level=4,
            qubit_count=3,
            concept="Tunneling",
            description=(
                "A 3-qubit circuit encoding the dramatic open/close cycle of a "
                "midnight poppy through quantum tunneling. Qubit 0 creates the "
                "open/closed superposition, CNOT entangles petal spread with the "
                "tunneling state, and qubit 2 independently controls the dark "
                "center intensity via a seed-biased rotation."
            ),
            min_rarity=0.03,
            max_rarity=0.10,
        )

    def create(self, seed: int) -> QuantumCircuit:
        """Create the 3-qubit tunneling circuit.

        Args:
            seed: Plant-specific seed for reproducible per-plant variation.

        Returns:
            A 3-qubit QuantumCircuit ready for simulation.
        """
        q = QuantumRegister(3, "q")
        c = ClassicalRegister(3, "c")
        circuit = QuantumCircuit(q, c)

        # q[0]: Open/closed tunneling superposition
        # H gate creates equal probability of open and closed states
        circuit.h(q[0])

        # q[1]: Petal spread entangled with openness via CNOT
        # When q[0] collapses to |1> (open), q[1] flips -> correlated spread
        circuit.cx(q[0], q[1])

        # q[2]: Dark center intensity — independent seed-biased qubit
        # H creates superposition, Ry biases based on plant seed
        circuit.h(q[2])
        dark_angle = (seed % 60) * 0.035 * math.pi  # 0 -> ~6.6 rad
        circuit.ry(dark_angle, q[2])

        circuit.measure(q, c)
        return circuit

    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map 3-qubit measurements to midnight poppy visual properties.

        Args:
            measurements: List of integers 0-7 (3 qubits -> 8 possible outcomes)

        Returns:
            ResolvedTraits with extra keys: poppyOpenness, petalSpread,
            darkIntensity
        """
        if not measurements:
            return ResolvedTraits(
                glyph_pattern=MIDNIGHT_POPPY_DEFAULT_PATTERN,
                color_palette=MIDNIGHT_POPPY_PALETTES[0],
                growth_rate=1.0,
                opacity=0.9,
                extra={
                    "poppyOpenness": 0.7,
                    "petalSpread": 0.6,
                    "darkIntensity": 0.75,
                },
            )

        counts = Counter(measurements)
        total = len(measurements)

        # -- Base traits (standard statistical mapping) --
        mean_val = sum(measurements) / total
        variance = sum((x - mean_val) ** 2 for x in measurements) / total
        max_variance = 12.25  # Max variance for 3-qubit outcomes (0-7), ~ (7/2)^2
        normalized_variance = min(variance / max_variance, 1.0)
        growth_rate = 0.5 + normalized_variance * 1.5  # 0.5-2.0

        most_common_count = counts.most_common(1)[0][1]
        consistency = most_common_count / total
        opacity = 0.7 + consistency * 0.3  # 0.7-1.0

        # Color palette from most common outcome (mod palette count)
        palette_idx = counts.most_common(1)[0][0] % len(MIDNIGHT_POPPY_PALETTES)

        # -- Poppy-specific properties (decoded from qubit semantics) --

        # poppyOpenness: P(q[0] = |1>) -> [0.1, 1.0]
        # Bit 0 (value 0b001) is the tunneling/openness qubit
        bit0_ones = sum(1 for m in measurements if m & 0b001)
        openness_fraction = bit0_ones / total  # 0.0-1.0
        poppy_openness = round(0.1 + openness_fraction * 0.9, 3)  # 0.1-1.0

        # petalSpread: q[0]/q[1] agreement fraction -> [0.3, 1.0]
        # Due to CNOT, q[0] and q[1] tend to agree (both 0 or both 1).
        # Higher agreement -> wider petal spread.
        agreement_count = sum(
            1 for m in measurements if ((m & 0b001) >> 0) == ((m & 0b010) >> 1)
        )
        agreement_fraction = agreement_count / total  # 0.0-1.0
        petal_spread = round(0.3 + agreement_fraction * 0.7, 3)  # 0.3-1.0

        # darkIntensity: P(q[2] = |1>) -> [0.5, 1.0]
        # Bit 2 (value 0b100) is the dark center qubit
        bit2_ones = sum(1 for m in measurements if m & 0b100)
        dark_fraction = bit2_ones / total  # 0.0-1.0
        dark_intensity = round(0.5 + dark_fraction * 0.5, 3)  # 0.5-1.0

        return ResolvedTraits(
            glyph_pattern=MIDNIGHT_POPPY_DEFAULT_PATTERN,
            color_palette=MIDNIGHT_POPPY_PALETTES[palette_idx],
            growth_rate=round(growth_rate, 2),
            opacity=round(opacity, 2),
            extra={
                "poppyOpenness": poppy_openness,
                "petalSpread": petal_spread,
                "darkIntensity": dark_intensity,
            },
        )
