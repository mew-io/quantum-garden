/**
 * Germination Overlay - Particle burst effect when plants germinate
 *
 * Three.js implementation of expanding star/diamond particles that
 * celebrate a plant's germination with a brief sparkle burst.
 */

import * as THREE from "three";

/** Visual constants for germination particles */
const GERMINATION_PARTICLES = {
  /** Number of particles in the burst */
  PARTICLE_COUNT: 10,
  /** Starting radius from center (pixels) */
  START_RADIUS: 8,
  /** Ending radius from center (pixels) */
  END_RADIUS: 45,
  /** Animation duration (seconds) */
  DURATION: 0.8,
  /** Particle size (pixels) */
  PARTICLE_SIZE: 6,
  /** Starting opacity (full for bloom effect) */
  START_ALPHA: 1.0,
  /** Default particle color if none provided */
  DEFAULT_COLOR: 0xc8f0c8, // Brighter sage green for better bloom
};

interface ParticleAnimation {
  centerX: number;
  centerY: number;
  startTime: number;
  particles: THREE.Mesh[];
  angles: number[]; // Radial angles for each particle
  color: number;
}

/**
 * Convert a hex color string (#RRGGBB) to THREE.js color number.
 */
function hexStringToNumber(hex: string): number {
  const clean = hex.replace("#", "");
  return parseInt(clean, 16);
}

/**
 * Create a small star/diamond geometry for particles.
 */
function createStarGeometry(size: number): THREE.BufferGeometry {
  // Create a 4-pointed star shape
  const shape = new THREE.Shape();
  const outerRadius = size;
  const innerRadius = size * 0.4;
  const points = 4;

  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();

  return new THREE.ShapeGeometry(shape);
}

/**
 * Renders particle burst animations when plants germinate.
 */
export class GerminationOverlay {
  private group: THREE.Group;
  private activeAnimations: ParticleAnimation[] = [];

  // Shared geometry for particles
  private starGeometry: THREE.BufferGeometry;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "germination-particles";

    // Create shared star geometry
    this.starGeometry = createStarGeometry(GERMINATION_PARTICLES.PARTICLE_SIZE);
  }

  /**
   * Trigger a germination particle burst at the given position.
   *
   * @param x - X position in world coordinates
   * @param y - Y position in world coordinates
   * @param accentColor - Optional accent color from plant's palette (hex string like "#A8D8A8")
   */
  triggerGermination(x: number, y: number, accentColor?: string): void {
    const color = accentColor
      ? hexStringToNumber(accentColor)
      : GERMINATION_PARTICLES.DEFAULT_COLOR;

    const particles: THREE.Mesh[] = [];
    const angles: number[] = [];

    // Create particles in a radial pattern with slight randomness
    for (let i = 0; i < GERMINATION_PARTICLES.PARTICLE_COUNT; i++) {
      // Base angle with slight random offset for organic feel
      const baseAngle = (i / GERMINATION_PARTICLES.PARTICLE_COUNT) * Math.PI * 2;
      const angle = baseAngle + (Math.random() - 0.5) * 0.4;
      angles.push(angle);

      // Create particle mesh with additive blending for natural bloom
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: GERMINATION_PARTICLES.START_ALPHA,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false, // Prevent z-fighting with additive blending
      });

      const particle = new THREE.Mesh(this.starGeometry, material);

      // Initial position near center
      const startX = x + Math.cos(angle) * GERMINATION_PARTICLES.START_RADIUS;
      const startY = y + Math.sin(angle) * GERMINATION_PARTICLES.START_RADIUS;
      particle.position.set(startX, startY, 3); // Z=3 to render above plants

      // Random initial rotation for variety
      particle.rotation.z = Math.random() * Math.PI * 2;

      particles.push(particle);
      this.group.add(particle);
    }

    this.activeAnimations.push({
      centerX: x,
      centerY: y,
      startTime: performance.now(),
      particles,
      angles,
      color,
    });
  }

  /**
   * Update all active animations.
   */
  update(_time: number): void {
    const now = performance.now();
    const completedIndices: number[] = [];

    for (let i = 0; i < this.activeAnimations.length; i++) {
      const anim = this.activeAnimations[i]!;
      const elapsed = (now - anim.startTime) / 1000;

      // Check if animation is complete
      if (elapsed >= GERMINATION_PARTICLES.DURATION) {
        completedIndices.push(i);
        continue;
      }

      const progress = elapsed / GERMINATION_PARTICLES.DURATION;

      // Ease out cubic for smooth deceleration
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // Update each particle
      for (let p = 0; p < anim.particles.length; p++) {
        const particle = anim.particles[p]!;
        const angle = anim.angles[p]!;

        // Interpolate radius
        const radius =
          GERMINATION_PARTICLES.START_RADIUS +
          (GERMINATION_PARTICLES.END_RADIUS - GERMINATION_PARTICLES.START_RADIUS) * easedProgress;

        // Update position
        particle.position.x = anim.centerX + Math.cos(angle) * radius;
        particle.position.y = anim.centerY + Math.sin(angle) * radius;

        // Rotate particle as it moves
        particle.rotation.z += 0.05;

        // Scale down as it fades
        const scale = 1 - progress * 0.5;
        particle.scale.set(scale, scale, 1);

        // Fade out with slight delay (particles stay visible longer then fade quickly)
        const fadeProgress = Math.max(0, (progress - 0.3) / 0.7);
        const alpha = GERMINATION_PARTICLES.START_ALPHA * (1 - Math.pow(fadeProgress, 2));
        (particle.material as THREE.MeshBasicMaterial).opacity = alpha;
      }
    }

    // Remove completed animations (in reverse order)
    for (let i = completedIndices.length - 1; i >= 0; i--) {
      const index = completedIndices[i]!;
      const anim = this.activeAnimations[index]!;

      // Clean up particles
      for (const particle of anim.particles) {
        this.group.remove(particle);
        (particle.material as THREE.MeshBasicMaterial).dispose();
      }

      this.activeAnimations.splice(index, 1);
    }
  }

  /**
   * Check if there are any active animations that need updating.
   */
  hasActiveAnimations(): boolean {
    return this.activeAnimations.length > 0;
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
    // Clean up any active animations
    for (const anim of this.activeAnimations) {
      for (const particle of anim.particles) {
        (particle.material as THREE.MeshBasicMaterial).dispose();
      }
    }

    // Dispose shared geometry
    this.starGeometry.dispose();
  }
}
