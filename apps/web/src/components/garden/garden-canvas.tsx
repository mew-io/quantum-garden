"use client";

import { useEffect, useRef } from "react";
import { Application } from "pixi.js";
import { CANVAS } from "@quantum-garden/shared";

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

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize PixiJS application
    const app = new Application();

    const initApp = async () => {
      await app.init({
        background: CANVAS.BACKGROUND_COLOR,
        resizeTo: window,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      containerRef.current?.appendChild(app.canvas);
      appRef.current = app;

      // TODO: Initialize garden systems
      // - Plant renderer
      // - Reticle controller
      // - Observation system
      // - Dwell tracker
    };

    initApp();

    // Cleanup on unmount
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} id="garden-canvas" />;
}
