import { useEffect, useRef, useState } from "react";
import { BiSolidMicrophone } from "react-icons/bi";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  className?: string;
  samplingRate?: number; // FPS for volume updates (default: 30)
}

export function AudioVisualizer({
  className = "",
  samplingRate = 20,
}: AudioVisualizerProps) {
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

    const now = performance.now();
    const frameInterval = 1000 / samplingRate; // Convert FPS to milliseconds

    // Only update if enough time has passed since last update
    if (now - lastUpdateRef.current < frameInterval) {
      animationFrameRef.current = requestAnimationFrame(updateVolume);
      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average =
      dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedVolume = Math.min(average / 128, 1); // Normalize to 0-1

    setVolume(normalizedVolume);

    // Update volume history (keep last 20 values)
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

  const colorIntensity = Math.floor(volume * 255);
  const backgroundColor = `rgb(${colorIntensity}, ${100 + colorIntensity}, ${255})`;
  const boxShadow = `0 0 ${20 + volume * 30}px ${backgroundColor}`;

  return (
    <div className={`p-4 ${className}`}>
      {error && (
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="bg-muted flex min-w-80 items-center justify-end rounded-3xl p-4">
        <div className="relative">
          {/* Volume Meter */}
          {isListening && (
            <div className="absolute top-1/2 left-0 flex -translate-x-full -translate-y-1/2 items-center gap-1">
              {volumeHistory.slice(-40).map((vol, index) => (
                <motion.div
                  key={`volume-${index}`}
                  className="w-1 rounded-full bg-white"
                  animate={{
                    // 100% volume is 60px, 0% volume is 10px
                    height: `${Math.max(10, vol * 60)}px`,
                    opacity: vol * 0.5,
                  }}
                  transition={{
                    duration: 0.1,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          )}
          <motion.button
            whileHover={isListening ? {} : { scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            animate={{
              backgroundColor,
              boxShadow,
              scale: isListening ? volume * 3 : 1,
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-white"
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
    </div>
  );
}
