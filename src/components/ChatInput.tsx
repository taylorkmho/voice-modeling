import { useRef } from "react";
import { BiSolidMicrophone } from "react-icons/bi";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { FiCheck, FiTrash2 } from "react-icons/fi";
import {
  AutosizeTextarea,
  type AutosizeTextAreaRef,
} from "./ui/autosize-textarea";
import { useAudioRecorder, useAudioVisualization } from "@/hooks";

interface ChatInputProps {
  className?: string;
}

export function ChatInput({ className = "" }: ChatInputProps) {
  const textareaRef = useRef<AutosizeTextAreaRef | null>(null);

  const {
    isListening,
    volume,
    volumeHistory,
    error,
    startListening,
    stopListening,
  } = useAudioRecorder({ samplingRate: 20 });

  const { backgroundColor, boxShadow } = useAudioVisualization({ volume });

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
          className={cn("resize-none p-0 text-lg", isListening && "hidden")}
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
                stopListening();
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
                stopListening();
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
