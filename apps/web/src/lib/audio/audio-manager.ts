/**
 * AudioManager - Singleton for managing all garden audio
 *
 * Handles ambient loops, sound effects, and user preferences.
 * Sound is optional and starts muted by default.
 *
 * @see docs/sound-effects-plan.md for full architecture
 */

import { Howl, Howler } from "howler";

/** localStorage keys for audio preferences */
const AUDIO_PREF_KEYS = {
  ENABLED: "quantum-garden-sound-enabled",
  VOLUME: "quantum-garden-sound-volume",
} as const;

/** Default audio settings */
const DEFAULTS = {
  ENABLED: false,
  VOLUME: 0.7, // 70% volume
} as const;

/** Static ambient MP3 settings */
const AMBIENT = {
  /** Path to ambient audio file */
  PATH: "/sounds/ambient-loop.mp3",
  /** Volume multiplier for ambient (relative to master) */
  VOLUME_MULTIPLIER: 0.25, // 25% of master volume - very subtle
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

  private ambientLoop: Howl | null = null;

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

    // Auto-start ambient if sound is enabled
    if (this._isEnabled) {
      this.playAmbient();
    }
  }

  /**
   * Load the ambient MP3.
   */
  private loadAmbientSound(): void {
    if (this.ambientLoop) return; // Already loaded

    this.ambientLoop = new Howl({
      src: [AMBIENT.PATH],
      volume: this._volume * AMBIENT.VOLUME_MULTIPLIER,
      html5: true,
      preload: true,
      onloaderror: (_id, error) => {
        console.warn("[Audio] Failed to load ambient sound:", error);
        this.ambientLoop = null;
      },
    });
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
    } else if (enabled && this._isInitialized) {
      this.playAmbient();
    } else if (!enabled) {
      this.stopAmbient();
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
      this.updateAmbientVolume();
    }
    this.savePreferences();
    this.notifyListeners();
  }

  /**
   * Play the ambient MP3.
   * No-op if sound is disabled or not initialized.
   */
  playAmbient(): void {
    if (!this._isEnabled || !this._isInitialized) return;

    // Load if not already loaded
    if (!this.ambientLoop) {
      this.loadAmbientSound();
    }

    if (!this.ambientLoop) return;

    // If already playing, just update volume
    if (this.ambientLoop.playing()) {
      this.ambientLoop.volume(this._volume * AMBIENT.VOLUME_MULTIPLIER);
      return;
    }

    this.ambientLoop.volume(this._volume * AMBIENT.VOLUME_MULTIPLIER);
    this.ambientLoop.play();
  }

  /**
   * Stop the ambient MP3.
   */
  stopAmbient(): void {
    if (!this.ambientLoop || !this.ambientLoop.playing()) return;
    this.ambientLoop.stop();
  }

  /**
   * Update ambient volume when master volume changes.
   */
  private updateAmbientVolume(): void {
    if (!this.ambientLoop || !this.ambientLoop.playing()) return;
    this.ambientLoop.volume(this._volume * AMBIENT.VOLUME_MULTIPLIER);
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

    this._isInitialized = false;
    this.listeners.clear();
  }
}

/**
 * Singleton AudioManager instance.
 * Use this for all audio operations.
 */
export const audioManager = AudioManager.getInstance();
