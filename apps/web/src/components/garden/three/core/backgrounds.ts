/**
 * Background System — Switchable garden backgrounds
 *
 * Provides multiple background options for the garden scene,
 * each implemented as a post-processing shader pass.
 *
 * Background types:
 * - Clouds: Procedural FBM clouds with slow drift animation
 * - Parchment: Paper grain + atmospheric haze (original)
 * - Plain: Minimal solid color, no post-processing
 */

import * as THREE from "three";

// Re-export parchment background utilities
export { createPaperTexture, PaperGrainShader } from "./paper-texture";

/** Available background types */
export type BackgroundType = "clouds" | "clouds-static" | "parchment" | "plain";

/** Display labels and scene.background colors per type */
export const BACKGROUND_CONFIGS: Record<
  BackgroundType,
  { label: string; backgroundColor: string }
> = {
  clouds: { label: "CLOUDS", backgroundColor: "#EDDCE8" },
  "clouds-static": { label: "STATIC", backgroundColor: "#EDDCE8" },
  parchment: { label: "PARCHMENT", backgroundColor: "#F8F5F0" },
  plain: { label: "PLAIN", backgroundColor: "#F0F0F0" },
};

/** All background types in cycle order */
export const BACKGROUND_ORDER: BackgroundType[] = [
  "clouds",
  "clouds-static",
  "parchment",
  "plain",
];

/**
 * Cloud background shader — dreamy pastel clouds with sparkles
 *
 * Inspired by a soft pink/lavender cloudscape aesthetic:
 * - Fluffy pink-tinted clouds concentrated in the lower half
 * - Gentle lavender-to-purple sky gradient at the top
 * - Scattered sparkle/star effects throughout
 * - Slow drift animation for a living, dreamy feel
 *
 * Applied as a post-processing pass after bloom, same as PaperGrainShader.
 */
