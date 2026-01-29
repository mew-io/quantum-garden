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

/** Enhanced constants for first observation celebration */
const FIRST_OBSERVATION_FEEDBACK = {
  INNER_START_RADIUS: 25,
  INNER_END_RADIUS: 80,
  OUTER_START_RADIUS: 35,
  OUTER_END_RADIUS: 120,
  THIRD_START_RADIUS: 45,
  THIRD_END_RADIUS: 160,
  DURATION: 1.4, // Longer duration for emphasis
  OUTER_DELAY: 0.15,
  THIRD_DELAY: 0.3,
  PRIMARY_COLOR: 0xffd700, // Gold for special moment
  SECONDARY_COLOR: 0xffffff,
  TERTIARY_COLOR: 0xc4b5fd, // Purple quantum accent
  START_ALPHA: 1.0,
  SEGMENTS: 64, // Smoother rings
};

interface FeedbackAnimation {
  x: number;
  y: number;
  startTime: number;
  innerRing: THREE.LineLoop;
  outerRing: THREE.LineLoop;
  thirdRing?: THREE.LineLoop; // Optional third ring for first observation
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
  // Extract RGB components
  const r = (hexColor >> 16) & 0xff;
  const g = (hexColor >> 8) & 0xff;
  const b = hexColor & 0xff;

  // Convert RGB to HSL
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

  // Rotate hue by 180 degrees for complementary color
  h = (h + 0.5) % 1;

  // Convert back to RGB
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
    // Achromatic (gray) - return white as complementary for better visibility
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
   *
   * @param x - X position in world coordinates
   * @param y - Y position in world coordinates
   * @param primaryColor - Optional primary color from plant's palette (hex string like "#4ecdc4")
   */
  triggerCelebration(x: number, y: number, primaryColor?: string): void {
    // Use plant's primary color for inner ring if provided, otherwise default cyan
    const innerColor = primaryColor
      ? hexStringToNumber(primaryColor)
      : OBSERVATION_FEEDBACK.PRIMARY_COLOR;

    // Create inner ring with plant's color or default
    const innerRing = this.createRing(innerColor);
    innerRing.position.set(x, y, 2);

    // Create outer ring with complementary color for visual harmony
    // Falls back to white if no primary color provided
    const outerColor = primaryColor
      ? computeComplementaryColor(innerColor)
      : OBSERVATION_FEEDBACK.SECONDARY_COLOR;
    const outerRing = this.createRing(outerColor);
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
   * Trigger an enhanced celebration for the user's first observation.
   * Creates a more dramatic effect with three rings and gold color.
   *
   * @param x - X position in world coordinates
   * @param y - Y position in world coordinates
   */
  triggerFirstObservationCelebration(x: number, y: number): void {
    // Create inner ring (gold)
    const innerMaterial = new THREE.LineBasicMaterial({
      color: FIRST_OBSERVATION_FEEDBACK.PRIMARY_COLOR,
      transparent: true,
      opacity: FIRST_OBSERVATION_FEEDBACK.START_ALPHA,
    });
    const innerGeometry = this.getRingGeometry(1);
    const innerRing = new THREE.LineLoop(innerGeometry, innerMaterial);
    innerRing.scale.set(
      FIRST_OBSERVATION_FEEDBACK.INNER_START_RADIUS,
      FIRST_OBSERVATION_FEEDBACK.INNER_START_RADIUS,
      1
    );
    innerRing.position.set(x, y, 2);

    // Create outer ring (white)
    const outerMaterial = new THREE.LineBasicMaterial({
      color: FIRST_OBSERVATION_FEEDBACK.SECONDARY_COLOR,
      transparent: true,
      opacity: FIRST_OBSERVATION_FEEDBACK.START_ALPHA,
    });
    const outerRing = new THREE.LineLoop(innerGeometry, outerMaterial);
    outerRing.scale.set(
      FIRST_OBSERVATION_FEEDBACK.OUTER_START_RADIUS,
      FIRST_OBSERVATION_FEEDBACK.OUTER_START_RADIUS,
      1
    );
    outerRing.position.set(x, y, 2);
    outerRing.visible = false;

    // Create third ring (purple quantum accent)
    const thirdMaterial = new THREE.LineBasicMaterial({
      color: FIRST_OBSERVATION_FEEDBACK.TERTIARY_COLOR,
      transparent: true,
      opacity: FIRST_OBSERVATION_FEEDBACK.START_ALPHA,
    });
    const thirdRing = new THREE.LineLoop(innerGeometry, thirdMaterial);
    thirdRing.scale.set(
      FIRST_OBSERVATION_FEEDBACK.THIRD_START_RADIUS,
      FIRST_OBSERVATION_FEEDBACK.THIRD_START_RADIUS,
      1
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

      // Use different timing constants for first observation vs regular
      const config = anim.isFirstObservation ? FIRST_OBSERVATION_FEEDBACK : OBSERVATION_FEEDBACK;

      // Check if animation is complete
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

      // Update third ring for first observation (starts after third delay)
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

    // Remove completed animations (in reverse order)
    for (let i = completedIndices.length - 1; i >= 0; i--) {
      const index = completedIndices[i]!;
      const anim = this.activeAnimations[index]!;

      // Clean up rings
      this.group.remove(anim.innerRing);
      this.group.remove(anim.outerRing);
      if (anim.thirdRing) {
        this.group.remove(anim.thirdRing);
      }

      // Dispose materials (geometries are shared)
      (anim.innerRing.material as THREE.LineBasicMaterial).dispose();
      (anim.outerRing.material as THREE.LineBasicMaterial).dispose();
      if (anim.thirdRing) {
        (anim.thirdRing.material as THREE.LineBasicMaterial).dispose();
      }

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
    (ring.material as THREE.LineBasicMaterial).opacity = alpha;
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
      (anim.innerRing.material as THREE.LineBasicMaterial).dispose();
      (anim.outerRing.material as THREE.LineBasicMaterial).dispose();
      if (anim.thirdRing) {
        (anim.thirdRing.material as THREE.LineBasicMaterial).dispose();
      }
    }

    // Dispose cached geometries
    for (const geometry of this.ringGeometries.values()) {
      geometry.dispose();
    }
  }
}
