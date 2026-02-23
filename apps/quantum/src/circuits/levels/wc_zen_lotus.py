"""
Watercolor Zen Lotus Circuit — Custom per-plant circuit for the zen lotus variant.

Educational Concept: Entanglement (cross-pair phase correlation)
- Qubits 0–1: inner ring pair (H + CNOT entanglement)
- Qubits 2–3: outer ring pair (H + CNOT entanglement)
- CZ(q[1], q[2]): cross-pair phase correlation — both rings tend toward similar symmetry

This circuit demonstrates how entanglement within pairs and phase correlation
between pairs can encode coupled structural properties. The inner and outer
petal rings are each controlled by an entangled pair, and the CZ gate creates
a phase relationship so both rings tend to agree on rotational symmetry.

Circuit diagram:
     ┌───┐          ┌─┐
q[0]: ┤ H ├──■───────┤M├
     └───┘┌─┴─┐     └╥┘┌─┐
q[1]: ────┤ X ├──■───╫─┤M├
          └───┘  │   ║ └╥┘
     ┌───┐       │   ║  ║ ┌─┐
q[2]: ┤ H ├──■───■───╫──╫─┤M├
     └───┘┌─┴─┐ CZ  ║  ║ └╥┘
q[3]: ────┤ X ├──────╫──╫──╫─┌─┐
          └───┘      ║  ║  ║ ┤M├
                     ║  ║  ║ └╥┘
c: 4/═══════════════╩══╩══╩══╝
                     0  1  2  3

The CZ gate between q[1] and q[2] introduces a phase kick when both are |1⟩,
creating correlation between the inner and outer ring measurements without
fully entangling them. This produces a subtle bias toward matching symmetries.
"""

from collections import Counter

from qiskit import (  # type: ignore[import-untyped]
    ClassicalRegister,
    QuantumCircuit,
    QuantumRegister,
)

from ..base import BaseCircuit, CircuitMetadata, ResolvedTraits
from ..registry import register_circuit

# Color palettes for the zen lotus (matches TypeScript colorVariations)
ZEN_LOTUS_PALETTES = [
    ["#E8EBE8", "#D8DED8", "#C8D0C8"],  # white-jade
    ["#F0E0E4", "#E4D4DC", "#D8C8D0"],  # blush-pink
    ["#F0EAE0", "#E4DED0", "#D8D2C0"],  # morning-gold
]

# Placeholder pattern (unused by watercolor renderer, required by base class)
ZEN_LOTUS_DEFAULT_PATTERN = [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
]


