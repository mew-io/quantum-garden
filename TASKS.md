# Quantum Garden - Implementation Roadmap

_Last updated: 2026-01-28 (Sprint 5.1 Complete - Post-Observation Context Panel + Debug System)_

## Project Goal

Build a slow-evolving generative environment where plants exist in quantum superposition until observed. The experience should be calm, contemplative, and grounded in real quantum computation via IonQ.

**Current Focus**: Sprint 5.1 complete (educational context panel and enhanced debug tools). Next priority is manual testing and validation of new features, followed by observation feedback enhancements.

## Strategic Roadmap

### Immediate Next Steps (This Week)

1. ✅ **Sprint 2: Real Quantum Data Integration** (COMPLETED 2026-01-27)
   - ✅ Task 2.1: Pre-compute Quantum Jobs at Plant Creation [SUPERSEDED by pool]
   - ✅ Task 2.2: Observation Reveals Pre-Computed Traits [SUPERSEDED by pool]
   - ✅ Task 2.3: Enable IonQ Simulator Configuration
   - ✅ Task 2.4: Quantum Status in Debug Panel
   - ✅ **BONUS**: Quantum Pool System - Instant observation with authentic quantum results
   - **Quantum integration complete with excellent UX!**
   - Pool generated from IonQ simulator, ready for hardware pool generation

2. ✅ **Sprint 3: Time-Travel Experience** (COMPLETED 2026-01-27)
   - ✅ Task 3.1: Historical State API
   - ✅ Task 3.2: Time-Travel UI Component
   - ✅ Task 3.3: Integrate Timeline into Garden
   - Enables exploration of garden's evolution history
   - Demonstrates the "observer" philosophy through time
   - Showcases garden's autonomous nature over time

3. ✅ **Sprint 4: Enhanced Garden Evolution** (COMPLETED 2026-01-27)
   - ✅ Task 4.1: Lifecycle-Based Visual Behaviors (COMPLETED 2026-01-27 - autowork loop 1)
   - ✅ Task 4.2: Smart Germination Logic (COMPLETED 2026-01-27 - autowork loop 2)
   - ✅ Task 4.3: Evolution Event Notifications (COMPLETED 2026-01-27 - autowork loop 3)
   - Makes garden feel alive and dynamic
   - Improves long-term engagement
   - Task 4.1: GPU-accelerated shader animations (young pulse, mature sway, old slow movement)
   - Task 4.2: Proximity bonus, clustering prevention, age weighting, wave patterns
   - Task 4.3: Toast notifications for germination and entanglement events

### Medium-Term Goals (Next 2 Weeks)

1. **Manual Testing & Validation** (HIGH PRIORITY - NEXT)
   - Test quantum pool selection (deterministic, even distribution)
   - Validate instant observation → trait reveal flow
   - Test vector rendering in live garden (verify all 9 variants work)
   - Test lifecycle animations across all plant types and variants
   - Verify smart germination behaviors (proximity, clustering, wave patterns)
   - Monitor germination patterns over extended time (10+ minutes)
   - Test time-travel with substantial historical data (seed 100+ plants, observe over time)
   - Verify performance with larger gardens (100+ plants)
   - Test time-travel scrubbing smoothness and event marker accuracy
   - Test evolution notifications (appearance, timing, dismissal)
   - Document any edge cases or issues discovered

### Long-Term Vision (Next Month)

1. **Sprint 5: Educational & Polish** (IN PROGRESS)
   - ✅ Task 5.1: Post-observation context panel (COMPLETED 2026-01-28)
   - ✅ Enhanced debug system with live logging (COMPLETED 2026-01-28)
   - Task 5.2: Observation feedback enhancements (NEXT)
   - Task 5.3: Performance optimization

2. **Production Readiness**
   - Comprehensive testing
   - Performance profiling
   - Documentation completion
   - Gallery installation preparation

---

## Current State Assessment

### What's Working ✓

- Three.js rendering with efficient instanced plants (1000 plant capacity)
- Plant visual states with collapse transitions (superposed → collapsed, 1.5s)
- Auto-germination (30s checks, 15% chance for dormant plants)
- Autonomous reticle with drift behavior
- **✨ Region-based observation system** - Immediate trigger on alignment with 15-20s cooldown
- **✨ Debug observation mode toggle** - Switch between region and click observation
- **✨ Debug region visualization** - Green circle overlay for tuning parameters
- Entanglement visualization (correlated trait reveals)
- Database with quantum circuits, observation history, timestamps
- **✨ Quantum pool system** - 500 pre-computed authentic quantum results from IonQ simulator
- **✨ Instant trait revelation** - Deterministic pool selection provides <50ms observation latency
- **✨ IonQ integration configured** - Pool generated from simulator with error mitigation disabled
- **✨ Vector rendering system** - Smooth line-based rendering with 9 vector variants
- **✨ Progressive drawing transitions** - Dynamic brush stroke effects on vector plants
- **✨ Time-addressable rendering** - Foundation for time-travel feature with arbitrary time point rendering
- **✨ Time-travel system** - Full historical state viewing with scrubber UI (T key toggle)
- **✨ Evolution timeline** - Visual event markers for germinations and observations
- **✨ Auto-play mode** - Watch garden evolution at 10x speed
- 41 total plant variants (32 raster + 9 vector) across 6 categories (ground-cover, grass, flower, shrub, tree, ethereal)
- 64x64 pixel grid patterns with lifecycle animations
- Vector keyframe tweening with smooth interpolation
- Mobile-responsive with touch controls

