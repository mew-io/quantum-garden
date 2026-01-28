# Quantum Garden - Task List

_Last updated: 2026-01-28 (Circular buffer for debug logs)_

## Project Status

The garden is now continuously evolving with the `GardenEvolutionSystem` properly integrated. The critical bug where the evolution system was never started has been fixed.

**Current Focus**: Bug fixes, performance optimization, and polish. Accessibility and mobile touch are deferred to the final phase.

---

## Active Tasks (95 Total)

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

| #   | Task                                                            | Priority | File                       |
| --- | --------------------------------------------------------------- | -------- | -------------------------- |
| 66  | ~~Fix vector plant geometry rebuilding every frame~~            | ✅ Done  | `vector-plant-overlay.ts`  |
| 67  | ~~Debounce store subscriptions in garden-scene~~                | ✅ Done  | `garden-scene.tsx`         |
| 68  | ~~Fix empty plants array edge case~~                            | ✅ Done  | `page.tsx`                 |
| 69  | ~~Add user-facing error notification for observation failures~~ | ✅ Done  | `use-observation.ts`       |
| 70  | ~~Fix time-travel edge cases (zero duration, stale now)~~       | ✅ Done  | `time-travel-scrubber.tsx` |
| 71  | ~~Implement circular buffer for debug logs~~                    | ✅ Done  | `debug-logger.ts`          |
| 72  | Apply consistent safe area padding                              | P2       | Multiple files             |
| 73  | ~~Fix toolbar overflow on small screens~~                       | ✅ Done  | `toolbar.tsx`              |
| 74  | Make spatial grid adaptive to plant distribution                | P3       | `spatial-grid.ts`          |
| 80  | Investigate z-layer sorting overhead                            | P2       | `plant-instancer.ts`       |
| 81  | ~~Deduplicate polling across components~~                       | ✅ Done  | `use-plants.ts`            |
| 82  | ~~Implement material pooling for vector primitives~~            | Done     | `vector-plant-overlay.ts`  |
| 83  | Audit texture atlas packing efficiency                          | P3       | `texture-atlas.ts`         |
| 84  | Use partial buffer updates for dirty instances                  | P2       | `plant-instancer.ts`       |
| 85  | Add `hasActiveAnimations()` check to overlays                   | P2       | `overlay-manager.ts`       |
| 86  | Shallow compare entanglement groups before rebuild              | P2       | `entanglement-overlay.ts`  |
| 87  | ~~Skip frame-level syncPlants when store just synced~~          | ✅ Done  | `garden-scene.tsx`         |
| 88  | Profile render loop for 1000 plants                             | P2       | -                          |
| 89  | Cache previous keyframe meshes in vector overlay                | P2       | `vector-plant-overlay.ts`  |
| 90  | Add performance monitoring to debug panel                       | P3       | `debug-panel.tsx`          |

### Phase 3: Evolution Improvements

| #   | Task                                                            | Priority | File                             |
| --- | --------------------------------------------------------------- | -------- | -------------------------------- |
| 9   | ~~Add guaranteed germination after 15 min dormancy~~            | ✅ Done  | `evolution-logic.ts`             |
| 10  | ~~Add minimum dormant count for wave events~~                   | ✅ Done  | `garden-evolution.ts`            |
| 11  | ~~Improve wave distribution (prefer spatial spread)~~           | ✅ Done  | `garden-evolution.ts`            |
| 12  | ~~Add per-plant germination cooldown near recent germinations~~ | ✅ Done  | `garden-evolution.ts`            |
| 13  | Create EvolutionStatusIndicator component                       | P2       | NEW                              |
| 14  | Update debug panel evolution badge to read from store           | P2       | `debug-panel.tsx`                |
| 15  | Batch wave notifications                                        | P2       | `use-evolution.ts`               |
| 16  | Add wave notification style                                     | P3       | `evolution-notifications.tsx`    |
| 17  | ~~Show "Evolution Paused" during time-travel~~                  | ✅ Done  | `evolution-paused-indicator.tsx` |
| 18  | Add dormant plant count to debug panel                          | P3       | `debug-panel.tsx`                |
| 19  | Add last germination time to debug panel                        | P3       | `debug-panel.tsx`                |
| 20  | ~~Reduce CHECK_INTERVAL from 30s to 15s~~                       | ✅ Done  | `garden-evolution.ts`            |

