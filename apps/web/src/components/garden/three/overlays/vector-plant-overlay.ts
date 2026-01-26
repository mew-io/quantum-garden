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
  getVariantById,
  computeLifecycleState,
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
 * Renders vector-mode plant variants using Three.js Line primitives.
 */
export class VectorPlantOverlay {
  private group: THREE.Group;
  private plantMeshes: Map<string, THREE.Group> = new Map();
  private plants: Plant[] = [];
  private variantCache: Map<string, PlantVariant> = new Map();

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "vector-plants";
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
   * Get the current vector keyframe for a plant.
   */
  private getCurrentKeyframe(plant: Plant, variant: PlantVariant): VectorKeyframe | null {
    if (!variant.vectorKeyframes?.length) return null;

    // Convert Plant to PlantWithLifecycle
    const plantWithLifecycle: PlantWithLifecycle = {
      id: plant.id,
      variantId: plant.variantId,
      germinatedAt: plant.germinatedAt ?? null,
      lifecycleModifier: plant.lifecycleModifier ?? 1.0,
      colorVariationName: plant.colorVariationName ?? null,
    };

    // Create a temporary variant with regular keyframes for lifecycle calculation
    // The keyframe index will be the same for vectorKeyframes
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
    return variant.vectorKeyframes[lifecycleState.keyframeIndex] ?? null;
  }

  /**
   * Update a plant's mesh group with the current keyframe visuals.
   */
  private updatePlantGroup(plantGroup: THREE.Group, plant: Plant, keyframe: VectorKeyframe): void {
    // Clear existing children
    while (plantGroup.children.length > 0) {
      const child = plantGroup.children[0];
      if (child) {
        plantGroup.remove(child);
        if (child instanceof THREE.Line || child instanceof THREE.LineLoop) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      }
    }

    // Create material for this keyframe
    const color = new THREE.Color(keyframe.strokeColor);
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: keyframe.strokeOpacity,
    });

    // Generate geometry for each primitive
    for (const primitive of keyframe.primitives) {
      const lineObject = this.createPrimitiveGeometry(primitive, material);
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
   */
  private createPrimitiveGeometry(
    primitive: VectorPrimitive,
    material: THREE.LineBasicMaterial
  ): THREE.Line | THREE.LineLoop | null {
    switch (primitive.type) {
      case "circle":
        return this.createCircle(primitive.cx, primitive.cy, primitive.radius, material);
      case "line":
        return this.createLine(primitive.x1, primitive.y1, primitive.x2, primitive.y2, material);
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
   * Create a circle LineLoop.
   */
  private createCircle(
    cx: number,
    cy: number,
    radius: number,
    material: THREE.LineBasicMaterial
  ): THREE.LineLoop {
    const vertices: number[] = [];
    const segments = VECTOR_PLANT_CONFIG.CIRCLE_SEGMENTS;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      // Offset from center of 64x64 space
      const x = cx - 32 + Math.cos(angle) * radius;
      const y = cy - 32 + Math.sin(angle) * radius;
      vertices.push(x, -y, 0); // Negate Y for screen coordinates
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return new THREE.LineLoop(geometry, material);
  }

  /**
   * Create a line segment.
   */
  private createLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    material: THREE.LineBasicMaterial
  ): THREE.Line {
    // Offset from center of 64x64 space
    const vertices = [x1 - 32, -(y1 - 32), 0, x2 - 32, -(y2 - 32), 0];

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
   */
  private disposeMeshGroup(group: THREE.Group): void {
    for (const child of group.children) {
      if (child instanceof THREE.Line || child instanceof THREE.LineLoop) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    }
  }

  /**
   * Update the overlay each frame.
   */
  update(_time: number): void {
    // Rebuild geometry to update keyframes based on current time
    // In a production system, you might optimize this to only update
    // plants that are actively transitioning
    this.rebuildGeometry();
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
  }
}
