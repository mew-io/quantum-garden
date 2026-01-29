/**
 * First Observation Tracking
 *
 * Tracks whether the user has made their first observation in the garden.
 * Used to trigger special celebration effects for new users.
 */

const STORAGE_KEY = "quantum-garden-first-observation-completed";

/**
 * Check if this is the user's first observation.
 * Returns true if no observation has been recorded yet.
 */
export function isFirstObservation(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== "true";
}

/**
 * Mark that the user has completed their first observation.
 * Call this after triggering the first observation celebration.
 */
export function markFirstObservationComplete(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, "true");
}

/**
 * Reset first observation tracking (for testing or settings).
 */
export function resetFirstObservation(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
