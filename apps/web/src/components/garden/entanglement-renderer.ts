/**
 * EntanglementRenderer - Visualizes quantum entanglement connections
 *
 * Draws subtle connecting lines between entangled plants to show
 * their quantum correlation. When one plant is observed, the
 * connection pulses to indicate the correlated reveal.
 */

import { Container, Graphics, Ticker } from "pixi.js";
import type { Application } from "pixi.js";
import { useGardenStore } from "@/stores/garden-store";
import type { Plant } from "@quantum-garden/shared";

/** Visual constants for entanglement lines */
const ENTANGLEMENT = {
  /** Base color for entanglement lines (soft purple) */
  LINE_COLOR: 0x9b87f5,
  /** Line width in pixels */
  LINE_WIDTH: 1.5,
  /** Base opacity of the line */
  LINE_ALPHA: 0.3,
  /** Opacity when pulsing (after observation) */
  PULSE_ALPHA: 0.8,
  /** Duration of pulse animation in seconds */
  PULSE_DURATION: 2.0,
  /** Dash pattern for the line [dash length, gap length] */
  DASH_PATTERN: [8, 4] as [number, number],
};

interface EntanglementGroup {
  groupId: string;
  plants: Plant[];
}

/**
 * Renders visual connections between entangled plants.
 *
 * Subscribes to the garden store and updates whenever plant
 * data changes. Connections are drawn as subtle dashed lines
 * that pulse when an observation occurs.
 */
export class EntanglementRenderer {
  private app: Application;
  private container: Container;
  private graphics: Graphics;
  private ticker: Ticker;
  private isRunning: boolean;
  private storeUnsubscribe: (() => void) | null;
  private groups: EntanglementGroup[];
  private pulsingGroups: Map<string, number>; // groupId -> pulse start time

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.container.label = "entanglement";
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.ticker = new Ticker();
    this.isRunning = false;
    this.storeUnsubscribe = null;
    this.groups = [];
    this.pulsingGroups = new Map();

    // Add container to stage (behind plants)
    this.app.stage.addChildAt(this.container, 0);
  }

  /**
   * Start the entanglement renderer.
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Subscribe to store changes
    this.storeUnsubscribe = useGardenStore.subscribe((state) => {
      this.updateGroups(state.plants);
    });

    // Initial sync
    const initialPlants = useGardenStore.getState().plants;
    this.updateGroups(initialPlants);

    // Start render loop
    this.ticker.add(this.update, this);
    this.ticker.start();
  }

  /**
   * Stop the entanglement renderer.
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
   * Update entanglement groups from plant data.
   */
  private updateGroups(plants: Plant[]): void {
    // Group plants by entanglement group ID
    const groupMap = new Map<string, Plant[]>();

    for (const plant of plants) {
      if (plant.entanglementGroupId) {
        const group = groupMap.get(plant.entanglementGroupId) ?? [];
        group.push(plant);
        groupMap.set(plant.entanglementGroupId, group);
      }
    }

    // Convert to array of groups (only groups with 2+ plants)
    this.groups = Array.from(groupMap.entries())
      .filter(([_, plants]) => plants.length >= 2)
      .map(([groupId, plants]) => ({ groupId, plants }));
  }

  /**
   * Trigger a pulse animation for an entanglement group.
   * Called when an entangled plant is observed.
   */
  triggerPulse(groupId: string): void {
    this.pulsingGroups.set(groupId, performance.now());
  }

  /**
   * Update loop - redraws entanglement connections.
   */
  private update = (): void => {
    this.graphics.clear();

    const now = performance.now();

    for (const group of this.groups) {
      // Calculate alpha based on pulse state
      let alpha = ENTANGLEMENT.LINE_ALPHA;
      const pulseStart = this.pulsingGroups.get(group.groupId);

      if (pulseStart !== undefined) {
        const elapsed = (now - pulseStart) / 1000;
        if (elapsed < ENTANGLEMENT.PULSE_DURATION) {
          // Pulse effect: quick rise, slow fade
          const progress = elapsed / ENTANGLEMENT.PULSE_DURATION;
          const pulseIntensity = Math.sin(progress * Math.PI);
          alpha =
            ENTANGLEMENT.LINE_ALPHA +
            (ENTANGLEMENT.PULSE_ALPHA - ENTANGLEMENT.LINE_ALPHA) * pulseIntensity;
        } else {
          // Pulse complete, remove from tracking
          this.pulsingGroups.delete(group.groupId);
        }
      }

      // Draw connections between all plants in the group
      this.drawGroupConnections(group.plants, alpha);
    }
  };

  /**
   * Draw connections between all plants in an entanglement group.
   */
  private drawGroupConnections(plants: Plant[], alpha: number): void {
    if (plants.length < 2) return;

    // Draw lines between consecutive plants (creates a path)
    // For larger groups, could use a different topology
    for (let i = 0; i < plants.length - 1; i++) {
      const p1 = plants[i]!;
      const p2 = plants[i + 1]!;

      this.drawDashedLine(p1.position.x, p1.position.y, p2.position.x, p2.position.y, alpha);
    }

    // If more than 2 plants, close the loop
    if (plants.length > 2) {
      const first = plants[0]!;
      const last = plants[plants.length - 1]!;
      this.drawDashedLine(
        last.position.x,
        last.position.y,
        first.position.x,
        first.position.y,
        alpha
      );
    }
  }

  /**
   * Draw a dashed line between two points.
   */
  private drawDashedLine(x1: number, y1: number, x2: number, y2: number, alpha: number): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const [dashLength, gapLength] = ENTANGLEMENT.DASH_PATTERN;
    const segmentLength = dashLength + gapLength;
    const numSegments = Math.floor(distance / segmentLength);

    // Normalize direction
    const nx = dx / distance;
    const ny = dy / distance;

    this.graphics.setStrokeStyle({
      width: ENTANGLEMENT.LINE_WIDTH,
      color: ENTANGLEMENT.LINE_COLOR,
      alpha,
    });

    for (let i = 0; i < numSegments; i++) {
      const startOffset = i * segmentLength;
      const endOffset = startOffset + dashLength;

      const startX = x1 + nx * startOffset;
      const startY = y1 + ny * startOffset;
      const endX = x1 + nx * Math.min(endOffset, distance);
      const endY = y1 + ny * Math.min(endOffset, distance);

      this.graphics.moveTo(startX, startY);
      this.graphics.lineTo(endX, endY);
      this.graphics.stroke();
    }

    // Draw remaining partial dash if any
    const remaining = distance - numSegments * segmentLength;
    if (remaining > 0) {
      const startX = x1 + nx * numSegments * segmentLength;
      const startY = y1 + ny * numSegments * segmentLength;
      const endX = x1 + nx * Math.min(numSegments * segmentLength + dashLength, distance);
      const endY = y1 + ny * Math.min(numSegments * segmentLength + dashLength, distance);

      this.graphics.moveTo(startX, startY);
      this.graphics.lineTo(endX, endY);
      this.graphics.stroke();
    }
  }

  /**
   * Get the container for z-ordering.
   */
  getContainer(): Container {
    return this.container;
  }
}

/**
 * Factory function to create an EntanglementRenderer.
 */
export function createEntanglementRenderer(app: Application): EntanglementRenderer {
  return new EntanglementRenderer(app);
}
