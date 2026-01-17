# Session Archive: Plant Lifecycle System & Variant Sandbox

**Date**: 2026-01-17
**Synthesis Commit**: d2b9d52

---

## Session Summary

Designed and implemented a comprehensive keyframe-based lifecycle system for plant variants, along with a full-featured variant sandbox for visual development. This session focused on establishing the animation foundation that will drive how plants evolve over time in the garden.

## Work Completed

- Designed keyframe-based lifecycle architecture (computed state, not stored)
- Implemented variant types, definitions, and lifecycle computation in shared package
- Created three initial plant variants: simple-bloom, quantum-tulip, pulsing-orb
- Built complete variant sandbox with timeline editor, gallery, and playback controls
- Added superposed view with curated pastel color palettes
- Updated Prisma schema with lifecycle fields
- Created Python variant loader for quantum service integration
- Fixed PixiJS black box rendering issue
- Wrote comprehensive documentation for the variant system

## Code Changes

| Area                                  | Change                                                                      |
| ------------------------------------- | --------------------------------------------------------------------------- |
| `packages/shared/src/variants/`       | New module with types, definitions, and lifecycle computation               |
| `apps/web/src/components/sandbox/`    | Added 8 new components for variant sandbox                                  |
| `apps/web/src/stores/`                | Added variant-sandbox-store for sandbox state management                    |
| `apps/web/prisma/schema.prisma`       | Added variantId, germinatedAt, lifecycleModifier, colorVariationName fields |
| `apps/quantum/src/variants/`          | New Python module for loading variant definitions                           |
| `apps/web/scripts/export-variants.ts` | Build-time export of variants to JSON                                       |
| `docs/variants-and-lifecycle.md`      | Comprehensive lifecycle system documentation                                |

## Key Files Added/Modified

### New Files

- `/packages/shared/src/variants/types.ts` - Core type definitions
- `/packages/shared/src/variants/definitions.ts` - Variant definitions (3 variants)
- `/packages/shared/src/variants/lifecycle.ts` - Lifecycle computation logic
- `/apps/web/src/components/sandbox/variant-sandbox.tsx` - Main sandbox component
- `/apps/web/src/components/sandbox/variant-timeline.tsx` - Timeline keyframe editor
- `/apps/web/src/components/sandbox/variant-gallery.tsx` - Gallery view
- `/apps/web/src/components/sandbox/variant-preview.tsx` - Live animation preview
- `/apps/web/src/components/sandbox/superposed-view.tsx` - Superposition visualization
- `/apps/web/src/stores/variant-sandbox-store.ts` - Zustand store for sandbox
- `/apps/quantum/src/variants/loader.py` - Python variant loader
- `/docs/variants-and-lifecycle.md` - System documentation

### Modified Files

- `/apps/web/prisma/schema.prisma` - Added lifecycle fields to Plant model

## Decisions Made

1. **Computed Lifecycle State**: Lifecycle state is always computed on-demand from germinatedAt timestamp and lifecycleModifier, never stored in the database. This ensures the garden evolves even when no one is watching.

2. **TypeScript as Source of Truth**: All variant definitions live in TypeScript, exported to JSON for Python consumption at build time. This enables hot reload in the sandbox and AI-assisted iteration.

3. **Keyframe-Based Animation**: Replaced traditional lifecycle stages (seed/sprout/grow) with arbitrary keyframes. Designers can define any number of keyframes with custom names, patterns, and timings.

4. **Pastel Color Palettes**: Established a curated set of soft pastel palettes (sage, mint, coral, peach, lavender, sky, canvas, blossom) for the contemplative aesthetic.

5. **Color Variations**: Multi-color variants (like tulips) define colorVariations; quantum measurement selects which color set a plant uses.

## Issues Encountered

- **PixiJS Black Box**: Initial rendering showed black boxes instead of glyphs. Fixed by ensuring proper WebGL context and glyph pattern rendering.

## Architecture Notes

The lifecycle system is designed to be:

- **Time-independent**: Same plant always shows same state at same timestamp
- **Observable-agnostic**: Plants evolve whether observed or not
- **Quantum-integrated**: lifecycleModifier comes from quantum growthRate trait
- **Designer-friendly**: Sandbox enables rapid visual iteration

## Next Session Priorities

1. **Integrate lifecycle rendering into main canvas** - Apply the variant system to actual plant rendering in the garden view
2. **Implement reticle controller** - Create cursor-following observation targeting
3. **Build observation mechanics** - Dwell time tracking and alignment detection
4. **Connect to quantum service** - Wire observation events to quantum measurements
5. **Seed initial plants** - Create test plants with variant assignments

## Technical Debt Identified

- Lifecycle computation lacks test coverage
- Tweening between keyframes is documented but not implemented
- Error boundaries missing in React components

---

_This archive preserves the detailed session context. For current project state, see [TASKS.md](../../../TASKS.md)._
