# Plant Variants & Lifecycle System

This document describes the architecture for plant variants and their time-based lifecycle evolution.

---

## Overview

Plants in Quantum Garden evolve through a series of visual keyframes over time. Each **variant** (species) defines:

- A sequence of visual keyframes with custom patterns and palettes
- Duration for each keyframe (in seconds)
- Rarity affecting spawn probability
- Optional tweening for smooth transitions

Individual plant instances have a **lifecycleModifier** derived from quantum measurements that speeds up or slows down their progression through keyframes.

---

## Core Concepts

### Keyframe-Based Animation

Unlike traditional lifecycle systems with fixed stages (seed → sprout → grow → mature → decay), our system uses **arbitrary keyframes**:

- Any number of keyframes (2, 6, 20 — whatever the design needs)
- Custom names describing visual state ("dense", "radiant", "hollow")
- Per-keyframe patterns, palettes, opacity, scale
- Optional smooth tweening between keyframes

This gives designers full creative freedom while the engine handles timing and interpolation.

### Computed State

Lifecycle state is **computed on demand**, not stored in the database. Given:

- `germinatedAt` timestamp (when the plant started progressing)
- `lifecycleModifier` (individual speed multiplier from quantum traits)
- Current time

The engine calculates which keyframe is active and progress within it. Benefits:

- No sync issues between stored state and real time
- Garden evolves even when no one is watching
- Simpler data model
- Time travel for debugging (pass any timestamp)

---

## Data Model

### PlantVariant

Defines a "species" template:

```typescript
interface PlantVariant {
  id: string;
  name: string;
  description?: string;

  // Spawn probability (0.0-1.0, lower = rarer)
  rarity: number;

  // Does observation trigger germination?
  requiresObservationToGerminate: boolean;

  // Ordered array of keyframes
  keyframes: GlyphKeyframe[];

  // Optional color variations (for multi-color variants like tulips)
  colorVariations?: ColorVariation[];

  // Optional: smooth interpolation between keyframes
  tweenBetweenKeyframes?: boolean;

  // Optional: loop back to first keyframe when complete
  loop?: boolean;
}
```

### Color Handling

Colors are embedded in variants, not a separate matrix:

**Fixed-color variants** (like grass):

- Palette defined directly in each keyframe
- No `colorVariations` field
- Always renders with the same colors

**Multi-color variants** (like tulips):

- Define `colorVariations` array with palette overrides
- Quantum measurement selects which color variation to use
- Different plants of same variant can have different colors

```typescript
interface ColorVariation {
  name: string; // e.g., "red", "yellow", "purple"
  weight: number; // Relative probability
  palettes: Record<string, string[]>; // Keyframe name → palette
}
```

Example multi-color variant:

```typescript
{
  id: "tulip",
  keyframes: [
    { name: "bloom", palette: ["#E91E63", ...], ... },
  ],
  colorVariations: [
    { name: "red", weight: 1.0, palettes: { bloom: ["#C62828", ...] } },
    { name: "yellow", weight: 0.8, palettes: { bloom: ["#F9A825", ...] } },
    { name: "purple", weight: 0.5, palettes: { bloom: ["#6A1B9A", ...] } },
  ]
}
```

### GlyphKeyframe

A single moment in the plant's visual timeline:

```typescript
interface GlyphKeyframe {
  name: string; // Descriptive name ("bloom", "wilt", "pulse-1")
  duration: number; // Seconds this keyframe lasts
  pattern: number[][]; // 8x8 glyph grid
  palette: string[]; // Colors for this keyframe
  opacity?: number; // Optional opacity (default 1.0)
  scale?: number; // Optional scale (default 1.0)

  // Extensible for future properties
  [key: string]: unknown;
}
```

### Plant (Database)

Extended with lifecycle fields:

```prisma
model Plant {
  // Existing fields...

  variantId         String
  germinatedAt      DateTime?        // null = not yet germinated
  lifecycleModifier Float @default(1.0)

  variant           PlantVariant @relation(...)
}
```

### ComputedLifecycleState

Runtime calculation result:

