# Testing Guide

This document covers testing approaches for the Quantum Garden, including automated tests and manual visual regression testing.

---

## Automated Tests

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/components/garden/__tests__/evolution-logic.test.ts

# Run Python quantum service tests
cd apps/quantum && source .venv/bin/activate && python -m pytest
```

### Test Coverage

| Area                  | Test File                              | Tests |
| --------------------- | -------------------------------------- | ----- |
| Garden Evolution      | `garden-evolution.test.ts`             | 28    |
| Spatial Grid          | `spatial-grid.test.ts`                 | 24    |
| Evolution Logic       | `evolution-logic.test.ts`              | 41    |
| Performance           | `performance.test.ts`                  | 14    |
| Germination Flow      | `germination-flow.integration.test.ts` | 10    |
| Memory Leaks          | `memory-leaks.test.ts`                 | 17    |
| Garden Store          | `garden-store.test.ts`                 | 46    |
| Evolution System Hook | `use-evolution-system.test.ts`         | 17    |
| Observation Router    | `observation.test.ts`                  | 10    |
| Pattern Scaling       | `pattern-scaling.test.ts`              | 9     |
| Shared Types          | `quantum-pool.test.ts`                 | 11    |
| Lifecycle             | `lifecycle.test.ts`                    | 49    |

**Total: 276 tests** (60 shared + 216 web)

---

## Visual Regression Test Checklist

Use this checklist when making changes that could affect visual appearance. Test on multiple browsers (Chrome, Firefox, Safari) and screen sizes.

### Plant Rendering

#### Superposed State (Unobserved)

- [ ] Plants render at ~30% opacity
- [ ] Shimmer animation is visible and smooth
- [ ] Shimmer is desynchronized between plants (no global pulse)
- [ ] Pattern is visible through the transparency

#### Collapsed State (Observed)

- [ ] Plants render at full opacity (or quantum-measured opacity 0.7-1.0)
- [ ] No shimmer animation
- [ ] Colors match the variant's palette
- [ ] Pattern is crisp and clear

#### State Transition (Collapse Animation)

- [ ] Smooth fade from superposed to collapsed (800ms)
- [ ] Opacity increases gradually
- [ ] Shimmer fades out during transition
- [ ] No visual "pop" or jump

### Lifecycle Stages

#### Seedling (0-25% of lifecycle)

- [ ] Small scale (if variant defines it)
- [ ] Appropriate keyframe pattern
- [ ] Correct palette for stage

#### Mature (25-75% of lifecycle)

- [ ] Full scale
- [ ] Rich, vibrant appearance
- [ ] Peak visual complexity

#### Aged (75-100% of lifecycle)

- [ ] Subtle opacity variance (gentle pulse)
- [ ] May show faded or weathered keyframe
- [ ] Still clearly visible

### Color Variations

- [ ] Each variant's color variations are distinct
- [ ] Palette gradients render smoothly (no banding)
- [ ] Colors are visible against garden background (#F5F0E8)
- [ ] High contrast between plant elements

### Overlays

#### Debug Overlay

- [ ] Plant bounding boxes visible when enabled
- [ ] Center dots mark plant positions
- [ ] Crosshairs visible for selected plant
- [ ] Selected plant pulses (scale + opacity animation)
- [ ] Observation region circle is visible
- [ ] Region center dot marks observation point

#### Feedback Overlay (Celebration)

- [ ] Expanding rings appear on observation
- [ ] Inner ring uses plant's primary color
- [ ] Outer ring uses complementary color
- [ ] Rings fade out smoothly
- [ ] First observation has enhanced effect (3 rings, gold color)

#### Entanglement Overlay

- [ ] Dashed lines connect entangled plants
- [ ] Line color is visible against background
- [ ] Pulse animation travels along lines
- [ ] Wave particles travel between plants during observation

#### Dwell Overlay

- [ ] Reticle drifts smoothly across garden
- [ ] Reticle changes appearance when over eligible plant
- [ ] Progress indicator visible during observation dwell
- [ ] Progress resets when moving off plant

### UI Components

#### Toolbar

- [ ] All buttons visible and clickable
- [ ] Active states clearly indicated (colored backgrounds)
- [ ] Keyboard shortcuts displayed
- [ ] Sound toggle shows correct icon (speaker/muted)
- [ ] Responsive on small screens (labels hidden, icons remain)

#### Debug Panel

- [ ] Opens/closes smoothly
- [ ] All tabs accessible
- [ ] Stats update without jarring flashes
- [ ] Plant list scrollable
- [ ] Selected plant highlighted
- [ ] Performance metrics accurate (FPS, draw calls)

#### Notifications

- [ ] Toast appears in bottom-right corner
- [ ] Progress bar depletes over 5 seconds
- [ ] Notification pauses on hover
- [ ] Max 3 notifications visible
- [ ] Type-specific colors (green/purple/pink/amber)
- [ ] Icons match notification type

#### Context Panel

- [ ] Opens from bottom-left after observation
- [ ] Circuit diagram renders correctly
- [ ] Content staggers in with animation
- [ ] Exit animation plays on dismiss
- [ ] "Don't show again" persists preference

#### Time-Travel Scrubber

- [ ] Opens/closes smoothly
- [ ] Playhead draggable
- [ ] Event markers visible (green for germination, blue for observation)
- [ ] Playback speed control functional
- [ ] "Now" and "Exit Timeline" buttons work
- [ ] Tooltip shows event details on marker hover

### Responsive Behavior

#### Desktop (1200px+)

- [ ] Full toolbar with labels
- [ ] Status bar visible
- [ ] Debug panel full-size
- [ ] Comfortable spacing

#### Tablet (768px - 1199px)

- [ ] Toolbar adapts
- [ ] Panels may overlay garden
- [ ] Touch targets adequate

#### Mobile (< 768px)

- [ ] Toolbar icons only
- [ ] Status bar hidden
- [ ] Panels take full width
- [ ] Touch targets 44px minimum

### Animation Smoothness

- [ ] No dropped frames during normal operation
- [ ] Transitions are fluid (60fps target)
- [ ] No jank during observation
- [ ] No stutter during evolution wave events
- [ ] Reduced motion preference respected (if implemented)

### Performance Indicators

- [ ] FPS stays above 55 with 100 plants
- [ ] FPS stays above 30 with 500 plants
- [ ] No visible lag during observation
- [ ] No visible lag during germination
- [ ] Draw calls typically 2-3

### Browser-Specific

#### Chrome

- [ ] All features functional
- [ ] WebGL renders correctly
- [ ] Animations smooth

#### Firefox

- [ ] All features functional
- [ ] WebGL renders correctly
- [ ] No color differences

#### Safari

- [ ] All features functional
- [ ] Safe area insets respected
- [ ] Audio works after user gesture

### Edge Cases

- [ ] Empty garden (0 plants) shows loading state
- [ ] Large garden (1000 plants) remains responsive
- [ ] Rapid observations don't crash
- [ ] Tab switching doesn't break animations
- [ ] Browser resize updates canvas correctly

---

## Reporting Issues

When reporting a visual issue, include:

1. **Browser and version** (e.g., Chrome 120)
2. **Operating system** (e.g., macOS 14.2)
3. **Screen size/resolution**
4. **Screenshot or video** of the issue
5. **Steps to reproduce**
6. **Expected vs actual behavior**

---

## Adding New Visual Tests

When adding new visual features:

1. Update this checklist with new items
2. Test on all target browsers before merging
3. Consider adding automated visual regression tests (future)
4. Document any known browser-specific behaviors

---

_Last updated: 2026-01-29_
