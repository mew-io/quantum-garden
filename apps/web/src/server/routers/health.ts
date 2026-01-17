import { router, publicProcedure } from "../trpc";

/**
 * Health check router for monitoring and deployment verification.
 */
export const healthRouter = router({
  check: publicProcedure.query(async ({ ctx }) => {
    // Verify database connection
    try {
      await ctx.db.$queryRaw`SELECT 1`;
      return {
        status: "healthy",
        database: "connected",
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: "unhealthy",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      };
    }
  }),
});
