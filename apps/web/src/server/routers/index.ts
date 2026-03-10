import { router } from "../trpc";
import { plantsRouter } from "./plants";
import { healthRouter } from "./health";
import { quantumRouter } from "./quantum";

/**
 * Main application router combining all sub-routers.
 */
export const appRouter = router({
  health: healthRouter,
  plants: plantsRouter,
  quantum: quantumRouter,
});

export type AppRouter = typeof appRouter;
