/**
 * Color palettes for Quantum Garden plants.
 *
 * DESIGN PHILOSOPHY:
 * Use a light, airy pastel palette built on an off-white canvas. Colors should
 * feel soft, optimistic, and low contrast — never saturated or harsh. Accents
 * appear as small, pixel-like star forms. Treat all hues as evenly weighted;
 * none dominate the system. Favor subtle gradients and gentle glow over flat
 * fills. The overall tone should feel playful, calm, and friendly, with a quiet
 * sense of motion and warmth. Negative space is essential — backgrounds remain
 * very light, and color is used sparingly as floating points of delight.
 *
 * Each palette contains 3 colors representing subtle variations within a hue:
 * - Primary (core accent)
 * - Secondary (gentle mid-tone)
 * - Tertiary (lightest whisper)
 *
 * To add a new palette:
 * 1. Add a new entry to COLOR_PALETTES with a descriptive name
 * 2. Define the 3 hex colors (keep them soft and low-contrast)
 * 3. The palette will automatically appear in the sandbox at /sandbox
 */

export interface ColorPalette {
  name: string;
  description: string;
  colors: [string, string, string];
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    name: "coral",
    description: "Soft coral pink — gentle warmth",
    colors: ["#F0C0C0", "#F0D0D0", "#F8E8E8"],
  },
  {
    name: "peach",
    description: "Warm peach apricot — sunset glow",
    colors: ["#F0D0B0", "#F0E0C0", "#F8F0E0"],
  },
  {
    name: "lavender",
    description: "Lavender lilac — dreamy calm",
    colors: ["#E0C0F0", "#E0D0F0", "#F0E8F8"],
  },
  {
    name: "sky",
    description: "Sky blue — morning light",
    colors: ["#C0D8F0", "#D0E0F0", "#E8F0F8"],
  },
  {
    name: "mint",
    description: "Mint aqua — fresh clarity",
    colors: ["#C0E0E0", "#D0F0E0", "#E8F8F0"],
  },
  {
    name: "sage",
    description: "Pale sage green — quiet growth",
    colors: ["#D0E8D0", "#E0F0E0", "#F0F8F0"],
  },
  {
    name: "canvas",
    description: "Off-white canvas — pure potential",
    colors: ["#E8E8F0", "#F0F0F0", "#F8F8F8"],
  },
  {
    name: "blossom",
    description: "Mixed pastels — quantum superposition",
    colors: ["#F0D0E0", "#E0E8F0", "#E8F0E8"],
  },
];

/**
 * Get a palette by name
 */
export function getPaletteByName(name: string): ColorPalette | undefined {
  return COLOR_PALETTES.find((p) => p.name === name);
}

/**
 * Get a palette by index (for quantum mapping)
 * Wraps around if index exceeds array length
 */
export function getPaletteByIndex(index: number): ColorPalette {
  const palette = COLOR_PALETTES[index % COLOR_PALETTES.length];
  if (!palette) {
    throw new Error(`No palette at index ${index}`);
  }
  return palette;
}
