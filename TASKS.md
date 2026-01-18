# Quantum Garden - Task Tracking

_Last updated: 2026-01-17 (Session 17)_

## Project Goal

Build a slow-evolving generative environment where plants exist in quantum superposition until observed. The experience should be calm, contemplative, and grounded in real quantum computation via IonQ.

---

## Current Sprint

### In Progress

_No tasks currently in progress_

### Up Next

#### Garden Ecosystem Expansion

Expand plant variety to create a richer, more natural garden with visual hierarchy and ecological diversity.

**Design Goals**:

- Maintain calm, pastel aesthetic
- Create visual depth through plant categories
- **Rarity = Visual Reward**: Rarer plants have more interesting glyphs and animations
- Plants should feel like they belong together

**Visual Complexity by Rarity**:

| Rarity      | Animation             | Glyph Complexity           | Effects          |
| ----------- | --------------------- | -------------------------- | ---------------- |
| Very Common | Static or simple loop | Basic shapes (dots, lines) | None             |
| Common      | Gentle sway/pulse     | Simple patterns            | Subtle           |
| Moderate    | Multi-stage lifecycle | Detailed patterns          | Shimmer          |
| Uncommon    | Complex transitions   | Intricate designs          | Color shifts     |
| Rare        | Elaborate sequences   | Unique silhouettes         | Multi-effect     |
| Very Rare   | Stunning, memorable   | One-of-a-kind              | Layered, magical |

**Proposed Plant Categories**:

| Category         | Role                          | Scale    | Rarity Range | Examples                        |
| ---------------- | ----------------------------- | -------- | ------------ | ------------------------------- |
| **Ground Cover** | Background texture            | 0.3-0.5x | Very common  | Moss, lichen, small grasses     |
| **Grasses**      | Gentle movement, fill space   | 0.5-0.8x | Common       | Meadow grass, reeds, ferns      |
| **Flowers**      | Focal interest, color variety | 0.8-1.2x | Moderate     | Current blooms + new species    |
| **Shrubs**       | Mid-ground structure          | 1.0-1.5x | Uncommon     | Bushes, hedges, berry plants    |
| **Trees**        | Landmarks, rare discoveries   | 1.5-3.0x | Rare         | Saplings, bonsai, ancient trees |
| **Ethereal**     | Magical/quantum elements      | Variable | Very rare    | Orbs, crystals, anomalies       |

**Variant Ideas by Category**:

_Ground Cover_ (simple, ambient):

- `soft-moss` - Static spreading texture, fades in slowly
- `pebble-patch` - Tiny dots, no animation

_Grasses_ (gentle motion):

- `meadow-tuft` - 2-frame gentle sway loop
- `whisper-reed` - Thin lines, subtle lean animation
- `curled-fern` - Slow unfurl over long duration

_Flowers_ (lifecycle + color):

- `simple-bloom` - (existing) 4-stage lifecycle, sage palette
- `quantum-tulip` - (existing) multi-color, elegant bloom
- `dewdrop-daisy` - Cluster pattern, sparkle effect on bloom
- `midnight-poppy` - Deep colors, dramatic open/close cycle (uncommon)
- `bell-cluster` - Hanging bells, staggered bloom timing (uncommon)

_Shrubs_ (structure + detail):

- `cloud-bush` - Rounded, breathing scale animation, berry details appear
- `berry-thicket` - Dense pattern, fruits materialize over lifecycle
- `crystal-hedge` - Geometric growth, prismatic color shifts (rare shrub)

_Trees_ (impressive, rare):

- `sapling-hope` - Delicate branching, leaves unfurl one by one
- `weeping-willow` - Cascading fronds with wave animation, tall
- `bonsai-elder` - Twisted trunk, intricate branch pattern, very slow lifecycle (very rare)

_Ethereal_ (magical, very rare):

- `pulsing-orb` - (existing) looping pulse, sky palette
- `quantum-crystal` - Rotating geometric facets, prismatic shimmer, color cycling
- `memory-wisp` - Trailing particles, fade/reform cycle, ghost-like transparency
- `void-bloom` - Inverted colors, petals appear from nothing, reality-bending (legendary)
- `memory-wisp` - Fading trails, ghost-like

**Implementation Tasks**:

