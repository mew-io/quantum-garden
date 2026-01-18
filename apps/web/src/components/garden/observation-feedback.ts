/**
 * ObservationFeedback - Visual celebration when observation completes
 *
 * Shows expanding rings with a brief glow effect at the plant location
 * to confirm that the observation succeeded and traits have been revealed.
 * Provides satisfying feedback for mobile users completing touch-and-hold.
 */

import { Container, Graphics, Ticker } from "pixi.js";
import type { Application } from "pixi.js";

/** Visual constants for the observation feedback */
const OBSERVATION_FEEDBACK = {
  /** Starting radius of the inner ring */
  INNER_START_RADIUS: 25,
  /** Ending radius of the inner ring */
  INNER_END_RADIUS: 50,
  /** Starting radius of the outer ring (starts later, goes further) */
  OUTER_START_RADIUS: 30,
  /** Ending radius of the outer ring */
  OUTER_END_RADIUS: 70,
  /** Duration of the animation in seconds */
  DURATION: 0.8,
  /** Delay before outer ring starts (staggered effect) */
  OUTER_DELAY: 0.1,
  /** Line width of the rings */
  LINE_WIDTH: 2.5,
  /** Primary color (bright cyan) */
  PRIMARY_COLOR: 0x4ecdc4,
  /** Secondary color (soft white) */
  SECONDARY_COLOR: 0xffffff,
  /** Starting opacity */
  START_ALPHA: 0.9,
};

interface FeedbackAnimation {
  x: number;
  y: number;
  startTime: number;
}

/**
 * Renders celebratory feedback when an observation completes.
 *
 * Shows two staggered expanding rings that create a satisfying
 * "completion" effect, confirming to the user that their observation
 * succeeded and the plant's traits have been revealed.
 */
export class ObservationFeedback {
  private app: Application;
  private container: Container;
  private graphics: Graphics;
  private ticker: Ticker;
  private isRunning: boolean;
  private activeAnimations: FeedbackAnimation[];

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.container.label = "observation-feedback";
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.ticker = new Ticker();
    this.isRunning = false;
    this.activeAnimations = [];

    // Add container to stage (on top of plants, below reticle)
    this.app.stage.addChild(this.container);
  }

  /**
   * Start the observation feedback system.
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Start render loop
    this.ticker.add(this.update, this);
    this.ticker.start();
  }

  /**
   * Stop the observation feedback system.
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
    this.container.destroy();
    this.ticker.destroy();
  }

  /**
   * Trigger a celebration animation at the given position.
   * Called when an observation completes successfully.
   *
   * @param x - X coordinate of the observed plant
   * @param y - Y coordinate of the observed plant
   */
  triggerCelebration(x: number, y: number): void {
    this.activeAnimations.push({
      x,
      y,
      startTime: performance.now(),
    });
  }

  /**
   * Update loop - animates all active celebrations.
   */
  private update = (): void => {
    this.graphics.clear();

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

      // Draw inner ring (starts immediately)
      this.drawRing(
        anim.x,
        anim.y,
        elapsed,
        0,
        OBSERVATION_FEEDBACK.INNER_START_RADIUS,
        OBSERVATION_FEEDBACK.INNER_END_RADIUS,
        OBSERVATION_FEEDBACK.PRIMARY_COLOR
      );

      // Draw outer ring (starts after delay)
      const outerElapsed = elapsed - OBSERVATION_FEEDBACK.OUTER_DELAY;
      if (outerElapsed > 0) {
        this.drawRing(
          anim.x,
          anim.y,
          outerElapsed,
          OBSERVATION_FEEDBACK.OUTER_DELAY,
          OBSERVATION_FEEDBACK.OUTER_START_RADIUS,
          OBSERVATION_FEEDBACK.OUTER_END_RADIUS,
          OBSERVATION_FEEDBACK.SECONDARY_COLOR
        );
      }
    }

    // Remove completed animations (in reverse order to maintain indices)
    for (let i = completedIndices.length - 1; i >= 0; i--) {
      this.activeAnimations.splice(completedIndices[i]!, 1);
    }
  };

  /**
   * Draw a single expanding ring.
   */
  private drawRing(
    x: number,
    y: number,
    elapsed: number,
    delay: number,
    startRadius: number,
    endRadius: number,
    color: number
  ): void {
    const adjustedDuration = OBSERVATION_FEEDBACK.DURATION - delay;
    const progress = Math.min(1, elapsed / adjustedDuration);

    // Ease out cubic for smooth deceleration
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    // Interpolate radius
    const radius = startRadius + (endRadius - startRadius) * easedProgress;

    // Fade out alpha (faster fade at the end)
    const alpha = OBSERVATION_FEEDBACK.START_ALPHA * Math.pow(1 - progress, 1.5);

    // Draw the ring
    this.graphics.setStrokeStyle({
      width: OBSERVATION_FEEDBACK.LINE_WIDTH,
      color,
      alpha,
    });
    this.graphics.circle(x, y, radius);
    this.graphics.stroke();
  }

  /**
   * Get the container for z-ordering.
   */
  getContainer(): Container {
    return this.container;
  }
}

/**
 * Factory function to create an ObservationFeedback instance.
 */
export function createObservationFeedback(app: Application): ObservationFeedback {
  return new ObservationFeedback(app);
}
