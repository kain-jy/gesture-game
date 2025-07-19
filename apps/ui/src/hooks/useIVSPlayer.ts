import { useEffect, useRef } from "react";
import {
  create,
  isPlayerSupported,
  PlayerState,
  PlayerEventType,
} from "amazon-ivs-player";

interface UseIVSPlayerParams {
  streamUrl: string;
  onError?: (error: unknown) => void;
  onPlaying?: () => void;
}

export const useIVSPlayer = ({ 
  streamUrl, 
  onError, 
  onPlaying 
}: UseIVSPlayerParams) => {
  const playerRef = useRef<HTMLVideoElement>(null);
  const ivsPlayerRef = useRef<ReturnType<typeof create> | null>(null);

  useEffect(() => {
    if (!streamUrl || !playerRef.current) return;

    if (!isPlayerSupported) {
      console.error("IVS Player is not supported in this browser");
      onError?.("IVS Player is not supported in this browser");
      return;
    }

    const setupPlayer = async () => {
      try {
        if (ivsPlayerRef.current) {
          ivsPlayerRef.current.delete();
        }

        const player = create({
          wasmWorker: "/amazon-ivs-wasmworker.min.js",
          wasmBinary: "/amazon-ivs-wasmworker.min.wasm",
        });

        player.attachHTMLVideoElement(playerRef.current!);

        player.addEventListener(PlayerEventType.ERROR, (error) => {
          console.error("Player error:", error);
          onError?.(error);
        });

        player.addEventListener(PlayerState.PLAYING, () => {
          console.log("Player is playing");
          onPlaying?.();
        });

        player.load(streamUrl);
        player.play();

        ivsPlayerRef.current = player;
      } catch (error) {
        console.error("Failed to setup IVS player:", error);
        onError?.(error);
      }
    };

    setupPlayer();

    return () => {
      if (ivsPlayerRef.current) {
        ivsPlayerRef.current.delete();
      }
    };
  }, [streamUrl, onError, onPlaying]);

  return { playerRef };
};