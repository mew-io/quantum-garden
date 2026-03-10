/**
 * Shared Watercolor Rendering Utilities
 *
 * Shape builders, watercolor layering, seeded PRNG, and material pooling
 * used by both WatercolorPlantOverlay (main garden) and SandboxThreeRenderer.
 */

import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type {
  WatercolorElement,
  WatercolorEffect,
  WatercolorShapeDef,
} from "@quantum-garden/shared";

export const WATERCOLOR_RENDER_CONFIG = {
  CIRCLE_SEGMENTS: 24,
  SHAPE_SEGMENTS: 16,
  TUBE_RADIAL_SEGMENTS: 6,
  TUBE_TUBULAR_SEGMENTS: 32,
};

// =============================================================================
// Seeded PRNG
// =============================================================================

export function createSeededRng(seed: number) {
  let s = seed & 0x7fffffff;
  if (s === 0) s = 1;
  return {
    next(): number {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    },
    range(lo: number, hi: number): number {
      s = (s * 16807) % 2147483647;
      return lo + ((s - 1) / 2147483646) * (hi - lo);
    },
  };
}

export type SeededRng = ReturnType<typeof createSeededRng>;

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) || 1;
}

// =============================================================================
// Shape Builders
// =============================================================================

export function buildShape(def: WatercolorShapeDef): THREE.Shape | null {
  switch (def.type) {
    case "petal":
      return buildPetalShape(def.width, def.length, def.roundness);
    case "leaf":
      return buildLeafShape(def.width, def.length);
    case "disc":
      return buildDiscShape(def.radius);
    case "dot":
      return buildDiscShape(def.radius);
    case "stem":
      return null;
  }
}

function buildPetalShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(w * r, h * 0.12, w * 1.08, h * 0.52, 0, h);
  s.bezierCurveTo(-w * 1.08, h * 0.52, -w * r, h * 0.12, 0, 0);
  return s;
}

function buildLeafShape(w: number, h: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(w * 0.6, h * 0.22, w * 0.32, h * 0.72, 0, h);
  s.bezierCurveTo(-w * 0.32, h * 0.72, -w * 0.6, h * 0.22, 0, 0);
  return s;
}

function buildDiscShape(radius: number): THREE.Shape {
  const s = new THREE.Shape();
  s.absarc(0, 0, radius, 0, Math.PI * 2, false);
  return s;
}

// =============================================================================
// Watercolor Layering
// =============================================================================

export function createWatercolorLayers(
  shape: THREE.Shape,
  baseColor: string,
  effect: WatercolorEffect,
  elementOpacity: number | undefined,
  zBase: number,
  rng: SeededRng,
  materialPool: Map<string, THREE.MeshBasicMaterial>
): THREE.Group {
  const g = new THREE.Group();
  const n = effect.layers;
  const baseOp = elementOpacity ?? effect.opacity;

  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) : 0.5;

    const c = new THREE.Color(baseColor);
    const hsl = { h: 0, s: 0, l: 0 };
    c.getHSL(hsl);
    hsl.h += (rng.next() - 0.5) * effect.colorVariation;
    hsl.s = THREE.MathUtils.clamp(hsl.s + (rng.next() - 0.5) * effect.colorVariation, 0, 1);
    hsl.l = THREE.MathUtils.clamp(hsl.l + (rng.next() - 0.5) * effect.colorVariation * 1.5, 0, 1);
    c.setHSL(hsl.h, hsl.s, hsl.l);

    const scale = 1.0 + (1.0 - t) * effect.spread * 4;
    const op = baseOp * (0.18 + 0.82 * t);

    const geo = new THREE.ShapeGeometry(shape, WATERCOLOR_RENDER_CONFIG.SHAPE_SEGMENTS);
    const mat = getPooledMaterial(materialPool, "#" + c.getHexString(), op);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = (rng.next() - 0.5) * effect.spread * 0.5;
    mesh.position.y = (rng.next() - 0.5) * effect.spread * 0.5;
    mesh.position.z = zBase + i * 0.002;
    mesh.scale.set(scale, scale, 1);

    g.add(mesh);
  }
  return g;
}

