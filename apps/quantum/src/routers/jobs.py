"""Job management endpoints for async quantum execution."""

import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..circuits import get_circuit, get_circuit_for_rarity, get_execution_mode
from ..config import settings
from ..ionq.client import circuit_to_base64
from ..jobs import JobStatus
from ..jobs.worker import get_job_store, get_job_worker

router = APIRouter()


# =============================================================================
# Request/Response Models
# =============================================================================


class SubmitJobRequest(BaseModel):
    """Request to submit a quantum measurement job."""

    plant_id: str
    circuit_id: str | None = None  # Specific circuit type
    rarity: float | None = None  # Auto-select based on rarity
    seed: int
    shots: int | None = None


class SubmitJobResponse(BaseModel):
    """Response from submitting a job."""

    job_id: str
    status: str
    circuit_id: str
    execution_mode: str


class JobStatusResponse(BaseModel):
    """Response with job status and results."""

    job_id: str
    plant_id: str
    circuit_id: str
    status: str
    created_at: str
    submitted_at: str | None = None
    completed_at: str | None = None
    execution_mode: str | None = None
    traits: dict[str, Any] | None = None
    error: str | None = None


class JobStatsResponse(BaseModel):
    """Job queue statistics."""

    pending: int
    submitted: int
    running: int
    completed: int
    failed: int
    timeout: int
    total: int
    execution_mode: str


# =============================================================================
# Endpoints
# =============================================================================


@router.post("/submit", response_model=SubmitJobResponse)
async def submit_job(request: SubmitJobRequest) -> SubmitJobResponse:
    """
    Submit a quantum measurement job.

    The job is added to the queue and will be processed by the background worker.
    For MOCK mode, execution happens synchronously.

    Returns immediately with a job ID that can be used to check status.
    """
    # Select circuit based on circuit_id or rarity
    if request.circuit_id:
        circuit_instance = get_circuit(request.circuit_id)
    elif request.rarity is not None:
        circuit_instance = get_circuit_for_rarity(request.rarity)
    else:
        circuit_instance = get_circuit("variational")

    # Generate the circuit
    qc = circuit_instance.create(seed=request.seed)
    circuit_b64 = circuit_to_base64(qc)

    # Create job
    job_id = str(uuid.uuid4())
    shots = request.shots or settings.default_shots

    store = get_job_store()
    job = store.create_job(
        job_id=job_id,
        plant_id=request.plant_id,
        circuit_id=circuit_instance.metadata.id,
        circuit_definition=circuit_b64,
        shots=shots,
    )

    # For MOCK mode, process immediately for instant results
    mode = get_execution_mode()
    if mode.value == "mock":
        worker = get_job_worker()
        await worker.process_single_job(job_id)
        updated_job = store.get_job(job_id)
        status = updated_job.status.value if updated_job else "pending"
    else:
        status = job.status.value

    return SubmitJobResponse(
        job_id=job_id,
        status=status,
        circuit_id=circuit_instance.metadata.id,
        execution_mode=mode.value,
    )


@router.get("/{job_id}", response_model=JobStatusResponse)
async def get_job_status_endpoint(job_id: str) -> JobStatusResponse:
    """
    Get the status and results of a job.

    Poll this endpoint to check if a job has completed.
    Once status is 'completed', the traits field will contain resolved plant traits.
    """
    store = get_job_store()
    job = store.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    return JobStatusResponse(
        job_id=job.id,
        plant_id=job.plant_id,
        circuit_id=job.circuit_id,
        status=job.status.value,
        created_at=job.created_at,
        submitted_at=job.submitted_at,
        completed_at=job.completed_at,
        execution_mode=job.execution_mode,
        traits=job.traits,
        error=job.error,
    )


@router.get("/{job_id}/wait", response_model=JobStatusResponse)
async def wait_for_job(job_id: str, timeout: float = 30.0) -> JobStatusResponse:
    """
    Wait for a job to complete.

    Blocks until the job completes or times out.
    Useful for synchronous-style API usage.

    Args:
        job_id: The job ID to wait for
        timeout: Maximum seconds to wait (default 30, max 120)
    """
    timeout = min(timeout, 120.0)  # Cap at 2 minutes

    store = get_job_store()
    job = store.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    if job.status not in (JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.TIMEOUT):
        worker = get_job_worker()
        job = await worker.wait_for_job(job_id, timeout=timeout)

    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    return JobStatusResponse(
        job_id=job.id,
        plant_id=job.plant_id,
        circuit_id=job.circuit_id,
        status=job.status.value,
        created_at=job.created_at,
        submitted_at=job.submitted_at,
        completed_at=job.completed_at,
        execution_mode=job.execution_mode,
        traits=job.traits,
        error=job.error,
    )


@router.get("/plant/{plant_id}", response_model=JobStatusResponse | None)
async def get_job_by_plant(plant_id: str) -> JobStatusResponse | None:
    """
    Get the most recent job for a plant.

    Useful for checking if a plant has pending measurement.
    """
    store = get_job_store()
    job = store.get_job_by_plant_id(plant_id)

    if not job:
        return None

    return JobStatusResponse(
        job_id=job.id,
        plant_id=job.plant_id,
        circuit_id=job.circuit_id,
        status=job.status.value,
        created_at=job.created_at,
        submitted_at=job.submitted_at,
        completed_at=job.completed_at,
        execution_mode=job.execution_mode,
        traits=job.traits,
        error=job.error,
    )


@router.get("/", response_model=JobStatsResponse)
async def get_job_stats() -> JobStatsResponse:
    """
    Get job queue statistics.

    Useful for monitoring the job queue health.
    """
    store = get_job_store()
    stats = store.get_stats()
    mode = get_execution_mode()

    return JobStatsResponse(
        pending=stats.get("pending", 0),
        submitted=stats.get("submitted", 0),
        running=stats.get("running", 0),
        completed=stats.get("completed", 0),
        failed=stats.get("failed", 0),
        timeout=stats.get("timeout", 0),
        total=stats.get("total", 0),
        execution_mode=mode.value,
    )


@router.delete("/cleanup")
async def cleanup_old_jobs(max_age_hours: int = 24) -> dict[str, int]:
    """
    Clean up old completed/failed jobs.

    Args:
        max_age_hours: Remove jobs older than this (default 24 hours)
    """
    store = get_job_store()
    removed = store.cleanup_old_jobs(max_age_hours)
    return {"removed": removed}
