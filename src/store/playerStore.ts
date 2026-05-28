import { create } from 'zustand';
import type { ParsedSegment } from '@/types/sponsorblock';
import type { SubtitleTrack } from '@/types/video';

interface PlayerState {
  videoId: string | null;
  streamUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  quality: string;
  isFullscreen: boolean;
  isPip: boolean;
  isMiniPlayer: boolean;
  isBuffering: boolean;
  buffered: number;
  error: string | null;
  sponsorBlockEnabled: boolean;
  segments: ParsedSegment[];
  skippedSegments: string[];
  subtitleTracks: SubtitleTrack[];
  activeSubtitle: string | null;
  autoplay: boolean;

  setVideoId: (id: string | null) => void;
  setStreamUrl: (url: string | null) => void;
  setPlaying: (v: boolean) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setVolume: (v: number) => void;
  setMuted: (v: boolean) => void;
  setPlaybackRate: (r: number) => void;
  setQuality: (q: string) => void;
  setFullscreen: (v: boolean) => void;
  setPip: (v: boolean) => void;
  setMiniPlayer: (v: boolean) => void;
  setBuffering: (v: boolean) => void;
  setBuffered: (v: number) => void;
  setError: (e: string | null) => void;
  setSponsorBlockEnabled: (v: boolean) => void;
  setSegments: (s: ParsedSegment[]) => void;
  addSkippedSegment: (id: string) => void;
  setSubtitleTracks: (t: SubtitleTrack[]) => void;
  setActiveSubtitle: (lang: string | null) => void;
  setAutoplay: (v: boolean) => void;
  reset: () => void;
}

const defaults = {
  videoId: null,
  streamUrl: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false,
  playbackRate: 1,
  quality: 'auto',
  isFullscreen: false,
  isPip: false,
  isMiniPlayer: false,
  isBuffering: false,
  buffered: 0,
  error: null,
  sponsorBlockEnabled: true,
  segments: [],
  skippedSegments: [],
  subtitleTracks: [],
  activeSubtitle: null,
  autoplay: true,
};

export const usePlayerStore = create<PlayerState>((set) => ({
  ...defaults,
  setVideoId: (videoId) => set({ videoId }),
  setStreamUrl: (streamUrl) => set({ streamUrl }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume, muted: volume === 0 }),
  setMuted: (muted) => set({ muted }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  setQuality: (quality) => set({ quality }),
  setFullscreen: (isFullscreen) => set({ isFullscreen }),
  setPip: (isPip) => set({ isPip }),
  setMiniPlayer: (isMiniPlayer) => set({ isMiniPlayer }),
  setBuffering: (isBuffering) => set({ isBuffering }),
  setBuffered: (buffered) => set({ buffered }),
  setError: (error) => set({ error }),
  setSponsorBlockEnabled: (sponsorBlockEnabled) => set({ sponsorBlockEnabled }),
  setSegments: (segments) => set({ segments }),
  addSkippedSegment: (id) => set((s) => ({ skippedSegments: [...s.skippedSegments, id] })),
  setSubtitleTracks: (subtitleTracks) => set({ subtitleTracks }),
  setActiveSubtitle: (activeSubtitle) => set({ activeSubtitle }),
  setAutoplay: (autoplay) => set({ autoplay }),
  reset: () => set(defaults),
}));