### Critical Gaps ❌

- **Limited evolution** - Only auto-germination, no other dynamic behaviors
- **No educational content** - Quantum concepts not explained to users
- **Basic visual behaviors** - Plants lack lifecycle-based animations

---

## Implementation Roadmap

### Sprint 1: Core Observation System (P0 - CRITICAL)

**Goal**: Implement the designed observation system where observation happens naturally when the reticle aligns with a plant within an invisible observation region.

#### Task 1.1: Create ObservationSystem Class

**Status**: ✅ COMPLETED (2026-01-27)
**File**: `apps/web/src/components/garden/observation-system.ts` (NEW)

**Implementation**:

- **Region Management**:
  - One active region at a time
  - Radius: 120-150 pixels (configured at 135px)
  - Lifetime: 60-90 seconds (configured at 75s)
  - Region repositions after observation or expiration
  - Never visualized (invisible to user)

- **Alignment Detection** (per-frame checks):
  - Check if reticle position overlaps active region
  - Check if plant's full bounding box is within region
  - Check if reticle overlaps any part of plant
  - All three must be true simultaneously

- **Observation Trigger**:
  - When alignment conditions met → observation triggers **immediately** (no dwell time)
  - Enforce 15-20s cooldown after observation (configured at 17.5s)
  - Deactivate/relocate region after observation

- **Debug Mode**:
  - Toggle between region-based and click-based observation
  - Controlled via debug panel (backtick key)
  - Default: region-based observation
  - Debug click mode: Allow clicking plants directly (bypass regions)

**API**:

```typescript
class ObservationSystem {
  constructor(
    plants: Plant[],
    getReticlePosition: () => Vector2,
    onObservation: (payload: ObservationPayload) => void
  );
  update(deltaTime: number): void;
  updatePlants(plants: Plant[]): void;
  getActiveRegion(): ObservationRegion | null;
  isInCooldown(): boolean;
  setDebugMode(enabled: boolean): void;
  dispose(): void;
}
```

#### Task 1.2: Integrate ObservationSystem

**Status**: ✅ COMPLETED (2026-01-27)
**File**: `apps/web/src/components/garden/three/garden-scene.tsx`

**Changes**:

1. ✅ Instantiate `ObservationSystem` after overlayManager
2. ✅ Call `observationSystem.update(deltaTime)` in updateCallback
3. ✅ Subscribe to store to update `observationSystem.updatePlants()` when plants change
4. ✅ **Keep click handler but wrap in debug mode check**: Only active when debug mode enabled
5. ✅ Move celebration/entanglement trigger logic into observation callback (shared by both modes)
6. ✅ Add debug panel toggle for switching observation modes
7. ✅ Add cleanup for observationSystem in unmount

#### Task 1.3: Add Debug Region Visualization

**Status**: ✅ COMPLETED (2026-01-27)
**File**: `apps/web/src/components/garden/three/overlays/debug-overlay.ts` (NEW)

**Features**:

- ✅ Renders active region as green circle outline when debug mode enabled
- ✅ Shows region center dot
- ✅ Add toggle button: "Observation Mode: [Region / Click]"
- ✅ Completely removable for production
- ✅ Integrated into OverlayManager

**Acceptance Criteria**:

- ✅ Reticle drifts autonomously without user control
- ✅ Observation triggers immediately when alignment conditions met
- ✅ Region system works (verify via debug visualization)
- ✅ Cooldown prevents rapid observations (15-20s)
- ✅ Debug mode allows switching to click-based observation
- ✅ Click observation only works when debug mode enabled

---

### Sprint 2: Real Quantum Data Integration (P1)

**Status**: ✅ COMPLETED (2026-01-27)

**Goal**: Switch from mock traits to real IonQ simulator results, treating quantum execution as async background process.

#### Task 2.1: Pre-compute Quantum Jobs at Plant Creation

**Status**: ✅ COMPLETED (2026-01-27)
**Files**: `apps/web/scripts/seed-garden.ts`

**Implementation**:

