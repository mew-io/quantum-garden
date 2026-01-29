/**
 * Audio system exports.
 *
 * @example
 * ```tsx
 * import { useAudio, audioManager } from '@/lib/audio';
 *
 * // In a component
 * const { isEnabled, toggleEnabled } = useAudio();
 *
 * // Direct access (non-React contexts)
 * audioManager.playEffect('germination');
 * ```
 */

export { audioManager, type SoundEffect } from "./audio-manager";
export { useAudio } from "./hooks/use-audio";
