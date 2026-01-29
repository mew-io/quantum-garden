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
 * Get a snapshot of the current audio state.
 */
function getSnapshot(): AudioState {
  return {
    isEnabled: audioManager.isEnabled,
    volume: audioManager.volume,
    isInitialized: audioManager.isInitialized,
  };
}

/**
 * Server-side snapshot (sound disabled by default).
 */
function getServerSnapshot(): AudioState {
  return {
    isEnabled: false,
    volume: 0.7,
    isInitialized: false,
  };
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
