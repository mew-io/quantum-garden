"""
Quantum Garden - Quantum Service

FastAPI service for quantum circuit generation and IonQ execution.
Handles plant genome creation, entanglement groups, and measurement.
"""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .jobs.worker import get_job_worker
from .routers import circuits, health, jobs

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Manage application lifecycle - start/stop background worker."""
    # Log execution mode on startup
    execution_mode = "IonQ Simulator" if settings.ionq_use_simulator else "Mock Mode"
    api_key_status = "configured" if settings.ionq_api_key else "not configured"
    logger.info(f"Quantum execution mode: {execution_mode} (API key: {api_key_status})")

    # Startup: Start the job worker
    worker = get_job_worker()
    await worker.start()
    logger.info("Quantum service started with background job worker")

    yield

    # Shutdown: Stop the job worker
    await worker.stop()
    logger.info("Quantum service shutdown complete")


app = FastAPI(
    title="Quantum Garden - Quantum Service",
    description="Quantum circuit service using Qiskit and IonQ",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configuration for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:14923"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(circuits.router, prefix="/circuits", tags=["circuits"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint with service info."""
    return {
        "service": "Quantum Garden - Quantum Service",
        "version": "0.1.0",
        "status": "running",
    }


def start() -> None:
    """Entry point for the quantum-garden command."""
    import uvicorn

    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.debug,
    )


if __name__ == "__main__":
    start()
