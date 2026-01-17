# Session Archive: Mock Trait Generation

**Date**: 2026-01-17
**Session ID**: synthesis-2026-01-17-006
**Previous Synthesis**: 84d81cf

---

## Session Summary

Implemented mock trait generation in the observation router, replacing the real-time quantum service call with deterministic pseudorandom generation. This aligns with the architectural insight that observation is a UX layer over pre-computed data - traits are determined at plant creation, not observation time.

## Work Completed

- Implemented seeded pseudorandom number generator for reproducible traits
- Created `generateMockTraits()` function using circuit definition as seed
- Replaced quantum service `/circuits/measure` call with local mock generation
- Updated observation system documentation to reflect pre-computed approach
- Clarified TASKS.md notes about quantum integration deferral

## Code Changes

| Area                                         | Change                                                   |
| -------------------------------------------- | -------------------------------------------------------- |
| `apps/web/src/server/routers/observation.ts` | Replaced quantum service call with mock trait generation |
| `docs/observation-system.md`                 | Added pre-computed trait resolution section              |
| `TASKS.md`                                   | Updated notes and implementation status                  |

## Technical Details

### Mock Trait Generation

The `generateMockTraits()` function:

1. **Extracts seed from circuit definition** - Decodes base64 circuit, extracts seed for reproducibility
2. **Uses linear congruential generator** - Simple PRNG with known formula for determinism
3. **Selects glyph pattern** - Randomly picks from predefined patterns
4. **Resolves color palette** - Uses variant's palette if available, otherwise random selection
5. **Generates growth rate** - Range 0.5 to 1.5 (slow to fast lifecycle)
6. **Generates opacity** - Range 0.7 to 1.0 (maintains visibility)

```typescript
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}
```

### Architectural Clarification

This change reflects an important architectural insight:

- **Observation is UX, not computation** - Traits exist before observation
- **No real-time quantum calls needed** - Traits are pre-computed at seeding
- **No real-time broadcasts needed** - State is already determined
- **Simpler architecture** - Fewer moving parts, same visual experience

When real quantum integration is enabled:

- Quantum circuits execute at plant creation time
- Measurement results are stored as pre-computed traits
- Observation UX remains unchanged

## Design Decisions

- **Deterministic randomness** - Same circuit always produces same traits
- **Variant-aware palettes** - Respects variant color schemes
- **Graceful fallback** - Falls back to random if variant lookup fails
- **No network dependency** - Observation works offline after initial load

## Issues Encountered

None - this was a simplification of the architecture.

## Quality Checks

- TypeScript: Passing
- Lint: Passing
- Tests: N/A (no test runner configured yet)

## Next Session Priorities

1. **Test coverage** - Add tests for lifecycle computation logic
2. **End-to-end testing** - Seed garden, observe plant, verify state change
3. **Visual polish** - Refine collapse animation timing if needed

---

_This archive preserves the detailed session context. For current project state, see [TASKS.md](../../../TASKS.md)._
