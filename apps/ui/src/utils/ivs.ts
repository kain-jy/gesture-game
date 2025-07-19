export interface ChannelArnMatch {
  region: string;
  account: string;
  channelId: string;
}

export interface StageArnMatch {
  region: string;
  account: string;
  stageId: string;
}

export const parseChannelArn = (arn: string): ChannelArnMatch | null => {
  const channelArnPattern = /^arn:aws:ivs:([^:]+):([^:]+):channel\/(.+)$/;
  const match = arn.match(channelArnPattern);
  
  if (!match) return null;
  
  return {
    region: match[1],
    account: match[2],
    channelId: match[3],
  };
};

export const parseStageArn = (arn: string): StageArnMatch | null => {
  const stageArnPattern = /^arn:aws:ivs:([^:]+):([^:]+):stage\/(.+)$/;
  const match = arn.match(stageArnPattern);
  
  if (!match) return null;
  
  return {
    region: match[1],
    account: match[2],
    stageId: match[3],
  };
};

export const isPlaybackUrl = (input: string): boolean => {
  return input.startsWith("https://");
};

export const isStageArn = (input: string): boolean => {
  return input.includes(":stage/");
};

export const constructChannelPlaybackUrl = (channelId: string): string => {
  return `https://${channelId}.playback.live-video.net/api/video/v1/index.m3u8`;
};

export const constructStagePlaybackUrl = (
  stageId: string,
  region: string,
  participantToken: string
): string => {
  return `https://${stageId}.${region}.playback.live-video.net/api/video/v1/?token=${participantToken}`;
};

export const constructPlaybackUrl = (
  input: string,
  participantToken?: string
): string => {
  if (isPlaybackUrl(input)) {
    return input;
  }

  const channelMatch = parseChannelArn(input);
  if (channelMatch) {
    return constructChannelPlaybackUrl(channelMatch.channelId);
  }

  const stageMatch = parseStageArn(input);
  if (stageMatch && participantToken) {
    return constructStagePlaybackUrl(
      stageMatch.stageId,
      stageMatch.region,
      participantToken
    );
  }

  return input;
};