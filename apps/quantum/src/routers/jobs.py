"""Job status endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..ionq.client import get_job_result, get_job_status

router = APIRouter()


class JobStatusResponse(BaseModel):
    """Response containing job status."""

    job_id: str
    status: str
    message: str | None = None


class JobResultResponse(BaseModel):
    """Response containing job results."""

    job_id: str
    status: str
    measurements: list[int] | None = None
    probabilities: dict[str, float] | None = None
    error: str | None = None


@router.get("/{job_id}/status", response_model=JobStatusResponse)
async def check_job_status(job_id: str) -> JobStatusResponse:
    """
    Check the status of an IonQ job.

    Status values: pending, submitted, running, completed, failed
    """
    try:
        status = await get_job_status(job_id)
        return JobStatusResponse(
            job_id=job_id,
            status=status,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/{job_id}/result", response_model=JobResultResponse)
async def get_result(job_id: str) -> JobResultResponse:
    """
    Get the results of a completed IonQ job.

    Returns measurement counts and probability distribution.
    """
    try:
        result = await get_job_result(job_id)

        if result is None:
            return JobResultResponse(
                job_id=job_id,
                status="pending",
                error="Job not yet completed",
            )

        return JobResultResponse(
            job_id=job_id,
            status="completed",
            measurements=result.get("measurements"),
            probabilities=result.get("probabilities"),
        )
    except Exception as e:
        return JobResultResponse(
            job_id=job_id,
            status="failed",
            error=str(e),
        )
