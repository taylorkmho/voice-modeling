import { useEffect, useRef, useState } from "react";
import { BiSolidMicrophone } from "react-icons/bi";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { FiCheck, FiTrash2 } from "react-icons/fi";
import {
  AutosizeTextarea,
  type AutosizeTextAreaRef,
} from "./ui/autosize-textarea";

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
  const textareaRef = useRef<AutosizeTextAreaRef | null>(null);

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

      <button
        onClick={() => textareaRef.current?.textArea.focus()}
        className={cn(
          "bg-muted relative flex min-w-80 flex-col items-center justify-end rounded-3xl p-4",
          isListening && "bg-blue-400/20"
        )}
      >
        <AutosizeTextarea
          minHeight={1}
          maxHeight={200}
          className="resize-none p-0 text-lg"
          ref={textareaRef}
        />
        <div className="relative flex w-full items-center justify-between">
          <div className="flex gap-2">
            <motion.button
              key="delete"
              initial={{ opacity: 0, x: -10 }}
              animate={
                isListening ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }
              }
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onClick={e => {
                e.stopPropagation();
                setIsListening(false);
              }}
              className="rounded-xl bg-blue-300/10 p-2 text-blue-200 hover:bg-red-500/50 hover:text-red-200 active:bg-red-500/30"
            >
              <FiTrash2 className="size-5" />
            </motion.button>
            <motion.button
              key="save"
              initial={{ opacity: 0, x: -10 }}
              animate={
                isListening ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }
              }
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, delay: isListening ? 0.1 : 0 }}
              onClick={e => {
                e.stopPropagation();
                setIsListening(false);
              }}
              className="rounded-xl bg-blue-300/10 p-2 text-blue-200 hover:bg-green-500/50 hover:text-green-200 active:bg-green-500/30"
            >
              <FiCheck className="size-5" />
            </motion.button>
          </div>
          {/* Volume Meter */}
          <div className="flex items-end gap-2">
            {isListening &&
              volumeHistory.slice(-12).map((vol, index) => (
                <motion.div
                  key={`volume-${index}`}
                  className="w-1 rounded-full bg-blue-400"
                  animate={{
                    height: `${Math.max(10, vol * 20)}px`,
                    opacity:
                      vol < 0.4 ? 0.1 : vol > 0.6 ? 0.5 : (vol - 0.4) * 4.5,
                  }}
                  transition={{
                    duration: 0.1,
                    ease: "easeOut",
                  }}
                />
              ))}
          </div>
          {/* Microphone button */}
          <motion.button
            whileHover={isListening ? {} : { scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            animate={{
              backgroundColor,
              boxShadow,
              scale: isListening ? volume * 2 : 1,
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-white"
            onClick={e => {
              e.stopPropagation();
              if (isListening) {
                stopListening();
              } else {
                startListening();
              }
            }}
          >
            <BiSolidMicrophone
              className={cn(
                "text-2xl opacity-100 transition-all duration-100 ease-out",
                isListening && "translate-y-full opacity-0"
              )}
            />
          </motion.button>
        </div>
      </button>
    </div>
  );
}
