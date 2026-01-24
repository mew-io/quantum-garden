/**
 * Plant Instancer - Manages InstancedMesh for efficient plant rendering
 *
 * Uses a single InstancedMesh with per-instance attributes for all plants.
 * This dramatically reduces draw calls compared to individual meshes.
 */

import * as THREE from "three";
import {
  PATTERN_SIZE,
  computeLifecycleState,
  getEffectivePalette,
  getVariantById,
  interpolateKeyframes,
  GLYPH,
  type PlantVariant,
} from "@quantum-garden/shared";
import { TextureAtlas, getTextureAtlas } from "../core/texture-atlas";
import { createPlantMaterial, updatePlantMaterialTime } from "./plant-material";
import { prefersReducedMotion } from "@/lib/accessibility";

// Maximum number of plant instances
const MAX_INSTANCES = 1000;

// Z-layer offsets for plant categories
const Z_LAYERS: Record<string, number> = {
  "ground-cover": 0,
  grass: 10,
  flower: 20,
  shrub: 30,
  tree: 40,
  ethereal: 50,
};

/**
 * Interface for plant data needed for rendering.
 */
export interface RenderablePlant {
  id: string;
  position: { x: number; y: number };
  observed: boolean;
  visualState: "superposed" | "collapsed";
  variantId: string;
  germinatedAt?: Date | null;
  lifecycleModifier: number;
  colorVariationName?: string | null;
  entanglementGroupId?: string;
  traits?: {
    glyphPattern?: number[][];
    colorPalette?: string[];
    opacity?: number;
  };
}

/**
 * Internal tracking for plant transitions and animations.
 */
interface PlantAnimationState {
  isTransitioning: boolean;
  transitionProgress: number;
  transitionStartTime: number;
  previousVisualState: "superposed" | "collapsed";
  shimmerPhase: number;
}

/**
 * Manages a pool of plant instances using InstancedMesh.
 *
 * Efficiently updates instance attributes when plants change,
 * without recreating geometry or materials.
 */
export class PlantInstancer {
  private mesh: THREE.InstancedMesh;
  private material: THREE.ShaderMaterial;
  private atlas: TextureAtlas;

  // Instance buffer attributes
  private instancePositions: Float32Array;
  private instanceUVBounds: Float32Array;
  private instancePalette0: Float32Array;
  private instancePalette1: Float32Array;
  private instancePalette2: Float32Array;
  private instanceState: Float32Array;
  private instanceAnimation: Float32Array;

  // Plant tracking
  private plantIndexMap: Map<string, number> = new Map();
  private animationStates: Map<string, PlantAnimationState> = new Map();
  private activeCount: number = 0;

  // Transition timing
  private static COLLAPSE_DURATION = 1.5; // seconds

  constructor() {
    this.atlas = getTextureAtlas();

    // Create quad geometry for plant sprites
    const geometry = new THREE.PlaneGeometry(1, 1);

    // Create material with atlas texture
    this.material = createPlantMaterial(this.atlas.getTexture());

    // Initialize instance attribute arrays
    this.instancePositions = new Float32Array(MAX_INSTANCES * 3);
    this.instanceUVBounds = new Float32Array(MAX_INSTANCES * 4);
    this.instancePalette0 = new Float32Array(MAX_INSTANCES * 3);
    this.instancePalette1 = new Float32Array(MAX_INSTANCES * 3);
    this.instancePalette2 = new Float32Array(MAX_INSTANCES * 3);
    this.instanceState = new Float32Array(MAX_INSTANCES * 4);
    this.instanceAnimation = new Float32Array(MAX_INSTANCES * 2);

    // Create InstancedMesh
    this.mesh = new THREE.InstancedMesh(geometry, this.material, MAX_INSTANCES);
    this.mesh.frustumCulled = false; // We'll handle culling manually if needed

    // Add instanced buffer attributes to geometry
    geometry.setAttribute(
      "instancePosition",
      new THREE.InstancedBufferAttribute(this.instancePositions, 3)
    );
    geometry.setAttribute(
      "instanceUVBounds",
      new THREE.InstancedBufferAttribute(this.instanceUVBounds, 4)
    );
    geometry.setAttribute(
      "instancePalette0",
      new THREE.InstancedBufferAttribute(this.instancePalette0, 3)
    );
    geometry.setAttribute(
      "instancePalette1",
      new THREE.InstancedBufferAttribute(this.instancePalette1, 3)
    );
    geometry.setAttribute(
      "instancePalette2",
      new THREE.InstancedBufferAttribute(this.instancePalette2, 3)
    );
    geometry.setAttribute(
      "instanceState",
      new THREE.InstancedBufferAttribute(this.instanceState, 4)
    );
    geometry.setAttribute(
      "instanceAnimation",
      new THREE.InstancedBufferAttribute(this.instanceAnimation, 2)
    );

    // Initialize instance count
    this.mesh.count = 0;
  }