### Phase 4: User Feedback & Discoverability

| #   | Task                                              | Priority | File                            |
| --- | ------------------------------------------------- | -------- | ------------------------------- |
| 46  | ~~Add dwell-time observation mode~~               | ✅ Done  | `observation-system.ts`         |
| 47  | ~~Connect dwell progress to store~~               | ✅ Done  | `observation-system.ts`         |
| 48  | ~~Create cooldown indicator component~~           | ✅ Done  | `cooldown-indicator.tsx`        |
| 49  | ~~Position cooldown indicator near corner~~       | ✅ Done  | `page.tsx`                      |
| 50  | ~~Increase notification duration to 5-6s~~        | ✅ Done  | `evolution-notifications.tsx`   |
| 51  | ~~Increase context panel duration to 30s~~        | ✅ Done  | `observation-context-panel.tsx` |
| 52  | ~~Add pause-on-hover for notifications~~          | ✅ Done  | `evolution-notifications.tsx`   |
| 53  | Add progress indicator to notifications           | P3       | `evolution-notifications.tsx`   |
| 54  | ~~Increase event marker touch targets to 20px~~   | ✅ Done  | `time-travel-scrubber.tsx`      |
| 55  | ~~Add event marker tooltips~~                     | ✅ Done  | `time-travel-scrubber.tsx`      |
| 56  | Add confirmation when switching observation modes | P3       | `debug-panel.tsx`               |
| 57  | ~~Add keyboard shortcut hints to info overlay~~   | ✅ Done  | `info-overlay.tsx`              |
| 58  | Create optional onboarding tour                   | P3       | NEW                             |
| 59  | Add "first observation" celebration               | P3       | `use-observation.ts`            |
| 60  | ~~Gate debug panel behind env variable~~          | ✅ Done  | `debug-panel.tsx`               |
| 61  | ~~Hide debug button in toolbar for production~~   | ✅ Done  | `toolbar.tsx`                   |
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
| 92  | ~~Rename "Return to Live" to "Exit Timeline"~~      | ✅ Done  | `time-travel-scrubber.tsx`      |
| 93  | Smooth debug panel data refreshes                   | P3       | `debug-panel.tsx`               |
| 94  | Make celebration outer ring use complementary color | P3       | `feedback-overlay.ts`           |
| 95  | Increase entanglement wave size and add glow        | P2       | `entanglement-overlay.ts`       |
| 96  | ~~Limit notification stacking to 3 max~~            | ✅ Done  | `garden-store.ts`               |
| 97  | Add plant highlight pulsing in debug mode           | P3       | `debug-overlay.ts`              |
| 98  | Improve context panel animation                     | P3       | `observation-context-panel.tsx` |
| 99  | Add time-travel explanation to help                 | P2       | `info-overlay.tsx`              |
| 100 | ~~Add loading state during initial plant fetch~~    | ✅ Done  | `page.tsx`                      |
| 101 | Complete keyboard shortcuts list                    | P2       | `toolbar.tsx`                   |
| 102 | Plan sound effects system                           | P3       | -                               |
| 103 | Add playback speed control to time-travel           | P3       | `time-travel-scrubber.tsx`      |
| 104 | Add "scrub to now" quick button                     | P3       | `time-travel-scrubber.tsx`      |

### Phase 7: Testing & Documentation

