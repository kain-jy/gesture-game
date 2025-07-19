"use client";

import { useIVSStage } from "@/hooks/useIVSStage";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingMessage from "@/components/ui/LoadingMessage";

interface IVSStagePlayerProps {
  participantToken: string;
  onError?: (error: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConnectionStateChange?: (state: any) => void;
}

export default function IVSStagePlayer({
  participantToken,
  onError,
  onConnectionStateChange,
}: IVSStagePlayerProps) {
  const { videoContainerRef, isConnected, error, isLoading } = useIVSStage({
    participantToken,
    onError,
    onConnectionStateChange,
  });

  console.log("IVSStagePlayer render:", {
    isConnected,
    error,
    isLoading,
    hasToken: !!participantToken,
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      {error && <ErrorMessage message={error} className="mb-4" />}
      {isLoading && !error && (
        <LoadingMessage message="Connecting to stage..." />
      )}
      <div ref={videoContainerRef} className="relative">
        {!isConnected && !isLoading && !error && (
          <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-white">Waiting for stream...</div>
          </div>
        )}
        {isConnected && (
          <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-white">
              Connected to stage - waiting for video stream...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