- [x] Design 2-3 ground cover variants (soft-moss, pebble-patch)
- [x] Design 2-3 grass variants (meadow-tuft, whisper-reed)
- [ ] Design 2-3 new flower variants
- [ ] Design 1-2 shrub variants
- [ ] Design 1-2 tree variants
- [ ] Add scale property to seed script for size variation
- [ ] Update PlantRenderer to handle scale differences
- [ ] Consider z-ordering by plant category
- [ ] Update seed script with new variant distribution
- [ ] Test visual balance in sandbox

---

## Completed

### 2026-01-17 - Ecosystem Expansion (Phase 1)

- [x] Implement ground cover variants: soft-moss (rarity 1.2), pebble-patch (rarity 1.3)
- [x] Implement grass variants: meadow-tuft (rarity 1.1), whisper-reed (rarity 0.9)
- [x] Add section headers organizing variants by category
- [x] Document scale properties for each variant
- [x] Verify all 83 tests passing (45 shared + 38 web)
- [x] Update README with quantum integration status clarification
- [x] Define "Rarity = Visual Reward" design principle

### 2026-01-17 - Reduced Motion Accessibility

- [x] Add prefers-reduced-motion detection utility
- [x] Add disable-animations class support via globals.css
- [x] Update PlantSprite to skip tweening and effects when reduced motion preferred
- [x] Calm aesthetic preserved when motion reduced

### 2026-01-17 - Error Boundaries

- [x] Create ErrorBoundary component for main garden canvas
- [x] Create SandboxErrorBoundary for variant sandbox page
- [x] Integrate error boundaries into page components
- [x] Calm, minimal error display matching garden aesthetic
- [x] Developer-friendly error display for sandbox

### 2026-01-17 - Performance Optimization

- [x] Add viewport culling to PlantRenderer (skip rendering off-screen plants)
- [x] Add shallow comparison for plant sync (avoid processing on reticle/dwell updates)
- [x] Define SPRITE_SIZE and CULL_MARGIN constants for clarity
- [x] All tests passing: 83 tests (45 shared + 38 web)

### 2026-01-17 - Mobile Support

- [x] Add viewport meta tag with `user-scalable=false` and `viewport-fit=cover`
- [x] Add `touch-action: none` CSS to prevent default touch behaviors
- [x] Add iOS safe area padding for notched devices
- [x] Modify ReticleController to support control modes (autonomous/touch)
- [x] Add `setPosition()` and `setControlMode()` methods to ReticleController
- [x] Add pointer event handlers to GardenCanvas for touch input
- [x] Auto-switch to touch mode on first non-mouse pointer interaction
- [x] Verify all 83 tests pass, linting and type checking pass

### 2026-01-17 - Persistence Verification

- [x] **Persistence already implemented**: Database is source of truth for all plant state
  - Plant positions, observations, traits persist in PostgreSQL
  - Lifecycle computed from germinatedAt timestamps (no sync issues)
  - Zustand store intentionally ephemeral - re-hydrates from database on load
  - Design philosophy: "garden continues to evolve whether anyone is watching"
- [x] Verified database contains persisted plant state

### 2026-01-17 - Garden Evolution System

- [x] Create GardenEvolutionSystem class with periodic check interval (30s)
- [x] Track dormant plants and trigger germination after minimum dormancy (60s)
- [x] Implement 15% germination chance per eligible plant per check
- [x] Add `germinate` mutation to plants router
- [x] Create `useEvolution` hook for triggering germination via tRPC
- [x] Integrate evolution system into GardenCanvas component
- [x] Add cleanup on unmount
- [x] All tests passing: 83 unit tests (45 shared + 38 web)

### 2026-01-17 - Entanglement Visualization

- [x] Update seed script to create entanglement groups (2 pairs of plants)
- [x] Add entanglementGroupId to RenderablePlant interface
- [x] Create EntanglementRenderer class:
  - Draws dashed purple lines connecting entangled plants
  - Pulse animation when observation reveals correlated traits
  - Renders behind plants (z-order)
- [x] Integrate EntanglementRenderer into GardenCanvas
- [x] Implement correlated reveal on observation:
  - When entangled plant is observed, all partners automatically collapse
  - Partners receive correlated traits (same base seed, different offset)
  - Returns entangledPartnersUpdated flag
- [x] Update useObservation hook to refetch plants when entangled partners updated
- [x] All tests passing: 88 unit tests (38 web + 45 shared + 5 E2E)

### 2026-01-17 - Observation Testing and E2E Setup

