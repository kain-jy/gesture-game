"use client";

import { useIVSStage } from "@/hooks/useIVSStage";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingMessage from "@/components/ui/LoadingMessage";
import DanmakuOverlay from "@/components/DanmakuOverlay";
import CaptionOverlay from "@/components/CaptionOverlay";
import ThemeChangeOverlay from "@/components/ThemeChangeOverlay";
import { useAtom } from "jotai";
import { messagesAtom } from "@/atoms/chatAtoms";
import Logo from "./Logo";

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
              {!isConnected && !isLoading && !error && (
                <div className="mb-4 text-center">
                  <Logo />
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
            <div className="w-full aspect-video bg-gradient-to-br from-[var(--color-m1-midnight)] via-[var(--color-m1-deep-purple-dark)] to-[var(--color-m1-charcoal)] rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* 背景アニメーション */}
              <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[var(--color-m1-gold)]/10 to-[var(--color-m1-champagne)]/10 rounded-full animate-pulse"></div>
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[var(--color-m1-crimson)]/5 rounded-full animate-ping"></div>
                <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[var(--color-m1-royal-blue)]/5 rounded-full animate-ping animation-delay-1000"></div>
                <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-[var(--color-m1-gold)]/10 rounded-full animate-bounce animation-delay-500"></div>
              </div>
              
              {/* メインメッセージ */}
              <div className="relative z-10 text-center px-8">
                {/* アニメーション付きタイトル */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-4 mb-4">
                    <div className="w-3 h-3 bg-[var(--color-m1-gold)] rounded-full animate-pulse"></div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-m1-gold)] via-[var(--color-m1-champagne)] to-[var(--color-m1-gold-light)] bg-clip-text text-transparent tracking-wide">
                      接続完了
                    </h3>
                    <div className="w-3 h-3 bg-[var(--color-m1-crimson)] rounded-full animate-pulse animation-delay-300"></div>
                  </div>
                  
                  {/* 装飾ライン */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-[var(--color-m1-gold)] animate-pulse"></div>
                    <div className="w-2 h-2 bg-[var(--color-m1-gold)] rounded-full animate-ping"></div>
                    <div className="w-2 h-2 bg-[var(--color-m1-champagne)] rounded-full animate-ping animation-delay-200"></div>
                    <div className="w-2 h-2 bg-[var(--color-m1-crimson)] rounded-full animate-ping animation-delay-400"></div>
                    <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-[var(--color-m1-gold)] animate-pulse"></div>
                  </div>
                </div>

                {/* メインメッセージ */}
                <p className="text-[var(--color-m1-silver)] text-lg font-light mb-4 tracking-wide">
                  配信開始までお待ちください
                </p>
                
                {/* ローディングドット */}
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-[var(--color-m1-gold)] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[var(--color-m1-champagne)] rounded-full animate-bounce animation-delay-150"></div>
                  <div className="w-2 h-2 bg-[var(--color-m1-gold-light)] rounded-full animate-bounce animation-delay-300"></div>
                </div>

                {/* サブメッセージ */}
                <div className="mt-6 opacity-70">
                  <p className="text-[var(--color-m1-silver-dark)] text-sm tracking-wider">
                    G-1グランプリ配信準備中
                  </p>
                </div>
              </div>

              {/* 角の装飾 */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-[var(--color-m1-gold)]/30 rounded-tl-lg"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-[var(--color-m1-gold)]/30 rounded-tr-lg"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-[var(--color-m1-gold)]/30 rounded-bl-lg"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-[var(--color-m1-gold)]/30 rounded-br-lg"></div>
            </div>
          )}
        </div>
        <DanmakuOverlay messages={messages} />
        <CaptionOverlay messages={messages} />
        <ThemeChangeOverlay messages={messages} />
      </div>
    </div>
  );
}
