import { useState, useEffect } from "react";
import { constructPlaybackUrl, isStageArn } from "@/utils/ivs";

interface UseIVSFormResult {
  playbackUrl: string;
  error: string;
  isStage: boolean;
  chatRoomArn: string;
}

export const useIVSForm = (): UseIVSFormResult => {
  const [playbackUrl, setPlaybackUrl] = useState("");
  const [error, setError] = useState("");
  const [isStage, setIsStage] = useState(false);
  const [chatRoomArn, setChatRoomArn] = useState("");

  // 環境変数からデフォルト値を読み込み
  useEffect(() => {
    const defaultStageArn = process.env.NEXT_PUBLIC_IVS_STAGE_ARN || "";
    const defaultChatRoomArn = process.env.NEXT_PUBLIC_IVS_CHAT_ROOM_ARN || "";
    
    // デフォルトのステージARNを設定
    if (defaultStageArn) {
      if (isStageArn(defaultStageArn)) {
        if (!process.env.NEXT_PUBLIC_IVS_PARTICIPANT_TOKEN) {
          setError("IVS Stage requires a participant token. Set NEXT_PUBLIC_IVS_PARTICIPANT_TOKEN in your .env.local file.");
        } else {
          setIsStage(true);
        }
      } else {
        // 通常のプレイバックURLの場合
        const url = constructPlaybackUrl(defaultStageArn);
        setPlaybackUrl(url);
      }
    }
    
    // チャットルームARNを設定
    setChatRoomArn(defaultChatRoomArn);
  }, []);

  return {
    playbackUrl,
    error,
    isStage,
    chatRoomArn,
  };
};