/**
 * AudioManager - Singleton for managing all garden audio
 *
 * Handles ambient loops, sound effects, and user preferences.
 * Sound is optional and starts muted by default.
 *
 * @see docs/sound-effects-plan.md for full architecture
 */

import type { Howl } from "howler";
import { Howler } from "howler";

/** Sound effect names available for playback */
export type SoundEffect =
  | "germination"
  | "observation"
  | "entanglement"
  | "waveChime"
  | "firstObservation"
  | "panelOpen"
  | "panelClose";

/** localStorage keys for audio preferences */
const AUDIO_PREF_KEYS = {
  ENABLED: "quantum-garden-sound-enabled",
  VOLUME: "quantum-garden-sound-volume",
} as const;

/** Default audio settings */
const DEFAULTS = {
  ENABLED: false, // Start muted
  VOLUME: 0.7, // 70% volume
} as const;

/**
 * Singleton AudioManager class.
 * Access via the exported `audioManager` instance.
 */
class AudioManager {
  private static instance: AudioManager;

  private _isEnabled: boolean = DEFAULTS.ENABLED;
  private _volume: number = DEFAULTS.VOLUME;
  private _isInitialized: boolean = false;

  // Sound instances (lazy loaded)
  private ambientLoop: Howl | null = null;
  private effectSprites: Howl | null = null;

  // Listeners for state changes
  private listeners: Set<() => void> = new Set();

  private constructor() {
    // Load preferences from localStorage
    this.loadPreferences();
  }

  /**
   * Get the singleton instance.
   */
  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize the audio system.
   * Must be called from a user gesture (click/tap) due to browser autoplay policies.
   */
  async init(): Promise<void> {
    if (this._isInitialized) return;

    // Unlock audio context (required by some browsers)
    Howler.autoUnlock = true;

    this._isInitialized = true;
    this.notifyListeners();
  }

  /**
   * Load user preferences from localStorage.
   */
  private loadPreferences(): void {
    if (typeof window === "undefined") return;

    const savedEnabled = localStorage.getItem(AUDIO_PREF_KEYS.ENABLED);
    if (savedEnabled !== null) {
      this._isEnabled = savedEnabled === "true";
    }

    const savedVolume = localStorage.getItem(AUDIO_PREF_KEYS.VOLUME);
    if (savedVolume !== null) {
      const parsed = parseFloat(savedVolume);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        this._volume = parsed;
      }
    }

    // Apply volume to Howler global
    Howler.volume(this._isEnabled ? this._volume : 0);
  }

  /**
   * Save current preferences to localStorage.
   */
  private savePreferences(): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(AUDIO_PREF_KEYS.ENABLED, String(this._isEnabled));
    localStorage.setItem(AUDIO_PREF_KEYS.VOLUME, String(this._volume));
  }

  // ============ Public API ============

  /**
   * Whether sound is currently enabled.
   */
  get isEnabled(): boolean {
    return this._isEnabled;
  }

  /**
   * Current volume level (0.0 to 1.0).
   */
  get volume(): number {
    return this._volume;
  }

  /**
   * Whether the audio system has been initialized.
   */
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Enable or disable sound.
   */
  setEnabled(enabled: boolean): void {
    if (this._isEnabled === enabled) return;

    this._isEnabled = enabled;
    Howler.volume(enabled ? this._volume : 0);
    this.savePreferences();
    this.notifyListeners();

    // If enabling for the first time, initialize
    if (enabled && !this._isInitialized) {
      this.init();
    }
  }

  /**
   * Toggle sound on/off.
   */
  toggleEnabled(): void {
    this.setEnabled(!this._isEnabled);
  }

  /**
   * Set the master volume (0.0 to 1.0).
   */
  setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    if (this._volume === clamped) return;

    this._volume = clamped;
    if (this._isEnabled) {
      Howler.volume(clamped);
    }
    this.savePreferences();
    this.notifyListeners();
  }

  /**
   * Play a sound effect.
   * No-op if sound is disabled or not initialized.
   *
   * @param effect - The effect to play
   * @param options - Optional playback options
   */
  playEffect(effect: SoundEffect, _options?: { pan?: number }): void {
    if (!this._isEnabled || !this._isInitialized) return;

    // TODO: Implement in Phase 3 when effect sprites are added
    // For now, log for debugging
    console.debug(`[Audio] Would play effect: ${effect}`);
  }

  /**
   * Start playing the ambient loop.
   * No-op if sound is disabled or not initialized.
   */
  playAmbient(): void {
    if (!this._isEnabled || !this._isInitialized) return;

    // TODO: Implement in Phase 2 when ambient loop is added
    console.debug("[Audio] Would play ambient loop");
  }

  /**
   * Stop the ambient loop.
   */
  stopAmbient(): void {
    if (this.ambientLoop) {
      this.ambientLoop.stop();
    }
  }

  // ============ Subscription ============

  /**
   * Subscribe to audio state changes.
   * Returns an unsubscribe function.
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  // ============ Cleanup ============

  /**
   * Dispose of all audio resources.
   */
  dispose(): void {
    this.stopAmbient();

    if (this.ambientLoop) {
      this.ambientLoop.unload();
      this.ambientLoop = null;
    }

    if (this.effectSprites) {
      this.effectSprites.unload();
      this.effectSprites = null;
    }

    this._isInitialized = false;
    this.listeners.clear();
  }
}

/**
 * Singleton AudioManager instance.
 * Use this for all audio operations.
 */
export const audioManager = AudioManager.getInstance();
