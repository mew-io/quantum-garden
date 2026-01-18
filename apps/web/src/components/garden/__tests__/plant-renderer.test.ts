/**
 * PlantRenderer Tests
 *
 * Tests the PlantRenderer class for:
 * - Sprite creation and management
 * - Store synchronization
 * - Lifecycle loop management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock PixiJS modules with proper class implementations
vi.mock("pixi.js", () => {
  class MockContainer {
    label = "";
    addChild = vi.fn();
    removeChild = vi.fn();
    destroy = vi.fn();
  }

  class MockTicker {
    add = vi.fn();
    remove = vi.fn();
    start = vi.fn();
    stop = vi.fn();
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
    Ticker: MockTicker,
    Graphics: MockGraphics,
  };
});

// Track subscribe callbacks
let subscribeCallback: ((state: { plants: unknown[] }) => void) | null = null;
const mockUnsubscribe = vi.fn();

// Mock the garden store
vi.mock("@/stores/garden-store", () => ({
  useGardenStore: {
    subscribe: vi.fn((callback: (state: { plants: unknown[] }) => void) => {
      subscribeCallback = callback;
      return mockUnsubscribe;
    }),
    getState: vi.fn(() => ({ plants: [] })),
  },
}));

// Mock the shared package
vi.mock("@quantum-garden/shared", () => ({
  computeLifecycleState: vi.fn(() => ({
    currentKeyframe: {
      time: 0,
      pattern: [[1]],
      scale: 1,
      opacity: 1,
    },
    nextKeyframe: null,
    keyframeProgress: 0,
  })),
  getEffectivePalette: vi.fn(() => ["#FF6B6B"]),
  interpolateKeyframes: vi.fn(),
  getVariantById: vi.fn(() => ({
    id: "simple-bloom",
    name: "Simple Bloom",
    lifecycleDuration: 3600,
    tweenBetweenKeyframes: false,
    keyframes: [{ time: 0, pattern: [[1]], palette: ["#FF6B6B"] }],
    rarity: "common",
    tags: [],
  })),
  GLYPH: {
    SUPERPOSED_OPACITY: 0.3,
    COLLAPSED_OPACITY: 1.0,
    MAX_SIZE: 32,
  },
}));

import { PlantRenderer } from "../plant-renderer";
import { useGardenStore } from "@/stores/garden-store";

// Create a mock Application
function createMockApp() {
  return {
    stage: {
      addChild: vi.fn(),
    },
    screen: { width: 800, height: 600 },
  } as unknown;
}

// Helper to create mock plant data
function createMockPlantData(id: string, overrides = {}) {
  return {
    id,
    position: { x: 100, y: 100 },
    observed: false,
    visualState: "superposed" as const,
    variantId: "simple-bloom",
    germinatedAt: new Date(),
    lifecycleModifier: 1.0,
    colorVariationName: null,
    quantumCircuitId: "circuit-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("PlantRenderer", () => {
  let mockApp: ReturnType<typeof createMockApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApp = createMockApp();
    subscribeCallback = null;
    mockUnsubscribe.mockClear();

    // Reset store mock to return empty plants by default
    vi.mocked(useGardenStore.getState).mockReturnValue({ plants: [] } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should create a renderer with empty sprites map", () => {
      const renderer = new PlantRenderer(mockApp as never);

      expect(renderer.getAllSprites()).toHaveLength(0);
    });

    it("should add plants container to stage", () => {
      const _renderer = new PlantRenderer(mockApp as never);

      expect(
        (mockApp as { stage: { addChild: ReturnType<typeof vi.fn> } }).stage.addChild
      ).toHaveBeenCalled();
    });
  });

  describe("start/stop", () => {
    it("should subscribe to store on start", () => {
      const renderer = new PlantRenderer(mockApp as never);
      renderer.start();

      expect(useGardenStore.subscribe).toHaveBeenCalled();
    });

    it("should not double-subscribe on multiple starts", () => {
      const renderer = new PlantRenderer(mockApp as never);
      renderer.start();
      renderer.start();

      expect(useGardenStore.subscribe).toHaveBeenCalledTimes(1);
    });

    it("should unsubscribe on stop", () => {
      const renderer = new PlantRenderer(mockApp as never);
      renderer.start();
      renderer.stop();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it("should handle stop when not started", () => {
      const renderer = new PlantRenderer(mockApp as never);

      // Should not throw
      expect(() => renderer.stop()).not.toThrow();
    });
  });

  describe("sprite management", () => {
    it("should create sprites for initial plants", () => {
      const plants = [createMockPlantData("plant-1"), createMockPlantData("plant-2")];

      vi.mocked(useGardenStore.getState).mockReturnValue({ plants } as never);

      const renderer = new PlantRenderer(mockApp as never);
      renderer.start();

      expect(renderer.getAllSprites()).toHaveLength(2);
      expect(renderer.getSprite("plant-1")).toBeDefined();
      expect(renderer.getSprite("plant-2")).toBeDefined();
    });

    it("should add sprites when plants are added to store", () => {
      const renderer = new PlantRenderer(mockApp as never);
      renderer.start();

      expect(renderer.getAllSprites()).toHaveLength(0);

      // Simulate store update
      if (subscribeCallback) {
        subscribeCallback({
          plants: [createMockPlantData("plant-new")],
        });
      }

      expect(renderer.getAllSprites()).toHaveLength(1);
      expect(renderer.getSprite("plant-new")).toBeDefined();
    });

    it("should remove sprites when plants are removed from store", () => {
      const plants = [createMockPlantData("plant-1"), createMockPlantData("plant-2")];

      vi.mocked(useGardenStore.getState).mockReturnValue({ plants } as never);

      const renderer = new PlantRenderer(mockApp as never);
      renderer.start();

      expect(renderer.getAllSprites()).toHaveLength(2);

      // Simulate store update with one plant removed
      if (subscribeCallback) {
        subscribeCallback({
          plants: [createMockPlantData("plant-1")],
        });
      }

      expect(renderer.getAllSprites()).toHaveLength(1);
      expect(renderer.getSprite("plant-1")).toBeDefined();
      expect(renderer.getSprite("plant-2")).toBeUndefined();
    });

    it("should update existing sprites when plant data changes", () => {
      const plant = createMockPlantData("plant-1", { visualState: "superposed" });

      vi.mocked(useGardenStore.getState).mockReturnValue({ plants: [plant] } as never);

      const renderer = new PlantRenderer(mockApp as never);
      renderer.start();

      const sprite = renderer.getSprite("plant-1");
      expect(sprite).toBeDefined();

      // Simulate store update with changed plant state
      if (subscribeCallback) {
        subscribeCallback({
          plants: [createMockPlantData("plant-1", { visualState: "collapsed", observed: true })],
        });
      }

      // Same sprite instance should still exist
      expect(renderer.getSprite("plant-1")).toBe(sprite);
    });
  });

  describe("destroy", () => {
    it("should clean up all resources on destroy", () => {
      const plants = [createMockPlantData("plant-1")];

      vi.mocked(useGardenStore.getState).mockReturnValue({ plants } as never);

      const renderer = new PlantRenderer(mockApp as never);
      renderer.start();

      expect(renderer.getAllSprites()).toHaveLength(1);

      renderer.destroy();

      expect(renderer.getAllSprites()).toHaveLength(0);
    });

    it("should stop before destroying", () => {
      const renderer = new PlantRenderer(mockApp as never);
      renderer.start();
      renderer.destroy();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe("getContainer", () => {
    it("should return the plants container", () => {
      const renderer = new PlantRenderer(mockApp as never);

      const container = renderer.getContainer();

      expect(container).toBeDefined();
    });
  });

  describe("sprite lookup", () => {
    it("should return undefined for non-existent sprite", () => {
      const renderer = new PlantRenderer(mockApp as never);
      renderer.start();

      expect(renderer.getSprite("non-existent")).toBeUndefined();
    });

    it("should return all sprites as array", () => {
      const plants = [
        createMockPlantData("plant-1"),
        createMockPlantData("plant-2"),
        createMockPlantData("plant-3"),
      ];

      vi.mocked(useGardenStore.getState).mockReturnValue({ plants } as never);

      const renderer = new PlantRenderer(mockApp as never);
      renderer.start();

      const sprites = renderer.getAllSprites();

      expect(sprites).toHaveLength(3);
      expect(sprites.map((s) => s.plantId).sort()).toEqual(["plant-1", "plant-2", "plant-3"]);
    });
  });
});
