/**
 * Plant Material - Custom ShaderMaterial for rendering plants
 *
 * Handles:
 * - Per-instance positioning, scale, and opacity
 * - Pattern sampling from texture atlas
 * - Distance-based palette gradient coloring
 * - Shimmer effect for superposed state
 * - Collapse transition animation
 */

import * as THREE from "three";
import { PATTERN_SIZE } from "@quantum-garden/shared";

/**
 * Vertex shader for plant rendering.
 *
 * Uses instanced attributes for per-plant transforms and animation state.
 */
const vertexShader = /* glsl */ `
  precision highp float;

  // Per-instance attributes
  attribute vec3 instancePosition;     // x, y, z (z for layer ordering)
  attribute vec4 instanceUVBounds;     // UV bounds in atlas: u, v, width, height
  attribute vec3 instancePalette0;     // First palette color (RGB)
  attribute vec3 instancePalette1;     // Second palette color (RGB)
  attribute vec3 instancePalette2;     // Third palette color (RGB)
  attribute vec4 instanceState;        // opacity, scale, visualState (0=superposed, 1=collapsed), transitionProgress
  attribute vec2 instanceAnimation;    // shimmerPhase, lifecycleProgress

  // Uniforms
  uniform float u_time;
  uniform float u_patternSize;

  // Varyings to fragment shader
  varying vec2 v_uv;
  varying vec4 v_uvBounds;
  varying vec3 v_palette0;
  varying vec3 v_palette1;
  varying vec3 v_palette2;
  varying float v_opacity;
  varying float v_visualState;
  varying float v_transitionProgress;
  varying float v_shimmerPhase;
  varying float v_lifecycleProgress;

  void main() {
    // Pass attributes to fragment shader
    v_uvBounds = instanceUVBounds;
    v_palette0 = instancePalette0;
    v_palette1 = instancePalette1;
    v_palette2 = instancePalette2;
    v_opacity = instanceState.x;
    float baseScale = instanceState.y;
    v_visualState = instanceState.z;
    v_transitionProgress = instanceState.w;
    v_shimmerPhase = instanceAnimation.x;
    v_lifecycleProgress = instanceAnimation.y;

    // Calculate scale with transition pulse effect
    // Peak at 50% transition progress, returns to 1.0 at completion
    float scalePulse = 1.0;
    if (v_transitionProgress > 0.0 && v_transitionProgress < 1.0) {
      // Ease-out cubic for smoother transition
      float eased = 1.0 - pow(1.0 - v_transitionProgress, 3.0);
      scalePulse = 1.0 + sin(eased * 3.14159) * 0.12;
    }

    // Apply lifecycle-based animations (only if lifecycle has started)
    float lifecycleScale = 1.0;
    float lifecycleRotation = 0.0;

    if (v_lifecycleProgress > 0.0) {
      // Young plants (lifecycle < 0.3): gentle scale pulse (0.98-1.02, 3s cycle)
      if (v_lifecycleProgress < 0.3) {
        lifecycleScale = 1.0 + sin(u_time * 2.094) * 0.02; // 2.094 = 2π/3 for 3s cycle
      }
      // Mature plants (lifecycle 0.3-0.7): subtle rotation sway (±2 degrees, 5s cycle)
      else if (v_lifecycleProgress < 0.7) {
        lifecycleRotation = sin(u_time * 1.257) * 0.0349; // 1.257 = 2π/5 for 5s cycle, 0.0349 = 2° in radians
      }
      // Old plants (lifecycle > 0.7): slower movements
      else {
        lifecycleScale = 1.0 + sin(u_time * 0.628) * 0.015; // 0.628 = 2π/10 for 10s cycle, smaller amplitude
      }
    }

    float finalScale = baseScale * scalePulse * lifecycleScale;

    // Transform position with rotation
    // position is the local quad vertex (-0.5 to 0.5 range)
    vec3 scaled = position * u_patternSize * finalScale;

    // Apply rotation if mature plant
    if (lifecycleRotation != 0.0) {
      float cosR = cos(lifecycleRotation);
      float sinR = sin(lifecycleRotation);
      float x = scaled.x * cosR - scaled.y * sinR;
      float y = scaled.x * sinR + scaled.y * cosR;
      scaled.x = x;
      scaled.y = y;
    }

    vec3 worldPos = scaled + instancePosition;

    // Pass UV coordinates (0-1 range on quad)
    v_uv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
  }
`;

