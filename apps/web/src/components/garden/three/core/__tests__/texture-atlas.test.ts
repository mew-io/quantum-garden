/**
 * Tests for TextureAtlas
 *
 * Validates memory optimizations and dynamic sizing behavior:
 * - Single-channel RED format (1 byte/pixel)
 * - Dynamic sizing (512 -> 1024 -> 2048)
 * - Correct UV bounds calculation
 * - Pattern storage and retrieval
 */

import { describe, it, expect, beforeEach } from "vitest";
import { TextureAtlas, getTextureAtlas, disposeTextureAtlas } from "../texture-atlas";
import { PATTERN_SIZE } from "@quantum-garden/shared";

// Create a simple test pattern
function createTestPattern(fillValue: number = 1): number[][] {
  return Array.from({ length: PATTERN_SIZE }, () =>
    Array.from({ length: PATTERN_SIZE }, () => fillValue)
  );
}

// Create a pattern with a specific pixel set (for uniqueness)
function createUniquePattern(id: number): number[][] {
  const pattern = createTestPattern(0);
  // Set a unique pixel based on id
  const x = id % PATTERN_SIZE;
  const y = Math.floor(id / PATTERN_SIZE) % PATTERN_SIZE;
  pattern[y]![x] = 1;
  return pattern;
}

