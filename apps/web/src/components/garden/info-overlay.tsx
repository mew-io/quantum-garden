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
  onStartTour?: () => void;
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
export function InfoOverlay({ forceShow = false, onDismiss, onStartTour }: InfoOverlayProps) {
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
      style={{ backgroundColor: "rgba(58, 53, 46, 0.5)" }}
    >
      <div
        className={`max-w-md bg-[--wc-cream] backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl border border-[--wc-stone]/30 transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        {/* Title */}
        <h2 className="text-xl font-light text-[--wc-ink] mb-4">Welcome to the Quantum Garden</h2>

        {/* Description */}
        <p className="text-[--wc-ink-soft] text-sm leading-relaxed mb-6">
          Plants exist in quantum superposition until observed. When you observe a plant, its traits
          are revealed.
        </p>

        {/* Device-specific instructions */}
        <div className="bg-[--wc-paper]/60 rounded-lg p-4 mb-4">
          <p className="text-[--wc-ink-soft] text-sm">
            {isTouch ? (
              <>
                <span className="text-blue-700 font-medium">Touch and hold</span> on a plant to
                observe it.
              </>
            ) : (
              <>
                <span className="text-blue-700 font-medium">Hover over a plant</span> and hold to
                observe it. Its quantum traits will be revealed.
              </>
            )}
          </p>
        </div>

        {/* Entanglement explanation */}
        <div className="bg-rose-50/60 border border-rose-200/40 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <EntanglementIcon />
            <p className="text-rose-700 text-xs uppercase tracking-wide font-medium">
              Quantum Entanglement
            </p>
          </div>
          <p className="text-[--wc-ink-soft] text-sm">
            Some plants share a <span className="text-rose-700">quantum connection</span>. When you
            observe one, its entangled partners instantly reveal correlated traits—no matter how far
            apart they are.
          </p>
        </div>

        {/* Keyboard shortcuts - desktop only */}
        {!isTouch && (
          <div className="mb-6">
            <p className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
              Keyboard Shortcuts
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 bg-[--wc-paper] text-[--wc-ink-soft] rounded text-xs font-mono border border-[--wc-stone]/40">
                  ?
                </kbd>
                <span className="text-[--wc-ink-muted]">Help</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 bg-[--wc-paper] text-[--wc-ink-soft] rounded text-xs font-mono border border-[--wc-stone]/40">
                  Esc
                </kbd>
                <span className="text-[--wc-ink-muted]">Close</span>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3">
          {onStartTour && (
            <button
              onClick={() => {
                handleDismiss();
                // Small delay to allow overlay to fade out first
                setTimeout(() => onStartTour(), 350);
              }}
              className="px-4 py-2 border border-purple-300/50 hover:border-purple-400 text-purple-700 hover:text-purple-800 text-sm rounded-lg transition-colors"
            >
              Take a Tour
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="px-6 py-2 bg-[--wc-bark] hover:bg-[#6A5E4D] text-white text-sm rounded-lg transition-colors"
          >
            Enter the Garden
          </button>
        </div>

        {/* Subtle hint */}
        <p className="text-[--wc-ink-muted] text-xs mt-4">
          The garden evolves whether anyone is watching or not.
        </p>
      </div>
    </div>
  );
}

/**
 * Entanglement icon - two connected circles representing quantum connection.
 */
function EntanglementIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-rose-600"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
