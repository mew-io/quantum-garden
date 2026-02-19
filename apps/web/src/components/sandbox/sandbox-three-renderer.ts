/**
 * Sandbox Three.js Renderer
 *
 * Reusable Three.js renderer for sandbox components. Uses the same shader
 * pipeline as the main garden simulation (plant-material.ts + texture-atlas)
 * to ensure pixel-identical rendering.
 *
 * Supports:
 * - Live rendering attached to a DOM container
 * - Static rendering to a detached canvas (thumbnails)
 * - Multiple instances (glyph grid, superposed preview)
 * - Vector and pixel plant rendering
 * - Optional post-processing (bloom + paper grain)
 */

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import {
  PATTERN_SIZE,
  CANVAS,
  type VectorKeyframe,
  type VectorPrimitive,
  type InterpolatedVectorKeyframe,
  isInterpolatedVectorKeyframe,
  type PlantVariant,
  type WatercolorBuildContext,
  type ComputedLifecycleState,
} from "@quantum-garden/shared";
import {
  createPlantMaterial,
  updatePlantMaterialTime,
} from "@/components/garden/three/plants/plant-material";
import { getTextureAtlas, type TextureAtlas } from "@/components/garden/three/core/texture-atlas";
import { createPaperTexture, PaperGrainShader } from "@/components/garden/three/core/paper-texture";
import {
  createSeededRng,
  hashString,
  renderWatercolorElement,
} from "@/components/garden/three/overlays/watercolor-rendering";

export type Background = "garden" | "white" | "dark" | "checkerboard";

/** Bloom config matching the main garden */
const BLOOM_CONFIG = {
  STRENGTH: 0.4,
  RADIUS: 0.6,
  THRESHOLD: 0.7,
};

/** Segments for vector primitive approximation (matching VectorPlantOverlay) */
const VECTOR_CONFIG = {
  CIRCLE_SEGMENTS: 64,
  SPIRAL_SEGMENTS_PER_TURN: 32,
  BEZIER_SEGMENTS: 24,
  DEFAULT_OUTLINE_COLOR: "#2A2A2A",
  DEFAULT_FILL_OPACITY: 0.8,
  OUTLINE_Z_OFFSET: 0.1,
};

const BACKGROUND_COLORS: Record<Background, number> = {
  garden: new THREE.Color(CANVAS.BACKGROUND_COLOR).getHex(),
  white: 0xffffff,
  dark: 0x1a1a1a,
  checkerboard: 0xcccccc,
};

