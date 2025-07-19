"use client";

import { useIVSPlayer } from "@/hooks/useIVSPlayer";

interface IVSPlayerProps {
  streamUrl: string;
  onError?: (error: unknown) => void;
  onPlaying?: () => void;
}

export default function IVSPlayer({
  streamUrl,
  onError,
  onPlaying,
}: IVSPlayerProps) {
  const { playerRef } = useIVSPlayer({
    streamUrl,
    onError,
    onPlaying,
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      <video
        ref={playerRef}
        className="w-full h-auto bg-black rounded-lg shadow-lg"
        playsInline
        controls
      />
    </div>
  );
}