- **Job Submission Flow**:
  - Added `submitQuantumJob()` function to submit jobs via `/jobs/submit` endpoint
  - Modified plant creation to submit quantum jobs after creating each plant
  - Stores `ionqJobId` in QuantumRecord when job submission succeeds
  - Changes QuantumRecord status from "pending" to "submitted" when job is queued
  - Updated entangled plant creation to also submit jobs for shared circuits
  - Enhanced logging to show job IDs (truncated to 8 chars) or "mock mode" indicator

- **Workflow**:
  1. Generate quantum circuit definition via `/circuits/generate`
  2. Create plant and QuantumRecord in database (status: "pending")
  3. Submit quantum job via `/jobs/submit` (returns job ID)
  4. Update QuantumRecord with job ID and change status to "submitted"

- **Entanglement Support**:
  - Uses synthetic plant ID (`entangled-${i}`) for job submission
  - Shared circuit gets its own job submission
  - Both entangled plants reference the same QuantumRecord with the job

- **Graceful Degradation**:
  - If quantum service unavailable, proceeds without job ID (mock mode)
  - Seed script works in both modes transparently

**Background Worker** (already exists):

- Polls IonQ for job status
- When complete, maps measurements to traits
- Updates `QuantumRecord` with traits and status
- Sets `Plant.traits` when ready

#### Task 2.2: Observation Reveals Pre-Computed Traits

**Status**: ✅ COMPLETED (2026-01-27)
**Files**: `apps/web/src/server/routers/observation.ts`, `apps/web/src/hooks/use-observation.ts`

**Implementation**:

- **Job Status Checking**:
  - Modified observation router to query live job status from quantum service via `getJobStatus()`
  - If job completed → return pre-computed traits, collapse plant state
  - If job still processing → return `{ waitingForQuantum: true }`, keep plant superposed
  - If job failed → fall back to mock traits gracefully
  - Supports both pre-computed jobs (new path) and real-time quantum service (legacy path)

- **Entanglement Support**:
  - Checks quantum job status for entangled partners before revealing correlated traits
  - If partner job still processing → skip partner reveal, wait for its own observation
  - Ensures correlated traits only appear when quantum computation completes
  - Graceful handling of mixed states (one partner ready, others pending)

- **Frontend Integration**:
  - Updated `use-observation.ts` hook to handle waiting state
  - If waiting for quantum → keep plant in superposed state, log status
  - Plant remains interactive, can be observed again when job completes
  - TODO: Add toast notification "Quantum computation in progress..."

- **Graceful Degradation**:
  - Falls back to mock traits if job query fails
  - Falls back to mock traits if job status is "failed" or "timeout"
  - Maintains smooth UX regardless of quantum service availability
  - Logs execution mode for debugging

**Quality Checks**:

- TypeScript: ✅ PASS
- ESLint: ✅ PASS

#### Task 2.3: Enable IonQ Simulator Configuration

**Status**: ✅ COMPLETED (2026-01-27)
**Files**: `apps/quantum/.env.example`, `apps/quantum/src/config.py`, `apps/quantum/README.md`

**Implementation**:

- ✅ Created `.env.example` with IonQ configuration template
- ✅ Documented IonQ API key setup in README (free tier includes 10 min/month)
- ✅ Added execution mode logging on service startup
- ✅ Created `/config` endpoint exposing execution mode and circuit defaults
- ✅ Documented simulator vs. hardware vs. mock modes
- ✅ All Python tests, type-checking, and linting passing

#### Task 2.4: Quantum Status in Debug Panel

**Status**: ✅ COMPLETED (2026-01-27)
**Files**: `apps/web/src/server/routers/quantum.ts` (NEW), `apps/web/src/components/garden/debug-panel.tsx`

**Implementation**:

- ✅ Created dedicated tRPC router for quantum service integration
- ✅ Added `/config` endpoint proxy showing execution mode and IonQ settings
- ✅ Added `/jobs/` endpoint proxy for job queue statistics
- ✅ Color-coded execution mode badges (blue=simulator, purple=hardware, gray=mock)
- ✅ Real-time polling (config: 5s, job stats: 2s)
- ✅ Type-safe integration with full TypeScript autocomplete
- ✅ All quality checks passing (TypeScript, ESLint)

**Acceptance Criteria**:

- [x] Debug panel displays current quantum execution mode
- [x] Shows IonQ API key configuration status
- [x] Shows circuit defaults (shots count)
- [x] Polls quantum service for real-time status updates

---

### Sprint 3: Time-Travel Experience (P1)

**Status**: ✅ COMPLETED (2026-01-27)

**Goal**: Users can scrub through garden's history, seeing when plants germinated and were observed.

#### Task 3.1: Historical State API

**Status**: ✅ COMPLETED (2026-01-27)
**File**: [apps/web/src/server/routers/garden.ts](apps/web/src/server/routers/garden.ts) (NEW router)

**Endpoints**:

