# Quantum Garden - Task List

_Last updated: 2026-01-29 (synthesis - sound effects phase 1)_

## Project Status

The garden now features **server-side evolution** - plants germinate whether anyone is watching or not. The client is just a viewer, like visitors to a gallery exhibit. All visitors see the same garden state at the same time.

**Current Focus**: Bug fixes, performance optimization, and polish. Accessibility and mobile touch are deferred to the final phase.

**Test Coverage**: 268 tests passing (60 shared + 208 web) - 1 flaky performance test

**Architecture Highlights**:

- Server-side evolution via Vercel cron or standalone worker
- 36 plant variants, all using smooth vector rendering
- Real quantum data from IonQ simulator via pre-computed pool

---

## Active Tasks (4 Remaining)

### Bugs & Performance

| #   | Task                                             | Priority | File               |
| --- | ------------------------------------------------ | -------- | ------------------ |
| 74  | Make spatial grid adaptive to plant distribution | P3       | `spatial-grid.ts`  |
| 83  | Audit texture atlas packing efficiency           | P3       | `texture-atlas.ts` |

### Evolution Improvements

No active tasks.

### User Feedback & Discoverability

| #   | Task                            | Priority | File |
| --- | ------------------------------- | -------- | ---- |
| 58  | Create optional onboarding tour | P3       | NEW  |

### Polish

| #   | Task                              | Priority | File                             |
| --- | --------------------------------- | -------- | -------------------------------- |
| 120 | Implement sound effects (Phase 2) | P3       | See `docs/sound-effects-plan.md` |

### Testing & Documentation

| #   | Task                                 | Priority | File              |
| --- | ------------------------------------ | -------- | ----------------- |
| 111 | Add visual regression test checklist | P3       | `docs/testing.md` |

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

### 2026-01-29 - Sound Effects Phase 1 Foundation (#119)

- Implemented sound effects system foundation per `docs/sound-effects-plan.md`
- **Dependencies Added**:
  - `howler@2.2.4` - Audio library for sound management
  - `@types/howler@2.2.12` - TypeScript definitions
- **New Files Created** (`apps/web/src/lib/audio/`):
  - `audio-manager.ts` - Singleton AudioManager class
    - Manages global mute/volume state
    - Lazy-loads audio on user gesture (browser autoplay policy compliance)
    - Persists preferences to localStorage
    - Subscription pattern for reactive state updates
    - Stubs for `playEffect()` and `playAmbient()` (Phase 2-3)
  - `hooks/use-audio.ts` - React hook for audio
    - Uses `useSyncExternalStore` for reactive state
    - Exposes: `isEnabled`, `volume`, `toggleEnabled`, `setVolume`, `playEffect`, `init`
    - Memoized callbacks for performance
  - `index.ts` - Clean exports
- **Toolbar Integration**:
  - Added sound toggle button with speaker on/off icons
  - Integrates with `useAudio` hook
  - Initializes audio on user gesture (click)
  - Cyan active color when sound is enabled
- **Phase 1 Checklist Completed**:
  - [x] Install Howler.js dependency
  - [x] Create AudioManager singleton
  - [x] Implement mute/volume controls
  - [x] Add sound toggle to toolbar
  - [x] Store preferences in localStorage
- All 208 tests passing (TypeScript and ESLint clean)

### 2026-01-29 - Superposition Rendering Review (Decision: Keep Current) (#79)

- Reviewed probability-weighted superposition rendering proposal
- **Current Implementation**: Superposed plants render at 0.3 opacity with ±0.08 shimmer oscillation
  - Each plant has random shimmer phase for visual desynchronization
  - GPU shader handles shimmer: `sin(u_time * 1.5 + v_shimmerPhase) * 0.08`
- **Options Evaluated**:
  1. Multiple ghost variants (2-3 overlapping probable outcomes)
  2. Probability-derived base opacity (more certain = more opaque)
  3. Circuit-type shimmer variation (different circuits = different shimmer)
- **Decision**: Keep current implementation
  - **Philosophical accuracy**: Showing weighted ghosts implies pre-knowledge, breaking quantum metaphor
  - **Visual clarity**: Multiple overlapping variants would clutter the garden
  - **Performance**: Current implementation is efficient (single draw call per plant)
  - **Effective metaphor**: The shimmer already represents quantum uncertainty
- No code changes (design validation)

### 2026-01-29 - Opacity Bug Fix for Collapsed Plants (#78)

