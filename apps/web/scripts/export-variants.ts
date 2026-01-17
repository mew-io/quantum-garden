#!/usr/bin/env tsx
/**
 * Export Plant Variants to JSON
 *
 * This script exports the TypeScript variant definitions to JSON
 * for consumption by the Python quantum service.
 *
 * Usage:
 *   pnpm export-variants
 *   # or
 *   tsx scripts/export-variants.ts
 *
 * Output:
 *   ../quantum/src/data/variants.json
 *
 * This script is run:
 *   - Manually during development when variants change
 *   - Automatically during build (pre-build hook)
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { PLANT_VARIANTS } from "@quantum-garden/shared";

const OUTPUT_PATH = join(__dirname, "..", "..", "quantum", "src", "data", "variants.json");

function main() {
  console.log("Exporting plant variants to JSON...");
  console.log(`  Found ${PLANT_VARIANTS.length} variants`);

  // Ensure output directory exists
  const outputDir = dirname(OUTPUT_PATH);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.log(`  Created directory: ${outputDir}`);
  }

  // Export as JSON
  const json = JSON.stringify(PLANT_VARIANTS, null, 2);
  writeFileSync(OUTPUT_PATH, json, "utf-8");

  console.log(`  Written to: ${OUTPUT_PATH}`);
  console.log("Done!");

  // Log variant summary
  console.log("\nVariant Summary:");
  for (const variant of PLANT_VARIANTS) {
    const keyframeCount = variant.keyframes.length;
    const colorCount = variant.colorVariations?.length ?? 0;
    const totalDuration = variant.keyframes.reduce((sum, kf) => sum + kf.duration, 0);

    console.log(
      `  - ${variant.id}: ${keyframeCount} keyframes, ${totalDuration}s total${colorCount > 0 ? `, ${colorCount} color variations` : ""}`
    );
  }
}

main();
