"""
Watercolor Aurora Wisp Circuit — Custom per-plant circuit for the aurora wisp.

Educational Concept: Phase Interference (aurora bands)
- Qubit 0: H gate creates superposition for ribbon count basis
- Qubit 1: H gate creates superposition for wave amplitude
- Qubit 2: CNOT(q[0], q[2]) entangles wave frequency with ribbon count
- Qubit 3: H + Ry(seed) biases curtain height
- Barrier, then Rz(pi/4) on q[1] for phase interference

This circuit demonstrates phase interference in quantum mechanics. The Rz gate
on q[1] introduces a relative phase shift that changes the interference pattern
when combined with the H gate. Constructive and destructive interference creates
patterns where some outcomes are amplified and others suppressed — similar to
how aurora ribbons brighten and dim due to atmospheric interference. The CNOT
between q[0] and q[2] entangles wave frequency with ribbon count, so ribbons
with more waves tend to appear in groups.

Circuit diagram:
     +---+                         +--+
q[0]: | H |--*----------------------| M|
     +---+  |                       +==+
     +---+  |           +--------+   || +--+
q[1]: | H |--|-----------|Rz(p/4)|---||--| M|
     +---+  |           +--------+   || +==+
           +-+-+                      ||  || +--+
q[2]: -----| X |---------------------||--||--| M|
           +---+                      ||  || +==+
     +---+ +--------+                 ||  ||  || +--+
q[3]: | H |-| Ry(s) |-----------------||--||--||--| M|
     +---+ +--------+                 ||  ||  || +==+
c: 4/==================================++==++=++=++==+
                                        0   1  2  3
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

# Color palettes for the aurora wisp (matches TypeScript colorVariations)
AURORA_PALETTES = [
    ["#50C888", "#40A0B0", "#8060C0"],  # boreal (greens/teals)
    ["#D860A0", "#A050C0", "#6040D0"],  # solar (pinks/purples)
]

# Placeholder pattern (unused by watercolor renderer, required by base class)
AURORA_DEFAULT_PATTERN = [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]


@register_circuit
class WcAuroraWispCircuit(BaseCircuit):
    """4-qubit phase interference circuit for the Watercolor Aurora Wisp variant.

    Circuit structure:
    - q[0]: H gate -> ribbon count basis superposition
    - q[1]: H gate -> wave amplitude superposition, then Rz(pi/4) phase shift
    - q[2]: CNOT(q[0], q[2]) -> wave frequency entangled with ribbon count
    - q[3]: H + Ry(seed) -> curtain height, seed-biased

    Measurement outcomes encode:
    - ribbonCount: distinct outcomes in bits [0,2] -> [2, 5]
    - waveAmplitude: P(q[1]=|1>) affected by phase -> [3, 8]
    - waveFrequency: correlation of q[0] and q[2] -> [2, 5]
    - curtainHeight: P(q[3]=|1>) -> [0.6, 1.2]
    """

    @property
    def metadata(self) -> CircuitMetadata:
        return CircuitMetadata(
            id="wc_aurora_wisp",
            name="Watercolor Aurora Wisp Phase Interference",
            level=4,
            qubit_count=4,
            concept="Phase Interference",
            description=(
                "A 4-qubit circuit encoding aurora dynamics via phase interference. "
                "Qubit 0 creates a superposition for ribbon count; qubit 1 is placed "
                "in superposition and then phase-shifted by Rz(pi/4), creating "
                "constructive and destructive interference that modulates wave "
                "amplitude — mirroring how aurora ribbons brighten and dim through "
                "atmospheric interference. Qubit 2 is entangled with qubit 0 via "
                "CNOT so wave frequency correlates with ribbon count. Qubit 3 "
                "controls curtain height with a seed-biased Ry rotation. Measurement "
                "outcomes encode ribbonCount, waveAmplitude, waveFrequency, and "
                "curtainHeight."
            ),
            min_rarity=0.02,
            max_rarity=0.06,
        )

    def create(self, seed: int) -> QuantumCircuit:
        """Create the 4-qubit phase interference circuit.

        Args:
            seed: Plant-specific seed for reproducible per-plant variation.

        Returns:
            A 4-qubit QuantumCircuit ready for simulation.
        """
        q = QuantumRegister(4, "q")
        c = ClassicalRegister(4, "c")
        circuit = QuantumCircuit(q, c)

        # q[0]: Ribbon count basis superposition
        # H gate puts ribbons in superposition of few (|0>) and many (|1>)
        circuit.h(q[0])

        # q[1]: Wave amplitude superposition
        # H gate creates superposition for amplitude measurement
        circuit.h(q[1])

        # q[2]: Wave frequency entangled with ribbon count via CNOT
        # When q[0] = |1> (more ribbons), q[2] flips -> higher frequency
        # This creates correlated ribbon-count/wave-frequency behavior
        circuit.cx(q[0], q[2])

        # q[3]: Curtain height -- seed-driven qubit
        # H + Ry(seed) biases the probability of tall vs short curtains
        circuit.h(q[3])
        height_angle = (seed % 80) * 0.025 * math.pi  # 0 -> ~6.28 rad
        circuit.ry(height_angle, q[3])

        # Barrier separates circuit preparation from phase interference
        circuit.barrier()

        # Phase interference on q[1]: Rz(pi/4) introduces a relative phase
        # that changes the interference pattern when combined with the earlier H.
        # This creates non-uniform amplitude probability — some wave amplitudes
        # become more likely than others, like aurora brightness variations.
        circuit.rz(math.pi / 4, q[1])

        circuit.measure(q, c)
        return circuit

    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map 4-qubit measurements to aurora wisp visual properties.

        Args:
            measurements: List of integers 0-15 (4 qubits -> 16 possible outcomes)

        Returns:
            ResolvedTraits with extra keys: ribbonCount, waveAmplitude,
            waveFrequency, curtainHeight
        """
        if not measurements:
            return ResolvedTraits(
                glyph_pattern=AURORA_DEFAULT_PATTERN,
                color_palette=AURORA_PALETTES[0],
                growth_rate=1.0,
                opacity=0.9,
                extra={
                    "ribbonCount": 3,
                    "waveAmplitude": 5,
                    "waveFrequency": 3,
                    "curtainHeight": 0.9,
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
        palette_idx = counts.most_common(1)[0][0] % len(AURORA_PALETTES)

        # -- Aurora-specific properties (decoded from qubit semantics) --------

        # ribbonCount: distinct outcomes in bits [0,2] -> [2, 5]
        # Extract bit 0 and bit 2, combine into 2-bit value (0-3)
        # Count distinct 2-bit patterns to determine ribbon variety
        bit_02_patterns: set[int] = set()
        for m in measurements:
            bit0 = m & 0b0001
            bit2 = (m & 0b0100) >> 2
            bit_02_patterns.add((bit2 << 1) | bit0)
        # Map distinct patterns (1-4) to ribbon count [2, 5]
        ribbon_count = max(2, min(5, len(bit_02_patterns) + 1))

        # waveAmplitude: P(q[1]=|1>) affected by Rz phase -> [3, 8]
        # Bit 1 (value 0b0010) is the wave amplitude qubit
        # The Rz(pi/4) phase shift biases the measurement probability
        bit1_ones = sum(1 for m in measurements if m & 0b0010)
        amp_fraction = bit1_ones / total  # 0.0-1.0
        wave_amplitude = round(3 + amp_fraction * 5, 1)  # [3, 8]

        # waveFrequency: correlation of q[0] and q[2] -> [2, 5]
        # Because q[2] is CNOT-entangled with q[0], they tend to agree.
        # Agreement = higher frequency, disagreement = lower frequency.
        agreement_count = sum(
            1 for m in measurements if ((m & 0b0001) >> 0) == ((m & 0b0100) >> 2)
        )
        freq_fraction = agreement_count / total  # 0.0-1.0
        wave_frequency = round(2 + freq_fraction * 3, 1)  # [2, 5]

        # curtainHeight: P(q[3]=|1>) -> [0.6, 1.2]
        # Bit 3 (value 0b1000) is the curtain height qubit
        bit3_ones = sum(1 for m in measurements if m & 0b1000)
        height_fraction = bit3_ones / total  # 0.0-1.0
        curtain_height = round(0.6 + height_fraction * 0.6, 3)  # [0.6, 1.2]

        return ResolvedTraits(
            glyph_pattern=AURORA_DEFAULT_PATTERN,
            color_palette=AURORA_PALETTES[palette_idx],
            growth_rate=round(growth_rate, 2),
            opacity=round(opacity, 2),
            extra={
                "ribbonCount": ribbon_count,
                "waveAmplitude": wave_amplitude,
                "waveFrequency": wave_frequency,
                "curtainHeight": curtain_height,
            },
        )