  /**
   * Get the mesh to add to the scene.
   */
  getMesh(): THREE.InstancedMesh {
    return this.mesh;
  }

  /**
   * Sync plants from the store.
   * Updates instance attributes for all active plants.
   */
  syncPlants(plants: RenderablePlant[]): void {
    const now = new Date();
    const time = performance.now() / 1000;
    const reducedMotion = prefersReducedMotion();

    // Track which plants are still active
    const activePlantIds = new Set<string>();

    plants.forEach((plant) => {
      activePlantIds.add(plant.id);

      // Get or create instance index for this plant
      let index = this.plantIndexMap.get(plant.id);
      if (index === undefined) {
        const newIndex = this.getNextAvailableIndex();
        if (newIndex === null) {
          console.warn("PlantInstancer: Max instances reached");
          return;
        }
        index = newIndex;
        this.plantIndexMap.set(plant.id, index);
        // Initialize animation state
        this.animationStates.set(plant.id, {
          isTransitioning: false,
          transitionProgress: plant.visualState === "collapsed" ? 1 : 0,
          transitionStartTime: 0,
          previousVisualState: plant.visualState,
          shimmerPhase: this.generateShimmerPhase(plant.id),
        });
      }

      // Get animation state
      const animState = this.animationStates.get(plant.id)!;

      // Detect transition from superposed to collapsed
      if (
        animState.previousVisualState === "superposed" &&
        plant.visualState === "collapsed" &&
        !animState.isTransitioning
      ) {
        if (reducedMotion) {
          // Instant transition for reduced motion
          animState.isTransitioning = false;
          animState.transitionProgress = 1;
        } else {
          animState.isTransitioning = true;
          animState.transitionProgress = 0;
          animState.transitionStartTime = time;
        }
      }
      animState.previousVisualState = plant.visualState;

      // Update transition progress
      if (animState.isTransitioning) {
        const elapsed = time - animState.transitionStartTime;
        animState.transitionProgress = Math.min(1, elapsed / PlantInstancer.COLLAPSE_DURATION);
        if (animState.transitionProgress >= 1) {
          animState.isTransitioning = false;
        }
      }

      // Update instance data
      this.updateInstanceData(index, plant, animState, now);
    });

    // Remove plants that are no longer in the list
    for (const [plantId, index] of this.plantIndexMap) {
      if (!activePlantIds.has(plantId)) {
        this.clearInstance(index);
        this.plantIndexMap.delete(plantId);
        this.animationStates.delete(plantId);
      }
    }

    // Update instance count
    this.mesh.count = this.plantIndexMap.size;

    // Mark attributes as needing update
    this.markAttributesNeedUpdate();
  }

  /**
   * Update the animation time uniform.
   */
  updateTime(time: number): void {
    updatePlantMaterialTime(this.material, time);
  }

  /**
   * Update instance data for a single plant.
   */
  private updateInstanceData(
    index: number,
    plant: RenderablePlant,
    animState: PlantAnimationState,
    now: Date
  ): void {
    const variant = getVariantById(plant.variantId);
    if (!variant) {
      this.setFallbackInstance(index, plant);
      return;
    }

    // Get pattern and palette based on state
    const { pattern, palette, opacity, scale } = this.computePlantAppearance(
      plant,
      variant,
      animState,
      now
    );

    // Add pattern to atlas and get UV bounds
    const patternId = this.getPatternId(plant, variant);
    const atlasEntry = this.atlas.getOrAddPattern(patternId, pattern);

    // Calculate Z position based on variant category
    const category = this.getPlantCategory(variant);
    const zBase = Z_LAYERS[category] ?? 25;
    // Add small offset based on Y position for consistent ordering within layer
    const zOffset = plant.position.y / 10000;

    // Set instance position
    const posBase = index * 3;
    this.instancePositions[posBase] = plant.position.x;
    this.instancePositions[posBase + 1] = plant.position.y;
    this.instancePositions[posBase + 2] = zBase + zOffset;

    // Set UV bounds
    const uvBase = index * 4;
    this.instanceUVBounds[uvBase] = atlasEntry.uvBounds[0];
    this.instanceUVBounds[uvBase + 1] = atlasEntry.uvBounds[1];
    this.instanceUVBounds[uvBase + 2] = atlasEntry.uvBounds[2];
    this.instanceUVBounds[uvBase + 3] = atlasEntry.uvBounds[3];

    // Set palette colors (convert hex to RGB 0-1 range)
    this.setPaletteColors(index, palette);

    // Set state (opacity, scale, visualState, transitionProgress)
    const stateBase = index * 4;
    this.instanceState[stateBase] = opacity;
    this.instanceState[stateBase + 1] = scale;
    this.instanceState[stateBase + 2] = plant.visualState === "collapsed" ? 1 : 0;
    this.instanceState[stateBase + 3] = animState.transitionProgress;

    // Set animation (shimmerPhase, reserved)
    const animBase = index * 2;
    this.instanceAnimation[animBase] = animState.shimmerPhase;
    this.instanceAnimation[animBase + 1] = 0;
  }

