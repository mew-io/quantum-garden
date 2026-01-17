# Quantum Garden - Task Tracking

_Last updated: 2026-01-17_

## Project Goal

Build a slow-evolving generative environment where plants exist in quantum superposition until observed. The experience should be calm, contemplative, and grounded in real quantum computation via IonQ.

---

## Current Sprint

### In Progress

_No tasks currently in progress_

### Up Next

- [ ] Implement plant rendering on main PixiJS canvas using lifecycle system
- [ ] Create reticle controller for observation targeting
- [ ] Build observation system with dwell tracking
- [ ] Connect frontend observation to quantum measurement endpoint
- [ ] Seed initial plants with variant assignments

---

## Completed

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

- [ ] **Plant Renderer**: Render plants on main PixiJS canvas using variant lifecycle system
- [ ] **Reticle System**: Implement cursor-following reticle for targeting plants
- [ ] **Observation Mechanics**: Detect reticle-plant alignment and track dwell time
- [ ] **State Collapse Animation**: Animate transition from superposed to collapsed state
- [ ] **Quantum Integration**: Wire frontend observation to quantum measurement endpoint
- [ ] **Plant Seeding**: Create initial batch of plants with quantum circuits and variants
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

- [ ] Add comprehensive test coverage for quantum service
- [ ] Add E2E tests for observation flow
- [ ] Document quantum circuit design decisions in code
- [ ] Add error boundaries in React components
- [ ] Implement proper error handling for IonQ API failures
- [ ] Add tests for lifecycle computation logic

---

## Implementation Status

| Component                    | Status      | Notes                                        |
| ---------------------------- | ----------- | -------------------------------------------- |
| **Frontend (apps/web)**      |             |                                              |
| PixiJS canvas initialization | Done        | Basic setup complete                         |
| Plant rendering (main)       | Not Started | Need to integrate lifecycle system           |
| Variant sandbox              | Done        | Full timeline editor, gallery, playback      |
| Superposed view              | Done        | Pastel palettes, visual development tool     |
| Reticle controller           | Not Started |                                              |
| Observation system           | Not Started | Documented in docs/observation-system.md     |
| Zustand store                | Scaffolded  | Basic structure, needs lifecycle integration |
| tRPC client                  | Done        | Connected and working                        |
| **Shared (packages/shared)** |             |                                              |
| Variant types                | Done        | PlantVariant, GlyphKeyframe, lifecycle types |
| Variant definitions          | Done        | 3 example variants defined                   |
| Lifecycle computation        | Done        | computeLifecycleState, interpolation         |
| **API Layer**                |             |                                              |
| tRPC endpoints               | Scaffolded  | Plants, observation, health routers exist    |
| Prisma schema                | Done        | Full schema with lifecycle fields            |
| Prisma client                | Done        | Generated and working                        |
| **Quantum Service**          |             |                                              |
| FastAPI app                  | Done        | Running on port 18742                        |
| Circuit generation           | Done        | Using Qiskit                                 |
| IonQ integration             | Done        | Client implemented                           |
| Trait mapping                | Done        | Basic mapping in place                       |
| Variant loader               | Done        | Python module to load variant definitions    |
| **Infrastructure**           |             |                                              |
| PostgreSQL                   | Done        | Docker Compose configured                    |
| CI/CD                        | Done        | GitHub Actions workflow                      |
| Pre-commit hooks             | Done        | Linting, formatting, secrets                 |

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
