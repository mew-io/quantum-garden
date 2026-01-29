# Quantum Garden - Task List

_Last updated: 2026-01-28_

## Project Status

The garden is now continuously evolving with the `GardenEvolutionSystem` properly integrated. The critical bug where the evolution system was never started has been fixed.

**Current Focus**: Bug fixes, performance optimization, and polish. Accessibility and mobile touch are deferred to the final phase.

---

## Active Tasks (30 Remaining)

### Bugs & Performance

| #   | Task                                             | Priority | File                      |
| --- | ------------------------------------------------ | -------- | ------------------------- |
| 74  | Make spatial grid adaptive to plant distribution | P3       | `spatial-grid.ts`         |
| 83  | Audit texture atlas packing efficiency           | P3       | `texture-atlas.ts`        |
| 88  | Profile render loop for 1000 plants              | P2       | -                         |
| 89  | Cache previous keyframe meshes in vector overlay | P2       | `vector-plant-overlay.ts` |
| 90  | Add performance monitoring to debug panel        | P3       | `debug-panel.tsx`         |

### Evolution Improvements

| #   | Task                                          | Priority | File                          |
| --- | --------------------------------------------- | -------- | ----------------------------- |
| 13  | Create EvolutionStatusIndicator component     | P2       | NEW                           |
| 14  | Update debug panel evolution badge from store | P2       | `debug-panel.tsx`             |
| 15  | Batch wave notifications                      | P2       | `use-evolution.ts`            |
| 16  | Add wave notification style                   | P3       | `evolution-notifications.tsx` |
| 18  | Add dormant plant count to debug panel        | P3       | `debug-panel.tsx`             |
| 19  | Add last germination time to debug panel      | P3       | `debug-panel.tsx`             |

### User Feedback & Discoverability

| #   | Task                                              | Priority | File                            |
| --- | ------------------------------------------------- | -------- | ------------------------------- |
| 53  | Add progress indicator to notifications           | P3       | `evolution-notifications.tsx`   |
| 56  | Add confirmation when switching observation modes | P3       | `debug-panel.tsx`               |
| 58  | Create optional onboarding tour                   | P3       | NEW                             |
| 59  | Add "first observation" celebration               | P3       | `use-observation.ts`            |
| 62  | Add keyboard shortcut discovery hint              | P2       | `page.tsx`                      |
| 63  | Add "Don't show again" reset in settings          | P3       | `observation-context-panel.tsx` |

### Quantum Accuracy

| #   | Task                                                  | Priority | File                 |
| --- | ----------------------------------------------------- | -------- | -------------------- |
| 75  | Fix entanglement to use correlated pool indices       | P2       | `observation.ts`     |
| 76  | Align mock trait algorithm with quantum mapping       | P2       | `observation.ts`     |
| 77  | Parameterize growth rate calculation for qubit count  | P3       | `observation.ts`     |
| 78  | Review opacity-from-consistency logic                 | P3       | `observation.ts`     |
| 79  | Consider probability-weighted superposition rendering | P3       | `plant-instancer.ts` |

### Polish

| #   | Task                                                | Priority | File                            |
| --- | --------------------------------------------------- | -------- | ------------------------------- |
| 91  | Standardize auto-dismiss timers in constants        | P2       | `constants.ts`                  |
| 93  | Smooth debug panel data refreshes                   | P3       | `debug-panel.tsx`               |
| 94  | Make celebration outer ring use complementary color | P3       | `feedback-overlay.ts`           |
| 95  | Increase entanglement wave size and add glow        | P2       | `entanglement-overlay.ts`       |
| 97  | Add plant highlight pulsing in debug mode           | P3       | `debug-overlay.ts`              |
| 98  | Improve context panel animation                     | P3       | `observation-context-panel.tsx` |
| 102 | Plan sound effects system                           | P3       | -                               |
| 103 | Add playback speed control to time-travel           | P3       | `time-travel-scrubber.tsx`      |
| 104 | Add "scrub to now" quick button                     | P3       | `time-travel-scrubber.tsx`      |

### Testing & Documentation

| #   | Task                                      | Priority | File                      |
| --- | ----------------------------------------- | -------- | ------------------------- |
| 107 | Add integration test for germination flow | P2       | NEW                       |
| 108 | Add tests for wave germination logic      | P2       | `evolution-logic.test.ts` |
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

### 2026-01-28 - Entanglement Line Visibility Improvement