/** Checkerboard shader for background */
const CheckerboardShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec2 vUv;
    uniform float u_gridSize;

    void main() {
      vec2 grid = floor(vUv * u_gridSize);
      float checker = mod(grid.x + grid.y, 2.0);
      vec3 color = checker > 0.5 ? vec3(1.0) : vec3(0.8);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

export interface SandboxRendererConfig {
  /** DOM element to attach the canvas to. If omitted, creates a detached canvas. */
  container?: HTMLElement;
  /** Canvas width in CSS pixels */
  width: number;
  /** Canvas height in CSS pixels */
  height: number;
  /** Enable bloom + paper grain post-processing */
  enablePostProcessing?: boolean;
}

export interface InstanceData {
  /** Pattern grid (64x64) to render */
  pattern: number[][];
  /** Unique pattern ID for atlas caching */
  patternId: string;
  /** Color palette [primary, secondary, tertiary] */
  palette: string[];
  /** Position in world units */
  position?: { x: number; y: number };
  /** Opacity (0-1) */
  opacity?: number;
  /** Scale factor */
  scale?: number;
  /** Lifecycle progress (0-1) for shader animations */
  lifecycleProgress?: number;
  /** Shimmer phase (radians) for superposition effects */
  shimmerPhase?: number;
  /** Visual state: 0 = superposed, 1 = collapsed */
  visualState?: number;
}

/**
 * Self-contained Three.js renderer for sandbox plant previews.
 * Reuses the garden's shader pipeline for consistent rendering.
 */
export class SandboxThreeRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private atlas: TextureAtlas;

  // Plant mesh
  private mesh: THREE.InstancedMesh | null = null;
  private material: THREE.ShaderMaterial;
  private geometry: THREE.PlaneGeometry;
  private instanceCount: number = 0;

  // Instance buffer attributes
  private instancePositions!: Float32Array;
  private instanceUVBounds!: Float32Array;
  private instancePalette0!: Float32Array;
  private instancePalette1!: Float32Array;
  private instancePalette2!: Float32Array;
  private instanceState!: Float32Array;
  private instanceAnimation!: Float32Array;

  // Background
  private backgroundQuad: THREE.Mesh;
  private backgroundMaterial: THREE.MeshBasicMaterial;
  private checkerMaterial: THREE.ShaderMaterial;
  private currentBackground: Background = "garden";

  // Grid overlay
  private gridOverlay: THREE.LineSegments | null = null;

  // Vector plant group
  private vectorGroup: THREE.Group;
  private lineMaterialPool: Map<string, THREE.LineBasicMaterial> = new Map();
  private fillMaterialPool: Map<string, THREE.MeshBasicMaterial> = new Map();

  // Watercolor plant group
  private watercolorGroup: THREE.Group;
  private watercolorMaterialPool: Map<string, THREE.MeshBasicMaterial> = new Map();

  // Post-processing
  private composer: EffectComposer | null = null;
  private paperPass: ShaderPass | null = null;
  private postProcessingEnabled: boolean;

  // Camera frustum
  private frustumHalfSize: number;

  constructor(config: SandboxRendererConfig) {
    const { container, width, height, enablePostProcessing = false } = config;
    this.postProcessingEnabled = enablePostProcessing;

    // Texture atlas (shared singleton)
    this.atlas = getTextureAtlas();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(dpr);
    this.renderer.sortObjects = true;

    if (container) {
      container.appendChild(this.renderer.domElement);
    }

    // Camera — centered at origin, y-down to match garden convention
    this.frustumHalfSize = PATTERN_SIZE / 2 + 8; // 64/2 + 8px padding
    this.camera = new THREE.OrthographicCamera(
      -this.frustumHalfSize,
      this.frustumHalfSize,
      -this.frustumHalfSize, // top (y-down: negative = up)
      this.frustumHalfSize, // bottom (y-down: positive = down)
      0.1,
      1000
    );
    this.camera.position.z = 500;

    // Scene
    this.scene = new THREE.Scene();

    // Background quad at z=-1
    const bgGeometry = new THREE.PlaneGeometry(this.frustumHalfSize * 2, this.frustumHalfSize * 2);
    this.backgroundMaterial = new THREE.MeshBasicMaterial({
      color: BACKGROUND_COLORS.garden,
    });
    this.checkerMaterial = new THREE.ShaderMaterial({
      vertexShader: CheckerboardShader.vertexShader,
      fragmentShader: CheckerboardShader.fragmentShader,
      uniforms: {
        u_gridSize: { value: 10.0 },
      },
    });
    this.backgroundQuad = new THREE.Mesh(bgGeometry, this.backgroundMaterial);
    this.backgroundQuad.position.z = -1;
    this.backgroundQuad.renderOrder = -1;
    this.scene.add(this.backgroundQuad);

    // Plant geometry (unit quad scaled by shader)
    this.geometry = new THREE.PlaneGeometry(1, 1);

    // Plant material (same shader as garden)
    this.material = createPlantMaterial(this.atlas.getTexture());

    // Vector plant group
    this.vectorGroup = new THREE.Group();
    this.vectorGroup.name = "sandbox-vector-plants";
    this.vectorGroup.visible = false;
    this.scene.add(this.vectorGroup);

    // Watercolor plant group
    this.watercolorGroup = new THREE.Group();
    this.watercolorGroup.name = "sandbox-watercolor-plants";
    this.watercolorGroup.visible = false;
    this.scene.add(this.watercolorGroup);

    // Post-processing
    if (enablePostProcessing) {
      this.setupPostProcessing(width, height);
    }
  }

  /**
   * Set up bloom + paper grain post-processing.
   */
  private setupPostProcessing(width: number, height: number): void {
    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const resolution = new THREE.Vector2(width * dpr, height * dpr);
    const bloomPass = new UnrealBloomPass(
      resolution,
      BLOOM_CONFIG.STRENGTH,
      BLOOM_CONFIG.RADIUS,
      BLOOM_CONFIG.THRESHOLD
    );
    this.composer.addPass(bloomPass);

    const paperTexture = createPaperTexture();
    this.paperPass = new ShaderPass(PaperGrainShader);
    this.paperPass.uniforms["tPaper"]!.value = paperTexture;
    (this.paperPass.uniforms["resolution"]!.value as THREE.Vector2).set(width * dpr, height * dpr);
    this.composer.addPass(this.paperPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  /**
   * Allocate (or resize) the InstancedMesh to hold `count` instances.
   */
  setInstanceCount(count: number): void {
    if (count === this.instanceCount && this.mesh) return;

    // Remove old mesh
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.dispose();
    }

    this.instanceCount = count;

    // Allocate buffers
    this.instancePositions = new Float32Array(count * 3);
    this.instanceUVBounds = new Float32Array(count * 4);
    this.instancePalette0 = new Float32Array(count * 3);
    this.instancePalette1 = new Float32Array(count * 3);
    this.instancePalette2 = new Float32Array(count * 3);
    this.instanceState = new Float32Array(count * 4);
    this.instanceAnimation = new Float32Array(count * 3);

    // Create InstancedMesh
    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, count);
    this.mesh.frustumCulled = false;

    // Attach buffer attributes
    const geo = this.mesh.geometry;
    geo.setAttribute(
      "instancePosition",
      new THREE.InstancedBufferAttribute(this.instancePositions, 3)
    );
    geo.setAttribute(
      "instanceUVBounds",
      new THREE.InstancedBufferAttribute(this.instanceUVBounds, 4)
    );
    geo.setAttribute(
      "instancePalette0",
      new THREE.InstancedBufferAttribute(this.instancePalette0, 3)
    );
    geo.setAttribute(
      "instancePalette1",
      new THREE.InstancedBufferAttribute(this.instancePalette1, 3)
    );
    geo.setAttribute(
      "instancePalette2",
      new THREE.InstancedBufferAttribute(this.instancePalette2, 3)
    );
    geo.setAttribute("instanceState", new THREE.InstancedBufferAttribute(this.instanceState, 4));
    geo.setAttribute(
      "instanceAnimation",
      new THREE.InstancedBufferAttribute(this.instanceAnimation, 3)
    );

    // Default state: collapsed, full opacity
    for (let i = 0; i < count; i++) {
      this.instanceState[i * 4 + 0] = 1.0; // opacity
      this.instanceState[i * 4 + 1] = 1.0; // scale
      this.instanceState[i * 4 + 2] = 1.0; // visualState (collapsed)
      this.instanceState[i * 4 + 3] = 0.0; // transitionProgress
    }

    // Set dummy instance matrices (shader handles positioning via attributes)
    const dummy = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      this.mesh.setMatrixAt(i, dummy);
    }
    this.mesh.instanceMatrix.needsUpdate = true;

    this.scene.add(this.mesh);
  }

  /**
   * Update a single instance's visual data.
   */
  updateInstance(index: number, data: InstanceData): void {
    if (index >= this.instanceCount || !this.mesh) return;

    // Pattern → atlas
    const entry = this.atlas.getOrAddPattern(data.patternId, data.pattern);
    const uv = entry.uvBounds;
    this.instanceUVBounds[index * 4 + 0] = uv[0];
    this.instanceUVBounds[index * 4 + 1] = uv[1];
    this.instanceUVBounds[index * 4 + 2] = uv[2];
    this.instanceUVBounds[index * 4 + 3] = uv[3];

    // Palette → RGB
    const c0 = new THREE.Color(data.palette[0] || "#888");
    const c1 = new THREE.Color(data.palette[1] || data.palette[0] || "#888");
    const c2 = new THREE.Color(data.palette[2] || data.palette[1] || data.palette[0] || "#888");
    this.instancePalette0[index * 3 + 0] = c0.r;
    this.instancePalette0[index * 3 + 1] = c0.g;
    this.instancePalette0[index * 3 + 2] = c0.b;
    this.instancePalette1[index * 3 + 0] = c1.r;
    this.instancePalette1[index * 3 + 1] = c1.g;
    this.instancePalette1[index * 3 + 2] = c1.b;
    this.instancePalette2[index * 3 + 0] = c2.r;
    this.instancePalette2[index * 3 + 1] = c2.g;
    this.instancePalette2[index * 3 + 2] = c2.b;

    // Position
    const px = data.position?.x ?? 0;
    const py = data.position?.y ?? 0;
    this.instancePositions[index * 3 + 0] = px;
    this.instancePositions[index * 3 + 1] = py;
    this.instancePositions[index * 3 + 2] = 0;

    // State
    this.instanceState[index * 4 + 0] = data.opacity ?? 1.0;
    this.instanceState[index * 4 + 1] = data.scale ?? 1.0;
    this.instanceState[index * 4 + 2] = data.visualState ?? 1.0; // 1.0 = collapsed
    this.instanceState[index * 4 + 3] = 0.0; // transitionProgress

    // Animation
    this.instanceAnimation[index * 3 + 0] = data.shimmerPhase ?? 0.0;
    this.instanceAnimation[index * 3 + 1] = data.lifecycleProgress ?? 0.0;
    this.instanceAnimation[index * 3 + 2] = 0.0; // colorTransition

    // Mark buffers dirty
    this.markBuffersDirty();
  }

  /**
   * Mark all instance buffer attributes as needing GPU upload.
   */
  private markBuffersDirty(): void {
    if (!this.mesh) return;
    const geo = this.mesh.geometry;
    const attrs = [
      "instancePosition",
      "instanceUVBounds",
      "instancePalette0",
      "instancePalette1",
      "instancePalette2",
      "instanceState",
      "instanceAnimation",
    ];
    for (const name of attrs) {
      const attr = geo.getAttribute(name) as THREE.InstancedBufferAttribute | undefined;
      if (attr) attr.needsUpdate = true;
    }
  }

  /**
   * Update the texture atlas reference on the material (needed after atlas grows).
   */
  updateAtlasTexture(): void {
    if (this.material.uniforms.u_patternAtlas) {
      this.material.uniforms.u_patternAtlas.value = this.atlas.getTexture();
    }
  }

  /**
   * Show/hide the pixel plant mesh.
   */
  setPixelMeshVisible(visible: boolean): void {
    if (this.mesh) this.mesh.visible = visible;
  }

  /**
   * Show/hide the vector plant group.
   */
  setVectorGroupVisible(visible: boolean): void {
    this.vectorGroup.visible = visible;
  }

  /**
   * Show/hide the watercolor plant group.
   */
  setWatercolorGroupVisible(visible: boolean): void {
    this.watercolorGroup.visible = visible;
  }

  // ===== Watercolor Plant Rendering =====

  /**
   * Render a watercolor variant at the given lifecycle state.
   * Uses the same rendering pipeline as the main garden's WatercolorPlantOverlay.
   */
  updateWatercolorPlant(
    variant: PlantVariant,
    lifecycleState: ComputedLifecycleState,
    colorVariationName: string | null,
    plantId: string = "preview"
  ): void {
    this.clearWatercolorGroup();

    const config = variant.watercolorConfig;
    if (!config) return;

    const ctx: WatercolorBuildContext = {
      keyframeName: lifecycleState.currentKeyframe.name,
      keyframeProgress: lifecycleState.keyframeProgress,
      totalProgress: lifecycleState.totalProgress,
      traits: null,
      seed: hashString(plantId),
      colorVariationName,
      circuitType: null,
    };

    const elements = config.buildElements(ctx);
    const rng = createSeededRng(hashString(plantId + "-wc"));

    for (const element of elements) {
      const elementGroup = renderWatercolorElement(
        element,
        config.wcEffect,
        rng,
        this.watercolorMaterialPool
      );
      this.watercolorGroup.add(elementGroup);
    }
  }

  private clearWatercolorGroup(): void {
    while (this.watercolorGroup.children.length > 0) {
      const child = this.watercolorGroup.children[0];
      if (child) {
        this.watercolorGroup.remove(child);
        this.disposeWatercolorObject(child);
      }
    }
  }

  private disposeWatercolorObject(obj: THREE.Object3D): void {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
    }
    if (obj instanceof THREE.Group) {
      for (const child of [...obj.children]) {
        this.disposeWatercolorObject(child);
      }
    }
  }

  // ===== Vector Plant Rendering =====

  /**
   * Render a vector keyframe into the vector group.
   */
  updateVectorPlant(
    keyframe: VectorKeyframe | InterpolatedVectorKeyframe,
    scale: number = 1.0
  ): void {
    this.clearVectorGroup();

    const drawFractions = isInterpolatedVectorKeyframe(keyframe)
      ? keyframe.drawFractions
      : undefined;

    const fillColor = keyframe.fillColor;
    const fillOpacity = keyframe.fillOpacity ?? VECTOR_CONFIG.DEFAULT_FILL_OPACITY;
    const outlineColor = keyframe.outlineColor ?? VECTOR_CONFIG.DEFAULT_OUTLINE_COLOR;

    // First pass: fills
    if (fillColor) {
      for (let i = 0; i < keyframe.primitives.length; i++) {
        const primitive = keyframe.primitives[i];
        if (!primitive) continue;
        const drawFraction = drawFractions?.[i] ?? 1;
        if (drawFraction <= 0) continue;

        const isOpenPath =
          primitive.type === "line" || primitive.type === "bezier" || primitive.type === "spiral";
        const hasExplicitFill = "fill" in primitive && primitive.fill === true;
        const hasExplicitNoFill = "fill" in primitive && primitive.fill === false;
        const shouldFill = !isOpenPath && (hasExplicitFill || !hasExplicitNoFill);
        if (!shouldFill) continue;

        const opacity = fillOpacity * Math.min(1, drawFraction * 2);
        const material = this.getPooledFillMaterial(fillColor, opacity);
        const mesh = createPrimitiveFill(primitive, material);
        if (mesh) {
          mesh.position.z = 0;
          this.vectorGroup.add(mesh);
        }
      }
    }

    // Second pass: outlines
    for (let i = 0; i < keyframe.primitives.length; i++) {
      const primitive = keyframe.primitives[i];
      if (!primitive) continue;
      const drawFraction = drawFractions?.[i] ?? 1;
      if (drawFraction <= 0) continue;

      const isFilledShape =
        primitive.type !== "line" &&
        primitive.type !== "bezier" &&
        primitive.type !== "spiral" &&
        !("fill" in primitive && primitive.fill === false);
      const useOutlineColor = fillColor && isFilledShape;
      const lineColor = useOutlineColor ? outlineColor : keyframe.strokeColor;
      const opacity = keyframe.strokeOpacity * Math.min(1, drawFraction * 2);
      const material = this.getPooledLineMaterial(lineColor, opacity);

      const lineObject = createPrimitiveGeometry(primitive, material, drawFraction);
      if (lineObject) {
        lineObject.position.z = VECTOR_CONFIG.OUTLINE_Z_OFFSET;
        this.vectorGroup.add(lineObject);
      }
    }

    this.vectorGroup.scale.set(scale, scale, 1);
    this.vectorGroup.position.set(0, 0, 0);
  }

  private clearVectorGroup(): void {
    while (this.vectorGroup.children.length > 0) {
      const child = this.vectorGroup.children[0];
      if (child) {
        this.vectorGroup.remove(child);
        if (
          child instanceof THREE.Line ||
          child instanceof THREE.LineLoop ||
          child instanceof THREE.Mesh
        ) {
          child.geometry.dispose();
        }
      }
    }
  }

  private getPooledLineMaterial(color: string, opacity: number): THREE.LineBasicMaterial {
    const roundedOpacity = Math.round(opacity * 100) / 100;
    const key = `${color}-${roundedOpacity}`;
    let mat = this.lineMaterialPool.get(key);
    if (!mat) {
      mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: roundedOpacity,
      });
      this.lineMaterialPool.set(key, mat);
    }
    return mat;
  }

  private getPooledFillMaterial(color: string, opacity: number): THREE.MeshBasicMaterial {
    const roundedOpacity = Math.round(opacity * 100) / 100;
    const key = `fill-${color}-${roundedOpacity}`;
    let mat = this.fillMaterialPool.get(key);
    if (!mat) {
      mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: roundedOpacity,
        side: THREE.DoubleSide,
      });
      this.fillMaterialPool.set(key, mat);
    }
    return mat;
  }

  // ===== Background & Grid =====

  setBackground(bg: Background): void {
    if (bg === this.currentBackground) return;
    this.currentBackground = bg;

    if (bg === "checkerboard") {
      this.backgroundQuad.material = this.checkerMaterial;
    } else {
      this.backgroundMaterial.color.setHex(BACKGROUND_COLORS[bg]);
      this.backgroundQuad.material = this.backgroundMaterial;
    }
  }

  setGrid(show: boolean, gridSize: number = PATTERN_SIZE): void {
    if (show && !this.gridOverlay) {
      this.gridOverlay = createGridOverlay(gridSize);
      this.scene.add(this.gridOverlay);
    }
    if (this.gridOverlay) {
      this.gridOverlay.visible = show;
    }
  }

  // ===== Post-Processing =====

  setPostProcessing(enabled: boolean): void {
    if (enabled === this.postProcessingEnabled) return;
    this.postProcessingEnabled = enabled;

    if (enabled && !this.composer) {
      const size = this.renderer.getSize(new THREE.Vector2());
      this.setupPostProcessing(size.x, size.y);
    }
  }

  // ===== Camera =====

  /**
   * Set the camera frustum to show a specific world-space region.
   * Used by glyph-canvas to show a grid layout larger than 64x64.
   */
  setCameraFrustum(left: number, right: number, top: number, bottom: number): void {
    this.camera.left = left;
    this.camera.right = right;
    this.camera.top = top;
    this.camera.bottom = bottom;
    this.camera.updateProjectionMatrix();
  }

  // ===== Time & Render =====

  updateTime(time: number): void {
    updatePlantMaterialTime(this.material, time);
  }

  render(): void {
    this.updateAtlasTexture();

    if (this.postProcessingEnabled && this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  resize(width: number, height: number): void {
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    this.renderer.setSize(width, height);

    if (this.composer) {
      this.composer.setSize(width, height);
      if (this.paperPass) {
        (this.paperPass.uniforms["resolution"]!.value as THREE.Vector2).set(
          width * dpr,
          height * dpr
        );
      }
    }

    // Update camera to maintain aspect ratio
    const aspect = width / height;
    if (aspect >= 1) {
      this.camera.left = -this.frustumHalfSize * aspect;
      this.camera.right = this.frustumHalfSize * aspect;
      this.camera.top = -this.frustumHalfSize;
      this.camera.bottom = this.frustumHalfSize;
    } else {
      this.camera.left = -this.frustumHalfSize;
      this.camera.right = this.frustumHalfSize;
      this.camera.top = -this.frustumHalfSize / aspect;
      this.camera.bottom = this.frustumHalfSize / aspect;
    }
    this.camera.updateProjectionMatrix();
  }

  toDataURL(): string {
    this.render();
    return this.renderer.domElement.toDataURL();
  }

  getCanvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  dispose(): void {
    // Remove canvas from DOM
    this.renderer.domElement.parentElement?.removeChild(this.renderer.domElement);

    // Dispose mesh
    if (this.mesh) {
      this.mesh.dispose();
    }
    this.geometry.dispose();
    this.material.dispose();

    // Dispose background
    this.backgroundQuad.geometry.dispose();
    this.backgroundMaterial.dispose();
    this.checkerMaterial.dispose();

    // Dispose grid
    if (this.gridOverlay) {
      this.gridOverlay.geometry.dispose();
      (this.gridOverlay.material as THREE.LineBasicMaterial).dispose();
    }

    // Dispose vector
    this.clearVectorGroup();
    for (const mat of this.lineMaterialPool.values()) mat.dispose();
    for (const mat of this.fillMaterialPool.values()) mat.dispose();
    this.lineMaterialPool.clear();
    this.fillMaterialPool.clear();

    // Dispose watercolor
    this.clearWatercolorGroup();
    for (const mat of this.watercolorMaterialPool.values()) mat.dispose();
    this.watercolorMaterialPool.clear();

    // Dispose composer
    if (this.composer) {
      this.composer.dispose();
    }

    // Dispose renderer
    this.renderer.dispose();
  }
}

// ===== Grid Overlay =====

function createGridOverlay(gridSize: number): THREE.LineSegments {
  const halfSize = gridSize / 2;
  const vertices: number[] = [];

  // Vertical lines
  for (let x = 0; x <= gridSize; x++) {
    const xPos = x - halfSize;
    vertices.push(xPos, -halfSize, 0, xPos, halfSize, 0);
  }
  // Horizontal lines
  for (let y = 0; y <= gridSize; y++) {
    const yPos = y - halfSize;
    vertices.push(-halfSize, yPos, 0, halfSize, yPos, 0);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

  const material = new THREE.LineBasicMaterial({
    color: 0x888888,
    transparent: true,
    opacity: 0.5,
  });

  const lines = new THREE.LineSegments(geometry, material);
  lines.position.z = 1;
  lines.renderOrder = 10;
  return lines;
}

// ===== Vector Primitive Geometry Builders =====
// Adapted from VectorPlantOverlay — all coordinates centered at origin (cx-32, cy-32)

function createPrimitiveGeometry(
  primitive: VectorPrimitive,
  material: THREE.LineBasicMaterial,
  drawFraction: number = 1
): THREE.Line | THREE.LineLoop | null {
  switch (primitive.type) {
    case "circle":
      return createCircle(primitive.cx, primitive.cy, primitive.radius, material, drawFraction);
    case "line":
      return createLineGeom(
        primitive.x1,
        primitive.y1,
        primitive.x2,
        primitive.y2,
        material,
        drawFraction
      );
    case "polygon":
      return createPolygon(
        primitive.cx,
        primitive.cy,
        primitive.sides,
        primitive.radius,
        primitive.rotation ?? 0,
        material
      );
    case "star":
      return createStar(
        primitive.cx,
        primitive.cy,
        primitive.points,
        primitive.outerRadius,
        primitive.innerRadius,
        primitive.rotation ?? 0,
        material
      );
    case "diamond":
      return createDiamond(primitive.cx, primitive.cy, primitive.width, primitive.height, material);
    case "arc":
      return createArc(
        primitive.cx,
        primitive.cy,
        primitive.radius,
        primitive.startAngle,
        primitive.endAngle,
        material,
        drawFraction
      );
    case "bezier":
      return createBezier(
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
      return createSpiral(
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

function createPrimitiveFill(
  primitive: VectorPrimitive,
  material: THREE.MeshBasicMaterial
): THREE.Mesh | null {
  switch (primitive.type) {
    case "circle": {
      const geo = new THREE.CircleGeometry(primitive.radius, VECTOR_CONFIG.CIRCLE_SEGMENTS);
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(primitive.cx - 32, primitive.cy - 32, 0);
      return mesh;
    }
    case "polygon": {
      const shape = new THREE.Shape();
      const rotRad = ((primitive.rotation ?? 0) * Math.PI) / 180;
      for (let i = 0; i <= primitive.sides; i++) {
        const angle = (i / primitive.sides) * Math.PI * 2 + rotRad;
        const x = Math.cos(angle) * primitive.radius;
        const y = Math.sin(angle) * primitive.radius;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();
      const geo = new THREE.ShapeGeometry(shape);
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(primitive.cx - 32, primitive.cy - 32, 0);
      return mesh;
    }
    case "star": {
      const shape = new THREE.Shape();
      const rotRad = ((primitive.rotation ?? 0) * Math.PI) / 180;
      const totalPoints = primitive.points * 2;
      for (let i = 0; i <= totalPoints; i++) {
        const angle = (i / totalPoints) * Math.PI * 2 + rotRad;
        const radius = i % 2 === 0 ? primitive.outerRadius : primitive.innerRadius;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();
      const geo = new THREE.ShapeGeometry(shape);
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(primitive.cx - 32, primitive.cy - 32, 0);
      return mesh;
    }
    case "diamond": {
      const halfW = primitive.width / 2;
      const halfH = primitive.height / 2;
      const shape = new THREE.Shape();
      shape.moveTo(0, halfH);
      shape.lineTo(halfW, 0);
      shape.lineTo(0, -halfH);
      shape.lineTo(-halfW, 0);
      shape.closePath();
      const geo = new THREE.ShapeGeometry(shape);
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(primitive.cx - 32, primitive.cy - 32, 0);
      return mesh;
    }
    case "arc": {
      const startRad = (primitive.startAngle * Math.PI) / 180;
      const endRad = (primitive.endAngle * Math.PI) / 180;
      const totalAngle = endRad - startRad;
      const segments = Math.max(
        8,
        Math.ceil((Math.abs(totalAngle) / (Math.PI * 2)) * VECTOR_CONFIG.CIRCLE_SEGMENTS)
      );
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = startRad + totalAngle * t;
        shape.lineTo(Math.cos(angle) * primitive.radius, Math.sin(angle) * primitive.radius);
      }
      shape.closePath();
      const geo = new THREE.ShapeGeometry(shape);
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(primitive.cx - 32, primitive.cy - 32, 0);
      return mesh;
    }
    default:
      return null;
  }
}

function createCircle(
  cx: number,
  cy: number,
  radius: number,
  material: THREE.LineBasicMaterial,
  drawFraction: number
): THREE.LineLoop | THREE.Line {
  const vertices: number[] = [];
  const segments = VECTOR_CONFIG.CIRCLE_SEGMENTS;
  const segmentsToDraw = Math.ceil(segments * Math.max(0, Math.min(1, drawFraction)));

  for (let i = 0; i <= segmentsToDraw; i++) {
    const angle = (i / segments) * Math.PI * 2;
    vertices.push(cx - 32 + Math.cos(angle) * radius, cy - 32 + Math.sin(angle) * radius, 0);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  return drawFraction < 1 ? new THREE.Line(geo, material) : new THREE.LineLoop(geo, material);
}

function createLineGeom(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  material: THREE.LineBasicMaterial,
  drawFraction: number
): THREE.Line {
  const f = Math.max(0, Math.min(1, drawFraction));
  const ax2 = x1 + (x2 - x1) * f;
  const ay2 = y1 + (y2 - y1) * f;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([x1 - 32, y1 - 32, 0, ax2 - 32, ay2 - 32, 0], 3)
  );
  return new THREE.Line(geo, material);
}

function createPolygon(
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
    vertices.push(cx - 32 + Math.cos(angle) * radius, cy - 32 + Math.sin(angle) * radius, 0);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  return new THREE.LineLoop(geo, material);
}

function createStar(
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
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    vertices.push(cx - 32 + Math.cos(angle) * r, cy - 32 + Math.sin(angle) * r, 0);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  return new THREE.LineLoop(geo, material);
}

function createDiamond(
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
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        centerX,
        centerY - halfH,
        0,
        centerX + halfW,
        centerY,
        0,
        centerX,
        centerY + halfH,
        0,
        centerX - halfW,
        centerY,
        0,
        centerX,
        centerY - halfH,
        0,
      ],
      3
    )
  );
  return new THREE.LineLoop(geo, material);
}

function createArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  material: THREE.LineBasicMaterial,
  drawFraction: number
): THREE.Line {
  const vertices: number[] = [];
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const totalAngle = endRad - startRad;
  const segments = Math.max(
    8,
    Math.ceil((Math.abs(totalAngle) / (Math.PI * 2)) * VECTOR_CONFIG.CIRCLE_SEGMENTS)
  );
  const segmentsToDraw = Math.ceil(segments * Math.max(0, Math.min(1, drawFraction)));

  for (let i = 0; i <= segmentsToDraw; i++) {
    const t = i / segments;
    const angle = startRad + totalAngle * t;
    vertices.push(cx - 32 + Math.cos(angle) * radius, cy - 32 + Math.sin(angle) * radius, 0);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  return new THREE.Line(geo, material);
}

function createBezier(
  x1: number,
  y1: number,
  cx1: number,
  cy1: number,
  cx2: number,
  cy2: number,
  x2: number,
  y2: number,
  material: THREE.LineBasicMaterial,
  drawFraction: number
): THREE.Line {
  const vertices: number[] = [];
  const segments = VECTOR_CONFIG.BEZIER_SEGMENTS;
  const segmentsToDraw = Math.ceil(segments * Math.max(0, Math.min(1, drawFraction)));

  for (let i = 0; i <= segmentsToDraw; i++) {
    const t = i / segments;
    const omt = 1 - t;
    const omt2 = omt * omt;
    const omt3 = omt2 * omt;
    const t2 = t * t;
    const t3 = t2 * t;

    const x = omt3 * x1 + 3 * omt2 * t * cx1 + 3 * omt * t2 * cx2 + t3 * x2;
    const y = omt3 * y1 + 3 * omt2 * t * cy1 + 3 * omt * t2 * cy2 + t3 * y2;
    vertices.push(x - 32, y - 32, 0);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  return new THREE.Line(geo, material);
}

function createSpiral(
  cx: number,
  cy: number,
  startRadius: number,
  endRadius: number,
  turns: number,
  startAngle: number,
  material: THREE.LineBasicMaterial,
  drawFraction: number
): THREE.Line {
  const vertices: number[] = [];
  const startRad = (startAngle * Math.PI) / 180;
  const totalAngle = turns * Math.PI * 2;
  const segments = Math.ceil(turns * VECTOR_CONFIG.SPIRAL_SEGMENTS_PER_TURN);
  const segmentsToDraw = Math.ceil(segments * Math.max(0, Math.min(1, drawFraction)));

  for (let i = 0; i <= segmentsToDraw; i++) {
    const t = i / segments;
    const angle = startRad + totalAngle * t;
    const radius = startRadius + (endRadius - startRadius) * t;
    vertices.push(cx - 32 + Math.cos(angle) * radius, cy - 32 + Math.sin(angle) * radius, 0);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  return new THREE.Line(geo, material);
}
