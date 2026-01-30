/**
 * Reticle Overlay - Autonomous system attention indicator
 *
 * Three.js implementation of the reticle that drifts through the garden.
 * Renders as a small cross pattern using LineSegments.
 */

import * as THREE from "three";
import { RETICLE, CANVAS } from "@quantum-garden/shared";
import { useGardenStore } from "@/stores/garden-store";

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

type ReticleState = "drifting" | "paused";
export type ControlMode = "autonomous" | "touch";

/**
 * Renders and controls the autonomous reticle.
 */
/** Glow ring visual constants */
const GLOW_RING = {
  INNER_RADIUS: 18,
  OUTER_RADIUS: 25,
  SEGMENTS: 32,
  BASE_OPACITY: 0.15,
  ACTIVE_OPACITY: 0.4,
  PULSE_SPEED: 3, // Hz
  DEFAULT_COLOR: 0x888888,
};

/**
 * Renders and controls the autonomous reticle.
 */
export class ReticleOverlay {
  private group: THREE.Group;
  private lineMaterial: THREE.LineBasicMaterial;
  private lineGeometry: THREE.BufferGeometry;
  private lines: THREE.LineSegments;

  // Glow ring (soft halo behind cross)
  private glowRing: THREE.Mesh;
  private glowMaterial: THREE.MeshBasicMaterial;

  // Motion state
  private position: Position;
  private velocity: Velocity;
  private state: ReticleState;
  private stateTimer: number;
  private controlMode: ControlMode;

  // Glow state
  private isOverPlant: boolean = false;
  private glowColor: number = GLOW_RING.DEFAULT_COLOR;

  // Configuration
  private readonly size: number;
  private readonly minSpeed = RETICLE.MIN_SPEED;
  private readonly maxSpeed = RETICLE.MAX_SPEED;
  private readonly minPause = RETICLE.MIN_PAUSE;
  private readonly maxPause = RETICLE.MAX_PAUSE;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "reticle";

    // Parse color from hex string
    const color = new THREE.Color(RETICLE.COLOR);
    this.size = RETICLE.DEFAULT_SIZE;