```typescript
interface ComputedLifecycleState {
  currentKeyframe: GlyphKeyframe;
  keyframeIndex: number;
  keyframeProgress: number; // 0.0-1.0 within keyframe

  totalProgress: number; // 0.0-1.0 through entire lifecycle
  elapsedSeconds: number;
  totalDurationSeconds: number;

  nextKeyframe?: GlyphKeyframe; // For tweening
  isComplete: boolean; // Past all keyframes
}
```

---

## TypeScript as Single Source of Truth

**Critical architectural decision**: All variant definitions live in TypeScript, not Python or the database.

### Why?

1. **Hot reload**: Edit variants, see changes immediately in sandbox
2. **AI-assisted development**: Agents can iterate on visuals with instant feedback
3. **Type safety**: Full TypeScript validation of variant structures
4. **Single source**: No duplication between TS and Python (unlike current `traits.py`)

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  packages/shared/src/variants/                                  │
│  ├── types.ts          # TypeScript interfaces                 │
│  ├── definitions.ts    # Variant definitions (source of truth) │
│  └── lifecycle.ts      # Computation logic                     │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  apps/web                │    │  apps/quantum            │
│  - Direct TypeScript     │    │  - Reads variants.json   │
│    import                │    │    (generated at build)  │
│  - Sandbox hot reload    │    │  - Uses for circuit      │
│  - Frontend rendering    │    │    generation            │
└──────────────────────────┘    └──────────────────────────┘
```

### Build Pipeline

1. **Development**: Web app imports variants directly from `packages/shared`
2. **Build time**: Script exports variants to `apps/quantum/src/data/variants.json`
3. **Python runtime**: Loads JSON and uses for quantum circuit generation

---

## Lifecycle Calculation

### Algorithm

```typescript
function computeState(plant: Plant, variant: PlantVariant, now: Date): ComputedLifecycleState {
  // Not germinated yet
  if (!plant.germinatedAt) {
    return {
      currentKeyframe: variant.keyframes[0],
      keyframeIndex: 0,
      keyframeProgress: 0,
      totalProgress: 0,
      elapsedSeconds: 0,
      totalDurationSeconds: getTotalDuration(variant, plant.lifecycleModifier),
      isComplete: false,
    };
  }

  const elapsed = (now.getTime() - plant.germinatedAt.getTime()) / 1000;

  // Walk through keyframes
  let accumulated = 0;
  for (let i = 0; i < variant.keyframes.length; i++) {
    const keyframe = variant.keyframes[i];
    const effectiveDuration = keyframe.duration / plant.lifecycleModifier;

    if (elapsed < accumulated + effectiveDuration) {
      return {
        currentKeyframe: keyframe,
        keyframeIndex: i,
        keyframeProgress: (elapsed - accumulated) / effectiveDuration,
        totalProgress: elapsed / getTotalDuration(variant, plant.lifecycleModifier),
        elapsedSeconds: elapsed,
        totalDurationSeconds: getTotalDuration(variant, plant.lifecycleModifier),
        nextKeyframe: variant.keyframes[i + 1],
        isComplete: false,
      };
    }
    accumulated += effectiveDuration;
  }

  // Past all keyframes
  return {
    currentKeyframe: variant.keyframes[variant.keyframes.length - 1],
    keyframeIndex: variant.keyframes.length - 1,
    keyframeProgress: 1,
    totalProgress: 1,
    elapsedSeconds: elapsed,
    totalDurationSeconds: getTotalDuration(variant, plant.lifecycleModifier),
    isComplete: true,
  };
}
```

### Lifecycle Modifier

The `lifecycleModifier` comes from the quantum `growthRate` trait (0.5-2.0):

- **1.0**: Normal speed
- **2.0**: 2x faster (half duration)
- **0.5**: 2x slower (double duration)

Formula: `effectiveDuration = baseDuration / lifecycleModifier`

---

## Quantum Integration

### Variant Selection

When spawning a new plant, quantum probability determines which variant:

```typescript
function selectVariant(variants: PlantVariant[], probability: number): PlantVariant {
  // Sort by rarity (rarest first)
  const sorted = [...variants].sort((a, b) => a.rarity - b.rarity);

  let cumulative = 0;
  for (const variant of sorted) {
    cumulative += variant.rarity;
    if (probability <= cumulative) {
      return variant;
    }
  }

  return sorted[sorted.length - 1]; // Fallback to most common
}
```

### Germination

When a plant is observed (if `requiresObservationToGerminate` is true):

1. Quantum measurement resolves traits
2. `growthRate` trait becomes `lifecycleModifier`
3. `germinatedAt` is set to current time
4. Plant begins progressing through keyframes

### Entanglement

Entangled plants can optionally share lifecycle rates:

- Average modifier across the group influences each plant
- Observing one plant can trigger germination in entangled partners

---

## Visual Design Guidelines

### Keyframe Naming

Use descriptive names for visual states:

- **Good**: "dense", "sparse", "radiant", "muted", "hollow", "pulse-1"
- **Avoid**: "stage-1", "stage-2", "frame-a" (too generic)

### Creative Freedom

Designers have complete control:

- **Keyframe count**: 2 or 20, whatever serves the design
- **Patterns**: Can morph, fragment, invert, or completely transform
- **Colors**: Shift, pulse, fade, or stay constant
- **Timing**: Fast bursts or slow drifts create rhythm
- **Looping**: Last keyframe can transition back to first

### Suggested Timelines

For observable change (not hours/days):

- Quick variants: 30-90 seconds total lifecycle
- Standard variants: 2-5 minutes total lifecycle
- Long variants: 5-10 minutes total lifecycle

---

## Tweening (Future Enhancement)

When `tweenBetweenKeyframes: true`:

- Pattern pixels interpolate (fade in/out individually)
- Colors blend smoothly between palettes
- Opacity and scale interpolate
- Creates continuous animation rather than discrete jumps

Implementation considerations:

- Per-pixel opacity for pattern transitions
- HSL color interpolation for natural blending
- Easing functions for natural motion

---

## File Structure

```
packages/shared/src/
├── variants/
│   ├── index.ts              # Re-exports
│   ├── types.ts              # PlantVariant, GlyphKeyframe interfaces
│   ├── definitions.ts        # Variant definitions array
│   └── lifecycle.ts          # computeState, getTotalDuration
└── types.ts                  # Add lifecycle types to main exports

