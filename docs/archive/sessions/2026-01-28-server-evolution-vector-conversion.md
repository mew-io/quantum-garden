# Session Archive: Server-Side Evolution & Vector Conversion

**Date**: 2026-01-28
**Session ID**: autowork-2026-01-28-001
**Synthesis Commit**: (see git log after synthesis)

---

## Session Summary

This session completed two major pieces of work: (1) migrating the evolution system from client-side to server-side so the garden evolves whether anyone is watching, and (2) completing the conversion of all 32 raster plant variants to vector format for smooth, resolution-independent rendering.

## Work Completed

### Loop 1: Performance Monitoring in Debug Panel (#90)

Already committed in previous synthesis (7677fb1).

### Loop 2: Server-Side Evolution System

- Added `GardenState` model to Prisma schema (`lastEvolutionCheck`, `evolutionVersion`)
- Created server-side evolution module at `src/server/evolution.ts`
- Created Vercel Cron API route at `src/app/api/cron/evolve/route.ts`
- Created `vercel.json` with 1-minute cron configuration
- Created standalone worker script at `scripts/evolve-garden.ts`
- Disabled client-side evolution in `garden-scene.tsx`
- Client now polls plants every 5 seconds via `usePlants`
- Fixed bug: observed-but-not-germinated plants now properly included in evolution
- Updated README with Evolution System documentation

### Loop 3: Convert All Raster Variants to Vector Format

- Fixed TypeScript errors (`easing: "smooth"` -> `"easeInOut"`, `strategy: "morphBetweenShapes"` -> `"morph"`)
- Converted 5 remaining geometric variants to vector:
  - `sumi-spirit`: Ink brush stroke enso with brushStroke easing
  - `sacred-mandala`: Concentric circles with radial symmetry
  - `crystal-lattice`: Interlocking diamond grid
  - `stellar-geometry`: Nested star outlines
  - `metatrons-cube`: Sacred geometry Flower of Life pattern
- Removed 5 orphaned `*Vector` duplicate variants
- Updated PLANT_VARIANTS array from 41 to 36 variants
- Marked unused raster pattern functions with underscore prefix

## Code Changes

| Area                               | Change                                             |
| ---------------------------------- | -------------------------------------------------- |
| `prisma/schema.prisma`             | Added GardenState model                            |
| `src/server/evolution.ts`          | NEW: Core server-side evolution logic              |
| `src/app/api/cron/evolve/route.ts` | NEW: Vercel cron endpoint                          |
| `vercel.json`                      | NEW: Cron configuration                            |
| `scripts/evolve-garden.ts`         | NEW: Standalone worker script                      |
| `garden-scene.tsx`                 | Removed client-side evolution                      |
| `definitions.ts`                   | Converted 5 variants to vector, removed duplicates |
| `README.md`                        | Updated variant count, evolution system docs       |
| `TASKS.md`                         | Added completed work entries                       |

## Decisions Made

1. **Server-side evolution**: The garden should evolve independently of observers. This aligns with the philosophical design: "the garden continues to evolve, whether anyone is watching or not."

2. **Preserve raster patterns**: Rather than deleting unused raster pattern generation functions, they were marked with underscore prefix. This preserves the option to support both rendering modes in the future.

3. **36 variant count**: Consolidated from 41 by removing duplicate `*Vector` variants that existed alongside their raster counterparts.

## Issues Encountered

1. **Pre-commit lint failure**: After converting to vector, 32 pattern constants became unused. Resolved by prefixing with underscore to indicate intentional non-use.

2. **Flaky performance test**: One timing-based test (`should scale linearly with plant count for rebuild`) failed on first run but passed on retry. This is a known flaky test due to timing sensitivity.

## Next Session Priorities

1. Consider adding visual feedback for evolution events in the UI
2. Implement wave notification styling (#16)
3. Performance audit of texture atlas packing (#83)
4. Add onboarding tour for new users (#58)
5. Sound effects system planning (#102)

---

_This archive preserves the detailed session context. For current project state, see [TASKS.md](../../../TASKS.md)._
