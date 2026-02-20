"""
Quantum Fern Circuit — Reference implementation of a custom per-glyph circuit.

Educational Concept: Quantum Interference with entanglement
- Qubit 0 controls branching potential (superposition = branch or no-branch)
- Qubits 0 and 1 are entangled (branch structure correlation)
- Qubit 2 is independent with seed-based rotation (leaf density variation)

This circuit demonstrates how a quantum circuit can be designed to directly
encode plant-specific visual properties in its qubits, rather than relying
on generic statistical mappings. The `extra` dict in ResolvedTraits carries
these plant-specific properties through to the TypeScript renderer.

The TypeScript variant that uses this circuit reads `branchCount`, `asymmetry`,
and `leafDensity` directly from `ctx.traits` — no intermediate mapping needed.
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

# Fern color palettes (greens)
FERN_PALETTES = [
    ["#2D5A27", "#4A8F3F", "#8BC34A"],  # Forest green
    ["#1B5E20", "#388E3C", "#66BB6A"],  # Deep green
    ["#33691E", "#558B2F", "#9CCC65"],  # Lime green
    ["#004D40", "#00796B", "#4DB6AC"],  # Teal green
]

# Placeholder pattern (unused by watercolor renderer, required by base class)
FERN_DEFAULT_PATTERN = [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
]


@register_circuit
class QuantumFernCircuit(BaseCircuit):
    """3-qubit interference + entanglement circuit for the Quantum Fern variant.

    Circuit structure:
    - q[0]: H gate → branch/no-branch superposition
    - q[1]: CNOT(q[0]) → entangled with q[0], creates branch correlation
    - q[2]: H + Ry(seed) → independent leaf density qubit

    Measurement outcomes directly encode:
    - branchCount: number of distinct measurement outcomes (structural diversity)
    - asymmetry: deviation of q[0]/q[1] agreement from 50% (left/right symmetry)
    - leafDensity: fraction of shots where q[2] measured |1⟩
    """

    @property
    def metadata(self) -> CircuitMetadata:
        return CircuitMetadata(
            id="quantum_fern",
            name="Quantum Fern Interference",
            level=4,
            qubit_count=3,
            concept="Interference",
            description=(
                "A 3-qubit circuit designed to encode fern branching geometry. "
                "Qubit 0 and 1 are entangled (branch correlation), qubit 2 is "
                "independent (leaf density). Measurement outcomes directly encode "
                "branchCount, asymmetry, and leafDensity — no generic mapping needed."
            ),
            min_rarity=0.2,
            max_rarity=0.5,
        )

    def create(self, seed: int) -> QuantumCircuit:
        """Create the 3-qubit fern circuit.

        Circuit diagram:
             ┌───┐          ┌─┐
        q[0]: ┤ H ├──■──────┤M├───
             └───┘┌─┴─┐    └╥┘
        q[1]:─────┤ X ├─────╫──┌─┐
                  └───┘     ║  └╥┘
             ┌───┐┌──────┐  ║   ║ ┌─┐
        q[2]: ┤ H ├┤ Ry(θ)┤──╫───╫─┤M├
             └───┘└──────┘  ║   ║ └╥┘
        c: 3/═══════════════╩═══╩══╝
                            0   1  2
        """
        q = QuantumRegister(3, "q")
        c = ClassicalRegister(3, "c")
        circuit = QuantumCircuit(q, c)

        # Branch superposition: q[0] in |+⟩ = (|0⟩ + |1⟩)/√2
        circuit.h(q[0])

        # Branch correlation: entangle q[1] with q[0]
        # When q[0]=|1⟩ (branching), q[1] flips — creating correlated branches
        circuit.cx(q[0], q[1])

        # Leaf density: q[2] independent, seed-based rotation
        # Small rotation biases probability toward |0⟩ or |1⟩
        circuit.h(q[2])
        leaf_angle = (seed % 100) * 0.02 * math.pi  # 0 to 2π
        circuit.ry(leaf_angle, q[2])

        circuit.measure(q, c)
        return circuit

    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map 3-qubit measurements to fern visual properties.

        Standard base traits are computed from statistics.
        Fern-specific traits are decoded directly from qubit semantics
        and returned in the `extra` dict, which gets stored in plant.traits.

        Args:
            measurements: List of integers 0-7 (3 qubits → 8 possible outcomes)

        Returns:
            ResolvedTraits with extra = { branchCount, asymmetry, leafDensity }
        """
        if not measurements:
            return ResolvedTraits(
                glyph_pattern=FERN_DEFAULT_PATTERN,
                color_palette=FERN_PALETTES[0],
                growth_rate=1.0,
                opacity=1.0,
                extra={"branchCount": 3, "asymmetry": 0.0, "leafDensity": 0.5},
            )

        counts = Counter(measurements)
        total = len(measurements)

        # ── Base traits (standard statistical mapping) ──────────────────────
        mean_val = sum(measurements) / total
        variance = sum((x - mean_val) ** 2 for x in measurements) / total
        max_variance = 12.25  # Max variance for 3-qubit outcomes (0–7), ≈ (7/2)²
        normalized_variance = min(variance / max_variance, 1.0)
        growth_rate = 0.5 + normalized_variance * 1.5  # 0.5–2.0

        most_common_count = counts.most_common(1)[0][1]
        consistency = most_common_count / total
        opacity = 0.7 + consistency * 0.3  # 0.7–1.0

        # Color palette from most common outcome
        palette_idx = counts.most_common(1)[0][0] % len(FERN_PALETTES)

        # ── Fern-specific properties (decoded from qubit semantics) ──────────

        # branchCount: distinct measurement outcomes → structural diversity
        # More distinct outcomes = more branching complexity
        branch_count = min(len(counts), 6)  # Cap at 6 for visual clarity

        # asymmetry: how often q[0] and q[1] agree (bit 0 and bit 1)
        # In a perfect Bell state, they agree ~50% of the time
        # Deviation from 50% indicates a directional bias in branching
        q0q1_agree = sum(1 for m in measurements if (m & 1) == ((m >> 1) & 1))
        # Normalize: 0 = perfectly symmetric, 1 = fully asymmetric
        asymmetry = round(abs(q0q1_agree / total - 0.5) * 2, 3)

        # leafDensity: fraction of shots where q[2] = |1⟩ (bit 2 set)
        bit2_ones = sum(1 for m in measurements if m & 0b100)
        leaf_density = round(bit2_ones / total, 3)  # 0.0–1.0

        return ResolvedTraits(
            glyph_pattern=FERN_DEFAULT_PATTERN,
            color_palette=FERN_PALETTES[palette_idx],
            growth_rate=round(growth_rate, 2),
            opacity=round(opacity, 2),
            extra={
                "branchCount": branch_count,
                "asymmetry": asymmetry,
                "leafDensity": leaf_density,
            },
        )
