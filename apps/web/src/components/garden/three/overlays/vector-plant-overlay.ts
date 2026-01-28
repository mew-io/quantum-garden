/**
 * Vector Plant Overlay - Renders vector-mode plant variants
 *
 * Three.js implementation that renders plants with smooth vector lines
 * instead of pixelated patterns. Uses LineSegments for efficient batched rendering.
 */

import * as THREE from "three";
import {
  type Plant,
  type PlantVariant,
  type VectorPrimitive,
  type VectorKeyframe,
  type InterpolatedVectorKeyframe,
  getVariantById,
  computeLifecycleState,
  getActiveVectorVisual,
  isInterpolatedVectorKeyframe,
  type PlantWithLifecycle,
} from "@quantum-garden/shared";

/** Visual constants for vector plants */
const VECTOR_PLANT_CONFIG = {
  /** Number of segments for circle approximation */
  CIRCLE_SEGMENTS: 64,
  /** Base size in world units (plants are 64x64 coordinate space) */
  BASE_SIZE: 64,
  /** Z position for vector plants (above pixel plants) */
  Z_POSITION: 60,
  /** Default line color */
  DEFAULT_COLOR: 0x707070,
  /** Default opacity */
  DEFAULT_OPACITY: 0.8,
};

/**
 * Cached render state for a plant to detect when geometry needs rebuilding.
 * Only rebuild when these values change.
 */
interface PlantRenderState {
  /** Current keyframe index */
  keyframeIndex: number;
  /** Whether we're in a transition (first 10% of keyframe) */
  isTransitioning: boolean;
  /** For transitions: interpolation t value (to 2 decimal places) */
  transitionT: number;
  /** Stroke color (for transition color changes) */
  strokeColor: string;
  /** Scale value */
  scale: number;
  /** Plant position for detecting moves */
  positionX: number;
  positionY: number;
}

/**
 * Renders vector-mode plant variants using Three.js Line primitives.
 * Uses material pooling to reduce allocations.
 */
export class VectorPlantOverlay {
  private group: THREE.Group;
  private plantMeshes: Map<string, THREE.Group> = new Map();
  private plantRenderStates: Map<string, PlantRenderState> = new Map();
  private plants: Plant[] = [];
  private variantCache: Map<string, PlantVariant> = new Map();

  /** Pool of materials keyed by "color-opacity" string for reuse */
  private materialPool: Map<string, THREE.LineBasicMaterial> = new Map();

