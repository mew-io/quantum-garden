/**
 * PlantRenderer - Manages rendering of all plants in the garden
 *
 * This module handles:
 * - Creating and managing PlantSprite instances
 * - Updating plants each frame for smooth lifecycle animations
 * - Syncing with the Zustand garden store
 */

import { Container, Ticker } from "pixi.js";
import type { Application } from "pixi.js";
import { PlantSprite, type RenderablePlant } from "./plant-sprite";
import { useGardenStore } from "@/stores/garden-store";

/**
 * Manages all plant sprites in the garden.
 *
 * Plants are synchronized with the Zustand store, and each frame
 * triggers a re-render of all plants to reflect lifecycle changes.
 */
export class PlantRenderer {
  private app: Application;
  private container: Container;
  private sprites: Map<string, PlantSprite>;
  private ticker: Ticker;
  private isRunning: boolean;
  private storeUnsubscribe: (() => void) | null;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.container.label = "plants";
    this.sprites = new Map();
    this.ticker = new Ticker();
    this.isRunning = false;
    this.storeUnsubscribe = null;

    // Add container to stage
    this.app.stage.addChild(this.container);
  }

  /**
   * Start the plant renderer.
   *
   * Subscribes to the store and starts the render loop.
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Subscribe to store changes
    this.storeUnsubscribe = useGardenStore.subscribe((state) => {
      this.syncPlants(state.plants);
    });

    // Initial sync
    const initialPlants = useGardenStore.getState().plants;
    this.syncPlants(initialPlants);

    // Start render loop for lifecycle animations
    this.ticker.add(this.update, this);
    this.ticker.start();
  }

  /**
   * Stop the plant renderer.
   */
  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    // Unsubscribe from store
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
      this.storeUnsubscribe = null;
    }

    // Stop render loop
    this.ticker.stop();
    this.ticker.remove(this.update, this);
  }

  /**
   * Clean up resources.
   */
  destroy(): void {
    this.stop();
    this.sprites.forEach((sprite) => sprite.destroy());
    this.sprites.clear();
    this.container.destroy();
    this.ticker.destroy();
  }

  /**
   * Sync sprites with the current plant state.
   */
  private syncPlants(plants: unknown[]): void {
    const renderablePlants = plants.map(dbPlantToRenderable);
    const currentIds = new Set(renderablePlants.map((p) => p.id));

    // Remove sprites for plants that no longer exist
    for (const [id, sprite] of this.sprites) {
      if (!currentIds.has(id)) {
        this.container.removeChild(sprite);
        sprite.destroy();
        this.sprites.delete(id);
      }
    }

    // Add or update sprites for current plants
    for (const plant of renderablePlants) {
      const existing = this.sprites.get(plant.id);
      if (existing) {
        existing.updatePlant(plant);
      } else {
        const sprite = new PlantSprite(plant);
        this.sprites.set(plant.id, sprite);
        this.container.addChild(sprite);
      }
    }
  }

  /**
   * Update loop for lifecycle animations.
   *
   * Called every frame by the ticker.
   */
  private update(): void {
    // Re-render all sprites to update lifecycle state
    // This is efficient because lifecycle computation is lightweight
    for (const sprite of this.sprites.values()) {
      sprite.renderPlant();
    }
  }

  /**
   * Get a specific plant sprite by ID.
   */
  getSprite(plantId: string): PlantSprite | undefined {
    return this.sprites.get(plantId);
  }

  /**
   * Get all plant sprites.
   */
  getAllSprites(): PlantSprite[] {
    return Array.from(this.sprites.values());
  }

  /**
   * Get the plants container.
   */
  getContainer(): Container {
    return this.container;
  }
}

/**
 * Convert a database plant object to a RenderablePlant.
 *
 * The garden store uses the base Plant type, which needs to be
 * augmented with lifecycle fields for rendering.
 */
function dbPlantToRenderable(plant: unknown): RenderablePlant {
  const p = plant as Record<string, unknown>;

  return {
    id: (p.id as string) ?? "",
    position: (p.position as { x: number; y: number }) ?? { x: 0, y: 0 },
    observed: (p.observed as boolean) ?? false,
    visualState: (p.visualState as "superposed" | "collapsed") ?? "superposed",
    variantId: (p.variantId as string) ?? "simple-bloom",
    germinatedAt: p.germinatedAt ? new Date(p.germinatedAt as string | number | Date) : null,
    lifecycleModifier: (p.lifecycleModifier as number) ?? 1.0,
    colorVariationName: (p.colorVariationName as string | null) ?? null,
    entanglementGroupId: (p.entanglementGroupId as string | undefined) ?? undefined,
    traits: p.traits as RenderablePlant["traits"],
  };
}

/**
 * Factory function to create a PlantRenderer.
 */
export function createPlantRenderer(app: Application): PlantRenderer {
  return new PlantRenderer(app);
}
