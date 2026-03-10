/**
 * Quantum Particle Overlay
 *
 * Renders ambient floating particles near each plant, creating a magical
 * atmosphere. Particle density, speed, color, and behavior are all driven
 * by quantum measurement data.
 *
 * Uses a single InstancedMesh for all particles across all plants,
 * keeping draw calls to 1 regardless of plant count.
 */

import * as THREE from "three";
import type { Plant } from "@quantum-garden/shared";
import { computeParticleParams, type ParticleParams } from "@quantum-garden/shared";
import { hashString } from "./watercolor-rendering";

/** Maximum particles across the entire garden */
const MAX_PARTICLES = 800;

/** Particle drift height before respawn (in world units) */
const DRIFT_HEIGHT = 60;

/** Base drift speed (world units per second) */
const BASE_DRIFT_SPEED = 12;

interface ParticleState {
  /** Plant position (world) */
  plantX: number;
  plantY: number;
  /** Current offset from plant position */
  offsetX: number;
  offsetY: number;
  /** Drift progress (0 = just spawned, 1 = fully drifted) */
  progress: number;
  /** Speed multiplier for this particle */
  speed: number;
  /** Horizontal wobble phase */
  wobblePhase: number;
  /** Particle params from quantum data */
  params: ParticleParams;
  /** Whether plant is observed (affects flickering) */
  observed: boolean;
}

export class QuantumParticleOverlay {
  private group: THREE.Group;
  private mesh: THREE.InstancedMesh | null = null;
  private material: THREE.ShaderMaterial;
  private particles: ParticleState[] = [];
  private dummy = new THREE.Object3D();

  // Per-instance attributes
  private instanceColors: Float32Array;
  private instanceOpacities: Float32Array;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "quantum-particles";

    this.instanceColors = new Float32Array(MAX_PARTICLES * 3);
    this.instanceOpacities = new Float32Array(MAX_PARTICLES);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
      },
      vertexShader: `
        uniform float u_time;

        attribute vec3 aParticleColor;
        attribute float aParticleOpacity;

        varying vec3 vColor;
        varying float vOpacity;
        varying vec2 vUv;

        void main() {
          vUv = uv;
          vColor = aParticleColor;
          vOpacity = aParticleOpacity;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vOpacity;
        varying vec2 vUv;

        void main() {
          // Soft radial gradient dot
          vec2 center = vUv - 0.5;
          float dist = length(center) * 2.0;
          float alpha = (1.0 - smoothstep(0.0, 1.0, dist)) * vOpacity;
          alpha *= alpha; // Softer falloff

          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    this.initMesh();
  }

  private initMesh(): void {
    const geo = new THREE.PlaneGeometry(1, 1);
    this.mesh = new THREE.InstancedMesh(geo, this.material, MAX_PARTICLES);
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;

    // Set up per-instance attributes
    const colorAttr = new THREE.InstancedBufferAttribute(this.instanceColors, 3);
    colorAttr.setUsage(THREE.DynamicDrawUsage);
    this.mesh.geometry.setAttribute("aParticleColor", colorAttr);

    const opacityAttr = new THREE.InstancedBufferAttribute(this.instanceOpacities, 1);
    opacityAttr.setUsage(THREE.DynamicDrawUsage);
    this.mesh.geometry.setAttribute("aParticleOpacity", opacityAttr);

    this.group.add(this.mesh);
  }

  /**
   * Rebuild particle assignments from plant list.
   */
  setPlants(plants: Plant[]): void {
    this.particles = [];

    // Only generate particles for germinated plants
    const germinatedPlants = plants.filter((p) => p.germinatedAt);

    for (const plant of germinatedPlants) {
      const primaryColor = plant.traits?.colorPalette?.[0] ?? "#e0e0e8";
      const params = computeParticleParams(plant.traits ?? null, primaryColor);

      // Seed RNG per plant for deterministic particle init
      let seed = hashString(plant.id + "-particles");
      const rng = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      for (let i = 0; i < params.count; i++) {
        if (this.particles.length >= MAX_PARTICLES) break;
        this.particles.push({
          plantX: plant.position.x,
          plantY: plant.position.y,
          offsetX: (rng() - 0.5) * params.spreadRadius * 2,
          offsetY: 0,
          progress: rng(), // Stagger initial positions
          speed: params.speed * (0.7 + rng() * 0.6),
          wobblePhase: rng() * Math.PI * 2,
          params,
          observed: plant.observed,
        });
      }
      if (this.particles.length >= MAX_PARTICLES) break;
    }

    if (this.mesh) {
      this.mesh.count = this.particles.length;
    }
  }

  /**
   * Update particle positions each frame.
   */
  update(time: number, deltaTime: number): boolean {
    if (this.particles.length === 0 || !this.mesh) return false;

    this.material.uniforms.u_time!.value = time;

    const colorAttr = this.mesh.geometry.getAttribute(
      "aParticleColor"
    ) as THREE.InstancedBufferAttribute;
    const opacityAttr = this.mesh.geometry.getAttribute(
      "aParticleOpacity"
    ) as THREE.InstancedBufferAttribute;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]!;

      // Advance progress
      p.progress += (deltaTime * p.speed * BASE_DRIFT_SPEED) / DRIFT_HEIGHT;

      // Respawn when drifted fully
      if (p.progress >= 1.0) {
        p.progress -= 1.0;
        // Randomize horizontal offset on respawn
        const seed = (p.wobblePhase * 100 + time * 1000) | 0;
        const rng = (((seed * 16807) % 2147483647) - 1) / 2147483646;
        p.offsetX = (rng - 0.5) * p.params.spreadRadius * 2;
      }

      // Current position
      const driftY = -p.progress * DRIFT_HEIGHT; // Upward (negative Y in Three.js convention)
      const wobbleX = Math.sin(time * 1.5 + p.wobblePhase) * 3;

      this.dummy.position.set(
        p.plantX + p.offsetX + wobbleX,
        p.plantY + driftY,
        62 // Above watercolor plants
      );

      // Scale based on quantum size
      const size = p.params.size * 3; // Scale up for visibility in world space
      this.dummy.scale.set(size, size, 1);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);

      // Color
      const color = new THREE.Color(p.params.color);
      this.instanceColors[i * 3] = color.r;
      this.instanceColors[i * 3 + 1] = color.g;
      this.instanceColors[i * 3 + 2] = color.b;

      // Opacity: fade in at start, fade out at end
      let opacity = 1.0;
      if (p.progress < 0.15) opacity = p.progress / 0.15; // Fade in
      if (p.progress > 0.75) opacity = 1.0 - (p.progress - 0.75) / 0.25; // Fade out
      opacity *= 0.6; // Base max opacity for subtlety

      // Unobserved plants: particles flicker
      if (!p.observed) {
        const flicker = 0.3 + 0.7 * Math.abs(Math.sin(time * 5 + p.wobblePhase * 3));
        opacity *= flicker;
      }

      this.instanceOpacities[i] = opacity;
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    colorAttr.needsUpdate = true;
    opacityAttr.needsUpdate = true;

    return true;
  }

  hasActiveAnimations(): boolean {
    return this.particles.length > 0;
  }

  getObject(): THREE.Object3D {
    return this.group;
  }

  dispose(): void {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.material.dispose();
    }
    this.particles = [];
  }
}
