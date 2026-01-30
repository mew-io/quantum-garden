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
  /** Number of segments per turn for spiral approximation */
  SPIRAL_SEGMENTS_PER_TURN: 32,
  /** Number of segments for bezier curve approximation */
  BEZIER_SEGMENTS: 24,
  /** Base size in world units (plants are 64x64 coordinate space) */
  BASE_SIZE: 64,
  /** Z position for vector plants (above pixel plants) */
  Z_POSITION: 60,
  /** Default line color */
  DEFAULT_COLOR: 0x707070,
  /** Default opacity */
  DEFAULT_OPACITY: 0.8,
  /** Default charcoal outline color */
  DEFAULT_OUTLINE_COLOR: "#2A2A2A",
  /** Default outline width */
  DEFAULT_OUTLINE_WIDTH: 2,
  /** Default fill opacity */
  DEFAULT_FILL_OPACITY: 0.8,
  /** Z offset between fill and outline (outline slightly above) */
  OUTLINE_Z_OFFSET: 0.1,
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
 * Cached keyframe meshes for a plant variant.
 * Key format: "variantId-keyframeIndex"
 * Value: Array of Line/LineLoop objects that can be cloned
 */
type KeyframeMeshCache = Map<string, THREE.Object3D[]>;

/**
 * Renders vector-mode plant variants using Three.js Line primitives.
 * Uses material pooling to reduce allocations.
 */
export class VectorPlantOverlay {
  private group: THREE.Group;
  private plantMeshes: Map<string, THREE.Group> = new Map();
  private plantRenderStates: Map<string, PlantRenderState> = new Map();
  private plants: Plant[] = [];
  private lastPlantsRef: Plant[] | null = null; // For reference comparison to skip redundant setPlants calls
  private variantCache: Map<string, PlantVariant> = new Map();

  /** Pool of line materials keyed by "color-opacity" string for reuse */
  private materialPool: Map<string, THREE.LineBasicMaterial> = new Map();

  /** Pool of fill materials keyed by "color-opacity" string for reuse */
  private fillMaterialPool: Map<string, THREE.MeshBasicMaterial> = new Map();

  /** Pool of circle geometries keyed by segment count for reuse */
  private circleGeometryPool: Map<string, THREE.BufferGeometry> = new Map();

