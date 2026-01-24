/**
 * Feedback Overlay - Observation celebration effect
 *
 * Three.js implementation of the expanding ring animation that plays
 * when an observation completes successfully.
 */

import * as THREE from "three";

/** Visual constants for observation feedback */
const OBSERVATION_FEEDBACK = {
  INNER_START_RADIUS: 25,
  INNER_END_RADIUS: 50,
  OUTER_START_RADIUS: 30,
  OUTER_END_RADIUS: 70,
  DURATION: 0.8,
  OUTER_DELAY: 0.1,
  PRIMARY_COLOR: 0x4ecdc4,
  SECONDARY_COLOR: 0xffffff,
  START_ALPHA: 0.9,
  SEGMENTS: 48,
};

interface FeedbackAnimation {
  x: number;
  y: number;
  startTime: number;
  innerRing: THREE.LineLoop;
  outerRing: THREE.LineLoop;
}

/**
 * Renders expanding ring animations when observations complete.
 */
export class FeedbackOverlay {
  private group: THREE.Group;
  private activeAnimations: FeedbackAnimation[] = [];

  // Reusable geometries for different ring sizes
  private ringGeometries: Map<number, THREE.BufferGeometry> = new Map();

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "observation-feedback";
  }

  /**
   * Get or create a ring geometry for the given radius.
   */
  private getRingGeometry(radius: number): THREE.BufferGeometry {
    // Round radius to reduce geometry count
    const roundedRadius = Math.round(radius);

    let geometry = this.ringGeometries.get(roundedRadius);
    if (!geometry) {
      const vertices: number[] = [];
      for (let i = 0; i <= OBSERVATION_FEEDBACK.SEGMENTS; i++) {
        const angle = (i / OBSERVATION_FEEDBACK.SEGMENTS) * Math.PI * 2;
        vertices.push(Math.cos(angle), Math.sin(angle), 0);
      }

      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      this.ringGeometries.set(roundedRadius, geometry);
    }

    return geometry;
  }

  /**
   * Create a ring with the given color.
   */
  private createRing(color: number): THREE.LineLoop {
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: OBSERVATION_FEEDBACK.START_ALPHA,
    });

    // Start with a unit circle - we'll scale it
    const geometry = this.getRingGeometry(1);
    const ring = new THREE.LineLoop(geometry, material);
    ring.scale.set(
      OBSERVATION_FEEDBACK.INNER_START_RADIUS,
      OBSERVATION_FEEDBACK.INNER_START_RADIUS,
      1
    );

    return ring;
  }

  /**
   * Trigger a celebration animation at the given position.
   */
  triggerCelebration(x: number, y: number): void {
    // Create inner ring (cyan)
    const innerRing = this.createRing(OBSERVATION_FEEDBACK.PRIMARY_COLOR);
    innerRing.position.set(x, y, 2);

    // Create outer ring (white)
    const outerRing = this.createRing(OBSERVATION_FEEDBACK.SECONDARY_COLOR);
    outerRing.position.set(x, y, 2);
    outerRing.visible = false; // Starts hidden, appears after delay

    this.group.add(innerRing);
    this.group.add(outerRing);

    this.activeAnimations.push({
      x,
      y,
      startTime: performance.now(),
      innerRing,
      outerRing,
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
      if (elapsed >= OBSERVATION_FEEDBACK.DURATION) {
        completedIndices.push(i);
        continue;
      }

      // Update inner ring
      this.updateRing(
        anim.innerRing,
        elapsed,
        0,
        OBSERVATION_FEEDBACK.INNER_START_RADIUS,
        OBSERVATION_FEEDBACK.INNER_END_RADIUS
      );

      // Update outer ring (starts after delay)
      const outerElapsed = elapsed - OBSERVATION_FEEDBACK.OUTER_DELAY;
      if (outerElapsed > 0) {
        anim.outerRing.visible = true;
        this.updateRing(
          anim.outerRing,
          outerElapsed,
          OBSERVATION_FEEDBACK.OUTER_DELAY,
          OBSERVATION_FEEDBACK.OUTER_START_RADIUS,
          OBSERVATION_FEEDBACK.OUTER_END_RADIUS
        );
      }
    }

    // Remove completed animations (in reverse order)
    for (let i = completedIndices.length - 1; i >= 0; i--) {
      const index = completedIndices[i]!;
      const anim = this.activeAnimations[index]!;

      // Clean up rings
      this.group.remove(anim.innerRing);
      this.group.remove(anim.outerRing);

      // Dispose materials (geometries are shared)
      (anim.innerRing.material as THREE.LineBasicMaterial).dispose();
      (anim.outerRing.material as THREE.LineBasicMaterial).dispose();

      this.activeAnimations.splice(index, 1);
    }
  }

  /**
   * Update a single ring's scale and opacity.
   */
  private updateRing(
    ring: THREE.LineLoop,
    elapsed: number,
    delay: number,
    startRadius: number,
    endRadius: number
  ): void {
    const adjustedDuration = OBSERVATION_FEEDBACK.DURATION - delay;
    const progress = Math.min(1, elapsed / adjustedDuration);

    // Ease out cubic for smooth deceleration
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    // Interpolate radius via scale
    const radius = startRadius + (endRadius - startRadius) * easedProgress;
    ring.scale.set(radius, radius, 1);

    // Fade out alpha
    const alpha = OBSERVATION_FEEDBACK.START_ALPHA * Math.pow(1 - progress, 1.5);
    (ring.material as THREE.LineBasicMaterial).opacity = alpha;
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
      (anim.innerRing.material as THREE.LineBasicMaterial).dispose();
      (anim.outerRing.material as THREE.LineBasicMaterial).dispose();
    }

    // Dispose cached geometries
    for (const geometry of this.ringGeometries.values()) {
      geometry.dispose();
    }
  }
}
