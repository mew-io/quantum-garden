# Quantum Garden - Task List

_Last updated: 2026-01-28 (Evolution System Fix + Comprehensive Task Cleanup)_

## Project Status

The garden is now continuously evolving with the `GardenEvolutionSystem` properly integrated. The critical bug where the evolution system was never started has been fixed.

**Current Focus**: Bug fixes, performance optimization, and polish. Accessibility and mobile touch are deferred to the final phase.

---

## Active Tasks (96 Total)

### Phase 1: Evolution System Fix - COMPLETED

| #   | Task                                             | Status  |
| --- | ------------------------------------------------ | ------- |
| 1   | Create `useEvolutionSystem` hook                 | ✅ Done |
| 2   | Call `useEvolutionSystem` in GardenScene         | ✅ Done |
| 3   | Add time-travel mode subscription (pause/resume) | ✅ Done |
| 4   | Add evolution state to store                     | ✅ Done |
| 5   | Add `pause()`/`resume()` methods                 | ✅ Done |
| 6   | Remove unused `germinationCallbackRef`           | ✅ Done |
| 7   | Add `running` getter to GardenEvolutionSystem    | ✅ Done |
| 8   | Log evolution events via debugLogger             | ✅ Done |

### Phase 2: Bugs & Performance

| #   | Task                                                        | Priority | File                       |
| --- | ----------------------------------------------------------- | -------- | -------------------------- |
| 66  | Fix vector plant geometry rebuilding every frame            | P0       | `vector-plant-overlay.ts`  |
| 67  | Debounce store subscriptions in garden-scene                | P1       | `garden-scene.tsx`         |
| 68  | Fix empty plants array edge case                            | P1       | `page.tsx`                 |
| 69  | Add user-facing error notification for observation failures | P1       | `use-observation.ts`       |
| 70  | Fix time-travel edge cases (zero duration, stale now)       | P2       | `time-travel-scrubber.tsx` |
| 71  | Implement circular buffer for debug logs                    | P2       | `debug-logger.ts`          |
| 72  | Apply consistent safe area padding                          | P2       | Multiple files             |
| 73  | Fix toolbar overflow on small screens                       | P1       | `toolbar.tsx`              |
| 74  | Make spatial grid adaptive to plant distribution            | P3       | `spatial-grid.ts`          |
| 80  | Investigate z-layer sorting overhead                        | P2       | `plant-instancer.ts`       |
| 81  | Deduplicate polling across components                       | P1       | `use-plants.ts`            |
| 82  | Implement geometry pooling for vector primitives            | P1       | `vector-plant-overlay.ts`  |
| 83  | Audit texture atlas packing efficiency                      | P3       | `texture-atlas.ts`         |
| 84  | Use partial buffer updates for dirty instances              | P2       | `plant-instancer.ts`       |
| 85  | Add `hasActiveAnimations()` check to overlays               | P2       | `overlay-manager.ts`       |
| 86  | Shallow compare entanglement groups before rebuild          | P2       | `entanglement-overlay.ts`  |
| 87  | Skip frame-level syncPlants when store just synced          | P1       | `garden-scene.tsx`         |
| 88  | Profile render loop for 1000 plants                         | P2       | -                          |
| 89  | Cache previous keyframe meshes in vector overlay            | P2       | `vector-plant-overlay.ts`  |
| 90  | Add performance monitoring to debug panel                   | P3       | `debug-panel.tsx`          |

### Phase 3: Evolution Improvements

| #   | Task                                                        | Priority | File                          |
| --- | ----------------------------------------------------------- | -------- | ----------------------------- |
| 9   | Add guaranteed germination after 15 min dormancy            | P1       | `evolution-logic.ts`          |
| 10  | Add minimum dormant count for wave events                   | P2       | `evolution-logic.ts`          |
| 11  | Improve wave distribution (prefer spatial spread)           | P2       | `garden-evolution.ts`         |
| 12  | Add per-plant germination cooldown near recent germinations | P2       | `garden-evolution.ts`         |
| 13  | Create EvolutionStatusIndicator component                   | P2       | NEW                           |
| 14  | Update debug panel evolution badge to read from store       | P2       | `debug-panel.tsx`             |
| 15  | Batch wave notifications                                    | P2       | `use-evolution.ts`            |
| 16  | Add wave notification style                                 | P3       | `evolution-notifications.tsx` |
| 17  | Show "Evolution Paused" during time-travel                  | P2       | `page.tsx`                    |
| 18  | Add dormant plant count to debug panel                      | P3       | `debug-panel.tsx`             |
| 19  | Add last germination time to debug panel                    | P3       | `debug-panel.tsx`             |
| 20  | Reduce CHECK_INTERVAL from 30s to 15s                       | P2       | `garden-evolution.ts`         |

