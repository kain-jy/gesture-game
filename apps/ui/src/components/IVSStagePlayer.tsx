"use client";

import { StageConnectionState } from "amazon-ivs-web-broadcast";
import { useIVSStage } from "@/hooks/useIVSStage";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingMessage from "@/components/ui/LoadingMessage";

interface IVSStagePlayerProps {
  participantToken: string;
  onError?: (error: string) => void;
  onConnectionStateChange?: (state: StageConnectionState) => void;
}

export default function IVSStagePlayer({
  participantToken,
  onError,
  onConnectionStateChange,
}: IVSStagePlayerProps) {
  const { videoContainerRef, isConnected, error } = useIVSStage({
    participantToken,
    onError,
    onConnectionStateChange,
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      {error && <ErrorMessage message={error} className="mb-4" />}
      {!isConnected && !error && (
        <LoadingMessage message="Connecting to stage..." />
      )}
      <div ref={videoContainerRef} className="relative">
        {!isConnected && (
          <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-white">Waiting for stream...</div>
          </div>
        )}
      </div>
    </div>
  );
}