apps/web/
├── scripts/
│   └── export-variants.ts    # Build-time JSON export
└── src/server/routers/
    └── variants.ts           # tRPC router for variant data

apps/quantum/src/
├── data/
│   └── variants.json         # Generated (gitignored)
└── mapping/
    └── variants.py           # Load and use variants
```

---

## Sandbox Integration

The sandbox at `/sandbox` should support lifecycle design with a **timeline view**:

### Timeline View

Display all keyframes horizontally like a video editor:

```
┌─────────┬─────────┬─────────────────┬─────────┬─────────┐
│  bud    │ sprout  │     bloom       │  wilt   │  rest   │
│  10s    │  15s    │      45s        │  20s    │  15s    │
│  [img]  │  [img]  │     [img]       │  [img]  │  [img]  │
└─────────┴─────────┴─────────────────┴─────────┴─────────┘
     ▲                      │
     │                      ▼ (playhead)
  selected             current preview
```

### Features

- **Visual keyframe cards**: Each keyframe shown as a card with its glyph preview
- **Width proportional to duration**: Longer keyframes take more horizontal space
- **Click to select**: Click a keyframe to edit its pattern/palette/properties
- **Drag to reorder**: Rearrange keyframe sequence
- **Drag edges to resize**: Adjust duration by dragging keyframe boundaries
- **Playhead**: Animating marker shows current position during playback
- **Play/pause/speed**: Preview the animation at various speeds (0.5x, 1x, 2x, 5x)

### Editing Workflow

1. See all keyframes at a glance in the timeline
2. Click a keyframe to select it
3. Edit pattern/palette in the detail panel (like current sandbox)
4. Adjust duration by dragging timeline edges
5. Add/remove keyframes with + / - buttons
6. Preview full animation with play button

This enables designers to see the complete lifecycle structure while editing individual frames.

---

## Migration Path

For existing plants without lifecycle data:

1. Create a "Legacy" variant as default
2. Set `variantId` to "legacy" for all existing plants
3. Set `germinatedAt` to `observedAt` for observed plants
4. Set `lifecycleModifier` from existing `growthRate` trait

New plants use the full variant system from creation.
