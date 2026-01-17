# Sprite Sandbox

Visual development environment for plant glyphs and color palettes.

---

## Overview

The Sprite Sandbox is a dedicated development tool for designing and testing plant visual assets. It provides a matrix view of all glyph patterns combined with all color palettes, with controls for scale, visual state, and QA overlays.

**URL**: http://localhost:14923/sandbox

---

## Design Philosophy

Use a light, airy pastel palette built on an off-white canvas. Colors should feel soft, optimistic, and low contrast — never saturated or harsh. Accents appear as small, pixel-like star forms in coral pink, peach, lavender, sky blue, mint, and sage.

**Key principles:**

- Treat all hues as evenly weighted; none dominate the system
- Favor subtle gradients and gentle glow over flat fills
- The overall tone should feel playful, calm, and friendly
- A quiet sense of motion and warmth
- Negative space is essential — backgrounds remain very light
- Color is used sparingly as floating points of delight

---

## Features

| Feature                  | Description                                                              |
| ------------------------ | ------------------------------------------------------------------------ |
| Pattern × Palette Matrix | Displays all combinations (currently 4 patterns × 8 palettes = 32 cells) |
| Scale Options            | 8px, 16px, 24px, 32px                                                    |
| Visual States            | Collapsed (single pattern) or Superposed (overlapping at 0.3 opacity)    |
| Background Options       | White, Dark, or Checkerboard                                             |
| Grid Overlay             | Pixel-level grid lines for QA                                            |
| Hot Reload               | Changes to pattern/palette files update immediately                      |

---

## Adding New Patterns

Edit `packages/shared/src/patterns/glyphs.ts`:

```typescript
export const GLYPH_PATTERNS: GlyphPattern[] = [
  // ... existing patterns ...
  {
    name: "star",
    description: "Five-pointed star - rare quantum state",
    grid: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
    ],
  },
];
```

**Pattern format:**

- 8×8 grid of 0s and 1s
- `1` = filled pixel
- `0` = empty pixel
- Include a descriptive `name` and `description`

---

## Adding New Palettes

Edit `packages/shared/src/patterns/palettes.ts`:

```typescript
export const COLOR_PALETTES: ColorPalette[] = [
  // ... existing palettes ...
  {
    name: "dawn",
    description: "Early morning light — soft awakening",
    colors: ["#F0E0D0", "#F8F0E8", "#FEFCFA"],
  },
];
```

**Palette format:**

- Exactly 3 colors as hex strings
- Order: Primary (core accent) → Secondary (gentle mid-tone) → Tertiary (lightest whisper)
- Keep colors soft and low-contrast (pastel range: #C0-#F8)
- Include a descriptive `name` and `description`

**Current palettes:** coral, peach, lavender, sky, mint, sage, canvas, blossom

---

## File Structure

```
packages/shared/src/patterns/
├── index.ts       # Barrel export
├── glyphs.ts      # Glyph pattern definitions
└── palettes.ts    # Color palette definitions

apps/web/src/
├── app/sandbox/
│   └── page.tsx           # Route entry point
├── components/sandbox/
│   ├── index.ts           # Barrel export
│   ├── sandbox.tsx        # Main orchestrator
│   ├── glyph-canvas.tsx   # Single PixiJS canvas renderer
│   ├── glyph-renderer.tsx # PixiJS rendering logic
│   ├── glyph-preview.tsx  # React wrapper
│   └── control-panel.tsx  # UI controls
└── stores/
    └── sandbox-store.ts   # Zustand state
```

---

## Workflow

1. Start the dev server: `pnpm dev`
2. Open http://localhost:14923/sandbox
3. Edit pattern or palette files
4. Save — the sandbox hot-reloads automatically
5. Use controls to test different scales and states
6. Enable grid overlay for pixel-level verification

---

## How Rendering Works

Patterns are rendered using PixiJS Graphics:

1. Each cell in the 8×8 grid becomes a rectangle at the specified scale
2. Color is determined by distance from center (creates a gradient effect):
   - Center pixels → Primary color
   - Middle pixels → Secondary color
   - Edge pixels → Tertiary color
3. In superposed mode, 2-3 patterns are overlaid at 0.3 opacity each

---

## Technical Notes

- Patterns and palettes are defined in TypeScript for type safety and hot-reload support
- The quantum service (Python) can import these definitions via a generated JSON file during build
- The sandbox uses a single PixiJS canvas (WebGL) to render all glyphs efficiently
- The same renderer will be used in the main garden view
