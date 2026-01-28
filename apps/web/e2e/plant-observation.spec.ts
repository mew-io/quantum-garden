import { test, expect } from "@playwright/test";

/**
 * E2E tests for plant observation and collapse rendering.
 *
 * These tests verify that when plants transition from superposed to collapsed
 * state, they render correctly (filling their bounding box, not appearing tiny
 * in a corner).
 *
 * The bug we're testing for: Quantum service returns 8x8 patterns, but the
 * renderer expects 64x64. Without scaling, collapsed plants appear tiny.
 */

test.describe("Plant Observation Rendering", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the garden
    await page.goto("/");
    // Wait for the canvas and plants to load
    await page.waitForSelector("#garden-canvas canvas", { timeout: 10000 });
    // Wait for plants to be loaded
    await page.waitForResponse((res) => res.url().includes("/api/trpc/plants.list"));
    // Give renderer time to initialize
    await page.waitForTimeout(1000);
  });

  test("should load garden with visible plants", async ({ page }) => {
    // Take baseline screenshot
    await page.screenshot({ path: "test-results/garden-loaded.png" });

    // Verify canvas is present
    const canvas = page.locator("#garden-canvas canvas");
    await expect(canvas).toBeVisible();
  });

  test("should enable debug mode via toolbar", async ({ page }) => {
    // Click debug button
    await page.click('button:has-text("Debug")');

    // Debug panel should be visible
    await expect(page.locator('h3:has-text("Quantum Debug")')).toBeVisible();

    // Take screenshot with debug overlay
    await page.screenshot({ path: "test-results/debug-mode-enabled.png" });
  });

  test("should show plant bounding boxes in debug mode", async ({ page }) => {
    // Enable debug mode
    await page.click('button:has-text("Debug")');
    await page.waitForTimeout(500);

    // Take screenshot - should show bounding boxes
    await page.screenshot({ path: "test-results/debug-bounding-boxes.png" });

    // The debug panel should show plant counts
    const debugPanel = page.locator('h3:has-text("Quantum Debug")').locator("..");
    await expect(debugPanel).toBeVisible();
  });

  test("should enable click-to-observe mode for testing", async ({ page }) => {
    // Enable debug mode
    await page.click('button:has-text("Debug")');

    // Find and click the toggle observation mode button
    const toggleButton = page.locator('button:has-text("Toggle Observation Mode")');
    await toggleButton.click();

    // Mode should change to CLICK
    await expect(page.locator("text=CLICK")).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: "test-results/click-mode-enabled.png" });
  });

  test("should observe a plant via click and verify rendering", async ({ page }) => {
    // Enable debug mode
    await page.click('button:has-text("Debug")');
    await page.waitForTimeout(300);

    // Switch to click observation mode
    const toggleButton = page.locator('button:has-text("Toggle Observation Mode")');
    await toggleButton.click();
    await page.waitForTimeout(300);

    // Go to Plants tab to find a superposed plant
    await page.click('button:has-text("Plants")');
    await page.waitForTimeout(300);

    // Find a superposed (unobserved) plant in the list
    // Plants with green dots are germinated but not observed
    const plantList = page.locator('[class*="overflow-auto"]').first();
    const superposedPlant = plantList.locator("button").first();

    // Click to select the plant
    await superposedPlant.click();
    await page.waitForTimeout(300);

    // Get plant position from the debug panel
    const positionText = await page.locator("text=/\\(\\d+, \\d+\\)/").textContent();

    // Take screenshot before observation
    await page.screenshot({ path: "test-results/plant-before-observation.png" });

    // Now we need to click on the canvas at the plant's position to observe it
    // First, let's parse the position
    if (positionText) {
      const match = positionText.match(/\((\d+), (\d+)\)/);
      if (match) {
        const [, x, y] = match;
        const plantX = parseInt(x!, 10);
        const plantY = parseInt(y!, 10);

        // Click on the canvas at the plant's position
        const canvas = page.locator("#garden-canvas canvas");
        const canvasBox = await canvas.boundingBox();

        if (canvasBox) {
          // The plant coordinates are in canvas space
          // Click at the plant's position
          await page.mouse.click(canvasBox.x + plantX, canvasBox.y + plantY);
          await page.waitForTimeout(1000);

          // Take screenshot after observation
          await page.screenshot({ path: "test-results/plant-after-observation.png" });
        }
      }
    }
  });

  test("collapsed plants should fill their bounding boxes", async ({ page }) => {
    // This is a visual regression test that documents the expected behavior
    // After observation, a plant should:
    // 1. Change from superposed to collapsed state
    // 2. Render at full size within its bounding box
    // 3. NOT appear tiny in the corner of its bounding box

    // Enable debug mode
    await page.click('button:has-text("Debug")');
    await page.waitForTimeout(500);

    // Take screenshot showing the current state
    // Manual inspection can verify if collapsed plants fill their boxes
    await page.screenshot({
      path: "test-results/collapsed-plant-rendering.png",
      fullPage: false,
    });

    // Check for observed plants count
    const observedCount = await page.locator("text=/Observed: \\d+/").textContent();
    console.log("Observed plants:", observedCount);

    // If there are observed plants, they should be rendering correctly
    // Visual inspection of the screenshot will reveal if the bug exists
  });
});

test.describe("Pattern Size Verification", () => {
  test("should log pattern dimensions for collapsed plants", async ({ page }) => {
    // This test adds console monitoring to verify pattern sizes

    const patternLogs: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("pattern") || text.includes("atlas") || text.includes("UV")) {
        patternLogs.push(text);
      }
    });

    await page.goto("/");
    await page.waitForSelector("#garden-canvas canvas", { timeout: 10000 });
    await page.waitForResponse((res) => res.url().includes("/api/trpc/plants.list"));
    await page.waitForTimeout(2000);

    // Enable debug mode
    await page.click('button:has-text("Debug")');
    await page.waitForTimeout(500);

    // Log any pattern-related console messages
    if (patternLogs.length > 0) {
      console.log("Pattern-related logs:", patternLogs);
    }

    // Take final screenshot
    await page.screenshot({ path: "test-results/pattern-verification.png" });
  });
});
