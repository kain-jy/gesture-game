"use client";

import { useState, useEffect, useRef } from "react";
import { Message } from "@/atoms/chatAtoms";
import { ADMIN_MESSAGE } from "@/constants/constant";

interface CaptionOverlayProps {
  messages: Message[];
}

interface CaptionMessage {
  id: string;
  content: string;
  timestamp: Date;
}

const CAPTION_DISPLAY_DURATION = 3000; // 字幕表示時間（ミリ秒）

export default function CaptionOverlay({ messages }: CaptionOverlayProps) {
  const [currentCaption, setCurrentCaption] = useState<CaptionMessage | null>(
    null
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedIndexRef = useRef<number>(-1);

  useEffect(() => {
    // 新しいメッセージのみを処理
    if (messages.length > lastProcessedIndexRef.current) {
      const newMessages = messages.slice(lastProcessedIndexRef.current + 1);

      // 新しいメッセージの中から字幕メッセージを探す
      const captionMessage = newMessages.find((msg) =>
        msg.content.startsWith(ADMIN_MESSAGE.CAPTION_ID)
      );

      if (captionMessage) {
        // 前のタイマーをクリア
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // 字幕テキストを抽出（prefix除去）
        const captionText = captionMessage.content
          .replace(new RegExp(`^${ADMIN_MESSAGE.CAPTION_ID}\\s*`), "")
          .trim();

        const newCaption: CaptionMessage = {
          id: captionMessage.id,
          content: captionText,
          timestamp: captionMessage.sendTime,
        };

        setCurrentCaption(newCaption);

        // 一定時間後に字幕を非表示
        timeoutRef.current = setTimeout(() => {
          setCurrentCaption(null);
        }, CAPTION_DISPLAY_DURATION);
      }

      // 最後に処理したインデックスを更新
      lastProcessedIndexRef.current = messages.length - 1;
    }
  }, [messages]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!currentCaption) {
    return null;
  }

  return (
    <div className="absolute bottom-16 left-0 right-0 flex justify-center items-center px-8 z-50 pointer-events-none">
      {/* シンプルな字幕 */}
      <div className="bg-black/80 backdrop-blur-sm rounded px-6 py-3 max-w-3xl">
        <p className="text-xl text-white text-center leading-relaxed">
          {currentCaption.content}
        </p>
      </div>
    </div>
  );
}