- Improved entanglement connection line visibility (#64)
- Updated visual constants in `entanglement-overlay.ts`:
  - `LINE_COLOR`: 0x9b87f5 → 0xc4b5fd (lighter purple, better contrast)
  - `LINE_WIDTH`: 1.5 → 2 (thicker lines)
  - `LINE_ALPHA`: 0.3 → 0.5 (increased opacity from 30% to 50%)
  - `PULSE_ALPHA`: 0.8 → 0.9 (more visible pulse effect)
  - `DASH_SIZE`: 8 → 6, `GAP_SIZE`: 4 → 3 (tighter dash pattern)
- All 178 tests passing (60 shared + 118 web)

### 2026-01-28 - Entanglement Legend in Info Overlay

- Added entanglement explanation section to `info-overlay.tsx` (#65)
- Pink-themed card with chain link icon explaining:
  - What quantum entanglement means in the garden
  - How observing one plant reveals traits in entangled partners
  - The concept of "quantum connection" between plants
- New `EntanglementIcon` component (chain link SVG in pink)
- Positioned between device instructions and time-travel section
- All 178 tests passing (60 shared + 118 web)

### 2026-01-28 - Complete Keyboard Shortcuts List

- Expanded keyboard shortcuts panel in `toolbar.tsx` (#101)
- Added Event Navigation section with arrow key shortcuts (left/right arrows for prev/next event)
- Reorganized into three sections:
  1. General shortcuts (?, T, `, Esc)
  2. Event Navigation (left/right arrows)
  3. Observation (interaction hint)
- Added `max-w-xs` to panel for better presentation
- Changed "time-travel" to "timeline" for consistency with button label
- All 178 tests passing (60 shared + 118 web)

### 2026-01-28 - Quantum Event Log System

- Created comprehensive quantum event logging system for educational transparency
- **New Types in `@quantum-garden/shared`**:
  - `QuantumEventType`: "observation" | "germination" | "entanglement" | "wave_germination"
  - `CircuitType`: "superposition" | "bell_pair" | "ghz_state" | "interference" | "variational"
  - `QuantumEvent`: Full event metadata including plant ID, circuit info, traits, entanglement groups
- **New Components**:
  - `quantum-event-log.tsx`: Persistent bottom-left panel showing quantum events as they happen
    - Scrollable list with auto-scroll to bottom
    - Filter chips for event types (observation/germination/entanglement/wave)
    - Relative time formatting ("just now", "5m ago", etc.)
    - Minimizable with event count badge
    - Adjusts position when time-travel scrubber is visible
  - `event-detail-modal.tsx`: Full-screen modal with educational content
    - Circuit diagrams for each circuit type (superposition, Bell pair, GHZ state, etc.)
    - Quantum concept explanations for all event types
    - Event-specific details (variant, circuit, execution mode, etc.)
    - Prev/Next navigation between events with keyboard support (arrows, Esc)
- **New Hooks**:
  - `use-historical-events.ts`: Loads historical events from evolution timeline into event log
    - Queries `garden.getEvolutionTimeline` on mount
    - Populates store with past germination/observation events
    - One-time load with staleTime: Infinity
- **Store Updates** (`garden-store.ts`):
  - Added `eventLog: QuantumEvent[]` state (max 50 events, FIFO queue)
  - Added `addEvent()`, `clearEventLog()`, `selectedEventId`, `setSelectedEventId()`
  - Added `historicalEventsLoaded` flag to prevent duplicate loads
- **Hook Updates**:
  - `use-evolution.ts`: Logs germination events with plant ID and variant
  - `use-observation.ts`: Logs observation events with circuit ID, execution mode, resolved traits
    - Also logs entanglement correlation events when partners are updated
- All 178 tests passing (60 shared + 118 web)

### 2026-01-28 - Time-Travel Help Explanation (#99)

- Added time-travel feature section to info overlay (`info-overlay.tsx`)
- Purple-themed card with border accent explaining:
  - How to access the timeline (press T key)
  - What you can do (watch history, scrub through events, auto-playback)
- Uses semantic `kbd` element for keyboard shortcut
- Positioned after device instructions, before keyboard shortcuts section
- All 178 tests passing

### 2026-01-28 - Time-Travel Scrubber UI Polish

- Improved visual styling of time-travel scrubber component
- Header: Refined with border separation, better spacing
- Buttons: Larger touch targets (px-4 py-2), rounded-lg, font-medium
- "Show Timeline" button: Purple theme (bg-purple-600/90) with shadow
- Play/Pause: Disabled state styling when at end of timeline
- Timeline track: Border outline, purple progress fill, refined playhead with purple accent
- Labels: Better contrast and spacing
- Legend: Improved alignment and visual hierarchy

### 2026-01-28 - Entanglement Groups Shallow Comparison

- Implemented shallow comparison in `EntanglementOverlay.updateGroups()` to prevent unnecessary geometry rebuilds (#86)
- **Problem**: `updateGroups()` was called on every store subscription update and always called `rebuildGeometry()` even when groups hadn't changed
- **Solution**: Added `groupsEqual()` method for shallow comparison before triggering rebuild
- Comparison checks:
  - Group count (early return if different)
  - Group IDs match
  - Plant count per group matches
  - Plant IDs and positions match (positions affect line rendering)
- **Performance Impact**:
  - Most frames: O(n) comparison where n = total plants in entanglement groups
  - Rebuild only when: new groups form, plants move, or groups dissolve
  - Avoids: geometry creation, disposal, GPU buffer allocation
- All 178 tests pass (60 shared + 118 web)

### 2026-01-28 - hasActiveAnimations Overlay Optimization

- Implemented `hasActiveAnimations()` method on all overlay classes to skip unnecessary updates (#85)
- **Problem**: OverlayManager's `update()` called all overlay update methods every frame, even when most overlays had no work to do
- **Solution**: Added `hasActiveAnimations(): boolean` method to each overlay that returns whether the overlay needs updating
- Overlay checks implemented:
  - `FeedbackOverlay`: `this.activeAnimations.length > 0` (only during 0.8s celebration rings)
  - `DwellOverlay`: `this.currentTargetId !== null && this.currentProgress > 0` (only during user dwell)
  - `EntanglementOverlay`: `this.groups.length > 0 || this.pulsingGroups.size > 0 || this.waveParticles.length > 0`
  - `VectorPlantOverlay`: `this.plants.length > 0` (only when vector plants exist)
  - `DebugOverlay`: `this.isVisible` (only when debug panel is open)
- Updated OverlayManager to check `hasActiveAnimations()` before calling each overlay's `update()`
- ReticleOverlay always updates (continuous drift animation)
- All 178 tests pass (60 shared + 118 web)

### 2026-01-28 - Partial Buffer Updates for Plant Instancer

- Implemented partial buffer updates in PlantInstancer to reduce GPU data transfer (#84)
- **Problem**: Previously `markAttributesNeedUpdate()` set `needsUpdate = true` on all buffer attributes, causing Three.js to re-upload the entire buffer to GPU even when only a few instances changed
- **Solution**: Track min/max dirty instance indices and use Three.js `addUpdateRange()` API to specify partial upload ranges
- Added `setFullBufferUpdate()` method - clears update ranges for full buffer upload
- Added `setPartialBufferUpdate()` method - sets ranges using `attr.addUpdateRange(offset, count)`
- Updated `markAttributesNeedUpdate()` to:
  - Calculate dirty range (min to max index)
  - Use partial update if range < 50% of total instances and total > 10
  - Fall back to full update for small counts or large ranges (threshold optimization)
- Buffer attributes updated: instancePosition (3), instanceUVBounds (4), instancePalette0/1/2 (3 each), instanceState (4), instanceAnimation (2)
- Uses Three.js r150+ API with `updateRanges` array and `addUpdateRange()` method
- All 178 tests pass (60 shared + 118 web)

### 2026-01-28 - Safe Area Padding for iOS Notched Devices

- Applied consistent safe area padding across all fixed-position UI components (#72)
- Added CSS custom properties to `globals.css`:
  - `--safe-top`, `--safe-right`, `--safe-bottom`, `--safe-left` - raw safe area insets
  - `--inset-top`, `--inset-right`, `--inset-bottom`, `--inset-left` - max(1rem, safe-area) for minimum spacing
- Updated 7 components to use the new CSS variables:
  - `toolbar.tsx`: `top-4 left-4` -> `top-[var(--inset-top)] left-[var(--inset-left)]`
  - `debug-panel.tsx`: `top-4 right-4` -> `top-[var(--inset-top)] right-[var(--inset-right)]`
  - `evolution-notifications.tsx`: `bottom-4 right-4` -> `bottom-[var(--inset-bottom)] right-[var(--inset-right)]`
  - `cooldown-indicator.tsx`: `bottom-4 left-4` -> `bottom-[var(--inset-bottom)] left-[var(--inset-left)]`
  - `observation-context-panel.tsx`: `bottom-4 left-4` -> `bottom-[var(--inset-bottom)] left-[var(--inset-left)]`
  - `time-travel-scrubber.tsx`: Added `paddingBottom: var(--safe-bottom)` to container
  - `evolution-paused-indicator.tsx`: `top-20` -> `top: calc(var(--inset-top) + 4rem)` via style prop
- Benefits: UI elements won't be obscured by device notches, home indicators, or rounded corners
- Consistent 1rem minimum ensures reasonable padding on non-notched devices
- All 178 tests passing (60 shared + 118 web)

### 2026-01-28 - Z-Layer Category Caching Optimization

- Investigated z-layer sorting overhead (#80)
- **Finding**: No runtime sorting overhead - Z positions computed per-plant, GPU handles depth ordering
- **Optimization identified**: `getPlantCategory()` did string matching on every plant update
- Added `categoryCache: Map<string, string>` to cache variant ID -> category mappings
- First lookup per variant does string matching, all subsequent lookups are O(1) Map access
- Cache cleared on `dispose()` to prevent memory leaks
- All 178 tests passing (60 shared + 118 web)

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