- Fixed bug where quantum-measured opacity was never applied to rendering
- **Problem**: `plant-instancer.ts` always used `GLYPH.COLLAPSED_OPACITY` (1.0) for collapsed plants
  - `traits.opacity` was correctly calculated (0.7-1.0 based on measurement consistency)
  - But the rendering code ignored it, showing all collapsed plants at full opacity
- **Solution**: Updated `getPlantRenderData()` to apply `plant.traits.opacity` for collapsed plants
  - Superposed plants still use `GLYPH.SUPERPOSED_OPACITY` (0.3)
  - Collapsed plants now reflect quantum measurement consistency
- **Visual Effect**:
  - High consistency (repeated measurements) = full opacity (1.0)
  - Low consistency (varied measurements) = slightly transparent (0.7-0.9)
  - Adds subtle depth variation based on quantum uncertainty
- All 268 tests passing (60 shared + 208 web)

### 2026-01-29 - Qubit Count Parameterization for Growth Rate (#77)

- Parameterized growth rate calculation in `apps/quantum/src/mapping/traits.py`
- **Problem**: Growth rate used hardcoded `variance / 16` divisor
  - Comment said "Assuming 5-bit values" but divisor 16 is for 4-bit (2^4)
  - Formula wasn't adaptable to different circuit configurations
- **Solution**: Added `qubit_count` parameter (default: 5) to `map_measurements_to_traits()`
  - Max variance formula: `2^(2n-2)` where n = qubit count
  - Normalized variance: `min(variance / max_variance, 1.0)`
  - Growth rate: `0.5 + normalized_variance * 1.5` (range: 0.5 to 2.0)
- **Tests Added** (2 new tests in `apps/quantum/tests/test_mapping.py`):
  - `test_growth_rate_scales_with_qubit_count`: Verifies growth rate changes appropriately for different qubit counts
  - `test_growth_rate_with_single_qubit`: Edge case test for single qubit circuits
- **Documentation**: Updated `docs/quantum-circuits.md` with Growth Rate Calculation section
- All Python tests passing (8/8)
- All TypeScript tests passing (268 tests)

### 2026-01-29 - Sound Effects System Planning (#102)

- Created comprehensive planning document at `docs/sound-effects-plan.md`
- **Design Philosophy**: Meditative (not distracting), optional by default, minimal and purposeful
- **Sound Categories**:
  - Ambient background: Soft wind/nature loop, quantum hum undertone
  - Evolution events: Germination chimes, wave cascades
  - Observation feedback: Resonant tones, entanglement harmonics
  - UI feedback: Soft panel clicks (subtle)
