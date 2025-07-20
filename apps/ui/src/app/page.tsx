"use client";

import IVSChatRoom from "@/components/IVSChatRoom";
import IVSFormIVSStagePlayer from "@/components/IVSFormIVSStagePlayer";
import FutureContentArea from "@/components/FutureContentArea";
import { Suspense } from "react";

function HomeContent() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-m1-midnight)] via-[var(--color-m1-deep-purple-dark)] to-[var(--color-m1-royal-blue-dark)] py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* ヘッダー */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-m1-gold)] via-[var(--color-m1-champagne)] to-[var(--color-m1-gold)] opacity-20 blur-3xl rounded-full"></div>
          <h1 className="relative text-4xl font-bold bg-gradient-to-r from-[var(--color-m1-gold)] via-[var(--color-m1-champagne)] to-[var(--color-m1-gold-light)] bg-clip-text text-transparent mb-4 tracking-wide">
            Gesture-1 grand prix
          </h1>
        </div>

        {/* メインコンテンツエリア */}
        <div className="w-full flex gap-8">
          {/* ビデオプレイヤーエリア */}
          <div className="w-2/3">
            <div className="bg-gradient-to-b from-[var(--color-m1-charcoal)] to-[var(--color-m1-midnight-light)] rounded-2xl p-8 shadow-2xl border border-[var(--color-m1-gold)]/20">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-[var(--color-m1-gold)] via-[var(--color-m1-crimson)] to-[var(--color-m1-gold)] opacity-30 blur-xl rounded-2xl"></div>
                <div className="relative bg-[var(--color-m1-midnight)] rounded-xl overflow-hidden">
                  <IVSFormIVSStagePlayer />
                </div>
              </div>
            </div>
          </div>

          {/* チャットエリア */}
          <div className="w-1/3">
            <div className="bg-gradient-to-b from-[var(--color-m1-charcoal)] to-[var(--color-m1-midnight-light)] rounded-2xl p-6 shadow-2xl border border-[var(--color-m1-royal-blue)]/30 h-[500px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-[var(--color-m1-gold)] to-[var(--color-m1-champagne)] rounded-full shadow-lg shadow-[var(--color-m1-gold)]/50"></div>
                <h3 className="text-[var(--color-m1-silver)] font-semibold text-lg tracking-wide">
                  LIVE CHAT
                </h3>
              </div>
              <div className="h-[430px] overflow-hidden rounded-xl">
                <IVSChatRoom />
              </div>
            </div>
          </div>
        </div>

        {/* 未来のコンテンツエリア */}
        <FutureContentArea />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
