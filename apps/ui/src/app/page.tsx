"use client";

import IVSPlayer from "@/components/IVSPlayer";
import IVSStagePlayer from "@/components/IVSStagePlayer";
import { useIVSForm } from "@/hooks/useIVSForm";

export default function Home() {
  const {
    streamArn,
    playbackUrl,
    error,
    isStage,
    stageToken,
    setStreamArn,
    handleSubmit,
  } = useIVSForm();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          AWS IVS Viewer
        </h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4 max-w-2xl mx-auto">
            <input
              type="text"
              value={streamArn}
              onChange={(e) => setStreamArn(e.target.value)}
              placeholder="Enter IVS Channel/Stage ARN or Playback URL"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Watch
            </button>
          </div>
        </form>

        {error && (
          <div className="max-w-2xl mx-auto mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!error && (playbackUrl || stageToken) && (
          <div className="mt-8">
            {isStage && stageToken ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  IVS Stage Player
                </h2>
                <IVSStagePlayer participantToken={stageToken} />
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  IVS Player
                </h2>
                <IVSPlayer streamUrl={playbackUrl} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
