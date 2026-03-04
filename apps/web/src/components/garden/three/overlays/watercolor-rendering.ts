/**
 * Shared Watercolor Rendering Utilities
 *
 * Shape builders, watercolor layering, seeded PRNG, and material pooling
 * used by both WatercolorPlantOverlay (main garden) and SandboxThreeRenderer.
 */

import * as THREE from "three";
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
