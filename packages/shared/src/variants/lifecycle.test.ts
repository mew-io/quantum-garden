/**
 * Lifecycle Computation Logic Tests
 *
 * Tests for the core lifecycle calculation functions that determine
 * which keyframe a plant is displaying at any given time.
 */

import { describe, it, expect } from "vitest";
import {
  getTotalDuration,
  getEffectiveDuration,
  computeLifecycleState,
  getActiveVisual,
  interpolateKeyframes,
  selectColorVariation,
  getEffectivePalette,
  growthRateToLifecycleModifier,
  isLifecycleComplete,
} from "./lifecycle";
import type { PlantVariant, PlantWithLifecycle, GlyphKeyframe } from "./types";

// =============================================================================
// Test Fixtures
// =============================================================================

const simplePattern: number[][] = [
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
];

// Alternate pattern available for future tests
const _alternatePattern: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

const createKeyframe = (name: string, duration: number): GlyphKeyframe => ({
  name,
  duration,
  pattern: simplePattern,
  palette: ["#F0C0C0", "#F0D0D0", "#F8E8E8"],
});

const createVariant = (overrides: Partial<PlantVariant> = {}): PlantVariant => ({
  id: "test-variant",
  name: "Test Variant",
  rarity: 1.0,
  requiresObservationToGerminate: false,
  keyframes: [
    createKeyframe("seed", 10),
    createKeyframe("sprout", 20),
    createKeyframe("bloom", 30),
  ],
  ...overrides,
});

const createPlant = (overrides: Partial<PlantWithLifecycle> = {}): PlantWithLifecycle => ({
  id: "test-plant",
  variantId: "test-variant",
  germinatedAt: new Date("2026-01-01T00:00:00Z"),
  lifecycleModifier: 1.0,
  colorVariationName: null,
  ...overrides,
});

// =============================================================================
// getTotalDuration Tests
// =============================================================================

describe("getTotalDuration", () => {
  it("should calculate total duration for a variant", () => {
    const variant = createVariant();
    expect(getTotalDuration(variant)).toBe(60); // 10 + 20 + 30
  });

  it("should apply lifecycle modifier correctly", () => {
    const variant = createVariant();
    expect(getTotalDuration(variant, 2.0)).toBe(30); // 60 / 2.0
    expect(getTotalDuration(variant, 0.5)).toBe(120); // 60 / 0.5
  });

  it("should clamp very low modifiers to prevent division by zero", () => {
    const variant = createVariant();
    expect(getTotalDuration(variant, 0.05)).toBe(600); // 60 / 0.1 (clamped)
  });

  it("should handle single keyframe variants", () => {
    const variant = createVariant({
      keyframes: [createKeyframe("static", 100)],
    });
    expect(getTotalDuration(variant)).toBe(100);
  });
});

// =============================================================================
// getEffectiveDuration Tests
// =============================================================================

describe("getEffectiveDuration", () => {
  it("should return original duration with modifier 1.0", () => {
    expect(getEffectiveDuration(10, 1.0)).toBe(10);
  });

  it("should halve duration with modifier 2.0", () => {
    expect(getEffectiveDuration(10, 2.0)).toBe(5);
  });

  it("should double duration with modifier 0.5", () => {
    expect(getEffectiveDuration(10, 0.5)).toBe(20);
  });

  it("should clamp very low modifiers", () => {
    expect(getEffectiveDuration(10, 0.01)).toBe(100); // 10 / 0.1 (clamped)
  });
});

// =============================================================================
// computeLifecycleState Tests
// =============================================================================

