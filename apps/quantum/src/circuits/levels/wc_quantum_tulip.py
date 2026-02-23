"""
Watercolor Quantum Tulip Circuit — Custom per-plant circuit for the watercolor tulip.

Educational Concept: Superposition (Cup Shape Uncertainty)
- Qubit 0 controls cup openness (open vs closed cup states in superposition)
- Qubit 1 is entangled with qubit 0 via CNOT (petal overlap correlates with cup)
- Qubit 2 independently controls color intensity via H + Ry(seed)

This circuit demonstrates how superposition creates uncertainty in a tulip's
cup shape: qubit 0's |0⟩/|1⟩ superposition means the cup is simultaneously
shallow and deep until measured. The CNOT on qubit 1 entangles petal overlap
with cup depth — when the cup collapses to "deep," petals tend to overlap more.
Qubit 2 adds independent color intensity variation.

The `extra` dict carries cupDepth, petalOverlap, and colorIntensity
directly to the TypeScript renderer — no intermediate mapping needed.

Circuit diagram:
     ┌───┐              ┌─┐
q[0]: ┤ H ├──■───────────┤M├
     └───┘┌─┴─┐         └╥┘┌─┐
q[1]: ────┤ X ├──────────╫─┤M├
          └───┘          ║ └╥┘
     ┌───┐┌──────────┐   ║  ║ ┌─┐
q[2]: ┤ H ├┤ Ry(θ_s) ├───╫──╫─┤M├
     └───┘└──────────┘   ║  ║ └╥┘
c: 3/══════════════════╩══╩══╝
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

# Color palettes for the watercolor quantum tulip (matches TypeScript colorVariations)
TULIP_PALETTES = [
    ["#E07070", "#C04040", "#6B8A50"],  # classic-red
    ["#F0D860", "#D8B830", "#6B8A50"],  # yellow
    ["#B888D8", "#8858A8", "#6B8A50"],  # purple
]

# Placeholder pattern (unused by watercolor renderer, required by base class)
TULIP_DEFAULT_PATTERN = [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
]


@register_circuit
class WcQuantumTulipCircuit(BaseCircuit):
    """3-qubit superposition circuit for the Watercolor Quantum Tulip variant.

    Circuit structure:
    - q[0]: H gate → cup openness superposition (shallow/deep cup states)
    - q[1]: CNOT(q[0]) → petal overlap entangled with cup openness
    - q[2]: H + Ry(seed) → color intensity, independently seed-biased

    Measurement outcomes directly encode:
    - cupDepth: P(q[0]=|1⟩) → deep cup when q[0] collapses to 1 (0.3–1.0)
    - petalOverlap: P(q[0] agrees with q[1]) → entangled overlap (0.2–0.8)
    - colorIntensity: P(q[2]=|1⟩) → color saturation/strength (0.4–1.0)
    """

    @property
    def metadata(self) -> CircuitMetadata:
        return CircuitMetadata(
            id="wc_quantum_tulip",
            name="Watercolor Tulip Superposition",
            level=4,
            qubit_count=3,
            concept="Superposition",
            description=(
                "A 3-qubit circuit encoding tulip cup shape via superposition. "
                "Qubit 0 creates a superposition of open and closed cup states; "
                "qubit 1 is entangled via CNOT so petal overlap correlates with "
                "cup depth; qubit 2 independently controls color intensity with "
                "a seed-biased Ry rotation. Measurement outcomes encode cupDepth, "
                "petalOverlap, and colorIntensity for the watercolor renderer."
            ),
            min_rarity=0.05,
            max_rarity=0.15,
        )

    def create(self, seed: int) -> QuantumCircuit:
        """Create the 3-qubit tulip superposition circuit.

        Args:
            seed: Plant-specific seed for reproducible per-plant variation.

        Returns:
            A 3-qubit QuantumCircuit ready for simulation.
        """
        q = QuantumRegister(3, "q")
        c = ClassicalRegister(3, "c")
        circuit = QuantumCircuit(q, c)

        # q[0]: Cup openness superposition
        # H gate puts the cup in superposition of shallow (|0⟩) and deep (|1⟩)
        circuit.h(q[0])

        # q[1]: Petal overlap entangled with cup openness via CNOT
        # When q[0] collapses to |1⟩ (deep cup), q[1] flips → high overlap
        # This creates correlated cup-depth/overlap behavior
        circuit.cx(q[0], q[1])

        # q[2]: Color intensity — independent seed-driven qubit
        # H + Ry(seed) biases the probability of intense vs soft colors
        circuit.h(q[2])
        color_angle = (seed % 80) * 0.025 * math.pi  # 0 → ~6.28 rad
        circuit.ry(color_angle, q[2])

        circuit.measure(q, c)
        return circuit

    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map 3-qubit measurements to watercolor tulip visual properties.

        Args:
            measurements: List of integers 0-7 (3 qubits → 8 possible outcomes)

        Returns:
            ResolvedTraits with extra keys: cupDepth, petalOverlap, colorIntensity
        """
        if not measurements:
            return ResolvedTraits(
                glyph_pattern=TULIP_DEFAULT_PATTERN,
                color_palette=TULIP_PALETTES[0],
                growth_rate=1.0,
                opacity=0.9,
                extra={
                    "cupDepth": 0.65,
                    "petalOverlap": 0.5,
                    "colorIntensity": 0.7,
                },
            )

        counts = Counter(measurements)
        total = len(measurements)

        # ── Base traits (standard statistical mapping) ──────────────────────
        mean_val = sum(measurements) / total
        variance = sum((x - mean_val) ** 2 for x in measurements) / total
        max_variance = 12.25  # Max variance for 3-qubit outcomes (0-7), ≈ (7/2)²
        normalized_variance = min(variance / max_variance, 1.0)
        growth_rate = 0.5 + normalized_variance * 1.5  # 0.5–2.0

        most_common_count = counts.most_common(1)[0][1]
        consistency = most_common_count / total
        opacity = 0.7 + consistency * 0.3  # 0.7–1.0

        # Color palette from most common outcome (mod palette count)
        palette_idx = counts.most_common(1)[0][0] % len(TULIP_PALETTES)

        # ── Tulip-specific properties (decoded from qubit semantics) ────────

        # cupDepth: P(q[0]=|1⟩) → [0.3, 1.0]
        # Bit 0 (value 0b001) is the cup openness qubit
        # Deep cup when q[0] collapses to |1⟩
        bit0_ones = sum(1 for m in measurements if m & 0b001)
        cup_depth_fraction = bit0_ones / total  # 0.0–1.0
        cup_depth = round(0.3 + cup_depth_fraction * 0.7, 3)  # 0.3–1.0

        # petalOverlap: P(q[0] agrees with q[1]) → [0.2, 0.8]
        # Because q[1] is CNOT-entangled with q[0], they tend to agree
        # (both |0⟩ or both |1⟩). Agreement = high overlap.
        agreement_count = sum(
            1 for m in measurements if ((m & 0b001) >> 0) == ((m & 0b010) >> 1)
        )
        agreement_fraction = agreement_count / total  # 0.0–1.0
        petal_overlap = round(0.2 + agreement_fraction * 0.6, 3)  # 0.2–0.8

        # colorIntensity: P(q[2]=|1⟩) → [0.4, 1.0]
        # Bit 2 (value 0b100) is the color intensity qubit
        bit2_ones = sum(1 for m in measurements if m & 0b100)
        color_intensity_fraction = bit2_ones / total  # 0.0–1.0
        color_intensity = round(0.4 + color_intensity_fraction * 0.6, 3)  # 0.4–1.0

        return ResolvedTraits(
            glyph_pattern=TULIP_DEFAULT_PATTERN,
            color_palette=TULIP_PALETTES[palette_idx],
            growth_rate=round(growth_rate, 2),
            opacity=round(opacity, 2),
            extra={
                "cupDepth": cup_depth,
                "petalOverlap": petal_overlap,
                "colorIntensity": color_intensity,
            },
        )
