"""Circuit generation and execution endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..circuits.plant_genome import create_plant_circuit
from ..config import settings
from ..ionq.client import circuit_to_base64, get_job_result, submit_circuit
from ..mapping.traits import map_measurements_to_traits

router = APIRouter()


class GenerateRequest(BaseModel):
    """Request to generate a plant genome circuit."""

    seed: int
    num_traits: int = 5


class GenerateResponse(BaseModel):
    """Response containing generated circuit definition."""

    circuit_id: str
    circuit_definition: str  # Base64 encoded QPY format
    num_qubits: int


class ExecuteRequest(BaseModel):
    """Request to execute a circuit on IonQ."""

    circuit_definition: str  # Base64 encoded QPY format
    shots: int = 100


class ExecuteResponse(BaseModel):
    """Response containing IonQ job information."""

    job_id: str
    status: str


class MeasureRequest(BaseModel):
    """Request to measure and resolve plant traits."""

    plant_id: str
    circuit_definition: str  # Base64 encoded QPY format


class MeasureResponse(BaseModel):
    """Response containing resolved traits from measurement."""

    plant_id: str
    success: bool
    traits: dict[str, float] | None = None
    error: str | None = None


@router.post("/generate", response_model=GenerateResponse)
async def generate_circuit(request: GenerateRequest) -> GenerateResponse:
    """
    Generate a quantum circuit for a plant genome.

    The circuit encodes multiple possible traits in superposition,
    with entanglement relationships between related properties.
    """
    circuit = create_plant_circuit(
        seed=request.seed,
        num_traits=request.num_traits,
    )

    # Serialize circuit to base64 string for storage
    circuit_b64 = circuit_to_base64(circuit)

    return GenerateResponse(
        circuit_id=f"circuit_{request.seed}_{request.num_traits}",
        circuit_definition=circuit_b64,
        num_qubits=circuit.num_qubits,
    )


@router.post("/execute", response_model=ExecuteResponse)
async def execute_circuit(request: ExecuteRequest) -> ExecuteResponse:
    """
    Submit a circuit to IonQ for execution.

    Uses simulator if IONQ_USE_SIMULATOR is true, otherwise real hardware.
    """
    if not settings.ionq_api_key:
        raise HTTPException(
            status_code=503,
            detail="IonQ API key not configured",
        )

    job_id = await submit_circuit(
        circuit_definition=request.circuit_definition,
        shots=request.shots,
        use_simulator=settings.ionq_use_simulator,
    )

    return ExecuteResponse(
        job_id=job_id,
        status="submitted",
    )


@router.post("/measure", response_model=MeasureResponse)
async def measure_plant(request: MeasureRequest) -> MeasureResponse:
    """
    Perform measurement on a plant's quantum circuit.

    This is called when observation completes. It either:
    1. Uses cached results if the circuit was pre-executed
    2. Executes synchronously (for development/simulator)

    Returns resolved traits mapped from quantum measurements.
    """
    try:
        # For now, execute synchronously
        # In production, this would check for cached results first
        job_id = await submit_circuit(
            circuit_definition=request.circuit_definition,
            shots=settings.default_shots,
            use_simulator=settings.ionq_use_simulator,
        )

        # Get results (polling for completion)
        result = await get_job_result(job_id)

        if result is None:
            return MeasureResponse(
                plant_id=request.plant_id,
                success=False,
                error="Failed to get measurement results",
            )

        # Map measurements to visual traits
        traits = map_measurements_to_traits(result["measurements"])

        return MeasureResponse(
            plant_id=request.plant_id,
            success=True,
            traits=traits,
        )

    except Exception as e:
        return MeasureResponse(
            plant_id=request.plant_id,
            success=False,
            error=str(e),
        )
