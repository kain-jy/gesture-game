import { useEffect, useRef } from "react";

interface UseIVSPlayerParams {
  streamUrl: string;
  onError?: (error: unknown) => void;
  onPlaying?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useIVSPlayer = ({ 
  streamUrl, 
  onError, 
  onPlaying 
}: UseIVSPlayerParams) => {
  const playerRef = useRef<HTMLVideoElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ivsPlayerRef = useRef<any | null>(null);

  useEffect(() => {
    if (!streamUrl || !playerRef.current || typeof window === 'undefined') return;

    const setupPlayer = async () => {
      try {
        // 動的インポートでamazon-ivs-playerを読み込み
        const { create, isPlayerSupported, PlayerState, PlayerEventType } = await import("amazon-ivs-player");

        if (!isPlayerSupported) {
          console.error("IVS Player is not supported in this browser");
          onError?.("IVS Player is not supported in this browser");
          return;
        }

        if (ivsPlayerRef.current) {
          ivsPlayerRef.current.delete();
        }

        const player = create({
          wasmWorker: "/amazon-ivs-wasmworker.min.js",
          wasmBinary: "/amazon-ivs-wasmworker.min.wasm",
        });

        player.attachHTMLVideoElement(playerRef.current!);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        player.addEventListener(PlayerEventType.ERROR, (error: any) => {
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