"""
Quantum circuit level implementations.

Importing this module registers all circuit types with the global registry.
Each circuit is a self-contained module that can be contributed independently.

Available circuits (registered automatically on import):
- superposition: Level 1 - Single qubit superposition
- bell_pair: Level 2 - Two-qubit entanglement
- ghz_state: Level 3 - Multi-party entanglement
- interference: Level 4 - Quantum interference patterns
- quantum_fern: Level 4 - Custom fern circuit (branching + leaf density)
- watercolor_flower_v2: Level 4 - Bloom cascade circuit (multi-flower + petal shape)
- wc_bell_cluster: Level 4 - Bell cluster GHZ cascade circuit (3-bell entanglement)
- wc_quantum_tulip: Level 4 - Tulip superposition circuit (cup depth + petal overlap)
- wc_midnight_poppy: Level 4 - Poppy tunneling circuit (open/close cycle)
- wc_zen_lotus: Level 4 - Lotus cross-pair entanglement (inner/outer symmetry)
- wc_weeping_willow: Level 4 - Willow bilateral entanglement (frond symmetry)
- wc_phoenix_flame: Level 4 - Phoenix height/spread entanglement
- wc_quantum_rose: Level 4 - Rose conservation circuit (inner/outer petal tradeoff)
- wc_sumi_spirit: Level 4 - Sumi collapse circuit (enso completeness)
- wc_aurora_wisp: Level 4 - Aurora phase interference (band patterns)
- wc_cosmic_lotus: Level 4 - Cosmic multi-pair entanglement (sacred geometry)
- variational: Level 5 - Parameterized variational circuits
"""

# Import all circuit modules to trigger registration via @register_circuit decorator
from . import (
    bell_pair,
    ghz_state,
    interference,
    quantum_fern,
    superposition,
    variational,
    watercolor_flower_v2,
    wc_aurora_wisp,
    wc_bell_cluster,
    wc_cosmic_lotus,
    wc_midnight_poppy,
    wc_phoenix_flame,
    wc_quantum_rose,
    wc_quantum_tulip,
    wc_sumi_spirit,
    wc_weeping_willow,
    wc_zen_lotus,
)

__all__ = [
    "superposition",
    "bell_pair",
    "ghz_state",
    "interference",
    "quantum_fern",
    "watercolor_flower_v2",
    "wc_aurora_wisp",
    "wc_bell_cluster",
    "wc_cosmic_lotus",
    "wc_midnight_poppy",
    "wc_phoenix_flame",
    "wc_quantum_rose",
    "wc_quantum_tulip",
    "wc_sumi_spirit",
    "wc_weeping_willow",
    "wc_zen_lotus",
    "variational",
]
