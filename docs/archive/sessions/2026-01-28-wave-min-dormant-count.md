# Session Archive: Wave Minimum Dormant Count

**Date**: 2026-01-28
**Synthesis Commit**: 08b2a1f

---

## Session Summary

Added a minimum dormant plant count requirement for wave germination events. This prevents wave events (where 3-5 plants germinate simultaneously) from occurring when the garden is sparse, ensuring waves only happen when there's a meaningful pool of dormant plants to choose from.

## Work Completed

- Added `WAVE_MIN_DORMANT_COUNT: 5` constant to evolution config
- Added `canWave` check before wave probability roll
- Wave events now only trigger when `eligiblePlants.length >= WAVE_MIN_DORMANT_COUNT`
- Added 2 comprehensive unit tests for the new behavior

## Code Changes

| Area                       | Change                                                      |
| -------------------------- | ----------------------------------------------------------- |
| `garden-evolution.ts`      | Added `WAVE_MIN_DORMANT_COUNT` constant and `canWave` check |
| `garden-evolution.test.ts` | Added 2 new tests for wave event behavior                   |

## Decisions Made

- Set minimum dormant count to 5 (reasonable threshold that allows some headroom above the wave germination count of 3-5)
- Used a simple boolean check rather than a probability modifier approach
- Tests verify both below-threshold (no wave) and at/above-threshold (wave allowed) scenarios

## Issues Encountered

- None - straightforward implementation

## Next Session Priorities

1. Continue with Phase 3 Evolution Improvements (tasks #11-16, #18-20)
2. Improve wave distribution to prefer spatial spread (#11)
3. Add per-plant germination cooldown near recent germinations (#12)

---

_This archive preserves the detailed session context. For current project state, see [TASKS.md](../../../TASKS.md)._