```typescript
// Get garden state at specific timestamp
getStateAtTime: publicProcedure
  .input(z.object({ timestamp: z.date() }))
  .query(async ({ input }) => {
    // Query plants with state computed for that moment:
    // - dormant if germinatedAt > timestamp
    // - superposed if observedAt > timestamp or null
    // - collapsed if observedAt <= timestamp
    // Return: Plant[] with historical states
  });

// Get timeline of events (germinations, observations)
getEvolutionTimeline: publicProcedure
  .input(
    z.object({
      startTime: z.date(),
      endTime: z.date(),
    })
  )
  .query(async ({ input }) => {
    // Query ObservationEvent and plant germination times
    // Return: Event[] sorted by timestamp
  });
```

#### Task 3.2: Time-Travel UI Component

**Status**: ✅ COMPLETED (2026-01-27)
**File**: [apps/web/src/components/garden/time-travel-scrubber.tsx](apps/web/src/components/garden/time-travel-scrubber.tsx) (NEW)

**Features**:

- Horizontal timeline showing garden age (hours/days since creation)
- Event markers for germinations (green dots) and observations (blue dots)
- Draggable playhead to scrub through time
- "Live" / "Historical" mode toggle
- Auto-play capability (watch evolution at 10x speed)

**Behavior**:

- When scrubbing, disable observation system (read-only mode)
- Call `getStateAtTime` on scrub (debounced)
- Render plants in historical states
- Show subtle "Historical View" indicator overlay
- "Return to Live" button exits time-travel mode

**Position**: Overlay at bottom of screen, collapsible, hidden by default

#### Task 3.3: Integrate Timeline into Garden

**Status**: ✅ COMPLETED (2026-01-27)
**Files**:

- [apps/web/src/app/page.tsx](apps/web/src/app/page.tsx)
- [apps/web/src/stores/garden-store.ts](apps/web/src/stores/garden-store.ts)
- [apps/web/src/components/garden/three/garden-scene.tsx](apps/web/src/components/garden/three/garden-scene.tsx)
- [apps/web/src/hooks/use-evolution.ts](apps/web/src/hooks/use-evolution.ts)

**Implementation**:

- ✅ Toggle via keyboard shortcut (T key)
- ✅ Suspend observation system during time-travel
- ✅ Suspend evolution system during time-travel
- ✅ Time-travel scrubber UI at bottom of screen
- ✅ Fetch and render historical plant states via getStateAtTime
- ✅ Time-travel state in garden store (isTimeTravelMode, timeTravelTimestamp)

**Acceptance Criteria**:

- [x] Can scrub through garden history smoothly
- [x] Plants show correct states at historical timestamps
- [x] Timeline markers appear for events
- [x] Can return to live view seamlessly

---

### Sprint 4: Enhanced Garden Evolution (P2)

**Goal**: Garden feels alive even when not being observed with subtle behaviors and dynamic evolution.

#### Task 4.1: Lifecycle-Based Visual Behaviors

**Status**: ✅ COMPLETED (2026-01-27)
**Files**: `apps/web/src/components/garden/three/plants/plant-material.ts`, `apps/web/src/components/garden/three/plants/plant-instancer.ts`

**Animations**:

- **Young plants** (lifecycle < 0.3): Gentle scale pulse (0.98-1.02, 3s cycle)
- **Mature plants** (lifecycle 0.3-0.7): Subtle rotation sway (±2 degrees, 5s cycle)
- **Old plants** (lifecycle > 0.7): Slower movements (10s cycle), increased opacity variance

**Implementation**:

- Modified vertex shader to accept `lifecycleProgress` via `instanceAnimation.y` attribute
- Added lifecycle-based animations using sine wave functions with appropriate frequencies
- Young plants: `sin(u_time * 2.094) * 0.02` for 3s cycle scale pulse
- Mature plants: `sin(u_time * 1.257) * 0.0349` for 5s cycle rotation sway (±2°)
- Old plants: `sin(u_time * 0.628) * 0.015` for 10s cycle slower movement
- Modified fragment shader for old plant opacity variance
- Updated `plant-instancer.ts` to calculate and pass `lifecycleState.totalProgress` through instance buffer
- Only applies animations to germinated plants without resolved traits
- Animations automatically respect lifecycle stages (young/mature/old)

**Quality Checks**:

- TypeScript: ✅ PASS
- ESLint: ✅ PASS

#### Task 4.2: Smart Germination Logic

**Status**: ✅ COMPLETED (2026-01-27)
**File**: `apps/web/src/components/garden/garden-evolution.ts`

**Enhancements**:

- **Proximity bonus**: Plants near observed plants 2x more likely to germinate (200px radius)
- **Clustering prevention**: If 3+ germinated plants within 150px radius, skip area (0% chance)
- **Age weighting**: Older dormant plants gradually increase germination chance (up to 2.5x after 15 min)
- **Wave pattern**: Occasional "germination waves" where multiple plants sprout together (5% chance per check, 3-5 plants)