export function createStemLayers(
  points: [number, number][],
  thickness: number,
  color: string,
  effect: WatercolorEffect,
  elementOpacity: number | undefined,
  zBase: number,
  rng: SeededRng,
  materialPool: Map<string, THREE.MeshBasicMaterial>
): THREE.Group {
  const g = new THREE.Group();
  const n = Math.min(effect.layers, 3);
  const baseOp = elementOpacity ?? effect.opacity;

  const curvePoints = points.map((p) => new THREE.Vector3(p[0], p[1], 0));

  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) : 0.5;

    const c = new THREE.Color(color);
    const hsl = { h: 0, s: 0, l: 0 };
    c.getHSL(hsl);
    hsl.h += (rng.next() - 0.5) * effect.colorVariation * 0.5;
    hsl.s = THREE.MathUtils.clamp(hsl.s + (rng.next() - 0.5) * effect.colorVariation * 0.5, 0, 1);
    c.setHSL(hsl.h, hsl.s, hsl.l);

    const thicknessScale = 1.0 + (1.0 - t) * effect.spread * 2;
    const op = baseOp * (0.3 + 0.7 * t);

    const offsetPoints = curvePoints.map(
      (p) =>
        new THREE.Vector3(
          p.x + (rng.next() - 0.5) * effect.spread * 0.3,
          p.y + (rng.next() - 0.5) * effect.spread * 0.3,
          0
        )
    );

    const curve = new THREE.CatmullRomCurve3(offsetPoints, false, "catmullrom", 0.5);
    const geo = new THREE.TubeGeometry(
      curve,
      WATERCOLOR_RENDER_CONFIG.TUBE_TUBULAR_SEGMENTS,
      thickness * thicknessScale,
      WATERCOLOR_RENDER_CONFIG.TUBE_RADIAL_SEGMENTS,
      false
    );
    const mat = getPooledMaterial(materialPool, "#" + c.getHexString(), op);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.z = zBase + i * 0.002;
    g.add(mesh);
  }
  return g;
}

// =============================================================================
// Material Pool
// =============================================================================

export function getPooledMaterial(
  pool: Map<string, THREE.MeshBasicMaterial>,
  color: string,
  opacity: number
): THREE.MeshBasicMaterial {
  const roundedOpacity = Math.round(opacity * 50) / 50;
  const key = `${color}-${roundedOpacity}`;

  let mat = pool.get(key);
  if (!mat) {
    mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: roundedOpacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    pool.set(key, mat);
  }
  return mat;
}

// =============================================================================
// Element Renderer
// =============================================================================

/**
 * Render a single WatercolorElement with the layering effect.
 * Shared between WatercolorPlantOverlay and SandboxThreeRenderer.
 */
export function renderWatercolorElement(
  element: WatercolorElement,
  effect: WatercolorEffect,
  rng: SeededRng,
  materialPool: Map<string, THREE.MeshBasicMaterial>
): THREE.Group {
  const zBase = element.zOffset ?? 0;

  if (element.shape.type === "stem") {
    const stemGroup = createStemLayers(
      element.shape.points,
      element.shape.thickness,
      element.color,
      effect,
      element.opacity,
      zBase,
      rng,
      materialPool
    );
    // Scale around stem centroid, not the group origin (0,0)
    const pts = element.shape.points;
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    stemGroup.position.set(
      element.position.x - 32 + cx * (1 - element.scale),
      element.position.y - 32 + cy * (1 - element.scale),
      0
    );
    stemGroup.scale.set(element.scale, element.scale, 1);
    return stemGroup;
  }

  const shape = buildShape(element.shape);
  if (!shape) {
    return new THREE.Group();
  }

  const layerGroup = createWatercolorLayers(
    shape,
    element.color,
    effect,
    element.opacity,
    zBase,
    rng,
    materialPool
  );

  layerGroup.position.set(element.position.x - 32, element.position.y - 32, 0);
  layerGroup.rotation.z = element.rotation;
  layerGroup.scale.set(element.scale, element.scale, 1);

  return layerGroup;
}

// =============================================================================
// Merged Geometry Rendering (batched draw calls)
// =============================================================================

