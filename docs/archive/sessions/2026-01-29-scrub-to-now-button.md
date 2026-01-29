# Session: Jump to Now Button for Time-Travel Scrubber (#104)

**Date**: 2026-01-29
**Session ID**: autowork-2026-01-29-001
**Previous Synthesis**: 4ab4193

## Objective

Add a quick button to jump to the current moment in the time-travel scrubber, allowing users who have scrubbed far back in history to easily return to the present without manually dragging the playhead.

## Rationale

When exploring the garden's evolution history, users may scrub far back in time to watch events unfold. Returning to "now" required either:

1. Manually dragging the playhead all the way to the right
2. Exiting and re-entering time-travel mode

A dedicated "Jump to Now" button provides a one-click solution for this common workflow.

## Implementation

### Changes to `time-travel-scrubber.tsx`

Added new button between Play/Pause and Exit Timeline:

```tsx
{
  /* Jump to Now */
}
<button
  onClick={() => {
    setIsPlaying(false);
    setCurrentTime(now);
    onScrubToTime(now);
  }}
  disabled={playheadProgress >= 0.999}
  className={`
    px-3 py-2 rounded-lg text-sm font-medium transition-colors
    ${
      playheadProgress >= 0.999
        ? "bg-white/5 text-white/30 cursor-not-allowed"
        : "bg-white/10 text-white hover:bg-white/20"
    }
  `}
  title="Jump to current time"
>
  ⏭ Now
</button>;
```

### Button Behavior

1. **Stops playback**: If auto-play is running, it stops first
2. **Sets current time**: Updates internal state to current `now` value
3. **Syncs with parent**: Calls `onScrubToTime(now)` to update garden view
4. **Disabled at present**: When playhead is already at current time (progress >= 99.9%), button is disabled

### UI Styling

- Compact size (`px-3 py-2`) slightly narrower than Play button (`px-4 py-2`)
- Same rounded-lg, text-sm, font-medium styling
- Identical disabled/enabled state styling as Play button
- White/10 background with white text when enabled
- White/5 background with white/30 text when disabled
- Tooltip "Jump to current time" via title attribute

## Quality Checks

- TypeScript: passes
- Lint: passes (1 pre-existing warning)
- Tests: 267/268 pass (1 flaky performance test unrelated to changes)

## Files Modified

- `apps/web/src/components/garden/time-travel-scrubber.tsx`

## Related Tasks

- #103 - Playback Speed Control (same session, provides context for button layout)
- #92 - Exit Timeline Button Rename (established button naming convention)
- #70 - Time-Travel Edge Cases Fix (established `now` state management)
