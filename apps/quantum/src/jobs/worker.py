"""
Background worker for processing quantum jobs.

Handles:
- Submitting pending jobs to IonQ
- Polling submitted jobs for completion
- Mapping completed measurements to traits
"""

import asyncio
import logging
from datetime import datetime

from ..circuits import ExecutionMode, get_circuit, get_execution_mode
from .store import JobStatus, JobStore, QuantumJob

logger = logging.getLogger(__name__)


class JobWorker:
    """
    Background worker for processing quantum circuit jobs.

    Runs as an async task that:
    1. Picks up PENDING jobs and submits them to IonQ
    2. Polls SUBMITTED/RUNNING jobs for completion
    3. Maps completed measurements to plant traits
    """

    def __init__(
        self,
        store: JobStore,
        poll_interval: float = 2.0,
        job_timeout: float = 300.0,  # 5 minutes for simulator
        hardware_timeout: float = 7200.0,  # 2 hours for hardware
    ):
        """Initialize the worker.

        Args:
            store: Job store instance
            poll_interval: Seconds between polling cycles
            job_timeout: Max seconds to wait for simulator jobs
            hardware_timeout: Max seconds to wait for hardware jobs
        """
        self.store = store
        self.poll_interval = poll_interval
        self.job_timeout = job_timeout
        self.hardware_timeout = hardware_timeout
        self._running = False
        self._task: asyncio.Task[None] | None = None

    async def start(self) -> None:
        """Start the background worker."""
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info("Job worker started")

    async def stop(self) -> None:
        """Stop the background worker."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Job worker stopped")

    async def _run_loop(self) -> None:
        """Main worker loop."""
        while self._running:
            try:
                await self._process_jobs()
            except Exception as e:
                logger.error(f"Error in job worker loop: {e}")

            await asyncio.sleep(self.poll_interval)

    async def _process_jobs(self) -> None:
        """Process all pending and submitted jobs."""
        jobs = self.store.get_pending_jobs()

        for job in jobs:
            try:
                if job.status == JobStatus.PENDING:
                    await self._submit_job(job)
                elif job.status in (JobStatus.SUBMITTED, JobStatus.RUNNING):
                    await self._check_job(job)
            except Exception as e:
                logger.error(f"Error processing job {job.id}: {e}")
                job.status = JobStatus.FAILED
                job.error = str(e)
                self.store.update_job(job)

    async def _submit_job(self, job: QuantumJob) -> None:
        """Submit a pending job to IonQ."""
        from ..ionq.client import circuit_from_base64, submit_circuit

        mode = get_execution_mode()

        # For MOCK mode, execute immediately
        if mode == ExecutionMode.MOCK:
            await self._execute_mock(job)
            return

        # Submit to IonQ
        circuit = circuit_from_base64(job.circuit_definition)
        use_simulator = mode == ExecutionMode.SIMULATOR

        logger.info(f"Submitting job {job.id} to IonQ (simulator={use_simulator})")

        ionq_job_id = await submit_circuit(
            circuit_definition=circuit,
            shots=job.shots,
            use_simulator=use_simulator,
        )

        job.ionq_job_id = ionq_job_id
        job.status = JobStatus.SUBMITTED
        job.submitted_at = datetime.utcnow().isoformat()
        job.execution_mode = mode.value
        self.store.update_job(job)

        logger.info(f"Job {job.id} submitted as IonQ job {ionq_job_id}")

    async def _execute_mock(self, job: QuantumJob) -> None:
        """Execute job using local mock simulator."""
        from ..circuits import execute_circuit
        from ..ionq.client import circuit_from_base64

        logger.info(f"Executing job {job.id} in MOCK mode")

        circuit = circuit_from_base64(job.circuit_definition)
        result = await execute_circuit(
            circuit, shots=job.shots, mode=ExecutionMode.MOCK
        )

        # Map measurements to traits
        circuit_instance = get_circuit(job.circuit_id)
        traits = circuit_instance.map_measurements(result.measurements)

        job.status = JobStatus.COMPLETED
        job.completed_at = datetime.utcnow().isoformat()
        job.measurements = result.measurements
        job.counts = result.counts
        job.traits = traits.to_dict()
        job.execution_mode = ExecutionMode.MOCK.value
        self.store.update_job(job)

        logger.info(f"Job {job.id} completed (MOCK)")

    async def _check_job(self, job: QuantumJob) -> None:
        """Check status of a submitted IonQ job."""
        from ..ionq.client import get_job_status

        if not job.ionq_job_id:
            job.status = JobStatus.FAILED
            job.error = "No IonQ job ID"
            self.store.update_job(job)
            return

        # Check for timeout
        if job.submitted_at:
            submitted = datetime.fromisoformat(job.submitted_at)
            elapsed = (datetime.utcnow() - submitted).total_seconds()
            timeout = (
                self.hardware_timeout
                if job.execution_mode == "hardware"
                else self.job_timeout
            )
            if elapsed > timeout:
                logger.warning(f"Job {job.id} timed out after {elapsed:.0f}s")
                job.status = JobStatus.TIMEOUT
                job.error = f"Job timed out after {elapsed:.0f} seconds"
                self.store.update_job(job)
                return

        # Get current status from IonQ
        status = await get_job_status(job.ionq_job_id)

        if status == "done":
            await self._complete_job(job)
        elif status in ("error", "cancelled"):
            job.status = JobStatus.FAILED
            job.error = f"IonQ job {status}"
            self.store.update_job(job)
            logger.error(f"Job {job.id} failed: {status}")
        elif status == "running":
            if job.status != JobStatus.RUNNING:
                job.status = JobStatus.RUNNING
                self.store.update_job(job)
                logger.info(f"Job {job.id} is now running on IonQ")

    async def _complete_job(self, job: QuantumJob) -> None:
        """Process a completed IonQ job."""
        from ..ionq.client import get_provider

        logger.info(f"Job {job.id} completed on IonQ, fetching results")

        # Retrieve results
        provider = get_provider()
        loop = asyncio.get_event_loop()

        backend = provider.get_backend("ionq_simulator")
        ionq_job_id = job.ionq_job_id  # Capture for lambda
        assert ionq_job_id is not None  # Already checked above
        ionq_job = await loop.run_in_executor(
            None,
            lambda: backend.retrieve_job(ionq_job_id),
        )

        result = await loop.run_in_executor(None, ionq_job.result)
        counts = result.get_counts()

        # Convert counts to measurements
        measurements = []
        for bitstring, count in counts.items():
            value = int(bitstring, 2)
            measurements.extend([value] * count)

        # Map measurements to traits
        circuit_instance = get_circuit(job.circuit_id)
        traits = circuit_instance.map_measurements(measurements)

        # Update job
        job.status = JobStatus.COMPLETED
        job.completed_at = datetime.utcnow().isoformat()
        job.measurements = measurements
        job.counts = dict(counts)
        job.traits = traits.to_dict()
        self.store.update_job(job)

        logger.info(f"Job {job.id} results processed, traits resolved")

    async def process_single_job(self, job_id: str) -> QuantumJob | None:
        """Process a single job immediately (for testing/debugging).

        Returns the updated job, or None if not found.
        """
        job = self.store.get_job(job_id)
        if not job:
            return None

        if job.status == JobStatus.PENDING:
            await self._submit_job(job)
        elif job.status in (JobStatus.SUBMITTED, JobStatus.RUNNING):
            await self._check_job(job)

        return self.store.get_job(job_id)

    async def wait_for_job(
        self,
        job_id: str,
        timeout: float | None = None,
        poll_interval: float = 1.0,
    ) -> QuantumJob | None:
        """Wait for a job to complete.

        Useful for synchronous-style API calls that want to wait for results.

        Args:
            job_id: Job ID to wait for
            timeout: Max seconds to wait (default: self.job_timeout)
            poll_interval: Seconds between status checks

        Returns:
            Completed job, or None if timeout/error
        """
        if timeout is None:
            timeout = self.job_timeout

        elapsed = 0.0
        while elapsed < timeout:
            job = self.store.get_job(job_id)
            if not job:
                return None

            if job.status == JobStatus.COMPLETED:
                return job

            if job.status in (JobStatus.FAILED, JobStatus.TIMEOUT):
                return job

            await asyncio.sleep(poll_interval)
            elapsed += poll_interval

        # Timeout
        job = self.store.get_job(job_id)
        if job and job.status not in (JobStatus.COMPLETED, JobStatus.FAILED):
            job.status = JobStatus.TIMEOUT
            job.error = f"Wait timed out after {timeout} seconds"
            self.store.update_job(job)

        return job


# Global worker instance
_worker: JobWorker | None = None
_store: JobStore | None = None


def get_job_store() -> JobStore:
    """Get the global job store instance."""
    global _store
    if _store is None:
        _store = JobStore()
    return _store


def get_job_worker() -> JobWorker:
    """Get the global job worker instance."""
    global _worker
    if _worker is None:
        _worker = JobWorker(get_job_store())
    return _worker
