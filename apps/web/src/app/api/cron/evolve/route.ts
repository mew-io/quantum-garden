/**
 * Garden Evolution Cron Endpoint
 *
 * This endpoint is called by Vercel Cron (or external cron services)
 * to trigger garden evolution. The garden grows server-side,
 * independent of any client watching.
 *
 * Security:
 * - Requires CRON_SECRET header to match env variable
 * - Returns 401 if secret doesn't match
 *
 * Usage:
 * - Vercel Cron: Configure in vercel.json
 * - External cron: POST /api/cron/evolve with Authorization header
 * - Manual: curl -X POST -H "Authorization: Bearer $CRON_SECRET" /api/cron/evolve
 *
 * @module api/cron/evolve
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runEvolutionCheck } from "@/server/evolution";

/**
 * Verify the cron secret to prevent unauthorized access.
 */
function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET;

  // In development, allow without secret
  if (process.env.NODE_ENV === "development" && !secret) {
    return true;
  }

  // Check Vercel cron header
  const vercelCronSecret = request.headers.get("x-vercel-cron-secret");
  if (vercelCronSecret && vercelCronSecret === secret) {
    return true;
  }

  // Check Authorization header (for external cron services)
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const [type, token] = authHeader.split(" ");
    if (type === "Bearer" && token === secret) {
      return true;
    }
  }

  return false;
}

export async function POST(request: Request) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runEvolutionCheck(db);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Evolution check failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also support GET for Vercel Cron (which uses GET by default)
export async function GET(request: Request) {
  return POST(request);
}
