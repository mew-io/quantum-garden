"""Tests for quantum circuit generation."""

import pytest
from src.circuits.plant_genome import create_plant_circuit, create_entangled_pair_circuit


def test_create_plant_circuit_default():
    """Test creating a plant circuit with default parameters."""
    circuit = create_plant_circuit(seed=42)

    assert circuit.num_qubits == 5
    assert circuit.num_clbits == 5


def test_create_plant_circuit_custom_traits():
    """Test creating a plant circuit with custom trait count."""
    circuit = create_plant_circuit(seed=42, num_traits=3)

    assert circuit.num_qubits == 3
    assert circuit.num_clbits == 3


def test_create_plant_circuit_different_seeds():
    """Test that different seeds produce different circuits."""
    circuit1 = create_plant_circuit(seed=1)
    circuit2 = create_plant_circuit(seed=2)

    # Circuits should have different gate parameters
    assert circuit1.data != circuit2.data


def test_create_entangled_pair_circuit():
    """Test creating an entangled pair circuit."""
    circuit = create_entangled_pair_circuit(seed=42, num_traits_per_plant=3)

    # Should have 6 qubits total (3 per plant)
    assert circuit.num_qubits == 6
    assert circuit.num_clbits == 6


def test_circuit_serialization():
    """Test that circuits can be serialized and deserialized."""
    import io

    from qiskit import qpy

    circuit = create_plant_circuit(seed=42)

    # Serialize using QPY format (Qiskit 2.x standard)
    buffer = io.BytesIO()
    qpy.dump(circuit, buffer)

    # Deserialize back
    buffer.seek(0)
    restored_circuits = qpy.load(buffer)
    restored = restored_circuits[0]

    assert restored.num_qubits == circuit.num_qubits
    assert restored.num_clbits == circuit.num_clbits