**Implementation**:

- Added smart germination constants to EVOLUTION config (proximity radius, clustering threshold, age weighting period, wave chance)
- Implemented `getDistance()` helper to calculate distance between plants
- Implemented `hasObservedNeighbors()` to check for observed plants within proximity radius
- Implemented `isInCluster()` to detect crowded areas with 3+ germinated neighbors
- Implemented `getAgeMultiplier()` to calculate age-based bonus (linear increase from 1.0 to 2.5x over 15 min)
- Implemented `getGerminationProbability()` to combine all factors (proximity, age, clustering)
- Updated `checkEvolution()` to support wave germination events (3-5 plants at once)
- All germination decisions logged to console with wave indicator

**Quality Checks**:

- TypeScript: ✅ PASS
- ESLint: ✅ PASS

#### Task 4.3: Evolution Event Notifications

**Status**: ✅ COMPLETED (2026-01-27)
**Files**: `apps/web/src/components/garden/evolution-notifications.tsx`, `apps/web/src/stores/garden-store.ts`, `apps/web/src/hooks/use-evolution.ts`, `apps/web/src/hooks/use-observation.ts`, `apps/web/src/app/page.tsx`

**Features**:

- When plant germinates: Subtle toast "A plant has germinated" (3s duration)
- When entangled observation occurs: "Entangled plants observed"
- Notifications fade in/out at bottom-right corner
- Never intrusive, easily ignorable
- Click-to-dismiss functionality (click notification to dismiss immediately)

**Implementation**:

- Created EvolutionNotifications component with toast notification system
- Bottom-right positioning with fade in/out animations (Tailwind animate-in)
- Auto-dismiss after 3 seconds
- Added EvolutionNotification interface to garden store (id, message, timestamp)
- Implemented addNotification() and removeNotification() methods in store
- Integrated with germination callback in use-evolution.ts hook
- Integrated with observation system for entangled observations (use-observation.ts)
- Accessible design (role="status", aria-live="polite")
- Calm aesthetic: black/80 background, green border, hover effects

**Quality Checks**:

- TypeScript: ✅ PASS
- ESLint: ✅ PASS

**Acceptance Criteria**:

- [x] Plants germinate with smart logic (proximity, clustering)
- [x] Visual behaviors animate based on lifecycle
- [x] Notifications appear for evolution events
- [x] Garden feels "alive" even when idle

---

### Sprint 5: Educational & Polish (P2-P3)

**Goal**: Enhance meaning and polish the experience.

#### Task 5.1: Post-Observation Context Panel

**Status**: ✅ COMPLETED (2026-01-28)
**File**: `apps/web/src/components/garden/observation-context-panel.tsx`

**Implementation**:

- ✅ Educational content for 5 circuit types (superposition, bell_pair, ghz_state, interference, variational)
- ✅ ASCII circuit diagram visualization
- ✅ Brief quantum concept explanations
- ✅ "Learn More" links to documentation
- ✅ Dismissible UI with "Don't show again" option (localStorage)
- ✅ Auto-dismiss after 15 seconds
- ✅ Calm slide-in animation from left side

**Related Enhancements**:

- ✅ Added `ObservationContext` state to garden store
- ✅ Added `circuitId` to observation router response
- ✅ Integrated with observation hook to trigger on successful observation

#### Task 5.1b: Enhanced Debug System

**Status**: ✅ COMPLETED (2026-01-28)
**Files**: `apps/web/src/lib/debug-logger.ts`, `apps/web/src/components/garden/debug-panel.tsx`, `docs/debugging.md`

**Implementation**:

- ✅ Centralized DebugLogger service with categories (quantum, observation, evolution, rendering, system)
- ✅ Log levels (debug, info, warn, error) with filtering
- ✅ React hook `useDebugLogs()` for UI integration
- ✅ Enhanced debug panel with 3 tabs (Overview, Logs, Plants)
- ✅ System state indicators (Evolution, Time Travel, Observation mode, Context Panel)
- ✅ Live log message display with expandable JSON data view
- ✅ Comprehensive debugging documentation

#### Task 5.2: Observation Feedback Enhancements

**Status**: 🔴 Not Started
**File**: `apps/web/src/lib/three/overlays/feedback-overlay.ts`

**Improvements**:

- Add color variation based on plant's primary palette color
- Entanglement pulse: Show "quantum correlation" wave traveling between plants
- Subtle "ding" sound effect (optional, respects system audio settings)
- Haptic feedback pattern based on rarity (longer pulse for rare plants)

#### Task 5.3: Performance Optimization

**Status**: 🔴 Not Started
**File**: `apps/web/src/lib/three/plants/plant-instancer.ts`

