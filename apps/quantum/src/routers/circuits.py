"""Circuit generation and execution endpoints."""

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..circuits import (
    CircuitNotFoundError,
    ExecutionMode,
    execute_circuit,
    get_circuit,
    get_circuit_for_rarity,
    get_execution_mode,
    list_circuits,
)
from ..config import settings
from ..ionq.client import circuit_to_base64

router = APIRouter()


# =============================================================================
# Request/Response Models
# =============================================================================


class CircuitInfo(BaseModel):
    """Information about a registered circuit type."""

    id: str
    name: str
    level: int
    qubit_count: int
    concept: str
    description: str
    min_rarity: float
    max_rarity: float


class ListCircuitsResponse(BaseModel):
    """Response listing all available circuits."""

    circuits: list[CircuitInfo]
    execution_mode: str


class GenerateRequest(BaseModel):
    """Request to generate a plant genome circuit."""

    seed: int
    circuit_id: str | None = None  # Specific circuit type (e.g., "superposition")
    rarity: float | None = None  # Auto-select based on plant rarity


class GenerateResponse(BaseModel):
    """Response containing generated circuit definition."""

    circuit_id: str
    circuit_definition: str  # Base64 encoded QPY format
    num_qubits: int
    level: int
    concept: str


class MeasureRequest(BaseModel):
    """Request to measure and resolve plant traits."""

    plant_id: str
    circuit_definition: str  # Base64 encoded QPY format
    circuit_id: str  # Which circuit type to use for mapping
    shots: int | None = None  # Override default shots


class MeasureResponse(BaseModel):
    """Response containing resolved traits from measurement."""

    plant_id: str
    success: bool
    traits: dict[str, Any] | None = None
    execution_mode: str | None = None
    error: str | None = None


class ExecuteRequest(BaseModel):
    """Request to execute a circuit (low-level API)."""

    circuit_definition: str  # Base64 encoded QPY format
    shots: int = 100
    mode: str | None = None  # "mock", "simulator", "hardware"


class ExecuteResponse(BaseModel):
    """Response from circuit execution."""

    success: bool
    measurements: list[int] | None = None
    counts: dict[str, int] | None = None
    probabilities: dict[str, float] | None = None
    execution_mode: str | None = None
    error: str | None = None


# =============================================================================
# Endpoints
# =============================================================================


@router.get("/", response_model=ListCircuitsResponse)
async def list_available_circuits() -> ListCircuitsResponse:
    """
    List all registered quantum circuits.

    Returns circuit metadata for each available type, sorted by complexity level.
    Useful for educational documentation and UI selection.
    """
    circuits = list_circuits()
    mode = get_execution_mode()

    return ListCircuitsResponse(
        circuits=[
            CircuitInfo(
                id=c.id,
                name=c.name,
                level=c.level,
                qubit_count=c.qubit_count,
                concept=c.concept,
                description=c.description,
                min_rarity=c.min_rarity,
                max_rarity=c.max_rarity,
            )
            for c in circuits
        ],
        execution_mode=mode.value,
    )


@router.get("/{circuit_id}", response_model=CircuitInfo)
async def get_circuit_info(circuit_id: str) -> CircuitInfo:
    """
    Get detailed information about a specific circuit type.

    Args:
        circuit_id: The circuit identifier (e.g., "superposition", "bell_pair")
    """
    try:
        circuit = get_circuit(circuit_id)
        meta = circuit.metadata
        return CircuitInfo(
            id=meta.id,
            name=meta.name,
            level=meta.level,
            qubit_count=meta.qubit_count,
            concept=meta.concept,
            description=meta.description,
            min_rarity=meta.min_rarity,
            max_rarity=meta.max_rarity,
        )
    except CircuitNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from None


