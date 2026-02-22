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
)

__all__ = [
    "superposition",
    "bell_pair",
    "ghz_state",
    "interference",
    "quantum_fern",
    "watercolor_flower_v2",
    "variational",
]
