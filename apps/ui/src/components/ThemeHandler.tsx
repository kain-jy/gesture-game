"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/atoms/chatAtoms";
import { ADMIN_MESSAGE } from "@/constants/constant";

interface ThemeHandlerProps {
  messages: Message[];
}

export default function ThemeHandler({ messages }: ThemeHandlerProps) {
  const lastProcessedIndexRef = useRef<number>(-1);
  const processedThemeIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 新しいメッセージのみを処理
    if (messages.length > lastProcessedIndexRef.current) {
      const newMessages = messages.slice(lastProcessedIndexRef.current + 1);
      
      // 新しいメッセージの中からテーマメッセージを探す
      const themeMessages = newMessages.filter(msg => 
        msg.content.startsWith(ADMIN_MESSAGE.THEME_ID)
      );

      // 各テーマメッセージを処理
      themeMessages.forEach(themeMessage => {
        // 重複処理を防ぐ
        if (!processedThemeIdsRef.current.has(themeMessage.id)) {
          processedThemeIdsRef.current.add(themeMessage.id);

          // テーマテキストを抽出（prefix除去）
          const themeText = themeMessage.content
            .replace(new RegExp(`^${ADMIN_MESSAGE.THEME_ID}\\s*`), '')
            .trim();

          // 現時点ではconsole.logに出力
          console.log('テーマ変更リクエスト:', {
            messageId: themeMessage.id,
            theme: themeText,
            timestamp: themeMessage.sendTime,
            sender: themeMessage.sender
          });

          // TODO: 将来的にここでAPIリクエストを発火
          //例:
          // await changeThemeAPI(themeText);
        }
      });

      // 最後に処理したインデックスを更新
      lastProcessedIndexRef.current = messages.length - 1;
    }
  }, [messages]);

  // メモリリークを防ぐため、古い処理済みIDを定期的にクリア
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // 処理済みIDが100件を超えたら古いものをクリア
      if (processedThemeIdsRef.current.size > 100) {
        processedThemeIdsRef.current.clear();
      }
    }, 60000); // 1分ごと

    return () => clearInterval(cleanupInterval);
  }, []);

  // UIは表示しない（ロジックのみのコンポーネント）
  return null;
}