"""
Quantum circuit execution abstraction.

Supports three execution modes:
- MOCK: Local simulation using Qiskit Aer (no IonQ credentials needed)
- SIMULATOR: IonQ cloud simulator (free tier, requires API key)
- HARDWARE: IonQ quantum hardware (paid, requires API key)

The runner automatically selects the mode based on configuration.
"""

import asyncio
from dataclasses import dataclass
from enum import Enum
from typing import Any

from qiskit import QuantumCircuit  # type: ignore[import-untyped]

from ..config import settings


class ExecutionMode(Enum):
    """Quantum circuit execution modes."""

    MOCK = "mock"  # Local Qiskit Aer simulation
    SIMULATOR = "simulator"  # IonQ cloud simulator (sandbox)
    HARDWARE = "hardware"  # IonQ quantum hardware


@dataclass
class ExecutionResult:
    """Result from quantum circuit execution."""

    measurements: list[int]  # List of measurement outcomes (as integers)
    counts: dict[str, int]  # Bitstring -> count mapping
    probabilities: dict[str, float]  # Bitstring -> probability mapping
    mode: ExecutionMode  # Which mode was used
    shots: int  # Number of shots executed
    job_id: str | None = None  # IonQ job ID (if applicable)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "measurements": self.measurements,
            "counts": self.counts,
            "probabilities": self.probabilities,
            "mode": self.mode.value,
            "shots": self.shots,
            "jobId": self.job_id,
        }


def get_execution_mode() -> ExecutionMode:
    """Determine the execution mode based on configuration.

    Returns:
        - MOCK if no IONQ_API_KEY is set
        - SIMULATOR if IONQ_API_KEY is set and IONQ_USE_SIMULATOR is True
        - HARDWARE if IONQ_API_KEY is set and IONQ_USE_SIMULATOR is False
    """
    if not settings.ionq_api_key:
        return ExecutionMode.MOCK

    if settings.ionq_use_simulator:
        return ExecutionMode.SIMULATOR

    return ExecutionMode.HARDWARE


async def execute_circuit(
    circuit: QuantumCircuit,
    shots: int | None = None,
    mode: ExecutionMode | None = None,
) -> ExecutionResult:
    """Execute a quantum circuit and return measurement results.

    Args:
        circuit: The Qiskit QuantumCircuit to execute
        shots: Number of measurement shots (default from settings)
        mode: Execution mode (default auto-detected from settings)

    Returns:
        ExecutionResult containing measurements and statistics
    """
    if shots is None:
        shots = settings.default_shots

    if mode is None:
        mode = get_execution_mode()

    if mode == ExecutionMode.MOCK:
        return await _execute_mock(circuit, shots)
    elif mode == ExecutionMode.SIMULATOR:
        return await _execute_ionq(circuit, shots, use_simulator=True)
    else:  # HARDWARE
        return await _execute_ionq(circuit, shots, use_simulator=False)


async def _execute_mock(circuit: QuantumCircuit, shots: int) -> ExecutionResult:
    """Execute circuit using local Qiskit Aer simulator.

    This is fast and works offline, but doesn't reflect real quantum noise.
    """
    from qiskit_aer import AerSimulator  # type: ignore[import-not-found]

    # Run in thread pool to avoid blocking
    loop = asyncio.get_event_loop()

    def run_simulation() -> dict[str, int]:
        simulator = AerSimulator()
        job = simulator.run(circuit, shots=shots)
        result = job.result()
        counts: dict[str, int] = result.get_counts()
        return counts

    counts = await loop.run_in_executor(None, run_simulation)

    # Convert counts to measurements and probabilities
    measurements = []
    probabilities = {}
    total_shots = sum(counts.values())

    for bitstring, count in counts.items():
        # Qiskit returns bitstrings in reverse order, so reverse them
        if isinstance(bitstring, str):
            norm_bits = bitstring[::-1]
            value = int(norm_bits, 2)
        else:
            norm_bits = bitstring
            value = bitstring
        measurements.extend([value] * count)
        probabilities[norm_bits] = count / total_shots

    return ExecutionResult(
        measurements=measurements,
        counts={k[::-1]: v for k, v in counts.items()},  # Normalize bitstring order
        probabilities=probabilities,
        mode=ExecutionMode.MOCK,
        shots=shots,
        job_id=None,
    )


async def _execute_ionq(
    circuit: QuantumCircuit,
    shots: int,
    use_simulator: bool,
) -> ExecutionResult:
    """Execute circuit on IonQ cloud (simulator or hardware).

    Args:
        circuit: The circuit to execute
        shots: Number of measurement shots
        use_simulator: If True, use IonQ simulator; otherwise use hardware
    """
    from ..ionq.client import get_job_result, submit_circuit

    # Submit the circuit to IonQ
    job_id = await submit_circuit(
        circuit_definition=circuit,
        shots=shots,
        use_simulator=use_simulator,
    )

    # Wait for results (with timeout)
    result = await get_job_result(job_id, timeout=120.0, poll_interval=1.0)

    if result is None:
        raise RuntimeError(f"IonQ job {job_id} timed out or failed")

    measurements = result["measurements"]
    counts = result["counts"]

    # Calculate probabilities
    total_shots = sum(counts.values())
    probabilities = {k: v / total_shots for k, v in counts.items()}

    return ExecutionResult(
        measurements=measurements,
        counts=counts,
        probabilities=probabilities,
        mode=ExecutionMode.SIMULATOR if use_simulator else ExecutionMode.HARDWARE,
        shots=shots,
        job_id=job_id,
    )


def execute_circuit_sync(
    circuit: QuantumCircuit,
    shots: int | None = None,
    mode: ExecutionMode | None = None,
) -> ExecutionResult:
    """Synchronous wrapper for execute_circuit.

    Useful for testing or non-async contexts.
    """
    return asyncio.run(execute_circuit(circuit, shots, mode))
