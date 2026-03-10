# Rendering Performance Optimization — Resume Plan

## Status: Adaptive Quality System Implemented

### Committed (on main, pushed)

1. **Removed per-frame Gaussian blur** from cloud background shader (25 tex samples/px/frame eliminated)
2. **Removed second sparkle layer** (9-iteration loop eliminated per background pixel)
3. **Overlay render gating** — skips overlay render pass when no visible content

### Newly Implemented: Adaptive Quality System

Full adaptive rendering system with 4 quality tiers (ultra/high/medium/low) that automatically adjusts based on measured FPS. Degrades gracefully on older hardware to maintain 60fps.

#### AdaptiveQualityManager (`core/adaptive-quality.ts`)

- FPS-driven tier selection with hysteresis (drop at <45fps for 2s, raise at >55fps for 5s, 3s cooldown)
- Prevents oscillation between tiers
- Manual override via debug panel for testing
- Respects `prefers-reduced-motion` (defaults to medium tier)

#### Frustum Culling for Watercolor Overlay

- Per-plant frustum test using bounding spheres in `watercolor-plant-overlay.ts`
- Skips off-screen plants entirely (visibility + rebuild check)
- At 3x zoom, typically only 10-20% of plants visible → major draw call reduction

#### Pixel Ratio Adaptation

- `scene-manager.ts` → `setPixelRatio()` adjusts renderer, composer, and bloom pass
- Ultra: 2x → High: 1.5x → Medium: 1x → Low: 0.75x
- Going 2x→1x reduces fragment count by 75%

#### Post-Processing Quality Tiers

- Bloom toggled off at medium/low (most expensive post-processing pass)
- Sparkle shader (`backgrounds.ts`): quality-dependent neighbor loop
  - Ultra/High: full 3x3 grid (9 iterations)
  - Medium: center cell only (1 iteration)
  - Low: sparkles disabled

#### Plant Shader Simplifications (`plant-material.ts`)

- `u_qualityLevel` uniform gates expensive operations:
  - Ghost texture samples (3 extra lookups) → skipped at medium/low
  - Iridescent HSV hue shift → skipped at medium/low
  - Color transition HSV desaturation → skipped at medium/low
  - Atmospheric perspective HSV desaturation → skipped at low

#### Watercolor Geometry Reduction (`watercolor-rendering.ts`)

- Quality-dependent shape segments: 16→12→8→6
- Quality-dependent tube segments: 32→24→16→12
- Quality-dependent layer count: 100%→60%→40%→2 fixed
- Iridescence HSV skipped at medium/low in merged material shader

#### Overlay Resolution Scaling (`overlay-manager.ts`)

- Render target sized by `overlayResolutionScale`:
  - Ultra/High: 1.0x, Medium: 0.75x, Low: 0.5x
- Watercolor is inherently soft, so reduction is barely visible

#### Particle Count Adaptation (`quantum-particle-overlay.ts`)

- `setMaxParticles()` caps active particles per tier:
  - Ultra: 800, High: 600, Medium: 400, Low: 200

#### Debug Panel Integration (`debug-tab.tsx`)

- Shows quality tier, pixel ratio, bloom status
- Manual tier selector: Auto / Ultra / High / Medium / Low

#### Reduced Motion Alignment

- `prefers-reduced-motion` → defaults to medium tier, locks auto-adaptation
- Responds to media query changes at runtime

### Key Files

- `apps/web/src/components/garden/three/core/adaptive-quality.ts` — quality manager (NEW)
- `apps/web/src/components/garden/three/overlays/watercolor-plant-overlay.ts` — frustum culling
- `apps/web/src/components/garden/three/overlays/watercolor-rendering.ts` — geometry reduction + shader quality
- `apps/web/src/components/garden/three/overlays/overlay-manager.ts` — resolution scaling
- `apps/web/src/components/garden/three/overlays/quantum-particle-overlay.ts` — particle count
- `apps/web/src/components/garden/three/core/scene-manager.ts` — pixel ratio, bloom, sparkle quality
- `apps/web/src/components/garden/three/core/backgrounds.ts` — sparkle quality levels
- `apps/web/src/components/garden/three/plants/plant-material.ts` — shader quality levels
- `apps/web/src/components/garden/three/garden-scene.tsx` — wiring + reduced motion
- `apps/web/src/components/garden/drawer/debug-tab.tsx` — quality panel
- `apps/web/src/stores/garden-store.ts` — quality info state

### How to verify

1. `pnpm --filter web dev` → open garden → open debug panel
2. Check "Adaptive Quality" section shows tier, DPR, bloom status
3. Throttle CPU in Chrome DevTools (6x slowdown) → tier should drop automatically
4. Remove throttle → tier recovers after ~8 seconds
5. Zoom to 3x+ → draw calls should drop significantly (frustum culling)
6. Force "Low" in debug panel → sparkles off, bloom off, simplified rendering
7. Force "Ultra" → full quality restored
8. Target: 60fps on desktop, 45+ on mobile/older hardware
