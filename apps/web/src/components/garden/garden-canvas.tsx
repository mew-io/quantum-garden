"use client";

import { useEffect, useRef, useCallback } from "react";
import { Application } from "pixi.js";
import { CANVAS } from "@quantum-garden/shared";
import type { ObservationPayload } from "@quantum-garden/shared";
import { createPlantRenderer, type PlantRenderer } from "./plant-renderer";
import { createReticleController, type ReticleController } from "./reticle-controller";
import { createObservationSystem, type ObservationSystem } from "./observation-system";
import { createEntanglementRenderer, type EntanglementRenderer } from "./entanglement-renderer";
import { createGardenEvolutionSystem, type GardenEvolutionSystem } from "./garden-evolution";
import { useObservation } from "@/hooks/use-observation";
import { useEvolution } from "@/hooks/use-evolution";
import { usePlants } from "@/hooks/use-plants";
import { useGardenStore } from "@/stores/garden-store";

/**
 * Main garden canvas component.
 *
 * Renders the quantum garden using PixiJS for smooth WebGL-based
 * 2D graphics. Plants, observation regions (invisible), and the
 * reticle are all managed within this canvas.
 */
export function GardenCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const plantRendererRef = useRef<PlantRenderer | null>(null);
  const reticleControllerRef = useRef<ReticleController | null>(null);
  const observationSystemRef = useRef<ObservationSystem | null>(null);
  const entanglementRendererRef = useRef<EntanglementRenderer | null>(null);
  const evolutionSystemRef = useRef<GardenEvolutionSystem | null>(null);
  const cleanupTouchHandlersRef = useRef<(() => void) | null>(null);

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

  // Handle window resize
  const handleResize = useCallback(() => {
    if (appRef.current) {
      appRef.current.renderer.resize(window.innerWidth, window.innerHeight);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let mounted = true;

    // Initialize PixiJS application
    const app = new Application();

    const initApp = async () => {
      try {
        await app.init({
          background: CANVAS.BACKGROUND_COLOR,
          width: window.innerWidth,
          height: window.innerHeight,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        if (!mounted) {
          app.destroy(true);
          return;
        }

        container.appendChild(app.canvas);
        appRef.current = app;

        // Initialize entanglement renderer (behind plants)
        const entanglementRenderer = createEntanglementRenderer(app);
        entanglementRendererRef.current = entanglementRenderer;
        entanglementRenderer.start();

        // Initialize plant renderer
        const plantRenderer = createPlantRenderer(app);
        plantRendererRef.current = plantRenderer;
        plantRenderer.start();

        // Initialize reticle controller
        const reticleController = createReticleController(app);
        reticleControllerRef.current = reticleController;
        reticleController.start();

        // Touch handling: Switch reticle to touch mode on pointer input
        // PointerEvents work for both touch and mouse, providing unified handling
        let hasActivatedTouchMode = false;

        const handlePointerDown = (event: PointerEvent) => {
          // Switch to touch mode on first pointer interaction
          if (!hasActivatedTouchMode && event.pointerType !== "mouse") {
            reticleController.setControlMode("touch");
            hasActivatedTouchMode = true;
          }

          // Update reticle position if in touch mode
          if (reticleController.getControlMode() === "touch") {
            const rect = app.canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) * (app.screen.width / rect.width);
            const y = (event.clientY - rect.top) * (app.screen.height / rect.height);
            reticleController.setPosition(x, y);
          }
        };

        const handlePointerMove = (event: PointerEvent) => {
          // Only update position when in touch mode and pointer is down
          if (reticleController.getControlMode() === "touch" && event.buttons > 0) {
            const rect = app.canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) * (app.screen.width / rect.width);
            const y = (event.clientY - rect.top) * (app.screen.height / rect.height);
            reticleController.setPosition(x, y);
          }
        };

        app.canvas.addEventListener("pointerdown", handlePointerDown);
        app.canvas.addEventListener("pointermove", handlePointerMove);

        // Store cleanup function for event listeners
        cleanupTouchHandlersRef.current = () => {
          app.canvas.removeEventListener("pointerdown", handlePointerDown);
          app.canvas.removeEventListener("pointermove", handlePointerMove);
        };

        // Initialize observation system
        const observationSystem = createObservationSystem(app);
        observationSystemRef.current = observationSystem;
        observationSystem.setObservationCallback((payload) => {
          // Use the ref to call the current observation trigger
          // This allows the callback to access the latest hook reference
          observationCallbackRef.current(payload);

          // Trigger entanglement pulse for correlated plants
          const plants = useGardenStore.getState().plants;
          const observedPlant = plants.find((p) => p.id === payload.plantId);
          if (observedPlant?.entanglementGroupId && entanglementRendererRef.current) {
            entanglementRendererRef.current.triggerPulse(observedPlant.entanglementGroupId);
          }
        });
        observationSystem.start();

        // Initialize garden evolution system (runs independently)
        const evolutionSystem = createGardenEvolutionSystem();
        evolutionSystemRef.current = evolutionSystem;
        evolutionSystem.setGerminationCallback(async (plantId) => {
          await germinationCallbackRef.current(plantId);
        });
        evolutionSystem.start();

        // Listen for window resize
        window.addEventListener("resize", handleResize);
      } catch (error) {
        console.error("Failed to initialize garden canvas:", error);
      }
    };

    initApp();

    // Cleanup on unmount
    return () => {
      mounted = false;
      window.removeEventListener("resize", handleResize);

      // Clean up touch event handlers
      if (cleanupTouchHandlersRef.current) {
        cleanupTouchHandlersRef.current();
        cleanupTouchHandlersRef.current = null;
      }

      if (observationSystemRef.current) {
        observationSystemRef.current.destroy();
        observationSystemRef.current = null;
      }

      if (reticleControllerRef.current) {
        reticleControllerRef.current.destroy();
        reticleControllerRef.current = null;
      }

      if (plantRendererRef.current) {
        plantRendererRef.current.destroy();
        plantRendererRef.current = null;
      }

      if (entanglementRendererRef.current) {
        entanglementRendererRef.current.destroy();
        entanglementRendererRef.current = null;
      }

      if (evolutionSystemRef.current) {
        evolutionSystemRef.current.destroy();
        evolutionSystemRef.current = null;
      }

      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [handleResize]);

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
