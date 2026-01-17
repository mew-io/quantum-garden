/**
 * ReticleController - Autonomous system attention indicator
 *
 * The reticle represents "system attention", NOT user control.
 * It drifts slowly and autonomously through the garden, occasionally
 * pausing and changing direction. When it overlaps a plant inside an
 * observation region for the required dwell time, observation occurs.
 *
 * Key behaviors:
 * - Slow, linear drift (10-30 px/sec)
 * - Gentle pauses (2-6 seconds)
 * - Occasional direction changes
 * - Does not seek plants
 * - May pass over empty space frequently
 *
 * See docs/observation-system.md for full specification.
 */

import { Graphics, Ticker } from "pixi.js";
import type { Application } from "pixi.js";
import { RETICLE } from "@quantum-garden/shared";
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

/**
 * Controls the autonomous reticle movement and rendering.
 */
export class ReticleController {
  private app: Application;
  private graphics: Graphics;
  private ticker: Ticker;
  private isRunning: boolean;

  // Motion state
  private position: Position;
  private velocity: Velocity;
  private state: ReticleState;
  private stateTimer: number; // Seconds until state change
  private reticleSize: number;

  // Configuration (from constants with some variation)
  private readonly minSpeed = RETICLE.MIN_SPEED;
  private readonly maxSpeed = RETICLE.MAX_SPEED;
  private readonly minPause = RETICLE.MIN_PAUSE;
  private readonly maxPause = RETICLE.MAX_PAUSE;
  private readonly color: number;

  constructor(app: Application) {
    this.app = app;
    this.graphics = new Graphics();
    this.graphics.label = "reticle";
    this.ticker = new Ticker();
    this.isRunning = false;

    // Initialize position at center of screen
    this.position = {
      x: app.screen.width / 2,
      y: app.screen.height / 2,
    };

    // Initialize with random velocity
    this.velocity = this.randomVelocity();

    // Start in drifting state
    this.state = "drifting";
    this.stateTimer = this.randomDriftDuration();

    // Use default size
    this.reticleSize = RETICLE.DEFAULT_SIZE;

    // Parse color from hex string to number
    this.color = parseInt(RETICLE.COLOR.replace("#", ""), 16);

    // Add graphics to stage
    this.app.stage.addChild(this.graphics);
  }

  /**
   * Start the reticle controller.
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Update Zustand store with initial state
    this.syncToStore();

    // Start the update loop
    this.ticker.add(this.update, this);
    this.ticker.start();

    // Initial render
    this.render();
  }

  /**
   * Stop the reticle controller.
   */
  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    this.ticker.stop();
    this.ticker.remove(this.update, this);
  }

  /**
   * Clean up resources.
   */
  destroy(): void {
    this.stop();
    this.graphics.destroy();
    this.ticker.destroy();
  }

  /**
   * Update loop called each frame.
   */
  private update = (ticker: Ticker): void => {
    const deltaSeconds = ticker.deltaMS / 1000;

    // Update state timer
    this.stateTimer -= deltaSeconds;

    // Check for state transition
    if (this.stateTimer <= 0) {
      this.transitionState();
    }

    // Update position if drifting
    if (this.state === "drifting") {
      this.position.x += this.velocity.x * deltaSeconds;
      this.position.y += this.velocity.y * deltaSeconds;

      // Bounce off edges with slight randomization
      this.handleEdgeBounce();
    }

    // Update store and re-render
    this.syncToStore();
    this.render();
  };

  /**
   * Transition between drifting and paused states.
   */
  private transitionState(): void {
    if (this.state === "drifting") {
      // Transition to paused
      this.state = "paused";
      this.stateTimer = this.randomPauseDuration();
    } else {
      // Transition to drifting with new direction
      this.state = "drifting";
      this.velocity = this.randomVelocity();
      this.stateTimer = this.randomDriftDuration();
    }
  }

  /**
   * Handle bouncing off screen edges.
   */
  private handleEdgeBounce(): void {
    const margin = this.reticleSize;
    const { width, height } = this.app.screen;

    // Bounce off left/right edges
    if (this.position.x < margin) {
      this.position.x = margin;
      this.velocity.x = Math.abs(this.velocity.x) * this.randomBounceVariation();
    } else if (this.position.x > width - margin) {
      this.position.x = width - margin;
      this.velocity.x = -Math.abs(this.velocity.x) * this.randomBounceVariation();
    }

    // Bounce off top/bottom edges
    if (this.position.y < margin) {
      this.position.y = margin;
      this.velocity.y = Math.abs(this.velocity.y) * this.randomBounceVariation();
    } else if (this.position.y > height - margin) {
      this.position.y = height - margin;
      this.velocity.y = -Math.abs(this.velocity.y) * this.randomBounceVariation();
    }
  }

  /**
   * Generate a random velocity vector within speed limits.
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
   * Generate a random drift duration (time until next pause).
   */
  private randomDriftDuration(): number {
    // Drift for 5-15 seconds before pausing
    return 5 + Math.random() * 10;
  }

  /**
   * Generate a random pause duration.
   */
  private randomPauseDuration(): number {
    return this.minPause + Math.random() * (this.maxPause - this.minPause);
  }

  /**
   * Random variation for edge bouncing (0.8-1.2).
   */
  private randomBounceVariation(): number {
    return 0.8 + Math.random() * 0.4;
  }

  /**
   * Sync current state to Zustand store.
   */
  private syncToStore(): void {
    const store = useGardenStore.getState();

    if (!store.reticle) {
      // Initialize reticle in store
      store.setReticle({
        id: "system-reticle",
        position: { ...this.position },
        size: this.reticleSize,
        velocity: { ...this.velocity },
        nextDirectionChange: this.stateTimer,
      });
    } else {
      // Update position
      store.updateReticlePosition({ ...this.position });
    }
  }

  /**
   * Render the reticle as a small cross.
   */
  private render(): void {
    this.graphics.clear();

    const { x, y } = this.position;
    const halfSize = Math.floor(this.reticleSize / 2);

    // Draw a cross pattern
    // Vertical line
    this.graphics.rect(x - 0.5, y - halfSize, 1, this.reticleSize);
    this.graphics.fill({ color: this.color, alpha: 0.8 });

    // Horizontal line
    this.graphics.rect(x - halfSize, y - 0.5, this.reticleSize, 1);
    this.graphics.fill({ color: this.color, alpha: 0.8 });
  }

  /**
   * Get the current reticle position.
   */
  getPosition(): Position {
    return { ...this.position };
  }

  /**
   * Get the current reticle bounding box.
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    const halfSize = this.reticleSize / 2;
    return {
      x: this.position.x - halfSize,
      y: this.position.y - halfSize,
      width: this.reticleSize,
      height: this.reticleSize,
    };
  }
}

/**
 * Factory function to create a ReticleController.
 */
export function createReticleController(app: Application): ReticleController {
  return new ReticleController(app);
}