### Phase 4: User Feedback & Discoverability

| #   | Task                                              | Priority | File                            |
| --- | ------------------------------------------------- | -------- | ------------------------------- |
| 46  | Add dwell-time observation mode                   | P1       | `observation-system.ts`         |
| 47  | Connect dwell progress to store                   | P1       | `observation-system.ts`         |
| 48  | Create cooldown indicator component               | P1       | NEW                             |
| 49  | Position cooldown indicator near corner           | P2       | `page.tsx`                      |
| 50  | Increase notification duration to 5-6s            | P1       | `evolution-notifications.tsx`   |
| 51  | Increase context panel duration to 30s            | P1       | `observation-context-panel.tsx` |
| 52  | Add pause-on-hover for notifications              | P2       | `evolution-notifications.tsx`   |
| 53  | Add progress indicator to notifications           | P3       | `evolution-notifications.tsx`   |
| 54  | Increase event marker touch targets to 20px       | P1       | `time-travel-scrubber.tsx`      |
| 55  | Add event marker tooltips                         | P2       | `time-travel-scrubber.tsx`      |
| 56  | Add confirmation when switching observation modes | P3       | `debug-panel.tsx`               |
| 57  | Add keyboard shortcut hints to info overlay       | P1       | `info-overlay.tsx`              |
| 58  | Create optional onboarding tour                   | P3       | NEW                             |
| 59  | Add "first observation" celebration               | P3       | `use-observation.ts`            |
| 60  | Gate debug panel behind env variable              | P1       | `debug-panel.tsx`               |
| 61  | Hide debug button in toolbar for production       | P1       | `toolbar.tsx`                   |
| 62  | Add keyboard shortcut discovery hint              | P2       | `page.tsx`                      |
| 63  | Add "Don't show again" reset in settings          | P3       | `observation-context-panel.tsx` |
| 64  | Show entanglement lines more prominently          | P2       | `entanglement-overlay.ts`       |
| 65  | Add entanglement legend to info overlay           | P2       | `info-overlay.tsx`              |

### Phase 5: Quantum Accuracy

| #   | Task                                                  | Priority | File                 |
| --- | ----------------------------------------------------- | -------- | -------------------- |
| 75  | Fix entanglement to use correlated pool indices       | P2       | `observation.ts`     |
| 76  | Align mock trait algorithm with quantum mapping       | P2       | `observation.ts`     |
| 77  | Parameterize growth rate calculation for qubit count  | P3       | `observation.ts`     |
| 78  | Review opacity-from-consistency logic                 | P3       | `observation.ts`     |
| 79  | Consider probability-weighted superposition rendering | P3       | `plant-instancer.ts` |

### Phase 6: Polish

| #   | Task                                                | Priority | File                            |
| --- | --------------------------------------------------- | -------- | ------------------------------- |
| 91  | Standardize auto-dismiss timers in constants        | P2       | `constants.ts`                  |
| 92  | Rename "Return to Live" to "Exit Timeline"          | P2       | `time-travel-scrubber.tsx`      |
| 93  | Smooth debug panel data refreshes                   | P3       | `debug-panel.tsx`               |
| 94  | Make celebration outer ring use complementary color | P3       | `feedback-overlay.ts`           |
| 95  | Increase entanglement wave size and add glow        | P2       | `entanglement-overlay.ts`       |
| 96  | Limit notification stacking to 3 max                | P2       | `evolution-notifications.tsx`   |
| 97  | Add plant highlight pulsing in debug mode           | P3       | `debug-overlay.ts`              |
| 98  | Improve context panel animation                     | P3       | `observation-context-panel.tsx` |
| 99  | Add time-travel explanation to help                 | P2       | `info-overlay.tsx`              |
| 100 | Add loading state during initial plant fetch        | P2       | `page.tsx`                      |
| 101 | Complete keyboard shortcuts list                    | P2       | `toolbar.tsx`                   |
| 102 | Plan sound effects system                           | P3       | -                               |
| 103 | Add playback speed control to time-travel           | P3       | `time-travel-scrubber.tsx`      |
| 104 | Add "scrub to now" quick button                     | P3       | `time-travel-scrubber.tsx`      |

### Phase 7: Testing & Documentation

