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
  attribute vec3 instanceAnimation;    // shimmerPhase, lifecycleProgress, colorTransition

  // Uniforms
  uniform float u_time;
  uniform float u_patternSize;
  uniform float u_globalPlantScale;
  uniform float u_gardenHeight;

  // Varyings to fragment shader
  varying vec2 v_uv;
  varying vec4 v_uvBounds;
  varying vec3 v_palette0;
  varying vec3 v_palette1;
  varying vec3 v_palette2;
  varying float v_colorTransition;
  varying float v_opacity;
  varying float v_visualState;
  varying float v_transitionProgress;
  varying float v_shimmerPhase;
  varying float v_lifecycleProgress;
  varying float v_depthT; // 0 = top/far, 1 = bottom/near

  void main() {
    // Pass attributes to fragment shader
    v_uvBounds = instanceUVBounds;
    v_palette0 = instancePalette0;
    v_palette1 = instancePalette1;
    v_palette2 = instancePalette2;
    v_colorTransition = instanceAnimation.z;
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

    // Depth factor: 0 at top (far), 1 at bottom (near)
    float depthT = clamp(instancePosition.y / u_gardenHeight, 0.0, 1.0);
    v_depthT = depthT;

    // Depth-based scale: distant plants noticeably smaller
    float depthScale = mix(0.6, 1.0, depthT);

    // Vertical squish: distant plants compressed vertically to simulate
    // looking at a tilted ground plane. Near plants are 1:1, far plants
    // are squished to ~70% vertical height.
    float verticalSquish = mix(0.7, 1.0, depthT);

    float finalScale = baseScale * scalePulse * lifecycleScale * depthScale;

    // Transform position with rotation
    // position is the local quad vertex (-0.5 to 0.5 range)
    vec3 scaled = position * u_patternSize * finalScale * u_globalPlantScale;

    // Apply vertical squish (compress Y relative to plant base)
    // Anchor to bottom of quad so plants appear grounded
    scaled.y *= verticalSquish;
    scaled.y += u_patternSize * finalScale * u_globalPlantScale * 0.5 * (1.0 - verticalSquish);

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
 * Enhanced superposition visualization modes:
 * - Mode 0: Stacked ghosts (multiple offset samples with varying opacity)
 * - Mode 1: Flickering (rapid opacity oscillation simulating quantum uncertainty)
 */
const fragmentShader = /* glsl */ `
  precision highp float;

  // Uniforms
  uniform sampler2D u_patternAtlas;
  uniform float u_time;
  uniform int u_superpositionMode; // 0 = stacked ghosts (default), 1 = flickering

  // Varyings from vertex shader
  varying vec2 v_uv;
  varying vec4 v_uvBounds;
  varying vec3 v_palette0;
  varying vec3 v_palette1;
  varying vec3 v_palette2;
  varying float v_colorTransition;
  varying float v_opacity;
  varying float v_visualState;
  varying float v_transitionProgress;
  varying float v_shimmerPhase;
  varying float v_lifecycleProgress;
  varying float v_depthT; // 0 = top/far, 1 = bottom/near

  // RGB to HSV conversion
  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }

  // HSV to RGB conversion
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  // Smooth ease-in-out cubic easing function
  float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  // Sample pattern with offset (for ghost effect)
  float samplePatternOffset(vec2 uv, vec2 offset) {
    vec2 offsetUV = uv + offset * v_uvBounds.zw;
    vec2 atlasUV = v_uvBounds.xy + offsetUV * v_uvBounds.zw;
    return texture2D(u_patternAtlas, atlasUV).r;
  }

  void main() {
    // Calculate UV position within the pattern in the atlas
    vec2 atlasUV = v_uvBounds.xy + v_uv * v_uvBounds.zw;

    // Sample pattern from atlas (R channel = filled/empty)
    float patternValue = texture2D(u_patternAtlas, atlasUV).r;

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

    // Apply color transition with saturation fade if transitioning
    if (v_colorTransition > 0.0 && v_colorTransition < 1.0) {
      // Apply smooth easing to transition progress
      float easedTransition = easeInOutCubic(v_colorTransition);

      // Convert to HSV for saturation control
      vec3 hsv = rgb2hsv(color);

      // Desaturate in first half (0-0.5), saturate in second half (0.5-1.0)
      // Creates a smooth fade through desaturated colors
      float saturationMultiplier;
      if (easedTransition < 0.5) {
        // Fade out saturation: 1.0 -> 0.3
        saturationMultiplier = mix(1.0, 0.3, easedTransition * 2.0);
      } else {
        // Fade in saturation: 0.3 -> 1.0
        saturationMultiplier = mix(0.3, 1.0, (easedTransition - 0.5) * 2.0);
      }

      hsv.y *= saturationMultiplier;
      color = hsv2rgb(hsv);
    }

    // Calculate final opacity based on visual state
    float finalOpacity = v_opacity;

    // Enhanced superposition visualization
    if (v_visualState < 0.5) {
      // Iridescent hue shift for all superposition modes
      // Creates a subtle rainbow shimmer effect on quantum-uncertain plants
      vec3 hsv = rgb2hsv(color);
      float hueShift = sin(u_time * 0.5 + v_shimmerPhase) * 0.06; // ±6% hue rotation
      hsv.x = fract(hsv.x + hueShift); // Wrap hue around 0-1
      // Slightly boost saturation for more visible iridescence
      hsv.y = min(1.0, hsv.y * 1.15);
      color = hsv2rgb(hsv);

      if (u_superpositionMode == 1) {
        // MODE 1: Flickering - rapid opacity oscillation
        // Multiple frequency shimmer creates unstable, flickering appearance
        float shimmer1 = sin(u_time * 3.0 + v_shimmerPhase) * 0.15;
        float shimmer2 = sin(u_time * 7.0 + v_shimmerPhase * 2.0) * 0.08;
        float shimmer3 = sin(u_time * 13.0 + v_shimmerPhase * 3.0) * 0.05;

        // Occasional "flash" effect (quantum fluctuation)
        float flash = step(0.97, fract(sin(u_time * 0.5 + v_shimmerPhase) * 43758.5453));

        finalOpacity = v_opacity + shimmer1 + shimmer2 + shimmer3 + flash * 0.3;
        finalOpacity = clamp(finalOpacity, 0.1, 0.6);

        // If pixel is empty, discard
        if (patternValue < 0.5) {
          discard;
        }
      } else {
        // MODE 0: Stacked ghosts - sample with offsets for blur/uncertainty effect
        // Create ghost layers at different time-varying offsets
        float angle1 = u_time * 0.5 + v_shimmerPhase;
        float angle2 = u_time * 0.5 + v_shimmerPhase + 2.094; // +120 degrees
        float angle3 = u_time * 0.5 + v_shimmerPhase + 4.189; // +240 degrees

        float ghostRadius = 0.03; // Subtle offset
        vec2 offset1 = vec2(cos(angle1), sin(angle1)) * ghostRadius;
        vec2 offset2 = vec2(cos(angle2), sin(angle2)) * ghostRadius;
        vec2 offset3 = vec2(cos(angle3), sin(angle3)) * ghostRadius;

        // Sample pattern at primary position and ghost offsets
        float ghost1 = samplePatternOffset(v_uv, offset1);
        float ghost2 = samplePatternOffset(v_uv, offset2);
        float ghost3 = samplePatternOffset(v_uv, offset3);

        // Combine: primary pattern + faint ghost layers
        float combinedPattern = patternValue * 0.5 + ghost1 * 0.2 + ghost2 * 0.15 + ghost3 * 0.15;

        // Basic shimmer
        float shimmer = sin(u_time * 1.5 + v_shimmerPhase) * 0.08;
        finalOpacity = v_opacity + shimmer;
        finalOpacity = max(0.15, finalOpacity);

        // Discard if all samples are empty
        if (combinedPattern < 0.3) {
          discard;
        }

        // Adjust opacity based on combined pattern strength
        finalOpacity *= min(1.0, combinedPattern * 1.2);
      }
    } else if (v_transitionProgress > 0.0 && v_transitionProgress < 1.0) {
      // During transition: smooth fade
      float eased = 1.0 - pow(1.0 - v_transitionProgress, 3.0);
      finalOpacity *= eased;

      // If pixel is empty, discard
      if (patternValue < 0.5) {
        discard;
      }
    } else {
      // Collapsed state: standard rendering
      if (patternValue < 0.5) {
        discard;
      }
    }

    // Apply lifecycle opacity variance for old plants
    if (v_lifecycleProgress > 0.7) {
      // Old plants: subtle opacity variation (slower than shimmer)
      float opacityVariance = sin(u_time * 0.8 + v_shimmerPhase) * 0.05;
      finalOpacity = clamp(finalOpacity + opacityVariance, 0.15, 1.0);
    }

    // Atmospheric perspective: distant plants fade toward a hazy tint
    // and lose saturation, simulating aerial haze
    float atmosphereT = 1.0 - v_depthT; // 0 = near, 1 = far
    float atmosphereStrength = atmosphereT * atmosphereT * 0.35; // quadratic falloff, max 35%
    vec3 hazeColor = vec3(0.75, 0.78, 0.82); // soft blue-grey haze
    color = mix(color, hazeColor, atmosphereStrength);

    // Desaturate distant plants slightly
    vec3 atmosHSV = rgb2hsv(color);
    atmosHSV.y *= mix(0.55, 1.0, v_depthT); // far plants lose ~45% saturation
    color = hsv2rgb(atmosHSV);

    gl_FragColor = vec4(color, finalOpacity);

    // Discard near-transparent pixels so they don't write to depth buffer
    if (gl_FragColor.a < 0.1) {
      discard;
    }
  }
`;

/**
 * Superposition visualization modes.
 * 0 = Stacked ghosts (default): Multiple offset samples create blur/uncertainty
 * 1 = Flickering: Rapid opacity oscillation simulates quantum fluctuations
 */
export type SuperpositionMode = 0 | 1;

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
      u_globalPlantScale: { value: 1.5 },
      u_superpositionMode: { value: 0 }, // 0 = stacked ghosts (default)
      u_gardenHeight: { value: 2160 },
    },
    transparent: true,
    depthWrite: true,
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

/**
 * Set the superposition visualization mode.
 * @param material - The plant shader material
 * @param mode - 0 for stacked ghosts, 1 for flickering
 */
export function setSuperpositionMode(
  material: THREE.ShaderMaterial,
  mode: SuperpositionMode
): void {
  if (material.uniforms.u_superpositionMode) {
    material.uniforms.u_superpositionMode.value = mode;
  }
}
