"""
Circuit registry for dynamic circuit type management.

The registry allows:
- Automatic registration of circuit types via decorator
- Lookup by circuit ID or plant rarity
- Listing all available circuits for documentation

This enables community contributions without modifying core code.
"""

from typing import TypeVar

from .base import BaseCircuit, CircuitMetadata

# Type variable for the decorator
T = TypeVar("T", bound=type[BaseCircuit])

# Global registry mapping circuit IDs to their classes
_registry: dict[str, type[BaseCircuit]] = {}


class CircuitNotFoundError(Exception):
    """Raised when a requested circuit is not found in the registry."""

    pass


def register_circuit(circuit_class: T) -> T:
    """Decorator to register a circuit class in the global registry.

    Usage:
        @register_circuit
        class MyCircuit(BaseCircuit):
            ...

    The circuit is registered using its metadata.id as the key.
    """
    # Create an instance to get metadata
    instance = circuit_class()
    circuit_id = instance.metadata.id

    if circuit_id in _registry:
        raise ValueError(
            f"Circuit with id '{circuit_id}' is already registered. "
            f"Existing: {_registry[circuit_id].__name__}, "
            f"New: {circuit_class.__name__}"
        )

    _registry[circuit_id] = circuit_class
    return circuit_class


def get_circuit(circuit_id: str) -> BaseCircuit:
    """Get a circuit instance by its ID.

    Args:
        circuit_id: The unique identifier of the circuit (e.g., "superposition")

    Returns:
        A new instance of the requested circuit.

    Raises:
        CircuitNotFoundError: If no circuit with the given ID is registered.
    """
    if circuit_id not in _registry:
        available = ", ".join(sorted(_registry.keys()))
        raise CircuitNotFoundError(
            f"Circuit '{circuit_id}' not found. Available circuits: {available}"
        )

    return _registry[circuit_id]()


def get_circuit_for_rarity(rarity: float) -> BaseCircuit:
    """Select the appropriate circuit based on plant variant rarity.

    Higher rarity plants (more common) get simpler circuits.
    Lower rarity plants (more rare) get more complex circuits.

    Args:
        rarity: Plant variant rarity value (typically 0.3 to 1.3)

    Returns:
        A circuit instance appropriate for the given rarity.
    """
    # Find circuit whose rarity range contains the given value
    for circuit_class in _registry.values():
        instance = circuit_class()
        meta = instance.metadata
        if meta.min_rarity <= rarity <= meta.max_rarity:
            return instance

    # Fallback: return the circuit with highest level (most complex)
    # This handles edge cases where rarity doesn't match any range
    if _registry:
        highest_level_class = max(_registry.values(), key=lambda c: c().metadata.level)
        return highest_level_class()

    raise CircuitNotFoundError("No circuits registered in the registry.")


def list_circuits() -> list[CircuitMetadata]:
    """List all registered circuits with their metadata.

    Returns:
        List of CircuitMetadata for all registered circuits,
        sorted by level (ascending).
    """
    circuits = [cls().metadata for cls in _registry.values()]
    return sorted(circuits, key=lambda m: m.level)


def list_circuit_ids() -> list[str]:
    """List all registered circuit IDs.

    Returns:
        List of circuit ID strings, sorted alphabetically.
    """
    return sorted(_registry.keys())


def get_registry_stats() -> dict[str, int]:
    """Get statistics about the registry.

    Returns:
        Dictionary with circuit counts by level.
    """
    stats: dict[str, int] = {"total": len(_registry)}
    for circuit_class in _registry.values():
        level = circuit_class().metadata.level
        key = f"level_{level}"
        stats[key] = stats.get(key, 0) + 1
    return stats


def clear_registry() -> None:
    """Clear all registered circuits. Useful for testing."""
    _registry.clear()