export const CloudShader = {
  name: "CloudShader",

  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    resolution: { value: new THREE.Vector2(1, 1) },
    aspectRatio: { value: 1.0 as number },
    uTime: { value: 0.0 as number },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float aspectRatio;
    uniform float uTime;

    varying vec2 vUv;

    // Hash-based pseudo-random
    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    // Smooth value noise
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    // Fractal Brownian Motion — 4 octaves
    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);

      for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p * frequency);
        p = rot * p;
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    // Sparkle function — sharp bright points
    float sparkle(vec2 uv, float time) {
      // Grid of potential sparkle positions
      vec2 cell = floor(uv);
      vec2 local = fract(uv) - 0.5;

      float brightness = 0.0;

      // Check 3x3 neighborhood for nearby sparkles
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 neighbor = vec2(float(x), float(y));
          vec2 cellId = cell + neighbor;

          // Random position offset within cell
          vec2 starPos = vec2(hash(cellId), hash(cellId + 71.7)) - 0.5;
          vec2 diff = neighbor + starPos - local;
          float dist = length(diff);

          // Sharp falloff for point-like stars
          float star = smoothstep(0.08, 0.0, dist);

          // Twinkle: phase based on cell hash, slow oscillation
          float phase = hash(cellId + 13.37) * 6.283;
          float twinkle = sin(time * (1.5 + hash(cellId + 7.1) * 2.0) + phase);
          twinkle = twinkle * 0.5 + 0.5; // remap to 0-1
          twinkle = pow(twinkle, 3.0);   // sharpen the pulse

          // Only some cells have visible stars (sparse)
          float exists = step(0.7, hash(cellId + 31.5));

          brightness += star * twinkle * exists;
        }
      }

      return brightness;
    }

    void main() {
      vec4 scene = texture2D(tDiffuse, vUv);

      // ─── Background detection ────────────────────────────────
      float luminance = dot(scene.rgb, vec3(0.299, 0.587, 0.114));
      float bgAmount = smoothstep(0.85, 0.97, luminance);

      if (bgAmount < 0.001) {
        gl_FragColor = scene;
        return;
      }

      // ─── Sky gradient (lavender top → pink-white bottom) ─────
      // vUv.y: 0 = bottom of screen, 1 = top
      vec3 skyTop = vec3(0.78, 0.75, 0.90);       // soft lavender-purple
      vec3 skyMid = vec3(0.88, 0.82, 0.92);       // light mauve
      vec3 skyBottom = vec3(0.95, 0.88, 0.92);     // pale pink-white

      float skyGrad = vUv.y;
      vec3 skyColor = mix(skyBottom, skyMid, smoothstep(0.0, 0.5, skyGrad));
      skyColor = mix(skyColor, skyTop, smoothstep(0.4, 1.0, skyGrad));

      // ─── Cloud generation ────────────────────────────────────
      vec2 cloudUv = vUv * vec2(aspectRatio, 1.0) * 2.5;

      // Slow drift
      float drift = uTime * 0.015;
      cloudUv += vec2(drift * 0.6, drift * 0.15);

      // Primary cloud layer (large billowy shapes)
      float clouds1 = fbm(cloudUv * 1.2);
      // Secondary layer (smaller detail)
      float clouds2 = fbm(cloudUv * 2.2 + vec2(5.2, 1.3));
      // Wispy layer for edges
      float clouds3 = fbm(cloudUv * 0.7 + vec2(-3.1, 2.7));

      // Blend layers
      float cloudVal = clouds1 * 0.5 + clouds2 * 0.3 + clouds3 * 0.2;

      // Clouds concentrated more toward the bottom half
      // vUv.y = 0 is bottom, 1 is top
      float cloudBand = smoothstep(0.9, 0.35, vUv.y);  // dense at bottom, fading toward top
      cloudVal = smoothstep(0.3, 0.65, cloudVal) * cloudBand;

      // Some wispy clouds in upper region too
      float wisps = fbm(cloudUv * 1.5 + vec2(8.0, 0.0)) * smoothstep(0.3, 0.7, vUv.y) * 0.15;
      cloudVal = max(cloudVal, wisps);

      // ─── Cloud coloring (pink/lavender tinted) ────────────────
      vec3 cloudBright = vec3(0.97, 0.92, 0.95);   // soft pink-white cloud highlights
      vec3 cloudShadow = vec3(0.90, 0.82, 0.88);   // muted pink-mauve cloud shadows
      vec3 cloudWarm = vec3(0.96, 0.88, 0.91);     // warm pink midtones

      vec3 cloudColor = mix(cloudShadow, cloudBright, smoothstep(0.2, 0.8, cloudVal));
      cloudColor = mix(cloudColor, cloudWarm, smoothstep(0.4, 0.7, cloudVal) * 0.4);

      // ─── Composite sky + clouds ──────────────────────────────
      vec3 result = mix(skyColor, cloudColor, cloudVal);

      // ─── Sparkles ────────────────────────────────────────────
      // Sparkles across entire sky, denser toward top
      vec2 sparkleUv = vUv * vec2(aspectRatio, 1.0) * 18.0;
      float sparkleBrightness = sparkle(sparkleUv, uTime);

      // Denser in upper sky, sparser in cloud areas
      float sparkleMask = smoothstep(0.2, 0.8, vUv.y) * 0.7 + 0.3;
      sparkleMask *= (1.0 - cloudVal * 0.5); // dim sparkles behind thick clouds

      // Warm white sparkle color with slight pink tint
      vec3 sparkleColor = vec3(1.0, 0.97, 0.95);
      result += sparkleColor * sparkleBrightness * sparkleMask * 0.6;

      // Second sparkle layer (larger, dimmer, different grid)
      float sparkleLg = sparkle(sparkleUv * 0.4 + vec2(100.0, 50.0), uTime * 0.7);
      result += sparkleColor * sparkleLg * sparkleMask * 0.3;

      // ─── Final compositing ───────────────────────────────────
      result = mix(scene.rgb, result, bgAmount);

      gl_FragColor = vec4(result, scene.a);
    }
  `,
};

/**
 * Static cloud background shader — image-based with Gaussian blur
 *
 * Samples a pre-made cloud image texture stretched to fill the viewport,
 * applies a soft Gaussian blur for a dreamy feel, and composites onto
 * background pixels (preserving plants).
 */
export const CloudStaticShader = {
  name: "CloudStaticShader",

  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tBackground: { value: null as THREE.Texture | null },
    resolution: { value: new THREE.Vector2(1, 1) },
    aspectRatio: { value: 1.0 as number },
    uTime: { value: 0.0 as number },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D tBackground;
    uniform vec2 resolution;
    uniform float aspectRatio;
    uniform float uTime;

    varying vec2 vUv;

    // Hash-based pseudo-random
    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    // Sparkle with cross/starburst spikes
    float sparkle(vec2 uv, float time) {
      vec2 cell = floor(uv);
      vec2 local = fract(uv) - 0.5;

      float brightness = 0.0;

      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 neighbor = vec2(float(x), float(y));
          vec2 cellId = cell + neighbor;

          vec2 starPos = vec2(hash(cellId), hash(cellId + 71.7)) - 0.5;
          vec2 diff = neighbor + starPos - local;
          float dist = length(diff);

          // Core glow
          float core = smoothstep(0.08, 0.0, dist);

          // Cross spikes
          float dx = abs(diff.x);
          float dy = abs(diff.y);
          float spike = max(
            smoothstep(0.012, 0.0, dx) * smoothstep(0.2, 0.0, dy),
            smoothstep(0.012, 0.0, dy) * smoothstep(0.2, 0.0, dx)
          );

          float star = core + spike * 0.6;

          // Twinkle
          float phase = hash(cellId + 13.37) * 6.283;
          float twinkle = sin(time * (1.5 + hash(cellId + 7.1) * 2.0) + phase);
          twinkle = twinkle * 0.5 + 0.5;
          twinkle = pow(twinkle, 3.0);

          float exists = step(0.7, hash(cellId + 31.5));
          float sizeVar = 0.5 + hash(cellId + 99.9) * 0.5;

          brightness += star * twinkle * exists * sizeVar;
        }
      }

      return brightness;
    }

    void main() {
      vec4 scene = texture2D(tDiffuse, vUv);

      // ─── Background detection ────────────────────────────────
      float luminance = dot(scene.rgb, vec3(0.299, 0.587, 0.114));
      float bgAmount = smoothstep(0.85, 0.97, luminance);

      if (bgAmount < 0.001) {
        gl_FragColor = scene;
        return;
      }

      // ─── Gaussian blur (5x5 kernel) ───────────────────────────
      vec2 texel = 1.0 / resolution;
      float blurRadius = 4.0;

      vec3 blurred = vec3(0.0);
      float totalWeight = 0.0;

      for (int y = -2; y <= 2; y++) {
        for (int x = -2; x <= 2; x++) {
          vec2 offset = vec2(float(x), float(y)) * texel * blurRadius;
          float weight = exp(-0.5 * float(x * x + y * y) / 2.0);
          blurred += texture2D(tBackground, vUv + offset).rgb * weight;
          totalWeight += weight;
        }
      }
      blurred /= totalWeight;

      // ─── Sparkles ────────────────────────────────────────────
      vec2 sparkleUv = vUv * vec2(aspectRatio, 1.0) * 18.0;
      float sparkleBrightness = sparkle(sparkleUv, uTime);

      // Use image luminance to determine cloud density for masking
      float bgLum = dot(blurred, vec3(0.299, 0.587, 0.114));
      float sparkleMask = smoothstep(0.2, 0.8, vUv.y) * 0.7 + 0.3;
      sparkleMask *= smoothstep(0.82, 0.92, bgLum); // brighter in clearer sky areas

      vec3 sparkleColor = vec3(1.0, 0.97, 0.95);
      blurred += sparkleColor * sparkleBrightness * sparkleMask * 0.6;

      // Second sparkle layer (larger, slower)
      float sparkleLg = sparkle(sparkleUv * 0.4 + vec2(100.0, 50.0), uTime * 0.7);
      blurred += sparkleColor * sparkleLg * sparkleMask * 0.3;

      // ─── Compositing ─────────────────────────────────────────
      vec3 result = mix(scene.rgb, blurred, bgAmount);

      gl_FragColor = vec4(result, scene.a);
    }
  `,
};

/**
 * Load the static cloud background texture from the public directory.
 */
export function loadCloudBackgroundTexture(): THREE.Texture {
  const loader = new THREE.TextureLoader();
  const texture = loader.load("/bg-clouds.png");
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
