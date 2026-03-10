/**
 * Feedback Overlay - Observation celebration effect
 *
 * Three.js implementation of expanding soft ring animations that play
 * when an observation completes successfully. Uses filled RingGeometry
 * meshes with additive blending for smooth, anti-aliased rendering
 * (LineLoop renders as 1px hairlines on most GPUs).
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
  START_ALPHA: 0.6,
  SEGMENTS: 48,
  RING_THICKNESS: 2.0,
};

/** Enhanced constants for first observation celebration */
const FIRST_OBSERVATION_FEEDBACK = {
  INNER_START_RADIUS: 25,
  INNER_END_RADIUS: 80,
  OUTER_START_RADIUS: 35,
  OUTER_END_RADIUS: 120,
  THIRD_START_RADIUS: 45,
  THIRD_END_RADIUS: 160,
  DURATION: 1.4,
  OUTER_DELAY: 0.15,
  THIRD_DELAY: 0.3,
  PRIMARY_COLOR: 0xffd700,
  SECONDARY_COLOR: 0xffffff,
  TERTIARY_COLOR: 0xc4b5fd,
  START_ALPHA: 0.7,
  SEGMENTS: 64,
  RING_THICKNESS: 2.5,
};

interface FeedbackAnimation {
  x: number;
  y: number;
  startTime: number;
  innerRing: THREE.Mesh;
  outerRing: THREE.Mesh;
  thirdRing?: THREE.Mesh;
  isFirstObservation?: boolean;
}

/**
 * Convert a hex color string (#RRGGBB) to THREE.js color number.
 */
function hexStringToNumber(hex: string): number {
  const clean = hex.replace("#", "");
  return parseInt(clean, 16);
}

/**
 * Compute the complementary color of a hex color.
 * Complementary colors are opposite on the color wheel (180° hue shift in HSL space).
 */
function computeComplementaryColor(hexColor: number): number {
  const r = (hexColor >> 16) & 0xff;
  const g = (hexColor >> 8) & 0xff;
  const b = hexColor & 0xff;

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) / 6;
    } else if (max === gNorm) {
      h = ((bNorm - rNorm) / delta + 2) / 6;
    } else {
      h = ((rNorm - gNorm) / delta + 4) / 6;
    }
  }

  h = (h + 0.5) % 1;

  const hueToRgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let rOut, gOut, bOut;
  if (s === 0) {
    return 0xffffff;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    rOut = hueToRgb(p, q, h + 1 / 3);
    gOut = hueToRgb(p, q, h);
    bOut = hueToRgb(p, q, h - 1 / 3);
  }

  const rFinal = Math.round(rOut * 255);
  const gFinal = Math.round(gOut * 255);
  const bFinal = Math.round(bOut * 255);

  return (rFinal << 16) | (gFinal << 8) | bFinal;
}

/**
 * Renders expanding ring animations when observations complete.
 * Uses filled RingGeometry meshes scaled from unit size for smooth rendering.
 */
export class FeedbackOverlay {
  private group: THREE.Group;
  private activeAnimations: FeedbackAnimation[] = [];

  // Shared unit-scale ring geometries (one per segment count)
  private ringGeometry: THREE.RingGeometry;
  private ringGeometryHQ: THREE.RingGeometry;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "observation-feedback";

    // Unit-scale ring: inner=1-halfThick, outer=1+halfThick, scaled per frame
    const ht = OBSERVATION_FEEDBACK.RING_THICKNESS * 0.5;
    this.ringGeometry = new THREE.RingGeometry(
      1 - ht / OBSERVATION_FEEDBACK.INNER_START_RADIUS,
      1 + ht / OBSERVATION_FEEDBACK.INNER_START_RADIUS,
      OBSERVATION_FEEDBACK.SEGMENTS
    );

