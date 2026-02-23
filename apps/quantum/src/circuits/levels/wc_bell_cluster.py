"""
Watercolor Bell Cluster Circuit — Custom per-plant circuit for bell flower clusters.

Educational Concept: GHZ State (3-qubit entanglement)
- Qubits 0–2 control individual bell openness (bell 1, 2, 3)
- GHZ-like entanglement: H on q[0], CNOT(q[0]→q[1]), CNOT(q[0]→q[2])
- Creates correlated behaviour: all 3 bells tend to agree (all open or all closed)
- Measurement outcomes encode bell1Open, bell2Open, bell3Open, cascadeDelay

This circuit demonstrates the GHZ state — a maximally entangled 3-qubit state
where all qubits collapse together. In the bell cluster, this means the three
hanging bells tend to open (or stay closed) in unison, with cascadeDelay
derived from measurement consistency.

Circuit diagram:
     ┌───┐               ┌─┐
q[0]: ┤ H ├──■────■───────┤M├
     └───┘┌─┴─┐  │       └╥┘┌─┐
q[1]: ────┤ X ├──┼────────╫─┤M├
          └───┘┌─┴─┐      ║ └╥┘┌─┐
q[2]: ────────┤ X ├───────╫──╫─┤M├
               └───┘      ║  ║ └╥┘
c: 3/════════════════════╩══╩══╩═
                          0  1  2
"""

from collections import Counter

from qiskit import (  # type: ignore[import-untyped]
    ClassicalRegister,
    QuantumCircuit,
    QuantumRegister,
)

from ..base import BaseCircuit, CircuitMetadata, ResolvedTraits
from ..registry import register_circuit

# Color palettes for the bell cluster (matches TypeScript colorVariations)
BELL_CLUSTER_PALETTES = [
    ["#C8A8D8", "#A080C0", "#8EA888"],  # lilac
    ["#F0EEF0", "#D8D0E0", "#8EA888"],  # white
    ["#E8C0D0", "#D0A0B8", "#8EA888"],  # blush
]

# Placeholder pattern (unused by watercolor renderer, required by base class)
BELL_CLUSTER_DEFAULT_PATTERN = [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]


@register_circuit
class WcBellClusterCircuit(BaseCircuit):
    """3-qubit GHZ-like circuit for the Watercolor Bell Cluster variant.

    Circuit structure:
    - q[0]: H gate → bell 1 superposition
    - q[1]: CNOT(q[0], q[1]) → bell 2 entangled with bell 1
    - q[2]: CNOT(q[0], q[2]) → bell 3 entangled with bell 1

    This creates a GHZ-like state |GHZ⟩ = (|000⟩ + |111⟩)/√2 where all
    three bells tend to agree: all open or all closed.

    Measurement outcomes encode:
    - bell1Open: P(q[0]=|1⟩) → 0.0-1.0
    - bell2Open: P(q[1]=|1⟩) → 0.0-1.0
    - bell3Open: P(q[2]=|1⟩) → 0.0-1.0
    - cascadeDelay: measurement consistency → 0.0-0.5
    """

    @property
    def metadata(self) -> CircuitMetadata:
        return CircuitMetadata(
            id="wc_bell_cluster",
            name="Watercolor Bell GHZ Cascade",
            level=4,
            qubit_count=3,
            concept="GHZ State",
            description=(
                "A 3-qubit GHZ-like circuit encoding bell flower cluster behaviour. "
                "Hadamard on q[0] creates superposition, then CNOT gates propagate "
                "entanglement to q[1] and q[2]. All three bells tend to collapse "
                "together — all open or all closed — demonstrating the GHZ state's "
                "all-or-nothing correlation. Measurement consistency controls the "
                "cascade delay between bells opening."
            ),
            min_rarity=0.03,
            max_rarity=0.10,
        )

    def create(self, seed: int) -> QuantumCircuit:
        """Create the 3-qubit GHZ-like bell cluster circuit.

        Args:
            seed: Plant-specific seed for reproducible per-plant variation.

        Returns:
            A 3-qubit QuantumCircuit ready for simulation.
        """
        q = QuantumRegister(3, "q")
        c = ClassicalRegister(3, "c")
        circuit = QuantumCircuit(q, c)

        # Bell 1: Hadamard creates superposition (open or closed)
        circuit.h(q[0])

        # Bell 2: CNOT entangles with bell 1 (tends to agree)
        circuit.cx(q[0], q[1])

        # Bell 3: CNOT entangles with bell 1 (tends to agree)
        circuit.cx(q[0], q[2])

        # Measure all qubits
        circuit.measure(q, c)
        return circuit

    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map 3-qubit GHZ measurements to bell cluster visual properties.

        Args:
            measurements: List of integers 0-7 (3 qubits → 8 possible outcomes).
                         In ideal GHZ, only 0 (000) and 7 (111) appear.

        Returns:
            ResolvedTraits with extra keys: bell1Open, bell2Open, bell3Open,
            cascadeDelay
        """
        if not measurements:
            return ResolvedTraits(
                glyph_pattern=BELL_CLUSTER_DEFAULT_PATTERN,
                color_palette=BELL_CLUSTER_PALETTES[0],
                growth_rate=1.0,
                opacity=0.9,
                extra={
                    "bell1Open": 0.7,
                    "bell2Open": 0.5,
                    "bell3Open": 0.3,
                    "cascadeDelay": 0.15,
                },
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

        # Color palette from most common outcome (mod palette count)
        palette_idx = counts.most_common(1)[0][0] % len(BELL_CLUSTER_PALETTES)

        # ── Bell-specific properties (decoded from qubit semantics) ─────────

        # bell1Open: P(q[0]=|1⟩) → proportion of measurements with bit 0 set
        bit0_ones = sum(1 for m in measurements if m & 0b001)
        bell1_open = round(bit0_ones / total, 3)

        # bell2Open: P(q[1]=|1⟩) → proportion of measurements with bit 1 set
        bit1_ones = sum(1 for m in measurements if m & 0b010)
        bell2_open = round(bit1_ones / total, 3)

        # bell3Open: P(q[2]=|1⟩) → proportion of measurements with bit 2 set
        bit2_ones = sum(1 for m in measurements if m & 0b100)
        bell3_open = round(bit2_ones / total, 3)

        # cascadeDelay: measurement consistency → 0.0-0.5
        # Higher consistency (more agreement among shots) = longer cascade delay
        # (bells open more slowly, in a dramatic cascade)
        cascade_delay = round(consistency * 0.5, 3)

        return ResolvedTraits(
            glyph_pattern=BELL_CLUSTER_DEFAULT_PATTERN,
            color_palette=BELL_CLUSTER_PALETTES[palette_idx],
            growth_rate=round(growth_rate, 2),
            opacity=round(opacity, 2),
            extra={
                "bell1Open": bell1_open,
                "bell2Open": bell2_open,
                "bell3Open": bell3_open,
                "cascadeDelay": cascade_delay,
            },
        )
