import { useState } from "react";
import { constructPlaybackUrl, isStageArn } from "@/utils/ivs";

interface UseIVSFormResult {
  streamArn: string;
  playbackUrl: string;
  error: string;
  isStage: boolean;
  stageToken: string;
  setStreamArn: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const useIVSForm = (): UseIVSFormResult => {
  const [streamArn, setStreamArn] = useState("");
  const [playbackUrl, setPlaybackUrl] = useState("");
  const [error, setError] = useState("");
  const [isStage, setIsStage] = useState(false);
  const [stageToken, setStageToken] = useState("");

  const validateStageInput = (input: string): string | null => {
    if (isStageArn(input) && !process.env.NEXT_PUBLIC_IVS_PARTICIPANT_TOKEN) {
      return "IVS Stage requires a participant token. Set NEXT_PUBLIC_IVS_PARTICIPANT_TOKEN in your .env.local file.";
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!streamArn) {
      setError("Please enter a stream ARN or URL.");
      return;
    }

    const trimmedInput = streamArn.trim();
    const validationError = validateStageInput(trimmedInput);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    const url = constructPlaybackUrl(
      trimmedInput,
      process.env.NEXT_PUBLIC_IVS_PARTICIPANT_TOKEN
    );

    if (isStageArn(trimmedInput) && process.env.NEXT_PUBLIC_IVS_PARTICIPANT_TOKEN) {
      setIsStage(true);
      setStageToken(process.env.NEXT_PUBLIC_IVS_PARTICIPANT_TOKEN);
    } else {
      setIsStage(false);
      setPlaybackUrl(url);
    }
  };

  return {
    streamArn,
    playbackUrl,
    error,
    isStage,
    stageToken,
    setStreamArn,
    handleSubmit,
  };
};