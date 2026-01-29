/**
 * React hook for accessing audio functionality.
 *
 * Provides reactive state and methods for controlling garden audio.
 * Components can subscribe to audio state changes and trigger sounds.
 */

"use client";

import { useCallback, useSyncExternalStore } from "react";
import { audioManager, type SoundEffect } from "../audio-manager";

/**
 * Audio state exposed by the hook.
 */
interface AudioState {
  /** Whether sound is currently enabled */
  isEnabled: boolean;
  /** Current volume level (0.0 to 1.0) */
  volume: number;
  /** Whether the audio system has been initialized */
  isInitialized: boolean;
}

/**
 * Hook return type with state and methods.
 */
interface UseAudioReturn extends AudioState {
  /** Enable or disable sound */
  setEnabled: (enabled: boolean) => void;
  /** Toggle sound on/off */
  toggleEnabled: () => void;
  /** Set the master volume (0.0 to 1.0) */
  setVolume: (volume: number) => void;
  /** Play a sound effect */
  playEffect: (effect: SoundEffect, options?: { pan?: number }) => void;
  /** Initialize the audio system (must be called from user gesture) */
  init: () => Promise<void>;
  /** Start playing ambient loop */
  playAmbient: () => void;
  /** Stop playing ambient loop */
  stopAmbient: () => void;
}

/**
 * Cached client snapshot - only updated when values actually change.
 * This prevents infinite loops in useSyncExternalStore.
 */
let cachedSnapshot: AudioState = {
  isEnabled: false,
  volume: 0.7,
  isInitialized: false,
};

/**
 * Get a snapshot of the current audio state.
 * Returns cached snapshot if values haven't changed to maintain referential equality.
 */
function getSnapshot(): AudioState {
  const isEnabled = audioManager.isEnabled;
  const volume = audioManager.volume;
  const isInitialized = audioManager.isInitialized;

  // Only create a new object if values have changed
  if (
    cachedSnapshot.isEnabled !== isEnabled ||
    cachedSnapshot.volume !== volume ||
    cachedSnapshot.isInitialized !== isInitialized
  ) {
    cachedSnapshot = { isEnabled, volume, isInitialized };
  }

  return cachedSnapshot;
}

/**
 * Cached server-side snapshot to avoid infinite loops during hydration.
 * Must be a stable reference - useSyncExternalStore requires getServerSnapshot
 * to return the same object on every call.
 */
const SERVER_SNAPSHOT: AudioState = {
  isEnabled: false,
  volume: 0.7,
  isInitialized: false,
};

/**
 * Server-side snapshot (sound disabled by default).
 */
function getServerSnapshot(): AudioState {
  return SERVER_SNAPSHOT;
}

/**
 * Subscribe to audio state changes.
 */
function subscribe(callback: () => void): () => void {
  return audioManager.subscribe(callback);
}

/**
 * React hook for accessing audio functionality.
 *
 * @example
 * ```tsx
 * function SoundToggle() {
 *   const { isEnabled, toggleEnabled, init } = useAudio();
 *
 *   const handleClick = () => {
 *     init(); // Initialize on user gesture
 *     toggleEnabled();
 *   };
 *
 *   return (
 *     <button onClick={handleClick}>
 *       {isEnabled ? 'Mute' : 'Unmute'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useAudio(): UseAudioReturn {
  // Use useSyncExternalStore for reactive state
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Memoized methods
  const setEnabled = useCallback((enabled: boolean) => {
    audioManager.setEnabled(enabled);
  }, []);

  const toggleEnabled = useCallback(() => {
    audioManager.toggleEnabled();
  }, []);

  const setVolume = useCallback((volume: number) => {
    audioManager.setVolume(volume);
  }, []);

  const playEffect = useCallback((effect: SoundEffect, options?: { pan?: number }) => {
    audioManager.playEffect(effect, options);
  }, []);

  const init = useCallback(async () => {
    await audioManager.init();
  }, []);

  const playAmbient = useCallback(() => {
    audioManager.playAmbient();
  }, []);

  const stopAmbient = useCallback(() => {
    audioManager.stopAmbient();
  }, []);

  return {
    ...state,
    setEnabled,
    toggleEnabled,
    setVolume,
    playEffect,
    init,
    playAmbient,
    stopAmbient,
  };
}
