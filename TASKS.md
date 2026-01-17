# Quantum Garden - Task Tracking

_Last updated: 2026-01-17 (Session 4)_

## Project Goal

Build a slow-evolving generative environment where plants exist in quantum superposition until observed. The experience should be calm, contemplative, and grounded in real quantum computation via IonQ.

---

## Current Sprint

### In Progress

_No tasks currently in progress_

### Up Next

- [ ] Implement state collapse animation (visual transition from superposed to collapsed)
- [ ] Add test coverage for lifecycle computation logic
- [ ] Create quantum service `/circuits/measure` endpoint to complete integration
- [ ] Implement real-time updates for observation results broadcast

---

## Completed

### 2026-01-17 - Garden Seeding with Variant Assignments

- [x] Create `scripts/seed-garden.ts` seed script
- [x] Implement variant selection based on rarity weights
- [x] Generate grid-based plant positions with jitter
- [x] Create quantum records with placeholder circuit definitions
- [x] Assign color variations for multi-color variants
- [x] Randomly germinate 50% of plants for immediate visual interest
- [x] Add `db:seed` npm script to package.json
- [x] Sync Prisma schema to database with `db:push`

### 2026-01-17 - Observation System with Dwell Tracking

- [x] Create ObservationSystem class with region management and dwell tracking
- [x] Implement alignment detection (reticle overlaps plant within region)
- [x] Track dwell time per eligible plant with progress sync to store
- [x] Trigger observation events when dwell threshold reached
- [x] Manage post-observation cooldown period
- [x] Integrate ObservationSystem into GardenCanvas component
- [x] Create useObservation hook for triggering observations via tRPC
- [x] Update observation.ts router to call quantum service `/circuits/measure` endpoint
- [x] Wire GardenCanvas to use observation hook with callback ref pattern

### 2026-01-17 - Reticle Controller Implementation

- [x] Create ReticleController class with autonomous drift behavior
- [x] Implement state machine with drifting/paused states
- [x] Add edge bouncing with slight randomization
- [x] Render reticle as small cross pattern (3px default)
- [x] Sync reticle position to Zustand garden store
- [x] Integrate ReticleController into GardenCanvas component
- [x] Add cleanup for ReticleController on unmount

### 2026-01-17 - Plant Rendering on Main Canvas

- [x] Create PlantSprite class for rendering individual plants with lifecycle state
- [x] Create PlantRenderer class to manage all plant sprites and sync with Zustand store
- [x] Integrate PlantRenderer into GardenCanvas component
- [x] Add lifecycle fields to shared Plant type (variantId, germinatedAt, lifecycleModifier, colorVariationName)
- [x] Create transformPlant function in plants router to properly map DB plants to shared type
- [x] Add window resize handling to GardenCanvas
- [x] Add full-screen styling to GardenCanvas
- [x] Add proper cleanup on unmount for PlantRenderer

### 2026-01-17 - Plant Lifecycle & Variant Sandbox

- [x] Design and implement keyframe-based lifecycle system
- [x] Create PlantVariant, GlyphKeyframe, and lifecycle types in shared package
- [x] Implement lifecycle computation logic (`computeLifecycleState`)
- [x] Define initial plant variants (simple-bloom, quantum-tulip, pulsing-orb)
- [x] Create comprehensive lifecycle documentation (`docs/variants-and-lifecycle.md`)
- [x] Build variant sandbox with timeline editor
- [x] Add gallery view for browsing all variants
- [x] Implement playback controls (play/pause, speed adjustment)
- [x] Add configuration panel for variant editing
- [x] Create superposed view with pastel color palettes
- [x] Fix PixiJS black box rendering issue
- [x] Update Prisma schema with lifecycle fields (variantId, germinatedAt, lifecycleModifier, colorVariationName)
- [x] Create Python variant loader for quantum service integration
- [x] Add export script for TypeScript variants to JSON

### 2026-01-16 - Initial Project Setup

- [x] Set up monorepo structure with pnpm workspaces
- [x] Configure Next.js 16 with React 19 and TypeScript
- [x] Set up PixiJS 8 integration with basic canvas
- [x] Configure tRPC with Prisma ORM
- [x] Design and implement Prisma schema (Plants, QuantumRecords, Observations, Entanglement)
- [x] Create FastAPI quantum service with Qiskit
- [x] Implement plant circuit generation endpoint
- [x] Implement IonQ client for circuit submission
- [x] Create trait mapping from quantum measurements
- [x] Set up Docker Compose for PostgreSQL
- [x] Configure CI/CD pipeline
- [x] Set up pre-commit hooks (linting, formatting, secrets scanning)
- [x] Write architecture documentation
- [x] Write observation system documentation
- [x] Write quantum circuits documentation
- [x] Create `/synthesize` command for session review
- [x] Create `TASKS.md` for task tracking
- [x] Set up session logging and archive system

