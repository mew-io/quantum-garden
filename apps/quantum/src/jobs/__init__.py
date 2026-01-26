"""
Async job management for IonQ quantum circuit execution.

This module provides:
- JSON-based job persistence (for development/simple deployments)
- Background worker for polling IonQ job status
- Job submission and retrieval API

For production, consider migrating to Redis or a proper message queue.
"""

from .store import JobStatus, JobStore, QuantumJob
from .worker import JobWorker

__all__ = [
    "JobStore",
    "JobWorker",
    "QuantumJob",
    "JobStatus",
]