describe("computeLifecycleState", () => {
  describe("ungerminated plants", () => {
    it("should return first keyframe at 0 progress for ungerminated plants", () => {
      const variant = createVariant();
      const plant = createPlant({ germinatedAt: null });

      const state = computeLifecycleState(plant, variant);

      expect(state.currentKeyframe.name).toBe("seed");
      expect(state.keyframeIndex).toBe(0);
      expect(state.keyframeProgress).toBe(0);
      expect(state.totalProgress).toBe(0);
      expect(state.elapsedSeconds).toBe(0);
      expect(state.isComplete).toBe(false);
    });

    it("should provide next keyframe for ungerminated plants", () => {
      const variant = createVariant();
      const plant = createPlant({ germinatedAt: null });

      const state = computeLifecycleState(plant, variant);

      expect(state.nextKeyframe?.name).toBe("sprout");
    });
  });

  describe("germinated plants - first keyframe", () => {
    it("should be at start of first keyframe at germination time", () => {
      const variant = createVariant();
      const germinatedAt = new Date("2026-01-01T00:00:00Z");
      const plant = createPlant({ germinatedAt });

      const state = computeLifecycleState(plant, variant, germinatedAt);

      expect(state.currentKeyframe.name).toBe("seed");
      expect(state.keyframeIndex).toBe(0);
      expect(state.keyframeProgress).toBe(0);
      expect(state.elapsedSeconds).toBe(0);
    });

    it("should be mid-first keyframe after half duration", () => {
      const variant = createVariant();
      const germinatedAt = new Date("2026-01-01T00:00:00Z");
      const plant = createPlant({ germinatedAt });
      const now = new Date("2026-01-01T00:00:05Z"); // 5 seconds later

      const state = computeLifecycleState(plant, variant, now);

      expect(state.currentKeyframe.name).toBe("seed");
      expect(state.keyframeProgress).toBeCloseTo(0.5, 5); // 5/10 = 0.5
      expect(state.elapsedSeconds).toBe(5);
    });
  });

  describe("germinated plants - transitions", () => {
    it("should transition to second keyframe after first completes", () => {
      const variant = createVariant();
      const germinatedAt = new Date("2026-01-01T00:00:00Z");
      const plant = createPlant({ germinatedAt });
      const now = new Date("2026-01-01T00:00:15Z"); // 15 seconds later

      const state = computeLifecycleState(plant, variant, now);

      expect(state.currentKeyframe.name).toBe("sprout");
      expect(state.keyframeIndex).toBe(1);
      expect(state.keyframeProgress).toBeCloseTo(0.25, 5); // (15-10)/20 = 0.25
    });

    it("should be in third keyframe near end of lifecycle", () => {
      const variant = createVariant();
      const germinatedAt = new Date("2026-01-01T00:00:00Z");
      const plant = createPlant({ germinatedAt });
      const now = new Date("2026-01-01T00:00:45Z"); // 45 seconds later

      const state = computeLifecycleState(plant, variant, now);

      expect(state.currentKeyframe.name).toBe("bloom");
      expect(state.keyframeIndex).toBe(2);
      expect(state.keyframeProgress).toBeCloseTo(0.5, 5); // (45-30)/30 = 0.5
    });
  });

  describe("lifecycle completion", () => {
    it("should mark lifecycle complete after all keyframes", () => {
      const variant = createVariant();
      const germinatedAt = new Date("2026-01-01T00:00:00Z");
      const plant = createPlant({ germinatedAt });
      const now = new Date("2026-01-01T00:01:30Z"); // 90 seconds (past 60s lifecycle)

      const state = computeLifecycleState(plant, variant, now);

      expect(state.currentKeyframe.name).toBe("bloom");
      expect(state.keyframeProgress).toBe(1);
      expect(state.totalProgress).toBe(1);
      expect(state.isComplete).toBe(true);
      expect(state.nextKeyframe).toBeUndefined();
    });
  });

  describe("looping variants", () => {
    it("should loop back to first keyframe for looping variants", () => {
      const variant = createVariant({ loop: true });
      const germinatedAt = new Date("2026-01-01T00:00:00Z");
      const plant = createPlant({ germinatedAt });
      const now = new Date("2026-01-01T00:01:05Z"); // 65 seconds (5 into second loop)

      const state = computeLifecycleState(plant, variant, now);

      expect(state.currentKeyframe.name).toBe("seed");
      expect(state.keyframeIndex).toBe(0);
      expect(state.keyframeProgress).toBeCloseTo(0.5, 5); // 5/10 = 0.5
      expect(state.isComplete).toBe(false);
    });

    it("should not have prevKeyframe on first iteration of loop", () => {
      const variant = createVariant({ loop: true });
      const germinatedAt = new Date("2026-01-01T00:00:00Z");
      const plant = createPlant({ germinatedAt });
      // At 5s into first keyframe of first iteration
      const now = new Date("2026-01-01T00:00:05Z");

      const state = computeLifecycleState(plant, variant, now);

      expect(state.currentKeyframe.name).toBe("seed");
      expect(state.keyframeIndex).toBe(0);
      // First iteration - no prevKeyframe for first keyframe
      expect(state.prevKeyframe).toBeUndefined();
    });

    it("should have prevKeyframe after completing first loop", () => {
      const variant = createVariant({ loop: true });
      const germinatedAt = new Date("2026-01-01T00:00:00Z");
      const plant = createPlant({ germinatedAt });
      // At 65s = 5s into second loop's first keyframe
      const now = new Date("2026-01-01T00:01:05Z");

      const state = computeLifecycleState(plant, variant, now);

      expect(state.currentKeyframe.name).toBe("seed");
      expect(state.keyframeIndex).toBe(0);
      // After looping - prevKeyframe should be last keyframe for smooth transition
      expect(state.prevKeyframe?.name).toBe("bloom");
    });
  });

  describe("lifecycle modifier", () => {
    it("should speed up lifecycle with modifier > 1", () => {
      const variant = createVariant();
      const germinatedAt = new Date("2026-01-01T00:00:00Z");
      const plant = createPlant({ germinatedAt, lifecycleModifier: 2.0 });
      const now = new Date("2026-01-01T00:00:05Z"); // 5 seconds

      const state = computeLifecycleState(plant, variant, now);

      // With 2x speed, 5 seconds = 10 effective seconds = end of first keyframe
      expect(state.currentKeyframe.name).toBe("sprout");
      expect(state.keyframeIndex).toBe(1);
    });

    it("should slow down lifecycle with modifier < 1", () => {
      const variant = createVariant();
      const germinatedAt = new Date("2026-01-01T00:00:00Z");
      const plant = createPlant({ germinatedAt, lifecycleModifier: 0.5 });
      const now = new Date("2026-01-01T00:00:10Z"); // 10 seconds

      const state = computeLifecycleState(plant, variant, now);

      // With 0.5x speed, 10 seconds = 5 effective seconds = mid first keyframe
      expect(state.currentKeyframe.name).toBe("seed");
      expect(state.keyframeProgress).toBeCloseTo(0.5, 5);
    });
  });

  describe("total progress calculation", () => {
    it("should calculate total progress correctly", () => {
      const variant = createVariant();
      const germinatedAt = new Date("2026-01-01T00:00:00Z");
      const plant = createPlant({ germinatedAt });
      const now = new Date("2026-01-01T00:00:30Z"); // 30 seconds

      const state = computeLifecycleState(plant, variant, now);

      expect(state.totalProgress).toBeCloseTo(0.5, 5); // 30/60 = 0.5
    });
  });
});

