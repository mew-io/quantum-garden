# Session Archive: Time-Travel Edge Cases Fix

**Date**: 2026-01-28
**Loop**: 19
**Task**: #70 - Fix time-travel edge cases (zero duration, stale now)
**Previous Synthesis**: 289a52c

---

## Summary

Fixed two edge cases in the time-travel scrubber component that could cause incorrect timeline behavior:

1. **Stale `now` value** - The timeline endpoint never updated after mount
2. **Zero duration** - Division by zero when garden was just created

---

## Work Completed

### Bug Fix: Stale `now` Value

**Problem**: The `now` variable was created with `useMemo(() => new Date(), [])`, meaning it was computed once at component mount and never updated.

**Impact**:

- Timeline endpoint was fixed at component mount time
- Playback couldn't go past the initial `now` value
- New events that occurred after mount didn't show up on timeline

**Solution**: Changed from `useMemo` to `useState` with `useEffect` that updates every 10 seconds when the timeline is expanded:

```typescript
const [now, setNow] = useState(() => new Date());
useEffect(() => {
  if (!isExpanded) return;

  const interval = setInterval(() => {
    setNow(new Date());
  }, 10000); // Update every 10 seconds

  return () => clearInterval(interval);
}, [isExpanded]);
```

### Bug Fix: Zero Duration Division

**Problem**: When `gardenCreatedAt` equals `now` (garden just created), `timeRange.duration` was 0, causing division by zero in progress calculations.

**Solution**: Added minimum duration of 1 second:

```typescript
const duration = Math.max(1000, end - start);
```

### Additional Safety Improvements

1. **Clamped scrub position** - Scrubbing can't exceed current time:

   ```typescript
   const clampedTime = Math.min(targetTime, now.getTime());
   ```

2. **Clamped playhead progress** - Progress is always 0-1:

   ```typescript
   return Math.max(0, Math.min(1, progress));
   ```

3. **Clamped event marker positions** - Markers can't go outside timeline:

   ```typescript
   const progress = Math.max(0, Math.min(1, rawProgress));
   ```

4. **Removed redundant check** - The `timeRange.duration === 0` check is now impossible due to the minimum duration.

---

## Files Changed

| File                                                      | Changes                                        |
| --------------------------------------------------------- | ---------------------------------------------- |
| `apps/web/src/components/garden/time-travel-scrubber.tsx` | Fixed stale now, zero duration, added clamping |

---

## Quality Checks

- All 172 tests passing (60 shared + 112 web)
- TypeScript: No errors
- ESLint: No new warnings

---

## Related Tasks

- Task #70: Fix time-travel edge cases (zero duration, stale now) - **COMPLETED**

---

## Technical Notes

The time-travel scrubber is used to navigate garden history. Key behaviors:

1. Shows timeline from garden creation to current time
2. Event markers indicate germinations (green) and observations (blue)
3. Draggable playhead for scrubbing through history
4. Auto-play mode at 10x speed

The 10-second update interval for `now` is a reasonable balance between:

- Keeping the timeline endpoint fresh (important for long sessions)
- Avoiding excessive re-renders (10s is infrequent enough)
- Only updating when expanded (no overhead when hidden)
