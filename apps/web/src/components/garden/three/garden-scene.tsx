"use client";

/**
 * Garden Scene - Three.js implementation of the Quantum Garden
 *
 * Replaces the PixiJS-based GardenCanvas with a Three.js implementation
 * using InstancedMesh for efficient rendering of hundreds of plants.
 */

import { useEffect, useRef } from "react";
import { CANVAS } from "@quantum-garden/shared";
import type { ObservationPayload, Plant } from "@quantum-garden/shared";
import { SceneManager } from "./core/scene-manager";
import { PlantInstancer, type RenderablePlant } from "./plants/plant-instancer";
import { disposeTextureAtlas } from "./core/texture-atlas";
import { OverlayManager } from "./overlays";
import { ObservationSystem } from "@/components/garden/observation-system";
import { useObservation } from "@/hooks/use-observation";
import { useEvolution } from "@/hooks/use-evolution";
import { usePlants } from "@/hooks/use-plants";
import { useGardenStore } from "@/stores/garden-store";
import { hapticSuccess } from "@/utils/haptics";

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

  // Evolution hook for plant germination
  const { triggerGermination } = useEvolution();

  // Load plants from server into store
  usePlants();

  // Store callback refs to keep them stable across renders
  const observationCallbackRef = useRef<(payload: ObservationPayload) => void>(() => {});
  observationCallbackRef.current = triggerObservation;

  const germinationCallbackRef = useRef<(plantId: string) => Promise<void>>(async () => {});
  germinationCallbackRef.current = triggerGermination;

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let mounted = true;

    // Initialize Three.js scene
    const sceneManager = new SceneManager({
      container,
      backgroundColor: CANVAS.BACKGROUND_COLOR,
    });
    sceneManagerRef.current = sceneManager;

    // Initialize plant instancer
    const plantInstancer = new PlantInstancer();
    plantInstancerRef.current = plantInstancer;

    // Add plant mesh to scene
    sceneManager.scene.add(plantInstancer.getMesh());

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
    plantInstancer.syncPlants(convertToRenderable(initialPlants));
    overlayManager.setPlants(initialPlants);

    // Initialize observation system (after convertToRenderable and overlayManager)
    const observationSystem = new ObservationSystem(
      initialPlants,
      () => overlayManager.reticle.getPosition(),
      (payload) => {
        observationCallbackRef.current(payload);

        // Find the observed plant
        const plant = useGardenStore.getState().plants.find((p) => p.id === payload.plantId);
        if (plant) {
          // Trigger celebration feedback
          overlayManager.feedback.triggerCelebration(plant.position.x, plant.position.y);

          // Trigger entanglement pulse if plant is entangled
          if (plant.entanglementGroupId) {
            overlayManager.entanglement.triggerPulse(plant.entanglementGroupId);
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
      }
      // Update debug overlay when active region changes
      if (state.activeRegion !== prevState.activeRegion) {
        overlayManager.debug.setActiveRegion(state.activeRegion);
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
      const currentPlants = useGardenStore.getState().plants;
      plantInstancer.syncPlants(convertToRenderable(currentPlants));

      // Update overlays (vector plants need plants for lifecycle updates)
      overlayManager.setPlants(currentPlants);
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

      const canvas = sceneManager.canvas;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width / window.devicePixelRatio);
      const y =
        (event.clientY - rect.top) * (canvas.height / rect.height / window.devicePixelRatio);

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
        // Trigger observation
        observationCallbackRef.current({
          plantId: clickedPlant.id,
          regionId: "click-region-debug",
          reticleId: "click-reticle-debug",
          timestamp: new Date(),
        });

        // Trigger celebration feedback
        overlayManager.feedback.triggerCelebration(
          clickedPlant.position.x,
          clickedPlant.position.y
        );

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

    // Start render loop
    sceneManager.start();

    // Cleanup
    return () => {
      mounted = false;
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
