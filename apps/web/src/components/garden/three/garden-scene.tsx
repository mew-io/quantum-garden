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
import type { ObservationPayload, Plant } from "@quantum-garden/shared";
import { SceneManager } from "./core/scene-manager";
import { PlantInstancer, type RenderablePlant } from "./plants/plant-instancer";
import { disposeTextureAtlas } from "./core/texture-atlas";
import { OverlayManager } from "./overlays";
import { ObservationSystem } from "@/components/garden/observation-system";
import { useObservation } from "@/hooks/use-observation";
import { usePlants } from "@/hooks/use-plants";
import { useGardenStore } from "@/stores/garden-store";
import { hapticSuccess } from "@/utils/haptics";
import { debugLogger } from "@/lib/debug-logger";
import { isFirstObservation } from "@/lib/first-observation";
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
 * Plants, observation regions, and the reticle are all managed here.
 */
export function GardenScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const plantInstancerRef = useRef<PlantInstancer | null>(null);
  const overlayManagerRef = useRef<OverlayManager | null>(null);
  const observationSystemRef = useRef<ObservationSystem | null>(null);

  // Observation hook for quantum measurement
  const { triggerObservation } = useObservation();

  // Load plants from server into store (polls every 5s to pick up server-side evolution)
  // Evolution now runs server-side via cron/worker - client is just a viewer
  usePlants();

  // Store callback ref to keep it stable across renders
  const observationCallbackRef = useRef<(payload: ObservationPayload) => void>(() => {});
  observationCallbackRef.current = triggerObservation;

  // Track if store subscription already synced this frame to avoid redundant work
  const storeSyncedThisFrameRef = useRef(false);

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

    // Initialize observation system (after convertToRenderable and overlayManager)
    const observationSystem = new ObservationSystem(
      initialPlants,
      () => overlayManager.reticle.getPosition(),
      (payload) => {
        // Check if this is the user's first observation before triggering callback
        const isFirst = isFirstObservation();

        observationCallbackRef.current(payload);

        // Find the observed plant
        const plant = useGardenStore.getState().plants.find((p) => p.id === payload.plantId);
        if (plant) {
          // Get plant's primary color for celebration feedback
          const primaryColor = getPlantPrimaryColor(plant);

          // Trigger celebration feedback - enhanced for first observation
          if (isFirst) {
            overlayManager.feedback.triggerFirstObservationCelebration(
              plant.position.x,
              plant.position.y
            );
          } else {
            overlayManager.feedback.triggerCelebration(
              plant.position.x,
              plant.position.y,
              primaryColor
            );
          }

          // Calculate audio panning from plant position
          const pan = (plant.position.x / CANVAS.DEFAULT_WIDTH) * 2 - 1;

          // Extract hue from color for observation tone (default 120 = green)
          const hue = primaryColor ? hexToHue(primaryColor) : 120;

          // Play observation sound (enhanced for first observation)
          if (isFirst) {
            audioManager.playEffect("firstObservation", { pan, hue });
          } else {
            audioManager.playEffect("observation", { pan, hue });
          }

          // Trigger entanglement pulse if plant is entangled
          if (plant.entanglementGroupId) {
            overlayManager.entanglement.triggerPulse(plant.entanglementGroupId);
            // Play entanglement harmony sound
            audioManager.playEffect("entanglement", { pan });
          }

          // Haptic feedback
          hapticSuccess();
        }
      }
    );
    observationSystemRef.current = observationSystem;

    // Subscribe to store changes
    const unsubscribe = useGardenStore.subscribe((state, prevState) => {
      if (!mounted) return;
      // Only update if plants changed
      if (state.plants !== prevState.plants) {
        plantInstancer.syncPlants(convertToRenderable(state.plants));
        overlayManager.setPlants(state.plants);
        observationSystem.updatePlants(state.plants);
        // Mark that we synced this frame to avoid redundant sync in updateCallback
        storeSyncedThisFrameRef.current = true;

        // Detect germinations and trigger particle effects + audio
        for (const plant of state.plants) {
          const prevPlant = prevState.plants.find((p) => p.id === plant.id);
          // Check if this plant just germinated (had no germinatedAt, now has one)
          if (plant.germinatedAt && (!prevPlant || !prevPlant.germinatedAt)) {
            const accentColor = getPlantPrimaryColor(plant);
            overlayManager.germination.triggerGermination(
              plant.position.x,
              plant.position.y,
              accentColor
            );

            // Play germination chime with spatial panning based on plant position
            const pan = (plant.position.x / CANVAS.DEFAULT_WIDTH) * 2 - 1;
            audioManager.playEffect("germination", { pan });
          }
        }
      }
      // Update debug overlay when active region changes
      if (state.activeRegion !== prevState.activeRegion) {
        overlayManager.debug.setActiveRegion(state.activeRegion);
      }

      // Handle camera micro-transitions on dwell state changes
      if (state.dwellTarget !== prevState.dwellTarget) {
        if (state.dwellTarget !== null) {
          // Starting to dwell on a plant - subtle zoom in
          sceneManager.onDwellStart();
        } else {
          // Stopped dwelling - return to normal zoom
          sceneManager.onDwellEnd();
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

      // Re-sync to update transition animations
      // This is needed because transitions are time-based, not state-based
      // Skip if store subscription already synced this frame to avoid redundant work
      const currentPlants = useGardenStore.getState().plants;
      if (!storeSyncedThisFrameRef.current) {
        plantInstancer.syncPlants(convertToRenderable(currentPlants));
        overlayManager.setPlants(currentPlants);
      }
      // Reset the flag for next frame
      storeSyncedThisFrameRef.current = false;

      // Update overlays (time-based animations still need updating even after sync)
      overlayManager.update(time, deltaTime);

      // Update observation system (region-based observation)
      // Skip if in time-travel mode (read-only historical view)
      const { isTimeTravelMode } = useGardenStore.getState();
      if (!isTimeTravelMode) {
        observationSystem.update(deltaTime);
      }
    };
    sceneManager.addUpdateCallback(updateCallback);

    // Add post-render callback for overlay rendering
    const postRenderCallback = () => {
      overlayManager.render();
    };
    sceneManager.addPostRenderCallback(postRenderCallback);

    // Click handler for direct plant observation (DEBUG MODE ONLY)
    const handleClick = (event: MouseEvent) => {
      // Only handle clicks in debug mode
      if (!observationSystem.getDebugMode()) {
        return;
      }

      const { x, y } = sceneManager.screenToWorld(event.clientX, event.clientY);

      // Find plant at click position
      const plants = useGardenStore.getState().plants;
      const clickedPlant = plants.find((plant) => {
        if (plant.observed) return false;
        const dx = plant.position.x - x;
        const dy = plant.position.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 32; // Click radius in pixels
      });

      if (clickedPlant) {
        // Check if this is the user's first observation
        const isFirst = isFirstObservation();

        // Get plant's primary color for celebration feedback
        const primaryColor = getPlantPrimaryColor(clickedPlant);

        // Trigger observation
        observationCallbackRef.current({
          plantId: clickedPlant.id,
          regionId: "click-region-debug",
          reticleId: "click-reticle-debug",
          timestamp: new Date(),
        });

        // Trigger celebration feedback - enhanced for first observation
        if (isFirst) {
          overlayManager.feedback.triggerFirstObservationCelebration(
            clickedPlant.position.x,
            clickedPlant.position.y
          );
        } else {
          overlayManager.feedback.triggerCelebration(
            clickedPlant.position.x,
            clickedPlant.position.y,
            primaryColor
          );
        }

        // Trigger entanglement pulse if plant is entangled
        if (clickedPlant.entanglementGroupId) {
          overlayManager.entanglement.triggerPulse(clickedPlant.entanglementGroupId);
        }

        hapticSuccess();
      }
    };
    sceneManager.canvas.addEventListener("click", handleClick);

    // Handle observation mode changes from debug panel
    const handleObservationModeChange = (e: CustomEvent<{ mode: string; debugMode: boolean }>) => {
      observationSystem.setDebugMode(e.detail.debugMode);
    };
    window.addEventListener(
      "observation-mode-change" as keyof WindowEventMap,
      handleObservationModeChange as EventListener
    );

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

    // Cleanup
    return () => {
      mounted = false;
      clearInterval(performanceInterval);
      unsubscribe();
      sceneManager.canvas.removeEventListener("click", handleClick);
      window.removeEventListener(
        "observation-mode-change" as keyof WindowEventMap,
        handleObservationModeChange as EventListener
      );
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
      sceneManager.removeUpdateCallback(updateCallback);
      sceneManager.removePostRenderCallback(postRenderCallback);

      if (observationSystemRef.current) {
        observationSystemRef.current.dispose();
        observationSystemRef.current = null;
      }

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
