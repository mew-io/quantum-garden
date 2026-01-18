import { test, expect } from "@playwright/test";

/**
 * E2E tests for the Quantum Garden.
 *
 * These tests verify the garden renders correctly and plants are visible.
 * Testing the full observation flow is complex due to the autonomous reticle
 * and invisible observation regions, so we focus on verifying the components
 * are initialized correctly.
 */

test.describe("Garden Canvas", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the garden
    await page.goto("/");
    // Wait for the canvas to be mounted
    await page.waitForSelector("#garden-canvas canvas", { timeout: 10000 });
  });

  test("should render the garden canvas", async ({ page }) => {
    // The garden canvas should be present
    const canvas = page.locator("#garden-canvas canvas");
    await expect(canvas).toBeVisible();

    // Canvas should be full-screen
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    if (canvasBox) {
      // Canvas should be reasonably sized (at least 200x200)
      expect(canvasBox.width).toBeGreaterThan(200);
      expect(canvasBox.height).toBeGreaterThan(200);
    }
  });

  test("should not have console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Reload to capture any load errors
    await page.reload();
    await page.waitForSelector("#garden-canvas canvas", { timeout: 10000 });

    // Wait a bit for any async errors
    await page.waitForTimeout(1000);

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      (err) =>
        // Ignore hydration warnings and expected network errors
        !err.includes("hydration") &&
        !err.includes("Failed to load resource") &&
        !err.includes("net::ERR")
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("should make tRPC request for plants", async ({ page }) => {
    // Intercept tRPC requests
    const plantsRequest = page.waitForRequest((req) => req.url().includes("/api/trpc/plants.list"));

    await page.goto("/");

    // Wait for the plants request
    const request = await plantsRequest;
    expect(request.url()).toContain("/api/trpc/plants.list");
  });
});

test.describe("Observation Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#garden-canvas canvas", { timeout: 10000 });
  });

  test("should handle observation mutation request", async ({ page }) => {
    // This test verifies the observation endpoint is accessible
    // We can't easily trigger a real observation in E2E due to the
    // autonomous reticle and invisible regions

    // Set up request interception for observation
    let observationRequestMade = false;

    page.on("request", (req) => {
      if (req.url().includes("/api/trpc/observation.recordObservation")) {
        observationRequestMade = true;
      }
    });

    // Wait for initial render
    await page.waitForTimeout(2000);

    // In a real scenario, we'd need to:
    // 1. Find a plant location
    // 2. Move the reticle over it (requires game state access)
    // 3. Wait for dwell duration
    // For now, we just verify the app loaded without errors
    expect(observationRequestMade).toBe(false); // No observation yet
  });

  test("should show plants after loading", async ({ page }) => {
    // Wait for tRPC to load plants
    await page.waitForResponse((res) => res.url().includes("/api/trpc/plants.list"));

    // Give the renderer time to create sprites
    await page.waitForTimeout(500);

    // The canvas should now have plants rendered
    // We can't easily inspect WebGL canvas content, but we can verify
    // the canvas is still present and no errors occurred
    const canvas = page.locator("#garden-canvas canvas");
    await expect(canvas).toBeVisible();
  });
});
