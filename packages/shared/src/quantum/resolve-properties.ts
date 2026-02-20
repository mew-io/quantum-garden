/**
 * Quantum Property Resolution
 *
 * Resolves a variant's `QuantumPropertyConfig` against quantum signals to
 * produce a plain record of named property values. Used for Path B variants
 * (those using generic circuits without a custom Python circuit).
 *
 * For Path A variants (custom Python circuits), the circuit's map_measurements()
 * already returns plant-specific properties in ResolvedTraits.extra, and this
 * module is not needed.
 */

import type { QuantumSignals } from "./signals";
import type { QuantumPropertyConfig, QuantumPropertySchema } from "../variants/types";

function applyEasing(t: number, curve: "linear" | "easeIn" | "easeOut" = "linear"): number {
  switch (curve) {
    case "easeIn":
      return t * t;
    case "easeOut":
      return 1 - (1 - t) * (1 - t);
    default:
      return t;
  }
}

/**
 * Resolve a declarative schema against quantum signals.
 * Returns defaults for any property when signals are null/undefined.
 */
export function resolveSchema(
  schema: QuantumPropertySchema,
  signals: QuantumSignals | null | undefined
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const [propName, mapping] of Object.entries(schema)) {
    if (!signals) {
      result[propName] = mapping.default;
      continue;
    }

    const signalValue = signals[mapping.signal]; // already 0–1
    const curved = applyEasing(signalValue, mapping.curve);
    const [min, max] = mapping.range;
    let value = min + curved * (max - min);

    if (mapping.round) {
      value = Math.floor(value);
    }

    result[propName] = value;
  }

  return result;
}

/**
 * Resolve a `QuantumPropertyConfig` against quantum signals.
 *
 * Runs the schema (if present), then the custom resolve function (if present),
 * and merges them — the resolve function's output takes precedence.
 *
 * Returns an empty record when config has no schema and no resolve function.
 * Returns defaults (schema defaults or resolve's null-signal output) when
 * signals are null/undefined (unobserved plant).
 */
export function resolveQuantumProperties(
  config: QuantumPropertyConfig,
  signals: QuantumSignals | null | undefined
): Record<string, unknown> {
  const schemaResult = config.schema ? resolveSchema(config.schema, signals) : {};
  const resolveResult = config.resolve ? config.resolve(signals ?? null) : {};
  return { ...schemaResult, ...resolveResult };
}
