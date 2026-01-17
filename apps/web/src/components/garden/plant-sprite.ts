/**
 * PlantSprite - PixiJS rendering for a single plant
 *
 * Renders plants using their lifecycle state, handling both superposed
 * and collapsed visual states. Lifecycle is computed on each frame.
 */

import { Container, Graphics } from "pixi.js";
import type { PlantWithLifecycle, PlantVariant } from "@quantum-garden/shared";
import {
  computeLifecycleState,
  getEffectivePalette,
  interpolateKeyframes,
  getVariantById,
  GLYPH,
} from "@quantum-garden/shared";

const GRID_SIZE = 8;
const DEFAULT_SCALE = 4; // 4 pixels per grid cell = 32x32 plant

/**
 * Represents a renderable plant in the garden.
 *
 * This combines the database Plant fields with lifecycle fields needed
 * for rendering. The API layer should map DB plants to this format.
 */
export interface RenderablePlant extends PlantWithLifecycle {
  position: { x: number; y: number };
  observed: boolean;
  visualState: "superposed" | "collapsed";
  traits?: {
    glyphPattern?: number[][];
    colorPalette?: string[];
    opacity?: number;
  };
}

interface PlantSpriteOptions {
  cellSize?: number;
}

/** Duration of the collapse transition in seconds */
const COLLAPSE_TRANSITION_DURATION = 1.5;

/**
 * A PixiJS container that renders a single plant.
 *
 * The sprite automatically computes its lifecycle state and renders
 * the appropriate keyframe. For superposed plants, it renders multiple
 * faint overlays representing possible states.
 *
 * When a plant is observed, a subtle crossfade transition occurs from
 * the superposed rendering to the collapsed form.
 */
export class PlantSprite extends Container {
  private plant: RenderablePlant;
  private variant: PlantVariant | undefined;
  private graphics: Graphics;
  private cellSize: number;

  // Transition state for collapse animation
  private isTransitioning: boolean;
  private transitionProgress: number; // 0 = superposed, 1 = collapsed
  private transitionStartTime: number;
  private previousVisualState: "superposed" | "collapsed";

  constructor(plant: RenderablePlant, options: PlantSpriteOptions = {}) {
    super();

    this.plant = plant;
    this.cellSize = options.cellSize ?? DEFAULT_SCALE;
    this.variant = getVariantById(plant.variantId);
    this.graphics = new Graphics();

    // Initialize transition state
    this.isTransitioning = false;
    this.transitionProgress = plant.visualState === "collapsed" ? 1 : 0;
    this.transitionStartTime = 0;
    this.previousVisualState = plant.visualState;

    this.addChild(this.graphics);
    this.updatePosition();
    this.renderPlant();
  }

  /**
   * Update the plant data and re-render.
   *
   * Detects state changes and triggers the collapse transition animation.
   */
  updatePlant(plant: RenderablePlant): void {
    // Detect transition from superposed to collapsed
    if (
      this.previousVisualState === "superposed" &&
      plant.visualState === "collapsed" &&
      !this.isTransitioning
    ) {
      this.startCollapseTransition();
    }

    this.previousVisualState = plant.visualState;
    this.plant = plant;
    this.variant = getVariantById(plant.variantId);
    this.updatePosition();
    this.renderPlant();
  }

  /**
   * Start the collapse transition animation.
   */
  private startCollapseTransition(): void {
    this.isTransitioning = true;
    this.transitionProgress = 0;
    this.transitionStartTime = performance.now();
  }

  /**
   * Update position from plant data.
   */
  private updatePosition(): void {
    // Center the sprite on the plant position
    const size = GRID_SIZE * this.cellSize;
    this.x = this.plant.position.x - size / 2;
    this.y = this.plant.position.y - size / 2;
  }