  /** Cache of meshes for static keyframes (non-transitioning) */
  private keyframeMeshCache: KeyframeMeshCache = new Map();

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "vector-plants";
  }

  /**
   * Get or create a pooled line material with the given color and opacity.
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
   * Get or create a pooled fill material with the given color and opacity.
   */
  private getPooledFillMaterial(color: string, opacity: number): THREE.MeshBasicMaterial {
    // Round opacity to 2 decimal places to increase cache hits
    const roundedOpacity = Math.round(opacity * 100) / 100;
    const key = `fill-${color}-${roundedOpacity}`;

    let material = this.fillMaterialPool.get(key);
    if (!material) {
      material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: roundedOpacity,
        side: THREE.DoubleSide,
      });
      this.fillMaterialPool.set(key, material);
    }
    return material;
  }

  /**
   * Set the plants to render. Filters to only vector-mode plants.
   * Uses reference comparison to avoid unnecessary rebuilds when called every frame.
   */
  setPlants(plants: Plant[]): void {
    // Quick reference check - if same array, skip processing
    if (plants === this.lastPlantsRef) {
      return;
    }
    this.lastPlantsRef = plants;

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
      if (!variant?.vectorKeyframes?.length) {
        continue;
      }

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
      if (!keyframe) {
        continue;
      }

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
   * Get cache key for a static keyframe.
   */
  private getKeyframeCacheKey(
    variantId: string,
    keyframeIndex: number,
    strokeColor: string
  ): string {
    return `${variantId}-${keyframeIndex}-${strokeColor}`;
  }

  /**
   * Clone cached meshes for a keyframe into a plant group.
   * Returns true if cache hit, false if cache miss.
   */
  private tryUseCachedMeshes(
    plantGroup: THREE.Group,
    cacheKey: string,
    plant: Plant,
    scale: number
  ): boolean {
    const cachedMeshes = this.keyframeMeshCache.get(cacheKey);
    if (!cachedMeshes) return false;

    // Clear existing children
    this.clearPlantGroup(plantGroup);

    // Clone cached meshes into the group
    for (const mesh of cachedMeshes) {
      const cloned = mesh.clone();
      plantGroup.add(cloned);
    }

    // Position the plant group
    plantGroup.position.set(plant.position.x, plant.position.y, VECTOR_PLANT_CONFIG.Z_POSITION);
    plantGroup.scale.set(scale, scale, 1);

    return true;
  }

  /**
   * Store meshes in cache for future reuse.
   * Only caches static (non-transitioning) keyframes.
   */
  private cacheMeshes(cacheKey: string, plantGroup: THREE.Group): void {
    // Clone meshes for caching (don't use the originals)
    const meshesToCache: THREE.Object3D[] = [];
    for (const child of plantGroup.children) {
      meshesToCache.push(child.clone());
    }
    this.keyframeMeshCache.set(cacheKey, meshesToCache);
  }

  /**
   * Clear all children from a plant group, disposing geometry.
   */
  private clearPlantGroup(plantGroup: THREE.Group): void {
    while (plantGroup.children.length > 0) {
      const child = plantGroup.children[0];
      if (child) {
        plantGroup.remove(child);
        if (
          child instanceof THREE.Line ||
          child instanceof THREE.LineLoop ||
          child instanceof THREE.Mesh
        ) {
          child.geometry.dispose();
          // Note: materials are pooled, so we don't dispose them here
        }
      }
    }
  }

  /**
   * Update a plant's mesh group with the current keyframe visuals.
   * Uses pooled materials and keyframe mesh caching to reduce allocations.
   */
  private updatePlantGroup(
    plantGroup: THREE.Group,
    plant: Plant,
    keyframe: VectorKeyframe | InterpolatedVectorKeyframe
  ): void {
    const isTransitioning = isInterpolatedVectorKeyframe(keyframe);
    const scale = keyframe.scale ?? 1.0;

    // For static keyframes, try to use cached meshes
    if (!isTransitioning) {
      // Get lifecycle state for keyframe index
      const variant = this.getVariant(plant.variantId);
      if (variant?.vectorKeyframes) {
        const keyframeIndex = variant.vectorKeyframes.findIndex(
          (vk) => vk.primitives === keyframe.primitives
        );
        if (keyframeIndex >= 0) {
          const cacheKey = this.getKeyframeCacheKey(
            plant.variantId,
            keyframeIndex,
            keyframe.strokeColor
          );

          // Try to use cache
          if (this.tryUseCachedMeshes(plantGroup, cacheKey, plant, scale)) {
            return; // Cache hit - we're done
          }

          // Cache miss - build meshes and cache them
          this.buildPlantMeshes(plantGroup, plant, keyframe, undefined);
          this.cacheMeshes(cacheKey, plantGroup);
          return;
        }
      }
    }

    // Transitioning or couldn't cache - build meshes normally
    const drawFractions = isTransitioning
      ? (keyframe as InterpolatedVectorKeyframe).drawFractions
      : undefined;
    this.buildPlantMeshes(plantGroup, plant, keyframe, drawFractions);
  }

  /**
   * Build meshes for a plant from primitives.
   * Now supports fills and charcoal outlines for the new art style.
   */
  private buildPlantMeshes(
    plantGroup: THREE.Group,
    plant: Plant,
    keyframe: VectorKeyframe | InterpolatedVectorKeyframe,
    drawFractions: number[] | undefined
  ): void {
    // Clear existing children
    this.clearPlantGroup(plantGroup);

    // Get fill and outline colors from keyframe or use defaults
    const fillColor = keyframe.fillColor;
    const fillOpacity = keyframe.fillOpacity ?? VECTOR_PLANT_CONFIG.DEFAULT_FILL_OPACITY;
    const outlineColor = keyframe.outlineColor ?? VECTOR_PLANT_CONFIG.DEFAULT_OUTLINE_COLOR;
    // Note: strokeWidth is preserved for future use but not applied currently
    // (THREE.LineBasicMaterial linewidth is not consistently supported in WebGL)
    const _strokeWidth = keyframe.strokeWidth ?? VECTOR_PLANT_CONFIG.DEFAULT_OUTLINE_WIDTH;

    // First pass: render fills for fillable shapes
    if (fillColor) {
      for (let i = 0; i < keyframe.primitives.length; i++) {
        const primitive = keyframe.primitives[i];
        if (!primitive) continue;

        const drawFraction = drawFractions?.[i] ?? 1;
        if (drawFraction <= 0) continue;

        // Check if this primitive should be filled (default true for closed shapes, false for open paths)
        // Open paths: line, bezier, spiral - never fill
        // Closed shapes: circle, polygon, star, diamond - fill by default
        // Arc: fill only if explicitly set to true
        const isOpenPath =
          primitive.type === "line" || primitive.type === "bezier" || primitive.type === "spiral";
        const hasExplicitFill = "fill" in primitive && primitive.fill === true;
        const hasExplicitNoFill = "fill" in primitive && primitive.fill === false;
        const shouldFill = !isOpenPath && (hasExplicitFill || !hasExplicitNoFill);
        if (!shouldFill) continue;

        // Create fill material with adjusted opacity for draw fraction
        const opacity = fillOpacity * Math.min(1, drawFraction * 2);
        const fillMaterial = this.getPooledFillMaterial(fillColor, opacity);

        const fillMesh = this.createPrimitiveFill(primitive, fillMaterial);
        if (fillMesh) {
          fillMesh.position.z = 0; // Fills at base z
          plantGroup.add(fillMesh);
        }
      }
    }

    // Second pass: render outlines (charcoal strokes)
    for (let i = 0; i < keyframe.primitives.length; i++) {
      const primitive = keyframe.primitives[i];
      if (!primitive) continue;

      const drawFraction = drawFractions?.[i] ?? 1;
      if (drawFraction <= 0) continue;

      // Get outline material - use charcoal outline color for filled shapes, stroke color for unfilled
      const isFilledShape =
        primitive.type !== "line" &&
        primitive.type !== "bezier" &&
        primitive.type !== "spiral" &&
        !("fill" in primitive && primitive.fill === false);
      const useOutlineColor = fillColor && isFilledShape;
      const lineColor = useOutlineColor ? outlineColor : keyframe.strokeColor;
      const opacity = keyframe.strokeOpacity * Math.min(1, drawFraction * 2);
      const material = this.getPooledMaterial(lineColor, opacity);

      const lineObject = this.createPrimitiveGeometry(primitive, material, drawFraction);
      if (lineObject) {
        lineObject.position.z = VECTOR_PLANT_CONFIG.OUTLINE_Z_OFFSET; // Outlines slightly above fills
        plantGroup.add(lineObject);
      }
    }

    // Position the plant group
    const scale = keyframe.scale ?? 1.0;
    plantGroup.position.set(plant.position.x, plant.position.y, VECTOR_PLANT_CONFIG.Z_POSITION);
    plantGroup.scale.set(scale, scale, 1);
  }

  /**
   * Create a filled mesh for a primitive (circle, polygon, star, diamond).
   */
  private createPrimitiveFill(
    primitive: VectorPrimitive,
    material: THREE.MeshBasicMaterial
  ): THREE.Mesh | null {
    switch (primitive.type) {
      case "circle":
        return this.createCircleFill(primitive.cx, primitive.cy, primitive.radius, material);
      case "polygon":
        return this.createPolygonFill(
          primitive.cx,
          primitive.cy,
          primitive.sides,
          primitive.radius,
          primitive.rotation ?? 0,
          material
        );
      case "star":
        return this.createStarFill(
          primitive.cx,
          primitive.cy,
          primitive.points,
          primitive.outerRadius,
          primitive.innerRadius,
          primitive.rotation ?? 0,
          material
        );
      case "diamond":
        return this.createDiamondFill(
          primitive.cx,
          primitive.cy,
          primitive.width,
          primitive.height,
          material
        );
      case "arc":
        return this.createArcFill(
          primitive.cx,
          primitive.cy,
          primitive.radius,
          primitive.startAngle,
          primitive.endAngle,
          material
        );
      case "line":
      case "bezier":
      case "spiral":
        return null; // Lines, beziers, and spirals don't have fills (open paths)
      default:
        return null;
    }
  }

  /**
   * Create a filled circle mesh.
   */
  private createCircleFill(
    cx: number,
    cy: number,
    radius: number,
    material: THREE.MeshBasicMaterial
  ): THREE.Mesh {
    const geometry = new THREE.CircleGeometry(radius, VECTOR_PLANT_CONFIG.CIRCLE_SEGMENTS);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(cx - 32, -(cy - 32), 0);
    return mesh;
  }

  /**
   * Create a filled polygon mesh.
   */
  private createPolygonFill(
    cx: number,
    cy: number,
    sides: number,
    radius: number,
    rotation: number,
    material: THREE.MeshBasicMaterial
  ): THREE.Mesh {
    const shape = new THREE.Shape();
    const rotRad = (rotation * Math.PI) / 180;

    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + rotRad;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        shape.moveTo(x, -y);
      } else {
        shape.lineTo(x, -y);
      }
    }
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(cx - 32, -(cy - 32), 0);
    return mesh;
  }

  /**
   * Create a filled star mesh.
   */
  private createStarFill(
    cx: number,
    cy: number,
    points: number,
    outerRadius: number,
    innerRadius: number,
    rotation: number,
    material: THREE.MeshBasicMaterial
  ): THREE.Mesh {
    const shape = new THREE.Shape();
    const rotRad = (rotation * Math.PI) / 180;
    const totalPoints = points * 2;

    for (let i = 0; i <= totalPoints; i++) {
      const angle = (i / totalPoints) * Math.PI * 2 + rotRad;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        shape.moveTo(x, -y);
      } else {
        shape.lineTo(x, -y);
      }
    }
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(cx - 32, -(cy - 32), 0);
    return mesh;
  }

  /**
   * Create a filled diamond mesh.
   */
  private createDiamondFill(
    cx: number,
    cy: number,
    width: number,
    height: number,
    material: THREE.MeshBasicMaterial
  ): THREE.Mesh {
    const halfW = width / 2;
    const halfH = height / 2;

    const shape = new THREE.Shape();
    shape.moveTo(0, halfH); // Top
    shape.lineTo(halfW, 0); // Right
    shape.lineTo(0, -halfH); // Bottom
    shape.lineTo(-halfW, 0); // Left
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(cx - 32, -(cy - 32), 0);
    return mesh;
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
      case "arc":
        return this.createArc(
          primitive.cx,
          primitive.cy,
          primitive.radius,
          primitive.startAngle,
          primitive.endAngle,
          material,
          drawFraction
        );
      case "bezier":
        return this.createBezier(
          primitive.x1,
          primitive.y1,
          primitive.cx1,
          primitive.cy1,
          primitive.cx2,
          primitive.cy2,
          primitive.x2,
          primitive.y2,
          material,
          drawFraction
        );
      case "spiral":
        return this.createSpiral(
          primitive.cx,
          primitive.cy,
          primitive.startRadius,
          primitive.endRadius,
          primitive.turns,
          primitive.startAngle ?? 0,
          material,
          drawFraction
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
   * Create an arc (partial circle) Line.
   *
   * @param startAngle - Start angle in degrees
   * @param endAngle - End angle in degrees
   * @param drawFraction - How much of the arc to draw (0-1)
   */
  private createArc(
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    material: THREE.LineBasicMaterial,
    drawFraction: number = 1
  ): THREE.Line {
    const vertices: number[] = [];
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const totalAngle = endRad - startRad;

    // Calculate segments based on arc length
    const segments = Math.max(
      8,
      Math.ceil((Math.abs(totalAngle) / (Math.PI * 2)) * VECTOR_PLANT_CONFIG.CIRCLE_SEGMENTS)
    );
    const segmentsToDraw = Math.ceil(segments * Math.max(0, Math.min(1, drawFraction)));

    for (let i = 0; i <= segmentsToDraw; i++) {
      const t = i / segments;
      const angle = startRad + totalAngle * t;
      const x = cx - 32 + Math.cos(angle) * radius;
      const y = cy - 32 + Math.sin(angle) * radius;
      vertices.push(x, -y, 0);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return new THREE.Line(geometry, material);
  }

  /**
   * Create a filled arc (wedge/pie slice) mesh.
   */
  private createArcFill(
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    material: THREE.MeshBasicMaterial
  ): THREE.Mesh {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const totalAngle = endRad - startRad;

    const segments = Math.max(
      8,
      Math.ceil((Math.abs(totalAngle) / (Math.PI * 2)) * VECTOR_PLANT_CONFIG.CIRCLE_SEGMENTS)
    );

    const shape = new THREE.Shape();
    // Start at center for wedge shape
    shape.moveTo(0, 0);

    // Draw arc points
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = startRad + totalAngle * t;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      shape.lineTo(x, -y);
    }

    // Close back to center
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(cx - 32, -(cy - 32), 0);
    return mesh;
  }

  /**
   * Create a cubic bezier curve Line.
   *
   * @param x1, y1 - Start point
   * @param cx1, cy1 - First control point
   * @param cx2, cy2 - Second control point
   * @param x2, y2 - End point
   * @param drawFraction - How much of the curve to draw (0-1)
   */
  private createBezier(
    x1: number,
    y1: number,
    cx1: number,
    cy1: number,
    cx2: number,
    cy2: number,
    x2: number,
    y2: number,
    material: THREE.LineBasicMaterial,
    drawFraction: number = 1
  ): THREE.Line {
    const vertices: number[] = [];
    const segments = VECTOR_PLANT_CONFIG.BEZIER_SEGMENTS;
    const segmentsToDraw = Math.ceil(segments * Math.max(0, Math.min(1, drawFraction)));

    for (let i = 0; i <= segmentsToDraw; i++) {
      const t = i / segments;

      // Cubic bezier formula: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
      const oneMinusT = 1 - t;
      const oneMinusT2 = oneMinusT * oneMinusT;
      const oneMinusT3 = oneMinusT2 * oneMinusT;
      const t2 = t * t;
      const t3 = t2 * t;

      const x = oneMinusT3 * x1 + 3 * oneMinusT2 * t * cx1 + 3 * oneMinusT * t2 * cx2 + t3 * x2;
      const y = oneMinusT3 * y1 + 3 * oneMinusT2 * t * cy1 + 3 * oneMinusT * t2 * cy2 + t3 * y2;

      vertices.push(x - 32, -(y - 32), 0);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return new THREE.Line(geometry, material);
  }

  /**
   * Create a spiral Line (Archimedean spiral).
   *
   * @param startRadius - Radius at the start of the spiral
   * @param endRadius - Radius at the end of the spiral
   * @param turns - Number of complete rotations
   * @param startAngle - Starting angle in degrees
   * @param drawFraction - How much of the spiral to draw (0-1)
   */
  private createSpiral(
    cx: number,
    cy: number,
    startRadius: number,
    endRadius: number,
    turns: number,
    startAngle: number,
    material: THREE.LineBasicMaterial,
    drawFraction: number = 1
  ): THREE.Line {
    const vertices: number[] = [];
    const startRad = (startAngle * Math.PI) / 180;
    const totalAngle = turns * Math.PI * 2;
    const segments = Math.ceil(turns * VECTOR_PLANT_CONFIG.SPIRAL_SEGMENTS_PER_TURN);
    const segmentsToDraw = Math.ceil(segments * Math.max(0, Math.min(1, drawFraction)));

    for (let i = 0; i <= segmentsToDraw; i++) {
      const t = i / segments;
      const angle = startRad + totalAngle * t;
      const radius = startRadius + (endRadius - startRadius) * t;

      const x = cx - 32 + Math.cos(angle) * radius;
      const y = cy - 32 + Math.sin(angle) * radius;
      vertices.push(x, -y, 0);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return new THREE.Line(geometry, material);
  }

  /**
   * Dispose of a mesh group and its resources.
   * Note: Materials are pooled and not disposed here.
   */
  private disposeMeshGroup(group: THREE.Group): void {
    for (const child of group.children) {
      if (
        child instanceof THREE.Line ||
        child instanceof THREE.LineLoop ||
        child instanceof THREE.Mesh
      ) {
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
   * Check if there are any active animations that need updating.
   * Returns true when there are vector plants to render.
   */
  hasActiveAnimations(): boolean {
    return this.plants.length > 0;
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

    // Dispose cached keyframe meshes
    for (const cachedMeshes of this.keyframeMeshCache.values()) {
      for (const mesh of cachedMeshes) {
        if (
          mesh instanceof THREE.Line ||
          mesh instanceof THREE.LineLoop ||
          mesh instanceof THREE.Mesh
        ) {
          mesh.geometry.dispose();
        }
      }
    }
    this.keyframeMeshCache.clear();

    // Dispose pooled line materials
    for (const material of this.materialPool.values()) {
      material.dispose();
    }
    this.materialPool.clear();

    // Dispose pooled fill materials
    for (const material of this.fillMaterialPool.values()) {
      material.dispose();
    }
    this.fillMaterialPool.clear();

    // Dispose pooled geometries
    for (const geometry of this.circleGeometryPool.values()) {
      geometry.dispose();
    }
    this.circleGeometryPool.clear();
  }
}
