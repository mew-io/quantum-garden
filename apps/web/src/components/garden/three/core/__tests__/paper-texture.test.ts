/**
 * Tests for Paper Texture
 *
 * Validates the procedural noise generation utilities:
 * - Seeded random produces deterministic values in [0, 1)
 * - Noise grid generation and bilinear sampling
 * - Seamless wrapping at grid boundaries
 */

import { describe, it, expect } from "vitest";
import { seededRandom, generateNoiseGrid, sampleNoise, PaperGrainShader } from "../paper-texture";

describe("Paper Texture", () => {
  describe("seededRandom", () => {
    it("should return values in [0, 1) range", () => {
      for (let i = 0; i < 100; i++) {
        const val = seededRandom(i);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    it("should be deterministic for the same seed", () => {
      expect(seededRandom(42)).toBe(seededRandom(42));
      expect(seededRandom(0)).toBe(seededRandom(0));
      expect(seededRandom(999)).toBe(seededRandom(999));
    });

    it("should produce different values for different seeds", () => {
      const values = new Set<number>();
      for (let i = 0; i < 50; i++) {
        values.add(seededRandom(i));
      }
      // At least 45 out of 50 should be unique (extremely likely with good hash)
      expect(values.size).toBeGreaterThan(45);
    });
  });

  describe("generateNoiseGrid", () => {
    it("should produce a grid of the correct size", () => {
      const grid = generateNoiseGrid(64);
      expect(grid.length).toBe(64 * 64);
    });

    it("should contain values in [0, 1) range", () => {
      const grid = generateNoiseGrid(32);
      for (let i = 0; i < grid.length; i++) {
        expect(grid[i]).toBeGreaterThanOrEqual(0);
        expect(grid[i]).toBeLessThan(1);
      }
    });

    it("should produce different grids with different seed offsets", () => {
      const grid1 = generateNoiseGrid(16, 0);
      const grid2 = generateNoiseGrid(16, 37);

      let differences = 0;
      for (let i = 0; i < grid1.length; i++) {
        if (grid1[i] !== grid2[i]) differences++;
      }
      // Virtually all values should differ
      expect(differences).toBeGreaterThan(grid1.length * 0.9);
    });
  });

  describe("sampleNoise", () => {
    it("should return grid values at integer coordinates", () => {
      const grid = generateNoiseGrid(8);

      // At integer coordinates, bilinear should return the exact grid value
      const val = sampleNoise(grid, 8, 0, 0);
      expect(val).toBe(grid[0]);

      const val2 = sampleNoise(grid, 8, 3, 2);
      expect(val2).toBe(grid[2 * 8 + 3]);
    });

    it("should interpolate between grid values", () => {
      const size = 8;
      const grid = generateNoiseGrid(size);

      const v00 = grid[0]!;
      const v10 = grid[1]!;

      // At x=0.5, y=0 should interpolate between (0,0) and (1,0)
      const interpolated = sampleNoise(grid, size, 0.5, 0);
      const expected = v00 + (v10 - v00) * 0.5;
      expect(interpolated).toBeCloseTo(expected);
    });

    it("should wrap seamlessly at grid boundaries", () => {
      const size = 8;
      const grid = generateNoiseGrid(size);

      // Sampling at x=size should wrap to x=0
      const atZero = sampleNoise(grid, size, 0, 0);
      const atWrap = sampleNoise(grid, size, size, 0);
      expect(atWrap).toBeCloseTo(atZero);

      // Negative coordinates should also wrap
      const atNeg = sampleNoise(grid, size, -size, 0);
      expect(atNeg).toBeCloseTo(atZero);
    });

    it("should return values in [0, 1) range for arbitrary coordinates", () => {
      const grid = generateNoiseGrid(16);

      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 100 - 50;
        const y = Math.random() * 100 - 50;
        const val = sampleNoise(grid, 16, x, y);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  describe("PaperGrainShader", () => {
    it("should export shader with expected uniforms", () => {
      expect(PaperGrainShader.uniforms).toHaveProperty("tDiffuse");
      expect(PaperGrainShader.uniforms).toHaveProperty("tPaper");
      expect(PaperGrainShader.uniforms).toHaveProperty("resolution");
      expect(PaperGrainShader.uniforms).toHaveProperty("tileSize");
      expect(PaperGrainShader.uniforms).toHaveProperty("aspectRatio");
    });

    it("should have vertex and fragment shaders defined", () => {
      expect(PaperGrainShader.vertexShader).toBeDefined();
      expect(PaperGrainShader.fragmentShader).toBeDefined();
      expect(PaperGrainShader.vertexShader.length).toBeGreaterThan(0);
      expect(PaperGrainShader.fragmentShader.length).toBeGreaterThan(0);
    });
  });
});