    const htHQ = FIRST_OBSERVATION_FEEDBACK.RING_THICKNESS * 0.5;
    this.ringGeometryHQ = new THREE.RingGeometry(
      1 - htHQ / FIRST_OBSERVATION_FEEDBACK.INNER_START_RADIUS,
      1 + htHQ / FIRST_OBSERVATION_FEEDBACK.INNER_START_RADIUS,
      FIRST_OBSERVATION_FEEDBACK.SEGMENTS
    );
  }

  /**
   * Create a filled ring mesh with the given color and blending.
   */
  private createRing(
    color: number,
    startAlpha: number,
    startRadius: number,
    highQuality?: boolean
  ): THREE.Mesh {
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: startAlpha,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const geometry = highQuality ? this.ringGeometryHQ : this.ringGeometry;
    const ring = new THREE.Mesh(geometry, material);
    ring.scale.set(startRadius, startRadius, 1);

    return ring;
  }

  /**
   * Trigger a celebration animation at the given position.
   *
   * @param x - X position in world coordinates
   * @param y - Y position in world coordinates
   * @param primaryColor - Optional primary color from plant's palette (hex string like "#4ecdc4")
   */
  triggerCelebration(x: number, y: number, primaryColor?: string): void {
    const innerColor = primaryColor
      ? hexStringToNumber(primaryColor)
      : OBSERVATION_FEEDBACK.PRIMARY_COLOR;

    const innerRing = this.createRing(
      innerColor,
      OBSERVATION_FEEDBACK.START_ALPHA,
      OBSERVATION_FEEDBACK.INNER_START_RADIUS
    );
    innerRing.position.set(x, y, 2);

    const outerColor = primaryColor
      ? computeComplementaryColor(innerColor)
      : OBSERVATION_FEEDBACK.SECONDARY_COLOR;
    const outerRing = this.createRing(
      outerColor,
      OBSERVATION_FEEDBACK.START_ALPHA,
      OBSERVATION_FEEDBACK.OUTER_START_RADIUS
    );
    outerRing.position.set(x, y, 2);
    outerRing.visible = false;

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
   * Trigger an enhanced celebration for the user's first observation.
   * Creates a more dramatic effect with three rings and gold color.
   *
   * @param x - X position in world coordinates
   * @param y - Y position in world coordinates
   */
  triggerFirstObservationCelebration(x: number, y: number): void {
    const innerRing = this.createRing(
      FIRST_OBSERVATION_FEEDBACK.PRIMARY_COLOR,
      FIRST_OBSERVATION_FEEDBACK.START_ALPHA,
      FIRST_OBSERVATION_FEEDBACK.INNER_START_RADIUS,
      true
    );
    innerRing.position.set(x, y, 2);

    const outerRing = this.createRing(
      FIRST_OBSERVATION_FEEDBACK.SECONDARY_COLOR,
      FIRST_OBSERVATION_FEEDBACK.START_ALPHA,
      FIRST_OBSERVATION_FEEDBACK.OUTER_START_RADIUS,
      true
    );
    outerRing.position.set(x, y, 2);
    outerRing.visible = false;

    const thirdRing = this.createRing(
      FIRST_OBSERVATION_FEEDBACK.TERTIARY_COLOR,
      FIRST_OBSERVATION_FEEDBACK.START_ALPHA,
      FIRST_OBSERVATION_FEEDBACK.THIRD_START_RADIUS,
      true
    );
    thirdRing.position.set(x, y, 2);
    thirdRing.visible = false;

    this.group.add(innerRing);
    this.group.add(outerRing);
    this.group.add(thirdRing);

    this.activeAnimations.push({
      x,
      y,
      startTime: performance.now(),
      innerRing,
      outerRing,
      thirdRing,
      isFirstObservation: true,
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

      const config = anim.isFirstObservation ? FIRST_OBSERVATION_FEEDBACK : OBSERVATION_FEEDBACK;

      if (elapsed >= config.DURATION) {
        completedIndices.push(i);
        continue;
      }

      // Update inner ring
      this.updateRing(
        anim.innerRing,
        elapsed,
        0,
        config.INNER_START_RADIUS,
        config.INNER_END_RADIUS,
        config.DURATION,
        config.START_ALPHA
      );

      // Update outer ring (starts after delay)
      const outerElapsed = elapsed - config.OUTER_DELAY;
      if (outerElapsed > 0) {
        anim.outerRing.visible = true;
        this.updateRing(
          anim.outerRing,
          outerElapsed,
          config.OUTER_DELAY,
          config.OUTER_START_RADIUS,
          config.OUTER_END_RADIUS,
          config.DURATION,
          config.START_ALPHA
        );
      }

      // Update third ring for first observation
      if (anim.isFirstObservation && anim.thirdRing) {
        const thirdElapsed = elapsed - FIRST_OBSERVATION_FEEDBACK.THIRD_DELAY;
        if (thirdElapsed > 0) {
          anim.thirdRing.visible = true;
          this.updateRing(
            anim.thirdRing,
            thirdElapsed,
            FIRST_OBSERVATION_FEEDBACK.THIRD_DELAY,
            FIRST_OBSERVATION_FEEDBACK.THIRD_START_RADIUS,
            FIRST_OBSERVATION_FEEDBACK.THIRD_END_RADIUS,
            FIRST_OBSERVATION_FEEDBACK.DURATION,
            FIRST_OBSERVATION_FEEDBACK.START_ALPHA
          );
        }
      }
    }

    // Remove completed animations (reverse order)
    for (let i = completedIndices.length - 1; i >= 0; i--) {
      const index = completedIndices[i]!;
      const anim = this.activeAnimations[index]!;

      this.group.remove(anim.innerRing);
      this.group.remove(anim.outerRing);
      (anim.innerRing.material as THREE.MeshBasicMaterial).dispose();
      (anim.outerRing.material as THREE.MeshBasicMaterial).dispose();

      if (anim.thirdRing) {
        this.group.remove(anim.thirdRing);
        (anim.thirdRing.material as THREE.MeshBasicMaterial).dispose();
      }

      this.activeAnimations.splice(index, 1);
    }
  }

  /**
   * Update a single ring's scale and opacity.
   */
  private updateRing(
    ring: THREE.Mesh,
    elapsed: number,
    delay: number,
    startRadius: number,
    endRadius: number,
    duration: number = OBSERVATION_FEEDBACK.DURATION,
    startAlpha: number = OBSERVATION_FEEDBACK.START_ALPHA
  ): void {
    const adjustedDuration = duration - delay;
    const progress = Math.min(1, elapsed / adjustedDuration);

    // Ease out cubic for smooth deceleration
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    // Interpolate radius via scale
    const radius = startRadius + (endRadius - startRadius) * easedProgress;
    ring.scale.set(radius, radius, 1);

    // Fade out alpha
    const alpha = startAlpha * Math.pow(1 - progress, 1.5);
    (ring.material as THREE.MeshBasicMaterial).opacity = alpha;
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
      (anim.innerRing.material as THREE.MeshBasicMaterial).dispose();
      (anim.outerRing.material as THREE.MeshBasicMaterial).dispose();
      if (anim.thirdRing) {
        (anim.thirdRing.material as THREE.MeshBasicMaterial).dispose();
      }
    }
    this.ringGeometry.dispose();
    this.ringGeometryHQ.dispose();
  }
}
