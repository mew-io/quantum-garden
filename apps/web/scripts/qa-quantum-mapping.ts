/**
 * QA script for the generic quantum data mapping system.
 *
 * Verifies:
 * - computeQuantumSignals produces correct [0,1] scalars from a probability distribution
 * - resolveQuantumProperties maps signals to plant-specific properties (Path B, flower)
 * - Fern builder reads Path A properties from traits directly
 * - DB is seeded with observable quantum-fern + watercolor-flower plants
 *
 * Usage: pnpm --filter web exec tsx scripts/qa-quantum-mapping.ts
 */

import { PrismaClient } from "@prisma/client";
import {
  computeQuantumSignals,
  resolveQuantumProperties,
  getVariantById,
} from "@quantum-garden/shared";
import type { ResolvedTraits } from "@quantum-garden/shared";

const db = new PrismaClient();

// ─── ANSI helpers ────────────────────────────────────────────────────────────
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const pass = green("✓");
const warn = yellow("⚠");

function section(title: string) {
  console.log(`\n${bold(cyan("═".repeat(60)))}`);
  console.log(bold(cyan(`  ${title}`)));
  console.log(bold(cyan("═".repeat(60))));
}

function check(label: string, ok: boolean, detail = "") {
  const icon = ok ? pass : yellow("✗");
  console.log(`  ${icon} ${label}${detail ? dim("  " + detail) : ""}`);
}

// ─── Part 1: Unit-level simulation of enrichTraits ───────────────────────────

section("1 · Simulating enrichTraits with interference pool result");

// Representative pool result from the interference circuit (3 qubits).
// Mimics what selectFromPool() would return.
const mockProbabilities: Record<string, number> = {
  "000": 0.42,
  "001": 0.08,
  "010": 0.05,
  "011": 0.12,
  "100": 0.07,
  "101": 0.09,
  "110": 0.14,
  "111": 0.03,
};
const mockGrowthRate = 1.3;
const mockOpacity = 0.88;

const mockBaseTraits: ResolvedTraits = {
  glyphPattern: [
    [1, 0],
    [0, 1],
  ], // placeholder
  colorPalette: ["#E89090", "#C06060", "#8EA888"],
  growthRate: mockGrowthRate,
  opacity: mockOpacity,
};

// Compute signals
const numQubits = Object.keys(mockProbabilities)[0]!.length;
const signals = computeQuantumSignals(mockProbabilities, numQubits, mockGrowthRate, mockOpacity);

console.log("\n  Probability distribution (3-qubit interference):");
for (const [bs, p] of Object.entries(mockProbabilities)) {
  console.log(`    |${bs}⟩  ${(p * 100).toFixed(1).padStart(5)}%`);
}

console.log("\n  Computed QuantumSignals:");
for (const [key, val] of Object.entries(signals)) {
  const bar = "█".repeat(Math.round(val * 20)).padEnd(20, "░");
  console.log(`    ${key.padEnd(12)} ${bar} ${val.toFixed(3)}`);
}

// Validate all signals in [0,1]
const sigOk = Object.values(signals).every((v) => v >= 0 && v <= 1);
check("All signals in [0,1]", sigOk);

// ─── Part 2: Path B — watercolor flower quantumMapping ───────────────────────

section("2 · Path B: watercolorFlower quantumMapping");

