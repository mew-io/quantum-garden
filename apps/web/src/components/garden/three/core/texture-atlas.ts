/**
 * Texture Atlas Generator for Quantum Garden
 *
 * Generates a texture atlas containing all plant patterns as binary data.
 * The shader uses this atlas to determine which pixels to fill.
 * Color gradients are computed in the shader based on distance from center.
 *
 * Memory optimization: Uses single-channel RED format (1 byte/pixel) instead
 * of RGBA (4 bytes/pixel). The shader only reads the R channel anyway.
 *
 * Dynamic sizing: Starts at 512x512 (64 pattern capacity), grows to 2048x2048
 * (1024 patterns) only when needed. Typical usage (36 variants) stays small.
 */

import * as THREE from "three";
import { PATTERN_SIZE } from "@quantum-garden/shared";

// Atlas configuration - supports dynamic resizing
const MIN_ATLAS_SIZE = 512; // Start small (64 pattern capacity)
const MAX_ATLAS_SIZE = 2048; // Max size (1024 pattern capacity)

/**
 * Calculate patterns per row for a given atlas size.
 */
function getPatternsPerRow(atlasSize: number): number {
  return Math.floor(atlasSize / PATTERN_SIZE);
}

/**
 * Calculate max patterns for a given atlas size.
 */
function getMaxPatterns(atlasSize: number): number {
  const perRow = getPatternsPerRow(atlasSize);
  return perRow * perRow;
}

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
 * Statistics about atlas usage.
 */
export interface AtlasStats {
  /** Current atlas dimensions (square) */
  atlasSize: number;
  /** Number of patterns stored */
  patternCount: number;
  /** Maximum patterns at current size */
  maxPatterns: number;
  /** Atlas utilization (0-1) */
  utilization: number;
  /** Memory used in bytes */
  memoryBytes: number;
  /** Memory saved vs RGBA format */
  memorySavedBytes: number;
}

/**
 * Manages the texture atlas for plant patterns.
 *
 * Patterns are stored as binary data (R channel = filled/empty).
 * The atlas is dynamically populated as new patterns are encountered.
 *
 * Optimizations:
 * - Single-channel RED format (1 byte/pixel vs 4 for RGBA)
 * - Dynamic sizing: starts at 512x512, grows to 2048x2048 as needed
 */
export class TextureAtlas {
  private texture: THREE.DataTexture;
  private data: Uint8Array;
  private patternMap: Map<string, PatternAtlasEntry> = new Map();
  private nextIndex: number = 0;
  private currentSize: number;

