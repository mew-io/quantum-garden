/**
 * Migrate plant positions from 1200x800 to 3840x2160 coordinate space
 *
 * Scale factors:
 *   X: 3840 / 1200 = 3.2
 *   Y: 2160 / 800  = 2.7
 *
 * Run with: npx tsx scripts/migrate-positions-4k.ts
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const SCALE_X = 3840 / 1200;
const SCALE_Y = 2160 / 800;

async function migrate() {
  const plants = await db.plant.findMany({
    select: { id: true, positionX: true, positionY: true },
  });

  console.log(`Found ${plants.length} plants to migrate`);
  console.log(`Scale factors: X=${SCALE_X}, Y=${SCALE_Y}`);

  // Check if already migrated (any position > 1200 means likely already scaled)
  const maxX = Math.max(...plants.map((p) => p.positionX));
  const maxY = Math.max(...plants.map((p) => p.positionY));
  console.log(`Current max positions: X=${maxX.toFixed(1)}, Y=${maxY.toFixed(1)}`);

  if (maxX > 1300 || maxY > 900) {
    console.log("Positions appear to already be in the 4K coordinate space. Aborting.");
    await db.$disconnect();
    return;
  }

  // Scale all positions in a single query
  const result = await db.$executeRaw`
    UPDATE "Plant"
    SET "positionX" = "positionX" * ${SCALE_X},
        "positionY" = "positionY" * ${SCALE_Y}
  `;

  console.log(`Updated ${result} plants`);

  // Verify
  const after = await db.plant.findMany({
    select: { id: true, positionX: true, positionY: true },
  });
  const newMaxX = Math.max(...after.map((p) => p.positionX));
  const newMaxY = Math.max(...after.map((p) => p.positionY));
  console.log(`New max positions: X=${newMaxX.toFixed(1)}, Y=${newMaxY.toFixed(1)}`);

  await db.$disconnect();
}

migrate().catch((e) => {
  console.error("Migration failed:", e);
  db.$disconnect();
  process.exit(1);
});
