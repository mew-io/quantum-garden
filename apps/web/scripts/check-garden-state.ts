import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function checkGarden() {
  const plants = await db.plant.findMany({
    orderBy: { createdAt: "desc" },
  });

  const now = Date.now();
  const alive = plants.filter((p) => !p.diedAt);
  const dead = plants.filter((p) => p.diedAt);
  const dormant = alive.filter((p) => !p.germinatedAt);
  const germinated = alive.filter((p) => p.germinatedAt);

  console.log("\n=== Garden State ===");
  console.log(`Total plants: ${plants.length}`);
  console.log(
    `Alive: ${alive.length} (${dormant.length} dormant, ${germinated.length} germinated)`
  );
  console.log(`Dead: ${dead.length}`);

  if (dormant.length > 0) {
    const oldestDormant = dormant.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
    const dormantAge = Math.floor((now - oldestDormant!.createdAt.getTime()) / 1000 / 60);
    console.log(`\nOldest dormant plant: ${dormantAge} minutes old`);
  }

  if (germinated.length > 0) {
    const ages = germinated.map((p) => Math.floor((now - p.germinatedAt!.getTime()) / 1000 / 60));
    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);
    console.log(`\nGerminated plant ages: ${minAge}-${maxAge} minutes`);
  }

  if (dead.length > 0) {
    const recentDead = dead.sort((a, b) => b.diedAt!.getTime() - a.diedAt!.getTime()).slice(0, 5);
    console.log(`\nRecent deaths:`);
    recentDead.forEach((p) => {
      const deathAge = Math.floor((now - p.diedAt!.getTime()) / 1000 / 60);
      const lifespan = p.germinatedAt
        ? Math.floor((p.diedAt!.getTime() - p.germinatedAt.getTime()) / 1000 / 60)
        : 0;
      console.log(`  - ${p.variantId}: lived ${lifespan}min, died ${deathAge}min ago`);
    });
  }

  const gardenState = await db.gardenState.findUnique({ where: { id: "singleton" } });
  if (gardenState) {
    const lastCheck = Math.floor((now - gardenState.lastEvolutionCheck.getTime()) / 1000);
    console.log(`\nLast evolution check: ${lastCheck} seconds ago`);
    console.log(`Evolution version: ${gardenState.evolutionVersion}`);
  }

  await db.$disconnect();
}

checkGarden().catch(console.error);
