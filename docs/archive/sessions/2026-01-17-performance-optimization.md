# Session: Performance Optimization

**Date**: 2026-01-17
**Focus**: Optimize PlantRenderer for large gardens

## Summary

Added performance optimizations to the PlantRenderer to handle larger numbers of plants efficiently. Implemented viewport culling to skip rendering off-screen plants and shallow comparison to avoid unnecessary processing when non-plant store updates occur (e.g., reticle movements).

## Changes Made

### Viewport Culling

- Plants outside the visible viewport are not rendered each frame
- Added `CULL_MARGIN` constant (50px) to render slightly beyond viewport edge
- Uses `sprite.visible` flag for GPU-level culling
- `isInViewport()` method checks sprite position against viewport bounds
- `getViewportBounds()` calculates current viewport with margin

### Shallow Plant Comparison

- Added `lastPlantIds` Set to track which plants were last synced
- `shouldSyncPlants()` method performs shallow comparison:
  - Checks if plant count changed
  - Checks if any plant IDs are new
- Avoids full sync processing when only reticle/dwell state changes
- Zustand subscription now only calls `syncPlants()` when needed

### Constants

- `SPRITE_SIZE = 32` (8x8 grid at 4px cell size)
- `CULL_MARGIN = 50` (render buffer around viewport)

## Files Modified

- `apps/web/src/components/garden/plant-renderer.ts`
  - Added viewport culling in `update()` method
  - Added `shouldSyncPlants()` for shallow comparison
  - Added `getViewportBounds()` and `isInViewport()` helpers
  - Added constants for sprite size and cull margin

## Performance Impact

- Reduces CPU load when many plants exist but only a few are visible
- Eliminates unnecessary work when reticle moves or dwell progress updates
- Maintains 60fps with larger plant counts

## Quality Checks

- All 83 tests pass (45 shared + 38 web)
- Type checking passes
- Linting passes

## Design Decisions

- Used Set for ID tracking (O(1) lookup vs O(n) array search)
- 50px cull margin prevents pop-in at viewport edges
- Kept sprite size constant centralized for future adjustment
