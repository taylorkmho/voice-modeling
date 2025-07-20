import { useEffect, useRef, useState } from "react";
import {
  normalizeAudioData,
  createAudioContext,
  DEFAULT_AUDIO_CONSTRAINTS,
} from "@/lib/audio-utils";

interface UseAudioRecorderOptions {
  samplingRate?: number; // FPS for volume updates (default: 20)
}

interface UseAudioRecorderReturn {
  isListening: boolean;
  volume: number;
  volumeHistory: number[];
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
}

export function useAudioRecorder({
  samplingRate = 20,
}: UseAudioRecorderOptions = {}): UseAudioRecorderReturn {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [volumeHistory, setVolumeHistory] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const startListening = async () => {
    try {
      setError(null);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: DEFAULT_AUDIO_CONSTRAINTS,
      });

      // Create audio context
      audioContextRef.current = createAudioContext();
      const audioContext = audioContextRef.current;

      // Create analyser node
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      // Create microphone source
      microphoneRef.current = audioContext.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);

      setIsListening(true);
      updateVolume();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to access microphone"
      );
    }
  };

  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    microphoneRef.current = null;
    setIsListening(false);
    setVolume(0);
  };

  const updateVolume = () => {
    if (!analyserRef.current) return;

    const now = performance.now();
    const frameInterval = 1000 / samplingRate; // Convert FPS to milliseconds

    // Only update if enough time has passed since last update
    if (now - lastUpdateRef.current < frameInterval) {
      animationFrameRef.current = requestAnimationFrame(updateVolume);
      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate normalized volume
    const normalizedVolume = normalizeAudioData(dataArray);

    setVolume(normalizedVolume);

    // Update volume history (keep last 40 values)
    setVolumeHistory(prev => {
      const newHistory = [...prev, normalizedVolume];
      return newHistory.slice(-40);
    });

    lastUpdateRef.current = now;
    animationFrameRef.current = requestAnimationFrame(updateVolume);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isListening,
    volume,
    volumeHistory,
    error,
    startListening,
    stopListening,
  };
}