  /**
   * Compute the current appearance of a plant (pattern, palette, opacity, scale).
   */
  private computePlantAppearance(
    plant: RenderablePlant,
    variant: PlantVariant,
    animState: PlantAnimationState,
    now: Date
  ): { pattern: number[][]; palette: string[]; opacity: number; scale: number } {
    // If plant has resolved traits from quantum measurement, use those
    if (plant.traits?.glyphPattern) {
      return {
        pattern: plant.traits.glyphPattern,
        palette: plant.traits.colorPalette ?? ["#888888", "#AAAAAA", "#CCCCCC"],
        opacity: plant.traits.opacity ?? GLYPH.COLLAPSED_OPACITY,
        scale: 1,
      };
    }

    // Compute lifecycle state
    const plantWithLifecycle = {
      ...plant,
      germinatedAt: plant.germinatedAt ?? null,
      colorVariationName: plant.colorVariationName ?? null,
    };
    const state = computeLifecycleState(plantWithLifecycle, variant, now);
    const keyframe = state.currentKeyframe;
    const palette = getEffectivePalette(keyframe, variant, plant.colorVariationName ?? null);

    let pattern = keyframe.pattern;
    let opacity = keyframe.opacity ?? GLYPH.COLLAPSED_OPACITY;
    let scale = keyframe.scale ?? 1;

    // Interpolate if tweening is enabled
    if (variant.tweenBetweenKeyframes && state.nextKeyframe) {
      const interpolated = interpolateKeyframes(
        keyframe,
        state.nextKeyframe,
        state.keyframeProgress
      );
      pattern = interpolated.pattern;
      opacity = interpolated.opacity;
      scale = interpolated.scale;
    }

    // Adjust opacity for superposed state
    if (plant.visualState === "superposed") {
      opacity = GLYPH.SUPERPOSED_OPACITY;
    }

    return { pattern, palette, opacity, scale };
  }

  /**
   * Get a unique ID for a pattern (for atlas caching).
   */
  private getPatternId(plant: RenderablePlant, variant: PlantVariant): string {
    // For resolved traits, use pattern hash
    if (plant.traits?.glyphPattern) {
      return TextureAtlas.hashPattern(plant.traits.glyphPattern);
    }

    // For lifecycle-based patterns, use variant + keyframe info
    const plantWithLifecycle = {
      ...plant,
      germinatedAt: plant.germinatedAt ?? null,
      colorVariationName: plant.colorVariationName ?? null,
    };
    const state = computeLifecycleState(plantWithLifecycle, variant, new Date());
    return `${variant.id}_kf${state.keyframeIndex}`;
  }

  /**
   * Get plant category from variant for z-ordering.
   */
  private getPlantCategory(variant: PlantVariant): string {
    // Extract category from variant ID or name
    // Format: "category-name" or infer from keywords
    const id = variant.id.toLowerCase();
    if (id.includes("moss") || id.includes("lichen") || id.includes("ground"))
      return "ground-cover";
    if (id.includes("grass") || id.includes("fern")) return "grass";
    if (id.includes("tree") || id.includes("oak") || id.includes("pine")) return "tree";
    if (id.includes("shrub") || id.includes("bush")) return "shrub";
    if (id.includes("ethereal") || id.includes("spirit") || id.includes("wisp")) return "ethereal";
    return "flower"; // default
  }

