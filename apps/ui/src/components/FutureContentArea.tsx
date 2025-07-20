"use client";

import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import {
  currentThemeAtom,
  themeResultAtom,
  isPollingAtom,
} from "@/atoms/themeAtoms";
import { apiClient, ModelResponse } from "@/services/api";

const POLLING_INTERVAL = 3000; // 3秒間隔でポーリング

export default function FutureContentArea() {
  const [currentTheme] = useAtom(currentThemeAtom);
  const [themeResult, setThemeResult] = useAtom(themeResultAtom);
  const [isPolling, setIsPolling] = useAtom(isPollingAtom);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 既存のポーリングを停止
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
    setThemeResult(null);

    // テーマが設定されている場合、ポーリングを開始
    if (currentTheme) {
      console.log("Session APIポーリング開始:", currentTheme.sessionId);
      setIsPolling(true);

      const pollSessionAPI = async () => {
        try {
          const sessionRequest = {
            session_id: currentTheme.sessionId,
            theme: currentTheme.theme,
          };
          const result = await apiClient.createSession(sessionRequest);
          console.log("Session API結果:", result);
          setThemeResult(result);

          // success状態になったらポーリングを停止
          if (result.status === true && result.message === "success") {
            console.log("処理完了のためポーリング停止");
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setIsPolling(false);
          }
        } catch (error) {
          console.error("Session API ポーリングエラー:", error);
        }
      };

      // 3秒待機後に初回実行
      setTimeout(() => {
        pollSessionAPI();

        // 定期実行
        intervalRef.current = setInterval(pollSessionAPI, POLLING_INTERVAL);
      }, 3000);
    }

    // クリーンアップ
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentTheme, setIsPolling, setThemeResult]);

  const getStatusMessage = () => {
    if (!currentTheme) {
      return "テーマが設定されていません";
    }

    if (!themeResult) {
      return "処理中...";
    }

    switch (themeResult.message) {
      case "initialize":
        return "審査中..";
      case "waiting":
        return "審査中...";
      case "success":
        return "審査完了！";
      default:
        return "不明な状態";
    }
  };

  interface JudgeComment {
    id: string;
    name: string;
    model: string;
    score: number;
    reason: string;
    avatar: string;
    color: string;
  }

  const processJudgeComments = (
    data: Record<string, ModelResponse> | null
  ): JudgeComment[] => {
    if (!data) return [];

    const avatarEmojis = ["👨‍💼", "👩‍💼", "🧑‍💼", "👨‍🎓", "👩‍🎓"];
    const colors = [
      "from-blue-500 to-purple-500",
      "from-pink-500 to-rose-500",
      "from-green-500 to-teal-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-blue-500",
    ];

    return Object.entries(data).map(([modelKey, response], index) => ({
      id: modelKey,
      name: modelKey,
      model: modelKey,
      score: response.score,
      reason: response.reason,
      avatar: avatarEmojis[index % avatarEmojis.length],
      color: colors[index % colors.length],
    }));
  };

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-[var(--color-m1-deep-purple-dark)] via-[var(--color-m1-charcoal)] to-[var(--color-m1-deep-purple-dark)] rounded-2xl p-8 shadow-2xl border border-[var(--color-m1-crimson)]/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-m1-crimson)]/10 via-transparent to-[var(--color-m1-gold)]/10"></div>
        <div className="relative text-center">
          {currentTheme ? (
            <div>
              <div className="inline-flex items-center gap-3 bg-[var(--color-m1-midnight)]/80 px-6 py-3 rounded-full border border-[var(--color-m1-gold)]/30 mb-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isPolling
                      ? "bg-[var(--color-m1-gold)] animate-pulse"
                      : "bg-gray-500"
                  }`}
                ></div>
                <span className="text-[var(--color-m1-silver)] font-medium tracking-wider">
                  テーマ: {currentTheme.theme}
                </span>
                <div className="w-2 h-2 bg-[var(--color-m1-crimson)] rounded-full animate-pulse"></div>
              </div>
              <p className="text-[var(--color-m1-silver-dark)] mb-4 text-lg font-light">
                {getStatusMessage()}
              </p>

              {/* {themeResult &&
                themeResult.message === "success" &&
                themeResult.image_url && (
                  <div className="mt-6">
                    <p className="text-[var(--color-m1-gold)] font-semibold mb-4">
                      生成された画像:
                    </p>
                    <div className="max-w-md mx-auto">
                      <img
                        src={themeResult.image_url}
                        alt="生成された画像"
                        className="w-full rounded-lg shadow-lg border border-[var(--color-m1-gold)]/30"
                        onError={(e) => {
                          console.error("画像読み込みエラー:", e);
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )} */}

              {themeResult &&
                themeResult.message === "success" &&
                themeResult.data && (
                  <div className="mt-6">
                    <div className="text-center mb-6">
                      <h3 className="text-[var(--color-m1-gold)] text-xl font-bold mb-2">
                        🏆 審査結果発表 🏆
                      </h3>
                      <p className="text-[var(--color-m1-silver-dark)] text-sm">
                        各審査員からのコメントをご覧ください
                      </p>
                    </div>

                    <div className="space-y-4">
                      {processJudgeComments(themeResult.data).map(
                        (judge, index) => (
                          <div
                            key={judge.id}
                            className="bg-gradient-to-r from-[var(--color-m1-midnight)]/80 to-[var(--color-m1-charcoal)]/80 rounded-lg p-4 border border-[var(--color-m1-gold)]/20 transform hover:scale-[1.02] transition-all duration-300"
                            style={{ animationDelay: `${index * 200}ms` }}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`w-12 h-12 rounded-full bg-gradient-to-br ${judge.color} flex items-center justify-center text-2xl flex-shrink-0`}
                              >
                                {judge.avatar}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-[var(--color-m1-silver)] font-semibold">
                                    {judge.name}
                                  </h4>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[var(--color-m1-gold)] text-lg font-bold">
                                      {judge.score}
                                    </span>
                                    <span className="text-[var(--color-m1-silver-dark)] text-sm">
                                      /100
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <span
                                        key={i}
                                        className={`text-lg ${
                                          i < (judge.score / 100) * 5
                                            ? "text-[var(--color-m1-gold)]"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        ⭐
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="bg-[var(--color-m1-midnight)]/60 rounded-lg p-3 border-l-4 border-[var(--color-m1-gold)]">
                                  <p className="text-[var(--color-m1-silver-dark)] text-sm leading-relaxed">
                                    💬 {judge.reason}
                                  </p>
                                </div>
                                <div className="mt-2 text-xs text-[var(--color-m1-silver-dark)]/60">
                                  Model: {judge.model}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 bg-[var(--color-m1-midnight)]/80 px-4 py-2 rounded-full border border-[var(--color-m1-gold)]/30">
                        <span className="text-[var(--color-m1-gold)] text-sm font-semibold">
                          平均スコア:
                        </span>
                        <span className="text-[var(--color-m1-silver)] text-lg font-bold">
                          {processJudgeComments(themeResult.data).length > 0
                            ? Math.round(
                                processJudgeComments(themeResult.data).reduce(
                                  (sum, judge) => sum + judge.score,
                                  0
                                ) /
                                  processJudgeComments(themeResult.data).length
                              )
                            : 0}
                        </span>
                        <span className="text-[var(--color-m1-silver-dark)] text-sm">
                          /100
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              {themeResult &&
                themeResult.data &&
                themeResult.message !== "success" && (
                  <div className="mt-4 p-4 bg-[var(--color-m1-midnight)]/50 rounded-lg border border-[var(--color-m1-gold)]/20">
                    <p className="text-[var(--color-m1-silver-dark)] text-sm mb-2">
                      API結果:
                    </p>
                    <pre className="text-xs text-[var(--color-m1-silver-dark)] overflow-auto text-left">
                      {JSON.stringify(themeResult.data, null, 2)}
                    </pre>
                  </div>
                )}
            </div>
          ) : (
            <div>
              <div className="inline-flex items-center gap-3 bg-[var(--color-m1-midnight)]/80 px-6 py-3 rounded-full border border-[var(--color-m1-gold)]/30">
                <div className="w-2 h-2 bg-[var(--color-m1-gold)] rounded-full animate-pulse"></div>
                <span className="text-[var(--color-m1-silver)] font-medium tracking-wider">
                  COMING SOON
                </span>
                <div className="w-2 h-2 bg-[var(--color-m1-crimson)] rounded-full animate-pulse"></div>
              </div>
              <p className="text-[var(--color-m1-silver-dark)] mt-4 text-lg font-light">
                次世代のエンターテイメント体験をお楽しみに
              </p>
            </div>
          )}
        </div>

        {/* 装飾的な要素 */}
        <div className="absolute top-4 left-4 w-16 h-16 border-2 border-[var(--color-m1-gold)]/20 rounded-full"></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-[var(--color-m1-crimson)]/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-[var(--color-m1-royal-blue)]/10 rounded-full"></div>
      </div>
    </div>
  );
}
