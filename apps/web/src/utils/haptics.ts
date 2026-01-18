/**
 * Haptic Feedback Utility
 *
 * Provides tactile feedback via the Web Vibration API.
 * Gracefully degrades on unsupported devices (iOS Safari, desktop).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
 */

/**
 * Check if the device supports vibration.
 * Returns false on iOS Safari, most desktop browsers, and when
 * the page doesn't have focus or permission.
 */
export function supportsHaptics(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

/**
 * Trigger a brief haptic pulse.
 * Used for lightweight feedback like touch mode activation.
 *
 * Pattern: 15ms vibration
 */
export function hapticLight(): void {
  if (supportsHaptics()) {
    navigator.vibrate(15);
  }
}

/**
 * Trigger a medium haptic pulse.
 * Used for confirming actions like button presses.
 *
 * Pattern: 30ms vibration
 */
export function hapticMedium(): void {
  if (supportsHaptics()) {
    navigator.vibrate(30);
  }
}

/**
 * Trigger a success haptic pattern.
 * Used for celebrating completed actions like observation.
 *
 * Pattern: two quick pulses (40ms, pause, 40ms)
 */
export function hapticSuccess(): void {
  if (supportsHaptics()) {
    navigator.vibrate([40, 50, 40]);
  }
}

/**
 * Trigger a custom vibration pattern.
 *
 * @param pattern - Duration in ms, or array of [vibrate, pause, vibrate, ...]
 */
export function hapticCustom(pattern: number | number[]): void {
  if (supportsHaptics()) {
    navigator.vibrate(pattern);
  }
}