@register_circuit
class WcZenLotusCircuit(BaseCircuit):
    """4-qubit cross-pair entanglement circuit for the Watercolor Zen Lotus.

    Circuit structure:
    - q[0]: H gate → inner ring first qubit in superposition
    - q[1]: CNOT(q[0], q[1]) → inner ring pair entangled
    - q[2]: H gate → outer ring first qubit in superposition
    - q[3]: CNOT(q[2], q[3]) → outer ring pair entangled
    - CZ(q[1], q[2]) → cross-pair phase correlation

    Measurement outcomes encode:
    - innerPetals: structural diversity in lower 2 bits → [3, 6]
    - outerPetals: structural diversity in upper 2 bits → [4, 8]
    - symmetryFold: most common modular pattern → 3, 4, or 6
    - breatheAmplitude: measurement consistency → [0.02, 0.08]
    """

    @property
    def metadata(self) -> CircuitMetadata:
        return CircuitMetadata(
            id="wc_zen_lotus",
            name="Watercolor Zen Lotus Symmetry",
            level=4,
            qubit_count=4,
            concept="Entanglement",
            description=(
                "A 4-qubit circuit encoding lotus petal symmetry via cross-pair "
                "entanglement. Qubits 0-1 form an entangled inner ring pair, "
                "qubits 2-3 form an entangled outer ring pair, and a CZ gate "
                "between q[1] and q[2] creates phase correlation so both rings "
                "tend toward similar rotational symmetry. Measurement outcomes "
                "encode innerPetals, outerPetals, symmetryFold, and breatheAmplitude."
            ),
            min_rarity=0.02,
            max_rarity=0.06,
        )

    def create(self, seed: int) -> QuantumCircuit:
        """Create the 4-qubit cross-pair entanglement circuit.

        Args:
            seed: Plant-specific seed for reproducible per-plant variation.

        Returns:
            A 4-qubit QuantumCircuit ready for simulation.
        """
        q = QuantumRegister(4, "q")
        c = ClassicalRegister(4, "c")
        circuit = QuantumCircuit(q, c)

        # Inner ring pair: H + CNOT entanglement
        # When q[0] collapses, q[1] follows — correlated inner petals
        circuit.h(q[0])
        circuit.cx(q[0], q[1])

        # Outer ring pair: H + CNOT entanglement
        # When q[2] collapses, q[3] follows — correlated outer petals
        circuit.h(q[2])
        circuit.cx(q[2], q[3])

        # Cross-pair phase correlation: CZ between inner and outer
        # When both q[1] and q[2] are |1⟩, applies a phase kick (-1)
        # This creates subtle correlation between the two rings' symmetry
        circuit.cz(q[1], q[2])

        circuit.measure(q, c)
        return circuit

    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map 4-qubit measurements to zen lotus visual properties.

        Args:
            measurements: List of integers 0-15 (4 qubits → 16 possible outcomes)

        Returns:
            ResolvedTraits with extra keys: innerPetals, outerPetals,
            symmetryFold, breatheAmplitude
        """
        if not measurements:
            return ResolvedTraits(
                glyph_pattern=ZEN_LOTUS_DEFAULT_PATTERN,
                color_palette=ZEN_LOTUS_PALETTES[0],
                growth_rate=1.0,
                opacity=0.9,
                extra={
                    "innerPetals": 5,
                    "outerPetals": 6,
                    "symmetryFold": 6,
                    "breatheAmplitude": 0.04,
                },
            )

        counts = Counter(measurements)
        total = len(measurements)

        # ── Base traits (standard statistical mapping) ──────────────────────
        mean_val = sum(measurements) / total
        variance = sum((x - mean_val) ** 2 for x in measurements) / total
        max_variance = 56.25  # Max variance for 4-qubit outcomes (0–15)
        normalized_variance = min(variance / max_variance, 1.0)
        growth_rate = 0.5 + normalized_variance * 1.5  # 0.5–2.0

        most_common_count = counts.most_common(1)[0][1]
        consistency = most_common_count / total
        opacity = 0.7 + consistency * 0.3  # 0.7–1.0

        # Color palette from most common outcome (mod palette count)
        palette_idx = counts.most_common(1)[0][0] % len(ZEN_LOTUS_PALETTES)

        # ── Lotus-specific properties (decoded from qubit semantics) ────────

        # innerPetals: distinct outcomes in lower 2 bits (q[0], q[1]) → [3, 6]
        # The entangled pair (H + CNOT) produces 00 or 11, so typically 1-2
        # distinct lower-2-bit patterns. More diversity → more inner petals.
        lower_2_bit_outcomes = {m & 0b0011 for m in measurements}
        inner_diversity = len(lower_2_bit_outcomes)  # 1–4
        inner_petals = max(3, min(6, 2 + inner_diversity))  # [3, 6]

        # outerPetals: distinct outcomes in upper 2 bits (q[2], q[3]) → [4, 8]
        # Same entangled structure, but CZ adds phase correlation with inner pair
        upper_2_bit_outcomes = {(m >> 2) & 0b0011 for m in measurements}
        outer_diversity = len(upper_2_bit_outcomes)  # 1–4
        inner_boost = 1 if inner_diversity > 2 else 0
        outer_petals = max(4, min(8, 3 + outer_diversity + inner_boost))

        # symmetryFold: most common modular pattern → 3, 4, or 6
        # Look at the full 4-bit measurement modulo 3: dominant residue class
        # determines whether the lotus favors 3-fold, 4-fold, or 6-fold symmetry
        mod3_counts = Counter(m % 3 for m in measurements)
        dominant_mod = mod3_counts.most_common(1)[0][0]
        symmetry_map = {0: 6, 1: 3, 2: 4}  # 0→hexagonal, 1→triangular, 2→square
        symmetry_fold = symmetry_map[dominant_mod]

        # breatheAmplitude: measurement consistency → [0.02, 0.08]
        # High consistency (few outcomes dominate) → gentle breathing
        # Low consistency (many equally likely outcomes) → more dramatic breathing
        breathe_amplitude = round(0.02 + (1 - consistency) * 0.06, 4)  # [0.02, 0.08]

        return ResolvedTraits(
            glyph_pattern=ZEN_LOTUS_DEFAULT_PATTERN,
            color_palette=ZEN_LOTUS_PALETTES[palette_idx],
            growth_rate=round(growth_rate, 2),
            opacity=round(opacity, 2),
            extra={
                "innerPetals": inner_petals,
                "outerPetals": outer_petals,
                "symmetryFold": symmetry_fold,
                "breatheAmplitude": breathe_amplitude,
            },
        )
