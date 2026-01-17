"""
Plant genome quantum circuit generation.

Each plant's visual traits are encoded in a quantum circuit. When executed,
the circuit produces probabilistic outcomes that determine the plant's
appearance and behavior.
"""

import math

from qiskit import ClassicalRegister, QuantumCircuit, QuantumRegister


def create_plant_circuit(
    seed: int,
    num_traits: int = 5,
) -> QuantumCircuit:
    """
    Create a quantum circuit encoding plant traits.

    The circuit uses:
    - Hadamard gates for superposition (multiple possible values)
    - CNOT gates for entanglement (correlated traits)
    - Rotation gates parameterized by seed for variety

    Args:
        seed: Random seed for circuit parameterization
        num_traits: Number of trait qubits (default 5)

    Returns:
        QuantumCircuit ready for execution
    """
    # Create registers
    trait_register = QuantumRegister(num_traits, "trait")
    classical_register = ClassicalRegister(num_traits, "measurement")
    circuit = QuantumCircuit(trait_register, classical_register)

    # Put all qubits in superposition
    # This creates 2^n possible states
    for i in range(num_traits):
        circuit.h(trait_register[i])

    # Apply seed-based rotations for variety
    # Different seeds produce different probability distributions
    for i in range(num_traits):
        # Use seed to create deterministic but varied angles
        angle = (seed * (i + 1) * 0.1) % (2 * math.pi)
        circuit.ry(angle, trait_register[i])

    # Create entanglement between related traits
    # Trait 0 (form) influences trait 1 (size)
    if num_traits >= 2:
        circuit.cx(trait_register[0], trait_register[1])

    # Trait 2 (color hue) influences trait 3 (color saturation)
    if num_traits >= 4:
        circuit.cx(trait_register[2], trait_register[3])

    # Add some phase for additional complexity
    for i in range(num_traits):
        phase_angle = (seed * (i + 2) * 0.05) % (2 * math.pi)
        circuit.rz(phase_angle, trait_register[i])

    # Measure all qubits
    circuit.measure(trait_register, classical_register)

    return circuit


def create_entangled_pair_circuit(
    seed: int,
    num_traits_per_plant: int = 3,
) -> QuantumCircuit:
    """
    Create a circuit for two entangled plants.

    Plants in an entanglement group share correlated traits.
    Observing one reveals information about the other.

    Args:
        seed: Random seed for circuit parameterization
        num_traits_per_plant: Traits per plant (total qubits = 2x this)

    Returns:
        QuantumCircuit with entangled qubits for two plants
    """
    total_qubits = num_traits_per_plant * 2

    plant_a = QuantumRegister(num_traits_per_plant, "plant_a")
    plant_b = QuantumRegister(num_traits_per_plant, "plant_b")
    classical = ClassicalRegister(total_qubits, "measurement")

    circuit = QuantumCircuit(plant_a, plant_b, classical)

    # Create Bell pairs between corresponding traits
    for i in range(num_traits_per_plant):
        # Create |Φ+⟩ = (|00⟩ + |11⟩)/√2 state
        circuit.h(plant_a[i])
        circuit.cx(plant_a[i], plant_b[i])

    # Apply seed-based local rotations
    for i in range(num_traits_per_plant):
        angle_a = (seed * (i + 1) * 0.1) % (2 * math.pi)
        angle_b = (seed * (i + 1) * 0.15) % (2 * math.pi)
        circuit.ry(angle_a, plant_a[i])
        circuit.ry(angle_b, plant_b[i])

    # Measure all qubits
    for i in range(num_traits_per_plant):
        circuit.measure(plant_a[i], classical[i])
        circuit.measure(plant_b[i], classical[num_traits_per_plant + i])

    return circuit
