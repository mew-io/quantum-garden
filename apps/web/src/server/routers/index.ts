import { router } from "../trpc";
import { plantsRouter } from "./plants";
import { observationRouter } from "./observation";
import { healthRouter } from "./health";

/**
 * Main application router combining all sub-routers.
 */
export const appRouter = router({
  health: healthRouter,
  plants: plantsRouter,
  observation: observationRouter,
});

export type AppRouter = typeof appRouter;