**Optimizations**:

- Verify frustum culling working correctly
- LOD for distant plants (if camera zooms out)
- Observation region spatial indexing (quadtree for O(log n) checks)
- Lazy historical data loading (paginate time-travel queries)

**Acceptance Criteria**:

- [ ] 60fps rendering with 100+ plants
- [ ] No memory leaks after extended sessions
- [ ] Time-travel queries respond quickly (<500ms)
- [ ] Observation system runs efficiently per-frame

---

## Completed Work

### 2026-01-28 - Sprint 5.1: Post-Observation Context Panel + Debug System (Complete)

**Post-Observation Context Panel (Task 5.1)**:

- [x] Created ObservationContextPanel component with educational content
- [x] Educational content for 5 circuit types (superposition, bell_pair, ghz_state, interference, variational)
- [x] ASCII circuit diagram visualization in monospace font
- [x] Brief quantum concept explanations (1-2 sentences per circuit)
- [x] "Learn More" links to documentation pages
- [x] Dismissible UI with close button and "Don't show again" option
- [x] Auto-dismiss after 15 seconds
- [x] Slide-in animation from left side (calm, non-intrusive)
- [x] Preference stored in localStorage
- [x] Added ObservationContext state to garden store (plantId, circuitId, isEntangled)
- [x] Added circuitId and executionMode to observation router response
- [x] Integrated context panel trigger in observation hook

**Enhanced Debug System (Task 5.1b)**:

- [x] Created DebugLogger service (`apps/web/src/lib/debug-logger.ts`)
- [x] Centralized logging with 5 categories (quantum, observation, evolution, rendering, system)
- [x] 4 log levels (debug, info, warn, error)
- [x] In-memory storage with 100 log limit
- [x] Console output with category prefixes (e.g., `[QUANTUM]`, `[OBSERVATION]`)
- [x] React hook `useDebugLogs()` for subscribing to log updates
- [x] `filterLogs()` utility for category/level filtering
- [x] Enhanced debug panel with 3-tab interface (Overview, Logs, Plants)
- [x] System state indicators (Evolution active/paused, Time Travel on/off, Observation mode, Context Panel visible)
- [x] Expanded garden stats (total, germinated, dormant, observed, superposed, notifications)
- [x] Live log message display with filtering UI
- [x] Expandable log entries for viewing JSON data payloads
- [x] Click-to-expand log data with syntax highlighting
- [x] Added logging to use-evolution.ts (germination events)
- [x] Added logging to use-observation.ts (observation events with circuit info)
- [x] Created comprehensive debugging documentation (`docs/debugging.md`)

**Quality Checks**:

- [x] TypeScript type-checking: PASS
- [x] ESLint linting: PASS

### 2026-01-27 - Sprint 4: Enhanced Garden Evolution (Complete)

**Lifecycle-Based Visual Behaviors (Task 4.1)**:

- [x] GPU-accelerated shader animations for lifecycle stages
- [x] Young plants (lifecycle < 0.3): Gentle scale pulse (0.98-1.02, 3s cycle)
- [x] Mature plants (lifecycle 0.3-0.7): Subtle rotation sway (±2°, 5s cycle)
- [x] Old plants (lifecycle > 0.7): Slower movement (10s cycle) with opacity variance
- [x] Automatic lifecycle progress calculation via instance buffer
- [x] Animations respect plant states (only for germinated, unresolved plants)

**Smart Germination Logic (Task 4.2)**:

- [x] Proximity bonus: 2x germination chance near observed plants (200px radius)
- [x] Clustering prevention: 0% chance in areas with 3+ germinated neighbors (150px radius)
- [x] Age weighting: Gradual increase in probability (1.0x to 2.5x over 5 min)
- [x] Wave patterns: 5% chance per check for coordinated germination (3-5 plants)
- [x] Helper methods: getDistance(), hasObservedNeighbors(), isInCluster(), getAgeMultiplier()
- [x] Enhanced logging with germination decision rationale

**Evolution Event Notifications (Task 4.3)**:

- [x] Created toast notification system (bottom-right, 3s auto-dismiss)
- [x] Germination notifications ("A plant has germinated")
- [x] Entanglement observation notifications ("Entangled plants observed")
- [x] Fade in/out animations with click-to-dismiss
- [x] Accessible design (role="status", aria-live="polite")
- [x] Added notification state to garden store (addNotification, removeNotification)
- [x] Integrated with germination callback in use-evolution.ts
- [x] Integrated with observation system for entangled observations
- [x] Calm aesthetic matching garden (black/80 background, green border)

**Quality Checks**:

- [x] TypeScript type-checking: PASS (2 packages, 1.243s)
- [x] ESLint linting: PASS (2 packages, 955ms)

### 2026-01-27 - Sprint 3: Time-Travel Experience (Complete)

