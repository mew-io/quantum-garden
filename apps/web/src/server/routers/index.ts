import { router } from "../trpc";
import { plantsRouter } from "./plants";
import { observationRouter } from "./observation";
import { healthRouter } from "./health";
import { quantumRouter } from "./quantum";

/**
 * Main application router combining all sub-routers.
 */
export const appRouter = router({
  health: healthRouter,
  plants: plantsRouter,
  observation: observationRouter,
  quantum: quantumRouter,
});

export type AppRouter = typeof appRouter;
