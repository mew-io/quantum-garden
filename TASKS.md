# Quantum Garden - Implementation Roadmap

_Last updated: 2026-01-27 (Sprint Planning Session)_

## Project Goal

Build a slow-evolving generative environment where plants exist in quantum superposition until observed. The experience should be calm, contemplative, and grounded in real quantum computation via IonQ.

**Current Focus**: Implement the user-facing quantum simulation experience with functional garden rendering, autonomous evolution, time-travel, and real IonQ quantum data integration.

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
- IonQ async job API scaffolded (but unused)
- 14 plant variants across 6 categories (ground-cover, grass, flower, shrub, tree, ethereal)
- 64x64 pixel grid patterns with lifecycle animations
- Vector plant variants with progressive drawing and keyframe support

### Critical Gaps ❌

- **No time-travel** - Database has timestamps but no API or UI to query historical states
- **Quantum integration dormant** - Using mock traits instead of real IonQ simulator
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

**Goal**: Switch from mock traits to real IonQ simulator results, treating quantum execution as async background process.

#### Task 2.1: Pre-compute Quantum Jobs at Plant Creation

**Status**: 🔴 Not Started
**Files**: `apps/web/scripts/seed-garden.ts`, `apps/quantum/src/jobs/worker.py`

**Changes**:

1. Generate circuit via quantum service (existing)
2. **NEW**: Submit job to IonQ via `POST /jobs/submit`
   - Pass: `circuitDefinition`, `circuitId`, `seed`, `shots: 100`
   - Receive: `jobId`, `status: "pending"`
3. Store `jobId` in `QuantumRecord.ionqJobId`
4. Plant created with `visualState: "superposed"`, no traits yet

**Background Worker** (already exists):

- Polls IonQ for job status
- When complete, maps measurements to traits
- Updates `QuantumRecord` with traits and status
- Sets `Plant.traits` when ready

#### Task 2.2: Observation Reveals Pre-Computed Traits

**Status**: 🔴 Not Started
**File**: `apps/web/src/server/routers/observation.ts`

**Logic**:

1. Check if plant's quantum job has completed:
   - `QuantumRecord.status === "completed"` → traits ready
   - `QuantumRecord.status === "pending" | "running"` → not ready
2. If ready: Return traits immediately, collapse visual state
3. If not ready: Return `{ waitingForQuantum: true }`, keep superposed
   - Frontend shows subtle "quantum computation in progress" indicator

**Graceful Degradation**:

- If job fails after retries, fall back to mock traits
- Log execution mode to `ObservationEvent` metadata

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

**Status**: 🔴 Not Started
**File**: `apps/web/src/components/ui/debug-panel.tsx`

**Display**:

- Current quantum execution mode (Simulator / Mock)
- Job queue status (pending, running, completed, failed counts)
- Average job completion time
- Last 5 jobs with status

**Acceptance Criteria**:

- [ ] Seeds new garden with IonQ simulator enabled
- [ ] Background worker processes jobs successfully
- [ ] Observations reveal real quantum traits (not mock)
- [ ] Graceful degradation on job failures

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