// =============================================================================
// getActiveVisual Tests
// =============================================================================

describe("getActiveVisual", () => {
  it("should return current keyframe when tweening disabled", () => {
    const variant = createVariant({ tweenBetweenKeyframes: false });
    const germinatedAt = new Date("2026-01-01T00:00:00Z");
    const plant = createPlant({ germinatedAt });
    const now = new Date("2026-01-01T00:00:05Z");

    const state = computeLifecycleState(plant, variant, now);
    const visual = getActiveVisual(state, variant);

    expect(visual).toBe(state.currentKeyframe);
  });

  it("should return interpolated keyframe at keyframe start when tweening enabled", () => {
    const variant = createVariant({ tweenBetweenKeyframes: true });
    const germinatedAt = new Date("2026-01-01T00:00:00Z");
    const plant = createPlant({ germinatedAt });

    // At 0.5s into first keyframe (5% progress) - no prev keyframe exists
    const nowFirst = new Date("2026-01-01T00:00:00.500Z");
    const stateFirst = computeLifecycleState(plant, variant, nowFirst);
    const visualFirst = getActiveVisual(stateFirst, variant);
    // At very start of first keyframe with no prev, should return current keyframe
    expect(visualFirst).toBe(stateFirst.currentKeyframe);

    // At 10.5s = 0.5s into second keyframe (20s duration) = 2.5% progress (in tween-in zone)
    const nowSecond = new Date("2026-01-01T00:00:10.500Z");
    const stateSecond = computeLifecycleState(plant, variant, nowSecond);
    const visualSecond = getActiveVisual(stateSecond, variant);
    // Should return interpolated keyframe (has 't' property) - tweening in from prev
    expect("t" in visualSecond).toBe(true);
  });

  it("should return stable keyframe at end of keyframe (no tween-out)", () => {
    const variant = createVariant({ tweenBetweenKeyframes: true });
    const germinatedAt = new Date("2026-01-01T00:00:00Z");
    const plant = createPlant({ germinatedAt });

    // At 9.5s into 10s keyframe = 95% progress (past the 10% tween-in zone)
    const now = new Date("2026-01-01T00:00:09.500Z");
    const state = computeLifecycleState(plant, variant, now);
    const visual = getActiveVisual(state, variant);
    // Should return current keyframe, not interpolated (no tween-out)
    expect(visual).toBe(state.currentKeyframe);
  });

  it("should return stable keyframe in middle of keyframe when tweening enabled", () => {
    const variant = createVariant({ tweenBetweenKeyframes: true });
    const germinatedAt = new Date("2026-01-01T00:00:00Z");
    const plant = createPlant({ germinatedAt });
    // At 5s into 10s keyframe = 50% progress (in stable zone: 10%-90%)
    const now = new Date("2026-01-01T00:00:05Z");

    const state = computeLifecycleState(plant, variant, now);
    const visual = getActiveVisual(state, variant);

    // Should return the current keyframe, not interpolated
    expect(visual).toBe(state.currentKeyframe);
  });

  it("should return current keyframe on last frame even with tweening", () => {
    const variant = createVariant({ tweenBetweenKeyframes: true });
    const germinatedAt = new Date("2026-01-01T00:00:00Z");
    const plant = createPlant({ germinatedAt });
    const now = new Date("2026-01-01T00:01:30Z"); // Past end

    const state = computeLifecycleState(plant, variant, now);
    const visual = getActiveVisual(state, variant);

    expect(visual).toBe(state.currentKeyframe);
  });
});

