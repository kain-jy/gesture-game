"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChatRoom,
  ChatMessage,
  ConnectionState,
  DeleteMessageEvent,
  SendMessageRequest,
} from "amazon-ivs-chat-messaging";

interface IVSChatRoomProps {
  chatRoomArn: string;
  apiEndpoint?: string;
}

interface Message {
  id: string;
  content: string;
  sender: {
    userId: string;
    attributes?: Record<string, string>;
  };
  sendTime: Date;
}

export default function IVSChatRoom({ chatRoomArn, apiEndpoint }: IVSChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [error, setError] = useState<string>("");
  const [chatToken, setChatToken] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRoom = useRef<ChatRoom | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchToken = async () => {
    if (!apiEndpoint) {
      throw new Error("API endpoint is not configured");
    }

    const response = await fetch(apiEndpoint, {
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
  };

  const tokenProvider = async () => {
    if (chatToken) {
      return {
        token: chatToken,
        sessionExpirationTime: new Date(Date.now() + 60 * 60 * 1000),
        tokenExpirationTime: new Date(Date.now() + 60 * 60 * 1000),
      };
    }
    return fetchToken();
  };

  const connectToChat = async () => {
    if (!apiEndpoint && !chatToken.trim()) {
      setError("チャットトークンを入力するか、APIエンドポイントを設定してください");
      return;
    }

    if (!userId.trim()) {
      setError("ユーザーIDを入力してください");
      return;
    }

    try {
      setIsLoadingToken(true);
      setError("");

      const region = chatRoomArn.split(":")[3];

      chatRoom.current = new ChatRoom({
        regionOrUrl: region,
        tokenProvider: tokenProvider,
      });

      chatRoom.current.addListener("connecting", () => {
        setConnectionState("connecting");
      });

      chatRoom.current.addListener("connect", () => {
        setConnectionState("connected");
      });

      chatRoom.current.addListener("disconnect", () => {
        setConnectionState("disconnected");
      });

      chatRoom.current.addListener("message", (message: ChatMessage) => {
        const newMessage: Message = {
          id: message.id,
          content: message.content || "",
          sender: message.sender,
          sendTime: message.sendTime,
        };
        setMessages((prev) => [...prev, newMessage]);
      });

      chatRoom.current.addListener(
        "messageDelete",
        (event: DeleteMessageEvent) => {
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== event.messageId)
          );
        }
      );

      chatRoom.current.connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : "接続エラーが発生しました");
      setConnectionState("disconnected");
    } finally {
      setIsLoadingToken(false);
    }
  };

  const disconnectFromChat = () => {
    if (chatRoom.current) {
      chatRoom.current.disconnect();
      chatRoom.current = null;
    }
    setMessages([]);
    setConnectionState("disconnected");
  };

  const sendMessage = async () => {
    if (
      !messageInput.trim() ||
      !chatRoom.current ||
      connectionState !== "connected"
    ) {
      return;
    }

    try {
      const request = new SendMessageRequest(messageInput.trim());
      await chatRoom.current.sendMessage(request);
      setMessageInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "メッセージ送信エラー");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-96 flex flex-col">
      {connectionState === "disconnected" && (
        <div className="p-4 border-b">
          <div className="space-y-3">
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ユーザーID *
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="例: user123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
            {!apiEndpoint && (
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
            <button
              onClick={disconnectFromChat}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              切断
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
