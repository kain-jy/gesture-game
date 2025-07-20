"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAtom } from "jotai";
import { Subscription } from "rxjs";
import { generateRandomString } from "@/utils/random";
import { ChatService } from "@/services/chatService";
import {
  messagesAtom,
  connectionStateAtom,
  errorAtom,
  usernameAtom,
  chatTokenAtom,
  isLoadingTokenAtom,
} from "@/atoms/chatAtoms";
import { useSearchParams } from "next/navigation";
import { ADMIN_ID, ADMIN_MESSAGE } from "@/constants/constant";

export default function IVSChatRoom() {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [connectionState, setConnectionState] = useAtom(connectionStateAtom);
  const [error, setError] = useAtom(errorAtom);
  const [chatToken, setChatToken] = useAtom(chatTokenAtom);
  const [username, setUsername] = useAtom(usernameAtom);
  const [isLoadingToken, setIsLoadingToken] = useAtom(isLoadingTokenAtom);
  const [messageInput, setMessageInput] = useState("");
  const [adminMessageType, setAdminMessageType] = useState<string>(
    ADMIN_MESSAGE.MESSAGE_ID
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatServiceRef = useRef<ChatService | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);

  const searchParams = useSearchParams();
  const isAdminUser = searchParams.get("admin") === ADMIN_ID;

  const userId = isAdminUser ? ADMIN_ID : generateRandomString(10);

  const generateChatTokenApiEndpoint =
    process.env.NEXT_PUBLIC_CHAT_TOKEN_API_ENDPOINT || "";
  const chatRoomArn = process.env.NEXT_PUBLIC_IVS_CHAT_ROOM_ARN || "";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchToken = useCallback(async () => {
    const response = await fetch(generateChatTokenApiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatRoomArn,
        userId: userId || `user-${Date.now()}`,
        username: username || userId || `User${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch token");
    }

    const data = await response.json();
    return {
      token: data.token,
      sessionExpirationTime: new Date(data.sessionExpirationTime),
      tokenExpirationTime: new Date(data.tokenExpirationTime),
    };
  }, [generateChatTokenApiEndpoint, chatRoomArn, userId, username]);

  const tokenProvider = useCallback(async () => {
    if (chatToken) {
      return {
        token: chatToken,
        sessionExpirationTime: new Date(Date.now() + 60 * 60 * 1000),
        tokenExpirationTime: new Date(Date.now() + 60 * 60 * 1000),
      };
    }
    return fetchToken();
  }, [chatToken, fetchToken]);

  const connectToChat = useCallback(async () => {
    try {
      setIsLoadingToken(true);
      setError("");

      const region = chatRoomArn.split(":")[3];

      chatServiceRef.current = new ChatService(region, tokenProvider);

      subscriptionRef.current = chatServiceRef.current.connect().subscribe({
        next: (event) => {
          switch (event.type) {
            case "state":
              setConnectionState(event.payload);
              break;
            case "message":
              setMessages((prev) => [...prev, event.payload]);
              break;
            case "messageDelete":
              setMessages((prev) =>
                prev.filter((msg) => msg.id !== event.payload)
              );
              break;
            case "error":
              setError(event.payload);
              break;
          }
        },
        error: (err) => {
          setError(err.message || "接続エラーが発生しました");
          setConnectionState("disconnected");
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "接続エラーが発生しました");
      setConnectionState("disconnected");
    } finally {
      setIsLoadingToken(false);
    }
  }, [
    chatRoomArn,
    tokenProvider,
    setConnectionState,
    setError,
    setIsLoadingToken,
    setMessages,
  ]);

  const disconnectFromChat = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (chatServiceRef.current) {
      chatServiceRef.current.disconnect();
      chatServiceRef.current = null;
    }
    setMessages([]);
    setConnectionState("disconnected");
  }, [setMessages, setConnectionState]);

  const sendMessage = useCallback(async () => {
    if (
      !messageInput.trim() ||
      !chatServiceRef.current ||
      connectionState !== "connected"
    ) {
      return;
    }

    try {
      let messageToSend = messageInput.trim();

      // 管理者の場合、選択したタイプにprefixを付与
      if (isAdminUser && adminMessageType !== ADMIN_MESSAGE.MESSAGE_ID) {
        const prefix =
          adminMessageType === ADMIN_MESSAGE.THEME_ID
            ? ADMIN_MESSAGE.THEME_ID
            : ADMIN_MESSAGE.CAPTION_ID;
        messageToSend = `${prefix} ${messageToSend}`;
      }

      await chatServiceRef.current.sendMessage(messageToSend);
      setMessageInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "メッセージ送信エラー");
    }
  }, [messageInput, connectionState, setError, isAdminUser, adminMessageType]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    return () => {
      disconnectFromChat();
    };
  }, [disconnectFromChat]);

  return (
    <div className="bg-gradient-to-b from-[var(--color-m1-midnight)] to-[var(--color-m1-charcoal)] w-full h-96 rounded-xl flex flex-col border border-[var(--color-m1-gold)]/20 shadow-xl overflow-hidden">
      {connectionState === "disconnected" && (
        <div className="p-6 border-b border-[var(--color-m1-gold)]/20 bg-[var(--color-m1-midnight-light)]">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-[var(--color-m1-silver)] mb-2 tracking-wide"
              >
                表示名（オプション）
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例: 田中太郎"
                className="w-full px-4 py-3 bg-[var(--color-m1-charcoal)] border border-[var(--color-m1-gold)]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-m1-gold)] focus:border-transparent text-[var(--color-m1-silver)] placeholder-[var(--color-m1-silver-dark)] transition-all"
              />
            </div>
            {!generateChatTokenApiEndpoint && (
              <div>
                <label
                  htmlFor="chatToken"
                  className="block text-sm font-medium text-[var(--color-m1-silver)] mb-2 tracking-wide"
                >
                  チャットトークン（手動入力）
                </label>
                <input
                  type="text"
                  id="chatToken"
                  value={chatToken}
                  onChange={(e) => setChatToken(e.target.value)}
                  placeholder="チャットトークンを入力"
                  className="w-full px-4 py-3 bg-[var(--color-m1-charcoal)] border border-[var(--color-m1-gold)]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-m1-gold)] focus:border-transparent text-[var(--color-m1-silver)] placeholder-[var(--color-m1-silver-dark)] transition-all"
                />
              </div>
            )}
            <button
              onClick={connectToChat}
              disabled={!userId.trim() || isLoadingToken}
              className="w-full px-6 py-3 bg-gradient-to-r from-[var(--color-m1-gold)] to-[var(--color-m1-champagne)] text-[var(--color-m1-midnight)] font-semibold rounded-lg hover:from-[var(--color-m1-gold-light)] hover:to-[var(--color-m1-gold)] disabled:from-[var(--color-m1-charcoal)] disabled:to-[var(--color-m1-charcoal-light)] disabled:text-[var(--color-m1-silver-dark)] disabled:cursor-not-allowed transition-all duration-300 shadow-lg transform hover:scale-105 disabled:hover:scale-100"
            >
              {isLoadingToken ? "接続中..." : "チャットに接続"}
            </button>
          </div>
        </div>
      )}

      {connectionState !== "disconnected" && (
        <>
          <div className="p-4 border-b border-[var(--color-m1-gold)]/20 bg-[var(--color-m1-midnight-light)] flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full shadow-lg ${
                  connectionState === "connected"
                    ? "bg-[var(--color-m1-gold)] shadow-[var(--color-m1-gold)]/50"
                    : "bg-[var(--color-m1-champagne)] shadow-[var(--color-m1-champagne)]/50"
                }`}
              />
              <span className="text-sm font-medium text-[var(--color-m1-silver)] tracking-wide">
                {connectionState === "connected" ? "接続済み" : "接続中..."}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto h-full p-4 space-y-3 scrollbar-thin scrollbar-thumb-[var(--color-m1-gold)]/30 scrollbar-track-transparent">
            {messages.map((message) => {
              const isAdminMessage = message.sender.userId === ADMIN_ID;
              const messageContent = message.content;
              const hasThemePrefix = messageContent.startsWith(
                ADMIN_MESSAGE.THEME_ID
              );
              const hasCaptionPrefix = messageContent.startsWith(
                ADMIN_MESSAGE.CAPTION_ID
              );

              if (isAdminMessage && !hasCaptionPrefix && !hasThemePrefix) {
                // 管理者メッセージ
                return (
                  <div key={message.id} className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-m1-gold)] via-[var(--color-m1-crimson)] to-[var(--color-m1-gold)] rounded-lg blur opacity-75 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-[var(--color-m1-midnight)] via-[var(--color-m1-charcoal)] to-[var(--color-m1-midnight)] rounded-lg p-4 border-2 border-[var(--color-m1-gold)] shadow-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-[var(--color-m1-gold)] to-[var(--color-m1-crimson)] rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <span className="font-bold text-sm bg-gradient-to-r from-[var(--color-m1-gold)] to-[var(--color-m1-champagne)] bg-clip-text text-transparent tracking-wide uppercase">
                            "管理者メッセージ"
                          </span>
                        </div>
                        <span className="text-xs text-[var(--color-m1-gold)]">
                          {message.sendTime.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="bg-[var(--color-m1-midnight-light)]/50 rounded-md p-3 border border-[var(--color-m1-gold)]/30">
                        {/* <p className="text-[var(--color-m1-gold)] font-semibold leading-relaxed text-base">
                          {hasThemePrefix || hasCaptionPrefix
                            ? message.content.replace(
                                new RegExp(
                                  `^\\[${ADMIN_MESSAGE.THEME_ID}|${ADMIN_MESSAGE.CAPTION_ID}\\]\\s*`
                                ),
                                ""
                              )
                            : message.content}
                        </p> */}
                        <p className="text-[var(--color-m1-gold)] font-semibold leading-relaxed text-base">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              } else if (isAdminMessage && hasCaptionPrefix) {
                <div
                  key={message.id}
                  className="bg-gradient-to-r from-[var(--color-m1-charcoal)]/80 to-[var(--color-m1-midnight-light)]/80 rounded-lg p-4 border border-[var(--color-m1-gold)]/10 backdrop-blur-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm text-[var(--color-m1-gold)] tracking-wide">
                      {message.sender.attributes?.username ||
                        message.sender.userId}
                    </span>
                    <span className="text-xs text-[var(--color-m1-silver-dark)]">
                      {message.sendTime.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[var(--color-m1-silver)] leading-relaxed">
                    {message.content}
                  </p>
                </div>;
              }

              // return (
              //   <div
              //     key={message.id}
              //     className="bg-gradient-to-r from-[var(--color-m1-charcoal)]/80 to-[var(--color-m1-midnight-light)]/80 rounded-lg p-4 border border-[var(--color-m1-gold)]/10 backdrop-blur-sm"
              //   >
              //     <div className="flex justify-between items-start mb-2">
              //       <span className="font-semibold text-sm text-[var(--color-m1-gold)] tracking-wide">
              //         {message.sender.attributes?.username ||
              //           message.sender.userId}
              //       </span>
              //       <span className="text-xs text-[var(--color-m1-silver-dark)]">
              //         {message.sendTime.toLocaleTimeString()}
              //       </span>
              //     </div>
              //     <p className="text-[var(--color-m1-silver)] leading-relaxed">
              //       {message.content}
              //     </p>
              //   </div>
              // );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-[var(--color-m1-gold)]/20 bg-[var(--color-m1-midnight-light)]">
            {/* ADMIN 管理用メッセージフォーム */}
            {isAdminUser ? (
              <div className="mt-4 p-4 bg-gradient-to-r from-[var(--color-m1-midnight-light)]/50 to-[var(--color-m1-charcoal)]/50 rounded-lg border border-[var(--color-m1-gold)]/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[var(--color-m1-gold)] font-semibold text-sm">
                    管理者送信モード:
                  </span>
                  <select
                    value={adminMessageType}
                    onChange={(e) => setAdminMessageType(e.target.value)}
                    className="px-3 py-1 bg-[var(--color-m1-charcoal)] border border-[var(--color-m1-gold)]/30 rounded text-[var(--color-m1-silver)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-m1-gold)] focus:border-transparent"
                  >
                    <option value={ADMIN_MESSAGE.MESSAGE_ID}>
                      通常メッセージ
                    </option>
                    <option value={ADMIN_MESSAGE.THEME_ID}>テーマ変更</option>
                    <option value={ADMIN_MESSAGE.CAPTION_ID}>
                      キャプション
                    </option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="管理者メッセージを入力..."
                    disabled={connectionState !== "connected"}
                    className="flex-1 px-4 py-3 bg-[var(--color-m1-charcoal)] border border-[var(--color-m1-gold)]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-m1-gold)] focus:border-transparent text-[var(--color-m1-silver)] placeholder-[var(--color-m1-silver-dark)] disabled:bg-[var(--color-m1-charcoal)]/50 disabled:text-[var(--color-m1-silver-dark)] transition-all"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={
                      !messageInput.trim() || connectionState !== "connected"
                    }
                    className="px-6 py-3 bg-gradient-to-r from-[var(--color-m1-gold)] to-[var(--color-m1-champagne)] text-[var(--color-m1-midnight)] font-semibold rounded-lg hover:from-[var(--color-m1-gold-light)] hover:to-[var(--color-m1-gold)] disabled:from-[var(--color-m1-charcoal)] disabled:to-[var(--color-m1-charcoal-light)] disabled:text-[var(--color-m1-silver-dark)] disabled:cursor-not-allowed transition-all duration-300 shadow-lg transform hover:scale-105 disabled:hover:scale-100"
                  >
                    送信
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="メッセージを入力..."
                  disabled={connectionState !== "connected"}
                  className="flex-1 px-4 py-3 bg-[var(--color-m1-charcoal)] border border-[var(--color-m1-gold)]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-m1-gold)] focus:border-transparent text-[var(--color-m1-silver)] placeholder-[var(--color-m1-silver-dark)] disabled:bg-[var(--color-m1-charcoal)]/50 disabled:text-[var(--color-m1-silver-dark)] transition-all"
                />
                <button
                  onClick={sendMessage}
                  disabled={
                    !messageInput.trim() || connectionState !== "connected"
                  }
                  className="px-6 py-3 bg-gradient-to-r from-[var(--color-m1-crimson)] to-[var(--color-m1-crimson-light)] text-white font-semibold rounded-lg hover:from-[var(--color-m1-crimson-dark)] hover:to-[var(--color-m1-crimson)] disabled:from-[var(--color-m1-charcoal)] disabled:to-[var(--color-m1-charcoal-light)] disabled:text-[var(--color-m1-silver-dark)] disabled:cursor-not-allowed transition-all duration-300 shadow-lg transform hover:scale-105 disabled:hover:scale-100"
                >
                  送信
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {error && (
        <div className="p-4 bg-gradient-to-r from-[var(--color-m1-crimson-dark)]/20 to-[var(--color-m1-crimson)]/20 border-t border-[var(--color-m1-crimson)]/30">
          <p className="text-[var(--color-m1-crimson-light)] text-sm font-medium">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
