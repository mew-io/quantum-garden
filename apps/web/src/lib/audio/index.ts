/**
 * Audio system exports.
 *
 * @example
 * ```tsx
 * import { useAudio, audioManager } from '@/lib/audio';
 *
 * // In a component
 * const { isEnabled, toggleEnabled } = useAudio();
 * ```
 */

export { audioManager } from "./audio-manager";
export { useAudio } from "./hooks/use-audio";
