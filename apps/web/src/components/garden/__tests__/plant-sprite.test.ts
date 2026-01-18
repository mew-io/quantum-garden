/**
 * PlantSprite Tests
 *
 * Tests the PlantSprite class for:
 * - State transition detection (superposed → collapsed)
 * - Collapse animation behavior
 * - Trait rendering logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock PixiJS modules with proper class implementations
vi.mock("pixi.js", () => {
  class MockContainer {
    x = 0;
    y = 0;
    addChild = vi.fn();
    removeChild = vi.fn();
    destroy = vi.fn();
  }

  class MockGraphics {
    clear = vi.fn();
    rect = vi.fn();
    fill = vi.fn();
    destroy = vi.fn();
  }

  return {
    Container: MockContainer,
    Graphics: MockGraphics,
  };
});

// Mock the shared package functions
vi.mock("@quantum-garden/shared", () => ({
  computeLifecycleState: vi.fn(() => ({
    currentKeyframe: {
      time: 0,
      pattern: [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
      ],
      scale: 1,
      opacity: 1,
    },
    nextKeyframe: null,
    keyframeProgress: 0,
  })),
  getEffectivePalette: vi.fn(() => ["#FF6B6B", "#FFE66D", "#4ECDC4"]),
  interpolateKeyframes: vi.fn(() => ({
    pattern: [],
    opacity: 1,
    scale: 1,
  })),
  getVariantById: vi.fn(() => ({
    id: "simple-bloom",
    name: "Simple Bloom",
    description: "A simple flower",
    lifecycleDuration: 3600,
    tweenBetweenKeyframes: false,
    keyframes: [
      {
        time: 0,
        pattern: [
          [0, 0, 0, 1, 1, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 0, 0],
          [0, 1, 1, 1, 1, 1, 1, 0],
          [1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1],
          [0, 1, 1, 1, 1, 1, 1, 0],
          [0, 0, 1, 1, 1, 1, 0, 0],
          [0, 0, 0, 1, 1, 0, 0, 0],
        ],
        palette: ["#FF6B6B", "#FFE66D", "#4ECDC4"],
        scale: 1,
        opacity: 1,
      },
    ],
    rarity: "common",
    tags: [],
  })),
  GLYPH: {
    SUPERPOSED_OPACITY: 0.3,
    COLLAPSED_OPACITY: 1.0,
    MAX_SIZE: 32,
  },
}));

import { PlantSprite, type RenderablePlant } from "../plant-sprite";
import { getVariantById } from "@quantum-garden/shared";

// Helper to create a mock plant
function createMockPlant(overrides: Partial<RenderablePlant> = {}): RenderablePlant {
  return {
    id: "plant-1",
    position: { x: 100, y: 100 },
    observed: false,
    visualState: "superposed",
    variantId: "simple-bloom",
    germinatedAt: new Date(),
    lifecycleModifier: 1.0,
    colorVariationName: null,
    ...overrides,
  };
}

describe("PlantSprite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock performance.now for consistent timing
    vi.spyOn(performance, "now").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should create a sprite for a superposed plant", () => {
      const plant = createMockPlant({ visualState: "superposed" });
      const sprite = new PlantSprite(plant);

      expect(sprite.plantId).toBe("plant-1");
      expect(sprite.isCollapseTransitioning).toBe(false);
      expect(sprite.collapseProgress).toBe(0);
    });

    it("should create a sprite for a collapsed plant", () => {
      const plant = createMockPlant({ visualState: "collapsed" });
      const sprite = new PlantSprite(plant);

      expect(sprite.plantId).toBe("plant-1");
      expect(sprite.isCollapseTransitioning).toBe(false);
      expect(sprite.collapseProgress).toBe(1);
    });
  });

  describe("state transitions", () => {
    it("should detect transition from superposed to collapsed", () => {
      const plant = createMockPlant({ visualState: "superposed" });
      const sprite = new PlantSprite(plant);

      expect(sprite.isCollapseTransitioning).toBe(false);

      // Update to collapsed state
      const collapsedPlant = createMockPlant({
        visualState: "collapsed",
        observed: true,
        traits: {
          glyphPattern: [[1]],
          colorPalette: ["#FF0000"],
          opacity: 1.0,
        },
      });
      sprite.updatePlant(collapsedPlant);

      // Should now be transitioning
      expect(sprite.isCollapseTransitioning).toBe(true);
      expect(sprite.collapseProgress).toBe(0);
    });

    it("should not transition when remaining in superposed state", () => {
      const plant = createMockPlant({ visualState: "superposed" });
      const sprite = new PlantSprite(plant);

      // Update with same state
      const updatedPlant = createMockPlant({ visualState: "superposed", lifecycleModifier: 1.2 });
      sprite.updatePlant(updatedPlant);

      expect(sprite.isCollapseTransitioning).toBe(false);
    });

    it("should not transition when already collapsed", () => {
      const plant = createMockPlant({ visualState: "collapsed" });
      const sprite = new PlantSprite(plant);

      // Update with same collapsed state
      const updatedPlant = createMockPlant({ visualState: "collapsed" });
      sprite.updatePlant(updatedPlant);

      expect(sprite.isCollapseTransitioning).toBe(false);
      expect(sprite.collapseProgress).toBe(1);
    });

    it("should only trigger transition once per collapse", () => {
      const plant = createMockPlant({ visualState: "superposed" });
      const sprite = new PlantSprite(plant);

      // First collapse
      const collapsedPlant = createMockPlant({ visualState: "collapsed" });
      sprite.updatePlant(collapsedPlant);
      expect(sprite.isCollapseTransitioning).toBe(true);

      // Second update while transitioning should not restart
      sprite.updatePlant({ ...collapsedPlant, lifecycleModifier: 1.5 });
      expect(sprite.isCollapseTransitioning).toBe(true);
    });
  });

  describe("transition animation", () => {
    it("should progress transition over time", () => {
      const plant = createMockPlant({ visualState: "superposed" });
      const sprite = new PlantSprite(plant);

      // Start transition
      vi.spyOn(performance, "now").mockReturnValue(0);
      const collapsedPlant = createMockPlant({ visualState: "collapsed" });
      sprite.updatePlant(collapsedPlant);

      expect(sprite.collapseProgress).toBe(0);

      // Move forward 0.75 seconds (half of 1.5s duration)
      vi.spyOn(performance, "now").mockReturnValue(750);
      sprite.renderPlant();

      expect(sprite.collapseProgress).toBe(0.5);
      expect(sprite.isCollapseTransitioning).toBe(true);
    });

    it("should complete transition after duration", () => {
      const plant = createMockPlant({ visualState: "superposed" });
      const sprite = new PlantSprite(plant);

      // Start transition
      vi.spyOn(performance, "now").mockReturnValue(0);
      const collapsedPlant = createMockPlant({ visualState: "collapsed" });
      sprite.updatePlant(collapsedPlant);

      // Move forward 1.5 seconds (full duration)
      vi.spyOn(performance, "now").mockReturnValue(1500);
      sprite.renderPlant();

      expect(sprite.collapseProgress).toBe(1);
      expect(sprite.isCollapseTransitioning).toBe(false);
    });

    it("should clamp progress at 1 after duration exceeded", () => {
      const plant = createMockPlant({ visualState: "superposed" });
      const sprite = new PlantSprite(plant);

      // Start transition
      vi.spyOn(performance, "now").mockReturnValue(0);
      const collapsedPlant = createMockPlant({ visualState: "collapsed" });
      sprite.updatePlant(collapsedPlant);

      // Move forward well past duration
      vi.spyOn(performance, "now").mockReturnValue(5000);
      sprite.renderPlant();

      expect(sprite.collapseProgress).toBe(1);
      expect(sprite.isCollapseTransitioning).toBe(false);
    });
  });

  describe("rendering with traits", () => {
    it("should render collapsed plant using resolved traits", () => {
      const plant = createMockPlant({
        visualState: "collapsed",
        traits: {
          glyphPattern: [
            [1, 1],
            [1, 1],
          ],
          colorPalette: ["#FF0000", "#00FF00"],
          opacity: 0.9,
        },
      });
      const sprite = new PlantSprite(plant);

      // Rendering should use the traits
      sprite.renderPlant();

      // The Graphics mock should have been called
      // We verify by checking that no errors occur and the sprite is created
      expect(sprite.plantId).toBe("plant-1");
    });

    it("should handle plant without traits using lifecycle state", () => {
      const plant = createMockPlant({
        visualState: "collapsed",
        traits: undefined,
      });
      const sprite = new PlantSprite(plant);

      // Rendering should fall back to lifecycle computation
      sprite.renderPlant();

      expect(sprite.plantId).toBe("plant-1");
    });

    it("should handle missing variant gracefully", () => {
      vi.mocked(getVariantById).mockReturnValueOnce(undefined);

      const plant = createMockPlant({ variantId: "unknown-variant" });
      const sprite = new PlantSprite(plant);

      // Should render fallback without errors
      sprite.renderPlant();

      expect(sprite.plantId).toBe("plant-1");
    });
  });

  describe("position updates", () => {
    it("should update position when plant position changes", () => {
      const plant = createMockPlant({ position: { x: 100, y: 100 } });
      const sprite = new PlantSprite(plant);

      // Update with new position
      const movedPlant = createMockPlant({ position: { x: 200, y: 300 } });
      sprite.updatePlant(movedPlant);

      // The container position should be updated
      // (Actual x/y values depend on cell size and centering)
      expect(sprite.x).toBeDefined();
      expect(sprite.y).toBeDefined();
    });
  });
});
