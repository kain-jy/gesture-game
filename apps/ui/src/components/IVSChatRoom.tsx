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

export default function IVSChatRoom() {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [connectionState, setConnectionState] = useAtom(connectionStateAtom);
  const [error, setError] = useAtom(errorAtom);
  const [chatToken, setChatToken] = useAtom(chatTokenAtom);
  const [username, setUsername] = useAtom(usernameAtom);
  const [isLoadingToken, setIsLoadingToken] = useAtom(isLoadingTokenAtom);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatServiceRef = useRef<ChatService | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);

  const userId = generateRandomString(10);

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
      await chatServiceRef.current.sendMessage(messageInput.trim());
      setMessageInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "メッセージ送信エラー");
    }
  }, [messageInput, connectionState, setError]);

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
    <div className="bg-white w-full h-96 rounded-lg flex flex-col">
      {connectionState === "disconnected" && (
        <div className="p-4 border-b">
          <div className="space-y-3">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                表示名（オプション）
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例: 田中太郎"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {!generateChatTokenApiEndpoint && (
              <div>
                <label
                  htmlFor="chatToken"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  チャットトークン（手動入力）
                </label>
                <input
                  type="text"
                  id="chatToken"
                  value={chatToken}
                  onChange={(e) => setChatToken(e.target.value)}
                  placeholder="チャットトークンを入力"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <button
              onClick={connectToChat}
              disabled={!userId.trim() || isLoadingToken}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingToken ? "接続中..." : "チャットに接続"}
            </button>
          </div>
        </div>
      )}

      {connectionState !== "disconnected" && (
        <>
          <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  connectionState === "connected"
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              />
              <span className="text-sm font-medium">
                {connectionState === "connected" ? "接続済み" : "接続中..."}
              </span>
            </div>
            {/* <button
              onClick={disconnectFromChat}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              切断
            </button> */}
          </div>

          <div className="flex-1 overflow-y-auto h-full p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="bg-gray-100 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm text-blue-600">
                    {message.sender.attributes?.username ||
                      message.sender.userId}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.sendTime.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-800">{message.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="メッセージを入力..."
                disabled={connectionState !== "connected"}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <button
                onClick={sendMessage}
                disabled={
                  !messageInput.trim() || connectionState !== "connected"
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                送信
              </button>
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="p-3 bg-red-50 border-t border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
