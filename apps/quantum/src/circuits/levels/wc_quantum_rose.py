"""
Watercolor Quantum Rose Circuit — Custom per-plant circuit for the quantum rose.

Educational Concept: Conservation (inner/outer petal tradeoff)
- Qubit 0: H gate creates superposition for inner petal count
- Qubit 1: CNOT(q[0], q[1]) + X(q[1]) anti-correlates outer petals with inner
  (when inner petals are many, outer are fewer — conservation!)
- Qubit 2: H gate creates superposition for unfurl depth
- Qubit 3: H + Ry(seed) biases thorn density

This circuit demonstrates conservation: the X gate after CNOT on q[1] creates
anti-correlation. When q[0] collapses to |1> (more inner petals), q[1] becomes
|0> after CNOT+X (fewer outer petals). The rose has finite petal energy
distributed between inner and outer layers.

Circuit diagram:
     +---+              +--+
q[0]: | H |--*-----------| M|
     +---+ +-+-+ +---+   +==+ +--+
q[1]: ------| X |-| X |---||--| M|
            +---+ +---+   ||  +==+
     +---+                 ||   || +--+
q[2]: | H |---------------||---||--| M|
     +---+                 ||   || +==+
     +---+ +--------+      ||   ||  || +--+
q[3]: | H |-| Ry(s) |-----||---||---||--| M|
     +---+ +--------+      ||   ||  || +==+
c: 4/======================++===++=++=++==+
                            0    1  2  3
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

# Color palettes for the quantum rose (matches TypeScript colorVariations)
ROSE_PALETTES = [
    ["#C83848", "#E86878", "#5A7A4A"],  # crimson (deep reds)
    ["#F0E8D8", "#E8D8C8", "#5A7A4A"],  # ivory (whites/creams)
    ["#E8A0B0", "#F0C0D0", "#5A7A4A"],  # pink (soft pinks)
]

# Placeholder pattern (unused by watercolor renderer, required by base class)
ROSE_DEFAULT_PATTERN = [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
]


@register_circuit
class WcQuantumRoseCircuit(BaseCircuit):
    """4-qubit conservation circuit for the Watercolor Quantum Rose variant.

    Circuit structure:
    - q[0]: H gate -> inner petal count superposition
    - q[1]: CNOT(q[0], q[1]) + X(q[1]) -> outer petals ANTI-correlated with inner
    - q[2]: H gate -> unfurl depth superposition
    - q[3]: H + Ry(seed) -> thorn density, seed-biased

    Measurement outcomes encode:
    - innerPetals: P(q[0]=|1>) -> [3, 6]
    - outerPetals: anti-correlated with inner -> [4, 8]
    - unfurlDepth: P(q[2]=|1>) -> [0.3, 1.0]
    - thornDensity: P(q[3]=|1>) biased by seed -> [1, 4]
    """

    @property
    def metadata(self) -> CircuitMetadata:
        return CircuitMetadata(
            id="wc_quantum_rose",
            name="Watercolor Quantum Rose Conservation",
            level=4,
            qubit_count=4,
            concept="Conservation",
            description=(
                "A 4-qubit circuit encoding rose petal dynamics via conservation. "
                "Qubit 0 creates a superposition of inner petal states; qubit 1 is "
                "anti-correlated via CNOT+X so outer petals are inversely related to "
                "inner petals — the rose distributes finite petal energy "
                "between layers. "
                "Qubit 2 encodes unfurl depth, and qubit 3 biases thorn density with "
                "a seed-driven Ry rotation. Measurement outcomes encode innerPetals, "
                "outerPetals, unfurlDepth, and thornDensity."
            ),
            min_rarity=0.02,
            max_rarity=0.06,
        )

    def create(self, seed: int) -> QuantumCircuit:
        """Create the 4-qubit conservation circuit.

        Args:
            seed: Plant-specific seed for reproducible per-plant variation.

        Returns:
            A 4-qubit QuantumCircuit ready for simulation.
        """
        q = QuantumRegister(4, "q")
        c = ClassicalRegister(4, "c")
        circuit = QuantumCircuit(q, c)

        # q[0]: Inner petal count superposition
        # H gate puts inner petals in superposition of few (|0>) and many (|1>)
        circuit.h(q[0])

        # q[1]: Outer petals ANTI-correlated with inner via CNOT + X
        # CNOT copies q[0] to q[1], then X flips it — creating anti-correlation.
        # When q[0] = |1> (many inner), q[1] becomes |0> (fewer outer).
        # This models petal "conservation" — finite petal energy.
        circuit.cx(q[0], q[1])
        circuit.x(q[1])

        # q[2]: Unfurl depth superposition
        # H gate creates superposition of closed (|0>) and open (|1>)
        circuit.h(q[2])

        # q[3]: Thorn density — seed-driven qubit
        # H + Ry(seed) biases the probability of dense vs sparse thorns
        circuit.h(q[3])
        thorn_angle = (seed % 80) * 0.025 * math.pi  # 0 -> ~6.28 rad
        circuit.ry(thorn_angle, q[3])

        circuit.measure(q, c)
        return circuit

    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map 4-qubit measurements to quantum rose visual properties.

        Args:
            measurements: List of integers 0-15 (4 qubits -> 16 possible outcomes)

        Returns:
            ResolvedTraits with extra keys: innerPetals, outerPetals,
            unfurlDepth, thornDensity
        """
        if not measurements:
            return ResolvedTraits(
                glyph_pattern=ROSE_DEFAULT_PATTERN,
                color_palette=ROSE_PALETTES[0],
                growth_rate=1.0,
                opacity=0.9,
                extra={
                    "innerPetals": 5,
                    "outerPetals": 6,
                    "unfurlDepth": 0.65,
                    "thornDensity": 2,
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
        palette_idx = counts.most_common(1)[0][0] % len(ROSE_PALETTES)

        # -- Rose-specific properties (decoded from qubit semantics) ----------

        # innerPetals: P(q[0]=|1>) -> [3, 6]
        # Bit 0 (value 0b0001) is the inner petal qubit
        # More |1> outcomes = more inner petals
        bit0_ones = sum(1 for m in measurements if m & 0b0001)
        inner_fraction = bit0_ones / total  # 0.0-1.0
        inner_petals = max(3, min(6, round(3 + inner_fraction * 3)))  # [3, 6]

        # outerPetals: P(q[1]=|1>) -> [4, 8]
        # Bit 1 (value 0b0010) is the outer petal qubit
        # Anti-correlated with inner due to CNOT+X:
        # when inner is many (q[0]=|1>), outer tends to be fewer (q[1]=|0>)
        bit1_ones = sum(1 for m in measurements if m & 0b0010)
        outer_fraction = bit1_ones / total  # 0.0-1.0
        outer_petals = max(4, min(8, round(4 + outer_fraction * 4)))  # [4, 8]

        # unfurlDepth: P(q[2]=|1>) -> [0.3, 1.0]
        # Bit 2 (value 0b0100) is the unfurl depth qubit
        bit2_ones = sum(1 for m in measurements if m & 0b0100)
        unfurl_fraction = bit2_ones / total  # 0.0-1.0
        unfurl_depth = round(0.3 + unfurl_fraction * 0.7, 3)  # [0.3, 1.0]

        # thornDensity: P(q[3]=|1>) biased by seed -> [1, 4]
        # Bit 3 (value 0b1000) is the thorn density qubit
        bit3_ones = sum(1 for m in measurements if m & 0b1000)
        thorn_fraction = bit3_ones / total  # 0.0-1.0
        thorn_density = max(1, min(4, round(1 + thorn_fraction * 3)))  # [1, 4]

        return ResolvedTraits(
            glyph_pattern=ROSE_DEFAULT_PATTERN,
            color_palette=ROSE_PALETTES[palette_idx],
            growth_rate=round(growth_rate, 2),
            opacity=round(opacity, 2),
            extra={
                "innerPetals": inner_petals,
                "outerPetals": outer_petals,
                "unfurlDepth": unfurl_depth,
                "thornDensity": thorn_density,
            },
        )