  /**
   * Render the plant based on its current lifecycle state.
   *
   * During a collapse transition, this blends between the superposed
   * and collapsed renderings for a smooth visual crossfade.
   */
  renderPlant(): void {
    this.graphics.clear();

    if (!this.variant) {
      this.renderFallback();
      return;
    }

    // Update transition progress if animating
    if (this.isTransitioning) {
      const elapsed = (performance.now() - this.transitionStartTime) / 1000;
      this.transitionProgress = Math.min(1, elapsed / COLLAPSE_TRANSITION_DURATION);

      if (this.transitionProgress >= 1) {
        this.isTransitioning = false;
        this.transitionProgress = 1;
      }
    }

    // Render based on state and transition
    if (this.plant.visualState === "superposed" && !this.isTransitioning) {
      this.renderSuperposed();
    } else if (this.isTransitioning) {
      // During transition: crossfade from superposed to collapsed
      this.renderTransition();
    } else {
      this.renderCollapsed();
    }
  }

  /**
   * Render the transition from superposed to collapsed.
   *
   * Uses a smooth crossfade: superposed fades out while collapsed fades in.
   */
  private renderTransition(): void {
    if (!this.variant) return;

    // Ease function for smoother transition (ease-out cubic)
    const eased = 1 - Math.pow(1 - this.transitionProgress, 3);

    // Render fading superposed layers
    const superposedOpacity = GLYPH.SUPERPOSED_OPACITY * (1 - eased);
    if (superposedOpacity > 0.01) {
      const keyframes = this.variant.keyframes.slice(0, 3);
      keyframes.forEach((keyframe, index) => {
        const palette = getEffectivePalette(keyframe, this.variant!, this.plant.colorVariationName);
        const offset = index * 1;
        this.drawKeyframe(
          keyframe.pattern,
          palette,
          superposedOpacity,
          keyframe.scale ?? 1,
          offset
        );
      });
    }

    // Render emerging collapsed form
    const collapsedOpacity = GLYPH.COLLAPSED_OPACITY * eased;
    if (collapsedOpacity > 0.01) {
      this.renderCollapsedWithOpacity(collapsedOpacity);
    }
  }

  /**
   * Render the collapsed state with a specific opacity.
   * Used during transition animation.
   */
  private renderCollapsedWithOpacity(targetOpacity: number): void {
    if (!this.variant) return;

    // If the plant has resolved traits from quantum measurement, use those
    if (this.plant.traits?.glyphPattern) {
      const pattern = this.plant.traits.glyphPattern;
      const palette = this.plant.traits.colorPalette ?? ["#888888", "#AAAAAA", "#CCCCCC"];
      const baseOpacity = this.plant.traits.opacity ?? GLYPH.COLLAPSED_OPACITY;
      this.drawKeyframe(pattern, palette, baseOpacity * targetOpacity, 1, 0);
      return;
    }

    // Otherwise compute lifecycle state
    const state = computeLifecycleState(this.plant, this.variant, new Date());
    const keyframe = state.currentKeyframe;
    const palette = getEffectivePalette(keyframe, this.variant, this.plant.colorVariationName);

    let pattern = keyframe.pattern;
    let opacity = keyframe.opacity ?? GLYPH.COLLAPSED_OPACITY;
    let effectiveScale = keyframe.scale ?? 1;

    // Interpolate if tweening is enabled
    if (this.variant.tweenBetweenKeyframes && state.nextKeyframe) {
      const interpolated = interpolateKeyframes(
        keyframe,
        state.nextKeyframe,
        state.keyframeProgress
      );
      pattern = interpolated.pattern;
      opacity = interpolated.opacity;
      effectiveScale = interpolated.scale;
    }

    this.drawKeyframe(pattern, palette, opacity * targetOpacity, effectiveScale, 0);
  }

