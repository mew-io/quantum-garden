# Session Log

**Session Started**: 2026-01-28
**Previous Synthesis**: ee84e5d

---

## Notes

### Loop 30 - Task #84: Use partial buffer updates for dirty instances

Implemented partial buffer updates in PlantInstancer to reduce GPU data transfer.

**Problem:**

- Previously `markAttributesNeedUpdate()` set `needsUpdate = true` on all buffer attributes
- This caused Three.js to re-upload the entire buffer to GPU even when only a few instances changed
- With 1000 plants, this transfers ~100KB+ per frame unnecessarily

**Solution:**

- Track min/max dirty instance indices
- Use Three.js `addUpdateRange()` API to specify partial upload ranges
- Only upload the range containing dirty instances

**Implementation:**

1. Added `setFullBufferUpdate()` - clears update ranges for full buffer upload
2. Added `setPartialBufferUpdate()` - sets ranges using `attr.addUpdateRange(offset, count)`
3. Updated `markAttributesNeedUpdate()` to:
   - Calculate dirty range (min to max index)
   - Use partial update if range < 50% of total instances and total > 10
   - Fall back to full update for small counts or large ranges (threshold optimization)

**Buffer Attributes Updated:**

- instancePosition (itemSize: 3)
- instanceUVBounds (itemSize: 4)
- instancePalette0/1/2 (itemSize: 3 each)
- instanceState (itemSize: 4)
- instanceAnimation (itemSize: 2)

**Note:** Used Three.js r150+ API with `updateRanges` array and `addUpdateRange()` method.

- All 178 tests pass (60 shared + 118 web)

---

## Quality Checks

- TypeScript: Pass
- ESLint: Pass (1 pre-existing warning)
- Tests: 178 passed (60 shared + 118 web)
