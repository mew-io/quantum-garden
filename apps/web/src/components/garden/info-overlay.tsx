"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "quantum-garden-info-dismissed";

/**
 * Detects if the device supports touch input.
 * Returns true for touch devices (mobile/tablet), false for desktop.
 */
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check for touch support
    const hasTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error - msMaxTouchPoints is IE-specific
      navigator.msMaxTouchPoints > 0;
    setIsTouch(hasTouch);
  }, []);

  return isTouch;
}

interface InfoOverlayProps {
  forceShow?: boolean;
  onDismiss?: () => void;
}

/**
 * Info overlay that explains how observation works.
 *
 * - Shows on first visit to the garden
 * - Can be forced to show via Help button
 * - Device-aware messaging (desktop vs mobile)
 * - Dismissable with localStorage persistence
 * - Calm, minimal aesthetic matching garden style
 */
export function InfoOverlay({ forceShow = false, onDismiss }: InfoOverlayProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Start dismissed to avoid flash
  const [isVisible, setIsVisible] = useState(false);
  const isTouch = useIsTouchDevice();

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsDismissed(false);
      // Fade in after a brief delay
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  // Handle forceShow from Help button
  useEffect(() => {
    if (forceShow) {
      setIsDismissed(false);
      setTimeout(() => setIsVisible(true), 50);
    }
  }, [forceShow]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for fade out animation before hiding
    setTimeout(() => {
      setIsDismissed(true);
      localStorage.setItem(STORAGE_KEY, "true");
      onDismiss?.();
    }, 300);
  };

  if (isDismissed && !forceShow) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div
        className={`max-w-md bg-gray-900/95 backdrop-blur-sm rounded-2xl p-8 text-center shadow-2xl border border-gray-700/50 transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        {/* Title */}
        <h2 className="text-xl font-light text-gray-100 mb-4">Welcome to the Quantum Garden</h2>

        {/* Description */}
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Plants exist in quantum superposition until observed. When you observe a plant, its traits
          are revealed.
        </p>

        {/* Device-specific instructions */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          {isTouch ? (
            <p className="text-gray-300 text-sm">
              <span className="text-blue-400 font-medium">Touch and hold</span> on a plant to
              observe it.
            </p>
          ) : (
            <p className="text-gray-300 text-sm">
              The <span className="text-blue-400 font-medium">reticle</span> drifts across the
              garden. When it aligns with a plant, observation begins automatically.
            </p>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded-lg transition-colors"
        >
          Enter the Garden
        </button>

        {/* Subtle hint */}
        <p className="text-gray-600 text-xs mt-4">
          The garden evolves whether anyone is watching or not.
        </p>
      </div>
    </div>
  );
}
