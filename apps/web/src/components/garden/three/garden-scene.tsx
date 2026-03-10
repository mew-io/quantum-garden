"use client";

/**
 * Garden Scene - Three.js implementation of the Quantum Garden
 *
 * Replaces the PixiJS-based GardenCanvas with a Three.js implementation
 * using InstancedMesh for efficient rendering of hundreds of plants.
 */

import { useEffect, useRef } from "react";
import {
  CANVAS,
  getVariantById,
  getEffectivePalette,
  computeLifecycleState,
} from "@quantum-garden/shared";
import type { Plant } from "@quantum-garden/shared";
import { SceneManager } from "./core/scene-manager";
import { PlantInstancer, type RenderablePlant } from "./plants/plant-instancer";
import { disposeTextureAtlas } from "./core/texture-atlas";
import { OverlayManager } from "./overlays";
import { usePlants } from "@/hooks/use-plants";
import { useGardenStore } from "@/stores/garden-store";
import { hapticSuccess } from "@/utils/haptics";
import { debugLogger } from "@/lib/debug-logger";
import { isFirstObservation, markFirstObservationComplete } from "@/lib/first-observation";
import { audioManager } from "@/lib/audio/audio-manager";

/**
 * Get the primary color from a plant's palette for celebration feedback.
 *
 * Uses resolved traits if observed, otherwise computes from variant definition.
 */
function getPlantPrimaryColor(plant: Plant): string | undefined {
  // If plant has resolved traits from quantum measurement, use those
  if (plant.traits?.colorPalette?.[0]) {
    return plant.traits.colorPalette[0];
  }

  // Fall back to variant's first keyframe palette
  const variant = getVariantById(plant.variantId);
  if (!variant) return undefined;

  // For non-germinated plants, use first keyframe
  const keyframe = variant.keyframes[0];
  if (!keyframe) return undefined;

  // Get effective palette considering color variation
  if (plant.germinatedAt) {
    const plantWithLifecycle = {
      ...plant,
      germinatedAt: plant.germinatedAt,
      colorVariationName: plant.colorVariationName ?? null,
    };
    const state = computeLifecycleState(plantWithLifecycle, variant, new Date());
    const palette = getEffectivePalette(
      state.currentKeyframe,
      variant,
      plant.colorVariationName ?? null
    );
    return palette[0];
  }

  // For dormant plants, just use the first palette color
  const palette = getEffectivePalette(keyframe, variant, plant.colorVariationName ?? null);
  return palette[0];
}

/**
 * Convert a hex color string to HSL hue (0-360).
 * Used to map plant colors to audio frequencies.
 */
function hexToHue(hex: string): number {
  // Remove # if present
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);

  const r = ((num >> 16) & 0xff) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) return 0; // Gray, no hue

  let h = 0;
  if (max === r) {
    h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / delta + 2) / 6;
  } else {
    h = ((r - g) / delta + 4) / 6;
  }

  return h * 360;
}

/**
 * Main garden scene component using Three.js.
 *
 * Renders the quantum garden with efficient instanced rendering.
 * Plants, observation regions, and cursor-based observation are all managed here.
 */
/** Auto-observation timeout in milliseconds */
const AUTO_OBSERVE_TIMEOUT = 30_000;

