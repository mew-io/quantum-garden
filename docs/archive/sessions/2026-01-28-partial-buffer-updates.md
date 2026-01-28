# Session Archive: Partial Buffer Updates for Plant Instancer

**Date**: 2026-01-28
**Synthesis Commit**: (will be filled after commit)

---

## Session Summary

Implemented partial buffer updates in the PlantInstancer to reduce GPU data transfer when only a subset of plant instances change. This optimization uses Three.js's `addUpdateRange()` API to specify partial upload ranges instead of re-uploading entire buffers on every frame.

## Work Completed

- Implemented partial buffer update logic in `markAttributesNeedUpdate()`
- Added `setFullBufferUpdate()` method for complete buffer uploads
- Added `setPartialBufferUpdate()` method for range-based partial uploads
- Added threshold optimization (50% of instances, min 10 total) to choose between partial and full updates

## Code Changes

| Area                 | Change                                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| `plant-instancer.ts` | Refactored `markAttributesNeedUpdate()` to use partial buffer updates     |
| `plant-instancer.ts` | Added `setFullBufferUpdate()` helper method                               |
| `plant-instancer.ts` | Added `setPartialBufferUpdate()` helper method with itemSize calculations |

## Technical Details

### Problem

Previously, `markAttributesNeedUpdate()` simply set `needsUpdate = true` on all 7 buffer attributes. This caused Three.js to re-upload the entire buffer (~100KB+ for 1000 plants) to the GPU even when only a few instances changed.

### Solution

1. Track dirty instance indices via existing `dirtyInstances: Set<number>`
2. Calculate min/max index range of dirty instances
3. Use Three.js r150+ `addUpdateRange()` API:
   - `attr.updateRanges.length = 0` - clear previous ranges
   - `attr.addUpdateRange(startIndex * itemSize, count * itemSize)` - set partial range
4. Fall back to full update when:
   - Dirty range spans > 50% of total instances
   - Total instances < 10 (overhead not worth it)
   - Forcing full sync (first sync, structural changes)

### Buffer Attributes Updated

| Attribute         | Item Size | Purpose                                         |
| ----------------- | --------- | ----------------------------------------------- |
| instancePosition  | 3         | x, y, z position                                |
| instanceUVBounds  | 4         | u, v, width, height                             |
| instancePalette0  | 3         | Primary color RGB                               |
| instancePalette1  | 3         | Secondary color RGB                             |
| instancePalette2  | 3         | Tertiary color RGB                              |
| instanceState     | 4         | opacity, scale, visualState, transitionProgress |
| instanceAnimation | 2         | shimmerPhase, lifecycleProgress                 |

## Decisions Made

- **50% threshold**: If the dirty range spans more than half the buffer, a full update is more efficient than partial due to reduced API overhead
- **Minimum 10 instances**: For very small instance counts, partial updates add complexity without meaningful performance benefit
- **Contiguous range only**: We upload the min-to-max range, not individual dirty indices, to keep the API simple and avoid multiple update ranges per attribute

## Issues Encountered

- None - implementation went smoothly following the existing dirty tracking infrastructure

## Next Session Priorities

1. Task #85: Add `hasActiveAnimations()` check to overlays - skip update when no animations active
2. Task #86: Shallow compare entanglement groups before rebuild
3. Task #88: Profile render loop for 1000 plants - measure actual impact of optimizations
4. Task #89: Cache previous keyframe meshes in vector overlay

---

_This archive preserves the detailed session context. For current project state, see [TASKS.md](../../../TASKS.md)._