- [x] Fix observation router bug: handle in-memory regions gracefully
- [x] Verify database has seeded plants (12 plants with variants)
- [x] Set up Playwright E2E testing framework
- [x] Create playwright.config.ts with proper port configuration
- [x] Write E2E test suite (5 tests):
  - Garden canvas renders
  - No console errors on load
  - tRPC plants request is made
  - Observation mutation endpoint accessible
  - Plants show after loading
- [x] Add test:e2e and test:e2e:ui npm scripts
- [x] All tests passing: 83 unit tests + 5 E2E tests

### 2026-01-17 - PlantSprite and PlantRenderer Tests

- [x] Create PlantSprite test suite (13 tests)
  - Initialization for superposed and collapsed plants
  - State transition detection (superposed to collapsed)
  - Collapse transition animation timing (1.5s duration)
  - Rendering with resolved traits vs lifecycle state
  - Fallback rendering for missing variants
  - Position updates on plant movement
- [x] Create PlantRenderer test suite (15 tests)
  - Initialization and container setup
  - Store subscription on start/stop
  - Sprite creation for initial plants
  - Dynamic sprite addition/removal on store updates
  - Sprite reuse on plant data changes
  - Resource cleanup on destroy
  - Sprite lookup by ID
- [x] Implement proper PixiJS mocking with class implementations
- [x] Create mock garden store with subscribe/getState
- [x] Total test coverage: 83 tests (45 lifecycle + 38 web app)

### 2026-01-17 - End-to-End Visual Verification

- [x] Create usePlants hook to fetch plant data and sync to Zustand store
- [x] Integrate usePlants hook into GardenCanvas component
- [x] Verify plants render correctly in browser (12 plants: 8 simple-bloom, 2 pulsing-orb, 2 quantum-tulip)
- [x] Verify reticle moves autonomously across the garden
- [x] Visual confirmation: plants display with correct colors, patterns, and lifecycle states

### 2026-01-17 - Observation Router Integration Tests

- [x] Add vitest as test framework for web app
- [x] Create vitest.config.ts with path alias support
- [x] Add test and test:watch npm scripts to apps/web
- [x] Write integration tests for observation router (10 tests)
- [x] Test recordObservation: plant state collapse with trait generation
- [x] Test recordObservation: error handling (not found, already observed)
- [x] Test deterministic traits from circuit seed
- [x] Test getActiveRegion: active, expired, inactive region scenarios
- [x] Test getHistory: retrieve observation events by plant

### 2026-01-17 - Lifecycle Test Coverage

- [x] Add vitest as test framework for shared package
- [x] Configure turbo `test` task for monorepo-wide testing
- [x] Write comprehensive lifecycle computation tests (45 tests)
- [x] Test `computeLifecycleState` for ungerminated, germinated, and complete lifecycles
- [x] Test `interpolateKeyframes` with pattern, palette, and property blending
- [x] Test color variation selection and effective palette resolution
- [x] Test lifecycle modifier (speed up/slow down) behavior

### 2026-01-17 - Mock Trait Generation

- [x] Implement seeded pseudorandom number generator for reproducible traits
- [x] Create `generateMockTraits()` function using circuit definition as seed
- [x] Replace quantum service call with local mock trait resolution
- [x] Use variant's palette for color selection, with random fallback
- [x] Generate growth rate (0.5-1.5) and opacity (0.7-1.0) from seed
- [x] Update TASKS.md to reflect architectural clarification
- [x] Update observation system documentation with pre-computed approach

### 2026-01-17 - State Collapse Animation

- [x] Implement collapse transition in PlantSprite class
- [x] Track visual state changes to detect superposed to collapsed transition
- [x] Add 1.5-second crossfade animation with ease-out cubic timing
- [x] Render superposed layers fading out while collapsed form fades in
- [x] Add `isCollapseTransitioning` and `collapseProgress` getters

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
- [x] **Quantum Integration**: Wire frontend observation to backend (mock traits, real quantum deferred)
- [x] **Plant Seeding**: Create initial batch of plants with pre-computed traits
- [x] **State Collapse Animation**: Animate transition from superposed to collapsed state

> **Note**: Real-time updates are not needed. Observation is a UX layer over pre-computed data—traits are determined at plant creation, not observation time.

### Medium Priority

_Important features for complete experience_