  /**
   * Render a superposed plant showing multiple possible states.
   */
  private renderSuperposed(): void {
    if (!this.variant) return;

    // For superposed state, show multiple keyframes at low opacity
    // to suggest the quantum uncertainty of the plant's form
    const keyframes = this.variant.keyframes.slice(0, 3);
    const opacity = GLYPH.SUPERPOSED_OPACITY;

    keyframes.forEach((keyframe, index) => {
      const palette = getEffectivePalette(keyframe, this.variant!, this.plant.colorVariationName);
      // Slight offset for visual layering effect
      const offset = index * 1;
      this.drawKeyframe(keyframe.pattern, palette, opacity, keyframe.scale ?? 1, offset);
    });
  }

  /**
   * Render a collapsed plant showing its resolved form.
   */
  private renderCollapsed(): void {
    if (!this.variant) return;

    // If the plant has resolved traits from quantum measurement, use those
    if (this.plant.traits?.glyphPattern) {
      const pattern = this.plant.traits.glyphPattern;
      const palette = this.plant.traits.colorPalette ?? ["#888888", "#AAAAAA", "#CCCCCC"];
      const opacity = this.plant.traits.opacity ?? GLYPH.COLLAPSED_OPACITY;
      this.drawKeyframe(pattern, palette, opacity, 1, 0);
      return;
    }

    // Otherwise compute lifecycle state
    const state = computeLifecycleState(this.plant, this.variant, new Date());
    const keyframe = state.currentKeyframe;
    const palette = getEffectivePalette(keyframe, this.variant, this.plant.colorVariationName);

    let pattern = keyframe.pattern;
    let opacity = keyframe.opacity ?? GLYPH.COLLAPSED_OPACITY;
    let effectiveScale = keyframe.scale ?? 1;

    // Interpolate if tweening is enabled
    if (this.variant.tweenBetweenKeyframes && state.nextKeyframe) {
      const interpolated = interpolateKeyframes(
        keyframe,
        state.nextKeyframe,
        state.keyframeProgress
      );
      pattern = interpolated.pattern;
      opacity = interpolated.opacity;
      effectiveScale = interpolated.scale;
    }

    this.drawKeyframe(pattern, palette, opacity, effectiveScale, 0);
  }

  /**
   * Draw a single keyframe pattern.
   */
  private drawKeyframe(
    pattern: number[][],
    palette: string[],
    opacity: number,
    keyframeScale: number,
    offset: number
  ): void {
    const pixelSize = this.cellSize * keyframeScale;

    for (let y = 0; y < GRID_SIZE; y++) {
      const row = pattern[y];
      if (!row) continue;

      for (let x = 0; x < GRID_SIZE; x++) {
        const cellValue = row[x];
        if (cellValue && cellValue > 0) {
          // Determine color based on distance from center (gradient effect)
          const distFromCenter = Math.sqrt(
            Math.pow(x - GRID_SIZE / 2, 2) + Math.pow(y - GRID_SIZE / 2, 2)
          );
          const maxDist = Math.sqrt(2) * (GRID_SIZE / 2);
          const colorIndex = Math.min(
            palette.length - 1,
            Math.floor((distFromCenter / maxDist) * palette.length)
          );

          const color = palette[colorIndex] ?? palette[0] ?? "#888888";
          const numColor = parseInt(color.replace("#", ""), 16);

          this.graphics.rect(offset + x * pixelSize, offset + y * pixelSize, pixelSize, pixelSize);
          this.graphics.fill({ color: numColor, alpha: opacity });
        }
      }
    }
  }

  /**
   * Render a fallback when variant is not found.
   */
  private renderFallback(): void {
    // Simple placeholder square
    const size = GRID_SIZE * this.cellSize;
    this.graphics.rect(0, 0, size, size);
    this.graphics.fill({ color: 0x888888, alpha: 0.3 });
  }

  /**
   * Get the plant ID.
   */
  get plantId(): string {
    return this.plant.id;
  }

  /**
   * Check if the plant is currently in a collapse transition.
   */
  get isCollapseTransitioning(): boolean {
    return this.isTransitioning;
  }

  /**
   * Get the current transition progress (0-1).
   * Returns 1 if not transitioning.
   */
  get collapseProgress(): number {
    return this.transitionProgress;
  }
}
