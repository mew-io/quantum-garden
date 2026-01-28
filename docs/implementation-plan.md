# Implementation Plan: User-Facing Quantum Experience

**Created**: 2026-01-27
**Status**: Active Development
**Goal**: Deliver a functioning quantum simulation experience where the garden renders, evolves autonomously, supports time-travel, and integrates real quantum data from IonQ simulator.

---

## Executive Summary

This plan outlines the transformation of Quantum Garden from a working prototype into a complete user-facing experience. The approach prioritizes fixing the core observation system, then layering on quantum data integration, time-travel capabilities, and enhanced evolution behaviors.

**Development Approach**: Think like a creative director about exceptional UX, think like a system architect about clean implementation.

---

## Current State

### Strengths

- Solid rendering foundation (Three.js with InstancedMesh)
- 14 diverse plant variants with lifecycle animations
- Database with proper schemas and relationships
- IonQ integration infrastructure ready (but inactive)

### Critical Gaps

1. **No region-based observation** - Currently only has debug click handler
2. **No time-travel** - Can't view garden history despite having timestamps
3. **Quantum integration dormant** - Using mock traits instead of real simulator
4. **Limited evolution** - Only basic auto-germination

---

## Design Philosophy

**Observation is not something the viewer does. It is something that occasionally happens in their presence.**

This principle guides all implementation decisions:

- Reticle drifts autonomously (no user control)
- Observation regions are invisible
- No explicit UI instructions or tutorials
- Calm, contemplative pacing
- Garden evolves whether anyone is watching

---

## Implementation Sprints

### Sprint 1: Core Observation System (P0 - CRITICAL)

**Duration**: 2-3 days
**Impact**: CRITICAL - Fixes fundamental design violation

#### The Problem

Current click-based observation violates the contemplative, meditative design. Users should witness observation, not trigger it.

#### The Solution

Implement the designed three-condition alignment system:

1. Plant inside invisible observation region
2. Reticle overlaps that region
3. Reticle overlaps any part of plant

When all three align → observation triggers **immediately** (no dwell time).

#### Key Files

- `apps/web/src/components/garden/observation-system.ts` (NEW)
- `apps/web/src/components/garden/three/garden-scene.tsx` (integration)
- `apps/web/src/lib/three/overlays/debug-overlay.ts` (NEW - debug viz)

#### Deliverables

- [ ] ObservationSystem class with region management
- [ ] Integration into GardenScene with debug mode toggle
- [ ] Debug visualization for tuning parameters
- [ ] Click observation preserved as debug-only feature

#### Success Criteria

- Reticle drifts autonomously
- Observation only occurs through region alignment
- 15-20s cooldown prevents rapid observations
- Debug mode allows switching to click-based observation

---

### Sprint 2: Real Quantum Data Integration (P1)

**Duration**: 2-3 days
**Impact**: HIGH - Activates real quantum computing

#### The Transformation

Switch from mock traits to real IonQ simulator results, treating quantum execution as async background process.

#### Implementation Strategy

**Phase 2A: Pre-compute at Creation**

- When plant is seeded, submit quantum job to IonQ
- Store job ID in database
- Background worker polls for completion
- Traits stored when ready

**Phase 2B: Reveal at Observation**

- Observation checks if traits are ready
- If ready: Collapse immediately
- If pending: Show "quantum computation in progress"
- Graceful degradation to mock traits on failure

#### Key Files

- `apps/web/scripts/seed-garden.ts` (job submission)
- `apps/quantum/src/jobs/worker.py` (background processing)
- `apps/web/src/server/routers/observation.ts` (trait reveal)
- `apps/web/src/components/ui/debug-panel.tsx` (quantum status)

#### Deliverables

- [ ] Quantum job submission at plant creation
- [ ] Background worker processing
- [ ] Observation reveals pre-computed traits
- [ ] Debug panel shows quantum execution status

#### Success Criteria

- Seeds new garden with IonQ simulator enabled
- Background worker processes jobs successfully
- Observations reveal real quantum traits
- Graceful degradation on failures

---

### Sprint 3: Time-Travel Experience (P1)

**Duration**: 2-3 days
**Impact**: HIGH - Creates "wow" moment

#### The Vision

Users scrub through garden history, watching evolution in fast-forward or reverse. See exactly when each plant germinated and was observed.

#### Implementation Architecture

**Backend API**:

- `getStateAtTime(timestamp)` - Reconstruct garden at any moment
- `getEvolutionTimeline(start, end)` - Get event markers

**Frontend UI**:

- Horizontal timeline scrubber
- Event markers (germinations as green dots, observations as blue)
- Draggable playhead
- Auto-play at 10x speed

#### Key Files

- `apps/web/src/server/routers/garden.ts` (NEW - historical queries)
- `apps/web/src/components/garden/time-travel-scrubber.tsx` (NEW - UI)
- `apps/web/src/components/garden/three/garden-scene.tsx` (integration)

#### Deliverables

- [ ] Historical state API endpoints
- [ ] Time-travel scrubber component
- [ ] Keyboard shortcut (T key) to toggle
- [ ] Read-only mode during scrubbing

#### Success Criteria

- Smooth scrubbing through garden history
- Plants show correct states at historical timestamps
- Timeline markers appear for events
- Can return to live view seamlessly

