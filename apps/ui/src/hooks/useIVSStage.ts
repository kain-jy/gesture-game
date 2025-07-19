import { useEffect, useRef, useState } from "react";
import {
  Stage,
  StageEvents,
  SubscribeType,
  StreamType,
  StageConnectionState,
  StageParticipantInfo,
  StageStream,
  StageStrategy,
  LocalStageStream,
} from "amazon-ivs-web-broadcast";

interface UseIVSStageParams {
  participantToken: string;
  onError?: (error: string) => void;
  onConnectionStateChange?: (state: StageConnectionState) => void;
}

export const useIVSStage = ({
  participantToken,
  onError,
  onConnectionStateChange,
}: UseIVSStageParams) => {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>("");
  const stageRef = useRef<Stage | null>(null);
  const videoElementsRef = useRef<Map<string, HTMLVideoElement>>(new Map());

  const createVideoElement = (
    participant: StageParticipantInfo,
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

  const handleStreamsAdded = (
    participant: StageParticipantInfo,
    streams: StageStream[]
  ) => {
    console.log("Streams added:", participant.id, streams);

    const videoTracks: MediaStreamTrack[] = [];
    const audioTracks: MediaStreamTrack[] = [];

    streams.forEach((stream) => {
      if (stream.mediaStreamTrack) {
        if (stream.streamType === StreamType.VIDEO) {
          videoTracks.push(stream.mediaStreamTrack);
        } else if (stream.streamType === StreamType.AUDIO) {
          audioTracks.push(stream.mediaStreamTrack);
        }
      }
    });

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
    }
  };

  const handleParticipantLeft = (participant: StageParticipantInfo) => {
    console.log("Participant left:", participant.id);

    const videoElement = videoElementsRef.current.get(participant.id);
    if (videoElement) {
      videoElement.remove();
      videoElementsRef.current.delete(participant.id);
    }
  };

  useEffect(() => {
    if (!participantToken || !videoContainerRef.current) return;

    const connectToStage = async () => {
      try {
        const strategy: StageStrategy = {
          shouldPublishParticipant: (_participant: StageParticipantInfo) => {
            return false;
          },
          shouldSubscribeToParticipant: (_participant: StageParticipantInfo) => {
            return SubscribeType.AUDIO_VIDEO;
          },
          stageStreamsToPublish: () => {
            return [] as LocalStageStream[];
          },
        };

        const stage = new Stage(participantToken, strategy);

        stage.on(
          StageEvents.STAGE_CONNECTION_STATE_CHANGED,
          (state: StageConnectionState) => {
            const connected = state === StageConnectionState.CONNECTED;
            setIsConnected(connected);
            onConnectionStateChange?.(state);
            console.log("Stage connection state:", state);
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
          onError?.(errorMessage);
        });

        await stage.join();
        stageRef.current = stage;
      } catch (err) {
        console.error("Failed to connect to stage:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to connect to stage";
        setError(errorMessage);
        onError?.(errorMessage);
      }
    };

    connectToStage();

    return () => {
      if (stageRef.current) {
        stageRef.current.leave();
        stageRef.current = null;
      }

      videoElementsRef.current.forEach((videoElement) => {
        videoElement.remove();
      });
      videoElementsRef.current.clear();
    };
  }, [participantToken, onError, onConnectionStateChange]);

  return {
    videoContainerRef,
    isConnected,
    error,
  };
};