/**
 * Tests for resolveSchema and resolveQuantumProperties
 */

import { describe, it, expect } from "vitest";
import { resolveSchema, resolveQuantumProperties } from "./resolve-properties";
import type { QuantumSignals } from "./signals";

// ============================================================================
// Test fixtures
// ============================================================================

const fullSignals: QuantumSignals = {
  entropy: 0.5,
  dominance: 0.8,
  spread: 0.25,
  parityBias: 0.6,
  growth: 0.75,
  certainty: 0.4,
};

// ============================================================================
// resolveSchema
// ============================================================================

describe("resolveSchema", () => {
  it("returns defaults for all properties when signals are null", () => {
    const schema = {
      petalCount: {
        signal: "entropy" as const,
        range: [3, 8] as [number, number],
        default: 5,
        round: true,
      },
      stemCurvature: {
        signal: "certainty" as const,
        range: [0, 0.45] as [number, number],
        default: 0.15,
      },
    };
    const result = resolveSchema(schema, null);
    expect(result.petalCount).toBe(5);
    expect(result.stemCurvature).toBe(0.15);
  });

  it("linearly maps signal value to range", () => {
    const schema = {
      value: { signal: "entropy" as const, range: [0, 10] as [number, number], default: 5 },
    };
    // entropy = 0.5 → 0 + 0.5 * (10 - 0) = 5
    const result = resolveSchema(schema, fullSignals);
    expect(result.value).toBeCloseTo(5, 5);
  });

  it("maps signal=0 to range min and signal=1 to range max", () => {
    const schema = {
      prop: { signal: "growth" as const, range: [10, 20] as [number, number], default: 15 },
    };
    const zeroSignals = { ...fullSignals, growth: 0 };
    const oneSignals = { ...fullSignals, growth: 1 };
    expect(resolveSchema(schema, zeroSignals).prop).toBeCloseTo(10, 5);
    expect(resolveSchema(schema, oneSignals).prop).toBeCloseTo(20, 5);
  });

  it("supports descending ranges (max < min)", () => {
    const schema = {
      curvature: {
        signal: "certainty" as const,
        range: [0.45, 0] as [number, number],
        default: 0.15,
      },
    };
    // certainty = 0.4 → 0.45 + 0.4 * (0 - 0.45) = 0.45 - 0.18 = 0.27
    const result = resolveSchema(schema, fullSignals);
    expect(result.curvature).toBeCloseTo(0.45 + 0.4 * (0 - 0.45), 5);
  });

  it("floors the value when round: true", () => {
    const schema = {
      count: {
        signal: "entropy" as const,
        range: [3, 8] as [number, number],
        default: 5,
        round: true,
      },
    };
    // entropy = 0.5 → 3 + 0.5 * 5 = 5.5 → floor → 5
    const result = resolveSchema(schema, fullSignals);
    expect(result.count).toBe(5);
  });

  it("applies easeIn curve (t²)", () => {
    const schema = {
      v: {
        signal: "growth" as const,
        range: [0, 100] as [number, number],
        default: 0,
        curve: "easeIn" as const,
      },
    };
    const signals = { ...fullSignals, growth: 0.5 };
    // easeIn(0.5) = 0.25 → 0 + 0.25 * 100 = 25
    expect(resolveSchema(schema, signals).v).toBeCloseTo(25, 5);
  });

  it("applies easeOut curve (1-(1-t)²)", () => {
    const schema = {
      v: {
        signal: "growth" as const,
        range: [0, 100] as [number, number],
        default: 0,
        curve: "easeOut" as const,
      },
    };
    const signals = { ...fullSignals, growth: 0.5 };
    // easeOut(0.5) = 1 - 0.25 = 0.75 → 75
    expect(resolveSchema(schema, signals).v).toBeCloseTo(75, 5);
  });

  it("handles multiple properties independently", () => {
    const schema = {
      a: { signal: "entropy" as const, range: [0, 10] as [number, number], default: 0 },
      b: { signal: "dominance" as const, range: [0, 1] as [number, number], default: 0.5 },
    };
    const result = resolveSchema(schema, fullSignals);
    // entropy=0.5→5, dominance=0.8→0.8
    expect(result.a).toBeCloseTo(5, 5);
    expect(result.b).toBeCloseTo(0.8, 5);
  });
});

// ============================================================================
// resolveQuantumProperties
// ============================================================================

describe("resolveQuantumProperties", () => {
  it("returns empty record for empty config", () => {
    const result = resolveQuantumProperties({}, fullSignals);
    expect(result).toEqual({});
  });

  it("runs schema when only schema is provided", () => {
    const result = resolveQuantumProperties(
      {
        schema: {
          count: {
            signal: "entropy" as const,
            range: [1, 5] as [number, number],
            default: 3,
            round: true,
          },
        },
      },
      fullSignals
    );
    // entropy=0.5 → 1 + 0.5*4 = 3
    expect(result.count).toBe(3);
  });

  it("runs resolve when only resolve is provided", () => {
    const result = resolveQuantumProperties(
      {
        resolve: (s) => ({ custom: s ? s.entropy * 100 : 50 }),
      },
      fullSignals
    );
    // entropy = 0.5 → 50
    expect(result.custom).toBeCloseTo(50, 5);
  });

  it("resolve output overrides schema for overlapping keys", () => {
    const result = resolveQuantumProperties(
      {
        schema: {
          count: { signal: "entropy" as const, range: [1, 10] as [number, number], default: 5 },
        },
        resolve: (s) => ({ count: s ? 99 : 0 }),
      },
      fullSignals
    );
    // resolve returns 99, overriding schema
    expect(result.count).toBe(99);
  });

  it("merges non-overlapping schema and resolve keys", () => {
    const result = resolveQuantumProperties(
      {
        schema: {
          fromSchema: { signal: "entropy" as const, range: [0, 1] as [number, number], default: 0 },
        },
        resolve: (s) => ({ fromResolve: s ? 42 : 0 }),
      },
      fullSignals
    );
    expect(result.fromSchema).toBeDefined();
    expect(result.fromResolve).toBe(42);
  });

  it("returns defaults when signals are null (unobserved plant)", () => {
    const result = resolveQuantumProperties(
      {
        schema: {
          count: {
            signal: "entropy" as const,
            range: [1, 10] as [number, number],
            default: 7,
            round: true,
          },
        },
        resolve: (s) => ({ extra: s ? s.dominance : -1 }),
      },
      null
    );
    expect(result.count).toBe(7);
    expect(result.extra).toBe(-1); // resolve called with null → returns -1
  });

  it("passes null signals to resolve function for unobserved plants", () => {
    let receivedSignals: QuantumSignals | null = undefined as unknown as QuantumSignals | null;
    resolveQuantumProperties(
      {
        resolve: (s) => {
          receivedSignals = s;
          return {};
        },
      },
      null
    );
    expect(receivedSignals).toBeNull();
  });

  it("passes valid signals to resolve function when observed", () => {
    let receivedSignals: QuantumSignals | null = null;
    resolveQuantumProperties(
      {
        resolve: (s) => {
          receivedSignals = s;
          return {};
        },
      },
      fullSignals
    );
    expect(receivedSignals).toEqual(fullSignals);
  });
});