export function GardenScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const plantInstancerRef = useRef<PlantInstancer | null>(null);
  const overlayManagerRef = useRef<OverlayManager | null>(null);

  // Load plants from server into store (polls every 5s to pick up server-side evolution)
  // Evolution now runs server-side via cron/worker - client is just a viewer
  usePlants();

  // Track which plants have been observed client-side (not persisted to server)
  const observedPlantsRef = useRef<Set<string>>(new Set());
  // Track auto-observation timers per plant
  const autoObserveTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let mounted = true;

    debugLogger.rendering.info("Initializing Three.js scene...");

    // Initialize Three.js scene
    const sceneManager = new SceneManager({
      container,
      backgroundColor: CANVAS.BACKGROUND_COLOR,
    });
    sceneManagerRef.current = sceneManager;

    debugLogger.rendering.info("Scene manager created", {
      canvasSize: {
        width: sceneManager.canvas.width,
        height: sceneManager.canvas.height,
      },
    });

    // Initialize plant instancer
    const plantInstancer = new PlantInstancer();
    plantInstancerRef.current = plantInstancer;

    // Add plant mesh to scene
    sceneManager.scene.add(plantInstancer.getMesh());

    debugLogger.rendering.info("Plant instancer added to scene");

    // Initialize overlay manager
    const overlayManager = new OverlayManager(sceneManager);
    overlayManagerRef.current = overlayManager;

    // Helper to convert store plants to renderable format
    const convertToRenderable = (plants: Plant[]): RenderablePlant[] => {
      return plants.map((plant) => ({
        id: plant.id,
        position: plant.position,
        observed: plant.observed,
        visualState: plant.visualState,
        variantId: plant.variantId,
        germinatedAt: plant.germinatedAt ? new Date(plant.germinatedAt) : null,
        lifecycleModifier: plant.lifecycleModifier,
        colorVariationName: plant.colorVariationName,
        entanglementGroupId: plant.entanglementGroupId,
        traits: plant.traits,
      }));
    };

    // Initial sync
    const initialPlants = useGardenStore.getState().plants;
    debugLogger.rendering.info(`Initial plant sync: ${initialPlants.length} plants from store`);
    plantInstancer.syncPlants(convertToRenderable(initialPlants));
    overlayManager.setPlants(initialPlants);

    // Log sample plant details for debugging if plants exist
    if (initialPlants.length > 0 && initialPlants[0]) {
      const sample = initialPlants[0];
      debugLogger.rendering.debug("Sample plant data", {
        id: sample.id.slice(0, 8),
        position: sample.position,
        variantId: sample.variantId,
        observed: sample.observed,
        germinatedAt: sample.germinatedAt,
      });
    }

    /**
     * Observe a plant (client-side only).
     * Marks it as collapsed in the local store and triggers celebration feedback.
     */
    const observePlant = (plantId: string) => {
      if (observedPlantsRef.current.has(plantId)) return;
      observedPlantsRef.current.add(plantId);

      // Cancel any pending auto-observe timer
      const timer = autoObserveTimersRef.current.get(plantId);
      if (timer) {
        clearTimeout(timer);
        autoObserveTimersRef.current.delete(plantId);
      }

      // Update plant in local store (client-side only, not persisted)
      const store = useGardenStore.getState();
      store.updatePlant(plantId, {
        observed: true,
        visualState: "collapsed",
      });

      // Find the plant for feedback
      const plant = store.plants.find((p) => p.id === plantId);
      if (!plant) return;

      const isFirst = isFirstObservation();
      const primaryColor = getPlantPrimaryColor(plant);
      const pan = (plant.position.x / CANVAS.DEFAULT_WIDTH) * 2 - 1;
      const hue = primaryColor ? hexToHue(primaryColor) : 120;

      // Visual celebration
      if (isFirst) {
        overlayManager.feedback.triggerFirstObservationCelebration(
          plant.position.x,
          plant.position.y
        );
        audioManager.playEffect("firstObservation", { pan, hue });
        markFirstObservationComplete();
      } else {
        overlayManager.feedback.triggerCelebration(
          plant.position.x,
          plant.position.y,
          primaryColor
        );
        audioManager.playEffect("observation", { pan, hue });
      }

      // Entanglement pulse if applicable
      if (plant.entanglementGroupId) {
        overlayManager.entanglement.triggerPulse(plant.entanglementGroupId);
        audioManager.playEffect("entanglement", { pan });

        // Also observe entangled partners
        const partners = store.plants.filter(
          (p) => p.entanglementGroupId === plant.entanglementGroupId && p.id !== plantId
        );
        for (const partner of partners) {
          if (!observedPlantsRef.current.has(partner.id)) {
            observedPlantsRef.current.add(partner.id);
            const partnerTimer = autoObserveTimersRef.current.get(partner.id);
            if (partnerTimer) {
              clearTimeout(partnerTimer);
              autoObserveTimersRef.current.delete(partner.id);
            }
            store.updatePlant(partner.id, {
              observed: true,
              visualState: "collapsed",
            });
          }
        }
      }

      hapticSuccess();
    };

    /**
     * Start auto-observation timer for an unobserved plant.
     * After AUTO_OBSERVE_TIMEOUT, the plant automatically collapses.
     */
    const startAutoObserveTimer = (plantId: string) => {
      if (observedPlantsRef.current.has(plantId)) return;
      if (autoObserveTimersRef.current.has(plantId)) return;

      const timer = setTimeout(() => {
        autoObserveTimersRef.current.delete(plantId);
        observePlant(plantId);
      }, AUTO_OBSERVE_TIMEOUT);
      autoObserveTimersRef.current.set(plantId, timer);
    };

    // Start auto-observe timers for initial germinated plants
    for (const plant of initialPlants) {
      if (!plant.observed && plant.germinatedAt) {
        startAutoObserveTimer(plant.id);
      }
    }

    // Subscribe to store changes
    const unsubscribe = useGardenStore.subscribe((state, prevState) => {
      if (!mounted) return;
      // Only update if plants changed
      if (state.plants !== prevState.plants) {
        plantInstancer.syncPlants(convertToRenderable(state.plants));
        overlayManager.setPlants(state.plants);

        // Detect germinations and start auto-observe timers
        for (const plant of state.plants) {
          const prevPlant = prevState.plants.find((p) => p.id === plant.id);

          // Check if this plant just germinated
          if (plant.germinatedAt && (!prevPlant || !prevPlant.germinatedAt)) {
            const accentColor = getPlantPrimaryColor(plant);
            overlayManager.germination.triggerGermination(
              plant.position.x,
              plant.position.y,
              accentColor
            );

            const pan = (plant.position.x / CANVAS.DEFAULT_WIDTH) * 2 - 1;
            audioManager.playEffect("germination", { pan });

            // Start auto-observe timer for newly germinated plant
            startAutoObserveTimer(plant.id);
          }

          // Start timers for any new unobserved plants we haven't seen before
          if (!plant.observed && plant.germinatedAt && !prevPlant) {
            startAutoObserveTimer(plant.id);
          }
        }
      }
    });

    // Track last frame time for delta calculation
    let lastTime = performance.now() / 1000;

    // Add update callback for animations
    const updateCallback = () => {
      const time = performance.now() / 1000;
      const deltaTime = time - lastTime;
      lastTime = time;

      plantInstancer.updateTime(time);
      plantInstancer.updateTransitions();
      overlayManager.update(time, deltaTime);
    };
    sceneManager.addUpdateCallback(updateCallback);

    // Add post-render callback for overlay rendering
    const postRenderCallback = () => {
      overlayManager.render();
    };
    sceneManager.addPostRenderCallback(postRenderCallback);

    // Click handler for plant observation + viewing quantum data
    const handleClick = (event: MouseEvent) => {
      // Ignore clicks that were actually drags (panning)
      if (sceneManager.wasDragging) return;

      const { x, y } = sceneManager.screenToWorld(event.clientX, event.clientY);

      // Find the nearest germinated plant within click radius
      const plants = useGardenStore.getState().plants;
      let nearestPlant: (typeof plants)[number] | null = null;
      let nearestDist = Infinity;

      for (const plant of plants) {
        if (!plant.germinatedAt) continue;
        const dx = plant.position.x - x;
        const dy = plant.position.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 48 && distance < nearestDist) {
          nearestDist = distance;
          nearestPlant = plant;
        }
      }

      if (!nearestPlant) return;

      // Observe if not yet observed
      if (!observedPlantsRef.current.has(nearestPlant.id)) {
        observePlant(nearestPlant.id);
      }

      // Always open the debug panel with this plant's detail
      window.dispatchEvent(
        new CustomEvent("open-plant-detail", {
          detail: { plantId: nearestPlant.id },
        })
      );
    };
    sceneManager.canvas.addEventListener("click", handleClick);

    // Handle debug panel visibility changes
    const handleDebugVisibilityChange = (e: CustomEvent<{ visible: boolean }>) => {
      overlayManager.debug.setVisible(e.detail.visible);
    };
    window.addEventListener(
      "debug-visibility-change" as keyof WindowEventMap,
      handleDebugVisibilityChange as EventListener
    );

    // Handle plant selection from debug panel
    const handlePlantDebugSelect = (e: CustomEvent<{ plantId: string | null }>) => {
      overlayManager.setSelectedPlant(e.detail.plantId);
    };
    window.addEventListener(
      "plant-debug-highlight" as keyof WindowEventMap,
      handlePlantDebugSelect as EventListener
    );

    // Handle plant locate from debug panel (pan + zoom + emphasis)
    const handlePlantDebugLocate = (
      e: CustomEvent<{ plantId: string; position: { x: number; y: number } }>
    ) => {
      const { plantId, position } = e.detail;
      overlayManager.setSelectedPlant(plantId);
      sceneManager.panTo(position.x, position.y);
      overlayManager.triggerLocatePulse();
    };
    window.addEventListener(
      "plant-debug-locate" as keyof WindowEventMap,
      handlePlantDebugLocate as EventListener
    );

    // Handle superposition mode changes from debug panel
    const handleSuperpositionModeChange = (e: CustomEvent<{ mode: 0 | 1 }>) => {
      plantInstancer.setSuperpositionMode(e.detail.mode);
      debugLogger.rendering.info(
        `Superposition mode set to ${e.detail.mode === 0 ? "stacked ghosts" : "flickering"}`
      );
    };
    window.addEventListener(
      "superposition-mode-change" as keyof WindowEventMap,
      handleSuperpositionModeChange as EventListener
    );

    // Start render loop
    debugLogger.rendering.info("Starting render loop");
    sceneManager.start();

    // Push performance metrics to store periodically (every 500ms)
    const performanceInterval = setInterval(() => {
      if (!mounted) return;
      const metrics = sceneManager.performanceMetrics;
      useGardenStore.getState().setPerformanceStats({
        fps: metrics.fps,
        frameTimeMs: metrics.frameTimeMs,
        drawCalls: metrics.drawCalls,
        triangles: metrics.triangles,
      });
    }, 500);

    // Capture ref values for cleanup
    const autoObserveTimers = autoObserveTimersRef.current;

    // Cleanup
    return () => {
      mounted = false;
      clearInterval(performanceInterval);
      unsubscribe();

      // Clear all auto-observe timers
      for (const timer of autoObserveTimers.values()) {
        clearTimeout(timer);
      }
      autoObserveTimers.clear();

      sceneManager.canvas.removeEventListener("click", handleClick);
      window.removeEventListener(
        "debug-visibility-change" as keyof WindowEventMap,
        handleDebugVisibilityChange as EventListener
      );
      window.removeEventListener(
        "plant-debug-highlight" as keyof WindowEventMap,
        handlePlantDebugSelect as EventListener
      );
      window.removeEventListener(
        "superposition-mode-change" as keyof WindowEventMap,
        handleSuperpositionModeChange as EventListener
      );
      window.removeEventListener(
        "plant-debug-locate" as keyof WindowEventMap,
        handlePlantDebugLocate as EventListener
      );
      sceneManager.removeUpdateCallback(updateCallback);
      sceneManager.removePostRenderCallback(postRenderCallback);

      if (overlayManagerRef.current) {
        overlayManagerRef.current.dispose();
        overlayManagerRef.current = null;
      }

      if (plantInstancerRef.current) {
        plantInstancerRef.current.dispose();
        plantInstancerRef.current = null;
      }

      if (sceneManagerRef.current) {
        sceneManagerRef.current.destroy();
        sceneManagerRef.current = null;
      }

      // Clean up global texture atlas
      disposeTextureAtlas();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="garden-canvas"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    />
  );
}
