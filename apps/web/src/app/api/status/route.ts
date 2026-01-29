/**
 * Status Endpoint
 *
 * Returns deployment metadata useful for debugging:
 * - Version from package.json
 * - Git commit and branch (from environment variables)
 * - Environment (development/production)
 * - Current timestamp
 *
 * This endpoint is public and does not require authentication.
 *
 * @module api/status
 */

import { NextResponse } from "next/server";

/**
 * Status response interface
 */
interface StatusResponse {
  status: "ok";
  version: string;
  environment: string;
  timestamp: string;
  git: {
    commit: string | null;
    branch: string | null;
  };
  node: string;
}

export async function GET(): Promise<NextResponse<StatusResponse>> {
  // Version from package.json (set at build time via next.config.js or env)
  const version = process.env.npm_package_version ?? "0.1.0";

  // Git info from environment variables (set at build time)
  // These are commonly set by CI/CD systems or can be added to vercel.json
  const gitCommit = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT ?? null;
  const gitBranch = process.env.VERCEL_GIT_COMMIT_REF ?? process.env.GIT_BRANCH ?? null;

  // Environment
  const environment = process.env.NODE_ENV ?? "development";

  return NextResponse.json({
    status: "ok",
    version,
    environment,
    timestamp: new Date().toISOString(),
    git: {
      commit: gitCommit ? gitCommit.substring(0, 7) : null,
      branch: gitBranch,
    },
    node: process.version,
  });
}