    // Create material for the cross
    this.lineMaterial = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
    });

    // Create geometry for cross pattern (two perpendicular lines)
    this.lineGeometry = new THREE.BufferGeometry();
    this.updateCrossGeometry(0, 0);

    // Create line segments
    this.lines = new THREE.LineSegments(this.lineGeometry, this.lineMaterial);
    this.group.add(this.lines);

    // Create glow ring (soft halo behind the cross)
    const glowGeometry = new THREE.RingGeometry(
      GLOW_RING.INNER_RADIUS,
      GLOW_RING.OUTER_RADIUS,
      GLOW_RING.SEGMENTS
    );
    this.glowMaterial = new THREE.MeshBasicMaterial({
      color: GLOW_RING.DEFAULT_COLOR,
      transparent: true,
      opacity: GLOW_RING.BASE_OPACITY,
      side: THREE.DoubleSide,
    });
    this.glowRing = new THREE.Mesh(glowGeometry, this.glowMaterial);
    this.glowRing.position.z = 0.5; // Behind the cross lines (z=1)
    this.group.add(this.glowRing);

    // Initialize position at center
    this.position = {
      x: CANVAS.DEFAULT_WIDTH / 2,
      y: CANVAS.DEFAULT_HEIGHT / 2,
    };

    // Initialize with random velocity
    this.velocity = this.randomVelocity();

    // Start in drifting state
    this.state = "drifting";
    this.stateTimer = this.randomDriftDuration();
    this.controlMode = "autonomous";

    // Sync initial position
    this.syncToStore();
    this.updateCrossGeometry(this.position.x, this.position.y);
  }

  /**
   * Update cross geometry at the given position.
   */
  private updateCrossGeometry(x: number, y: number): void {
    const halfSize = this.size / 2;

    // Cross pattern: vertical line + horizontal line
    const vertices = new Float32Array([
      // Vertical line
      x,
      y - halfSize,
      1, // z = 1 for overlay layer
      x,
      y + halfSize,
      1,
      // Horizontal line
      x - halfSize,
      y,
      1,
      x + halfSize,
      y,
      1,
    ]);

    this.lineGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    this.lineGeometry.attributes.position!.needsUpdate = true;

    // Update glow ring position
    if (this.glowRing) {
      this.glowRing.position.x = x;
      this.glowRing.position.y = y;
    }
  }

  /**
   * Update the reticle each frame.
   */
  update(time: number, deltaTime: number): void {
    // In touch mode, position is set externally
    if (this.controlMode === "touch") {
      this.updateCrossGeometry(this.position.x, this.position.y);
      this.syncToStore();
      this.updateGlowEffect(time);
      return;
    }

    // Autonomous mode: handle drift and state transitions
    this.stateTimer -= deltaTime;

    // Check for state transition
    if (this.stateTimer <= 0) {
      this.transitionState();
    }

    // Update position if drifting
    if (this.state === "drifting") {
      this.position.x += this.velocity.x * deltaTime;
      this.position.y += this.velocity.y * deltaTime;

      // Bounce off edges
      this.handleEdgeBounce();
    }

    // Update geometry and store
    this.updateCrossGeometry(this.position.x, this.position.y);
    this.syncToStore();

    // Update glow effect
    this.updateGlowEffect(time);
  }

  /**
   * Update the glow ring effect based on state.
   */
  private updateGlowEffect(time: number): void {
    // Check if we're over a plant (dwellTarget is set when hovering over observable plant)
    const dwellTarget = useGardenStore.getState().dwellTarget;
    this.isOverPlant = dwellTarget !== null;

    // Calculate target opacity with pulsing when over a plant
    let targetOpacity = GLOW_RING.BASE_OPACITY;
    if (this.isOverPlant) {
      // Pulse between base and active opacity
      const pulse = (Math.sin(time * GLOW_RING.PULSE_SPEED * Math.PI * 2) + 1) / 2;
      targetOpacity =
        GLOW_RING.BASE_OPACITY + pulse * (GLOW_RING.ACTIVE_OPACITY - GLOW_RING.BASE_OPACITY);
    }

    // Smoothly interpolate current opacity toward target
    const currentOpacity = this.glowMaterial.opacity;
    this.glowMaterial.opacity = currentOpacity + (targetOpacity - currentOpacity) * 0.1;

    // Update glow color
    this.glowMaterial.color.setHex(this.glowColor);
  }

  /**
   * Transition between drifting and paused states.
   */
  private transitionState(): void {
    if (this.state === "drifting") {
      this.state = "paused";
      this.stateTimer = this.randomPauseDuration();
    } else {
      this.state = "drifting";
      this.velocity = this.randomVelocity();
      this.stateTimer = this.randomDriftDuration();
    }
  }

  /**
   * Handle bouncing off screen edges.
   */
  private handleEdgeBounce(): void {
    const margin = this.size;

    if (this.position.x < margin) {
      this.position.x = margin;
      this.velocity.x = Math.abs(this.velocity.x) * this.randomBounceVariation();
    } else if (this.position.x > CANVAS.DEFAULT_WIDTH - margin) {
      this.position.x = CANVAS.DEFAULT_WIDTH - margin;
      this.velocity.x = -Math.abs(this.velocity.x) * this.randomBounceVariation();
    }

    if (this.position.y < margin) {
      this.position.y = margin;
      this.velocity.y = Math.abs(this.velocity.y) * this.randomBounceVariation();
    } else if (this.position.y > CANVAS.DEFAULT_HEIGHT - margin) {
      this.position.y = CANVAS.DEFAULT_HEIGHT - margin;
      this.velocity.y = -Math.abs(this.velocity.y) * this.randomBounceVariation();
    }
  }

  /**
   * Generate a random velocity vector.
   */
  private randomVelocity(): Velocity {
    const speed = this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };
  }

  /**
   * Random drift duration (5-15 seconds).
   */
  private randomDriftDuration(): number {
    return 5 + Math.random() * 10;
  }

  /**
   * Random pause duration.
   */
  private randomPauseDuration(): number {
    return this.minPause + Math.random() * (this.maxPause - this.minPause);
  }

  /**
   * Random bounce variation (0.8-1.2).
   */
  private randomBounceVariation(): number {
    return 0.8 + Math.random() * 0.4;
  }

  /**
   * Sync state to Zustand store.
   */
  private syncToStore(): void {
    const store = useGardenStore.getState();

    if (!store.reticle) {
      store.setReticle({
        id: "system-reticle",
        position: { ...this.position },
        size: this.size,
        velocity: { ...this.velocity },
        nextDirectionChange: this.stateTimer,
      });
    } else {
      store.updateReticlePosition({ ...this.position });
    }
  }

  /**
   * Set control mode.
   */
  setControlMode(mode: ControlMode): void {
    this.controlMode = mode;
  }

  /**
   * Get current control mode.
   */
  getControlMode(): ControlMode {
    return this.controlMode;
  }

  /**
   * Set position externally (for touch mode).
   */
  setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
  }

  /**
   * Get current position.
   */
  getPosition(): Position {
    return { ...this.position };
  }

  /**
   * Set the glow ring color (e.g., to match nearby plant palette).
   */
  setGlowColor(color: number): void {
    this.glowColor = color;
  }

  /**
   * Reset glow color to default.
   */
  resetGlowColor(): void {
    this.glowColor = GLOW_RING.DEFAULT_COLOR;
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
    this.lineGeometry.dispose();
    this.lineMaterial.dispose();
    this.glowRing.geometry.dispose();
    this.glowMaterial.dispose();
  }
}
