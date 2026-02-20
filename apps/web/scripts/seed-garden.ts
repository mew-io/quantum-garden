/**
 * Seed the garden with initial plants
 *
 * This script creates initial plants with:
 * - Quantum circuit records generated via quantum service
 * - Circuit complexity based on variant rarity
 * - Variant assignments based on rarity weights
 * - Positions distributed across the canvas
 * - Lifecycle state (germinated or dormant)
 *
 * Run with: pnpm db:seed
 *
 * Note: For best results, start the quantum service first:
 *   cd apps/quantum && uv run uvicorn src.main:app --port 18742
 */

import { PrismaClient } from "@prisma/client";
import { CANVAS, PLANT_VARIANTS, selectColorVariation } from "@quantum-garden/shared";

const db = new PrismaClient();

// Canvas dimensions from shared constants (4K)
const CANVAS_WIDTH = CANVAS.DEFAULT_WIDTH;
const CANVAS_HEIGHT = CANVAS.DEFAULT_HEIGHT;

// Seed configuration
// 4K canvas (3840×2160) is ~8.6× larger than the original 1200×800.
// 100 plants provides good initial density; auto-reseed maintains population over time.
const NUM_PLANTS = 100;
const NUM_ENTANGLED_PAIRS = 3; // Number of entangled plant pairs
const MARGIN = 250; // Keep plants away from edges (proportional to 4K canvas)

/**
 * Select a variant based on rarity weights.
 * Higher rarity = more likely to be selected.
 */
function selectVariant(): (typeof PLANT_VARIANTS)[number] {
  if (PLANT_VARIANTS.length === 0) {
    throw new Error("No plant variants defined");
  }

  const totalWeight = PLANT_VARIANTS.reduce((sum, v) => sum + v.rarity, 0);
  let random = Math.random() * totalWeight;

  for (const variant of PLANT_VARIANTS) {
    random -= variant.rarity;
    if (random <= 0) {
      return variant;
    }
  }

  // Fallback to first variant (guaranteed to exist due to check above)
  return PLANT_VARIANTS[0]!;
}

/**
 * Generate a random position within the canvas.
 * Uses a grid-based distribution to avoid overlapping.
 */
function generatePositions(count: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const usableWidth = CANVAS_WIDTH - 2 * MARGIN;
  const usableHeight = CANVAS_HEIGHT - 2 * MARGIN;

  // Calculate grid dimensions
  const cols = Math.ceil(Math.sqrt(count * (usableWidth / usableHeight)));
  const rows = Math.ceil(count / cols);
  const cellWidth = usableWidth / cols;
  const cellHeight = usableHeight / rows;

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    // Center of cell with some random jitter
    const jitterX = (Math.random() - 0.5) * cellWidth * 0.5;
    const jitterY = (Math.random() - 0.5) * cellHeight * 0.5;

    positions.push({
      x: MARGIN + cellWidth * (col + 0.5) + jitterX,
      y: MARGIN + cellHeight * (row + 0.5) + jitterY,
    });
  }

  return positions;
}

// Quantum service URL
const QUANTUM_SERVICE_URL = process.env.QUANTUM_SERVICE_URL ?? "http://localhost:18742";

// Flag to track if quantum service is available
let quantumServiceAvailable: boolean | null = null;

/**
 * Check if quantum service is available.
 */
async function checkQuantumService(): Promise<boolean> {
  if (quantumServiceAvailable !== null) {
    return quantumServiceAvailable;
  }

  try {
    const response = await fetch(`${QUANTUM_SERVICE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });
    quantumServiceAvailable = response.ok;
    if (quantumServiceAvailable) {
      console.log("  Quantum service available - using real circuits");
    } else {
      console.log("  Quantum service unavailable - using placeholder circuits");
    }
    return quantumServiceAvailable;
  } catch {
    quantumServiceAvailable = false;
    console.log("  Quantum service unavailable - using placeholder circuits");
    return false;
  }
}

/**
 * Generate a quantum circuit via the quantum service.
 * When variantCircuitId is provided it overrides rarity-based selection,
 * allowing each plant variant to declare its own specific circuit.
 */
async function generateQuantumCircuit(
  seed: number,
  rarity: number,
  variantCircuitId?: string
): Promise<{ circuitDefinition: string; circuitId: string }> {
  const isAvailable = await checkQuantumService();

  // Resolved circuit ID: prefer variant declaration over rarity-based selection
  const resolvedCircuitId = variantCircuitId ?? getCircuitIdForRarity(rarity);

  if (!isAvailable) {
    // Fall back to placeholder circuit
    return {
      circuitDefinition: createPlaceholderCircuit(seed),
      circuitId: resolvedCircuitId,
    };
  }

  try {
    const response = await fetch(`${QUANTUM_SERVICE_URL}/circuits/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seed,
        // Pass explicit circuit ID if variant declared one; otherwise use rarity
        ...(variantCircuitId ? { circuit_id: variantCircuitId } : { rarity }),
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      circuitDefinition: data.circuit_definition,
      circuitId: data.circuit_id,
    };
  } catch (error) {
    console.warn(`  Warning: Circuit generation failed, using placeholder`);
    return {
      circuitDefinition: createPlaceholderCircuit(seed),
      circuitId: resolvedCircuitId,
    };
  }
}

/**
 * Get circuit ID based on variant rarity (fallback mapping).
 */