  constructor(initialSize: number = MIN_ATLAS_SIZE) {
    this.currentSize = Math.min(Math.max(initialSize, MIN_ATLAS_SIZE), MAX_ATLAS_SIZE);

    // Create single-channel data array (1 byte per pixel)
    // Using RED format saves 75% memory vs RGBA
    this.data = new Uint8Array(this.currentSize * this.currentSize);
    // Initialize to 0 (empty)
    this.data.fill(0);

    // Create DataTexture with RED format (single channel)
    this.texture = new THREE.DataTexture(
      this.data,
      this.currentSize,
      this.currentSize,
      THREE.RedFormat,
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

    // Check if we need to grow the atlas
    const maxPatterns = getMaxPatterns(this.currentSize);
    if (this.nextIndex >= maxPatterns) {
      if (this.currentSize < MAX_ATLAS_SIZE) {
        // Grow the atlas
        this.growAtlas();
      } else {
        console.warn("Texture atlas at maximum size, reusing first slot");
        return this.patternMap.values().next().value!;
      }
    }

    const index = this.nextIndex++;
    const entry = this.addPatternToAtlas(index, pattern);
    this.patternMap.set(patternId, entry);

    // Mark texture as needing update
    this.texture.needsUpdate = true;

    return entry;
  }

  /**
   * Grow the atlas to the next size level.
   * Copies existing pattern data to the new larger atlas.
   */
  private growAtlas(): void {
    const oldSize = this.currentSize;
    const newSize = Math.min(oldSize * 2, MAX_ATLAS_SIZE);
    if (newSize === oldSize) return;

    const oldPatternsPerRow = getPatternsPerRow(oldSize);

    // Create new larger data array (single channel)
    const newData = new Uint8Array(newSize * newSize);
    newData.fill(0);

    // Copy existing pattern data row by row
    // Since patterns are stored in a grid, we need to copy each row of the old atlas
    for (let y = 0; y < oldSize; y++) {
      const oldRowStart = y * oldSize;
      const newRowStart = y * newSize;
      newData.set(this.data.subarray(oldRowStart, oldRowStart + oldSize), newRowStart);
    }

    // Update references
    this.data = newData;
    this.currentSize = newSize;

    // Dispose old texture and create new one
    this.texture.dispose();
    this.texture = new THREE.DataTexture(
      this.data,
      this.currentSize,
      this.currentSize,
      THREE.RedFormat,
      THREE.UnsignedByteType
    );
    this.texture.needsUpdate = true;
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;

    // Recalculate UV bounds for all existing patterns
    // Use OLD patterns per row since that's how indices were originally assigned
    // Pixel positions stay the same, only UV coordinates change (new normalization)
    for (const entry of this.patternMap.values()) {
      const col = entry.index % oldPatternsPerRow;
      const row = Math.floor(entry.index / oldPatternsPerRow);
      const startX = col * PATTERN_SIZE;
      const startY = row * PATTERN_SIZE;

      entry.uvBounds = [
        startX / this.currentSize,
        startY / this.currentSize,
        PATTERN_SIZE / this.currentSize,
        PATTERN_SIZE / this.currentSize,
      ];
    }

    console.log(`Texture atlas grew from ${oldSize} to ${newSize}`);
  }

  /**
   * Add a pattern to the atlas at the given index.
   */
  private addPatternToAtlas(index: number, pattern: number[][]): PatternAtlasEntry {
    // Calculate position in atlas using current size
    const patternsPerRow = getPatternsPerRow(this.currentSize);
    const col = index % patternsPerRow;
    const row = Math.floor(index / patternsPerRow);
    const startX = col * PATTERN_SIZE;
    const startY = row * PATTERN_SIZE;

    // Copy pattern data to atlas (single-channel RED format)
    for (let y = 0; y < PATTERN_SIZE; y++) {
      const patternRow = pattern[y];
      if (!patternRow) continue;

      for (let x = 0; x < PATTERN_SIZE; x++) {
        const value = patternRow[x] ?? 0;
        // Store in atlas (single-channel format - 1 byte per pixel)
        // Pattern row y maps directly to atlas row (camera uses y-down coordinates)
        const atlasY = startY + y;
        const pixelIndex = atlasY * this.currentSize + startX + x;
        // Store filled value (255 = filled, 0 = empty)
        this.data[pixelIndex] = value > 0 ? 255 : 0;
      }
    }

    // Calculate UV bounds (normalized 0-1) using current size
    const u = startX / this.currentSize;
    const v = startY / this.currentSize;
    const width = PATTERN_SIZE / this.currentSize;
    const height = PATTERN_SIZE / this.currentSize;

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
   * Get the current atlas size (width/height in pixels).
   */
  get atlasSize(): number {
    return this.currentSize;
  }

  /**
   * Get statistics about atlas usage.
   * Useful for debugging and performance monitoring.
   */
  getStats(): AtlasStats {
    const maxPatterns = getMaxPatterns(this.currentSize);
    const memoryBytes = this.currentSize * this.currentSize; // 1 byte per pixel
    const rgbaEquivalent = this.currentSize * this.currentSize * 4;

    return {
      atlasSize: this.currentSize,
      patternCount: this.nextIndex,
      maxPatterns,
      utilization: maxPatterns > 0 ? this.nextIndex / maxPatterns : 0,
      memoryBytes,
      memorySavedBytes: rgbaEquivalent - memoryBytes,
    };
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
