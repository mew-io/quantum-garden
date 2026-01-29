# Playback Speed Control for Time-Travel Scrubber

**Date**: 2026-01-29
**Task**: #103 - Add playback speed control to time-travel
**File**: `apps/web/src/components/garden/time-travel-scrubber.tsx`

## Summary

Added playback speed control to the time-travel scrubber, allowing users to control how fast history playback runs.

## Rationale

Users watching the garden's history playback may want to speed up or slow down the animation to:

- Better understand evolution patterns at slower speeds
- Skip through periods of little activity at faster speeds
- Find the optimal viewing speed for their preference

## Implementation

### Changes Made

1. **Made playback speed state dynamic**
   - Changed from fixed `useState(10)` to dynamic `setPlaybackSpeed`
   - Default speed remains 10x for continuity

2. **Added speed control button group**
   - 5 speed options: 1x, 2x, 5x, 10x, 20x
   - Styled as segmented control with `bg-white/5` container
   - Active speed highlighted with `bg-purple-500`
   - Compact pill buttons (`px-2.5 py-1.5`) with hover states

3. **Updated Play button**
   - Removed hardcoded "(10x)" label
   - Speed is now indicated by the speed control buttons

### UI Design

- Speed buttons grouped in rounded container
- Purple highlight for active speed matches quantum theme
- Consistent styling with existing scrubber controls (Exit Timeline, Play/Pause)
- Positioned to the left of Play/Pause button for logical flow

## Code Changes

```tsx
// Before
const [playbackSpeed] = useState(10); // 10x speed

// After
const [playbackSpeed, setPlaybackSpeed] = useState(10); // Default 10x speed
```

```tsx
// New speed control UI
<div className="flex items-center bg-white/5 rounded-lg p-0.5">
  {[1, 2, 5, 10, 20].map((speed) => (
    <button
      key={speed}
      onClick={() => setPlaybackSpeed(speed)}
      className={`
        px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors
        ${
          playbackSpeed === speed
            ? "bg-purple-500 text-white"
            : "text-white/60 hover:text-white hover:bg-white/10"
        }
      `}
    >
      {speed}x
    </button>
  ))}
</div>
```

## Quality Checks

- TypeScript: passes
- Lint: passes (1 pre-existing warning)
- Tests: 268/268 pass

## Files Modified

- `apps/web/src/components/garden/time-travel-scrubber.tsx`
