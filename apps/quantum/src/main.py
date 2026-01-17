"""
Quantum Garden - Quantum Service

FastAPI service for quantum circuit generation and IonQ execution.
Handles plant genome creation, entanglement groups, and measurement.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import circuits, health, jobs

app = FastAPI(
    title="Quantum Garden - Quantum Service",
    description="Quantum circuit service using Qiskit and IonQ",
    version="0.1.0",
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
