import { useState } from "react";
import { motion } from "motion/react";
import { FiPlus, FiX } from "react-icons/fi";

// Predefined context options
const PREDEFINED_CONTEXTS = [
  "Meeting",
  "Interview",
  "Presentation",
  "Conversation",
  "Lecture",
  "Podcast",
  "Voice Note",
  "Dictation",
  "Call",
  "Recording",
];

interface ChatInputContextProps {
  context: { type: string }[];
  onAddContext: (contextType: string) => void;
  onRemoveContext: (index: number) => void;
}

export function ChatInputContext({
  context,
  onAddContext,
  onRemoveContext,
}: ChatInputContextProps) {
  const [showContextSelector, setShowContextSelector] = useState(false);
  const [customContext, setCustomContext] = useState("");

  const handleAddContext = (contextType: string) => {
    if (!context.some(item => item.type === contextType)) {
      onAddContext(contextType);
    }
    setShowContextSelector(false);
    setCustomContext("");
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {/* <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">Context</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={e => {
            e.stopPropagation();
            setShowContextSelector(!showContextSelector);
          }}
          className="flex items-center gap-1 rounded-lg bg-blue-500/20 px-2 py-1 text-xs text-blue-200 hover:bg-blue-500/30"
        >
          <FiPlus className="size-3" />
          Add Context
        </motion.button>
      </div> */}

      {/* Context Selector Dropdown */}
      {/* {showContextSelector && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-lg border border-gray-600 bg-gray-800 p-3"
        >
          <div className="mb-3">
            <label className="mb-1 block text-xs text-gray-300">
              Predefined:
            </label>
            <div className="flex flex-wrap gap-1">
              {PREDEFINED_CONTEXTS.map(ctx => (
                <button
                  key={ctx}
                  onClick={e => {
                    e.stopPropagation();
                    handleAddContext(ctx);
                  }}
                  className="rounded-md bg-blue-500/20 px-2 py-1 text-xs text-blue-200 hover:bg-blue-500/30"
                >
                  {ctx}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-300">Custom:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customContext}
                onChange={e => setCustomContext(e.target.value)}
                placeholder="Enter custom context..."
                className="flex-1 rounded-md bg-gray-700 px-2 py-1 text-xs text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                onKeyDown={e => {
                  if (e.key === "Enter" && customContext.trim()) {
                    handleAddContext(customContext.trim());
                  }
                }}
              />
              <button
                onClick={e => {
                  e.stopPropagation();
                  if (customContext.trim()) {
                    handleAddContext(customContext.trim());
                  }
                }}
                className="rounded-md bg-green-500/20 px-2 py-1 text-xs text-green-200 hover:bg-green-500/30"
              >
                Add
              </button>
            </div>
          </div>
        </motion.div>
      )} */}

      {/* Selected Context Tags */}
      <div className="flex flex-wrap gap-2">
        {context.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 rounded-md border border-gray-600 bg-gray-700/50 px-2 py-1 text-xs text-white"
          >
            <span>{item.type}</span>
            <button
              onClick={e => {
                e.stopPropagation();
                onRemoveContext(index);
              }}
              className="ml-1 rounded-full p-0.5 text-gray-400 hover:bg-red-500/20 hover:text-red-200"
            >
              <FiX className="size-3" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