function getCircuitIdForRarity(rarity: number): string {
  if (rarity >= 1.0) return "superposition"; // Level 1 - very common
  if (rarity >= 0.85) return "bell_pair"; // Level 2 - common
  if (rarity >= 0.7) return "ghz_state"; // Level 3 - moderate
  if (rarity >= 0.4) return "interference"; // Level 4 - uncommon
  return "variational"; // Level 5 - rare
}

/**
 * Create a placeholder quantum circuit definition.
 * Used when quantum service is unavailable.
 */
function createPlaceholderCircuit(seed: number): string {
  const placeholder = {
    type: "placeholder",
    seed,
    num_qubits: 5,
    created_at: new Date().toISOString(),
  };
  return Buffer.from(JSON.stringify(placeholder)).toString("base64");
}

async function main() {
  console.log("Seeding garden...");

  // Clear existing plants and quantum records
  // Order matters due to foreign key constraints
  console.log("Clearing existing data...");
  await db.observationEvent.deleteMany({});
  await db.plant.deleteMany({});
  await db.entanglementGroup.deleteMany({});
  await db.quantumRecord.deleteMany({});
  await db.observationRegion.deleteMany({});

  // Generate positions
  const positions = generatePositions(NUM_PLANTS);

  console.log(`Creating ${NUM_PLANTS} plants...`);

  for (let i = 0; i < NUM_PLANTS; i++) {
    const variant = selectVariant();
    const position = positions[i]!;
    const seed = Date.now() + i;

    // Generate quantum circuit — prefer variant's declared circuitId over rarity-based selection
    const { circuitDefinition, circuitId } = await generateQuantumCircuit(
      seed,
      variant.rarity,
      variant.circuitId
    );

    // Determine if plant should start germinated
    // 50% of plants start germinated for immediate visual interest
    const shouldGerminate = Math.random() < 0.5;
    const germinatedAt = shouldGerminate ? new Date() : null;

    // Select color variation for multi-color variants
    // selectColorVariation takes variant and probability, returns variation name or null
    const colorVariationName = selectColorVariation(variant, Math.random());

    // Random lifecycle modifier (0.8 - 1.2 speed variation)
    const lifecycleModifier = 0.8 + Math.random() * 0.4;

    // Create plant with quantum circuit
    await db.plant.create({
      data: {
        positionX: position.x,
        positionY: position.y,
        observed: false,
        visualState: "superposed",
        variantId: variant.id,
        germinatedAt,
        lifecycleModifier,
        colorVariationName,
        quantumCircuit: {
          create: {
            circuitId,
            circuitDefinition,
            status: "pending",
            measurements: [],
            probabilities: [],
          },
        },
      },
    });

    console.log(
      `  Created plant ${i + 1}/${NUM_PLANTS}: ${variant.name} (${circuitId}) at (${position.x.toFixed(0)}, ${position.y.toFixed(0)})${germinatedAt ? " [germinated]" : " [dormant]"}`
    );
  }

  // Create entanglement groups by linking random pairs of plants
  console.log(`\nCreating ${NUM_ENTANGLED_PAIRS} entanglement groups...`);

  const allPlants = await db.plant.findMany();
  const unentangledPlants = [...allPlants];

  for (let i = 0; i < NUM_ENTANGLED_PAIRS && unentangledPlants.length >= 2; i++) {
    // Pick two random plants to entangle
    const idx1 = Math.floor(Math.random() * unentangledPlants.length);
    const plant1 = unentangledPlants.splice(idx1, 1)[0]!;

    const idx2 = Math.floor(Math.random() * unentangledPlants.length);
    const plant2 = unentangledPlants.splice(idx2, 1)[0]!;

    // Create a shared quantum circuit for the entangled pair
    // Use bell_pair circuit for entangled plants (demonstrates correlation)
    const entangledSeed = Date.now() + 1000 + i;
    const { circuitDefinition: entangledCircuit } = await generateQuantumCircuit(
      entangledSeed,
      0.9 // Use bell_pair level rarity
    );
    const sharedCircuit = await db.quantumRecord.create({
      data: {
        circuitId: "bell_pair", // Entangled plants use Bell pair circuit
        circuitDefinition: entangledCircuit,
        status: "pending",
        measurements: [],
        probabilities: [],
      },
    });

    // Create entanglement group linking both plants
    const group = await db.entanglementGroup.create({
      data: {
        quantumCircuitId: sharedCircuit.id,
      },
    });

    // Link both plants to the entanglement group
    await db.plant.update({
      where: { id: plant1.id },
      data: { entanglementGroupId: group.id },
    });

    await db.plant.update({
      where: { id: plant2.id },
      data: { entanglementGroupId: group.id },
    });

    console.log(`  Created entanglement group ${i + 1}: ${plant1.variantId} ↔ ${plant2.variantId}`);
  }

  console.log("\nGarden seeded successfully!");
  console.log(`  Total plants: ${NUM_PLANTS}`);
  console.log(`  Entangled pairs: ${NUM_ENTANGLED_PAIRS}`);

  // Print variant distribution
  const plants = await db.plant.findMany();
  const variantCounts = new Map<string, number>();
  for (const plant of plants) {
    variantCounts.set(plant.variantId, (variantCounts.get(plant.variantId) ?? 0) + 1);
  }
  console.log("  Variant distribution:");
  for (const [variantId, count] of variantCounts) {
    console.log(`    - ${variantId}: ${count}`);
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