- **Technical Approach**: Howler.js (~10KB gzipped)
  - AudioManager singleton pattern
  - Sound sprites for efficient loading
  - Lazy loading (don't block page load)
- **File Budget**: ~1.7 MB total (ambient loop + effect sprites)
- **Implementation Phases**: 4 phases over 4-5 sessions
  1. Foundation: AudioManager, mute/volume, toolbar toggle
  2. Ambient: Loop with crossfade, autoplay handling
  3. Effects: Sprite sheet, integration points
  4. Polish: Fine-tuning, spatial panning
- **Integration Points Identified**: `use-observation.ts`, `evolution-worker.ts`, panel components
- **User Preferences**: Sound toggle in toolbar, volume slider in debug panel, localStorage persistence
- Planning only (no code changes)

### 2026-01-29 - Context Panel Animation Improvements (#98)

- Added exit animation support with `isExiting` state tracking
- Entry animation: fade-in + slide-from-left (350ms duration)
- Exit animation: fade-out + slide-to-left (350ms duration)
- Added content stagger animations for progressive reveal:
  - Header: 50ms delay
  - Circuit diagram: 100ms delay
  - Explanation: 150ms delay
  - Footer actions: 200ms delay
- Updated `PanelContent` component with `isExiting` prop
- Auto-dismiss and "Don't show again" now use smooth exit animation
- Uses `visibleContext` state to delay removal until animation completes
- Proper cleanup of exit timers via `exitTimerRef`
- All 268 tests passing (60 shared + 208 web)

### 2026-01-29 - Plant Highlight Pulsing in Debug Mode (#97)

- Added gentle pulse animation for selected plants in debug panel's Plants tab
- When a plant is selected, its debug marker (box, dot, crosshair) pulses:
  - Scale oscillates between 1.0 and 1.15 (15% breathing effect)
  - Opacity oscillates between 0.7 and 1.0
  - 2 Hz frequency for smooth, non-distracting animation
- Implemented via `selectedMarkerComponents` tracking in `debug-overlay.ts`
- Updated `update()` method to animate selected plant markers each frame
- All markers (bounding box, center dot, crosshair) animate together in sync
- All 268 tests passing (60 shared + 208 web)

### 2026-01-29 - Smooth Debug Panel Data Refreshes (#93)

- Added smooth value transitions to `Stat` component in debug panel
- Uses `useRef` to track previous values and detect changes
- Applies subtle background flash animation (300ms) when values change
- Flash color matches stat's color theme (green stats flash green, etc.)
- Added `transition-colors duration-300` for smooth color transitions
- Updated `StatusBadge` component with `transition-all duration-300`
- Active/inactive state changes now animate smoothly instead of jumping
- All 268 tests passing (60 shared + 208 web) - 1 flaky performance test

### 2026-01-29 - Complementary Color for Celebration Outer Ring (#94)

- Added `computeComplementaryColor` function to compute complementary colors (180° hue shift in HSL space)
- Updated `triggerCelebration` method to use computed complementary color for outer ring
- When a primary color is provided, outer ring uses complementary color instead of fixed white
- Falls back to white for achromatic (gray) colors to ensure visibility
- Examples: Green plants show magenta outer ring, blue plants show orange outer ring
- Creates more visually harmonious celebration effects that complement each plant's color
- All 268 tests passing (60 shared + 208 web)

### 2026-01-29 - Jump to Now Button for Time-Travel Scrubber (#104)

- Added "⏭ Now" button to time-travel scrubber header
- Provides quick jump to current moment when scrubbed back in history
- Button behavior:
  - Stops playback if currently playing
  - Sets current time to `now`
  - Calls `onScrubToTime(now)` to sync with parent component
  - Disabled when already at current time (playheadProgress >= 0.999)
- Compact styling (`px-3 py-2`) matching adjacent Play/Pause button
- Same disabled/enabled state styling as Play button
- Tooltip "Jump to current time" for discoverability
- All 268 tests passing (60 shared + 208 web) - 1 flaky performance test

### 2026-01-29 - Playback Speed Control for Time-Travel Scrubber (#103)

- Added playback speed control button group to time-travel scrubber
- 5 speed options: 1x, 2x, 5x, 10x, 20x (default: 10x)
- Styled as segmented control with purple highlight for active speed
- Compact pill buttons with hover states in `bg-white/5` container
- Removed hardcoded "(10x)" label from Play button
- Consistent UI styling with existing scrubber controls
- All 268 tests passing (60 shared + 208 web)

### 2026-01-29 - UI Preferences Reset in Debug Panel (#63)

- Created centralized `ui-preferences.ts` utility (`apps/web/src/lib/ui-preferences.ts`)
- `UI_PREFERENCE_KEYS` - all localStorage keys for dismissable UI elements
- `getUIPreferences()` - returns current state of all preferences
- `resetAllUIPreferences()` - clears all "don't show again" settings
- `resetUIPreference()` - reset a specific preference
- `UI_PREFERENCE_LABELS` - human-readable labels for each preference
- Identified 4 dismissable UI elements:
  - First observation celebration
  - Observation context panel
  - Welcome info overlay
  - Keyboard shortcut hint
- Created `UIPreferencesSection` component in debug-panel.tsx:
  - Shows count of dismissed UI elements
  - Lists each dismissed element with amber dot indicator
  - "Reset All Preferences" button with confirmation dialog
  - Shows "No dismissed UI elements" when all preferences are clear
  - Logs reset action via debugLogger
- Added UI Preferences section to debug panel Overview tab (Controls section)
- All 268 tests passing (60 shared + 208 web)

### 2026-01-29 - Confirmation Dialog for Observation Mode Switching (#56)

- Added confirmation dialog when users switch observation modes in debug panel
- New `showModeConfirm` state tracks whether confirmation is displayed
- Split toggle function into three parts:
  - `requestModeChange()` - shows confirmation dialog
  - `confirmModeChange()` - actually performs the mode switch
  - `cancelModeChange()` - dismisses the dialog
- Confirmation dialog overlay includes:
  - Dark backdrop with blur effect
  - Centered modal with title and context-aware explanation
  - Explains what each mode does before switching
  - Cancel (gray) and Switch Mode (purple) buttons
- Prevents accidental observation mode changes during gameplay
- All 268 tests passing (60 shared + 208 web)

### 2026-01-29 - First Observation Celebration (#59)

- Added special celebration effect for user's first-ever observation in the garden
- Created `first-observation.ts` utility for localStorage tracking:
  - `isFirstObservation()` - checks if user has made their first observation
  - `markFirstObservationComplete()` - marks first observation as done
  - `resetFirstObservation()` - for testing/settings reset
- Enhanced `FeedbackOverlay` with `FIRST_OBSERVATION_FEEDBACK` constants:
  - Gold primary color (`0xffd700`) for the special moment
  - Purple quantum accent third ring (`0xc4b5fd`)
  - Three expanding rings (80px, 120px, 160px) vs normal two rings (50px, 70px)
  - Longer duration (1.4s vs 0.8s) and higher quality (64 segments vs 48)
- Added `triggerFirstObservationCelebration()` method for enhanced visual
- Integrated into garden-scene.tsx to detect and trigger first observation
- Added "Your first quantum observation!" notification via use-observation.ts
- Works in both dwell mode and debug click mode
- All 268 tests passing (60 shared + 208 web)

### 2026-01-28 - Progress Indicator for Notifications (#53)

- Added progress bar to notification toasts showing time until auto-dismiss
- Uses `requestAnimationFrame` for smooth 60fps animation
- Progress bar depletes from left to right over 5 seconds
- Progress correctly pauses when notification is hovered (integrates with pause-on-hover)
- Type-matched colors for progress bar:
  - Wave: `purple-400/60`
  - Entanglement: `pink-400/60`
  - Error: `amber-400/60`
  - Germination: `green-400/40`
- Restructured notification layout to `flex-col` with content + progress bar
- All 267 tests passing (1 flaky performance test unrelated to changes)

### 2026-01-28 - Type-Based Notification Styling (#16)

- Added `NotificationType` to garden-store.ts: `"germination" | "wave" | "entanglement" | "error"`
- Updated `EvolutionNotification` interface with `type` field
- Updated `addNotification` to accept optional type parameter (defaults to "germination")
- Wave notifications use purple theme (`border-purple-500/30 bg-purple-950/80`)
- Entanglement notifications use pink theme (`border-pink-500/30 bg-pink-950/80`)
- Error notifications use amber theme (`border-amber-500/30 bg-amber-950/80`)
- Each type has distinct icon: wave (network), entanglement (chain link), error (warning), germination (sun)
- Updated `use-evolution.ts` to pass "wave" type for wave germinations
- Updated `use-observation.ts` to pass "entanglement" and "error" types
- All 268 tests passing

### 2026-01-28 - Convert All Raster Variants to Vector Format

- Converted final 5 geometric raster variants to vector rendering:
  - `sumi-spirit`: Ink brush stroke enso with brushStroke easing
  - `sacred-mandala`: Concentric circles with radial symmetry
  - `crystal-lattice`: Interlocking diamond grid
  - `stellar-geometry`: Nested star outlines
  - `metatrons-cube`: Sacred geometry Flower of Life pattern
- Removed 5 orphaned `*Vector` duplicate variant definitions
- Fixed TypeScript errors: invalid `easing: "smooth"` and `strategy: "morphBetweenShapes"`
- Updated PLANT_VARIANTS array from 41 to 36 variants
- All variants now use smooth, resolution-independent vector rendering
- Raster pattern functions preserved (underscore-prefixed) for potential future use

### 2026-01-28 - Server-Side Evolution System

Major architectural change: evolution moved from client-side to server-side.

**Rationale**: The garden should evolve whether anyone is watching or not. The client is "just a view" - like visitors to a gallery exhibit. All visitors see the same garden state at the same time.

**Implementation**:

- Added `GardenState` model to Prisma schema with `lastEvolutionCheck` and `evolutionVersion`
- Created server-side evolution module at `src/server/evolution.ts`
- Created Vercel Cron API route at `src/app/api/cron/evolve/route.ts`
- Created `vercel.json` with cron configuration (1-minute interval)
- Created standalone worker script at `scripts/evolve-garden.ts`
  - `pnpm evolve` - single evolution check
  - `pnpm evolve:watch` - continuous 15-second interval
- Disabled client-side evolution in `garden-scene.tsx`
- Client now polls plants every 5 seconds via `usePlants`
- Fixed bug: observed-but-not-germinated plants now properly included in evolution

**Deployment Options**:

- Vercel Pro: Built-in cron (1-minute minimum)
- External cron service: Any interval via Bearer token auth
- Long-running worker: 15-second intervals on Heroku/Railway/VPS

### 2026-01-28 - Performance Monitoring in Debug Panel (#90)

- Added performance metrics tracking to SceneManager with rolling averages
- New `PerformanceMetrics` interface (fps, frameTimeMs, drawCalls, triangles)
- Frame time tracking with 60-frame rolling average for stable readings
- Integrated with Three.js renderer info for draw calls and triangle count
- Added `PerformanceStats` interface and state to garden store
- GardenScene pushes metrics to store every 500ms via setInterval
- Debug panel displays metrics in new "Performance" section at top of Overview tab
- 4-column grid: FPS, Frame time, Draw calls, Triangles
- Color-coded thresholds:
  - FPS: green (55+), yellow (30-54), red (<30)
  - Frame time: green (<=18ms), yellow (<=33ms), red (>33ms)
- All 268 tests passing (60 shared + 208 web)

### 2026-01-28 - Memory Leak Tests for Extended Sessions (#118)

- Created comprehensive memory leak test file at `apps/web/src/components/garden/__tests__/memory-leaks.test.ts`
- 17 test cases covering:
  - **GardenEvolutionSystem resource cleanup** (6 tests): interval clearing, map cleanup, rapid start/stop cycles
  - **SpatialGrid memory management** (3 tests): rebuild cycles, empty rebuilds, cell movement
  - **Subscription cleanup patterns** (2 tests): zustand patterns, ordering
  - **Extended session simulation** (3 tests): 60-minute sessions, rapid queries, state changes
  - **Callback cleanup** (2 tests): reference cleanup, error handling
  - **Cache size limits** (1 test): many unique variants
- Identified key memory leak risk areas for ongoing monitoring
- All 268 tests passing (60 shared + 208 web)

### 2026-01-28 - Performance Tests for 100+ Plants (#117)

- Created comprehensive performance test file at `apps/web/src/components/garden/__tests__/performance.test.ts`
- 14 test cases validating efficient handling of large plant counts:
  - **SpatialGrid with 100+ plants** (4 tests): rebuild times <10ms/50ms/100ms for 100/500/1000 plants
  - **SpatialGrid query performance** (3 tests): O(1) average query time, efficient edge queries
  - **Plant state update simulation** (3 tests): hash-based dirty detection, partial buffer updates
  - **Grid-based plant distribution** (2 tests): clustered and uniform distribution handling
  - **Memory efficiency** (2 tests): no leaks during rebuilds, efficient cell reuse
- Key performance findings:
  - SpatialGrid maintains O(1) average query time regardless of total plants
  - Hash comparison for 500 plants takes <5ms
  - 1000-plant rebuild completes in <100ms
  - Partial buffer updates work for contiguous changes, full update for scattered
- All 251 tests passing (60 shared + 191 web)

### 2026-01-28 - Garden Store Unit Tests (#110)

- Created comprehensive test file at `apps/web/src/stores/__tests__/garden-store.test.ts`
- 46 test cases covering 10 major store state areas:
  - Evolution State (7 tests): `evolutionPaused`, `evolutionStats`, `lastGerminationTime`
  - Time-Travel Mode (4 tests): enable/disable, timestamp handling
  - Notifications (5 tests): add, remove, MAX_NOTIFICATIONS limit
  - Plants State (5 tests): set, update, isolation of updates
  - Dwell State (4 tests): target, progress, reset
  - Cooldown State (2 tests): cooldown flag
  - Observation Context (3 tests): set, clear
  - Quantum Event Log (7 tests): add events, 50-event FIFO limit, clear, selection
  - Reticle State (4 tests): set, update position
  - Active Region (3 tests): set, clear
- All 237 tests passing (60 shared + 177 web)

### 2026-01-28 - Germination Flow Integration Tests (#107)

- Created comprehensive integration test file at `apps/web/src/components/garden/__tests__/germination-flow.integration.test.ts`
- 10 new test cases covering the complete germination flow:
  - Basic germination flow (detecting dormant plants, triggering callbacks, skipping germinated plants)
  - Time-travel mode handling
  - Multiple plant germination over time
  - Wave germination with context (isWave, waveIndex, waveTotal)
  - Evolution stats tracking (dormant count, updates during germination)
  - Cooldown behavior (reduced probability for nearby plants after germination)
  - Clustering prevention (blocking germination in crowded areas)
  - Error handling (graceful recovery from callback failures)
- All 191 tests passing (60 shared + 131 web)

### 2026-01-28 - Mock Trait Algorithm Alignment (#76)

- Aligned mock trait generation with Python quantum mapping algorithm
- **Problem**: Growth rate range in TypeScript mock (0.5-1.5) didn't match Python quantum mapping (0.5-2.0)
- **Fix**: Changed `0.5 + random()` to `0.5 + random() * 1.5` for correct 0.5-2.0 range
- Updated JSDoc comments to clarify alignment with quantum mapping
- All 181 tests passing (60 shared + 121 web)

### 2026-01-28 - Entanglement Pool Index Correlation Fix (#75)

- Fixed entanglement observation to use correlated pool indices
- **Problem**: Primary plants and entangled partners each used their own ID for pool selection
- This caused independent (uncorrelated) quantum results instead of true quantum correlation
- **Solution**: Both primary and partner plants now use `entanglementGroupId` as the pool seed
- All plants in an entanglement group now get the SAME pool result, creating authentic quantum correlation
- Updated mock trait fallback to use `seedOffset = 0` for all entangled partners
- Updated JSDoc comments to clarify entanglement correlation behavior
- All 181 tests passing (60 shared + 121 web)

### 2026-01-28 - Architecture Documentation Update (#114)

- Updated system diagram to include evolution system
- Replaced mock traits with quantum pool description
- Updated observation flow to reflect dwell-time triggers
- Added evolution system section with germination factors
- Fixed "Why Three.js?" (was incorrectly labeled PixiJS)
- Expanded file organization with hooks and garden components

### 2026-01-28 - README Evolution System Documentation (#112)

- Added comprehensive Evolution System section to README
- Explains GardenEvolutionSystem and 15-second check interval
- Germination factors table (base probability, bonuses, penalties)
- Wave events documentation (5% chance, 3-5 plants)
- useEvolutionSystem hook integration details
- Link to source implementation

### 2026-01-28 - Keyboard Shortcut Discovery Hint (#62)

- Created `KeyboardShortcutHint` component in `keyboard-shortcut-hint.tsx`
- Shows one-time floating hint on first visit
- Appears after 3 seconds, auto-dismisses after 8 seconds
- Only shown on desktop (hidden on touch devices)
- Tracked via localStorage to never show again
- Points users to press "?" for keyboard shortcuts
- All 181 tests passing (60 shared + 121 web)

### 2026-01-28 - Standardize Auto-Dismiss Timers (#91)

- Added `UI_TIMING` constants to shared package `constants.ts`
  - `NOTIFICATION_DISMISS_MS: 5000` (5s toast notification)
  - `CONTEXT_PANEL_DISMISS_MS: 30000` (30s context panel)
  - `MAX_NOTIFICATIONS: 3` (max visible notifications)
- Updated `evolution-notifications.tsx` to use `UI_TIMING.NOTIFICATION_DISMISS_MS`
- Updated `observation-context-panel.tsx` to use `UI_TIMING.CONTEXT_PANEL_DISMISS_MS`
- Updated `garden-store.ts` to use `UI_TIMING.MAX_NOTIFICATIONS`
- All 181 tests passing (60 shared + 121 web)

### 2026-01-28 - Wave Germination Tests (#108)

- Added 3 new tests for wave germination context in `garden-evolution.test.ts`
- Tests verify wave context structure (`isWave`, `waveIndex`, `waveTotal`)
- Tests verify non-wave context for single germinations
- Tests edge case: wave triggering at exact threshold
- All 121 tests passing

### 2026-01-28 - JSDoc for useEvolutionSystem Hook (#113)

- Added comprehensive JSDoc documentation to `use-evolution-system.ts`
- Module-level documentation explaining evolution system behavior
- Documented interface types (`UseEvolutionSystemOptions`, `EvolutionSystemState`)
- Added `@example` block showing typical usage pattern
- Added `@remarks` section explaining lifecycle behavior
- Added `@see` references to related modules
- All 178 tests passing (60 shared + 118 web)

### 2026-01-28 - Batch Wave Notifications (#15)

- Wave germinations now show single batched notification "3 plants germinated" instead of multiple individual notifications
- Added `GerminationContext` type to `garden-evolution.ts` with `isWave`, `waveIndex`, `waveTotal` fields
- Modified `GardenEvolutionSystem` to pass wave context through germination callback
- Updated `use-evolution.ts` to collect wave germinations and batch notifications for wave events
- Created single `wave_germination` event in quantum event log for wave events
- Removed auto-open behavior from quantum event modal - events still logged but modal only opens on user click
- Updated all tests to account for new callback signature
- All 178 tests passing (60 shared + 118 web)

### 2026-01-28 - Debug Panel Evolution Improvements (#14, #18, #19)

- Updated debug panel evolution badge to use `evolutionPaused` from store
- Added evolution stats display in System State section:
  - Dormant count from `evolutionStats.dormantCount`
  - Tracked count from `evolutionStats.trackedCount`
  - Last germination time with relative format
- Added `formatRelativeTime()` helper function
- All 178 tests passing (60 shared + 118 web)

### 2026-01-28 - EvolutionStatusIndicator Component (#13)

- Created `evolution-status-indicator.tsx` component
- Displays real-time evolution system status:
  - Status dot (green pulsing = active, amber = paused)
  - Dormant plant count with seed icon
  - Time since last germination with sprout icon
- `formatRelativeTime()` helper for "just now", "2m ago", etc.
- Updates relative time every 10 seconds
- ARIA label for accessibility
- Positioned bottom-right, above notifications
- Integrated into `page.tsx`
- All 178 tests passing (60 shared + 118 web)

### 2026-01-28 - Vector Plant Keyframe Mesh Caching (#89)

- Implemented keyframe mesh caching in `vector-plant-overlay.ts`
- Added `KeyframeMeshCache` type and `keyframeMeshCache` field
- New helper methods:
  - `getKeyframeCacheKey()` - Generates cache key from variant, keyframe index, and color
  - `tryUseCachedMeshes()` - Clones cached meshes into plant group
  - `cacheMeshes()` - Stores cloned meshes after first render
  - `clearPlantGroup()` - Extracted common cleanup logic
- Updated `updatePlantGroup()` to check cache for static keyframes
- Static keyframes: O(1) clone instead of O(primitives) geometry creation
- Transitioning keyframes: Still rebuild (draw fractions change each frame)
- Updated `dispose()` to clean up cached mesh geometry
- All 178 tests passing (60 shared + 118 web)

### 2026-01-28 - Render Loop Performance Analysis (#88)

- Analyzed render loop architecture for 1000 plant capacity
- **PlantInstancer** already optimized:
  - `MAX_INSTANCES = 1000` - designed for this workload
  - Single `InstancedMesh` draw call for all plants
  - Dirty tracking: only updates changed instances
  - Partial buffer updates: uploads only changed ranges to GPU
  - Pattern caching via TextureAtlas
  - Category caching for z-ordering
- **OverlayManager** optimized:
  - `hasActiveAnimations()` checks skip idle overlays
- **SceneManager** optimized:
  - `powerPreference: "high-performance"`
  - `antialias: false` for pixel art style
- **Performance characteristics**:
  - Draw calls: 2-3 (main scene + overlays)
  - GPU buffer updates: O(changed plants), not O(all plants)
  - Main overhead: `syncPlants()` hash comparisons (~1000/frame)
- **Conclusion**: Architecture supports 1000 plants at 60fps on typical hardware
- Playwright profiling showed 8fps (expected with SwiftShader software rendering)
- Real GPU testing recommended for accurate metrics

### 2026-01-28 - Entanglement Wave Visual Enhancement

- Enhanced quantum correlation wave particles (#95)
- Updated wave visual constants in `entanglement-overlay.ts`:
  - `WAVE_COLOR`: 0xffffff → 0xc4b5fd (purple, matching line color for cohesion)
  - `WAVE_SIZE`: 6 → 10 (67% increase for better visibility)
  - `WAVE_ALPHA`: 0.9 → 0.95 (slightly brighter)
  - Added `WAVE_GLOW_SIZE` and `WAVE_GLOW_ALPHA` constants (for future use)
- Updated wave material with additive blending for natural glow effect
- Added `depthWrite: false` to prevent z-fighting with additive blending
- Increased circle geometry segments from 16 to 24 for smoother appearance
- All 178 tests passing (60 shared + 118 web)

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
- All tests passing (267 stable, 1 flaky performance test)
