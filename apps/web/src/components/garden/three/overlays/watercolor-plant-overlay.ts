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
  CANVAS,
  annotateElements,
  computeAuraParams,
} from "@quantum-garden/shared";
import {
  createSeededRng,
  hashString,
  createMergedWatercolorMaterial,
  mergeWatercolorElements,
} from "./watercolor-rendering";

/** Z position for watercolor plants (above vector plants) */
const WATERCOLOR_Z_POSITION = 61;

// =============================================================================
// Aura Glow Material (shared across all plants)
// =============================================================================

function createAuraMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_time: { value: 0.0 },
    },
    vertexShader: `
      uniform float u_time;

      attribute vec3 aAuraColor;
      attribute float aAuraOpacity;
      attribute float aAuraPulseSpeed;

      varying vec3 vAuraColor;
      varying float vAuraOpacity;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vAuraColor = aAuraColor;

        // Pulse the opacity with quantum-driven speed
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        float phase = worldPos.x * 0.005 + worldPos.y * 0.003;
        float pulse = 0.85 + 0.15 * sin(u_time * aAuraPulseSpeed + phase);
        vAuraOpacity = aAuraOpacity * pulse;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vAuraColor;
      varying float vAuraOpacity;
      varying vec2 vUv;

      void main() {
        // Radial gradient: bright center → transparent edge
        vec2 center = vUv - 0.5;
        float dist = length(center) * 2.0; // 0 at center, 1 at edge
        float falloff = 1.0 - smoothstep(0.0, 1.0, dist);
        // Softer falloff curve for ethereal glow
        falloff = falloff * falloff;

        float alpha = vAuraOpacity * falloff;
        gl_FragColor = vec4(vAuraColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
}

/** Shared plane geometry for aura discs (1×1, scaled per-plant) */
const AURA_GEOMETRY = new THREE.PlaneGeometry(1, 1);

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
  private mergedMaterial: THREE.ShaderMaterial;
  private auraMaterial: THREE.ShaderMaterial;
  private needsUpdate: boolean = false;
  private lastLifecycleCheckTime: number = 0;
  private static LIFECYCLE_CHECK_INTERVAL = 0.1; // seconds

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "watercolor-plants";
    this.mergedMaterial = createMergedWatercolorMaterial();
    this.auraMaterial = createAuraMaterial();
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
    const rawElements = config.buildElements(ctx);

    // Stamp quantum-driven animation + iridescence params onto all elements
    const annotationRng = createSeededRng(hashString(plant.id + "-qv"));
    const elements = annotateElements(rawElements, plant.traits ?? null, () =>
      annotationRng.next()
    );

    // Clear and rebuild geometry
    this.clearPlantGroup(plantGroup);

    // Create a seeded RNG for the watercolor layering effect
    const rng = createSeededRng(hashString(plant.id + "-wc"));

    // Merge all elements into a single mesh with vertex colors
    const mergedMesh = mergeWatercolorElements(elements, config.wcEffect, rng, this.mergedMaterial);
    if (mergedMesh) {
      plantGroup.add(mergedMesh);
    }

    // Quantum aura glow disc behind the plant
    const auraParams = computeAuraParams(plant.traits ?? null);
    const auraGeo = AURA_GEOMETRY.clone();
    const vertCount = auraGeo.getAttribute("position").count;
    const auraColor = new THREE.Color(auraParams.color);
    const aColors = new Float32Array(vertCount * 3);
    const aOpacities = new Float32Array(vertCount);
    const aPulse = new Float32Array(vertCount);
    for (let i = 0; i < vertCount; i++) {
      aColors[i * 3] = auraColor.r;
      aColors[i * 3 + 1] = auraColor.g;
      aColors[i * 3 + 2] = auraColor.b;
      aOpacities[i] = auraParams.opacity;
      aPulse[i] = auraParams.pulseSpeed;
    }
    auraGeo.setAttribute("aAuraColor", new THREE.BufferAttribute(aColors, 3));
    auraGeo.setAttribute("aAuraOpacity", new THREE.BufferAttribute(aOpacities, 1));
    auraGeo.setAttribute("aAuraPulseSpeed", new THREE.BufferAttribute(aPulse, 1));
    const auraMesh = new THREE.Mesh(auraGeo, this.auraMaterial);
    // Scale the aura disc (radius in 64×64 space, diameter = radius * 2)
    const auraDiameter = auraParams.radius * 2;
    auraMesh.scale.set(auraDiameter, auraDiameter, 1);
    // Position behind the plant (lower z)
    auraMesh.position.set(0, -4, -0.5);
    plantGroup.add(auraMesh);

    // Position and scale the plant — 1.4x painterly multiplier * category scale
    // Apply depth perspective: distant plants smaller + vertically squished
    const catScale = getCategoryScale(plant.variantId) * 1.4;
    const depthT = Math.max(0, Math.min(1, plant.position.y / CANVAS.DEFAULT_HEIGHT));
    const depthScale = 0.6 + 0.4 * depthT;
    const verticalSquish = 0.7 + 0.3 * depthT;
    const perspectiveScale = catScale * depthScale;
    plantGroup.position.set(plant.position.x, plant.position.y, WATERCOLOR_Z_POSITION);
    plantGroup.scale.set(perspectiveScale, perspectiveScale * verticalSquish, 1);
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
  update(time: number): boolean {
    // Always update time uniform for shader-driven sway/breathing/aura animation
    if (this.mergedMaterial.uniforms.u_time) {
      this.mergedMaterial.uniforms.u_time.value = time;
    }
    if (this.auraMaterial.uniforms.u_time) {
      this.auraMaterial.uniforms.u_time.value = time;
    }

    // Periodically re-check for lifecycle progression (keyframe changes)
    if (time - this.lastLifecycleCheckTime >= WatercolorPlantOverlay.LIFECYCLE_CHECK_INTERVAL) {
      this.lastLifecycleCheckTime = time;
      this.needsUpdate = true;
    }

    // Shader animation means we always have visual changes when plants exist
    if (!this.needsUpdate) return this.plants.length > 0;

    let changed = false;
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
        keyframeProgress: Math.round(lifecycleState.keyframeProgress * 50) / 50,
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
        changed = true;
      }
    }

    // Remove plants no longer present
    for (const [id, meshGroup] of this.plantMeshes) {
      if (!seenIds.has(id)) {
        this.group.remove(meshGroup);
        this.disposePlantGroup(meshGroup);
        this.plantMeshes.delete(id);
        this.plantRenderStates.delete(id);
        changed = true;
      }
    }

    this.needsUpdate = false;
    return changed;
  }

  hasActiveAnimations(): boolean {
    // Always active when plants exist — shader drives continuous sway/breathing
    return this.plants.length > 0;
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
    this.mergedMaterial.dispose();
    this.auraMaterial.dispose();
  }
}
