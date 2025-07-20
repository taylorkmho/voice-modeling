/**
 * Normalizes audio frequency data to a 0-1 range
 */
export function normalizeAudioData(dataArray: Uint8Array): number {
  const average =
    dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
  return Math.min(average / 128, 1);
}

/**
 * Creates audio context with cross-browser compatibility
 */
export function createAudioContext(): AudioContext {
  return new (window.AudioContext ||
    (window as typeof window & { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext)();
}

/**
 * Default audio constraints for microphone access
 */
export const DEFAULT_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
};