// =============================================================================
// interpolateKeyframes Tests
// =============================================================================

describe("interpolateKeyframes", () => {
  const keyframe1: GlyphKeyframe = {
    name: "start",
    duration: 10,
    pattern: [
      [0, 0],
      [0, 0],
    ],
    palette: ["#000000", "#000000"],
    opacity: 0.5,
    scale: 1.0,
  };

  const keyframe2: GlyphKeyframe = {
    name: "end",
    duration: 10,
    pattern: [
      [1, 1],
      [1, 1],
    ],
    palette: ["#FFFFFF", "#FFFFFF"],
    opacity: 1.0,
    scale: 2.0,
  };

  it("should return start values at t=0", () => {
    const result = interpolateKeyframes(keyframe1, keyframe2, 0);

    expect(result.opacity).toBeCloseTo(0.5, 5);
    expect(result.scale).toBeCloseTo(1.0, 5);
    expect(result.pattern[0]![0]).toBeCloseTo(0, 5);
  });

  it("should return end values at t=1", () => {
    const result = interpolateKeyframes(keyframe1, keyframe2, 1);

    expect(result.opacity).toBeCloseTo(1.0, 5);
    expect(result.scale).toBeCloseTo(2.0, 5);
    expect(result.pattern[0]![0]).toBeCloseTo(1, 5);
  });

  it("should return midpoint values at t=0.5", () => {
    const result = interpolateKeyframes(keyframe1, keyframe2, 0.5);

    expect(result.opacity).toBeCloseTo(0.75, 5);
    expect(result.scale).toBeCloseTo(1.5, 5);
    expect(result.pattern[0]![0]).toBeCloseTo(0.5, 5);
  });

  it("should interpolate colors", () => {
    const result = interpolateKeyframes(keyframe1, keyframe2, 0.5);

    // #000000 to #FFFFFF at 0.5 = #808080 (gray)
    expect(result.palette[0]).toBe("#808080");
  });

  it("should clamp t values to 0-1 range", () => {
    const resultNeg = interpolateKeyframes(keyframe1, keyframe2, -0.5);
    const resultOver = interpolateKeyframes(keyframe1, keyframe2, 1.5);

    expect(resultNeg.opacity).toBeCloseTo(0.5, 5);
    expect(resultOver.opacity).toBeCloseTo(1.0, 5);
  });

  it("should include metadata about interpolation", () => {
    const result = interpolateKeyframes(keyframe1, keyframe2, 0.5);

    expect(result.fromKeyframe).toBe("start");
    expect(result.toKeyframe).toBe("end");
    expect(result.t).toBe(0.5);
  });
});

