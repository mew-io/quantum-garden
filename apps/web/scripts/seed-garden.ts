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
// 200 plants provides lush initial density with natural clustering.
const NUM_PLANTS = 200;
const NUM_ENTANGLED_PAIRS = 5; // Number of entangled plant pairs
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
 * Approximate gaussian random using Box-Muller transform.
 * Returns a value centered at 0 with ~68% within [-1, 1].
 */
function gaussianRandom(): number {
  const u1 = Math.random() || 0.0001;
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Clamp a position to stay within the usable canvas area.
 */
function clampPosition(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.max(MARGIN, Math.min(CANVAS_WIDTH - MARGIN, x)),
    y: Math.max(MARGIN, Math.min(CANVAS_HEIGHT - MARGIN, y)),
  };
}

/**
 * Generate a random anchor point within the usable canvas area.
 */
function randomAnchor(): { x: number; y: number } {
  return {
    x: MARGIN + Math.random() * (CANVAS_WIDTH - 2 * MARGIN),
    y: MARGIN + Math.random() * (CANVAS_HEIGHT - 2 * MARGIN),
  };
}

/**
 * Cluster configuration per plant category.
 * Plants in clustering categories get placed near anchor points;
 * non-clustering plants are scattered uniformly.
 */
const CLUSTER_CONFIG: Record<string, { anchorsPerGroup: number; spread: number }> = {
  // Tight clusters for ground cover
  "ground-cover": { anchorsPerGroup: 2, spread: 180 },
  // Medium clusters for grasses
  grass: { anchorsPerGroup: 2, spread: 250 },
  // Flower beds
  flower: { anchorsPerGroup: 3, spread: 300 },
  // Shrub thickets
  shrub: { anchorsPerGroup: 2, spread: 280 },
  // Tree groves
  tree: { anchorsPerGroup: 2, spread: 350 },
};

/**
 * Infer plant category from variant ID for clustering purposes.
 */
function inferCategory(variantId: string): string {
  if (variantId.includes("moss") || variantId.includes("pebble")) return "ground-cover";
  if (variantId.includes("tuft") || variantId.includes("reed")) return "grass";
  if (variantId.includes("sapling") || variantId.includes("willow")) return "tree";
  if (variantId.includes("bush") || variantId.includes("thicket")) return "shrub";
  if (
    variantId.includes("bloom") ||
    variantId.includes("flower") ||
    variantId.includes("tulip") ||
    variantId.includes("daisy") ||
    variantId.includes("poppy") ||
    variantId.includes("bell") ||
    variantId.includes("rose") ||
    variantId.includes("lotus") ||
    variantId.includes("zen")
  )
    return "flower";
  // Ethereal, geometric, abstract — scatter uniformly
  return "ethereal";
}

/**
 * Generate cluster-aware positions for a list of pre-selected variants.
 *
 * Plants in natural categories (trees, flowers, grasses, etc.) are placed
 * around cluster anchor points to form groves, beds, and meadows.
 * Ethereal/rare plants are scattered uniformly for visual contrast.
 */
function generateClusteredPositions(variants: { id: string }[]): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = new Array(variants.length);

  // Group plant indices by category
  const groups = new Map<string, number[]>();
  for (let i = 0; i < variants.length; i++) {
    const category = inferCategory(variants[i]!.id);
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category)!.push(i);
  }

  for (const [category, indices] of groups) {
    const config = CLUSTER_CONFIG[category];

    if (!config) {
      // Ethereal / no cluster config — scatter uniformly
      for (const idx of indices) {
        positions[idx] = clampPosition(
          MARGIN + Math.random() * (CANVAS_WIDTH - 2 * MARGIN),
          MARGIN + Math.random() * (CANVAS_HEIGHT - 2 * MARGIN)
        );
      }
      continue;
    }

    // Create anchor points for this category
    const numAnchors = Math.min(config.anchorsPerGroup, Math.ceil(indices.length / 3));
    const anchors: { x: number; y: number }[] = [];
    for (let a = 0; a < numAnchors; a++) {
      anchors.push(randomAnchor());
    }

    // Distribute plants around anchors with gaussian jitter
    for (let i = 0; i < indices.length; i++) {
      const anchor = anchors[i % anchors.length]!;
      const spread = config.spread;
      const pos = clampPosition(
        anchor.x + gaussianRandom() * spread * 0.5,
        anchor.y + gaussianRandom() * spread * 0.5
      );
      positions[indices[i]!] = pos;
    }
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

  // Pre-select all variants for cluster-aware positioning
  const selectedVariants = Array.from({ length: NUM_PLANTS }, () => selectVariant());

  // Generate cluster-aware positions
  const positions = generateClusteredPositions(selectedVariants);

  console.log(`Creating ${NUM_PLANTS} plants with cluster-aware positioning...`);

  for (let i = 0; i < NUM_PLANTS; i++) {
    const variant = selectedVariants[i]!;
    const position = positions[i]!;
    const seed = Date.now() + i;

    // Generate quantum circuit — prefer variant's declared circuitId over rarity-based selection
    const { circuitDefinition, circuitId } = await generateQuantumCircuit(
      seed,
      variant.rarity,
      variant.circuitId
    );

    // Determine if plant should start germinated
    // 65% of plants start germinated for a lush, active garden
    const shouldGerminate = Math.random() < 0.65;
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
