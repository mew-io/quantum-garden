"""
IonQ API client for quantum circuit execution.

Uses qiskit-ionq for seamless integration with IonQ hardware
and simulators.
"""

import asyncio
import base64
import io
from typing import Any

from qiskit import QuantumCircuit, qpy
from qiskit_ionq import IonQProvider

from ..config import settings

# Cache the provider instance
_provider: IonQProvider | None = None


def get_provider() -> IonQProvider:
    """Get or create the IonQ provider instance."""
    global _provider
    if _provider is None:
        _provider = IonQProvider(token=settings.ionq_api_key)
    return _provider


def circuit_to_bytes(circuit: QuantumCircuit) -> bytes:
    """Serialize a QuantumCircuit to bytes using QPY format."""
    buffer = io.BytesIO()
    qpy.dump(circuit, buffer)
    return buffer.getvalue()


def circuit_from_bytes(data: bytes) -> QuantumCircuit:
    """Deserialize a QuantumCircuit from QPY bytes."""
    buffer = io.BytesIO(data)
    circuits = qpy.load(buffer)
    return circuits[0]


def circuit_to_base64(circuit: QuantumCircuit) -> str:
    """Serialize a QuantumCircuit to base64 string for JSON storage."""
    return base64.b64encode(circuit_to_bytes(circuit)).decode("utf-8")


def circuit_from_base64(data: str) -> QuantumCircuit:
    """Deserialize a QuantumCircuit from base64 string."""
    return circuit_from_bytes(base64.b64decode(data))


async def submit_circuit(
    circuit_definition: str | QuantumCircuit,
    shots: int = 100,
    use_simulator: bool = True,
) -> str:
    """
    Submit a quantum circuit to IonQ.

    Args:
        circuit_definition: Circuit as base64 string or QuantumCircuit object
        shots: Number of measurement shots
        use_simulator: If True, use IonQ simulator; otherwise use hardware

    Returns:
        Job ID for tracking the execution
    """
    # Handle both base64 string and QuantumCircuit inputs
    if isinstance(circuit_definition, str):
        circuit = circuit_from_base64(circuit_definition)
    else:
        circuit = circuit_definition

    # Get backend
    provider = get_provider()
    backend_name = "ionq_simulator" if use_simulator else "ionq_qpu"
    backend = provider.get_backend(backend_name)

    # Submit job
    # Run in executor to avoid blocking the event loop
    loop = asyncio.get_event_loop()
    job = await loop.run_in_executor(
        None,
        lambda: backend.run(circuit, shots=shots),
    )

    return job.job_id()


async def get_job_status(job_id: str) -> str:
    """
    Get the current status of an IonQ job.

    Returns: Status string (pending, running, completed, failed, cancelled)
    """
    provider = get_provider()

    # Get job from provider
    loop = asyncio.get_event_loop()
    job = await loop.run_in_executor(
        None,
        lambda: provider.get_backend("ionq_simulator").retrieve_job(job_id),
    )

    status = job.status()
    return status.name.lower()


async def get_job_result(
    job_id: str,
    timeout: float = 60.0,
    poll_interval: float = 1.0,
) -> dict[str, Any] | None:
    """
    Get results from a completed IonQ job.

    Polls until the job completes or times out.

    Args:
        job_id: IonQ job ID
        timeout: Maximum time to wait in seconds
        poll_interval: Time between status checks

    Returns:
        Dictionary with measurements and probabilities, or None if not ready
    """
    provider = get_provider()

    loop = asyncio.get_event_loop()
    job = await loop.run_in_executor(
        None,
        lambda: provider.get_backend("ionq_simulator").retrieve_job(job_id),
    )

    # Wait for completion
    elapsed = 0.0
    while elapsed < timeout:
        status = job.status().name.lower()

        if status == "done":
            # Get results
            result = await loop.run_in_executor(None, job.result)
            counts = result.get_counts()

            # Convert counts to measurements list and probabilities
            total_shots = sum(counts.values())
            measurements = []
            probabilities = {}

            for bitstring, count in counts.items():
                # Convert bitstring to integer
                value = int(bitstring, 2)
                measurements.extend([value] * count)
                probabilities[bitstring] = count / total_shots

            return {
                "measurements": measurements,
                "probabilities": probabilities,
                "counts": counts,
            }

        if status in ("error", "cancelled"):
            return None

        await asyncio.sleep(poll_interval)
        elapsed += poll_interval

    return None