// =============================================================================
// selectColorVariation Tests
// =============================================================================

describe("selectColorVariation", () => {
  it("should return null for fixed-color variants", () => {
    const variant = createVariant(); // No colorVariations

    expect(selectColorVariation(variant, 0.5)).toBeNull();
  });

  it("should return null for empty colorVariations", () => {
    const variant = createVariant({ colorVariations: [] });

    expect(selectColorVariation(variant, 0.5)).toBeNull();
  });

  it("should select first variation at low probability", () => {
    const variant = createVariant({
      colorVariations: [
        { name: "red", weight: 1, palettes: {} },
        { name: "blue", weight: 1, palettes: {} },
      ],
    });

    expect(selectColorVariation(variant, 0.1)).toBe("red");
  });

  it("should select second variation at high probability", () => {
    const variant = createVariant({
      colorVariations: [
        { name: "red", weight: 1, palettes: {} },
        { name: "blue", weight: 1, palettes: {} },
      ],
    });

    expect(selectColorVariation(variant, 0.9)).toBe("blue");
  });

  it("should respect weight distribution", () => {
    const variant = createVariant({
      colorVariations: [
        { name: "common", weight: 3, palettes: {} },
        { name: "rare", weight: 1, palettes: {} },
      ],
    });

    // 75% chance for common (0-0.75), 25% for rare (0.75-1)
    expect(selectColorVariation(variant, 0.5)).toBe("common");
    expect(selectColorVariation(variant, 0.8)).toBe("rare");
  });
});

// =============================================================================
// getEffectivePalette Tests
// =============================================================================