/**
 * Fragment shader for plant rendering.
 *
 * Samples the pattern atlas and applies palette coloring with gradient effect.
 */
const fragmentShader = /* glsl */ `
  precision highp float;

  // Uniforms
  uniform sampler2D u_patternAtlas;
  uniform float u_time;

  // Varyings from vertex shader
  varying vec2 v_uv;
  varying vec4 v_uvBounds;
  varying vec3 v_palette0;
  varying vec3 v_palette1;
  varying vec3 v_palette2;
  varying float v_opacity;
  varying float v_visualState;
  varying float v_transitionProgress;
  varying float v_shimmerPhase;
  varying float v_lifecycleProgress;

  void main() {
    // Calculate UV position within the pattern in the atlas
    vec2 atlasUV = v_uvBounds.xy + v_uv * v_uvBounds.zw;

    // Sample pattern from atlas (R channel = filled/empty)
    float patternValue = texture2D(u_patternAtlas, atlasUV).r;

    // If pixel is empty, discard
    if (patternValue < 0.5) {
      discard;
    }

    // Calculate distance from center for gradient coloring
    vec2 centerOffset = v_uv - 0.5;
    float distFromCenter = length(centerOffset);
    float maxDist = 0.707; // sqrt(0.5^2 + 0.5^2) = diagonal

    // Map distance to palette index (0-1 range)
    float paletteT = distFromCenter / maxDist;

    // Interpolate between palette colors based on distance
    vec3 color;
    if (paletteT < 0.5) {
      color = mix(v_palette0, v_palette1, paletteT * 2.0);
    } else {
      color = mix(v_palette1, v_palette2, (paletteT - 0.5) * 2.0);
    }

    // Calculate final opacity based on visual state
    float finalOpacity = v_opacity;

    // Shimmer effect for superposed state
    if (v_visualState < 0.5) {
      // Superposed: apply shimmer
      float shimmer = sin(u_time * 1.5 + v_shimmerPhase) * 0.08;
      finalOpacity = max(0.15, finalOpacity + shimmer);
    } else if (v_transitionProgress > 0.0 && v_transitionProgress < 1.0) {
      // During transition: smooth fade
      float eased = 1.0 - pow(1.0 - v_transitionProgress, 3.0);
      finalOpacity *= eased;
    }

    // Apply lifecycle opacity variance for old plants
    if (v_lifecycleProgress > 0.7) {
      // Old plants: subtle opacity variation (slower than shimmer)
      float opacityVariance = sin(u_time * 0.8 + v_shimmerPhase) * 0.05;
      finalOpacity = clamp(finalOpacity + opacityVariance, 0.15, 1.0);
    }

    gl_FragColor = vec4(color, finalOpacity);
  }
`;

/**
 * Create a custom ShaderMaterial for plant rendering.
 *
 * @param atlasTexture - The pattern texture atlas
 * @returns Configured ShaderMaterial
 */
export function createPlantMaterial(atlasTexture: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      u_patternAtlas: { value: atlasTexture },
      u_time: { value: 0 },
      u_patternSize: { value: PATTERN_SIZE },
    },
    transparent: true,
    depthWrite: false, // Important for proper transparency blending
    depthTest: true,
    side: THREE.DoubleSide,
  });
}

/**
 * Update the time uniform for animations.
 */
export function updatePlantMaterialTime(material: THREE.ShaderMaterial, time: number): void {
  if (material.uniforms.u_time) {
    material.uniforms.u_time.value = time;
  }
}