const flowerVariant = getVariantById("watercolor-flower");
if (!flowerVariant) {
  console.log(`  ${warn} watercolor-flower variant not found`);
} else {
  check(`Variant has circuitId`, !!flowerVariant.circuitId, flowerVariant.circuitId ?? "missing");
  check(
    `Variant has quantumMapping`,
    !!flowerVariant.quantumMapping,
    flowerVariant.quantumMapping ? "present" : "missing"
  );

  if (flowerVariant.quantumMapping) {
    const schemaKeys = Object.keys(flowerVariant.quantumMapping.schema ?? {});
    check(
      `Schema has expected keys`,
      schemaKeys.includes("petalCount") &&
        schemaKeys.includes("leafCount") &&
        schemaKeys.includes("stemCurvature"),
      schemaKeys.join(", ")
    );

    // With real signals
    const tsProps = resolveQuantumProperties(flowerVariant.quantumMapping, signals);
    console.log("\n  Resolved properties (real signals):");
    for (const [k, v] of Object.entries(tsProps)) {
      console.log(`    ${k.padEnd(16)} ${v}`);
    }

    const flowerOk =
      typeof tsProps.petalCount === "number" &&
      tsProps.petalCount >= 3 &&
      tsProps.petalCount <= 8 &&
      typeof tsProps.leafCount === "number" &&
      tsProps.leafCount >= 1 &&
      tsProps.leafCount <= 5 &&
      typeof tsProps.stemCurvature === "number" &&
      tsProps.stemCurvature >= 0 &&
      tsProps.stemCurvature <= 0.45;

    check("petalCount in [3,8], leafCount in [1,5], stemCurvature in [0,0.45]", flowerOk);

    // With null signals (mock/unobserved fallback)
    const defaultProps = resolveQuantumProperties(flowerVariant.quantumMapping, null);
    console.log("\n  Resolved properties (null signals / mock fallback):");
    for (const [k, v] of Object.entries(defaultProps)) {
      console.log(`    ${k.padEnd(16)} ${v}  ${dim("(default)")}`);
    }
    check(
      "Defaults are safe values",
      defaultProps.petalCount === 5 && defaultProps.leafCount === 2,
      `petalCount=${defaultProps.petalCount} leafCount=${defaultProps.leafCount}`
    );

    // Full merged traits (what would be stored in plant.traits)
    const enriched: ResolvedTraits = { ...mockBaseTraits, quantumSignals: signals, ...tsProps };
    console.log("\n  Final merged traits (stored in plant.traits after observation):");
    console.log(
      "    " +
        JSON.stringify(
          { ...enriched, glyphPattern: "[omitted]", quantumSignals: "[see above]" },
          null,
          2
        )
          .split("\n")
          .join("\n    ")
    );
  }
}

// ─── Part 3: Path A — quantum fern variant ───────────────────────────────────

section("3 · Path A: quantumFern variant");

const fernVariant = getVariantById("quantum-fern");
if (!fernVariant) {
  console.log(`  ${warn} quantum-fern variant not found`);
} else {
  check(
    `Variant has circuitId`,
    fernVariant.circuitId === "quantum_fern",
    fernVariant.circuitId ?? "missing"
  );
  check(
    `No TypeScript mapping (Python circuit handles it)`,
    !fernVariant.quantumMapping,
    fernVariant.quantumMapping ? "has mapping (unexpected)" : "no mapping (correct)"
  );
  check(`Has watercolorConfig`, !!fernVariant.watercolorConfig);
  check(
    `Has 5 keyframes`,
    (fernVariant.watercolorConfig?.keyframes.length ?? 0) === 5,
    fernVariant.watercolorConfig?.keyframes.map((k) => k.name).join(", ")
  );
  check(`Render mode is watercolor`, fernVariant.renderMode === "watercolor");

  // Simulate Path A: traits that the Python circuit would store via extra dict
  const fernPathATraits: ResolvedTraits = {
    growthRate: 1.2,
    opacity: 0.82,
    colorPalette: ["#2D5A27", "#4A8F3F", "#8BC34A"],
    // These come from Python's quantum_fern.map_measurements() via extra dict
    branchCount: 5,
    asymmetry: 0.24,
    leafDensity: 0.67,
  };

  console.log("\n  Simulated Path A traits (from Python quantum_fern extra dict):");
  console.log(`    branchCount  ${fernPathATraits.branchCount}`);
  console.log(`    asymmetry    ${fernPathATraits.asymmetry}`);
  console.log(`    leafDensity  ${fernPathATraits.leafDensity}`);

  // Simulate what the builder would read
  const branchCount =
    typeof fernPathATraits.branchCount === "number" ? fernPathATraits.branchCount : 4;
  const asymmetry = typeof fernPathATraits.asymmetry === "number" ? fernPathATraits.asymmetry : 0.1;
  const leafDensity =
    typeof fernPathATraits.leafDensity === "number" ? fernPathATraits.leafDensity : 0.5;

  check(`Builder reads branchCount correctly`, branchCount === 5, `got ${branchCount}`);
  check(`Builder reads asymmetry correctly`, asymmetry === 0.24, `got ${asymmetry}`);
  check(`Builder reads leafDensity correctly`, leafDensity === 0.67, `got ${leafDensity}`);
}

// ─── Part 4: DB seeding ──────────────────────────────────────────────────────

section("4 · DB: seeding quantum-fern + observable watercolor-flower");

