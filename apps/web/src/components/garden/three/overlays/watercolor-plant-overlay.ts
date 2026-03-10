/**
 * Watercolor Plant Overlay - Generic watercolor rendering framework
 *
 * Renders watercolor-mode plant variants using layered semi-transparent
 * Three.js shapes. Each variant defines a builder function that produces
 * WatercolorElements; this overlay applies the watercolor layering effect.
 *
 * The renderer is shape-agnostic - it doesn't know about flowers, stems, or
 * leaves. It only knows how to convert WatercolorShapeDefs into Three.js
 * geometry and apply the wet-on-wet bleed layering technique.
 *
 * Shape building, layering, and material pooling are in watercolor-rendering.ts
 * (shared with SandboxThreeRenderer).
 */

import * as THREE from "three";
import {
  type Plant,
  type PlantVariant,
  type WatercolorBuildContext,
  type PlantWithLifecycle,
  getVariantById,
  computeLifecycleState,
  isWatercolorVariant,
} from "@quantum-garden/shared";
import { createSeededRng, hashString, renderWatercolorElement } from "./watercolor-rendering";

/** Z position for watercolor plants (above vector plants) */
const WATERCOLOR_Z_POSITION = 61;

/** Category-based scale multipliers for watercolor plants */
function getCategoryScale(variantId: string): number {
  const id = variantId.toLowerCase();
  if (id.includes("tree") || id.includes("oak") || id.includes("pine") || id.includes("willow"))
    return 7;
  if (id.includes("shrub") || id.includes("bush") || id.includes("thicket") || id.includes("vine"))
    return 5.25;
  if (id.includes("grass") || id.includes("fern") || id.includes("reed") || id.includes("tuft"))
    return 2.5;
  if (id.includes("ethereal") || id.includes("spirit") || id.includes("wisp")) return 3;
  if (
    id.includes("moss") ||
    id.includes("lichen") ||
    id.includes("ground") ||
    id.includes("pebble")
  )
    return 2;
  return 2; // flowers and default
}

/**
 * Cached render state to detect when geometry needs rebuilding.
 */
interface PlantRenderState {
  keyframeIndex: number;
  keyframeProgress: number; // rounded to 1 decimal
  positionX: number;
  positionY: number;
  observed: boolean;
}

// =============================================================================
// Main Overlay Class
// =============================================================================

/**
 * Renders watercolor-mode plant variants.
 * Generic framework: calls each variant's buildElements() function to get
 * shapes, then applies the watercolor layering effect.
 */