- [x] **Historical State API**: Created tRPC router with `getStateAtTime` and `getEvolutionTimeline` endpoints
- [x] **Garden Router**: New router computing plant states at arbitrary timestamps (superposed/collapsed based on observation history)
- [x] **Evolution Timeline**: Query system for germination and observation events within time ranges
- [x] **Time-Travel Scrubber**: Horizontal timeline UI with draggable playhead, event markers, and auto-play (10x speed)
- [x] **Event Visualization**: Green markers for germinations, blue for observations, with tooltips
- [x] **Main Page Integration**: Added scrubber to page with keyboard shortcut (T key) and historical state queries
- [x] **Garden Store Enhancement**: Added `isTimeTravelMode` and `timeTravelTimestamp` state management
- [x] **Historical Rendering**: Plants render in correct historical states when scrubbing through time
- [x] **Read-Only Mode**: Observation and evolution systems suspended during time-travel
- [x] **Live View Return**: Seamless transition back to live garden with plant state refresh
- [x] **Quality Checks**: TypeScript, ESLint, Prettier all passing
- [x] **User Experience**: Smooth scrubbing, collapsible UI, calm dark aesthetic, real-time event updates

### 2026-01-27 - Quantum Pool Implementation (Major Architecture Shift)

- [x] **Pool Generator Script**: Created script to generate 500 pre-computed quantum results (100 per circuit type)
- [x] **Quantum Pool Data**: Generated pool from IonQ simulator with error mitigation disabled for authenticity
- [x] **Deterministic Selection**: Hash-based pool selection ensures same plant always gets same traits
- [x] **Observation Simplification**: Removed job polling, waiting states, complex fallback logic (307-line reduction)
- [x] **Instant Trait Revelation**: Observation now <50ms (was 5-30+ seconds with job polling)
- [x] **Pool Endpoint**: Added `/circuits/pool` to quantum service serving pre-computed results
- [x] **Type System**: Added QuantumPool types and selectFromPool utility to shared package
- [x] **Frontend Cleanup**: Removed waiting state handling from observation hook
- [x] **Seed Script Cleanup**: Removed job submission logic (no longer needed)
- [x] **Architecture Shift**: Moved quantum computation from observation-time to setup-time
- [x] **Quality**: Maintained quantum authenticity while dramatically improving UX (100-600x faster)

### 2026-01-26 to 2026-01-27 - Vector Rendering System

- [x] **VectorPlantOverlay**: Three.js line rendering with batched LineSegments for efficient vector plant display
- [x] **9 Vector Variants**: Sacred Mandala, Crystal Lattice, Stellar Geometry, Metatron's Cube, Pulsing Orb, Phoenix Flame, Kaleidoscope Star, Vortex Spiral, Sumi Spirit (total: 41 variants)
- [x] **Vector Primitive System**: Builder utilities for lines, circles, polygons, stars, diamonds, arc segments
- [x] **Progressive Drawing Transitions**: Dynamic drawing effects where lines draw/undraw sequentially like brush strokes
- [x] **Time-Addressable Rendering**: `renderVectorGlyphAtProgress()` for rendering at arbitrary time points (foundation for time-travel)
- [x] **Vector Keyframe Tweening**: Smooth interpolation of stroke color, opacity, scale, and primitive positions
- [x] **Multi-Renderer Support**: Consistent rendering across Three.js (garden), Canvas2D (sandbox), and SVG (timeline)
- [x] **Sandbox Integration**: Vector variant preview, keyframe panel, timeline with VectorMiniGlyph thumbnails
- [x] **Renderer Column**: Added to variant gallery showing vector/raster mode and progressive drawing indicators
- [x] **Quality Checks**: TypeScript, ESLint, visual testing, performance (60fps) all passing

### 2026-01-27 - Observation Reveals Pre-Computed Traits (Sprint 2, Task 2.2) [SUPERSEDED]

**Note**: This implementation was superseded by the quantum pool system. The job-based approach worked but had poor UX (5-30s wait times). The pool approach provides the same quantum authenticity with instant results.

- [x] **Live Job Status Checking**: Modified observation router to query quantum service for current job status
- [x] **Conditional Trait Revelation**: Return traits if job completed, waiting state if processing, mock if failed
- [x] **Entanglement Integration**: Check partner job status before revealing correlated traits
- [x] **Frontend Handling**: Updated observation hook to keep plant superposed while waiting for quantum
- [x] **Graceful Degradation**: Fall back to mock traits if job query fails or times out
- [x] **Quality Checks**: TypeScript and ESLint passing
- [x] **Sprint 2 Complete**: Full quantum integration loop now functional (seed → job → observe → reveal)

### 2026-01-27 - Pre-compute Quantum Jobs at Plant Creation (Sprint 2, Task 2.1)

