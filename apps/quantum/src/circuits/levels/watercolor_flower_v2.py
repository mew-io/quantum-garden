"""
Watercolor Flower V2 Circuit — Custom per-plant circuit for the enhanced watercolor.

Educational Concept: Quantum Bloom Cascade (Entanglement)
- Qubits 0–2 control the multi-bloom composition (how many flowers appear)
- Qubit 0 and 1 are entangled (cascade effect: 2nd bloom appears when 1st does)
- Qubit 2 is seed-biased (3rd bloom, independently probable)
- Qubit 3 is seed-driven (petal roundness — fully independent from bloom count)

This circuit demonstrates how entanglement can encode compositional decisions:
the correlated q[0]/q[1] pair creates a "bloom cascade" where two flowers tend
to appear or disappear together, while q[2] adds a quantum coin-flip for a third.
The `extra` dict carries flowerCount, petalRoundness, petalCount, and leafCount
directly to the TypeScript renderer — no intermediate mapping needed.

Circuit diagram:
     ┌───┐                    ┌─┐
q[0]: ┤ H ├──■────────────────┤M├
     └───┘┌─┴─┐              └╥┘┌─┐
q[1]: ────┤ X ├───────────────╫─┤M├
          └───┘               ║ └╥┘
     ┌───┐┌──────────┐        ║  ║ ┌─┐
q[2]: ┤ H ├┤ Ry(θ_a) ├────────╫──╫─┤M├
     └───┘└──────────┘        ║  ║ └╥┘
     ┌───┐┌──────────┐        ║  ║  ║ ┌─┐
q[3]: ┤ H ├┤ Ry(θ_b) ├────────╫──╫──╫─┤M├
     └───┘└──────────┘        ║  ║  ║ └╥┘
c: 4/═══════════════════════╩══╩══╩══╝
                             0  1  2  3
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

# Color palettes for the watercolor flower v2 (matches TypeScript colorVariations)
FLOWER_V2_PALETTES = [
    ["#F2D26B", "#E09520", "#8EA888"],  # golden
    ["#E89090", "#C06060", "#8EA888"],  # coral
    ["#B8A0D8", "#7060A0", "#9AAE8C"],  # lavender
    ["#90B8E8", "#4070B0", "#8EA888"],  # sky
    ["#E8A0B0", "#C05870", "#8EA888"],  # rose
    ["#A0D8A8", "#3A8A5A", "#6B9E72"],  # sage
]

# Placeholder pattern (unused by watercolor renderer, required by base class)
FLOWER_V2_DEFAULT_PATTERN = [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
]


@register_circuit
class WatercolorFlowerV2Circuit(BaseCircuit):
    """4-qubit bloom cascade circuit for the Watercolor Flower V2 variant.

    Circuit structure:
    - q[0]: H gate → 1st bloom superposition
    - q[1]: CNOT(q[0]) → 2nd bloom entangled with 1st (cascade)
    - q[2]: H + Ry(seed_a) → 3rd bloom, seed-biased independently
    - q[3]: H + Ry(seed_b) → petal shape qubit (fully independent)

    Measurement outcomes directly encode:
    - flowerCount: average 1-bits in q[0..2] → how many blooms appear (1–3)
    - petalRoundness: P(q[3]=|1⟩) → petal shape from round to pointed (0.5–1.2)
    - petalCount: number of distinct 4-bit outcomes → petal number (4–8)
    - leafCount: measurement consistency → leaf density (1–4)
    """

    @property
    def metadata(self) -> CircuitMetadata:
        return CircuitMetadata(
            id="watercolor_flower_v2",
            name="Watercolor Flower Bloom Cascade",
            level=4,
            qubit_count=4,
            concept="Entanglement",
            description=(
                "A 4-qubit circuit encoding multi-bloom flower composition. "
                "Qubits 0 and 1 are entangled (bloom cascade: 2nd flower follows 1st), "
                "qubit 2 adds a seed-biased 3rd bloom, and qubit 3 independently "
                "controls petal roundness. Measurement outcomes encode flowerCount, "
                "petalRoundness, petalCount, and leafCount for the watercolor renderer."
            ),
            min_rarity=0.05,
            max_rarity=0.15,
        )

    def create(self, seed: int) -> QuantumCircuit:
        """Create the 4-qubit bloom cascade circuit.

        Args:
            seed: Plant-specific seed for reproducible per-plant variation.

        Returns:
            A 4-qubit QuantumCircuit ready for simulation.
        """
        q = QuantumRegister(4, "q")
        c = ClassicalRegister(4, "c")
        circuit = QuantumCircuit(q, c)

        # 1st bloom: superposition — will it bloom at all?
        circuit.h(q[0])

        # 2nd bloom: entangled with 1st via CNOT
        # When q[0] collapses to |1⟩, q[1] flips → correlated blooms
        circuit.cx(q[0], q[1])

        # 3rd bloom: seed-biased independent qubit
        # Small Ry rotation biases probability — seed determines if 3rd bloom is likely
        circuit.h(q[2])
        third_bloom_angle = (seed % 50) * 0.04 * math.pi  # 0 → ~6.28 rad
        circuit.ry(third_bloom_angle, q[2])

        # Petal shape: fully independent seed-driven qubit
        # Ry rotation biases P(|1⟩) which maps to petal roundness
        circuit.h(q[3])
        petal_angle = (seed % 100) * 0.02 * math.pi  # 0 → ~6.28 rad
        circuit.ry(petal_angle, q[3])

        circuit.measure(q, c)
        return circuit

    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map 4-qubit measurements to watercolor flower v2 visual properties.

        Args:
            measurements: List of integers 0-15 (4 qubits → 16 possible outcomes)

        Returns:
            ResolvedTraits with extra keys: flowerCount, petalRoundness,
            petalCount, leafCount
        """
        if not measurements:
            return ResolvedTraits(
                glyph_pattern=FLOWER_V2_DEFAULT_PATTERN,
                color_palette=FLOWER_V2_PALETTES[0],
                growth_rate=1.0,
                opacity=0.9,
                extra={
                    "flowerCount": 1,
                    "petalRoundness": 0.82,
                    "petalCount": 5,
                    "leafCount": 2,
                },
            )

        counts = Counter(measurements)
        total = len(measurements)

        # ── Base traits (standard statistical mapping) ──────────────────────
        mean_val = sum(measurements) / total
        variance = sum((x - mean_val) ** 2 for x in measurements) / total
        max_variance = 56.25  # Max variance for 4-qubit outcomes (0–15), ≈ (15/2)²
        normalized_variance = min(variance / max_variance, 1.0)
        growth_rate = 0.5 + normalized_variance * 1.5  # 0.5–2.0

        most_common_count = counts.most_common(1)[0][1]
        consistency = most_common_count / total
        opacity = 0.7 + consistency * 0.3  # 0.7–1.0

        # Color palette from most common outcome (mod palette count)
        palette_idx = counts.most_common(1)[0][0] % len(FLOWER_V2_PALETTES)

        # ── Flower-specific properties (decoded from qubit semantics) ────────

        # flowerCount: average ones in the lower 3 bits (q[0..2] = bloom qubits)
        # q[0]/q[1] are entangled so they tend to agree → bimodal: 0 or 2 ones
        # q[2] adds a seed-biased independent flip → sometimes 1 or 3 total ones
        bloom_ones_avg = sum(bin(m & 0b0111).count("1") for m in measurements) / total
        # bloom_ones_avg is in [0, 3]; map to flower_count in [1, 3]
        flower_count = max(1, min(3, round(1 + bloom_ones_avg * 2 / 3)))

        # petalRoundness: P(q[3] = |1⟩) → [0.5, 1.2]
        # Bit 3 (value 0b1000) is the petal shape qubit
        bit3_ones = sum(1 for m in measurements if m & 0b1000)
        petal_roundness_fraction = bit3_ones / total  # 0.0–1.0
        petal_roundness = round(0.5 + petal_roundness_fraction * 0.7, 3)  # 0.5–1.2

        # petalCount: distinct 4-bit measurement outcomes, mapped to [4, 8]
        # More quantum diversity → more petals on each flower
        distinct_outcomes = len(counts)
        # With 4 qubits: 1–16 possible distinct outcomes
        petal_count = min(4 + round(distinct_outcomes / 2), 8)

        # leafCount: measurement consistency → [1, 4]
        # High consistency (few distinct outcomes dominate) → fewer, cleaner leaves
        # Low consistency (many equally likely outcomes) → more leaf variety
        leaf_count = max(1, min(4, round((1 - consistency) * 4) + 1))

        return ResolvedTraits(
            glyph_pattern=FLOWER_V2_DEFAULT_PATTERN,
            color_palette=FLOWER_V2_PALETTES[palette_idx],
            growth_rate=round(growth_rate, 2),
            opacity=round(opacity, 2),
            extra={
                "flowerCount": flower_count,
                "petalRoundness": petal_roundness,
                "petalCount": petal_count,
                "leafCount": leaf_count,
            },
        )
