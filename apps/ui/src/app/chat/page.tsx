"use client";

import { useState } from "react";
import IVSChatRoom from "@/components/IVSChatRoom";

export default function ChatPage() {
  const [chatRoomArn, setChatRoomArn] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    if (chatRoomArn.trim()) {
      setIsConnected(true);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          AWS IVS Chat
        </h1>

        {!isConnected ? (
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                チャットルームに参加
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="chatRoomArn" className="block text-sm font-medium text-gray-700 mb-1">
                    チャットルーム ARN
                  </label>
                  <input
                    type="text"
                    id="chatRoomArn"
                    value={chatRoomArn}
                    onChange={(e) => setChatRoomArn(e.target.value)}
                    placeholder="arn:aws:ivschat:us-west-2:123456789012:room/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleConnect}
                  disabled={!chatRoomArn.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  参加
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                チャットルーム
              </h2>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                退室
              </button>
            </div>
            <IVSChatRoom chatRoomArn={chatRoomArn} />
          </div>
        )}
      </div>
    </div>
  );
}