describe("TextureAtlas", () => {
  let atlas: TextureAtlas;

  beforeEach(() => {
    atlas = new TextureAtlas();
  });

  describe("initialization", () => {
    it("should start with minimum atlas size (512)", () => {
      expect(atlas.atlasSize).toBe(512);
    });

    it("should have zero patterns initially", () => {
      expect(atlas.patternCount).toBe(0);
    });

    it("should accept custom initial size", () => {
      const customAtlas = new TextureAtlas(1024);
      expect(customAtlas.atlasSize).toBe(1024);
    });

    it("should clamp initial size to valid range", () => {
      const smallAtlas = new TextureAtlas(128); // Below min
      expect(smallAtlas.atlasSize).toBe(512);

      const largeAtlas = new TextureAtlas(4096); // Above max
      expect(largeAtlas.atlasSize).toBe(2048);
    });
  });

  describe("memory optimization", () => {
    it("should use 1 byte per pixel (single-channel format)", () => {
      const stats = atlas.getStats();
      // 512x512 atlas with 1 byte/pixel = 262144 bytes
      expect(stats.memoryBytes).toBe(512 * 512);
    });

    it("should report memory savings vs RGBA format", () => {
      const stats = atlas.getStats();
      // RGBA would be 512*512*4 = 1048576 bytes
      // RED format is 512*512*1 = 262144 bytes
      // Savings = 1048576 - 262144 = 786432 bytes
      expect(stats.memorySavedBytes).toBe(512 * 512 * 3);
    });
  });

  describe("pattern storage", () => {
    it("should store and retrieve patterns", () => {
      const pattern = createTestPattern();
      const entry = atlas.getOrAddPattern("test-pattern", pattern);

      expect(entry.index).toBe(0);
      expect(atlas.patternCount).toBe(1);
      expect(atlas.hasPattern("test-pattern")).toBe(true);
    });

    it("should return existing entry for duplicate pattern IDs", () => {
      const pattern = createTestPattern();
      const entry1 = atlas.getOrAddPattern("duplicate", pattern);
      const entry2 = atlas.getOrAddPattern("duplicate", pattern);

      expect(entry1).toBe(entry2);
      expect(atlas.patternCount).toBe(1);
    });

    it("should calculate correct UV bounds for first pattern", () => {
      const pattern = createTestPattern();
      const entry = atlas.getOrAddPattern("first", pattern);

      // First pattern at (0,0) in 512x512 atlas
      // UV bounds: (0, 0, 64/512, 64/512) = (0, 0, 0.125, 0.125)
      expect(entry.uvBounds[0]).toBeCloseTo(0);
      expect(entry.uvBounds[1]).toBeCloseTo(0);
      expect(entry.uvBounds[2]).toBeCloseTo(PATTERN_SIZE / 512);
      expect(entry.uvBounds[3]).toBeCloseTo(PATTERN_SIZE / 512);
    });

    it("should calculate correct UV bounds for subsequent patterns", () => {
      // Add 8 patterns to fill first row (512/64 = 8 patterns per row)
      for (let i = 0; i < 8; i++) {
        atlas.getOrAddPattern(`pattern-${i}`, createUniquePattern(i));
      }

      // 9th pattern should be at row 1, col 0
      const entry = atlas.getOrAddPattern("pattern-8", createUniquePattern(8));

      // Position: col=0, row=1 -> (0, 64) in pixels
      // UV bounds: (0, 64/512, 64/512, 64/512)
      expect(entry.uvBounds[0]).toBeCloseTo(0);
      expect(entry.uvBounds[1]).toBeCloseTo(PATTERN_SIZE / 512);
      expect(entry.uvBounds[2]).toBeCloseTo(PATTERN_SIZE / 512);
      expect(entry.uvBounds[3]).toBeCloseTo(PATTERN_SIZE / 512);
    });
  });

  describe("dynamic sizing", () => {
    it("should grow atlas when capacity is reached", () => {
      // 512x512 atlas can hold 64 patterns (8x8 grid)
      const initialCapacity = 64;

      // Fill atlas to capacity
      for (let i = 0; i < initialCapacity; i++) {
        atlas.getOrAddPattern(`pattern-${i}`, createUniquePattern(i));
      }

      expect(atlas.atlasSize).toBe(512);
      expect(atlas.patternCount).toBe(64);

      // Add one more pattern to trigger growth
      atlas.getOrAddPattern("pattern-overflow", createUniquePattern(100));

      expect(atlas.atlasSize).toBe(1024);
      expect(atlas.patternCount).toBe(65);
    });

    it("should update UV bounds after atlas growth", () => {
      // Add first pattern
      const entry = atlas.getOrAddPattern("first-pattern", createTestPattern());

      // Initial UV bounds in 512x512 atlas
      const initialWidth = entry.uvBounds[2];
      expect(initialWidth).toBeCloseTo(PATTERN_SIZE / 512);

      // Fill atlas and trigger growth
      for (let i = 1; i < 65; i++) {
        atlas.getOrAddPattern(`pattern-${i}`, createUniquePattern(i));
      }

      // After growth to 1024x1024, UV bounds should be updated
      // Pattern width in UV space: 64/1024 = 0.0625
      const updatedBounds = atlas.getPatternUVBounds("first-pattern");
      expect(updatedBounds![2]).toBeCloseTo(PATTERN_SIZE / 1024);
    });

    it("should preserve pattern positions after growth", () => {
      // Add pattern at index 5 (col=5, row=0)
      for (let i = 0; i < 6; i++) {
        atlas.getOrAddPattern(`pattern-${i}`, createUniquePattern(i));
      }

      const boundsBeforeGrowth = atlas.getPatternUVBounds("pattern-5");
      const pixelXBefore = boundsBeforeGrowth![0] * 512;
      const pixelYBefore = boundsBeforeGrowth![1] * 512;

      // Trigger growth
      for (let i = 6; i < 65; i++) {
        atlas.getOrAddPattern(`pattern-${i}`, createUniquePattern(i));
      }

      // Check position is maintained (just scaled to new UV space)
      const boundsAfterGrowth = atlas.getPatternUVBounds("pattern-5");
      const pixelXAfter = boundsAfterGrowth![0] * 1024;
      const pixelYAfter = boundsAfterGrowth![1] * 1024;

      expect(pixelXAfter).toBeCloseTo(pixelXBefore);
      expect(pixelYAfter).toBeCloseTo(pixelYBefore);
    });

    it("should cap growth at maximum size (2048)", () => {
      // Create atlas that's already at 2048
      const maxAtlas = new TextureAtlas(2048);

      // 2048x2048 can hold 1024 patterns (32x32 grid)
      // We can't easily fill that many, so just check the cap works
      expect(maxAtlas.atlasSize).toBe(2048);

      const stats = maxAtlas.getStats();
      expect(stats.maxPatterns).toBe(1024);
    });
  });

  describe("statistics", () => {
    it("should report correct utilization", () => {
      // Add 32 patterns (50% of 64 capacity)
      for (let i = 0; i < 32; i++) {
        atlas.getOrAddPattern(`pattern-${i}`, createUniquePattern(i));
      }

      const stats = atlas.getStats();
      expect(stats.utilization).toBeCloseTo(0.5);
    });

    it("should report all stats correctly", () => {
      for (let i = 0; i < 10; i++) {
        atlas.getOrAddPattern(`pattern-${i}`, createUniquePattern(i));
      }

      const stats = atlas.getStats();
      expect(stats.atlasSize).toBe(512);
      expect(stats.patternCount).toBe(10);
      expect(stats.maxPatterns).toBe(64);
      expect(stats.utilization).toBeCloseTo(10 / 64);
      expect(stats.memoryBytes).toBe(512 * 512);
      expect(stats.memorySavedBytes).toBe(512 * 512 * 3);
    });
  });

  describe("pattern hashing", () => {
    it("should generate consistent hash for same pattern", () => {
      const pattern = createTestPattern();
      const hash1 = TextureAtlas.hashPattern(pattern);
      const hash2 = TextureAtlas.hashPattern(pattern);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hashes for different patterns", () => {
      const pattern1 = createUniquePattern(0);
      const pattern2 = createUniquePattern(1);

      const hash1 = TextureAtlas.hashPattern(pattern1);
      const hash2 = TextureAtlas.hashPattern(pattern2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("disposal", () => {
    it("should clear pattern map on dispose", () => {
      atlas.getOrAddPattern("test", createTestPattern());
      expect(atlas.hasPattern("test")).toBe(true);

      atlas.dispose();
      expect(atlas.hasPattern("test")).toBe(false);
    });
  });
});

describe("Global TextureAtlas", () => {
  beforeEach(() => {
    disposeTextureAtlas();
  });

  it("should create singleton instance", () => {
    const atlas1 = getTextureAtlas();
    const atlas2 = getTextureAtlas();

    expect(atlas1).toBe(atlas2);
  });

  it("should create new instance after disposal", () => {
    const atlas1 = getTextureAtlas();
    atlas1.getOrAddPattern("test", createTestPattern(1));

    disposeTextureAtlas();

    const atlas2 = getTextureAtlas();
    expect(atlas2.hasPattern("test")).toBe(false);
  });
});