| #   | Task                                      | Priority | File                           |
| --- | ----------------------------------------- | -------- | ------------------------------ |
| 105 | ~~Add GardenEvolutionSystem unit tests~~  | ✅ Done  | `garden-evolution.test.ts`     |
| 106 | ~~Add useEvolutionSystem hook tests~~     | ✅ Done  | `use-evolution-system.test.ts` |
| 107 | Add integration test for germination flow | P2       | NEW                            |
| 108 | Add tests for wave germination logic      | P2       | `evolution-logic.test.ts`      |
| 109 | ~~Add tests for guaranteed germination~~  | ✅ Done  | `evolution-logic.test.ts`      |
| 110 | Add store tests for evolution state       | P2       | NEW                            |
| 111 | Add visual regression test checklist      | P3       | `docs/testing.md`              |
| 112 | Update README with evolution system info  | P2       | `README.md`                    |
| 113 | Add JSDoc to useEvolutionSystem hook      | P2       | `use-evolution-system.ts`      |
| 114 | Update architecture docs                  | P2       | `docs/architecture.md`         |
| 117 | Test with 100+ plants for performance     | P2       | -                              |
| 118 | Test extended session for memory leaks    | P2       | -                              |

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

### 2026-01-28 - Circular Buffer for Debug Logs