@router.post("/generate", response_model=GenerateResponse)
async def generate_circuit(request: GenerateRequest) -> GenerateResponse:
    """
    Generate a quantum circuit for a plant genome.

    The circuit type can be specified by:
    1. circuit_id: Explicit circuit type (e.g., "superposition")
    2. rarity: Auto-select based on plant variant rarity

    If neither is provided, defaults to "variational" (Level 5).
    """
    # Select circuit type
    if request.circuit_id:
        try:
            circuit_instance = get_circuit(request.circuit_id)
        except CircuitNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e)) from None
    elif request.rarity is not None:
        circuit_instance = get_circuit_for_rarity(request.rarity)
    else:
        # Default to variational (most expressive)
        circuit_instance = get_circuit("variational")

    # Create the circuit with the given seed
    qc = circuit_instance.create(seed=request.seed)

    # Serialize circuit to base64 string for storage
    circuit_b64 = circuit_to_base64(qc)
    meta = circuit_instance.metadata

    return GenerateResponse(
        circuit_id=meta.id,
        circuit_definition=circuit_b64,
        num_qubits=qc.num_qubits,
        level=meta.level,
        concept=meta.concept,
    )


@router.post("/measure", response_model=MeasureResponse)
async def measure_plant(request: MeasureRequest) -> MeasureResponse:
    """
    Perform measurement on a plant's quantum circuit.

    This is the main endpoint for resolving plant traits from quantum circuits.
    It:
    1. Executes the circuit (using current execution mode)
    2. Maps measurements to visual traits using the circuit's mapper

    The execution mode (mock/simulator/hardware) is determined by configuration.
    """
    try:
        # Get the circuit instance for trait mapping
        try:
            circuit_instance = get_circuit(request.circuit_id)
        except CircuitNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e)) from None

        # Deserialize and execute the circuit
        from ..ionq.client import circuit_from_base64

        qc = circuit_from_base64(request.circuit_definition)

        # Execute using configured mode
        shots = request.shots or settings.default_shots
        result = await execute_circuit(qc, shots=shots)

        # Map measurements to visual traits using the circuit's mapper
        traits = circuit_instance.map_measurements(result.measurements)

        return MeasureResponse(
            plant_id=request.plant_id,
            success=True,
            traits=traits.to_dict(),
            execution_mode=result.mode.value,
        )

    except Exception as e:
        return MeasureResponse(
            plant_id=request.plant_id,
            success=False,
            error=str(e),
        )


@router.post("/execute", response_model=ExecuteResponse)
async def execute_circuit_endpoint(request: ExecuteRequest) -> ExecuteResponse:
    """
    Low-level circuit execution endpoint.

    Executes a circuit and returns raw measurement results without trait mapping.
    Useful for testing and debugging circuits.
    """
    try:
        from ..ionq.client import circuit_from_base64

        qc = circuit_from_base64(request.circuit_definition)

        # Determine execution mode
        mode = None
        if request.mode:
            mode = ExecutionMode(request.mode)

        result = await execute_circuit(qc, shots=request.shots, mode=mode)

        return ExecuteResponse(
            success=True,
            measurements=result.measurements,
            counts=result.counts,
            probabilities=result.probabilities,
            execution_mode=result.mode.value,
        )

    except Exception as e:
        return ExecuteResponse(
            success=False,
            error=str(e),
        )


@router.get("/pool")
async def get_quantum_pool() -> dict[str, Any]:
    """
    Get the pre-computed quantum result pool.

    Returns all pre-computed quantum measurement results for all circuit types.
    The pool is used for instant trait revelation during plant observation.
    """
    import json
    from pathlib import Path

    pool_path = Path(__file__).parent.parent / "data" / "quantum-pool.json"

    if not pool_path.exists():
        raise HTTPException(
            status_code=404,
            detail=(
                "Quantum pool not found. "
                "Run 'uv run python scripts/generate-quantum-pool.py' to generate it."
            ),
        )

    with open(pool_path) as f:
        pool: dict[str, Any] = json.load(f)

    return pool