export class WatercolorPlantOverlay {
  private group: THREE.Group;
  private plantMeshes: Map<string, THREE.Group> = new Map();
  private plantRenderStates: Map<string, PlantRenderState> = new Map();
  private plants: Plant[] = [];
  private lastPlantsRef: Plant[] | null = null;
  private variantCache: Map<string, PlantVariant> = new Map();
  private materialPool: Map<string, THREE.MeshBasicMaterial> = new Map();
  private needsUpdate: boolean = false;
  private lastLifecycleCheckTime: number = 0;
  private static LIFECYCLE_CHECK_INTERVAL = 1.0; // seconds

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "watercolor-plants";
  }

  /**
   * Set the plants to render. Filters to only watercolor-mode plants.
   */
  setPlants(plants: Plant[]): void {
    if (plants === this.lastPlantsRef) return;
    this.lastPlantsRef = plants;

    this.plants = plants.filter((plant) => {
      const variant = this.getVariant(plant.variantId);
      return variant != null && isWatercolorVariant(variant);
    });
    this.needsUpdate = true;
    this.rebuildAll();
  }

  private getVariant(variantId: string): PlantVariant | undefined {
    if (!this.variantCache.has(variantId)) {
      const variant = getVariantById(variantId);
      if (variant) this.variantCache.set(variantId, variant);
    }
    return this.variantCache.get(variantId);
  }

  /**
   * Rebuild all plant groups from scratch.
   */
  private rebuildAll(): void {
    const seenIds = new Set<string>();

    for (const plant of this.plants) {
      seenIds.add(plant.id);

      const variant = this.getVariant(plant.variantId);
      if (!variant?.watercolorConfig) continue;

      let plantGroup = this.plantMeshes.get(plant.id);
      if (!plantGroup) {
        plantGroup = new THREE.Group();
        plantGroup.name = `wc-plant-${plant.id}`;
        this.group.add(plantGroup);
        this.plantMeshes.set(plant.id, plantGroup);
      }

      this.rebuildPlant(plantGroup, plant, variant);
    }

    // Remove plants no longer present
    for (const [id, meshGroup] of this.plantMeshes) {
      if (!seenIds.has(id)) {
        this.group.remove(meshGroup);
        this.disposePlantGroup(meshGroup);
        this.plantMeshes.delete(id);
        this.plantRenderStates.delete(id);
      }
    }
  }

  /**
   * Rebuild a single plant's geometry by calling the variant's builder.
   */
  private rebuildPlant(plantGroup: THREE.Group, plant: Plant, variant: PlantVariant): void {
    const config = variant.watercolorConfig!;

    // Compute lifecycle state
    const plantWithLifecycle: PlantWithLifecycle = {
      id: plant.id,
      variantId: plant.variantId,
      germinatedAt: plant.germinatedAt ?? null,
      lifecycleModifier: plant.lifecycleModifier ?? 1.0,
      colorVariationName: plant.colorVariationName ?? null,
    };

    // Create a temporary variant with placeholder keyframes
    const tempVariant: PlantVariant = {
      ...variant,
      keyframes: config.keyframes.map((kf) => ({
        name: kf.name,
        duration: kf.duration,
        pattern: [],
        palette: [],
      })),
    };

    const lifecycleState = computeLifecycleState(plantWithLifecycle, tempVariant);

    // Build the context for the variant's builder function
    const ctx: WatercolorBuildContext = {
      keyframeName: lifecycleState.currentKeyframe.name,
      keyframeProgress: lifecycleState.keyframeProgress,
      totalProgress: lifecycleState.totalProgress,
      traits: plant.traits ?? null,
      seed: hashString(plant.id),
      colorVariationName: plant.colorVariationName ?? null,
      circuitType: plant.circuitType ?? null,
    };

    // Call the variant's builder to get elements
    const elements = config.buildElements(ctx);

    // Clear and rebuild geometry
    this.clearPlantGroup(plantGroup);

    // Create a seeded RNG for the watercolor layering effect
    const rng = createSeededRng(hashString(plant.id + "-wc"));

    // Render each element with watercolor effect
    for (const element of elements) {
      const elementGroup = renderWatercolorElement(
        element,
        config.wcEffect,
        rng,
        this.materialPool
      );
      plantGroup.add(elementGroup);
    }

    // Position and scale the plant — 1.4x painterly multiplier * category scale
    const catScale = getCategoryScale(plant.variantId) * 1.4;
    plantGroup.position.set(plant.position.x, plant.position.y, WATERCOLOR_Z_POSITION);
    plantGroup.scale.set(catScale, catScale, 1);
  }

  private clearPlantGroup(group: THREE.Group): void {
    while (group.children.length > 0) {
      const child = group.children[0];
      if (child) {
        group.remove(child);
        this.disposeObject(child);
      }
    }
  }

  private disposeObject(obj: THREE.Object3D): void {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      // Materials are pooled, don't dispose
    }
    if (obj instanceof THREE.Group) {
      for (const child of [...obj.children]) {
        this.disposeObject(child);
      }
    }
  }

  private disposePlantGroup(group: THREE.Group): void {
    this.clearPlantGroup(group);
  }

  /**
   * Update the overlay each frame.
   * Only rebuilds plants whose visual state has changed.
   */
  update(time: number): void {
    // Periodically re-check for lifecycle progression (keyframe changes)
    if (time - this.lastLifecycleCheckTime >= WatercolorPlantOverlay.LIFECYCLE_CHECK_INTERVAL) {
      this.lastLifecycleCheckTime = time;
      this.needsUpdate = true;
    }

    if (!this.needsUpdate) return;

    const seenIds = new Set<string>();

    for (const plant of this.plants) {
      seenIds.add(plant.id);

      const variant = this.getVariant(plant.variantId);
      if (!variant?.watercolorConfig) continue;

      // Compute current render state
      const plantWithLifecycle: PlantWithLifecycle = {
        id: plant.id,
        variantId: plant.variantId,
        germinatedAt: plant.germinatedAt ?? null,
        lifecycleModifier: plant.lifecycleModifier ?? 1.0,
        colorVariationName: plant.colorVariationName ?? null,
      };

      const tempVariant: PlantVariant = {
        ...variant,
        keyframes: variant.watercolorConfig.keyframes.map((kf) => ({
          name: kf.name,
          duration: kf.duration,
          pattern: [],
          palette: [],
        })),
      };

      const lifecycleState = computeLifecycleState(plantWithLifecycle, tempVariant);

      const currentState: PlantRenderState = {
        keyframeIndex: lifecycleState.keyframeIndex,
        keyframeProgress: Math.round(lifecycleState.keyframeProgress * 10) / 10,
        positionX: plant.position.x,
        positionY: plant.position.y,
        observed: plant.observed,
      };

      const prevState = this.plantRenderStates.get(plant.id);

      // Get or create plant group
      let plantGroup = this.plantMeshes.get(plant.id);
      const isNew = !plantGroup;

      if (isNew) {
        plantGroup = new THREE.Group();
        plantGroup.name = `wc-plant-${plant.id}`;
        this.group.add(plantGroup);
        this.plantMeshes.set(plant.id, plantGroup);
      }

      // Only rebuild if state changed
      if (
        isNew ||
        !prevState ||
        prevState.keyframeIndex !== currentState.keyframeIndex ||
        prevState.keyframeProgress !== currentState.keyframeProgress ||
        prevState.positionX !== currentState.positionX ||
        prevState.positionY !== currentState.positionY ||
        prevState.observed !== currentState.observed
      ) {
        this.rebuildPlant(plantGroup!, plant, variant);
        this.plantRenderStates.set(plant.id, currentState);
      }
    }

    // Remove plants no longer present
    for (const [id, meshGroup] of this.plantMeshes) {
      if (!seenIds.has(id)) {
        this.group.remove(meshGroup);
        this.disposePlantGroup(meshGroup);
        this.plantMeshes.delete(id);
        this.plantRenderStates.delete(id);
      }
    }

    this.needsUpdate = false;
  }

  hasActiveAnimations(): boolean {
    if (this.plants.length === 0) return false;
    if (this.needsUpdate) return true;
    // Periodic lifecycle check — update() handles the timing
    const now = performance.now() / 1000;
    return now - this.lastLifecycleCheckTime >= WatercolorPlantOverlay.LIFECYCLE_CHECK_INTERVAL;
  }

  getObject(): THREE.Object3D {
    return this.group;
  }

  dispose(): void {
    for (const meshGroup of this.plantMeshes.values()) {
      this.disposePlantGroup(meshGroup);
    }
    this.plantMeshes.clear();
    this.plantRenderStates.clear();

    for (const mat of this.materialPool.values()) {
      mat.dispose();
    }
    this.materialPool.clear();
  }
}
