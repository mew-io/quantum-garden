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
export class ReticleOverlay {
  private group: THREE.Group;
  private lineMaterial: THREE.LineBasicMaterial;
  private lineGeometry: THREE.BufferGeometry;
  private lines: THREE.LineSegments;

  // Motion state
  private position: Position;
  private velocity: Velocity;
  private state: ReticleState;
  private stateTimer: number;
  private controlMode: ControlMode;

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
  }

  /**
   * Update the reticle each frame.
   */
  update(_time: number, deltaTime: number): void {
    // In touch mode, position is set externally
    if (this.controlMode === "touch") {
      this.updateCrossGeometry(this.position.x, this.position.y);
      this.syncToStore();
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
  }
}
