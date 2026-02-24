/**
 * Paper Texture — Procedural washi paper grain applied as post-processing
 *
 * Generates a tileable paper grain texture using layered value noise,
 * then applies it via a ShaderPass AFTER the bloom pipeline so the
 * grain isn't washed out by bloom brightening.
 *
 * The shader replaces near-white background pixels with the paper
 * texture while preserving plant colors.
 */

import * as THREE from "three";

/** Configuration for the paper grain effect */
const PAPER_CONFIG = {
  /** Texture tile size in pixels (power of 2 for GPU efficiency) */
  TILE_SIZE: 512,
  /** Fine grain noise intensity (per-pixel fiber texture) */
  FINE_GRAIN_INTENSITY: 0.04,
  /** Medium grain noise intensity (tonal variation like paper thickness) */
  MEDIUM_GRAIN_INTENSITY: 0.03,
  /** Fiber streak intensity (directional fiber quality) */
  FIBER_INTENSITY: 0.02,
  /** Medium noise sampling scale (pixels between samples) */
  MEDIUM_SCALE: 6,
  /** Fiber noise horizontal stretch factor */
  FIBER_STRETCH_X: 3,
  /** Fiber noise vertical compression factor */
  FIBER_STRETCH_Y: 0.5,
  /** Base color RGB — warm cream watercolor paper (#F0EAE0) */
  BASE_R: 240,
  BASE_G: 234,
  BASE_B: 224,
  /** Warm color shift applied to fiber streaks (adds parchment warmth) */
  FIBER_WARM_R: 4,
  FIBER_WARM_G: 1,
  FIBER_WARM_B: -2,
} as const;

/** Size of the pre-generated noise grid for interpolated sampling */
const NOISE_GRID_SIZE = 128;

/**
 * Simple hash-based pseudo-random for reproducible noise grids.
 * Returns a value in [0, 1).
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Generate a grid of random values for noise sampling.
 * @param size - Grid dimension (size × size)
 * @param seedOffset - Offset to produce different grids
 */
export function generateNoiseGrid(size: number, seedOffset: number = 0): Float32Array {
  const grid = new Float32Array(size * size);
  for (let i = 0; i < grid.length; i++) {
    grid[i] = seededRandom(i + seedOffset + 0.5);
  }
  return grid;
}

/**
 * Bilinear interpolation sample from a noise grid.
 * Wraps at grid boundaries for seamless tiling.
 */
export function sampleNoise(grid: Float32Array, size: number, x: number, y: number): number {
  // Wrap coordinates to grid bounds
  const wx = ((x % size) + size) % size;
  const wy = ((y % size) + size) % size;

  const x0 = Math.floor(wx);
  const y0 = Math.floor(wy);
  const x1 = (x0 + 1) % size;
  const y1 = (y0 + 1) % size;

  const fx = wx - x0;
  const fy = wy - y0;

  const v00 = grid[y0 * size + x0]!;
  const v10 = grid[y0 * size + x1]!;
  const v01 = grid[y1 * size + x0]!;
  const v11 = grid[y1 * size + x1]!;

  const top = v00 + (v10 - v00) * fx;
  const bottom = v01 + (v11 - v01) * fx;
  return top + (bottom - top) * fy;
}

/**
 * Generate the paper grain CanvasTexture (512×512 tileable).
 *
 * Three layers of noise:
 * 1. Fine grain — per-pixel random for microscopic fiber texture
 * 2. Medium grain — interpolated value noise for tonal paper thickness variation
 * 3. Fiber streaks — horizontally-stretched noise for directional fibers
 */
export function createPaperTexture(): THREE.CanvasTexture {
  const size = PAPER_CONFIG.TILE_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  // Pre-generate noise grids for interpolated layers
  const mediumGrid = generateNoiseGrid(NOISE_GRID_SIZE, 0);
  const fiberGrid = generateNoiseGrid(NOISE_GRID_SIZE, 37);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Fine grain: per-pixel random for microscopic fibers
      const fine = (Math.random() - 0.5) * 2 * PAPER_CONFIG.FINE_GRAIN_INTENSITY * 255;

      // Medium grain: bilinear-interpolated value noise for tonal variation
      const mx = x / PAPER_CONFIG.MEDIUM_SCALE;
      const my = y / PAPER_CONFIG.MEDIUM_SCALE;
      const medium =
        (sampleNoise(mediumGrid, NOISE_GRID_SIZE, mx, my) - 0.5) *
        2 *
        PAPER_CONFIG.MEDIUM_GRAIN_INTENSITY *
        255;

      // Fiber streaks: horizontally-stretched noise with warm color shift
      const fx = x / PAPER_CONFIG.FIBER_STRETCH_X;
      const fy = y * PAPER_CONFIG.FIBER_STRETCH_Y;
      const fiberVal = sampleNoise(fiberGrid, NOISE_GRID_SIZE, fx, fy);
      const fiber = (fiberVal - 0.5) * 2 * PAPER_CONFIG.FIBER_INTENSITY * 255;

      // Combine brightness noise
      const noise = fine + medium + fiber;

      // Fiber streaks add warm color shift (parchment tones)
      const warmth = fiberVal * fiberVal; // squared for concentrated warm spots
      data[idx] = Math.max(
        0,
        Math.min(255, PAPER_CONFIG.BASE_R + noise + warmth * PAPER_CONFIG.FIBER_WARM_R)
      );
      data[idx + 1] = Math.max(
        0,
        Math.min(255, PAPER_CONFIG.BASE_G + noise + warmth * PAPER_CONFIG.FIBER_WARM_G)
      );
      data[idx + 2] = Math.max(
        0,
        Math.min(255, PAPER_CONFIG.BASE_B + noise + warmth * PAPER_CONFIG.FIBER_WARM_B)
      );
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

/**
 * Shader definition for the paper grain post-processing pass.
 *
 * Applied after bloom so the grain isn't washed out.
 * Replaces near-white background pixels with the paper texture
 * while preserving plant colors via luminance-based blending.
 */
export const PaperGrainShader = {
  name: "PaperGrainShader",

  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tPaper: { value: null as THREE.Texture | null },
    resolution: { value: new THREE.Vector2(1, 1) },
    tileSize: { value: PAPER_CONFIG.TILE_SIZE as number },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D tPaper;
    uniform vec2 resolution;
    uniform float tileSize;

    varying vec2 vUv;

    void main() {
      vec4 scene = texture2D(tDiffuse, vUv);

      // Tile the paper texture across the screen at 1:1 pixel scale
      vec2 paperUv = (vUv * resolution) / tileSize;
      vec4 paper = texture2D(tPaper, paperUv);

      // Determine how much this pixel is "background" vs "plant"
      // After bloom, background is near-white; plants have distinct colors
      float luminance = dot(scene.rgb, vec3(0.299, 0.587, 0.114));
      float bgAmount = smoothstep(0.85, 0.97, luminance);

      // Replace background with paper grain, preserve plant colors
      gl_FragColor = vec4(mix(scene.rgb, paper.rgb, bgAmount), scene.a);
    }
  `,
};
