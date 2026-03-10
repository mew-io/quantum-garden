# Rendering Performance Optimization — Resume Plan

## Status: In Progress

### Committed (on main, pushed)

1. **Removed per-frame Gaussian blur** from cloud background shader (25 tex samples/px/frame eliminated)
2. **Removed second sparkle layer** (9-iteration loop eliminated per background pixel)
3. **Overlay render gating** — skips overlay render pass when no visible content

### Uncommitted (in working tree)

- **Performance timing instrumentation** — added per-section timing (updates/composerRender/overlays) to debug panel
- **Overlay render target caching** — renders overlay scene to WebGLRenderTarget, composites with single quad. Only re-renders when dirty (content change or camera change). **Not yet validated — may have issues.**

### Root Cause Identified

The bottleneck is the **watercolor plant overlay**. All plants are watercolor mode, meaning each plant creates multiple THREE.Mesh objects (elements × layers). With ~200 plants × ~5 elements × ~4 layers = ~4000 individual draw calls in the overlay scene every frame.

The render target caching approach helps when the camera is static, but the `watercolorPlants.hasActiveAnimations()` returns true every 1 second (lifecycle check interval), causing frequent re-renders. During zoom/pan, the cache is invalidated every frame.

### What Needs To Happen Next

#### Option A: Reduce watercolor draw calls (preferred)

The real fix is reducing the number of meshes. Options:

1. **Merge geometries per plant** — use `BufferGeometryUtils.mergeGeometries()` to combine all layers of a plant into a single mesh. This requires baking per-layer colors into vertex colors instead of separate materials. Could reduce draw calls from ~4000 to ~200.
2. **Batch all watercolor plants into one merged mesh** — merge everything into a single draw call. Rebuild only when plants change. Most aggressive optimization.
3. **Use InstancedMesh for watercolor layers** — group layers by material (color+opacity), use instancing. Similar to how pixel plants work.

#### Option B: Reduce lifecycle check frequency

The `LIFECYCLE_CHECK_INTERVAL` of 1 second in `watercolor-plant-overlay.ts:81` causes the overlay to rebuild every second. Increasing this to 5-10 seconds would reduce frequency of expensive re-renders. Quick win.

#### Option C: Simplify watercolor effect

Reduce `effect.layers` count (currently up to N layers per element). Even going from 4 layers to 2 would halve draw calls. Check `WatercolorEffect` configuration in shared package.

### Remaining planned optimizations (from original plan)

- **Adaptive quality system** — auto-disable bloom when FPS < 45
- **Reduce pixel ratio on mobile** — cap at 1.5x instead of 2x
- **Simplify superposition ghost effect** — reduce from 3 to 1 ghost sample
- **Throttle sparkle time uniform** — update every 2nd frame
- **Replace HSV hue shift with RGB rotation matrix** — cheaper iridescence

### Key Files

- `apps/web/src/components/garden/three/overlays/watercolor-plant-overlay.ts` — main bottleneck
- `apps/web/src/components/garden/three/overlays/watercolor-rendering.ts` — shape builders, layering, material pool
- `apps/web/src/components/garden/three/overlays/overlay-manager.ts` — overlay orchestration + caching
- `apps/web/src/components/garden/three/core/scene-manager.ts` — render loop, post-processing
- `apps/web/src/components/garden/three/core/backgrounds.ts` — cloud shader
- `apps/web/src/components/garden/three/plants/plant-material.ts` — plant fragment shader
- `apps/web/src/components/garden/drawer/debug-tab.tsx` — performance display

### How to verify

1. `pnpm --filter web dev` — open garden, open debug panel, check timing stats
2. Target: Updates < 2ms, Render < 8ms, Overlays < 5ms at idle
3. FPS should stay at 60 on desktop, 45+ on mobile
