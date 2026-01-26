"""
Quantum circuit module for the Quantum Garden.

This module provides:
- Base classes for circuit implementations (BaseCircuit, CircuitMetadata)
- A registry for dynamic circuit type management
- An execution runner supporting mock, simulator, and hardware modes
- Five complexity levels of quantum circuits for educational progression

Usage:
    from circuits import get_circuit, get_circuit_for_rarity, list_circuits
    from circuits import execute_circuit, ExecutionMode

    # Get a specific circuit
    circuit = get_circuit("superposition")
    qc = circuit.create(seed=42)

    # Get circuit based on plant rarity
    circuit = get_circuit_for_rarity(rarity=0.5)

    # Execute a circuit
    result = await execute_circuit(qc, shots=100)
    traits = circuit.map_measurements(result.measurements)
"""

# Import base classes
# Import levels to trigger registration
# This must be done after registry is imported
from . import levels  # noqa: F401
from .base import BaseCircuit, CircuitMetadata, ResolvedTraits

# Keep backward compatibility with existing plant_genome module
from .plant_genome import create_entangled_pair_circuit, create_plant_circuit

# Import registry functions
from .registry import (
    CircuitNotFoundError,
    clear_registry,
    get_circuit,
    get_circuit_for_rarity,
    get_registry_stats,
    list_circuit_ids,
    list_circuits,
    register_circuit,
)

# Import runner
from .runner import (
    ExecutionMode,
    ExecutionResult,
    execute_circuit,
    execute_circuit_sync,
    get_execution_mode,
)

__all__ = [
    # Base classes
    "BaseCircuit",
    "CircuitMetadata",
    "ResolvedTraits",
    # Registry
    "register_circuit",
    "get_circuit",
    "get_circuit_for_rarity",
    "list_circuits",
    "list_circuit_ids",
    "get_registry_stats",
    "clear_registry",
    "CircuitNotFoundError",
    # Runner
    "ExecutionMode",
    "ExecutionResult",
    "execute_circuit",
    "execute_circuit_sync",
    "get_execution_mode",
    # Legacy compatibility
    "create_plant_circuit",
    "create_entangled_pair_circuit",
]
