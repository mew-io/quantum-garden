/**
 * Garden Evolution Worker (Standalone Script)
 *
 * Runs the garden evolution system locally for development or
 * on platforms that support long-running processes (Heroku, Railway, Render).
 *
 * Usage:
 *   pnpm evolve         # Single run
 *   pnpm evolve:watch   # Continuous with 15s interval
 *
 * For Vercel deployment, use the cron API instead (/api/cron/evolve).
 *
 * @module scripts/evolve-garden
 */

import { PrismaClient } from "@prisma/client";
import { runEvolutionCheck, getEvolutionState, EVOLUTION_CONFIG } from "../src/server/evolution";

const db = new PrismaClient();

/**
 * Run a single evolution check with logging.
 */
async function runWithLogging() {
  const startTime = Date.now();
  console.log(`\n[${new Date().toISOString()}] Running garden evolution...`);

  // Get current state
  const stateBefore = await getEvolutionState(db);
  console.log(
    `  State: v${stateBefore.version}, ${stateBefore.dormantCount} dormant, ${stateBefore.germinatedCount} germinated`
  );

  // Run evolution
  const result = await runEvolutionCheck(db);
  const duration = Date.now() - startTime;

  if (result.germinated > 0) {
    const waveNote = result.isWave ? " (WAVE EVENT)" : "";
    console.log(
      `  Result: ${result.germinated}/${result.checked} plants germinated${waveNote} (${duration}ms)`
    );
    for (const id of result.germinatedIds) {
      console.log(`    - ${id.slice(0, 8)}...`);
    }
  } else {
    console.log(`  Result: 0/${result.checked} eligible plants germinated (${duration}ms)`);
  }

  return result;
}

// Check if running in watch mode
const isWatchMode = process.argv.includes("--watch");

if (isWatchMode) {
  const INTERVAL = EVOLUTION_CONFIG.CHECK_INTERVAL;
  console.log(`Starting evolution worker in watch mode (${INTERVAL / 1000}s interval)...`);
  console.log("Press Ctrl+C to stop.\n");

  // Run immediately, then on interval
  runWithLogging().catch(console.error);
  setInterval(() => {
    runWithLogging().catch(console.error);
  }, INTERVAL);
} else {
  // Single run mode
  runWithLogging()
    .catch((e) => {
      console.error("Evolution check failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await db.$disconnect();
    });
}
