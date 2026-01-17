# Quantum Garden - Task Tracking

_Last updated: 2026-01-16_

## Project Goal

Build a slow-evolving generative environment where plants exist in quantum superposition until observed. The experience should be calm, contemplative, and grounded in real quantum computation via IonQ.

---

## Current Sprint

### In Progress

_No tasks currently in progress_

### Up Next

- [ ] Implement plant rendering in PixiJS canvas
- [ ] Create reticle controller for observation targeting
- [ ] Build observation system with dwell tracking
- [ ] Connect frontend to quantum service for measurements

---

## Completed

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

---

## Backlog

### High Priority

_Core functionality needed for a working demo_

- [ ] **Plant Renderer**: Render plants on PixiJS canvas with superposed/collapsed visual states
- [ ] **Reticle System**: Implement cursor-following reticle for targeting plants
- [ ] **Observation Mechanics**: Detect reticle-plant alignment and track dwell time
- [ ] **State Collapse Animation**: Animate transition from superposed to collapsed state
- [ ] **Quantum Integration**: Wire frontend observation to quantum measurement endpoint
- [ ] **Plant Seeding**: Create initial batch of plants with quantum circuits
- [ ] **Real-time Updates**: Broadcast observation results to all connected clients

### Medium Priority

_Important features for complete experience_

- [ ] **Entanglement Visualization**: Show correlated trait reveals across entangled plants
- [ ] **Observation Regions**: Implement invisible regions where observation can occur
- [ ] **Garden Evolution**: Implement time-based garden progression
- [ ] **Plant Lifecycle**: Handle plant creation, growth, and decay
- [ ] **Persistence**: Save and restore garden state across sessions
- [ ] **Mobile Support**: Ensure touch-friendly observation on mobile devices

### Low Priority / Polish

_Nice-to-have enhancements_

- [ ] **Ambient Audio**: Add generative soundscape
- [ ] **Visual Polish**: Refine plant aesthetics and animations
- [ ] **Performance Optimization**: Optimize for large numbers of plants
- [ ] **Analytics**: Track observation patterns and garden statistics
- [ ] **Accessibility**: Screen reader support and reduced motion options

---

## Technical Debt

- [ ] Add comprehensive test coverage for quantum service
- [ ] Add E2E tests for observation flow
- [ ] Document quantum circuit design decisions in code
- [ ] Add error boundaries in React components
- [ ] Implement proper error handling for IonQ API failures

---

## Implementation Status

| Component                    | Status      | Notes                                     |
| ---------------------------- | ----------- | ----------------------------------------- |
| **Frontend (apps/web)**      |             |                                           |
| PixiJS canvas initialization | Done        | Basic setup complete                      |
| Plant rendering              | Not Started | Need visual design + implementation       |
| Reticle controller           | Not Started |                                           |
| Observation system           | Not Started | Documented in docs/observation-system.md  |
| Zustand store                | Scaffolded  | Basic structure in place                  |
| tRPC client                  | Done        | Connected and working                     |
| **API Layer**                |             |                                           |
| tRPC endpoints               | Scaffolded  | Plants, observation, health routers exist |
| Prisma schema                | Done        | Full schema implemented                   |
| Prisma client                | Done        | Generated and working                     |
| **Quantum Service**          |             |                                           |
| FastAPI app                  | Done        | Running on port 18742                     |
| Circuit generation           | Done        | Using Qiskit                              |
| IonQ integration             | Done        | Client implemented                        |
| Trait mapping                | Done        | Basic mapping in place                    |
| **Infrastructure**           |             |                                           |
| PostgreSQL                   | Done        | Docker Compose configured                 |
| CI/CD                        | Done        | GitHub Actions workflow                   |
| Pre-commit hooks             | Done        | Linting, formatting, secrets              |

---

## Ideas & Future Exploration

- Gallery/installation mode with large display
- Multiple garden instances with cross-garden entanglement
- Historical garden archives (time-lapse of past states)
- Visitor presence indicators (anonymous, privacy-respecting)
- Seasonal variations in quantum circuit parameters
- Rare plant mutations from unusual quantum outcomes

---

## Notes

- IonQ compute credits: Up to $15,000 available via Qollab partnership
- Funding: Up to $5,000 USD for development
- Target: Web-based experience, potentially adaptable to gallery installation
- Philosophy: Calm, contemplative, slow - visitors are observers, not controllers