---

## Backlog

### High Priority

_Core functionality needed for a working demo_

- [x] **Plant Renderer**: Render plants on main PixiJS canvas using variant lifecycle system
- [x] **Reticle System**: Implement autonomous reticle with drift behavior
- [x] **Observation Mechanics**: Detect reticle-plant alignment and track dwell time
- [x] **Quantum Integration**: Wire frontend observation to quantum measurement endpoint
- [x] **Plant Seeding**: Create initial batch of plants with quantum circuits and variants
- [ ] **State Collapse Animation**: Animate transition from superposed to collapsed state
- [ ] **Real-time Updates**: Broadcast observation results to all connected clients

### Medium Priority

_Important features for complete experience_

- [ ] **Entanglement Visualization**: Show correlated trait reveals across entangled plants
- [ ] **Observation Regions**: Implement invisible regions where observation can occur
- [ ] **Garden Evolution**: Implement time-based garden progression
- [ ] **Plant Lifecycle Display**: Show lifecycle keyframes on main canvas (integrate sandbox work)
- [ ] **Persistence**: Save and restore garden state across sessions
- [ ] **Mobile Support**: Ensure touch-friendly observation on mobile devices

### Low Priority / Polish

_Nice-to-have enhancements_

- [ ] **Ambient Audio**: Add generative soundscape
- [ ] **Visual Polish**: Refine plant aesthetics and animations
- [ ] **Performance Optimization**: Optimize for large numbers of plants
- [ ] **Analytics**: Track observation patterns and garden statistics
- [ ] **Accessibility**: Screen reader support and reduced motion options
- [ ] **Tweening**: Implement smooth interpolation between keyframes (documented but not implemented)

---

## Technical Debt

- [ ] Configure test script in package.json (currently no test runner)
- [ ] Add comprehensive test coverage for quantum service
- [ ] Add E2E tests for observation flow
- [ ] Document quantum circuit design decisions in code
- [ ] Add error boundaries in React components
- [ ] Implement proper error handling for IonQ API failures
- [ ] Add tests for lifecycle computation logic

---

## Implementation Status

| Component                    | Status     | Notes                                        |
| ---------------------------- | ---------- | -------------------------------------------- |
| **Frontend (apps/web)**      |            |                                              |
| PixiJS canvas initialization | Done       | Full-screen, resize handling                 |
| Plant rendering (main)       | Done       | PlantSprite + PlantRenderer with lifecycle   |
| Variant sandbox              | Done       | Full timeline editor, gallery, playback      |
| Superposed view              | Done       | Pastel palettes, visual development tool     |
| Reticle controller           | Done       | Autonomous drift, state machine, edge bounce |
| Observation system           | Done       | Region management, dwell tracking, cooldown  |
| Zustand store                | Done       | Plant data, dwell state, cooldown state      |
| tRPC client                  | Done       | Connected and working                        |
| **Shared (packages/shared)** |            |                                              |
| Variant types                | Done       | PlantVariant, GlyphKeyframe, lifecycle types |
| Variant definitions          | Done       | 3 example variants defined                   |
| Lifecycle computation        | Done       | computeLifecycleState, interpolation         |
| **API Layer**                |            |                                              |
| tRPC endpoints               | Scaffolded | Plants, observation, health routers exist    |
| Prisma schema                | Done       | Full schema with lifecycle fields            |
| Prisma client                | Done       | Generated and working                        |
| Garden seeding               | Done       | 12 plants with variants, `db:seed` script    |
| **Quantum Service**          |            |                                              |
| FastAPI app                  | Done       | Running on port 18742                        |
| Circuit generation           | Done       | Using Qiskit                                 |
| IonQ integration             | Done       | Client implemented                           |
| Trait mapping                | Done       | Basic mapping in place                       |
| Variant loader               | Done       | Python module to load variant definitions    |
| **Infrastructure**           |            |                                              |
| PostgreSQL                   | Done       | Docker Compose configured                    |
| CI/CD                        | Done       | GitHub Actions workflow                      |
| Pre-commit hooks             | Done       | Linting, formatting, secrets                 |

---

## Ideas & Future Exploration

- Gallery/installation mode with large display
- Multiple garden instances with cross-garden entanglement
- Historical garden archives (time-lapse of past states)
- Visitor presence indicators (anonymous, privacy-respecting)
- Seasonal variations in quantum circuit parameters
- Rare plant mutations from unusual quantum outcomes
- Custom variant designer (export from sandbox to garden)

---

## Notes

- IonQ compute credits: Up to $15,000 available via Qollab partnership
- Funding: Up to $5,000 USD for development
- Target: Web-based experience, potentially adaptable to gallery installation
- Philosophy: Calm, contemplative, slow - visitors are observers, not controllers
- TypeScript is single source of truth for variants (exported to JSON for Python)