| #   | Task                                      | Priority | File                      |
| --- | ----------------------------------------- | -------- | ------------------------- |
| 105 | Add GardenEvolutionSystem unit tests      | P1       | NEW                       |
| 106 | Add useEvolutionSystem hook tests         | P1       | NEW                       |
| 107 | Add integration test for germination flow | P2       | NEW                       |
| 108 | Add tests for wave germination logic      | P2       | `evolution-logic.test.ts` |
| 109 | Add tests for guaranteed germination      | P2       | `evolution-logic.test.ts` |
| 110 | Add store tests for evolution state       | P2       | NEW                       |
| 111 | Add visual regression test checklist      | P3       | `docs/testing.md`         |
| 112 | Update README with evolution system info  | P2       | `README.md`               |
| 113 | Add JSDoc to useEvolutionSystem hook      | P2       | `use-evolution-system.ts` |
| 114 | Update architecture docs                  | P2       | `docs/architecture.md`    |
| 117 | Test with 100+ plants for performance     | P2       | -                         |
| 118 | Test extended session for memory leaks    | P2       | -                         |

---

## Deferred Tasks (25 Total)

**Note: Accessibility and Mobile touch interaction are deferred until explicitly requested.**

### Accessibility (12 tasks)

| #   | Task                                          | Priority |
| --- | --------------------------------------------- | -------- |
| 21  | Remove zoom restrictions                      | P0       |
| 22  | Add `prefersReducedMotion` state              | P1       |
| 23  | Respect reduced motion in reticle             | P1       |
| 24  | Disable shader animations when reduced motion | P1       |
| 25  | Add `motion-reduce:` classes                  | P2       |
| 26  | Add ARIA live region for observations         | P2       |
| 27  | Add skip-to-main-content link                 | P3       |
| 28  | Add `role="application"` to canvas            | P2       |
| 29  | Provide text alternative for stats            | P3       |
| 30  | Ensure color contrast (WCAG AA)               | P3       |
| 31  | Add keyboard navigation for scrubber          | P2       |
| 32  | Add ARIA labels to buttons                    | P2       |

### Mobile Touch Interaction (13 tasks)

| #   | Task                                  | Priority |
| --- | ------------------------------------- | -------- |
| 33  | Detect touch device on mount          | P0       |
| 34  | Register touch event listeners        | P0       |
| 35  | Activate touch control mode           | P0       |
| 36  | Map touch position to canvas          | P0       |
| 37  | Implement touch-hold observation      | P0       |
| 38  | Show dwell indicator on touch hold    | P1       |
| 39  | Cancel observation on touch move      | P1       |
| 40  | Add touch feedback visual             | P2       |
| 41  | Make context panel responsive         | P1       |
| 42  | Scale circuit diagrams for mobile     | P1       |
| 43  | Make toolbar collapsible              | P2       |
| 44  | Increase touch targets to 44px        | P1       |
| 45  | Adjust time-travel scrubber for touch | P2       |

---

## Completed Work

### 2026-01-28 - Evolution System Fix

- ✅ Created `useEvolutionSystem` hook to manage evolution lifecycle
- ✅ Integrated hook into GardenScene component
- ✅ Added time-travel mode pause/resume
- ✅ Added evolution state to store (`evolutionPaused`, `evolutionStats`)
- ✅ Added `pause()`, `resume()`, `running` getter to GardenEvolutionSystem
- ✅ Enhanced logging via debugLogger
- ✅ Removed unused `germinationCallbackRef`
- ✅ All 128 tests passing

### Previous Work (Archived)

See `docs/archive/sessions/` for detailed session notes from previous sprints:

- Sprint 1: Core Observation System
- Sprint 2: Real Quantum Data Integration
- Sprint 3: Time-Travel Experience
- Sprint 4: Enhanced Garden Evolution
- Sprint 5: Educational & Polish
- Automated Validation Tests (119 tests)

---

## Technical Debt

### Quantum Service (Requires Coordination)

- [ ] Add comprehensive test coverage
- [ ] Document quantum circuit design decisions
- [ ] Implement proper error handling for IonQ API failures

### Out of Scope (Future)

- Ambient audio / generative soundscape
- Gallery installation mode
- Analytics and observation pattern tracking
- Custom variant designer
- Multiple garden instances
- Seasonal variations
- Screen reader support (deferred)

---

## Success Metrics

### Creative Director Perspective

- Garden feels alive with continuous evolution
- Observation feels meditative and inevitable
- Time-travel creates "wow" moment

### System Architect Perspective

- 60fps with 1000 plants
- No memory leaks in extended sessions
- All tests passing (128+)