  /**
   * Set palette colors for an instance.
   */
  private setPaletteColors(index: number, palette: string[]): void {
    const color0 = this.hexToRgb(palette[0] ?? "#888888");
    const color1 = this.hexToRgb(palette[1] ?? "#AAAAAA");
    const color2 = this.hexToRgb(palette[2] ?? "#CCCCCC");

    const p0Base = index * 3;
    this.instancePalette0[p0Base] = color0.r;
    this.instancePalette0[p0Base + 1] = color0.g;
    this.instancePalette0[p0Base + 2] = color0.b;

    const p1Base = index * 3;
    this.instancePalette1[p1Base] = color1.r;
    this.instancePalette1[p1Base + 1] = color1.g;
    this.instancePalette1[p1Base + 2] = color1.b;

    const p2Base = index * 3;
    this.instancePalette2[p2Base] = color2.r;
    this.instancePalette2[p2Base + 1] = color2.g;
    this.instancePalette2[p2Base + 2] = color2.b;
  }

  /**
   * Convert hex color to RGB (0-1 range).
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      return { r: 0.5, g: 0.5, b: 0.5 };
    }
    return {
      r: parseInt(result[1]!, 16) / 255,
      g: parseInt(result[2]!, 16) / 255,
      b: parseInt(result[3]!, 16) / 255,
    };
  }

  /**
   * Set fallback appearance for plants without valid variants.
   */
  private setFallbackInstance(index: number, plant: RenderablePlant): void {
    // Create simple fallback pattern
    const pattern: number[][] = [];
    for (let y = 0; y < PATTERN_SIZE; y++) {
      const row: number[] = [];
      for (let x = 0; x < PATTERN_SIZE; x++) {
        // Simple circle pattern
        const dx = x - PATTERN_SIZE / 2;
        const dy = y - PATTERN_SIZE / 2;
        row[x] = dx * dx + dy * dy < 400 ? 1 : 0;
      }
      pattern[y] = row;
    }

    const atlasEntry = this.atlas.getOrAddPattern(`fallback_${plant.id}`, pattern);

    const posBase = index * 3;
    this.instancePositions[posBase] = plant.position.x;
    this.instancePositions[posBase + 1] = plant.position.y;
    this.instancePositions[posBase + 2] = 25;

    const uvBase = index * 4;
    this.instanceUVBounds[uvBase] = atlasEntry.uvBounds[0];
    this.instanceUVBounds[uvBase + 1] = atlasEntry.uvBounds[1];
    this.instanceUVBounds[uvBase + 2] = atlasEntry.uvBounds[2];
    this.instanceUVBounds[uvBase + 3] = atlasEntry.uvBounds[3];

    this.setPaletteColors(index, ["#888888", "#AAAAAA", "#CCCCCC"]);

    const stateBase = index * 4;
    this.instanceState[stateBase] = 0.3;
    this.instanceState[stateBase + 1] = 1;
    this.instanceState[stateBase + 2] = 0;
    this.instanceState[stateBase + 3] = 0;
  }

  /**
   * Clear instance data (make invisible).
   */
  private clearInstance(index: number): void {
    // Set scale to 0 to hide
    const stateBase = index * 4;
    this.instanceState[stateBase + 1] = 0;
  }

  /**
   * Get next available instance index.
   */
  private getNextAvailableIndex(): number | null {
    if (this.activeCount >= MAX_INSTANCES) {
      return null;
    }
    return this.activeCount++;
  }

  /**
   * Generate consistent shimmer phase for a plant.
   */
  private generateShimmerPhase(plantId: string): number {
    let hash = 0;
    for (let i = 0; i < plantId.length; i++) {
      hash = ((hash << 5) - hash + plantId.charCodeAt(i)) | 0;
    }
    return ((hash % 1000) / 1000) * Math.PI * 2;
  }

  /**
   * Mark all instance attributes as needing GPU update.
   */
  private markAttributesNeedUpdate(): void {
    const geometry = this.mesh.geometry;
    (geometry.getAttribute("instancePosition") as THREE.BufferAttribute).needsUpdate = true;
    (geometry.getAttribute("instanceUVBounds") as THREE.BufferAttribute).needsUpdate = true;
    (geometry.getAttribute("instancePalette0") as THREE.BufferAttribute).needsUpdate = true;
    (geometry.getAttribute("instancePalette1") as THREE.BufferAttribute).needsUpdate = true;
    (geometry.getAttribute("instancePalette2") as THREE.BufferAttribute).needsUpdate = true;
    (geometry.getAttribute("instanceState") as THREE.BufferAttribute).needsUpdate = true;
    (geometry.getAttribute("instanceAnimation") as THREE.BufferAttribute).needsUpdate = true;
  }

  /**
   * Clean up resources.
   */
  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.plantIndexMap.clear();
    this.animationStates.clear();
  }
}