- [x] **Entanglement Visualization**: Show correlated trait reveals across entangled plants
- [x] **Observation Regions**: Implement invisible regions where observation can occur (part of ObservationSystem)
- [x] **Plant Lifecycle Display**: Show lifecycle keyframes on main canvas (PlantSprite uses lifecycle system)
- [x] **Garden Evolution**: Implement time-based garden progression (dormant plants germinate over time)
- [x] **Persistence**: Save and restore garden state across sessions (already implemented via database)
- [x] **Mobile Support**: Ensure touch-friendly observation on mobile devices

### Low Priority / Polish

_Nice-to-have enhancements_

- [ ] **Ambient Audio**: Add generative soundscape
- [~] **Visual Polish**: Refine plant aesthetics and animations (shimmer + scale pulse added)
- [x] **Performance Optimization**: Optimize for large numbers of plants (viewport culling)
- [ ] **Analytics**: Track observation patterns and garden statistics
- [~] **Accessibility**: Screen reader support and reduced motion options (reduced motion done)
- [x] **Tweening**: Enable smooth interpolation between keyframes (all variants now use tweenBetweenKeyframes)

---

## Technical Debt

- [x] Add error boundaries in React components
- [x] Add tests for observation router logic
- [x] Add tests for PlantSprite and PlantRenderer
- [x] Add E2E tests for observation flow

### Deferred (Quantum Service)

> **⚠️ Do not work on these during autowork.** The quantum service (`apps/quantum/`) is scaffolded but not actively used. Real quantum integration requires explicit coordination.

- [ ] Add comprehensive test coverage for quantum service
- [ ] Document quantum circuit design decisions in code
- [ ] Implement proper error handling for IonQ API failures

---

## Implementation Status

| Component                    | Status   | Notes                                                     |
| ---------------------------- | -------- | --------------------------------------------------------- |
| **Frontend (apps/web)**      |          |                                                           |
| PixiJS canvas initialization | Done     | Full-screen, resize handling                              |
| Plant rendering (main)       | Done     | PlantSprite + PlantRenderer with lifecycle                |
| Entanglement rendering       | Done     | Dashed lines, pulse animation on observation              |
| Variant sandbox              | Done     | Full timeline editor, gallery, playback                   |
| Superposed view              | Done     | Pastel palettes, visual development tool                  |
| Reticle controller           | Done     | Autonomous drift, state machine, edge bounce              |
| Observation system           | Done     | Region management, dwell tracking, cooldown               |
| Evolution system             | Done     | Automatic germination, dormancy tracking                  |
| Zustand store                | Done     | Plant data, dwell state, cooldown state                   |
| tRPC client                  | Done     | Connected and working                                     |
| **Shared (packages/shared)** |          |                                                           |
| Variant types                | Done     | PlantVariant, GlyphKeyframe, lifecycle types              |
| Variant definitions          | Done     | 7 variants: 2 ground cover, 2 grass, 2 flower, 1 ethereal |
| Lifecycle computation        | Done     | computeLifecycleState, interpolation                      |
| Lifecycle tests              | Done     | 45 tests covering all lifecycle functions                 |
| **API Layer**                |          |                                                           |
| tRPC endpoints               | Done     | Plants, observation (tested), health routers              |
| Prisma schema                | Done     | Full schema with lifecycle + entanglement                 |
| Prisma client                | Done     | Generated and working                                     |
| Garden seeding               | Done     | 12 plants, 4 entangled (2 pairs)                          |
| Correlated observation       | Done     | Entangled partners collapse together                      |
| **Quantum Service**          |          |                                                           |
| FastAPI app                  | Done     | Running on port 18742                                     |
| Circuit generation           | Done     | Using Qiskit                                              |
| IonQ integration             | Deferred | Client implemented, real execution deferred               |
| Trait mapping                | Done     | Basic mapping in place                                    |
| Variant loader               | Done     | Python module to load variant definitions                 |
| Mock trait generation        | Done     | Pseudorandom traits seeded from circuit                   |
| **Infrastructure**           |          |                                                           |
| PostgreSQL                   | Done     | Docker Compose configured                                 |
| CI/CD                        | Done     | GitHub Actions workflow                                   |
| Pre-commit hooks             | Done     | Linting, formatting, secrets                              |

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
- **Quantum integration is deferred**: Currently using pseudorandom trait generation. The architecture supports real quantum execution when enabled, but observation UX is identical either way.
- **Observation is a UX layer**: Traits are pre-computed at plant creation. Observation reveals existing data, it does not trigger computation or require real-time updates.
