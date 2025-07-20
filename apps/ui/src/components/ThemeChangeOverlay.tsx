"use client";

import { useState, useEffect, useRef } from "react";
import { Message } from "@/atoms/chatAtoms";
import { ADMIN_MESSAGE } from "@/constants/constant";

interface ThemeChangeOverlayProps {
  messages: Message[];
}

interface ThemeChange {
  id: string;
  theme: string;
  timestamp: Date;
}

type DisplayState = "none" | "theme" | "countdown";

const THEME_DISPLAY_DURATION = 2000; // テーマ表示時間（ミリ秒）
const COUNTDOWN_INTERVAL = 1000; // カウントダウン間隔（ミリ秒）

export default function ThemeChangeOverlay({
  messages,
}: ThemeChangeOverlayProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeChange | null>(null);
  const [displayState, setDisplayState] = useState<DisplayState>("none");
  const [countdown, setCountdown] = useState<number>(3);
  const lastProcessedIndexRef = useRef<number>(-1);
  const processedThemeIdsRef = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // 新しいメッセージのみを処理
    if (messages.length > lastProcessedIndexRef.current) {
      const newMessages = messages.slice(lastProcessedIndexRef.current + 1);

      // 新しいメッセージの中からテーマメッセージを探す
      const themeMessage = newMessages.find((msg) =>
        msg.content.startsWith(ADMIN_MESSAGE.THEME_ID)
      );

      if (themeMessage && !processedThemeIdsRef.current.has(themeMessage.id)) {
        processedThemeIdsRef.current.add(themeMessage.id);

        // 前のタイマーをクリア
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);

        // テーマテキストを抽出（prefix除去）
        const themeText = themeMessage.content
          .replace(new RegExp(`^${ADMIN_MESSAGE.THEME_ID}\\s*`), "")
          .trim();

        const newTheme: ThemeChange = {
          id: themeMessage.id,
          theme: themeText,
          timestamp: themeMessage.sendTime,
        };

        // テーマを表示
        setCurrentTheme(newTheme);
        setDisplayState("theme");
        setCountdown(3); // カウントダウンをリセット

        // 2秒後にカウントダウン開始
        timeoutRef.current = setTimeout(() => {
          setDisplayState("countdown");

          // カウントダウン処理
          let count = 3;
          intervalRef.current = setInterval(() => {
            count--;
            setCountdown(count);

            if (count === 0) {
              // カウントダウン終了
              if (intervalRef.current) clearInterval(intervalRef.current);

              // APIリクエスト（現時点ではconsole.log）
              console.log("テーマ変更リクエスト:", {
                messageId: newTheme.id,
                theme: newTheme.theme,
                timestamp: newTheme.timestamp,
              });

              // 表示を消す
              setDisplayState("none");
              setCurrentTheme(null);
            }
          }, COUNTDOWN_INTERVAL);
        }, THEME_DISPLAY_DURATION);
      }

      // 最後に処理したインデックスを更新
      lastProcessedIndexRef.current = messages.length - 1;
    }
  }, [messages]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (displayState === "none" || !currentTheme) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
      {displayState === "theme" && (
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
            お題
          </h2>
          <p className="text-5xl font-bold bg-gradient-to-r -mb-40 from-[var(--color-m1-gold)] to-[var(--color-m1-champagne)] bg-clip-text text-transparent drop-shadow-lg">
            「{currentTheme.theme}」
          </p>
        </div>
      )}

      {displayState === "countdown" && (
        <div className="text-center animate-fade-in">
          <p className="text-2xl text-white mb-4">
            お題：「{currentTheme.theme}」
          </p>
          <div className="text-8xl font-bold text-white drop-shadow-lg animate-pulse">
            {countdown}
          </div>
        </div>
      )}
    </div>
  );
}
