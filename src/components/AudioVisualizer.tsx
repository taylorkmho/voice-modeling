import { useEffect, useRef, useState } from "react";
import { BiSolidMicrophone } from "react-icons/bi";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

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

  const colorIntensity = Math.floor(volume * 255);
  const backgroundColor = `rgb(${colorIntensity}, ${100 + colorIntensity}, ${255})`;
  const boxShadow = `0 0 ${20 + volume * 30}px ${backgroundColor}`;

  return (
    <div
      className={`flex flex-col items-center gap-6 border-2 border-indigo-500 ${className}`}
    >
      {error && (
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}
      {Math.round(volume * 100)}

      <div className="flex flex-col items-center gap-4">
        <motion.button
          whileHover={isListening ? {} : { scale: 1.1 }}
          whileTap={{ scale: 0.8 }}
          animate={{
            backgroundColor,
            boxShadow,
            scale: isListening ? volume * 3 : 1,
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full font-bold text-white"
          onClick={isListening ? stopListening : startListening}
        >
          <BiSolidMicrophone
            className={cn(
              "text-2xl opacity-100 transition-all duration-100 ease-out",
              isListening && "translate-y-full opacity-0"
            )}
          />
        </motion.button>
      </div>
    </div>
  );
}
