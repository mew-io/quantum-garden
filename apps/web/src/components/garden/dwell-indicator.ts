/**
 * DwellIndicator - Visualizes observation progress around plants
 *
 * Draws a circular progress arc around plants being observed,
 * showing progress from 0-100% as the dwell time accumulates.
 * Particularly helpful for mobile users who need visual feedback
 * on their touch-and-hold observation progress.
 */

import { Container, Graphics, Ticker } from "pixi.js";
import type { Application } from "pixi.js";
import { useGardenStore } from "@/stores/garden-store";
import type { Plant } from "@quantum-garden/shared";

/** Visual constants for dwell indicator */
const DWELL_INDICATOR = {
  /** Radius of the progress ring (distance from plant center) */
  RADIUS: 35,
  /** Line width of the arc */
  LINE_WIDTH: 3,
  /** Color of the progress arc (soft cyan to match quantum theme) */
  ARC_COLOR: 0x4ecdc4,
  /** Background arc color (subtle track) */
  TRACK_COLOR: 0x374151,
  /** Opacity of the progress arc */
  ARC_ALPHA: 0.8,
  /** Opacity of the background track */
  TRACK_ALPHA: 0.3,
  /** Start angle (top of circle, in radians) */
  START_ANGLE: -Math.PI / 2,
};

/**
 * Renders a progress indicator around plants being observed.
 *
 * Subscribes to the garden store's dwell state and draws a
 * circular arc showing observation progress (0-1).
 */
export class DwellIndicator {
  private app: Application;
  private container: Container;
  private graphics: Graphics;
  private ticker: Ticker;
  private isRunning: boolean;
  private storeUnsubscribe: (() => void) | null;
  private currentTargetId: string | null;
  private currentProgress: number;
  private plants: Plant[];

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.container.label = "dwell-indicator";
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.ticker = new Ticker();
    this.isRunning = false;
    this.storeUnsubscribe = null;
    this.currentTargetId = null;
    this.currentProgress = 0;
    this.plants = [];

    // Add container to stage (above plants, below reticle)
    this.app.stage.addChild(this.container);
  }

  /**
   * Start the dwell indicator.
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Subscribe to store changes
    this.storeUnsubscribe = useGardenStore.subscribe((state) => {
      this.currentTargetId = state.dwellTarget;
      this.currentProgress = state.dwellProgress;
      this.plants = state.plants;
    });

    // Initial sync
    const state = useGardenStore.getState();
    this.currentTargetId = state.dwellTarget;
    this.currentProgress = state.dwellProgress;
    this.plants = state.plants;

    // Start render loop
    this.ticker.add(this.update, this);
    this.ticker.start();
  }

  /**
   * Stop the dwell indicator.
   */
  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
      this.storeUnsubscribe = null;
    }

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
   * Update loop - redraws the dwell indicator.
   */
  private update = (): void => {
    this.graphics.clear();

    // Only draw if there's an active dwell target
    if (!this.currentTargetId || this.currentProgress <= 0) {
      return;
    }

    // Find the target plant
    const targetPlant = this.plants.find((p) => p.id === this.currentTargetId);
    if (!targetPlant) {
      return;
    }

    const { x, y } = targetPlant.position;
    const { RADIUS, LINE_WIDTH, ARC_COLOR, TRACK_COLOR, ARC_ALPHA, TRACK_ALPHA, START_ANGLE } =
      DWELL_INDICATOR;

    // Draw background track (full circle, subtle)
    this.graphics.setStrokeStyle({
      width: LINE_WIDTH,
      color: TRACK_COLOR,
      alpha: TRACK_ALPHA,
    });
    this.graphics.arc(x, y, RADIUS, 0, Math.PI * 2);
    this.graphics.stroke();

    // Draw progress arc
    if (this.currentProgress > 0) {
      const endAngle = START_ANGLE + this.currentProgress * Math.PI * 2;

      this.graphics.setStrokeStyle({
        width: LINE_WIDTH,
        color: ARC_COLOR,
        alpha: ARC_ALPHA,
      });
      this.graphics.arc(x, y, RADIUS, START_ANGLE, endAngle);
      this.graphics.stroke();
    }
  };

  /**
   * Get the container for z-ordering.
   */
  getContainer(): Container {
    return this.container;
  }
}

/**
 * Factory function to create a DwellIndicator.
 */
export function createDwellIndicator(app: Application): DwellIndicator {
  return new DwellIndicator(app);
}
