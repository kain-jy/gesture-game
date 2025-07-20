"use client";

import { useState } from "react";
import {
  apiClient,
  SessionRequest,
  ModelRequest,
  SessionResponse,
  ModelResponse,
} from "@/services/api";
import Link from "next/link";

export default function ApiTestPage() {
  const [sessionLoading, setSessionLoading] = useState(false);
  const [invocationLoading, setInvocationLoading] = useState(false);
  const [sessionResult, setSessionResult] = useState<SessionResponse | null>(
    null
  );
  const [invocationResult, setInvocationResult] =
    useState<ModelResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [sessionForm, setSessionForm] = useState<SessionRequest>({
    session_id: "",
    theme: "C",
  });

  const [invocationForm, setInvocationForm] = useState<ModelRequest>({
    model: "amazon.nova-pro-v1:0",
    theme: "C",
    image: "",
  });

  const handleSessionTest = async () => {
    setSessionLoading(true);
    setError(null);
    try {
      const result = await apiClient.createSession(sessionForm);
      setSessionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setSessionLoading(false);
    }
  };

  const handleInvocationTest = async () => {
    setInvocationLoading(true);
    setError(null);
    try {
      const result = await apiClient.createInvocation(invocationForm);
      setInvocationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setInvocationLoading(false);
    }
  };

  const generateSampleBase64Image = () => {
    // 簡単な1x1ピクセルのPNG画像のBase64データ
    const sampleImage =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    setInvocationForm((prev) => ({ ...prev, image: sampleImage }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          API 疎通確認テスト
        </h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Session API Test */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Session API テスト
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Session ID
                </label>
                <input
                  type="text"
                  value={sessionForm.session_id}
                  onChange={(e) =>
                    setSessionForm((prev) => ({
                      ...prev,
                      session_id: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="session_123"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Theme
                </label>
                <input
                  type="text"
                  value={sessionForm.theme}
                  onChange={(e) =>
                    setSessionForm((prev) => ({
                      ...prev,
                      theme: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="C"
                  maxLength={1}
                />
              </div>

              <button
                onClick={handleSessionTest}
                disabled={sessionLoading || !sessionForm.session_id}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
              >
                {sessionLoading ? "テスト中..." : "Session API テスト"}
              </button>
            </div>

            {sessionResult && (
              <div className="mt-4 p-4 bg-gray-900/50 rounded border border-gray-600">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Response:
                </h3>
                <pre className="text-xs text-gray-400 overflow-auto">
                  {JSON.stringify(sessionResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Invocation API Test */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Invocation API テスト
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Model
                </label>
                <input
                  type="text"
                  value={invocationForm.model}
                  onChange={(e) =>
                    setInvocationForm((prev) => ({
                      ...prev,
                      model: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Theme
                </label>
                <input
                  type="text"
                  value={invocationForm.theme}
                  onChange={(e) =>
                    setInvocationForm((prev) => ({
                      ...prev,
                      theme: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  maxLength={1}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Base64 Image Data
                  <button
                    type="button"
                    onClick={generateSampleBase64Image}
                    className="ml-2 text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
                  >
                    サンプル画像を使用
                  </button>
                </label>
                <textarea
                  value={invocationForm.image}
                  onChange={(e) =>
                    setInvocationForm((prev) => ({
                      ...prev,
                      image: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none h-20 resize-none"
                  placeholder="Base64 encoded image data..."
                />
              </div>

              <button
                onClick={handleInvocationTest}
                disabled={invocationLoading || !invocationForm.image}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
              >
                {invocationLoading ? "テスト中..." : "Invocation API テスト"}
              </button>
            </div>

            {invocationResult && (
              <div className="mt-4 p-4 bg-gray-900/50 rounded border border-gray-600">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Response:
                </h3>
                <pre className="text-xs text-gray-400 overflow-auto">
                  {JSON.stringify(invocationResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
