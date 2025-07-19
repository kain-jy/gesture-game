import { useEffect, useRef, useState, useCallback } from "react";

interface UseIVSStageParams {
  participantToken: string;
  onError?: (error: string) => void;
  onConnectionStateChange?: (state: unknown) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useIVSStage = ({
  participantToken,
  onError,
  onConnectionStateChange,
}: UseIVSStageParams) => {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stageRef = useRef<any | null>(null);
  const videoElementsRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const streamTypeRef = useRef<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createVideoElement = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    participant: any,
    mediaStream: MediaStream
  ): HTMLVideoElement => {
    const videoElement = document.createElement("video");
    videoElement.srcObject = mediaStream;
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.controls = true;
    videoElement.className = "w-full h-auto bg-black rounded-lg shadow-lg";
    videoElement.id = `video-${participant.id}`;
    return videoElement;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStreamsAdded = useCallback((
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    participant: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    streams: any[]
  ) => {
    console.log("Streams added:", participant.id, streams);

    const videoTracks: MediaStreamTrack[] = [];
    const audioTracks: MediaStreamTrack[] = [];

    streams.forEach((stream) => {
      if (stream.mediaStreamTrack) {
        // StreamTypeの値を正しく比較（動的インポート後の値を使用）
        if (stream.streamType === streamTypeRef.current?.VIDEO) {
          videoTracks.push(stream.mediaStreamTrack);
        } else if (stream.streamType === streamTypeRef.current?.AUDIO) {
          audioTracks.push(stream.mediaStreamTrack);
        }
      }
    });

    console.log("Video tracks:", videoTracks.length, "Audio tracks:", audioTracks.length);

    if (videoTracks.length > 0 && videoContainerRef.current) {
      const allTracks = [...videoTracks, ...audioTracks];
      const mediaStream = new MediaStream(allTracks);

      const existingVideo = videoElementsRef.current.get(participant.id);
      if (existingVideo) {
        existingVideo.remove();
      }

      const videoElement = createVideoElement(participant, mediaStream);
      videoElementsRef.current.set(participant.id, videoElement);

      if (videoElementsRef.current.size === 1) {
        videoContainerRef.current.innerHTML = "";
      }

      videoContainerRef.current.appendChild(videoElement);
      console.log("Video element added to container");
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleParticipantLeft = useCallback((participant: any) => {
    console.log("Participant left:", participant.id);

    const videoElement = videoElementsRef.current.get(participant.id);
    if (videoElement) {
      videoElement.remove();
      videoElementsRef.current.delete(participant.id);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!participantToken || !videoContainerRef.current || typeof window === 'undefined') {
      console.log("Cannot connect:", { participantToken: !!participantToken, videoContainer: !!videoContainerRef.current, window: typeof window });
      return;
    }

    if (isConnected || isLoading) {
      console.log("Already connected or connecting");
      return;
    }

    console.log("Starting stage connection with token:", participantToken);

    try {
      setIsLoading(true);
      setError("");
      
      const {
        Stage,
        StageEvents,
        SubscribeType,
        StreamType,
        StageConnectionState,
      } = await import("amazon-ivs-web-broadcast");

      // StreamTypeの参照を保存
      streamTypeRef.current = StreamType;

      console.log("IVS Web Broadcast imported successfully", { StreamType });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const strategy: any = {
        shouldPublishParticipant: () => {
          return false;
        },
        shouldSubscribeToParticipant: () => {
          return SubscribeType.AUDIO_VIDEO;
        },
        stageStreamsToPublish: () => {
          return [];
        },
      };

      const stage = new Stage(participantToken, strategy);
      console.log("Stage instance created");

      stage.on(
        StageEvents.STAGE_CONNECTION_STATE_CHANGED,
        (state: unknown) => {
          const connected = state === StageConnectionState.CONNECTED;
          setIsConnected(connected);
          setIsLoading(false);
          onConnectionStateChange?.(state);
          console.log("Stage connection state:", state, "Connected:", connected);
        }
      );

      stage.on(
        StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED,
        handleStreamsAdded
      );

      stage.on(StageEvents.STAGE_PARTICIPANT_LEFT, handleParticipantLeft);

      stage.on(StageEvents.ERROR, (err: Error) => {
        console.error("Stage error:", err);
        const errorMessage = err.message || "Stage connection error";
        setError(errorMessage);
        setIsLoading(false);
        onError?.(errorMessage);
      });

      console.log("Joining stage...");
      await stage.join();
      stageRef.current = stage;
      console.log("Stage joined successfully");
    } catch (err) {
      console.error("Failed to connect to stage:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect to stage";
      setError(errorMessage);
      setIsLoading(false);
      onError?.(errorMessage);
    }
  }, [participantToken, isConnected, isLoading, onError, onConnectionStateChange, handleStreamsAdded, handleParticipantLeft]);

  const disconnect = useCallback(() => {
    if (stageRef.current) {
      stageRef.current.leave();
      stageRef.current = null;
    }

    const currentVideoElements = videoElementsRef.current;
    currentVideoElements.forEach((videoElement) => {
      videoElement.remove();
    });
    currentVideoElements.clear();

    setIsConnected(false);
    setIsLoading(false);
    setError("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    videoContainerRef,
    isConnected,
    error,
    isLoading,
    connect,
    disconnect,
  };
};