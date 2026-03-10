/**
 * AudioManager - Singleton for managing all garden audio
 *
 * Handles ambient loops, sound effects, and user preferences.
 * Sound is optional and starts muted by default.
 *
 * @see docs/sound-effects-plan.md for full architecture
 */

import { Howl, Howler } from "howler";
import { webAudioGenerator } from "./web-audio-generator";

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
  ENABLED: true,
  VOLUME: 0.7, // 70% volume
} as const;

/** Ambient audio settings */
const AMBIENT = {
  /** Path to ambient loop audio file */
  PATH: "/sounds/ambient-loop.mp3",
  /** Volume multiplier for ambient (relative to master) */
  VOLUME_MULTIPLIER: 0.25, // 25% of master volume - very subtle
  /** Fade duration in milliseconds */
  FADE_DURATION: 2000, // 2 second fade
  /** Whether the loop is ready (file exists) */
  READY: true,
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

    // Initialize Web Audio generator for procedural sounds
    webAudioGenerator.init();
    webAudioGenerator.setEnabled(this._isEnabled);
    webAudioGenerator.setVolume(this._volume);

    // Load ambient loop if available
    if (AMBIENT.READY) {
      this.loadAmbientLoop();
    }

    this._isInitialized = true;
    this.notifyListeners();

    // Auto-start ambient if sound is enabled
    if (this._isEnabled && AMBIENT.READY) {
      this.playAmbient();
    }
  }

  /**
   * Load the ambient loop audio.
   */
  private loadAmbientLoop(): void {
    if (this.ambientLoop) return; // Already loaded

    this.ambientLoop = new Howl({
      src: [AMBIENT.PATH],
      loop: true,
      volume: 0, // Start silent, will fade in
      html5: true, // Use HTML5 Audio for better streaming of long files
      preload: true,
      onloaderror: (_id, error) => {
        console.warn("[Audio] Failed to load ambient loop:", error);
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
    webAudioGenerator.setEnabled(enabled);
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
      webAudioGenerator.setVolume(clamped);
      this.updateAmbientVolume();
    }
    this.savePreferences();
    this.notifyListeners();
  }

  /**
   * Play a sound effect.
   * No-op if sound is disabled or not initialized.
   *
   * @param effect - The effect to play
   * @param options - Optional playback options (pan: -1 to 1, hue: 0-360 for observation)
   */
  playEffect(effect: SoundEffect, options?: { pan?: number; hue?: number }): void {
    if (!this._isEnabled || !this._isInitialized) return;

    const pan = options?.pan ?? 0;

    switch (effect) {
      case "germination":
      case "waveChime":
        webAudioGenerator.playGerminationChime(pan);
        break;

      case "observation":
      case "firstObservation":
        // Map plant palette hue to sound (default to green hue if not provided)
        webAudioGenerator.playObservationTone(options?.hue ?? 120, pan);
        break;

      case "entanglement":
        webAudioGenerator.playEntanglementHarmony(pan);
        break;

      case "panelOpen":
      case "panelClose":
        // UI sounds - use a subtle observation tone
        webAudioGenerator.playObservationTone(200, 0);
        break;
    }
  }

  /**
   * Start playing the ambient loop with fade in.
   * No-op if sound is disabled or not initialized.
   */
  playAmbient(): void {
    if (!this._isEnabled || !this._isInitialized) return;
    if (!AMBIENT.READY) {
      console.debug("[Audio] Ambient loop not available (AMBIENT.READY = false)");
      return;
    }

    // Load if not already loaded
    if (!this.ambientLoop) {
      this.loadAmbientLoop();
    }

    if (!this.ambientLoop) return;

    // Calculate target volume (ambient is quieter than effects)
    const targetVolume = this._volume * AMBIENT.VOLUME_MULTIPLIER;

    // If already playing, just adjust volume
    if (this.ambientLoop.playing()) {
      this.ambientLoop.fade(this.ambientLoop.volume(), targetVolume, AMBIENT.FADE_DURATION);
      return;
    }

    // Start playing with fade in
    this.ambientLoop.volume(0);
    this.ambientLoop.play();
    this.ambientLoop.fade(0, targetVolume, AMBIENT.FADE_DURATION);
  }

  /**
   * Stop the ambient loop with fade out.
   */
  stopAmbient(): void {
    if (!this.ambientLoop || !this.ambientLoop.playing()) return;

    const currentVolume = this.ambientLoop.volume();
    this.ambientLoop.fade(currentVolume, 0, AMBIENT.FADE_DURATION);

    // Stop after fade completes
    setTimeout(() => {
      if (this.ambientLoop) {
        this.ambientLoop.stop();
      }
    }, AMBIENT.FADE_DURATION);
  }

  /**
   * Update ambient volume when master volume changes.
   */
  private updateAmbientVolume(): void {
    if (!this.ambientLoop || !this.ambientLoop.playing()) return;

    const targetVolume = this._volume * AMBIENT.VOLUME_MULTIPLIER;
    this.ambientLoop.fade(this.ambientLoop.volume(), targetVolume, 300); // Quick fade
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
    webAudioGenerator.dispose();

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