- Implemented circular buffer for debug logs (#71)
- Created `CircularBuffer<T>` generic class with O(1) add operations
- Buffer uses fixed-size array with head pointer and count tracking
- When full, new entries automatically overwrite oldest entries
- No more array `slice()` operations on every log entry
- Methods: `push()`, `toArray()`, `clear()`, `length` getter
- Updated `DebugLogger` to use `CircularBuffer<LogEntry>` instead of array
- Updated `subscribe()`, `getLogs()`, `clear()`, and `log()` methods
- Fixed flaky test "should prefer spatially distributed plants during wave events"
- All 178 tests passing (60 shared + 118 web)

### 2026-01-28 - Per-Plant Germination Cooldown

- Implemented per-plant germination cooldown system (#12)
- Added cooldown constants to `EVOLUTION`:
  - `COOLDOWN_RADIUS: 200` - distance threshold for cooldown effect
  - `COOLDOWN_DURATION: 120_000` - 2 minute cooldown period
  - `COOLDOWN_MULTIPLIER: 0.3` - 30% normal germination chance near recent germinations
- Added `recentGerminations: Map<string, number>` to track germination timestamps
- Implemented `getCooldownMultiplier()` method:
  - Automatically cleans up expired cooldowns
  - Returns 0.3 multiplier for plants within cooldown radius of recent germinations
  - Returns 1.0 (no penalty) for plants outside cooldown radius
- Updated `getGerminationProbability()` to apply cooldown multiplier
- Guaranteed germination (15+ min dormancy) bypasses cooldown - uses early return
- Added 3 new tests in `garden-evolution.test.ts`:
  - "should apply cooldown penalty to plants near recent germinations"
  - "should not apply cooldown to plants far from recent germinations"
  - "should allow cooldown to expire after COOLDOWN_DURATION"
- All 178 tests passing (60 shared + 118 web)

### 2026-01-28 - Wave Spatial Distribution

- Implemented spatial distribution for wave germination events (#11)
- Added `WAVE_MIN_SPACING: 200` constant (minimum distance between wave-selected plants)
- Added `selectSpatiallyDistributedPlants()` method using greedy algorithm
- Algorithm: picks random starting plant, then iteratively picks plants maximizing minimum distance to already-selected plants
- Wave events now use spatial selection instead of random iteration
- Creates more visually pleasing wave effects spread across the garden
- Added 1 new test: "should prefer spatially distributed plants during wave events"
- All 175 tests passing (60 shared + 115 web)

### 2026-01-28 - Reduced Evolution Check Interval

- Reduced `CHECK_INTERVAL` from 30 seconds to 15 seconds in `garden-evolution.ts` (#20)
- Garden evolution checks now occur twice as frequently
- Makes the garden feel more responsive and alive
- Germination opportunities evaluated more often
- No probability changes - intentionally allowing faster evolution
- All 174 tests passing (60 shared + 114 web)

### 2026-01-28 - Wave Minimum Dormant Count

- Added `WAVE_MIN_DORMANT_COUNT` constant (5) to `garden-evolution.ts` (#10)
- Wave germination events now require at least 5 dormant plants to trigger
- Prevents waves from occurring when the garden is sparse
- Added `canWave` check before wave probability roll
- Added 2 new tests in `garden-evolution.test.ts`:
  - "should limit germinations to MAX_GERMINATIONS_PER_CHECK when below WAVE_MIN_DORMANT_COUNT"
  - "should allow wave germinations (3+) when at or above WAVE_MIN_DORMANT_COUNT"
- All 174 tests passing (60 shared + 114 web)

### 2026-01-28 - Evolution Paused Indicator

- Created `evolution-paused-indicator.tsx` component (#17)
- Shows subtle amber-colored "Evolution Paused" indicator during time-travel mode
- Positioned top-center with pause icon and text
- Uses backdrop blur and animation for smooth appearance
- Only visible when both `isTimeTravelMode` and `evolutionPaused` are true
- ARIA live region for accessibility
- Integrated into `page.tsx` component tree
- All 172 tests passing

### 2026-01-28 - Notification Stacking Limit

- Limited notification stacking to 3 max in `garden-store.ts` (#96)
- Modified `addNotification` to keep only the last 2 existing notifications
- Combined with the new notification = max 3 visible at once
- Oldest notifications automatically removed when limit is reached
- Uses `slice(-2)` to keep the most recent notifications
- Prevents notification overload during rapid germination events or wave germinations
- All 172 tests passing

### 2026-01-28 - Pause-on-Hover Notifications

- Implemented pause-on-hover functionality in `evolution-notifications.tsx` (#52)
- Timer pauses when user hovers over notification, resumes with remaining time on leave
- Used `useRef` for timer state to avoid re-renders (`remainingTimeRef`, `startTimeRef`, `timerRef`)
- Extracted `DISMISS_DURATION` constant (5000ms)
- Added `onMouseEnter`/`onMouseLeave` handlers to notification component
- All 172 tests passing

### 2026-01-28 - Time-Travel Edge Cases Fix

- Fixed two edge cases in `time-travel-scrubber.tsx` (#70)
- **Stale `now` value**: Changed from useMemo with empty deps to useState with useEffect that updates every 10s when expanded
- **Zero duration**: Added `Math.max(1000, end - start)` to ensure minimum 1 second duration
- Additional safety improvements: clamped scrub position, playhead progress, and event marker positions to valid ranges
- All 172 tests passing

### 2026-01-28 - useEvolutionSystem Hook Tests

- Created `use-evolution-system.test.ts` with 17 tests (#106)
- Tests cover: system integration (4), store integration (2), expected hook behavior (6), return value (3), edge cases (2)
- Key testing patterns: define mock functions at top level, use vi.mock with factory functions, track store state in module-level variable
- All 172 tests passing (60 shared + 112 web)

### 2026-01-28 - GardenEvolutionSystem Unit Tests

- Created `garden-evolution.test.ts` with 19 unit tests (#105)
- Tests cover lifecycle, germination callbacks, plant tracking, eligibility, clustering prevention, stats, factory function, and error handling
- Key testing patterns: mock `useGardenStore.getState()`, mock `debugLogger`, use `vi.useFakeTimers()` to control time

### 2026-01-28 - Cooldown Indicator Component

- Created `cooldown-indicator.tsx` component (#48, #49)
- Circular SVG progress ring depletes as cooldown progresses
- Positioned in bottom-left corner (opposite to notifications)
- Purple color scheme matching quantum theme
- Hourglass icon in center
- Shows seconds remaining text on desktop (hidden on mobile)
- Properly syncs with `isInCooldown` state from store
- ARIA label for accessibility with remaining time
- All tests passing

### 2026-01-28 - Dwell-Time Observation Mode

- Implemented dwell-time observation mode in `observation-system.ts` (#46, #47)
- Added `enableDwellMode` config option (default: false for backward compatibility)
- Added `dwellDuration` config option (default: 1.5 seconds)
- Dwell mode requires cursor to stay on eligible plant for duration before triggering observation
- Progress syncs to store (`dwellTarget`, `dwellProgress`) for UI display
- Observation resets if cursor moves off plant or leaves observation region
- Public API: `setDwellMode()`, `getDwellMode()`, `setDwellDuration()`, `getDwellDuration()`, `getDwellState()`
- Backward compatible: immediate observation mode remains the default
- All 136 tests passing

### 2026-01-28 - Exit Timeline Button Rename

- Renamed "Return to Live" button to "Exit Timeline" in time-travel scrubber (#92)
- Updated comment to match new button text
- Simple UX improvement: "Exit Timeline" more clearly describes leaving historical view
- All 136 tests passing

### 2026-01-28 - Event Marker Tooltips

- Added styled tooltips for time-travel event markers (#55)
- Replaced browser `title` attribute with custom tooltip component
- Tooltip shows colored dot indicator matching event type (green/blue)
- Displays event type name (Germination/Observation) and formatted timestamp
- Positioned above timeline track, centered on hovered marker
- Uses `pointer-events-none` to avoid interfering with timeline scrubbing
- Dark background with rounded corners matches garden aesthetic
- All 136 tests passing

### 2026-01-28 - Keyboard Shortcut Hints

- Added keyboard shortcuts section to info overlay (#57)
- Shows three shortcuts: T (Timeline), ? (Help), Esc (Close)
- Uses styled kbd elements matching garden aesthetic
- Only visible on desktop devices (hidden on touch devices)
- Placed between device instructions and dismiss button
- Improves discoverability of time-travel and help features
- All 136 tests passing

### 2026-01-28 - Event Marker Touch Targets

- Improved time-travel scrubber event markers with 20px touch targets (#54)
- Wrapped 2px visual marker line + 10px dot in 20px wide touch container
- Used `marginLeft: "-10px"` to center the touch area on the visual marker
- Added `group` class for coordinated hover states on both line and dot
- Visual appearance unchanged - only hit area enlarged
- Improves usability on touch devices and for users with motor impairments
- All 136 tests passing

### 2026-01-28 - Production Debug Gating

- Gated debug panel behind environment variable (#60)
- Hidden debug button in toolbar for production builds (#61)
- Added `isDebugEnabled` constant checking `NEXT_PUBLIC_DEBUG_ENABLED` and `NODE_ENV`
- Debug panel and keyboard shortcut (backtick) disabled in production by default
- Can be re-enabled with `NEXT_PUBLIC_DEBUG_ENABLED=true` for debugging production
- Prevents exposing internal garden state to end users
- All 136 tests passing

### 2026-01-28 - Notification Duration Improvements

- Increased notification auto-dismiss from 3s to 5s (#50)
- Increased context panel auto-dismiss from 15s to 30s (#51)
- Updated doc comments to reflect new durations
- Gives users more time to read educational content about quantum circuits
- Both components remain manually dismissible by clicking/tapping
- All 136 tests passing

### 2026-01-28 - Guaranteed Germination After 15 Minutes

- Implemented guaranteed germination in `evolution-logic.ts` and `garden-evolution.ts` (#9)
- Added `GUARANTEED_GERMINATION_TIME: 900_000` constant (15 minutes)
- Added `isGuaranteedGermination()` function to check if plant qualifies for 100% germination
- Updated `getGerminationProbability()` to return 1.0 for guaranteed germination
- Guaranteed germination still respects clustering prevention (can't germinate in crowded areas)
- Added 8 new tests covering guaranteed germination scenarios (#109)
- Updated 2 existing tests to avoid triggering guaranteed germination threshold
- Ensures no plant stays dormant forever while maintaining visual distribution
- All 136 tests passing

### 2026-01-28 - Material Pooling for Vector Plants

- Implemented material pooling in `vector-plant-overlay.ts` (#82)
- Added `materialPool` Map to cache materials by "color-opacity" key
- Added `getPooledMaterial()` method to fetch or create pooled materials
- Materials now reused across all plants instead of recreated per geometry update
- Geometry disposed individually on plant removal, materials disposed only on full dispose
- Added `circleGeometryPool` placeholder for future geometry pooling
- Reduces GPU allocations significantly for vector plant rendering
- All 128 tests passing

### 2026-01-28 - Polling Deduplication

- Removed redundant `trpc.plants.list.useQuery` polling from toolbar (#81)
- Added `refetchInterval: 5000` to `usePlants` hook to keep store fresh
- Toolbar now uses `useGardenStore` for plant data (single source of truth)
- Added `useMemo` for efficient computation of plantCount, germinatedCount, observedCount
- Updated loading indicator to use `plantCount === 0` instead of query `isLoading`
- Reduces network requests from multiple components polling independently
- All 128 tests passing

### 2026-01-28 - Toolbar Responsive Design Fix

- ✅ Fixed toolbar overflow on small screens (#73)
- ✅ Main toolbar container: Added `right-4 sm:right-auto` for width constraint on mobile
- ✅ Added `flex-wrap` and `max-w-full overflow-hidden` to prevent content overflow
- ✅ Garden status bar: Hidden on mobile (`hidden sm:flex`) - not essential info
- ✅ Button labels: Hidden on very small screens (`hidden min-[400px]:inline`)
- ✅ Icons remain visible on all screen sizes, maintaining functionality
- ✅ Toolbar now works well on screens as small as 320px
- ✅ All 128 tests passing

### 2026-01-28 - Observation Error Notification

- ✅ Added user-facing error notification for observation failures (#69)
- ✅ Users now see "Observation failed. Please try again." toast when observation errors occur
- ✅ The `addNotification` function was already available from entanglement notifications
- ✅ All 128 tests passing

### 2026-01-28 - Empty Plants Array Edge Case Fix

- ✅ Fixed empty plants array handling in page.tsx (#68)
- ✅ Added explicit check for `plants.length === 0` that clears `gardenCreatedAt`
- ✅ Added initial value to `reduce()` call to prevent crash on empty array
- ✅ Added loading state indicator during initial plant fetch (#100)
- ✅ Improved state management: separate handling for loading vs empty states
- ✅ All 128 tests passing

### 2026-01-28 - Store Subscription Optimization

- ✅ Fixed redundant plant sync operations in garden-scene.tsx (#67 + #87)
- ✅ Added `storeSyncedThisFrameRef` to track if store subscription already synced
- ✅ Store subscription sets flag to `true` after syncing
- ✅ Frame callback skips `syncPlants` and `setPlants` if flag is `true`
- ✅ Flag resets at end of frame callback for next frame
- ✅ Frame callback still updates time-based animations (`overlayManager.update`)
- ✅ All 128 tests passing

### 2026-01-28 - Vector Plant Performance Fix

- ✅ Fixed P0 bug: vector plant geometry was rebuilding every frame
- ✅ Added `PlantRenderState` interface to track visual identity
- ✅ Implemented state caching in `plantRenderStates` Map
- ✅ Created `computeRenderState()` and `renderStatesEqual()` methods
- ✅ Created `updateChangedPlants()` for incremental geometry updates
- ✅ Geometry now only rebuilds when plant state actually changes
- ✅ Key insight: plants are static 90% of time (only transition during first 10% of keyframe)
- ✅ All 128 tests passing

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
- All tests passing (178+)
