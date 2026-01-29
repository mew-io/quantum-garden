# Quantum Circuits

This document explains how quantum circuits encode plant traits in Quantum Garden.

---

## Overview

Each plant's visual appearance is determined by a quantum circuit. The circuit creates superposition of possible traits, and measurement collapses this to a single outcome.

Key concepts:

- **Superposition**: A qubit exists in multiple states simultaneously
- **Entanglement**: Measuring one qubit affects correlated qubits
- **Measurement**: Collapses quantum state to classical bits

---

## Plant Genome Circuit

A basic plant genome circuit:

```python
from qiskit import QuantumCircuit, QuantumRegister

def create_plant_circuit(seed: int, num_traits: int = 5):
    qr = QuantumRegister(num_traits, 'trait')
    circuit = QuantumCircuit(qr)

    # Superposition: create all possible trait combinations
    circuit.h(qr)  # Hadamard on all qubits

    # Entanglement: correlate related traits
    circuit.cx(qr[0], qr[1])  # Form influences size
    circuit.cx(qr[2], qr[3])  # Color hue influences saturation

    # Seed-based rotation for variety
    for i, q in enumerate(qr):
        angle = (seed * (i + 1) * 0.1) % (2 * math.pi)
        circuit.ry(angle, q)

    circuit.measure_all()
    return circuit
```

### Qubits and Traits

| Qubit | Trait                | Possible Values                |
| ----- | -------------------- | ------------------------------ |
| 0     | Form (glyph pattern) | 0-1 (combined with qubit 1)    |
| 1     | Size modifier        | 0-1 (entangled with qubit 0)   |
| 2     | Color hue            | 0-1 (combined with qubits 3-4) |
| 3     | Color saturation     | 0-1 (entangled with qubit 2)   |
| 4     | Growth rate          | 0-1                            |

With 5 qubits, there are 2^5 = 32 possible trait combinations.

---

## Entanglement Groups

Some plants share entangled qubits. Observing one reveals information about others:

```python
def create_entangled_pair_circuit(seed: int, traits_per_plant: int = 3):
    plant_a = QuantumRegister(traits_per_plant, 'plant_a')
    plant_b = QuantumRegister(traits_per_plant, 'plant_b')
    circuit = QuantumCircuit(plant_a, plant_b)

    # Create Bell pairs between corresponding traits
    for i in range(traits_per_plant):
        circuit.h(plant_a[i])
        circuit.cx(plant_a[i], plant_b[i])

    # Now measuring plant_a[i] determines plant_b[i]
    circuit.measure_all()
    return circuit
```

When you observe an entangled plant:

1. Its traits are measured
2. Correlated traits in partner plants are now determined
3. Observing the partner reveals consistent traits

---

## Measurement to Traits

Quantum measurement produces a bitstring (e.g., `10110`). This maps to visual traits:

```python
def map_measurements_to_traits(measurements: list[int], qubit_count: int = 5) -> dict:
    # Most frequent measurement determines base traits
    most_common = Counter(measurements).most_common(1)[0][0]

    # Extract bit groups
    pattern_bits = most_common & 0b11        # Bits 0-1
    color_bits = (most_common >> 2) & 0b111  # Bits 2-4

    return {
        "glyphPattern": PATTERNS[pattern_bits % len(PATTERNS)],
        "colorPalette": PALETTES[color_bits % len(PALETTES)],
        "growthRate": calculate_growth_rate(measurements, qubit_count),
        "opacity": calculate_opacity(measurements),
    }
```

### Growth Rate Calculation

Growth rate is derived from measurement variance, normalized by the maximum possible variance for the given qubit count:

- **Max variance formula**: `2^(2n-2)` where `n` is qubit count
- **Normalization**: `normalized_variance = variance / max_variance`
- **Growth rate**: `0.5 + normalized_variance * 1.5` (range: 0.5 to 2.0)

This ensures consistent growth rate mapping regardless of circuit complexity.

### Probability and Visual Consistency

- Higher measurement probability → more consistent appearance
- Variance in measurements → affects growth rate (parameterized by qubit count)
- Dominant outcome → determines base pattern and colors

---

## IonQ Execution

Circuits run on IonQ hardware or simulator:

```python
from qiskit_ionq import IonQProvider

provider = IonQProvider(token=api_key)
backend = provider.get_backend('ionq_simulator')  # or 'ionq_qpu'

job = backend.run(circuit, shots=100)
result = job.result()
counts = result.get_counts()  # {'10110': 23, '01001': 15, ...}
```

### Shots and Statistics

- **Shots**: Number of times to run the circuit
- More shots = better probability estimates
- Default: 100 shots per measurement
- Trade-off: accuracy vs. compute cost

---

## Superposition Visualization

Before observation, plants display superposition:

1. Multiple possible glyph patterns shown simultaneously
2. Each pattern rendered at low opacity
3. Patterns weighted by measurement probability
4. Creates a "fuzzy" or "uncertain" appearance

After observation:

1. Single pattern selected
2. Full opacity
3. Pattern is fixed permanently

---

## Circuit Storage

Circuits are serialized for storage:

```python
# Serialize
circuit_dict = circuit.to_dict()

# Deserialize
restored = QuantumCircuit.from_dict(circuit_dict)
```

This allows:

- Reproducible circuit execution
- Storing circuit definitions in database
- Sharing circuits between services

---

## Further Reading

- [Qiskit Documentation](https://qiskit.org/documentation/)
- [IonQ Documentation](https://ionq.com/docs)
- [Quantum Computing Basics](https://qiskit.org/textbook/)
