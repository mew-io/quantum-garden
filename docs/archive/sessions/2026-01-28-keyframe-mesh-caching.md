# Session Archive: Keyframe Mesh Caching (#89)

**Date**: 2026-01-28
**Session ID**: autowork-2026-01-28-007
**Synthesis Commit**: d5c8c18

---

## Session Summary

Implemented keyframe mesh caching in the vector plant overlay to improve rendering performance. Static keyframes now use cached meshes with O(1) cloning instead of O(primitives) geometry creation on each render. Transitioning keyframes still rebuild geometry as needed since draw fractions change each frame.

## Work Completed

- Added `KeyframeMeshCache` type for caching cloneable mesh arrays
- Added `keyframeMeshCache` field to VectorPlantOverlay class
- Implemented `getKeyframeCacheKey()` helper for cache key generation
- Implemented `tryUseCachedMeshes()` to clone cached meshes into plant groups
- Implemented `cacheMeshes()` to store cloned meshes after first render
- Extracted `clearPlantGroup()` for common cleanup logic
- Updated `updatePlantGroup()` to check cache for static keyframes
- Updated `dispose()` to clean up cached mesh geometry

## Code Changes

| File                                                                    | Change                             |
| ----------------------------------------------------------------------- | ---------------------------------- |
| `apps/web/src/components/garden/three/overlays/vector-plant-overlay.ts` | Added keyframe mesh caching system |

## Implementation Details

### Cache Key Generation

The cache key format is `"variantId-keyframeIndex-strokeColor"` to uniquely identify a plant's visual state. This allows reuse across different plants with the same variant and keyframe.

### Cache Strategy

- **Static keyframes**: Check cache first, clone on hit, build and cache on miss
- **Transitioning keyframes**: Always build fresh geometry (draw fractions change each frame)
- **Memory tradeoff**: ~9 variants × 3-5 keyframes cached in memory for CPU savings

### Performance Impact

- Static keyframes: O(1) mesh cloning instead of O(primitives) geometry creation
- Transitioning keyframes: No change (must rebuild for animated draw fractions)
- Most plants are static ~90% of the time, so this optimization covers the majority case

## Decisions Made

- Cache key includes stroke color to handle theme variations
- Geometry cloned rather than shared to allow per-plant modifications
- Cached meshes disposed on full overlay dispose, not per-plant removal

## Issues Encountered

None

## Quality Checks

- TypeScript: Passes
- Lint: Passes (1 pre-existing warning in debug-panel.tsx)
- Tests: All 178 tests pass (60 shared + 118 web)

## Next Session Priorities

1. #13: Create EvolutionStatusIndicator component (P2)
2. #14: Update debug panel evolution badge from store (P2)
3. #15: Batch wave notifications (P2)
4. #75: Fix entanglement to use correlated pool indices (P2)
5. #117: Test with 100+ plants for performance (P2)

---

_This archive preserves the detailed session context. For current project state, see [TASKS.md](../../../TASKS.md)._
