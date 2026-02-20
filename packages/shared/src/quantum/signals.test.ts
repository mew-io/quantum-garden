/**
 * Tests for computeQuantumSignals
 */

import { describe, it, expect } from "vitest";
import { computeQuantumSignals } from "./signals";

describe("computeQuantumSignals", () => {
  describe("entropy", () => {
    it("returns 0 for a fully deterministic distribution (one outcome)", () => {
      const probs = { "00": 1.0 };
      const signals = computeQuantumSignals(probs, 2, 1.0, 0.85);
      expect(signals.entropy).toBeCloseTo(0, 5);
    });

    it("returns 1 for a uniform distribution over all bitstrings", () => {
      const probs = { "0": 0.5, "1": 0.5 };
      const signals = computeQuantumSignals(probs, 1, 1.0, 0.85);
      expect(signals.entropy).toBeCloseTo(1, 5);
    });

    it("returns a value between 0 and 1 for a partial distribution", () => {
      const probs = { "00": 0.7, "01": 0.2, "10": 0.1 };
      const signals = computeQuantumSignals(probs, 2, 1.0, 0.85);
      expect(signals.entropy).toBeGreaterThan(0);
      expect(signals.entropy).toBeLessThan(1);
    });

    it("is higher for more uniform distributions", () => {
      const uniform = computeQuantumSignals(
        { "00": 0.25, "01": 0.25, "10": 0.25, "11": 0.25 },
        2,
        1.0,
        0.85
      );
      const skewed = computeQuantumSignals(
        { "00": 0.9, "01": 0.05, "10": 0.03, "11": 0.02 },
        2,
        1.0,
        0.85
      );
      expect(uniform.entropy).toBeGreaterThan(skewed.entropy);
    });
  });

  describe("dominance", () => {
    it("returns 1 when a single outcome has probability 1", () => {
      const signals = computeQuantumSignals({ "0": 1.0 }, 1, 1.0, 0.85);
      expect(signals.dominance).toBeCloseTo(1, 5);
    });

    it("returns 0.5 when two outcomes split equally", () => {
      const signals = computeQuantumSignals({ "0": 0.5, "1": 0.5 }, 1, 1.0, 0.85);
      expect(signals.dominance).toBeCloseTo(0.5, 5);
    });

    it("reflects the maximum probability in the distribution", () => {
      const signals = computeQuantumSignals({ "00": 0.8, "01": 0.15, "10": 0.05 }, 2, 1.0, 0.85);
      expect(signals.dominance).toBeCloseTo(0.8, 5);
    });
  });

  describe("spread", () => {
    it("returns fraction of possible bitstrings that appeared", () => {
      // 2 qubits = 4 possible bitstrings; 2 appeared → spread = 0.5
      const signals = computeQuantumSignals({ "00": 0.6, "11": 0.4 }, 2, 1.0, 0.85);
      expect(signals.spread).toBeCloseTo(0.5, 5);
    });

    it("returns 1 when all possible bitstrings appear (1 qubit, both outcomes)", () => {
      const signals = computeQuantumSignals({ "0": 0.5, "1": 0.5 }, 1, 1.0, 0.85);
      expect(signals.spread).toBeCloseTo(1, 5);
    });

    it("returns a small value for a single outcome circuit", () => {
      // 3 qubits = 8 possible bitstrings; 1 appeared → spread = 1/8
      const signals = computeQuantumSignals({ "000": 1.0 }, 3, 1.0, 0.85);
      expect(signals.spread).toBeCloseTo(1 / 8, 5);
    });
  });

  describe("parityBias", () => {
    it("returns 0.5 for balanced parity (no bias)", () => {
      // "00" has 0 ones (even), "11" has 2 ones (even) → both even parity, weight = 1.0 → clamped to 1
      // "01" has 1 one (odd), "10" has 1 one (odd)
      const signals = computeQuantumSignals({ "01": 0.5, "10": 0.5 }, 2, 1.0, 0.85);
      // Both "01" and "10" have odd parity → evenParityWeight = 0
      expect(signals.parityBias).toBeCloseTo(0, 5);
    });

    it("returns 1 when all outcomes have even parity", () => {
      // "00"=0 ones (even), "11"=2 ones (even) → all even parity
      const signals = computeQuantumSignals({ "00": 0.5, "11": 0.5 }, 2, 1.0, 0.85);
      expect(signals.parityBias).toBeCloseTo(1, 5);
    });

    it("returns a value between 0 and 1 for mixed parity", () => {
      // "00"=even, "01"=odd → parityBias = prob of "00" = 0.7
      const signals = computeQuantumSignals({ "00": 0.7, "01": 0.3 }, 2, 1.0, 0.85);
      expect(signals.parityBias).toBeCloseTo(0.7, 5);
    });
  });

  describe("growth and certainty", () => {
    it("normalizes growthRate 0.5→0 and 2.0→1", () => {
      const low = computeQuantumSignals({ "0": 1.0 }, 1, 0.5, 0.85);
      const high = computeQuantumSignals({ "0": 1.0 }, 1, 2.0, 0.85);
      expect(low.growth).toBeCloseTo(0, 5);
      expect(high.growth).toBeCloseTo(1, 5);
    });

    it("normalizes opacity 0.7→0 and 1.0→1", () => {
      const low = computeQuantumSignals({ "0": 1.0 }, 1, 1.0, 0.7);
      const high = computeQuantumSignals({ "0": 1.0 }, 1, 1.0, 1.0);
      expect(low.certainty).toBeCloseTo(0, 5);
      expect(high.certainty).toBeCloseTo(1, 5);
    });

    it("clamps growth to [0, 1] for out-of-range inputs", () => {
      const under = computeQuantumSignals({ "0": 1.0 }, 1, 0.0, 0.85);
      const over = computeQuantumSignals({ "0": 1.0 }, 1, 3.0, 0.85);
      expect(under.growth).toBeGreaterThanOrEqual(0);
      expect(over.growth).toBeLessThanOrEqual(1);
    });
  });

  describe("output range invariants", () => {
    const distributions: Record<string, number>[] = [
      { "0": 1.0 },
      { "0": 0.5, "1": 0.5 },
      { "00": 0.25, "01": 0.25, "10": 0.25, "11": 0.25 },
      { "000": 0.8, "001": 0.1, "110": 0.07, "111": 0.03 },
    ];

    distributions.forEach((probs, i) => {
      it(`all signals are in [0,1] for distribution ${i}`, () => {
        const numQubits = Object.keys(probs)[0]!.length;
        const s = computeQuantumSignals(probs, numQubits, 1.25, 0.85);
        for (const [key, val] of Object.entries(s)) {
          expect(val, `signal '${key}' out of range`).toBeGreaterThanOrEqual(0);
          expect(val, `signal '${key}' out of range`).toBeLessThanOrEqual(1);
        }
      });
    });
  });
});
