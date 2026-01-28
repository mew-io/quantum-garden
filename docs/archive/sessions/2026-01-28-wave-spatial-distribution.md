# Session Archive: Wave Spatial Distribution

**Date**: 2026-01-28
**Synthesis Commit**: e63a720

---

## Session Summary

Implemented spatial distribution for wave germination events. When a wave is triggered, the system now selects plants that are spread out across the garden rather than picking randomly. This creates a more visually pleasing wave effect where germinations appear in different areas simultaneously.

## Work Completed

- Added `WAVE_MIN_SPACING: 200` constant (minimum distance between wave-selected plants)
- Added `selectSpatiallyDistributedPlants()` method using a greedy algorithm
- Updated wave events to use spatial selection instead of random iteration
- Added test for spatial distribution behavior

## Code Changes

| Area                       | Change                                                                      |
| -------------------------- | --------------------------------------------------------------------------- |
| `garden-evolution.ts`      | Added WAVE_MIN_SPACING constant                                             |
| `garden-evolution.ts`      | Added selectSpatiallyDistributedPlants() method (greedy algorithm)          |
| `garden-evolution.ts`      | Wave events now use spatial selection                                       |
| `garden-evolution.test.ts` | Added test: "should prefer spatially distributed plants during wave events" |

## Algorithm Details

The spatial distribution algorithm works as follows:

1. **Start with random plant** - Pick a random starting plant for variety
2. **Greedy selection** - For each subsequent selection:
   - Calculate minimum distance from each candidate to all already-selected plants
   - Pick the candidate with the maximum minimum distance (furthest from all selected)
3. **Result** - Plants are spread out across the garden

This ensures wave germinations create a visually distributed pattern rather than clustering in one area.

## Decisions Made

- Used 200px as minimum spacing constant - balances visual spread with practical garden sizes
- Greedy algorithm chosen for simplicity and O(n\*k) complexity (n candidates, k selections)
- Random starting point maintains variety between waves

## Issues Encountered

- None - straightforward implementation

## Quality Checks

All passed:

- TypeScript: No errors
- ESLint: 1 pre-existing warning (unrelated)
- Tests: 175 passing (60 shared + 115 web)

## Next Session Priorities

1. Per-plant germination cooldown near recent germinations (#12)
2. Create EvolutionStatusIndicator component (#13)
3. Batch wave notifications (#15)
4. Performance profiling with 1000 plants (#88)

---

_This archive preserves the detailed session context. For current project state, see [TASKS.md](../../../TASKS.md)._
