"use client";

import IVSChatRoom from "@/components/IVSChatRoom";
import IVSFormIVSStagePlayer from "@/components/IVSFormIVSStagePlayer";

export default function Home() {
  return (
    <div className="h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          AWS IVS Stage Viewer　|　(タイトル入れる)
        </h1>

        <div className="w-full flex gap-4">
          <div className="w-2/3">
            <IVSFormIVSStagePlayer />
          </div>
          <div className="w-1/3 h-96">
            <IVSChatRoom />
          </div>
        </div>
        <div className="w-full h-96 bg-gray-200 rounded-lg p-4">
          このあと実装するよーー
        </div>
      </div>
    </div>
  );
}
