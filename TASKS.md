# Quantum Garden - Implementation Roadmap

_Last updated: 2026-01-27 (Loop 3 Synthesis)_

## Project Goal

Build a slow-evolving generative environment where plants exist in quantum superposition until observed. The experience should be calm, contemplative, and grounded in real quantum computation via IonQ.

**Current Focus**: Complete the quantum integration loop by connecting observation to pre-computed quantum results, then implement time-travel to showcase the garden's evolution history.

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

2. **Begin Sprint 3: Time-Travel Experience** (NEXT - HIGH PRIORITY)
   - Task 3.1: Historical State API
   - Task 3.2: Time-Travel UI Component
   - Task 3.3: Integrate Timeline into Garden
   - Creates compelling demonstration of garden evolution
   - Showcases the "observer" philosophy
   - Critical for demonstrating garden's autonomous nature

### Medium-Term Goals (Next 2 Weeks)

1. **Manual Testing & Validation**
   - Test quantum pool selection (deterministic, even distribution)
   - Validate instant observation → trait reveal flow
   - Test vector rendering in live garden
   - Test time-travel with historical data (when implemented)
   - Document any edge cases or issues

2. **Sprint 4: Enhanced Garden Evolution**
   - Lifecycle-based visual behaviors
   - Smart germination logic
   - Evolution event notifications
   - Makes garden feel "alive"

### Long-Term Vision (Next Month)

1. **Sprint 5: Educational & Polish**
   - Post-observation context panel
   - Observation feedback enhancements
   - Performance optimization
   - Educational quantum circuit explanations

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
- 41 total plant variants (32 raster + 9 vector) across 6 categories (ground-cover, grass, flower, shrub, tree, ethereal)
- 64x64 pixel grid patterns with lifecycle animations
- Vector keyframe tweening with smooth interpolation

### Critical Gaps ❌

- **No time-travel** - Database has timestamps but no API or UI to query historical states
- **Limited evolution** - Only auto-germination, no other dynamic behaviors

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

**Goal**: Users can scrub through garden's history, seeing when plants germinated and were observed.

#### Task 3.1: Historical State API

**Status**: 🔴 Not Started
**File**: `apps/web/src/server/routers/garden.ts` (NEW router)

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

**Status**: 🔴 Not Started
**File**: `apps/web/src/components/garden/time-travel-scrubber.tsx` (NEW)

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

**Status**: 🔴 Not Started
**File**: `apps/web/src/components/garden/three/garden-scene.tsx`

**Integration**:

- Toggle via keyboard shortcut (T key)
- When active, suspend observation system and evolution system
- Show time-travel scrubber UI
- Fetch and render historical plant states

**Acceptance Criteria**:

- [ ] Can scrub through garden history smoothly
- [ ] Plants show correct states at historical timestamps
- [ ] Timeline markers appear for events
- [ ] Can return to live view seamlessly

---

### Sprint 4: Enhanced Garden Evolution (P2)

**Goal**: Garden feels alive even when not being observed with subtle behaviors and dynamic evolution.

#### Task 4.1: Lifecycle-Based Visual Behaviors

**Status**: 🔴 Not Started
**File**: `apps/web/src/lib/three/plants/plant-instancer.ts`

**Animations**:

- **Young plants** (lifecycle < 0.3): Gentle scale pulse (0.98-1.02, 3s cycle)
- **Mature plants** (lifecycle 0.3-0.7): Subtle rotation sway (±2 degrees, 5s cycle)
- **Old plants** (lifecycle > 0.7): Slower movements, increased opacity variance

**Implementation**: Via shader uniforms, respects `prefers-reduced-motion`

#### Task 4.2: Smart Germination Logic

**Status**: 🔴 Not Started
**File**: `apps/web/src/components/garden/garden-evolution.ts`

**Enhancements**:

- **Proximity bonus**: Plants near observed plants 2x more likely to germinate
- **Clustering prevention**: If 3+ germinated plants within 150px radius, skip area
- **Age weighting**: Older dormant plants gradually increase germination chance
- **Wave pattern**: Occasional "germination waves" where multiple plants sprout together

#### Task 4.3: Evolution Event Notifications

**Status**: 🔴 Not Started
**File**: `apps/web/src/components/garden/evolution-notifications.tsx` (NEW)

**Features**:

- When plant germinates: Subtle toast "A plant has germinated" (3s duration)
- When entangled observation occurs: "Entangled plants observed"
- Notifications fade in/out at bottom-right corner
- Never intrusive, easily ignorable
- Optional: Click notification to pan camera to plant location

**Acceptance Criteria**:

- [ ] Plants germinate with smart logic (proximity, clustering)
- [ ] Visual behaviors animate based on lifecycle
- [ ] Notifications appear for evolution events
- [ ] Garden feels "alive" even when idle

---

### Sprint 5: Educational & Polish (P2-P3)

**Goal**: Enhance meaning and polish the experience.

#### Task 5.1: Post-Observation Context Panel

**Status**: 🔴 Not Started
**File**: `apps/web/src/components/garden/observation-context-panel.tsx` (NEW)

**Content**:

- Quantum circuit type used (e.g., "Bell Pair - Entanglement")
- Simplified circuit diagram (visual representation)
- Brief explanation of quantum concept (1-2 sentences)
- "Learn More" link to detailed docs
- Dismissible, remembers preference in localStorage

**Design**: Appears from side, calm aesthetic, easy to ignore

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
