"""Health check endpoints."""

from fastapi import APIRouter

from ..config import settings

router = APIRouter()


@router.get("/health")
async def health_check() -> dict[str, str | bool]:
    """
    Health check endpoint.

    Returns service status and configuration (without secrets).
    """
    return {
        "status": "healthy",
        "service": "quantum",
        "ionq_configured": bool(settings.ionq_api_key),
        "using_simulator": settings.ionq_use_simulator,
    }
