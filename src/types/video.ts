export interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  durationSeconds: number;
  channel: string;
  channelId: string;
  channelAvatar?: string;
  views: string;
  publishedAt: string;
  description?: string;
}

export interface VideoInfo extends VideoResult {
  fullDescription: string;
  likeCount?: string;
  isLive: boolean;
  keywords?: string[];
  related: VideoResult[];
  chapters?: Chapter[];
  subtitleTracks: SubtitleTrack[];
  formats: VideoFormat[];
}

export interface VideoFormat {
  itag: number;
  quality: string;
  qualityLabel: string;
  mimeType: string;
  bitrate: number;
  width?: number;
  height?: number;
  fps?: number;
  type: 'video+audio' | 'video' | 'audio';
}

export interface SubtitleTrack {
  languageCode: string;
  name: string;
  url: string;
  isDefault: boolean;
}

export interface Chapter {
  title: string;
  startSeconds: number;
  thumbnailUrl: string;
}

export interface StreamInfo {
  url: string;
  audioUrl?: string;
  mimeType: string;
  quality: string;
  itag: number;
  contentLength?: string;
  isDash: boolean;
  dashManifest?: string;
}
