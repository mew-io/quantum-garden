/**
 * UI Preferences Management
 *
 * Centralized management of localStorage-based UI preferences
 * like "don't show again" settings for various panels and hints.
 */

/** All localStorage keys for dismissable UI elements */
export const UI_PREFERENCE_KEYS = {
  /** First observation celebration - only shows once */
  FIRST_OBSERVATION: "quantum-garden-first-observation-completed",
  /** Observation context panel - can be permanently hidden */
  CONTEXT_PANEL: "quantum-garden-hide-context-panel",
  /** Info overlay - shows on first visit */
  INFO_OVERLAY: "quantum-garden-info-dismissed",
  /** Keyboard shortcut hint - shows once */
  KEYBOARD_HINT: "quantum-garden-keyboard-hint-shown",
} as const;

/**
 * Get the current state of all UI preferences.
 */
export function getUIPreferences(): Record<keyof typeof UI_PREFERENCE_KEYS, boolean> {
  if (typeof window === "undefined") {
    return {
      FIRST_OBSERVATION: false,
      CONTEXT_PANEL: false,
      INFO_OVERLAY: false,
      KEYBOARD_HINT: false,
    };
  }

  return {
    FIRST_OBSERVATION: localStorage.getItem(UI_PREFERENCE_KEYS.FIRST_OBSERVATION) === "true",
    CONTEXT_PANEL: localStorage.getItem(UI_PREFERENCE_KEYS.CONTEXT_PANEL) === "true",
    INFO_OVERLAY: localStorage.getItem(UI_PREFERENCE_KEYS.INFO_OVERLAY) === "true",
    KEYBOARD_HINT: localStorage.getItem(UI_PREFERENCE_KEYS.KEYBOARD_HINT) === "true",
  };
}

/**
 * Reset all "don't show again" preferences.
 * This will cause all dismissable UI elements to appear again.
 */
export function resetAllUIPreferences(): void {
  if (typeof window === "undefined") return;

  Object.values(UI_PREFERENCE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

/**
 * Reset a specific UI preference.
 */
export function resetUIPreference(key: keyof typeof UI_PREFERENCE_KEYS): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(UI_PREFERENCE_KEYS[key]);
}

/**
 * Get human-readable labels for each preference.
 */
export const UI_PREFERENCE_LABELS: Record<keyof typeof UI_PREFERENCE_KEYS, string> = {
  FIRST_OBSERVATION: "First observation celebration",
  CONTEXT_PANEL: "Observation context panel",
  INFO_OVERLAY: "Welcome info overlay",
  KEYBOARD_HINT: "Keyboard shortcut hint",
};
