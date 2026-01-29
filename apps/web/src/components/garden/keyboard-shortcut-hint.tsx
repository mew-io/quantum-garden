"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "quantum-garden-keyboard-hint-shown";

/**
 * KeyboardShortcutHint - One-time discovery hint for keyboard shortcuts
 *
 * Displays a subtle floating hint on first visit to help users discover
 * that keyboard shortcuts are available. The hint:
 * - Appears after a 3-second delay on first visit
 * - Auto-dismisses after 8 seconds
 * - Never shows again (tracked in localStorage)
 * - Can be clicked to dismiss early
 *
 * Only shown on desktop (hidden on touch devices).
 */
export function KeyboardShortcutHint() {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Check if already shown
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Check if touch device (skip hint on mobile)
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    // Show hint after delay
    const showTimer = setTimeout(() => {
      setShouldRender(true);
      // Small delay for animation
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }, 3000);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Auto-dismiss after 8 seconds
    const hideTimer = setTimeout(() => {
      handleDismiss();
    }, 8000);

    return () => clearTimeout(hideTimer);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
    // Wait for fade-out animation before removing from DOM
    setTimeout(() => {
      setShouldRender(false);
    }, 300);
  };

  if (!shouldRender) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`
        fixed top-[calc(var(--inset-top)+5rem)] left-1/2 -translate-x-1/2 z-40
        flex items-center gap-3 px-4 py-3
        bg-gray-900/95 backdrop-blur-md rounded-lg border border-purple-500/30
        shadow-lg shadow-purple-500/10
        cursor-pointer select-none
        transition-all duration-300 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
      role="status"
      aria-live="polite"
    >
      {/* Keyboard icon */}
      <div className="text-purple-400">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
        </svg>
      </div>

      {/* Message */}
      <div className="text-sm">
        <span className="text-gray-300">Press </span>
        <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-purple-300 font-mono text-xs mx-1">
          ?
        </kbd>
        <span className="text-gray-300"> for keyboard shortcuts</span>
      </div>

      {/* Dismiss hint */}
      <span className="text-gray-500 text-xs ml-2">click to dismiss</span>
    </div>
  );
}
