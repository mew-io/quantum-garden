/**
 * Accessibility utilities for the Quantum Garden.
 *
 * Provides helpers for respecting user accessibility preferences
 * like reduced motion, which is important for users who experience
 * motion sickness or vestibular disorders.
 */

/**
 * Check if the user prefers reduced motion.
 *
 * When true, animations should be minimized or disabled:
 * - Shimmer effects should be static
 * - Collapse transitions should be instant
 * - Reticle movement can be slower or paused
 *
 * @returns true if the user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  return mediaQuery.matches;
}

/**
 * Subscribe to changes in the reduced motion preference.
 *
 * @param callback - Called when the preference changes
 * @returns Unsubscribe function
 */
export function onReducedMotionChange(callback: (prefersReduced: boolean) => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const handler = (event: MediaQueryListEvent) => {
    callback(event.matches);
  };

  mediaQuery.addEventListener("change", handler);

  return () => {
    mediaQuery.removeEventListener("change", handler);
  };
}