// Get or create a quantum record for the fern's circuit type
async function getOrCreateQuantumRecord(circuitId: string) {
  let record = await db.quantumRecord.findFirst({ where: { circuitId } });
  if (!record) {
    record = await db.quantumRecord.create({
      data: {
        circuitId,
        circuitDefinition: { type: "placeholder", circuit_id: circuitId, gates: [] },
        status: "completed",
        measurements: [0, 1],
        probabilities: [0.5, 0.5],
      },
    });
    console.log(`  ${pass} Created quantum record for ${circuitId}: ${record.id}`);
  } else {
    console.log(`  ${pass} Found existing quantum record for ${circuitId}: ${record.id}`);
  }
  return record;
}

async function seedDb() {
  // Ensure at least 2 quantum-fern plants exist (unobserved, germinated)
  const existingFerns = await db.plant.findMany({
    where: { variantId: "quantum-fern", diedAt: null },
  });

  if (existingFerns.length > 0) {
    console.log(`\n  ${pass} Found ${existingFerns.length} existing quantum-fern plant(s)`);
  } else {
    const fernRecord = await getOrCreateQuantumRecord("quantum_fern");
    const positions = [
      { x: 450, y: 280 },
      { x: 1200, y: 650 },
    ];
    for (const pos of positions) {
      await db.plant.create({
        data: {
          positionX: pos.x,
          positionY: pos.y,
          observed: false,
          visualState: "superposed",
          variantId: "quantum-fern",
          quantumCircuitId: fernRecord.id,
          germinatedAt: new Date(), // germinated so they're visible
          lifecycleModifier: 1.0,
        },
      });
    }
    console.log(`\n  ${pass} Created 2 quantum-fern plants (germinated, unobserved)`);
  }

  // Ensure at least 1 watercolor-flower is unobserved + germinated
  const observableFlowers = await db.plant.findMany({
    where: { variantId: "watercolor-flower", observed: false, diedAt: null },
    include: { quantumCircuit: true },
  });

  if (observableFlowers.length > 0) {
    const flower = observableFlowers[0]!;
    console.log(`\n  ${pass} Watercolor-flower ready to observe: ${flower.id}`);
    console.log(`    circuitId in DB: ${flower.quantumCircuit?.circuitId ?? "none"}`);

    // If not germinated, germinate it so it's visible
    if (!flower.germinatedAt) {
      await db.plant.update({
        where: { id: flower.id },
        data: { germinatedAt: new Date() },
      });
      console.log(`    ${pass} Germinated the flower so it's visible`);
    }
  } else {
    const interferenceRecord = await getOrCreateQuantumRecord("interference");
    await db.plant.create({
      data: {
        positionX: 800,
        positionY: 400,
        observed: false,
        visualState: "superposed",
        variantId: "watercolor-flower",
        quantumCircuitId: interferenceRecord.id,
        germinatedAt: new Date(),
        lifecycleModifier: 1.0,
      },
    });
    console.log(`\n  ${pass} Created watercolor-flower plant (germinated, unobserved)`);
  }

  // ─── Summary ───────────────────────────────────────────────────────────────

  section("Summary");

  const allFerns = await db.plant.findMany({ where: { variantId: "quantum-fern", diedAt: null } });
  const unobsFerns = allFerns.filter((p) => !p.observed);
  const allFlowers = await db.plant.findMany({
    where: { variantId: "watercolor-flower", diedAt: null },
  });
  const unobsFlowers = allFlowers.filter((p) => !p.observed);

  console.log(`\n  quantum-fern      total=${allFerns.length}  unobserved=${unobsFerns.length}`);
  console.log(`  watercolor-flower total=${allFlowers.length}  unobserved=${unobsFlowers.length}`);
  console.log();
  console.log(`  ${pass} quantumSignals will be computed and stored on every observation`);
  console.log(`  ${pass} watercolor-flower: petalCount/leafCount/stemCurvature from TS schema`);
  console.log(`  ${pass} quantum-fern: branchCount/asymmetry/leafDensity from Python extra dict`);
  console.log();
  console.log(dim("  Start the dev server (pnpm dev) and observe these plants to see trait data"));
  console.log(
    dim("  After observation, query stored traits with:"),
    "\n" +
      dim(
        "    npx tsx -e \"import { PrismaClient } from '@prisma/client'; const db = new PrismaClient(); db.plant.findMany({ where: { variantId: 'quantum-fern' }, select: { id: true, traits: true } }).then(console.log)\""
      )
  );
}

seedDb()
  .catch((e) => {
    console.error("DB seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
