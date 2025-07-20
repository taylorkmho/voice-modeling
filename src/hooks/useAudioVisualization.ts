import { useMemo } from "react";

interface UseAudioVisualizationOptions {
  volume: number;
}

interface UseAudioVisualizationReturn {
  colorIntensity: number;
  backgroundColor: string;
  boxShadow: string;
}

export function useAudioVisualization({
  volume,
}: UseAudioVisualizationOptions): UseAudioVisualizationReturn {
  const visualEffects = useMemo(() => {
    const colorIntensity = Math.floor(volume * 255);
    const backgroundColor = `rgb(${colorIntensity}, ${100 + colorIntensity}, ${255})`;
    const boxShadow = `0 0 ${20 + volume * 30}px ${backgroundColor}`;

    return {
      colorIntensity,
      backgroundColor,
      boxShadow,
    };
  }, [volume]);

  return visualEffects;
}