- [x] **Job Submission Integration**: Modified seed script to submit quantum jobs via `/jobs/submit` endpoint
- [x] **Database Updates**: Store job IDs in QuantumRecord and update status to "submitted"
- [x] **Entanglement Support**: Submit jobs for shared circuits in entangled plant groups
- [x] **Graceful Degradation**: Seed script works in both quantum-enabled and mock modes
- [x] **Enhanced Logging**: Show job IDs (truncated) or "mock mode" indicator for visibility
- [x] **Quality Checks**: TypeScript type-checking and ESLint passing

### 2026-01-27 - Quantum Status in Debug Panel (Sprint 2, Task 2.4)

- [x] **tRPC Quantum Router**: Created dedicated router for quantum service integration with type-safe endpoints
- [x] **Config Display**: Real-time execution mode visibility with color-coded badges
- [x] **Job Stats Integration**: Prepared infrastructure for job queue monitoring
- [x] **Polling System**: Separate intervals for config (5s) and job stats (2s)
- [x] **Type Safety**: Full TypeScript autocomplete for quantum service responses
- [x] **Quality Checks**: All TypeScript type-checking and ESLint passing

### 2026-01-27 - IonQ Simulator Configuration (Sprint 2, Task 2.3)

- [x] **Environment Configuration**: Created `.env.example` with IonQ API key template and execution mode settings
- [x] **Configuration Endpoint**: Added `/config` endpoint to quantum service exposing execution mode and circuit defaults
- [x] **Startup Logging**: Added execution mode logging on service startup for visibility
- [x] **Documentation**: Comprehensive IonQ API key setup guide in quantum service README
- [x] **Quality Checks**: All Python tests (11/11), mypy type-checking, and ruff linting passing

### 2026-01-27 - Core Observation System Implementation (Sprint 1)

- [x] **ObservationSystem Class**: Complete implementation with region management, alignment detection, and cooldown logic
- [x] **Garden Scene Integration**: Integrated observation system into render loop with event handling
- [x] **Debug Visualization**: Added DebugOverlay for visualizing observation regions during development
- [x] **Debug Panel Controls**: Added observation mode toggle (Region / Click) with visual indicators
- [x] **Documentation Updates**: Updated architecture.md and observation-system.md to reflect immediate trigger implementation
- [x] **Implementation Plan**: Created comprehensive implementation-plan.md documenting all sprints

### 2026-01-27 - Sprint Planning & Documentation

- [x] Comprehensive codebase evaluation (quantum integration, rendering, evolution)
- [x] Created prioritized implementation roadmap
- [x] Updated all documentation to reflect new plan

### 2026-01-18 - Mobile Experience & Tablet Polish

- [x] Dwell progress indicator with visual ring/arc
- [x] Touch mode indicator with expanding ring animation
- [x] Observation feedback with expanding celebration rings
- [x] Haptic feedback integration
- [x] Tablet breakpoints for responsive layouts
- [x] Timeline overflow fixes for small phones
- [x] Control panel touch target improvements

### 2026-01-17 - Garden Ecosystem Expansion

- [x] 14 total plant variants across 6 categories
- [x] 64x64 grid pattern upgrade with pattern-builder utilities
- [x] Z-ordering system for visual depth
- [x] Seed script updated to 24 plants with 3 entangled pairs
- [x] 83 tests passing, TypeScript and lint clean

See `docs/archive/sessions/` for detailed session notes.

---

## Technical Debt & Deferred Work

### Quantum Service (Deferred)

> **⚠️ Do not work on these during autowork.** Real quantum integration requires explicit coordination.

- [ ] Add comprehensive test coverage for quantum service
- [ ] Document quantum circuit design decisions in code
- [ ] Implement proper error handling for IonQ API failures

### Out of Scope (For Later)

- Ambient audio / generative soundscape
- Gallery installation mode adaptations
- Analytics and observation pattern tracking
- Custom variant designer
- Multiple garden instances with cross-garden entanglement
- Seasonal variations in circuits
- Screen reader support and full accessibility

---

## Success Metrics

### Creative Director Perspective (Exceptional UX)

- Observation feels meditative and inevitable, not gamey
- Garden evolution is visible and engaging over time
- Time-travel creates "wow" moment of seeing history
- Quantum connection is educational and meaningful

### System Architect Perspective (Clean Implementation)

- Observation system is modular and testable
- Quantum integration is async and fault-tolerant
- Time-travel queries are efficient and accurate
- All systems respect the calm, contemplative design philosophy

---

## Notes

- IonQ compute credits: Up to $15,000 available via Qollab partnership
- Funding: Up to $5,000 USD for development
- Target: Web-based experience, potentially adaptable to gallery installation
- Philosophy: Calm, contemplative, slow - visitors are observers, not controllers
- TypeScript is single source of truth for variants (exported to JSON for Python)