export function createMergedWatercolorMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_time: { value: 0.0 },
    },
    vertexShader: `
      uniform float u_time;
      attribute vec4 aColor;
      varying vec4 vColor;
      void main() {
        vColor = aColor;

        // Organic sway: use world position (modelMatrix) for per-plant phase variation
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        float phase = worldPos.x * 0.007 + worldPos.y * 0.005;

        // Height factor: roots stay anchored, tips sway most
        // Geometry is baked into group-local space (centered around 0,0)
        // Positive Y = upward = tips, negative Y = downward = roots
        // Use position relative to group origin (the plant's center)
        float heightFactor = max(0.0, -position.y * 0.04);

        // Breathing scale (±0.75%, 4s cycle)
        float breath = 1.0 + sin(u_time * 1.571 + phase) * 0.0075;

        // Gentle sway, modulated by height
        float swayX = sin(u_time * 1.257 + phase * 2.0) * 1.25 * heightFactor;
        float swayY = sin(u_time * 0.943 + phase * 1.5) * 0.5 * heightFactor;

        vec3 pos = position;
        pos.xy *= breath;
        pos.x += swayX;
        pos.y += swayY;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec4 vColor;
      void main() {
        gl_FragColor = vColor;
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

/**
 * Merge all watercolor elements for a plant into a single mesh with vertex colors.
 * Reduces draw calls from N*layers to 1 per plant.
 */
export function mergeWatercolorElements(
  elements: WatercolorElement[],
  effect: WatercolorEffect,
  rng: SeededRng,
  material: THREE.ShaderMaterial
): THREE.Mesh | null {
  const geometries: THREE.BufferGeometry[] = [];
  const matrix = new THREE.Matrix4();
  const tempPos = new THREE.Vector3();
  const tempQuat = new THREE.Quaternion();
  const tempScale = new THREE.Vector3();

  for (const element of elements) {
    const zBase = element.zOffset ?? 0;

    if (element.shape.type === "stem") {
      collectStemGeometries(
        geometries,
        element,
        effect,
        zBase,
        rng,
        matrix,
        tempPos,
        tempQuat,
        tempScale
      );
    } else {
      const shape = buildShape(element.shape);
      if (!shape) continue;
      collectShapeGeometries(
        geometries,
        shape,
        element,
        effect,
        zBase,
        rng,
        matrix,
        tempPos,
        tempQuat,
        tempScale
      );
    }
  }

  if (geometries.length === 0) return null;

  const merged = mergeGeometries(geometries, false);
  if (!merged) return null;

  // Dispose individual geometries
  for (const geo of geometries) geo.dispose();

  return new THREE.Mesh(merged, material);
}

function addVertexColors(geo: THREE.BufferGeometry, color: THREE.Color, opacity: number): void {
  const count = geo.getAttribute("position").count;
  const colors = new Float32Array(count * 4);
  const r = color.r,
    g = color.g,
    b = color.b;
  for (let i = 0; i < count; i++) {
    const i4 = i * 4;
    colors[i4] = r;
    colors[i4 + 1] = g;
    colors[i4 + 2] = b;
    colors[i4 + 3] = opacity;
  }
  geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 4));
}

function stripUnneededAttributes(geo: THREE.BufferGeometry): void {
  geo.deleteAttribute("normal");
  geo.deleteAttribute("uv");
}

function collectShapeGeometries(
  out: THREE.BufferGeometry[],
  shape: THREE.Shape,
  element: WatercolorElement,
  effect: WatercolorEffect,
  zBase: number,
  rng: SeededRng,
  matrix: THREE.Matrix4,
  tempPos: THREE.Vector3,
  tempQuat: THREE.Quaternion,
  tempScale: THREE.Vector3
): void {
  const n = effect.layers;
  const baseOp = element.opacity ?? effect.opacity;

  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) : 0.5;

    const c = new THREE.Color(element.color);
    const hsl = { h: 0, s: 0, l: 0 };
    c.getHSL(hsl);
    hsl.h += (rng.next() - 0.5) * effect.colorVariation;
    hsl.s = THREE.MathUtils.clamp(hsl.s + (rng.next() - 0.5) * effect.colorVariation, 0, 1);
    hsl.l = THREE.MathUtils.clamp(hsl.l + (rng.next() - 0.5) * effect.colorVariation * 1.5, 0, 1);
    c.setHSL(hsl.h, hsl.s, hsl.l);

    const layerScale = 1.0 + (1.0 - t) * effect.spread * 4;
    const op = baseOp * (0.18 + 0.82 * t);
    const jitterX = (rng.next() - 0.5) * effect.spread * 0.5;
    const jitterY = (rng.next() - 0.5) * effect.spread * 0.5;

    const geo = new THREE.ShapeGeometry(shape, WATERCOLOR_RENDER_CONFIG.SHAPE_SEGMENTS);
    stripUnneededAttributes(geo);

    // Compose transform: element position/rotation/scale + layer jitter/scale/z
    const totalScale = element.scale * layerScale;
    tempPos.set(
      element.position.x - 32 + jitterX * element.scale,
      element.position.y - 32 + jitterY * element.scale,
      zBase + i * 0.002
    );
    tempQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), element.rotation);
    tempScale.set(totalScale, totalScale, 1);
    matrix.compose(tempPos, tempQuat, tempScale);
    geo.applyMatrix4(matrix);

    addVertexColors(geo, c, op);
    out.push(geo);
  }
}

function collectStemGeometries(
  out: THREE.BufferGeometry[],
  element: WatercolorElement,
  effect: WatercolorEffect,
  zBase: number,
  rng: SeededRng,
  matrix: THREE.Matrix4,
  tempPos: THREE.Vector3,
  tempQuat: THREE.Quaternion,
  tempScale: THREE.Vector3
): void {
  if (element.shape.type !== "stem") return;
  const points = element.shape.points;
  const thickness = element.shape.thickness;

  const n = Math.min(effect.layers, 3);
  const baseOp = element.opacity ?? effect.opacity;
  const curvePoints = points.map((p) => new THREE.Vector3(p[0], p[1], 0));

  // Stem centroid for scale-around-center
  const cx = points.reduce((s, p) => s + p[0], 0) / points.length;
  const cy = points.reduce((s, p) => s + p[1], 0) / points.length;

  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) : 0.5;

    const c = new THREE.Color(element.color);
    const hsl = { h: 0, s: 0, l: 0 };
    c.getHSL(hsl);
    hsl.h += (rng.next() - 0.5) * effect.colorVariation * 0.5;
    hsl.s = THREE.MathUtils.clamp(hsl.s + (rng.next() - 0.5) * effect.colorVariation * 0.5, 0, 1);
    c.setHSL(hsl.h, hsl.s, hsl.l);

    const thicknessScale = 1.0 + (1.0 - t) * effect.spread * 2;
    const op = baseOp * (0.3 + 0.7 * t);

    const offsetPoints = curvePoints.map(
      (p) =>
        new THREE.Vector3(
          p.x + (rng.next() - 0.5) * effect.spread * 0.3,
          p.y + (rng.next() - 0.5) * effect.spread * 0.3,
          0
        )
    );

    const curve = new THREE.CatmullRomCurve3(offsetPoints, false, "catmullrom", 0.5);
    const geo = new THREE.TubeGeometry(
      curve,
      WATERCOLOR_RENDER_CONFIG.TUBE_TUBULAR_SEGMENTS,
      thickness * thicknessScale,
      WATERCOLOR_RENDER_CONFIG.TUBE_RADIAL_SEGMENTS,
      false
    );
    stripUnneededAttributes(geo);

    // Position: element offset (scale around centroid) + z layer offset
    tempPos.set(
      element.position.x - 32 + cx * (1 - element.scale),
      element.position.y - 32 + cy * (1 - element.scale),
      zBase + i * 0.002
    );
    tempQuat.identity();
    tempScale.set(element.scale, element.scale, 1);
    matrix.compose(tempPos, tempQuat, tempScale);
    geo.applyMatrix4(matrix);

    addVertexColors(geo, c, op);
    out.push(geo);
  }
}
