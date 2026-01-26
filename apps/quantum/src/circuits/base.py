"""
Base classes for quantum circuit implementations.

Each circuit type implements the BaseCircuit interface, providing:
- Metadata for educational documentation
- Circuit creation logic
- Measurement-to-trait mapping

This modular design allows community contributions of new circuit types.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any

from qiskit import QuantumCircuit  # type: ignore[import-untyped]


@dataclass
class CircuitMetadata:
    """Educational metadata for a circuit type.

    Attributes:
        id: Unique identifier (e.g., "superposition", "bell_pair")
        name: Display name (e.g., "Single Qubit Superposition")
        level: Complexity level (1-5, higher = more advanced)
        qubit_count: Number of qubits used in the circuit
        concept: Quantum concept being taught (e.g., "Superposition")
        description: Educational explanation of the circuit
        min_rarity: Minimum plant variant rarity to use this circuit
        max_rarity: Maximum plant variant rarity to use this circuit
    """

    id: str
    name: str
    level: int
    qubit_count: int
    concept: str
    description: str
    min_rarity: float
    max_rarity: float

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "name": self.name,
            "level": self.level,
            "qubitCount": self.qubit_count,
            "concept": self.concept,
            "description": self.description,
            "minRarity": self.min_rarity,
            "maxRarity": self.max_rarity,
        }


@dataclass
class ResolvedTraits:
    """Visual traits resolved from quantum measurements.

    These traits directly control plant rendering in the garden.
    """

    glyph_pattern: list[list[int]]  # 64x64 binary grid
    color_palette: list[str]  # 3 hex colors [primary, secondary, tertiary]
    growth_rate: float  # 0.5 to 2.0 (affects lifecycle speed)
    opacity: float  # 0.7 to 1.0

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "glyphPattern": self.glyph_pattern,
            "colorPalette": self.color_palette,
            "growthRate": round(self.growth_rate, 2),
            "opacity": round(self.opacity, 2),
        }


class BaseCircuit(ABC):
    """Abstract base class for all plant quantum circuits.

    To create a new circuit type:
    1. Create a new file in circuits/levels/
    2. Subclass BaseCircuit
    3. Implement metadata, create(), and map_measurements()
    4. Decorate with @register_circuit

    Example:
        @register_circuit
        class MyNewCircuit(BaseCircuit):
            @property
            def metadata(self) -> CircuitMetadata:
                return CircuitMetadata(
                    id="my_circuit",
                    name="My New Circuit",
                    level=3,
                    qubit_count=3,
                    concept="Some Quantum Concept",
                    description="Educational explanation...",
                    min_rarity=0.5,
                    max_rarity=0.8,
                )

            def create(self, seed: int) -> QuantumCircuit:
                # Build and return the circuit
                pass

            def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
                # Convert measurements to visual traits
                pass
    """

    @property
    @abstractmethod
    def metadata(self) -> CircuitMetadata:
        """Return circuit metadata for documentation and routing."""
        pass

    @abstractmethod
    def create(self, seed: int) -> QuantumCircuit:
        """Create the quantum circuit with the given seed.

        Args:
            seed: Random seed for deterministic circuit parameterization.
                  Same seed should produce same circuit for reproducibility.

        Returns:
            A Qiskit QuantumCircuit ready for execution.
        """
        pass

    @abstractmethod
    def map_measurements(self, measurements: list[int]) -> ResolvedTraits:
        """Map quantum measurements to visual plant traits.

        Args:
            measurements: List of integer measurement results from circuit execution.
                         Each integer represents one shot's outcome.

        Returns:
            ResolvedTraits containing glyph pattern, colors, growth rate, and opacity.
        """
        pass

    def __repr__(self) -> str:
        meta = self.metadata
        return f"<{self.__class__.__name__} id={meta.id} level={meta.level}>"