  /** Pool of circle geometries keyed by segment count for reuse */
  private circleGeometryPool: Map<string, THREE.BufferGeometry> = new Map();

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "vector-plants";
  }

  /**
   * Get or create a pooled material with the given color and opacity.
   */
  private getPooledMaterial(color: string, opacity: number): THREE.LineBasicMaterial {
    // Round opacity to 2 decimal places to increase cache hits
    const roundedOpacity = Math.round(opacity * 100) / 100;
    const key = `${color}-${roundedOpacity}`;

    let material = this.materialPool.get(key);
    if (!material) {
      material = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: roundedOpacity,
      });
      this.materialPool.set(key, material);
    }
    return material;
  }

  /**
   * Set the plants to render. Filters to only vector-mode plants.
   */
  setPlants(plants: Plant[]): void {
    this.plants = plants.filter((plant) => {
      const variant = this.getVariant(plant.variantId);
      return variant?.renderMode === "vector";
    });
    this.rebuildGeometry();
  }

  /**
   * Get variant from cache or fetch it.
   */
  private getVariant(variantId: string): PlantVariant | undefined {
    if (!this.variantCache.has(variantId)) {
      const variant = getVariantById(variantId);
      if (variant) {
        this.variantCache.set(variantId, variant);
      }
    }
    return this.variantCache.get(variantId);
  }

  /**
   * Rebuild all geometry for current plants.
   */
  private rebuildGeometry(): void {
    // Track which plants we've seen
    const seenPlantIds = new Set<string>();

    for (const plant of this.plants) {
      seenPlantIds.add(plant.id);

      const variant = this.getVariant(plant.variantId);
      if (!variant?.vectorKeyframes?.length) continue;

      // Get or create mesh group for this plant
      let plantGroup = this.plantMeshes.get(plant.id);
      if (!plantGroup) {
        plantGroup = new THREE.Group();
        plantGroup.name = `vector-plant-${plant.id}`;
        this.group.add(plantGroup);
        this.plantMeshes.set(plant.id, plantGroup);
      }

      // Get current keyframe
      const keyframe = this.getCurrentKeyframe(plant, variant);
      if (!keyframe) continue;

      // Update plant visuals
      this.updatePlantGroup(plantGroup, plant, keyframe);
    }

    // Remove plants that are no longer present
    for (const [plantId, meshGroup] of this.plantMeshes) {
      if (!seenPlantIds.has(plantId)) {
        this.group.remove(meshGroup);
        this.disposeMeshGroup(meshGroup);
        this.plantMeshes.delete(plantId);
      }
    }
  }

  /**
   * Get the current vector visual for a plant (with tweening support).
   */
  private getCurrentKeyframe(
    plant: Plant,
    variant: PlantVariant
  ): VectorKeyframe | InterpolatedVectorKeyframe | null {
    if (!variant.vectorKeyframes?.length) return null;

    // Convert Plant to PlantWithLifecycle
    const plantWithLifecycle: PlantWithLifecycle = {
      id: plant.id,
      variantId: plant.variantId,
      germinatedAt: plant.germinatedAt ?? null,
      lifecycleModifier: plant.lifecycleModifier ?? 1.0,
      colorVariationName: plant.colorVariationName ?? null,
    };

    // Create a temporary variant with placeholder keyframes for lifecycle calculation
    const tempVariant: PlantVariant = {
      ...variant,
      keyframes: variant.vectorKeyframes.map((vk) => ({
        name: vk.name,
        duration: vk.duration,
        pattern: [],
        palette: [vk.strokeColor],
        opacity: vk.strokeOpacity,
        scale: vk.scale,
      })),
    };

    const lifecycleState = computeLifecycleState(plantWithLifecycle, tempVariant);

    // Use getActiveVectorVisual for tweening support
    try {
      return getActiveVectorVisual(lifecycleState, variant);
    } catch {
      // Fallback to direct keyframe access if tweening fails
      return variant.vectorKeyframes[lifecycleState.keyframeIndex] ?? null;
    }
  }

  /**
   * Update a plant's mesh group with the current keyframe visuals.
   * Uses pooled materials to reduce allocations.
   */
  private updatePlantGroup(
    plantGroup: THREE.Group,
    plant: Plant,
    keyframe: VectorKeyframe | InterpolatedVectorKeyframe
  ): void {
    // Clear existing children - dispose geometry but NOT materials (they're pooled)
    while (plantGroup.children.length > 0) {
      const child = plantGroup.children[0];
      if (child) {
        plantGroup.remove(child);
        if (child instanceof THREE.Line || child instanceof THREE.LineLoop) {
          child.geometry.dispose();
          // Note: materials are pooled, so we don't dispose them here
        }
      }
    }

    // Get draw fractions if this is an interpolated keyframe
    const drawFractions = isInterpolatedVectorKeyframe(keyframe)
      ? keyframe.drawFractions
      : undefined;

    // Generate geometry for each primitive
    for (let i = 0; i < keyframe.primitives.length; i++) {
      const primitive = keyframe.primitives[i];
      if (!primitive) continue;

      const drawFraction = drawFractions?.[i] ?? 1;

      // Skip primitives that are fully hidden
      if (drawFraction <= 0) continue;

      // Get pooled material - adjust opacity for partially drawn primitives
      const opacity = keyframe.strokeOpacity * Math.min(1, drawFraction * 2); // Fade in during first half of draw
      const material = this.getPooledMaterial(keyframe.strokeColor, opacity);

      const lineObject = this.createPrimitiveGeometry(primitive, material, drawFraction);
      if (lineObject) {
        plantGroup.add(lineObject);
      }
    }

    // Position the plant group
    const scale = keyframe.scale ?? 1.0;
    plantGroup.position.set(plant.position.x, plant.position.y, VECTOR_PLANT_CONFIG.Z_POSITION);
    plantGroup.scale.set(scale, scale, 1);
  }

  /**
   * Create Three.js geometry for a vector primitive.
   *
   * @param primitive - The vector primitive to render
   * @param material - The line material
   * @param drawFraction - How much of the primitive to draw (0-1), used for progressive drawing
   */
  private createPrimitiveGeometry(
    primitive: VectorPrimitive,
    material: THREE.LineBasicMaterial,
    drawFraction: number = 1
  ): THREE.Line | THREE.LineLoop | null {
    switch (primitive.type) {
      case "circle":
        return this.createCircle(
          primitive.cx,
          primitive.cy,
          primitive.radius,
          material,
          drawFraction
        );
      case "line":
        return this.createLine(
          primitive.x1,
          primitive.y1,
          primitive.x2,
          primitive.y2,
          material,
          drawFraction
        );
      case "polygon":
        return this.createPolygon(
          primitive.cx,
          primitive.cy,
          primitive.sides,
          primitive.radius,
          primitive.rotation ?? 0,
          material
        );
      case "star":
        return this.createStar(
          primitive.cx,
          primitive.cy,
          primitive.points,
          primitive.outerRadius,
          primitive.innerRadius,
          primitive.rotation ?? 0,
          material
        );
      case "diamond":
        return this.createDiamond(
          primitive.cx,
          primitive.cy,
          primitive.width,
          primitive.height,
          material
        );
      default:
        return null;
    }
  }

  /**
   * Create a circle LineLoop (or partial arc for progressive drawing).
   *
   * @param drawFraction - How much of the circle to draw (0-1)
   */
  private createCircle(
    cx: number,
    cy: number,
    radius: number,
    material: THREE.LineBasicMaterial,
    drawFraction: number = 1
  ): THREE.LineLoop | THREE.Line {
    const vertices: number[] = [];
    const segments = VECTOR_PLANT_CONFIG.CIRCLE_SEGMENTS;
    const segmentsToDraw = Math.ceil(segments * Math.max(0, Math.min(1, drawFraction)));

    for (let i = 0; i <= segmentsToDraw; i++) {
      const angle = (i / segments) * Math.PI * 2;
      // Offset from center of 64x64 space
      const x = cx - 32 + Math.cos(angle) * radius;
      const y = cy - 32 + Math.sin(angle) * radius;
      vertices.push(x, -y, 0); // Negate Y for screen coordinates
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

    // Use Line instead of LineLoop for partial circles
    if (drawFraction < 1) {
      return new THREE.Line(geometry, material);
    }
    return new THREE.LineLoop(geometry, material);
  }

  /**
   * Create a line segment (with progressive drawing support).
   *
   * @param drawFraction - How much of the line to draw (0-1).
   *                       Line draws from (x1,y1) toward (x2,y2).
   */
  private createLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    material: THREE.LineBasicMaterial,
    drawFraction: number = 1
  ): THREE.Line {
    // Calculate actual end point based on draw fraction
    const fraction = Math.max(0, Math.min(1, drawFraction));
    const actualX2 = x1 + (x2 - x1) * fraction;
    const actualY2 = y1 + (y2 - y1) * fraction;

    // Offset from center of 64x64 space
    const vertices = [x1 - 32, -(y1 - 32), 0, actualX2 - 32, -(actualY2 - 32), 0];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return new THREE.Line(geometry, material);
  }

  /**
   * Create a regular polygon LineLoop.
   */
  private createPolygon(
    cx: number,
    cy: number,
    sides: number,
    radius: number,
    rotation: number,
    material: THREE.LineBasicMaterial
  ): THREE.LineLoop {
    const vertices: number[] = [];
    const rotRad = (rotation * Math.PI) / 180;

    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + rotRad;
      const x = cx - 32 + Math.cos(angle) * radius;
      const y = cy - 32 + Math.sin(angle) * radius;
      vertices.push(x, -y, 0);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return new THREE.LineLoop(geometry, material);
  }

  /**
   * Create a star LineLoop.
   */
  private createStar(
    cx: number,
    cy: number,
    points: number,
    outerRadius: number,
    innerRadius: number,
    rotation: number,
    material: THREE.LineBasicMaterial
  ): THREE.LineLoop {
    const vertices: number[] = [];
    const rotRad = (rotation * Math.PI) / 180;
    const totalPoints = points * 2;

    for (let i = 0; i <= totalPoints; i++) {
      const angle = (i / totalPoints) * Math.PI * 2 + rotRad;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx - 32 + Math.cos(angle) * radius;
      const y = cy - 32 + Math.sin(angle) * radius;
      vertices.push(x, -y, 0);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return new THREE.LineLoop(geometry, material);
  }

  /**
   * Create a diamond LineLoop.
   */
  private createDiamond(
    cx: number,
    cy: number,
    width: number,
    height: number,
    material: THREE.LineBasicMaterial
  ): THREE.LineLoop {
    const halfW = width / 2;
    const halfH = height / 2;
    const centerX = cx - 32;
    const centerY = cy - 32;

    const vertices = [
      centerX,
      -(centerY - halfH),
      0, // Top
      centerX + halfW,
      -centerY,
      0, // Right
      centerX,
      -(centerY + halfH),
      0, // Bottom
      centerX - halfW,
      -centerY,
      0, // Left
      centerX,
      -(centerY - halfH),
      0, // Close loop
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return new THREE.LineLoop(geometry, material);
  }

  /**
   * Dispose of a mesh group and its resources.
   * Note: Materials are pooled and not disposed here.
   */
  private disposeMeshGroup(group: THREE.Group): void {
    for (const child of group.children) {
      if (child instanceof THREE.Line || child instanceof THREE.LineLoop) {
        child.geometry.dispose();
        // Materials are pooled, so we don't dispose them here
      }
    }
  }

  /**
   * Update the overlay each frame.
   * Only rebuilds geometry for plants whose visual state has changed.
   */
  update(_time: number): void {
    // Incrementally update only plants that need it
    this.updateChangedPlants();
  }

  /**
   * Compute the current render state for a plant.
   */
  private computeRenderState(
    plant: Plant,
    variant: PlantVariant,
    keyframe: VectorKeyframe | InterpolatedVectorKeyframe
  ): PlantRenderState {
    // Get keyframe index from lifecycle state
    const plantWithLifecycle: PlantWithLifecycle = {
      id: plant.id,
      variantId: plant.variantId,
      germinatedAt: plant.germinatedAt ?? null,
      lifecycleModifier: plant.lifecycleModifier ?? 1.0,
      colorVariationName: plant.colorVariationName ?? null,
    };

    const tempVariant: PlantVariant = {
      ...variant,
      keyframes: variant.vectorKeyframes!.map((vk) => ({
        name: vk.name,
        duration: vk.duration,
        pattern: [],
        palette: [vk.strokeColor],
        opacity: vk.strokeOpacity,
        scale: vk.scale,
      })),
    };

    const lifecycleState = computeLifecycleState(plantWithLifecycle, tempVariant);
    const isTransitioning = isInterpolatedVectorKeyframe(keyframe);

    return {
      keyframeIndex: lifecycleState.keyframeIndex,
      isTransitioning,
      // Round t to 2 decimal places to reduce spurious updates during transitions
      transitionT: isTransitioning
        ? Math.round((keyframe as InterpolatedVectorKeyframe).t * 100) / 100
        : 0,
      strokeColor: keyframe.strokeColor,
      scale: keyframe.scale ?? 1.0,
      positionX: plant.position.x,
      positionY: plant.position.y,
    };
  }

  /**
   * Check if two render states are equal.
   */
  private renderStatesEqual(a: PlantRenderState, b: PlantRenderState): boolean {
    return (
      a.keyframeIndex === b.keyframeIndex &&
      a.isTransitioning === b.isTransitioning &&
      a.transitionT === b.transitionT &&
      a.strokeColor === b.strokeColor &&
      a.scale === b.scale &&
      a.positionX === b.positionX &&
      a.positionY === b.positionY
    );
  }

  /**
   * Update only plants whose render state has changed.
   */
  private updateChangedPlants(): void {
    const seenPlantIds = new Set<string>();

    for (const plant of this.plants) {
      seenPlantIds.add(plant.id);

      const variant = this.getVariant(plant.variantId);
      if (!variant?.vectorKeyframes?.length) continue;

      const keyframe = this.getCurrentKeyframe(plant, variant);
      if (!keyframe) continue;

      // Compute current render state
      const currentState = this.computeRenderState(plant, variant, keyframe);
      const prevState = this.plantRenderStates.get(plant.id);

      // Get or create mesh group
      let plantGroup = this.plantMeshes.get(plant.id);
      const isNewPlant = !plantGroup;

      if (isNewPlant) {
        plantGroup = new THREE.Group();
        plantGroup.name = `vector-plant-${plant.id}`;
        this.group.add(plantGroup);
        this.plantMeshes.set(plant.id, plantGroup);
      }

      // Only update if state changed or new plant
      if (isNewPlant || !prevState || !this.renderStatesEqual(prevState, currentState)) {
        this.updatePlantGroup(plantGroup!, plant, keyframe);
        this.plantRenderStates.set(plant.id, currentState);
      }
    }

    // Remove plants that are no longer present
    for (const [plantId, meshGroup] of this.plantMeshes) {
      if (!seenPlantIds.has(plantId)) {
        this.group.remove(meshGroup);
        this.disposeMeshGroup(meshGroup);
        this.plantMeshes.delete(plantId);
        this.plantRenderStates.delete(plantId);
      }
    }
  }

  /**
   * Get the Three.js object for adding to scene.
   */
  getObject(): THREE.Object3D {
    return this.group;
  }

  /**
   * Clean up resources.
   */
  dispose(): void {
    for (const meshGroup of this.plantMeshes.values()) {
      this.disposeMeshGroup(meshGroup);
    }
    this.plantMeshes.clear();
    this.plantRenderStates.clear();

    // Dispose pooled materials
    for (const material of this.materialPool.values()) {
      material.dispose();
    }
    this.materialPool.clear();

    // Dispose pooled geometries
    for (const geometry of this.circleGeometryPool.values()) {
      geometry.dispose();
    }
    this.circleGeometryPool.clear();
  }
}
