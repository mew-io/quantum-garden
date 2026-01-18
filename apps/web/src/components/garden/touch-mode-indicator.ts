/**
 * TouchModeIndicator - Visual feedback when touch mode activates
 *
 * Shows a brief expanding ring animation at the touch location
 * to confirm that the system detected the user's touch and
 * switched to touch control mode.
 */

import { Container, Graphics, Ticker } from "pixi.js";
import type { Application } from "pixi.js";

/** Visual constants for the touch indicator */
const TOUCH_INDICATOR = {
  /** Starting radius of the ring */
  START_RADIUS: 20,
  /** Ending radius of the ring (expands to this) */
  END_RADIUS: 60,
  /** Duration of the animation in seconds */
  DURATION: 0.6,
  /** Line width of the ring */
  LINE_WIDTH: 2,
  /** Color of the ring (soft cyan to match theme) */
  COLOR: 0x4ecdc4,
  /** Starting opacity */
  START_ALPHA: 0.8,
};

interface PulseAnimation {
  x: number;
  y: number;
  startTime: number;
}

/**
 * Renders a brief expanding ring animation when touch mode activates.
 *
 * This provides visual confirmation to mobile users that their touch
 * was detected and the reticle is now following their finger.
 */
export class TouchModeIndicator {
  private app: Application;
  private container: Container;
  private graphics: Graphics;
  private ticker: Ticker;
  private isRunning: boolean;
  private activePulse: PulseAnimation | null;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.container.label = "touch-mode-indicator";
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.ticker = new Ticker();
    this.isRunning = false;
    this.activePulse = null;

    // Add container to stage (on top of everything)
    this.app.stage.addChild(this.container);
  }

  /**
   * Start the touch mode indicator.
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Start render loop
    this.ticker.add(this.update, this);
    this.ticker.start();
  }

  /**
   * Stop the touch mode indicator.
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
   * Trigger a pulse animation at the given position.
   * Called when touch mode is activated.
   *
   * @param x - X coordinate of the pulse
   * @param y - Y coordinate of the pulse
   */
  triggerPulse(x: number, y: number): void {
    this.activePulse = {
      x,
      y,
      startTime: performance.now(),
    };
  }

  /**
   * Update loop - animates the pulse.
   */
  private update = (): void => {
    this.graphics.clear();

    if (!this.activePulse) {
      return;
    }

    const now = performance.now();
    const elapsed = (now - this.activePulse.startTime) / 1000;

    // Check if animation is complete
    if (elapsed >= TOUCH_INDICATOR.DURATION) {
      this.activePulse = null;
      return;
    }

    // Calculate animation progress (0 to 1)
    const progress = elapsed / TOUCH_INDICATOR.DURATION;

    // Ease out cubic for smooth deceleration
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    // Interpolate radius
    const radius =
      TOUCH_INDICATOR.START_RADIUS +
      (TOUCH_INDICATOR.END_RADIUS - TOUCH_INDICATOR.START_RADIUS) * easedProgress;

    // Fade out alpha
    const alpha = TOUCH_INDICATOR.START_ALPHA * (1 - progress);

    // Draw the expanding ring
    const { x, y } = this.activePulse;

    this.graphics.setStrokeStyle({
      width: TOUCH_INDICATOR.LINE_WIDTH,
      color: TOUCH_INDICATOR.COLOR,
      alpha,
    });
    this.graphics.circle(x, y, radius);
    this.graphics.stroke();
  };

  /**
   * Get the container for z-ordering.
   */
  getContainer(): Container {
    return this.container;
  }
}

/**
 * Factory function to create a TouchModeIndicator.
 */
export function createTouchModeIndicator(app: Application): TouchModeIndicator {
  return new TouchModeIndicator(app);
}