describe("getEffectivePalette", () => {
  const keyframe: GlyphKeyframe = {
    name: "bloom",
    duration: 10,
    pattern: simplePattern,
    palette: ["#DEFAULT1", "#DEFAULT2", "#DEFAULT3"],
  };

  it("should return keyframe palette when no color variation selected", () => {
    const variant = createVariant();

    const palette = getEffectivePalette(keyframe, variant, null);

    expect(palette).toEqual(["#DEFAULT1", "#DEFAULT2", "#DEFAULT3"]);
  });

  it("should return keyframe palette when variant has no color variations", () => {
    const variant = createVariant();

    const palette = getEffectivePalette(keyframe, variant, "red");

    expect(palette).toEqual(["#DEFAULT1", "#DEFAULT2", "#DEFAULT3"]);
  });

  it("should return overridden palette when color variation matches", () => {
    const variant = createVariant({
      colorVariations: [
        {
          name: "red",
          weight: 1,
          palettes: { bloom: ["#RED1", "#RED2", "#RED3"] },
        },
      ],
    });

    const palette = getEffectivePalette(keyframe, variant, "red");

    expect(palette).toEqual(["#RED1", "#RED2", "#RED3"]);
  });

  it("should return default palette if keyframe not in variation overrides", () => {
    const variant = createVariant({
      colorVariations: [
        {
          name: "red",
          weight: 1,
          palettes: { seed: ["#SEED1", "#SEED2", "#SEED3"] }, // Not "bloom"
        },
      ],
    });

    const palette = getEffectivePalette(keyframe, variant, "red");

    expect(palette).toEqual(["#DEFAULT1", "#DEFAULT2", "#DEFAULT3"]);
  });

  it("should return default palette if color variation name not found", () => {
    const variant = createVariant({
      colorVariations: [{ name: "red", weight: 1, palettes: {} }],
    });

    const palette = getEffectivePalette(keyframe, variant, "blue");

    expect(palette).toEqual(["#DEFAULT1", "#DEFAULT2", "#DEFAULT3"]);
  });
});

// =============================================================================
// growthRateToLifecycleModifier Tests
// =============================================================================

describe("growthRateToLifecycleModifier", () => {
  it("should return value within range as-is", () => {
    expect(growthRateToLifecycleModifier(1.0)).toBe(1.0);
    expect(growthRateToLifecycleModifier(1.5)).toBe(1.5);
    expect(growthRateToLifecycleModifier(0.75)).toBe(0.75);
  });

  it("should clamp values below 0.5", () => {
    expect(growthRateToLifecycleModifier(0.1)).toBe(0.5);
    expect(growthRateToLifecycleModifier(0)).toBe(0.5);
    expect(growthRateToLifecycleModifier(-1)).toBe(0.5);
  });

  it("should clamp values above 2.0", () => {
    expect(growthRateToLifecycleModifier(2.5)).toBe(2.0);
    expect(growthRateToLifecycleModifier(10)).toBe(2.0);
  });

  it("should return boundary values exactly", () => {
    expect(growthRateToLifecycleModifier(0.5)).toBe(0.5);
    expect(growthRateToLifecycleModifier(2.0)).toBe(2.0);
  });
});

// =============================================================================
// isLifecycleComplete Tests
// =============================================================================

describe("isLifecycleComplete", () => {
  it("should return false for looping variants", () => {
    const variant = createVariant({ loop: true });
    const germinatedAt = new Date("2026-01-01T00:00:00Z");
    const plant = createPlant({ germinatedAt });
    const now = new Date("2026-01-01T00:02:00Z"); // Well past lifecycle

    const state = computeLifecycleState(plant, variant, now);

    expect(isLifecycleComplete(state, variant)).toBe(false);
  });

  it("should return true when lifecycle is complete and not looping", () => {
    const variant = createVariant({ loop: false });
    const germinatedAt = new Date("2026-01-01T00:00:00Z");
    const plant = createPlant({ germinatedAt });
    const now = new Date("2026-01-01T00:02:00Z"); // Well past lifecycle

    const state = computeLifecycleState(plant, variant, now);

    expect(isLifecycleComplete(state, variant)).toBe(true);
  });

  it("should return false when lifecycle is still in progress", () => {
    const variant = createVariant({ loop: false });
    const germinatedAt = new Date("2026-01-01T00:00:00Z");
    const plant = createPlant({ germinatedAt });
    const now = new Date("2026-01-01T00:00:30Z"); // Mid-lifecycle

    const state = computeLifecycleState(plant, variant, now);

    expect(isLifecycleComplete(state, variant)).toBe(false);
  });
});
