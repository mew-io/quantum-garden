import { router } from "../trpc";
import { plantsRouter } from "./plants";
import { observationRouter } from "./observation";
import { healthRouter } from "./health";
import { quantumRouter } from "./quantum";
import { gardenRouter } from "./garden";

/**
 * Main application router combining all sub-routers.
 */
export const appRouter = router({
  health: healthRouter,
  plants: plantsRouter,
  observation: observationRouter,
  quantum: quantumRouter,
  garden: gardenRouter,
});

export type AppRouter = typeof appRouter;
