# Session Archive: Quantum Job Pre-computation at Plant Creation

**Date**: 2026-01-27
**Synthesis Commit**: (will be filled after commit)

---

## Session Summary

Successfully implemented Sprint 2, Task 2.1, activating real quantum integration by modifying the garden seeding process to submit quantum jobs to IonQ during plant creation. This transforms the quantum garden from concept to functional reality, with background job processing and graceful degradation when quantum service is unavailable.

## Work Completed

- Modified seed script to submit quantum jobs via `/jobs/submit` endpoint after plant creation
- Implemented job ID storage in QuantumRecord table with status progression
- Added support for entangled plant job submission using synthetic plant IDs
- Enhanced logging to show job IDs (truncated) or "mock mode" indicator
- Ensured graceful degradation when quantum service unavailable
- All quality checks passing (TypeScript, ESLint, Prettier)

## Code Changes

| Area                              | Change                                                                     |
| --------------------------------- | -------------------------------------------------------------------------- |
| `apps/web/scripts/seed-garden.ts` | Added `submitQuantumJob()` function to submit jobs via quantum service API |
| `apps/web/scripts/seed-garden.ts` | Modified plant creation workflow to submit jobs after plant record created |
| `apps/web/scripts/seed-garden.ts` | Updated entanglement group creation to submit jobs for shared circuits     |
| `apps/web/scripts/seed-garden.ts` | Enhanced logging with job IDs and execution mode indicators                |

## Decisions Made

1. **Create plant before submitting job**:
   - Rationale: Need real plant ID to associate with job submission
   - Benefit: Job processing can look up plant by ID when completing
   - Alternative considered: Submit job first, but this would require pre-generating IDs

2. **Store job ID in QuantumRecord, not Plant**:
   - Rationale: Job is tied to the quantum circuit, not the plant directly
   - Benefit: Entangled plants can share one circuit with one job
   - Aligns with existing schema design

3. **Synthetic plant IDs for entanglement groups**:
   - Rationale: Jobs API expects a plant_id, but entangled circuits serve multiple plants
   - Solution: Use `entangled-${i}` as synthetic ID for job submission
   - Note: Background worker will need to handle these special IDs when processing results

4. **Status progression model**:
   - "pending": QuantumRecord created, no job submitted yet
   - "submitted": Job submitted to IonQ queue
   - "running": Job executing on quantum hardware (set by worker)
   - "completed": Results ready (set by worker)
   - Clear state machine ensures predictable behavior

5. **Graceful degradation approach**:
   - If quantum service unavailable during seeding, proceed without job ID
   - Seed script succeeds in both quantum-enabled and mock modes
   - Maintains user experience consistency regardless of backend state

## Implementation Details

### Job Submission Workflow

For each plant:

1. Generate quantum circuit definition via `/circuits/generate` endpoint
2. Create plant and QuantumRecord in database (status: "pending")
3. Submit quantum job via `POST /jobs/submit` (payload: `{ plant_id, circuit_id, seed, shots: 100 }`)
4. Receive response with `{ job_id, status, circuit_id, execution_mode }`
5. Update QuantumRecord with job ID and change status to "submitted"

For entangled plants:

1. Generate shared Bell pair circuit
2. Create both plants and shared QuantumRecord
3. Submit job using synthetic plant ID (`entangled-${i}`)
4. Update shared QuantumRecord with job ID
5. Both plants reference the same QuantumRecord

### Error Handling

- **Network timeout**: 10-second timeout on job submission requests
- **Service unavailable**: Falls back to mock mode gracefully
- **HTTP errors**: Logs warning and proceeds without job ID
- **Partial failures**: If some jobs submit but others fail, seed script completes successfully

### Testing Prerequisites

To test with real quantum integration:

1. IonQ API key configured in `apps/quantum/.env`
2. Quantum service running: `cd apps/quantum && uv run uvicorn src.main:app --port 18742`
3. Background worker active (starts with quantum service)
4. Run: `pnpm db:seed`
5. Verify job IDs appear in console output
6. Check debug panel shows jobs in queue
7. Monitor background worker processing jobs
8. Confirm QuantumRecords update with results

## Issues Encountered

None - the integration was straightforward due to excellent groundwork from previous loops:

- Job queue API already existed and was well-designed
- Database schema already supported job IDs
- Background worker already implemented
- Only needed to connect seed script to existing infrastructure

## Quality Checks

- **TypeScript**: ✅ PASS - No type errors
- **ESLint**: ✅ PASS - No linting issues
- **Prettier**: ✅ PASS - All files formatted correctly
- **Python Tests**: N/A (script changes only, no Python changes)

## Next Session Priorities

1. **Task 2.2: Observation Reveals Pre-Computed Traits** (HIGH PRIORITY)
   - Update observation router to check quantum job status
   - Handle "waiting for quantum" state when job not yet complete
   - Display progress indicator when computation pending
   - Fall back to mock traits if job fails after retries
   - This completes the quantum integration loop

2. **Manual Testing with IonQ Simulator** (MEDIUM PRIORITY)
   - Set up IonQ API key in quantum service
   - Run full seed-to-observation workflow
   - Verify jobs submit, process, and complete successfully
   - Confirm traits appear correctly after quantum computation
   - Document any issues or edge cases discovered

3. **Sprint 3: Time-Travel Experience** (NEXT SPRINT)
   - Historical state API for garden evolution
   - Time-travel UI component with scrubber
   - Integration into garden scene
   - Creates compelling "wow" moment for users

---

_This archive preserves the detailed session context. For current project state, see [TASKS.md](../../../TASKS.md)._
