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


@router.get("/config")
async def get_config() -> dict[str, str | bool | int]:
    """
    Get quantum service configuration.

    Returns current execution mode and circuit defaults.
    Useful for debugging and status monitoring.
    """
    # Determine execution mode
    if settings.ionq_api_key and settings.ionq_use_simulator:
        execution_mode = "simulator"
    elif settings.ionq_api_key and not settings.ionq_use_simulator:
        execution_mode = "hardware"
    else:
        execution_mode = "mock"

    return {
        "execution_mode": execution_mode,
        "ionq_api_key_configured": bool(settings.ionq_api_key),
        "ionq_use_simulator": settings.ionq_use_simulator,
        "default_trait_qubits": settings.default_trait_qubits,
        "default_shots": settings.default_shots,
        "service_port": settings.port,
        "debug_mode": settings.debug,
    }