---

### Sprint 4: Enhanced Garden Evolution (P2)

**Duration**: 1-2 days
**Impact**: MEDIUM - Improves liveliness

#### The Goal

Garden feels alive even when not observed. Plants exhibit subtle behaviors, evolution becomes more dynamic.

#### Features

**Lifecycle-Based Animations**:

- Young plants: Gentle scale pulse (0.98-1.02, 3s cycle)
- Mature plants: Subtle rotation sway (±2 degrees, 5s cycle)
- Old plants: Slower movements, opacity variance

**Smart Germination**:

- Proximity bonus: 2x chance near observed plants
- Clustering prevention: Skip dense areas
- Age weighting: Older dormant plants more likely
- Wave patterns: Occasional multi-plant sprouting

**Event Notifications**:

- Subtle toast notifications for germinations
- Entanglement observation alerts
- Bottom-right corner, 3s duration
- Never intrusive

#### Key Files

- `apps/web/src/lib/three/plants/plant-instancer.ts` (animations)
- `apps/web/src/components/garden/garden-evolution.ts` (smart germination)
- `apps/web/src/components/garden/evolution-notifications.tsx` (NEW - toasts)

#### Deliverables

- [ ] Shader-based lifecycle animations
- [ ] Enhanced germination logic
- [ ] Calm notification system

#### Success Criteria

- Plants feel alive with subtle movements
- Germination follows smart logic
- Notifications enhance rather than distract
- Garden evolution visible even when idle

---

### Sprint 5: Educational & Polish (P2-P3)

**Duration**: 1-2 days
**Impact**: MEDIUM - Enhances meaning

#### Features

**Post-Observation Context Panel**:

- Circuit type used (e.g., "Bell Pair - Entanglement")
- Simplified circuit diagram
- Brief quantum concept explanation
- "Learn More" links
- Dismissible, preference saved

**Enhanced Observation Feedback**:

- Color-matched celebration effects
- Entanglement pulse shows quantum correlation
- Subtle sound effects (respects system settings)
- Haptic feedback varies by rarity

**Performance Optimization**:

- Verify frustum culling
- LOD for distant plants
- Spatial indexing (quadtree) for region checks
- Paginated historical queries

#### Key Files

- `apps/web/src/components/garden/observation-context-panel.tsx` (NEW)
- `apps/web/src/lib/three/overlays/feedback-overlay.ts` (enhancements)
- `apps/web/src/lib/three/plants/plant-instancer.ts` (optimization)

#### Deliverables

- [ ] Educational context panel
- [ ] Enhanced feedback effects
- [ ] Performance optimizations

#### Success Criteria

- 60fps rendering with 100+ plants
- No memory leaks after extended sessions
- Time-travel queries <500ms
- Educational content is discoverable but not intrusive

---

## Testing Strategy

### Unit Testing

- ObservationSystem alignment detection
- Historical state computation accuracy
- Smart germination probability calculations
- Region positioning algorithms

### Integration Testing

- Observation triggers correctly on alignment
- Quantum job submission and trait reveal flow
- Time-travel state reconstruction
- Entanglement correlation

### User Experience Testing

- Observation feels natural and inevitable
- Time-travel is intuitive and smooth
- Evolution is visible but not distracting
- Garden maintains calm aesthetic throughout

---

## Success Metrics

### Creative Director Perspective

- ✓ Observation feels meditative and inevitable, not gamey
- ✓ Garden evolution is visible and engaging over time
- ✓ Time-travel creates "wow" moment of seeing history
- ✓ Quantum connection is educational and meaningful

### System Architect Perspective

- ✓ Observation system is modular and testable
- ✓ Quantum integration is async and fault-tolerant
- ✓ Time-travel queries are efficient and accurate
- ✓ All systems respect the calm, contemplative design philosophy

---

## Risk Mitigation

### Technical Risks

**IonQ API Issues**:

- Mitigation: Graceful degradation to mock traits
- Monitoring: Debug panel shows execution mode
- Testing: Verify both quantum and mock paths

**Performance Degradation**:

- Mitigation: Frustum culling, spatial indexing
- Monitoring: FPS counter in debug panel
- Testing: Stress test with 500+ plants

**Time-Travel Query Performance**:

- Mitigation: Pagination, debounced queries
- Monitoring: Query timing logs
- Testing: Large gardens with extensive history

### Design Risks

**Observation Too Rare**:

- Mitigation: Debug visualization for tuning
- Parameters: Region size, reticle speed, cooldown
- Testing: Empirical observation frequency testing

**Time-Travel Complexity**:

- Mitigation: Clear UI, gradual discovery
- Design: Hidden by default, keyboard shortcut
- Testing: User comprehension testing

---

## Future Enhancements (Out of Scope)

- Ambient audio / generative soundscape
- Gallery installation mode adaptations
- Analytics and observation pattern tracking
- Custom variant designer
- Multiple garden instances with cross-garden entanglement
- Seasonal variations in circuits
- Full screen reader support

---

## References

- [TASKS.md](../TASKS.md) - Detailed task tracking
- [observation-system.md](./observation-system.md) - Observation design spec
- [architecture.md](./architecture.md) - System architecture
- [quantum-circuits.md](./quantum-circuits.md) - Circuit design documentation
