"use client";

import { useIVSStage } from "@/hooks/useIVSStage";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingMessage from "@/components/ui/LoadingMessage";
import DanmakuOverlay from "@/components/DanmakuOverlay";
import { useAtom } from "jotai";
import { messagesAtom } from "@/atoms/chatAtoms";

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
  const [messages] = useAtom(messagesAtom);
  const { videoContainerRef, isConnected, error, isLoading, connect } =
    useIVSStage({
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

  const handleStartWatching = () => {
    connect();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {error && <ErrorMessage message={error} className="mb-4" />}

      {isLoading && !error && <LoadingMessage message="接続中..." />}

      <div className="relative">
        <div ref={videoContainerRef}>
          {!isConnected && !isLoading && !error && (
            <div className="w-full flex flex-col aspect-video bg-gray-900 rounded-lg gap-4 items-center justify-center relative">
              <div className="text-white">
                視聴開始ボタンを押してストリーミングを開始してください
              </div>
              {!isConnected && !isLoading && !error && (
                <div className="mb-4 text-center">
                  <button
                    onClick={handleStartWatching}
                    disabled={!participantToken}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    視聴を開始
                  </button>
                </div>
              )}
            </div>
          )}
          {isConnected && (
            <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative">
              <div className="text-white">
                接続しました - 配信開始までお待ちください...
              </div>
            </div>
          )}
        </div>
        <DanmakuOverlay messages={messages} />
      </div>
    </div>
  );
}
