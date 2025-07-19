"use client";

import IVSStagePlayer from "@/components/IVSStagePlayer";
import { useIVSForm } from "@/hooks/useIVSForm";

export default function IVSFormIVSStagePlayer() {
  const { playbackUrl, error, isStage } = useIVSForm();

  // エラーがある場合はエラーメッセージを表示
  if (error) {
    return (
      <div className="max-w-2xl mx-auto mb-4">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  // プレイバックURLまたはステージが設定されていない場合は何も表示しない
  if (!playbackUrl && !isStage) {
    return null;
  }

  // ステージモードでパーティシパントトークンが設定されている場合
  if (isStage && process.env.NEXT_PUBLIC_IVS_PARTICIPANT_TOKEN) {
    return (
      <div className="w-full">
        <IVSStagePlayer
          participantToken={process.env.NEXT_PUBLIC_IVS_PARTICIPANT_TOKEN}
        />
      </div>
    );
  }

  return null;
}
