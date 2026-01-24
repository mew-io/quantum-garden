/**
 * Texture Atlas Generator for Quantum Garden
 *
 * Generates a texture atlas containing all plant patterns as binary data.
 * The shader uses this atlas to determine which pixels to fill.
 * Color gradients are computed in the shader based on distance from center.
 */

import * as THREE from "three";
import { PATTERN_SIZE } from "@quantum-garden/shared";

// Atlas configuration
const ATLAS_SIZE = 2048; // 2048x2048 texture
const PATTERNS_PER_ROW = Math.floor(ATLAS_SIZE / PATTERN_SIZE); // 32 patterns per row
const MAX_PATTERNS = PATTERNS_PER_ROW * PATTERNS_PER_ROW; // 1024 max patterns

/**
 * Stores metadata for a pattern in the atlas.
 */
export interface PatternAtlasEntry {
  /** Index in the atlas */
  index: number;
  /** UV bounds: [u, v, width, height] in normalized coordinates */
  uvBounds: [number, number, number, number];
}

/**
 * Manages the texture atlas for plant patterns.
 *
 * Patterns are stored as binary data (R channel = filled/empty).
 * The atlas is dynamically populated as new patterns are encountered.
 */
export class TextureAtlas {
  private texture: THREE.DataTexture;
  private data: Uint8Array;
  private patternMap: Map<string, PatternAtlasEntry> = new Map();
  private nextIndex: number = 0;

  constructor() {
    // Create RGBA data array (4 bytes per pixel)
    this.data = new Uint8Array(ATLAS_SIZE * ATLAS_SIZE * 4);
    // Initialize to transparent black
    this.data.fill(0);

    // Create DataTexture
    this.texture = new THREE.DataTexture(
      this.data,
      ATLAS_SIZE,
      ATLAS_SIZE,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    );
    this.texture.needsUpdate = true;
    // Use nearest filtering for pixel-perfect patterns
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;
  }

  /**
   * Get or add a pattern to the atlas.
   *
   * @param patternId - Unique identifier for the pattern
   * @param pattern - 64x64 binary pattern grid (1 = filled, 0 = empty)
   * @returns Atlas entry with UV bounds for the pattern
   */
  getOrAddPattern(patternId: string, pattern: number[][]): PatternAtlasEntry {
    // Check if pattern already exists
    const existing = this.patternMap.get(patternId);
    if (existing) {
      return existing;
    }

    // Add new pattern
    if (this.nextIndex >= MAX_PATTERNS) {
      console.warn("Texture atlas full, reusing first slot");
      return this.patternMap.values().next().value!;
    }

    const index = this.nextIndex++;
    const entry = this.addPatternToAtlas(index, pattern);
    this.patternMap.set(patternId, entry);

    // Mark texture as needing update
    this.texture.needsUpdate = true;

    return entry;
  }

  /**
   * Add a pattern to the atlas at the given index.
   */
  private addPatternToAtlas(index: number, pattern: number[][]): PatternAtlasEntry {
    // Calculate position in atlas
    const col = index % PATTERNS_PER_ROW;
    const row = Math.floor(index / PATTERNS_PER_ROW);
    const startX = col * PATTERN_SIZE;
    const startY = row * PATTERN_SIZE;

    // Copy pattern data to atlas
    for (let y = 0; y < PATTERN_SIZE; y++) {
      const patternRow = pattern[y];
      if (!patternRow) continue;

      for (let x = 0; x < PATTERN_SIZE; x++) {
        const value = patternRow[x] ?? 0;
        // Store in atlas (RGBA format)
        // Y is flipped because texture coordinates go up, pattern coordinates go down
        const atlasY = startY + (PATTERN_SIZE - 1 - y);
        const pixelIndex = (atlasY * ATLAS_SIZE + startX + x) * 4;
        // Store filled value in R channel (255 = filled, 0 = empty)
        this.data[pixelIndex] = value > 0 ? 255 : 0;
        this.data[pixelIndex + 1] = 0;
        this.data[pixelIndex + 2] = 0;
        this.data[pixelIndex + 3] = 255; // Full alpha
      }
    }

    // Calculate UV bounds (normalized 0-1)
    const u = startX / ATLAS_SIZE;
    const v = startY / ATLAS_SIZE;
    const width = PATTERN_SIZE / ATLAS_SIZE;
    const height = PATTERN_SIZE / ATLAS_SIZE;

    return {
      index,
      uvBounds: [u, v, width, height],
    };
  }

  /**
   * Get the atlas texture for use in shaders.
   */
  getTexture(): THREE.DataTexture {
    return this.texture;
  }

  /**
   * Get UV bounds for a pattern by ID.
   * Returns null if pattern not found.
   */
  getPatternUVBounds(patternId: string): [number, number, number, number] | null {
    const entry = this.patternMap.get(patternId);
    return entry?.uvBounds ?? null;
  }

  /**
   * Check if a pattern exists in the atlas.
   */
  hasPattern(patternId: string): boolean {
    return this.patternMap.has(patternId);
  }

  /**
   * Get the number of patterns in the atlas.
   */
  get patternCount(): number {
    return this.nextIndex;
  }

  /**
   * Generate a hash for a pattern grid to use as ID.
   * Useful when pattern doesn't have a pre-assigned ID.
   */
  static hashPattern(pattern: number[][]): string {
    // Simple hash based on first few rows for uniqueness
    let hash = 0;
    for (let y = 0; y < Math.min(pattern.length, 8); y++) {
      const row = pattern[y];
      if (!row) continue;
      for (let x = 0; x < Math.min(row.length, 8); x++) {
        hash = ((hash << 5) - hash + (row[x] ?? 0)) | 0;
      }
    }
    return `pattern_${hash.toString(16)}`;
  }

  /**
   * Clean up resources.
   */
  dispose(): void {
    this.texture.dispose();
    this.patternMap.clear();
  }
}

/**
 * Singleton atlas instance for the application.
 */
let globalAtlas: TextureAtlas | null = null;

/**
 * Get or create the global texture atlas.
 */
export function getTextureAtlas(): TextureAtlas {
  if (!globalAtlas) {
    globalAtlas = new TextureAtlas();
  }
  return globalAtlas;
}

/**
 * Dispose the global texture atlas.
 */
export function disposeTextureAtlas(): void {
  if (globalAtlas) {
    globalAtlas.dispose();
    globalAtlas = null;
  }
}
