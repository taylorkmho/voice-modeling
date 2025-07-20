import { useEffect, useRef, useState } from "react";

interface AudioVisualizerProps {
  className?: string;
}

export function AudioVisualizer({ className = "" }: AudioVisualizerProps) {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startListening = async () => {
    try {
      setError(null);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      // Create audio context
      audioContextRef.current = new (window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
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

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average =
      dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedVolume = Math.min(average / 128, 1); // Normalize to 0-1

    setVolume(normalizedVolume);

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

  // Calculate scale based on volume (1x to 3x)
  const scale = 1 + volume * 2;

  // Calculate color intensity based on volume
  const colorIntensity = Math.floor(volume * 255);
  const backgroundColor = `rgb(${colorIntensity}, ${100 + colorIntensity}, ${255})`;

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <div className="text-center">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isListening
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {isListening ? "Stop Listening" : "Start Listening"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all duration-100 ease-out"
          style={{
            transform: `scale(${scale})`,
            backgroundColor,
            boxShadow: `0 0 ${20 + volume * 30}px ${backgroundColor}`,
          }}
        />

        {isListening && (
          <div className="text-center">
            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
