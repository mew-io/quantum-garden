/**
 * Background System — Switchable garden backgrounds
 *
 * Provides background options for the garden scene,
 * each implemented as a post-processing shader pass.
 *
 * Background types:
 * - Clouds Static: Pre-rendered cloud image with blur and sparkles
 * - Plain: Minimal solid color, no post-processing
 */

import * as THREE from "three";

/** Available background types */
export type BackgroundType = "clouds-static" | "plain";

/** Display labels and scene.background colors per type */
export const BACKGROUND_CONFIGS: Record<
  BackgroundType,
  { label: string; backgroundColor: string }
> = {
  "clouds-static": { label: "STATIC", backgroundColor: "#EDDCE8" },
  plain: { label: "PLAIN", backgroundColor: "#F0F0F0" },
};

/** All background types in cycle order */
export const BACKGROUND_ORDER: BackgroundType[] = ["clouds-static", "plain"];

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
