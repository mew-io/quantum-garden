# Session Archive: Qubit Count Parameterization for Growth Rate

**Date**: 2026-01-29
**Session ID**: autowork-2026-01-29-006
**Synthesis Commit**: (see git log after commit)

---

## Session Summary

Parameterized the growth rate calculation in the quantum trait mapping to properly scale based on the number of qubits used in the circuit. This fixes a hardcoded divisor that was mathematically incorrect and not adaptable to different circuit configurations.

## Work Completed

- Fixed hardcoded growth rate divisor in `apps/quantum/src/mapping/traits.py`
- Added `qubit_count` parameter to `map_measurements_to_traits()` function
- Implemented mathematically correct max variance formula: `2^(2n-2)`
- Added 2 new tests for qubit count parameterization
- Updated `docs/quantum-circuits.md` with growth rate calculation documentation

## Code Changes

| Area                                 | Change                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `apps/quantum/src/mapping/traits.py` | Added `qubit_count` parameter to `map_measurements_to_traits()`, replaced hardcoded `variance / 16` with parameterized formula |
| `apps/quantum/tests/test_mapping.py` | Added `test_growth_rate_scales_with_qubit_count` and `test_growth_rate_with_single_qubit` tests                                |
| `docs/quantum-circuits.md`           | Added "Growth Rate Calculation" section documenting the formula                                                                |

## Technical Details

### The Problem

The original code had:

```python
growth_rate = 0.5 + (variance / 16) * 1.5  # Assuming 5-bit values
```

This was problematic because:

1. The comment said "5-bit values" but 16 = 2^4 (4-bit)
2. The divisor was hardcoded, not adaptable to different qubit counts
3. The relationship between qubit count and max variance wasn't documented

### The Solution

The corrected formula uses:

```python
# Max variance occurs when measurements are evenly split between 0 and max_value
# For n qubits: max_value = 2^n - 1, max_variance ≈ (max_value/2)^2 = 2^(2n-2)
max_variance = 2 ** (2 * qubit_count - 2)
normalized_variance = min(variance / max_variance, 1.0)
growth_rate = 0.5 + normalized_variance * 1.5
```

This ensures:

- Growth rate is normalized consistently regardless of circuit complexity
- Different qubit counts produce appropriately scaled results
- Edge cases (single qubit) are handled correctly

## Decisions Made

- **Default qubit_count = 5**: Maintains backward compatibility with existing circuits
- **Clamping at 1.0**: Ensures normalized variance never exceeds 1.0 even with extreme distributions
- **Growth rate range 0.5-2.0**: Unchanged from original design

## Issues Encountered

- None. Implementation was straightforward once the mathematical formula was identified.

## Verification

- All 8 Python tests passing (including 2 new tests)
- All 268 TypeScript tests passing
- ESLint passing (pre-existing warning only)
- Type checks passing

## Next Session Priorities

1. Review opacity-from-consistency logic (#78)
2. Consider probability-weighted superposition rendering (#79)
3. Implement sound effects Phase 1 (#119)

---

_This archive preserves the detailed session context. For current project state, see [TASKS.md](../../../TASKS.md)._
