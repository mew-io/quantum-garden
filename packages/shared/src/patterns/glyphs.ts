/**
 * Glyph pattern definitions for Quantum Garden plants.
 *
 * Each pattern is a 64x64 grid where:
 * - 1 = filled pixel
 * - 0 = empty pixel
 *
 * To add a new pattern:
 * 1. Add a new entry to GLYPH_PATTERNS with a descriptive name
 * 2. Define the 64x64 grid
 * 3. The pattern will automatically appear in the sandbox at /sandbox
 *
 * Note: These sandbox patterns are separate from variant definitions.
 * For now, they remain as simple 8x8-equivalent patterns for testing.
 */

export interface GlyphPattern {
  name: string;
  description: string;
  grid: number[][];
}

export const GLYPH_PATTERNS: GlyphPattern[] = [
  {
    name: "cross",
    description: "Simple cross pattern - classic plant form",
    grid: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
    ],
  },
  {
    name: "diamond",
    description: "Diamond shape - pointed form expanding from center",
    grid: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
    ],
  },
  {
    name: "circle",
    description: "Hollow circle - rounded organic shape",
    grid: [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 0, 0, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ],
  },
  {
    name: "square",
    description: "Hollow square - rectangular outline",
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
];

/**
 * Get a pattern by name
 */
export function getPatternByName(name: string): GlyphPattern | undefined {
  return GLYPH_PATTERNS.find((p) => p.name === name);
}

/**
 * Get a pattern by index (for quantum mapping)
 * Wraps around if index exceeds array length
 */
export function getPatternByIndex(index: number): GlyphPattern {
  const pattern = GLYPH_PATTERNS[index % GLYPH_PATTERNS.length];
  if (!pattern) {
    throw new Error(`No pattern at index ${index}`);
  }
  return pattern;
}
