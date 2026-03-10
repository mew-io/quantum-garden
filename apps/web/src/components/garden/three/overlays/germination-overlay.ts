/**
 * Germination Overlay - Soft ring pulse effect when plants germinate
 *
 * Three.js implementation of an expanding ring with inner glow that
 * celebrates a plant's germination with a gentle watercolor-style pulse.
 * Uses scale transforms on shared unit-sized geometries to avoid
 * per-frame geometry allocation.
 */

import * as THREE from "three";

/** Visual constants for germination ring effect */
const GERMINATION_RING = {
  /** Animation duration (seconds) */
  DURATION: 1.0,
  /** Starting ring radius */
  START_RADIUS: 4,
  /** Ending ring radius */
  END_RADIUS: 38,
  /** Ring line thickness (at unit scale) */
  RING_THICKNESS: 2.5,
  /** Inner glow disc radius multiplier (relative to ring radius) */
  GLOW_SCALE: 0.85,
  /** Default color if none provided */
  DEFAULT_COLOR: 0xc8f0c8,
};

/** Ring segments for smooth circle */
const RING_SEGMENTS = 48;

/**
 * Unit-scale base radius for shared geometries.
 * Ring and glow are created at this size, then scaled each frame.
 */
const UNIT_RADIUS = 1;

interface RingAnimation {
  centerX: number;
  centerY: number;
  startTime: number;
  ring: THREE.Mesh;
  glow: THREE.Mesh;
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
 * Renders a soft expanding ring effect when plants germinate.
 */
export class GerminationOverlay {
  private group: THREE.Group;
  private activeAnimations: RingAnimation[] = [];

  // Shared unit-scale geometries — reused across all animations
  private ringGeometry: THREE.RingGeometry;
  private glowGeometry: THREE.CircleGeometry;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "germination-ring";

    // Create unit-scale geometries once; we animate via mesh.scale
    const halfThickness = (GERMINATION_RING.RING_THICKNESS * 0.5) / GERMINATION_RING.START_RADIUS;
    this.ringGeometry = new THREE.RingGeometry(
      UNIT_RADIUS - halfThickness,
      UNIT_RADIUS + halfThickness,
      RING_SEGMENTS
    );
    this.glowGeometry = new THREE.CircleGeometry(
      UNIT_RADIUS * GERMINATION_RING.GLOW_SCALE,
      RING_SEGMENTS
    );
  }

  /**
   * Trigger a germination ring pulse at the given position.
   *
   * @param x - X position in world coordinates
   * @param y - Y position in world coordinates
   * @param accentColor - Optional accent color from plant's palette (hex string like "#A8D8A8")
   */
  triggerGermination(x: number, y: number, accentColor?: string): void {
    const color = accentColor ? hexStringToNumber(accentColor) : GERMINATION_RING.DEFAULT_COLOR;

    // Expanding ring — starts at START_RADIUS scale
    const ringMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(this.ringGeometry, ringMat);
    ring.position.set(x, y, 3);
    const startScale = GERMINATION_RING.START_RADIUS;
    ring.scale.set(startScale, startScale, 1);

    // Inner soft glow disc
    const glowMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(this.glowGeometry, glowMat);
    glow.position.set(x, y, 2.9);
    glow.scale.set(startScale, startScale, 1);

    this.group.add(ring);
    this.group.add(glow);

    this.activeAnimations.push({
      centerX: x,
      centerY: y,
      startTime: performance.now(),
      ring,
      glow,
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

      if (elapsed >= GERMINATION_RING.DURATION) {
        completedIndices.push(i);
        continue;
      }

      const progress = elapsed / GERMINATION_RING.DURATION;

      // Smooth ease-out for organic feel
      const eased = 1 - Math.pow(1 - progress, 3);

      // Compute current radius and apply as scale
      const radius =
        GERMINATION_RING.START_RADIUS +
        (GERMINATION_RING.END_RADIUS - GERMINATION_RING.START_RADIUS) * eased;

      anim.ring.scale.set(radius, radius, 1);
      anim.glow.scale.set(radius, radius, 1);

      // Ring fades out smoothly
      (anim.ring.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - progress * progress);

      // Glow fades faster
      (anim.glow.material as THREE.MeshBasicMaterial).opacity =
        0.3 * Math.max(0, 1 - progress * 1.5);
    }

    // Remove completed animations (reverse order)
    for (let i = completedIndices.length - 1; i >= 0; i--) {
      const index = completedIndices[i]!;
      const anim = this.activeAnimations[index]!;

      this.group.remove(anim.ring);
      this.group.remove(anim.glow);
      (anim.ring.material as THREE.MeshBasicMaterial).dispose();
      (anim.glow.material as THREE.MeshBasicMaterial).dispose();

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
    for (const anim of this.activeAnimations) {
      (anim.ring.material as THREE.MeshBasicMaterial).dispose();
      (anim.glow.material as THREE.MeshBasicMaterial).dispose();
    }
    this.ringGeometry.dispose();
    this.glowGeometry.dispose();
  }
}
