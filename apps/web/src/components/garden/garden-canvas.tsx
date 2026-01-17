"use client";

import { useEffect, useRef, useCallback } from "react";
import { Application } from "pixi.js";
import { CANVAS } from "@quantum-garden/shared";
import { createPlantRenderer, type PlantRenderer } from "./plant-renderer";

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

        // Initialize plant renderer
        const plantRenderer = createPlantRenderer(app);
        plantRendererRef.current = plantRenderer;
        plantRenderer.start();

        // TODO: Initialize remaining garden systems
        // - Reticle controller
        // - Observation system
        // - Dwell tracker

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

      if (plantRendererRef.current) {
        plantRendererRef.current.destroy();
        plantRendererRef.current = null;
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
