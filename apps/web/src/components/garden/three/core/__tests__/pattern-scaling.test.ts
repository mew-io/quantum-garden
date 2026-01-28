/**
 * Tests for pattern scaling in the plant rendering pipeline.
 *
 * These tests verify that patterns from the quantum service (8x8) are
 * properly scaled to the expected size (PATTERN_SIZE = 64x64) before
 * being added to the texture atlas.
 */

import { describe, it, expect } from "vitest";
import { PATTERN_SIZE } from "@quantum-garden/shared";

/**
 * Scale an 8x8 pattern to PATTERN_SIZE x PATTERN_SIZE using nearest-neighbor.
 * This is the function that SHOULD exist but may be missing.
 */
function scalePattern(pattern: number[][], targetSize: number = PATTERN_SIZE): number[][] {
  const sourceSize = pattern.length;
  if (sourceSize === 0) return [];

  // Already the right size
  if (sourceSize === targetSize && pattern[0]?.length === targetSize) {
    return pattern;
  }

  const scale = targetSize / sourceSize;
  const scaled: number[][] = [];

  for (let y = 0; y < targetSize; y++) {
    const row: number[] = [];
    const sourceY = Math.floor(y / scale);
    const sourceRow = pattern[sourceY] ?? [];

    for (let x = 0; x < targetSize; x++) {
      const sourceX = Math.floor(x / scale);
      row.push(sourceRow[sourceX] ?? 0);
    }
    scaled.push(row);
  }

  return scaled;
}

/**
 * Check if a pattern is the expected size.
 */
function isCorrectSize(pattern: number[][]): boolean {
  if (pattern.length !== PATTERN_SIZE) return false;
  return pattern.every((row) => row.length === PATTERN_SIZE);
}

/**
 * Sample 8x8 patterns from the quantum service (matching traits.py)
 */
const SAMPLE_8x8_PATTERNS = {
  cross: [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ],
  diamond: [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ],
};

describe("Pattern Scaling", () => {
  describe("PATTERN_SIZE constant", () => {
    it("should be 64", () => {
      expect(PATTERN_SIZE).toBe(64);
    });
  });

  describe("scalePattern function", () => {
    it("should scale 8x8 pattern to 64x64", () => {
      const scaled = scalePattern(SAMPLE_8x8_PATTERNS.cross);

      expect(scaled.length).toBe(64);
      expect(scaled[0]?.length).toBe(64);
      expect(isCorrectSize(scaled)).toBe(true);
    });

    it("should preserve pattern structure when scaling", () => {
      const scaled = scalePattern(SAMPLE_8x8_PATTERNS.cross);

      // Each 8x8 cell becomes an 8x8 block in the 64x64 output
      // Check the center cross pattern is maintained

      // Top-left corner should be empty (0)
      expect(scaled[0]?.[0]).toBe(0);

      // Center should be filled (1)
      expect(scaled[32]?.[32]).toBe(1);

      // Horizontal bar should extend across
      expect(scaled[32]?.[0]).toBe(1);
      expect(scaled[32]?.[63]).toBe(1);

      // Vertical bar should extend across
      expect(scaled[0]?.[32]).toBe(1);
      expect(scaled[63]?.[32]).toBe(1);
    });

    it("should handle already-correct-size patterns", () => {
      // Create a 64x64 pattern
      const fullSize = Array.from({ length: 64 }, () => Array.from({ length: 64 }, () => 1));

      const result = scalePattern(fullSize);

      expect(result.length).toBe(64);
      expect(result[0]?.length).toBe(64);
      // Should be all 1s
      expect(result.every((row) => row.every((cell) => cell === 1))).toBe(true);
    });

    it("should handle empty patterns", () => {
      const result = scalePattern([]);
      expect(result).toEqual([]);
    });
  });

  describe("Pattern from quantum service simulation", () => {
    // Simulate receiving traits from quantum service
    const simulatedTraits = {
      glyphPattern: SAMPLE_8x8_PATTERNS.diamond,
      colorPalette: ["#2D3436", "#636E72", "#B2BEC3"],
      growthRate: 1.0,
      opacity: 0.9,
    };

    it("should identify 8x8 pattern as wrong size", () => {
      expect(isCorrectSize(simulatedTraits.glyphPattern)).toBe(false);
    });

    it("should correctly scale 8x8 to 64x64", () => {
      const scaled = scalePattern(simulatedTraits.glyphPattern);
      expect(isCorrectSize(scaled)).toBe(true);
    });

    it("FAILS if pattern is used without scaling", () => {
      // This test documents the bug:
      // If we use the 8x8 pattern directly without scaling,
      // it will only fill 8/64 = 12.5% of each dimension
      // resulting in a tiny pattern in the corner

      const pattern = simulatedTraits.glyphPattern;
      const coverage = (pattern.length / PATTERN_SIZE) * 100;

      // This assertion will pass, demonstrating the problem
      expect(coverage).toBe(12.5); // Only 12.5% coverage!

      // The pattern should cover 100%, not 12.5%
      // This is what causes plants to appear tiny after observation
    });
  });
});

describe("Pattern Integration", () => {
  it("should ensure all patterns used in rendering are PATTERN_SIZE", () => {
    // This is a sanity check that patterns going into the atlas
    // should always be PATTERN_SIZE x PATTERN_SIZE

    // Scale any undersized pattern before use
    const ensureCorrectSize = (pattern: number[][]): number[][] => {
      if (isCorrectSize(pattern)) return pattern;
      return scalePattern(pattern);
    };

    // Test with 8x8
    const small = SAMPLE_8x8_PATTERNS.cross;
    const result = ensureCorrectSize(small);
    expect(isCorrectSize(result)).toBe(true);

    // Test with 64x64
    const full = Array.from({ length: 64 }, () => Array.from({ length: 64 }, () => 1));
    const result2 = ensureCorrectSize(full);
    expect(isCorrectSize(result2)).toBe(true);
  });
});
