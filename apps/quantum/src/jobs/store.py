"""
JSON-based job store for quantum circuit execution.

Persists job state to a JSON file for durability across restarts.
Thread-safe for concurrent access.
"""

import json
import threading
from dataclasses import asdict, dataclass
from datetime import datetime
from enum import StrEnum
from pathlib import Path
from typing import Any


class JobStatus(StrEnum):
    """Status of a quantum job."""

    PENDING = "pending"  # Created, not yet submitted to IonQ
    SUBMITTED = "submitted"  # Submitted to IonQ, waiting in queue
    RUNNING = "running"  # Currently executing on IonQ
    COMPLETED = "completed"  # Execution finished, results available
    FAILED = "failed"  # Execution failed
    TIMEOUT = "timeout"  # Polling timed out


@dataclass
class QuantumJob:
    """A quantum circuit execution job."""

    id: str  # Internal job ID
    plant_id: str  # Associated plant ID
    circuit_id: str  # Circuit type (e.g., "superposition", "bell_pair")
    circuit_definition: str  # Base64 encoded circuit
    shots: int
    status: JobStatus
    created_at: str  # ISO format timestamp
    ionq_job_id: str | None = None  # IonQ's job ID after submission
    submitted_at: str | None = None
    completed_at: str | None = None
    measurements: list[int] | None = None
    counts: dict[str, int] | None = None
    traits: dict[str, Any] | None = None  # Resolved traits after mapping
    error: str | None = None
    execution_mode: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        data = asdict(self)
        data["status"] = self.status.value
        return data

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "QuantumJob":
        """Create from dictionary."""
        data["status"] = JobStatus(data["status"])
        return cls(**data)


class JobStore:
    """
    Thread-safe JSON-based job store.

    Stores jobs in a JSON file for persistence across restarts.
    Uses file locking for concurrent access safety.
    """

    def __init__(self, store_path: str | Path | None = None):
        """Initialize the job store.

        Args:
            store_path: Path to JSON file. Defaults to ./data/jobs.json
        """
        if store_path is None:
            store_path = Path(__file__).parent.parent.parent / "data" / "jobs.json"
        self.store_path = Path(store_path)
        self._lock = threading.RLock()
        self._ensure_store_exists()

    def _ensure_store_exists(self) -> None:
        """Create store file and directory if they don't exist."""
        self.store_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.store_path.exists():
            self._write_store({"jobs": {}})

    def _read_store(self) -> dict[str, Any]:
        """Read the store from disk."""
        with open(self.store_path) as f:
            data: dict[str, Any] = json.load(f)
            return data

    def _write_store(self, data: dict[str, Any]) -> None:
        """Write the store to disk."""
        with open(self.store_path, "w") as f:
            json.dump(data, f, indent=2)

    def create_job(
        self,
        job_id: str,
        plant_id: str,
        circuit_id: str,
        circuit_definition: str,
        shots: int,
    ) -> QuantumJob:
        """Create a new job in pending state."""
        job = QuantumJob(
            id=job_id,
            plant_id=plant_id,
            circuit_id=circuit_id,
            circuit_definition=circuit_definition,
            shots=shots,
            status=JobStatus.PENDING,
            created_at=datetime.utcnow().isoformat(),
        )

        with self._lock:
            store = self._read_store()
            store["jobs"][job_id] = job.to_dict()
            self._write_store(store)

        return job

    def get_job(self, job_id: str) -> QuantumJob | None:
        """Get a job by ID."""
        with self._lock:
            store = self._read_store()
            job_data = store["jobs"].get(job_id)
            if job_data:
                return QuantumJob.from_dict(job_data)
            return None

    def update_job(self, job: QuantumJob) -> None:
        """Update a job in the store."""
        with self._lock:
            store = self._read_store()
            store["jobs"][job.id] = job.to_dict()
            self._write_store(store)

    def get_pending_jobs(self) -> list[QuantumJob]:
        """Get all jobs that need processing (pending or submitted)."""
        active_statuses = (JobStatus.PENDING, JobStatus.SUBMITTED, JobStatus.RUNNING)
        with self._lock:
            store = self._read_store()
            jobs = []
            for job_data in store["jobs"].values():
                job = QuantumJob.from_dict(job_data)
                if job.status in active_statuses:
                    jobs.append(job)
            return jobs

    def get_jobs_by_status(self, status: JobStatus) -> list[QuantumJob]:
        """Get all jobs with a specific status."""
        with self._lock:
            store = self._read_store()
            jobs = []
            for job_data in store["jobs"].values():
                job = QuantumJob.from_dict(job_data)
                if job.status == status:
                    jobs.append(job)
            return jobs

    def get_job_by_plant_id(self, plant_id: str) -> QuantumJob | None:
        """Get the most recent job for a plant."""
        with self._lock:
            store = self._read_store()
            # Find most recent job for this plant
            plant_jobs = [
                QuantumJob.from_dict(j)
                for j in store["jobs"].values()
                if j["plant_id"] == plant_id
            ]
            if not plant_jobs:
                return None
            # Sort by created_at descending
            plant_jobs.sort(key=lambda j: j.created_at, reverse=True)
            return plant_jobs[0]

    def cleanup_old_jobs(self, max_age_hours: int = 24) -> int:
        """Remove completed/failed jobs older than max_age_hours.

        Returns number of jobs removed.
        """
        from datetime import timedelta

        cutoff = datetime.utcnow() - timedelta(hours=max_age_hours)
        removed = 0

        with self._lock:
            store = self._read_store()
            to_remove = []

            terminal = (JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.TIMEOUT)
            for job_id, job_data in store["jobs"].items():
                job = QuantumJob.from_dict(job_data)
                if job.status in terminal:
                    created = datetime.fromisoformat(job.created_at)
                    if created < cutoff:
                        to_remove.append(job_id)

            for job_id in to_remove:
                del store["jobs"][job_id]
                removed += 1

            if removed > 0:
                self._write_store(store)

        return removed

    def get_stats(self) -> dict[str, int]:
        """Get job count statistics by status."""
        with self._lock:
            store = self._read_store()
            stats = {status.value: 0 for status in JobStatus}
            for job_data in store["jobs"].values():
                status = job_data["status"]
                stats[status] = stats.get(status, 0) + 1
            stats["total"] = len(store["jobs"])
            return stats
