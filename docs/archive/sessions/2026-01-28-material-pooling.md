# Session Archive: Material Pooling for Vector Plants

**Date**: 2026-01-28
**Synthesis Commit**: 60d1ae7

---

## Session Summary

Implemented material pooling in the vector plant overlay to reduce GPU allocations. Previously, new `LineBasicMaterial` instances were created and disposed every time a plant's geometry was updated, causing frequent GPU allocations. Now materials with the same color/opacity are cached and reused across all plants.

## Work Completed

- Added material pool (`Map<string, THREE.LineBasicMaterial>`) to cache materials by color+opacity key
- Implemented `getPooledMaterial()` method to fetch or create pooled materials
- Updated `updatePlantGroup()` to use pooled materials instead of creating new ones
- Updated `disposeMeshGroup()` to NOT dispose materials (since they're pooled)
- Updated `dispose()` to clean up pooled materials and geometries on full overlay disposal
- Added `circleGeometryPool` placeholder for future geometry pooling optimization

## Code Changes

| Area                      | Change                                                                    |
| ------------------------- | ------------------------------------------------------------------------- |
| `vector-plant-overlay.ts` | Added material pooling system to reuse materials across plants            |
| `vector-plant-overlay.ts` | Materials now cached by "color-opacity" key with 2 decimal place rounding |
| `vector-plant-overlay.ts` | Geometry disposed individually, materials disposed only on full dispose   |

## Technical Details

**Material Pool Key Format**: `${color}-${roundedOpacity}` (e.g., `#707070-0.8`)

**Opacity Rounding**: Opacity values are rounded to 2 decimal places to increase cache hits (e.g., `0.7834` becomes `0.78`)

**Disposal Strategy**:

- Individual plant removal: dispose geometry only, keep materials in pool
- Full overlay disposal: dispose all pooled materials and geometries

## Quality Checks

- TypeScript: pass
- Lint: pass (1 pre-existing warning)
- Tests: 128 tests passing

## Issues Encountered

None - implementation was straightforward.

## Next Session Priorities

1. Task #9 (P1): Add guaranteed germination after 15 min dormancy
2. Task #46 (P1): Add dwell-time observation mode
3. Task #89 (P2): Cache previous keyframe meshes in vector overlay (related optimization)

---

_This archive preserves the detailed session context. For current project state, see [TASKS.md](../../../TASKS.md)._
