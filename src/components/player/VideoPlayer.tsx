'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useSponsorBlock } from '@/hooks/useSponsorBlock';
import { useKeyboard } from '@/hooks/useKeyboard';
import PlayerControls from './PlayerControls';
import SponsorBlockOverlay from './SponsorBlockOverlay';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoId: string;
  streamUrl: string;
  audioUrl?: string;
  isDash?: boolean;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export default function VideoPlayer({
  videoId,
  streamUrl,
  audioUrl,
  isDash = false,
  autoPlay = true,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const hideControlsTimer = useRef<NodeJS.Timeout>();

  const {
    setPlaying, setCurrentTime, setDuration, setBuffering,
    setBuffered, setError, setFullscreen, setPip, error,
    isPlaying, volume, muted, playbackRate, sponsorBlockEnabled,
    addSkippedSegment,
  } = usePlayerStore();

  const { segments } = useSponsorBlock(videoId);

  const initPlayer = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setIsReady(false);
    setError(null);
    video.pause();

    // If separate audio/video streams, use MediaSource API to mux
    if (isDash && audioUrl && typeof window !== 'undefined' && 'MediaSource' in window) {
      await initMediaSource(video, streamUrl, audioUrl, autoPlay, setIsReady, setError, setBuffering);
      return;
    }

    // Simple single-stream playback
    video.src = streamUrl;
    video.load();

    const onMeta = () => {
      setIsReady(true);
      if (autoPlay) video.play().catch(() => {});
    };
    video.addEventListener('loadedmetadata', onMeta, { once: true });
    video.addEventListener('error', () => setError('Erro ao carregar stream'), { once: true });
  }, [streamUrl, audioUrl, isDash, autoPlay, setIsReady, setError, setBuffering]);

  useEffect(() => {
    initPlayer();
    return () => {
      const v = videoRef.current;
      if (v) { v.pause(); v.src = ''; }
    };
  }, [initPlayer]);

  // Sync volume/muted/playback rate
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
    v.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.playbackRate = playbackRate;
  }, [playbackRate]);

  // SponsorBlock auto-skip
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sponsorBlockEnabled || segments.length === 0) return;

    const handleTimeUpdate = () => {
      const t = video.currentTime;
      for (const seg of segments) {
        if (t >= seg.start && t < seg.end - 0.5) {
          video.currentTime = seg.end;
          addSkippedSegment(seg.id);
          break;
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [segments, sponsorBlockEnabled, addSkippedSegment]);

  // DOM event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlers: Record<string, () => void> = {
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      ended: () => { setPlaying(false); onEnded?.(); },
      timeupdate: () => setCurrentTime(video.currentTime),
      durationchange: () => setDuration(isFinite(video.duration) ? video.duration : 0),
      waiting: () => setBuffering(true),
      canplay: () => { setBuffering(false); setIsReady(true); },
      progress: () => {
        if (video.buffered.length > 0 && video.duration > 0) {
          setBuffered(video.buffered.end(video.buffered.length - 1) / video.duration);
        }
      },
      error: () => setError('Erro ao reproduzir. Tente recarregar.'),
      enterpictureinpicture: () => setPip(true),
      leavepictureinpicture: () => setPip(false),
    };

    for (const [ev, fn] of Object.entries(handlers)) video.addEventListener(ev, fn);
    return () => {
      for (const [ev, fn] of Object.entries(handlers)) video.removeEventListener(ev, fn);
    };
  }, [setPlaying, setCurrentTime, setDuration, setBuffering, setBuffered, setError, setPip, setIsReady, onEnded]);

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [setFullscreen]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => () => clearTimeout(hideControlsTimer.current), []);

  useKeyboard([
    { key: ' ', handler: () => { const v = videoRef.current; v?.paused ? v.play() : v?.pause(); } },
    { key: 'ArrowLeft', handler: () => { const v = videoRef.current; if (v) v.currentTime = Math.max(0, v.currentTime - 5); } },
    { key: 'ArrowRight', handler: () => { const v = videoRef.current; if (v) v.currentTime = Math.min(v.duration || 0, v.currentTime + 5); } },
    { key: 'ArrowUp', handler: () => { const v = videoRef.current; if (v) v.volume = Math.min(1, v.volume + 0.1); } },
    { key: 'ArrowDown', handler: () => { const v = videoRef.current; if (v) v.volume = Math.max(0, v.volume - 0.1); } },
    { key: 'm', handler: () => { const v = videoRef.current; if (v) v.muted = !v.muted; } },
    {
      key: 'f',
      handler: () => {
        const el = containerRef.current;
        if (!el) return;
        document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen();
      },
    },
  ]);

  return (
    <div
      ref={containerRef}
      className={cn('relative bg-black group select-none aspect-video w-full', isPlaying && !showControls ? 'cursor-none' : 'cursor-default')}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={() => { const v = videoRef.current; v?.paused ? v.play() : v?.pause(); showControlsTemporarily(); }}
      onDoubleClick={() => { const el = containerRef.current; document.fullscreenElement ? document.exitFullscreen() : el?.requestFullscreen(); }}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        preload="auto"
      />

      {segments.length > 0 && <SponsorBlockOverlay segments={segments} />}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
          <p className="text-red-400 text-center px-4">{error}</p>
          <button
            className="px-4 py-2 bg-primary/20 border border-primary/40 rounded-lg text-primary text-sm hover:bg-primary/30 transition"
            onClick={(e) => { e.stopPropagation(); initPlayer(); }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <BufferingOverlay />

      <PlayerControls
        videoRef={videoRef}
        containerRef={containerRef}
        visible={showControls || !isPlaying}
      />
    </div>
  );
}

function BufferingOverlay() {
  const { isBuffering } = usePlayerStore();
  if (!isBuffering) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="h-14 w-14 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

// Fetch a partial range of a URL
async function fetchRange(url: string, start: number, end: number): Promise<ArrayBuffer> {
  const res = await fetch(url, { headers: { Range: `bytes=${start}-${end}` } });
  return res.arrayBuffer();
}

// MSE-based muxer for separate video+audio streams
async function initMediaSource(
  video: HTMLVideoElement,
  videoUrl: string,
  audioUrl: string,
  autoPlay: boolean,
  setIsReady: (v: boolean) => void,
  setError: (e: string | null) => void,
  setBuffering: (v: boolean) => void,
) {
  const CHUNK = 512 * 1024;
  const TARGET_BUFFER = 30;
  const videoMime = 'video/mp4; codecs="avc1.640028"';
  const audioMime = 'audio/mp4; codecs="mp4a.40.2"';

  function fallback() {
    setError(null);
    const blobSrc = video.src;
    video.src = videoUrl;
    if (blobSrc.startsWith('blob:')) URL.revokeObjectURL(blobSrc);
    setBuffering(false);
    video.addEventListener('loadedmetadata', () => {
      setIsReady(true);
      if (autoPlay) video.play().catch(() => {});
    }, { once: true });
  }

  if (!MediaSource.isTypeSupported(videoMime) || !MediaSource.isTypeSupported(audioMime)) {
    fallback(); return;
  }

  const ms = new MediaSource();
  video.src = URL.createObjectURL(ms);
  setBuffering(true);

  try {
    await new Promise<void>((resolve, reject) => {
      ms.addEventListener('sourceopen', () => resolve(), { once: true });
      ms.addEventListener('error', () => reject(new Error('sourceopen failed')), { once: true });
    });
  } catch { fallback(); return; }

  let videoSB: SourceBuffer, audioSB: SourceBuffer;
  try {
    videoSB = ms.addSourceBuffer(videoMime);
    audioSB = ms.addSourceBuffer(audioMime);
  } catch { fallback(); return; }

  // Append one chunk; properly cleans up listeners regardless of outcome
  const appendOne = async (sb: SourceBuffer, url: string, offset: number, size: number): Promise<number> => {
    if (sb.updating) {
      await new Promise<void>((r) => sb.addEventListener('updateend', () => r(), { once: true }));
    }
    const data = await fetchRange(url, offset, offset + size - 1);
    if (data.byteLength === 0) return offset;
    await new Promise<void>((resolve, reject) => {
      const onEnd = () => { sb.removeEventListener('error', onErr); resolve(); };
      const onErr = () => { sb.removeEventListener('updateend', onEnd); reject(new Error('sb error')); };
      sb.addEventListener('updateend', onEnd, { once: true });
      sb.addEventListener('error', onErr, { once: true });
      try {
        sb.appendBuffer(data);
      } catch (e) {
        sb.removeEventListener('updateend', onEnd);
        sb.removeEventListener('error', onErr);
        reject(e);
      }
    });
    return offset + data.byteLength;
  };

  let videoOffset = 0;
  let audioOffset = 0;

  try {
    [videoOffset, audioOffset] = await Promise.all([
      appendOne(videoSB, videoUrl, 0, CHUNK),
      appendOne(audioSB, audioUrl, 0, CHUNK),
    ]);
  } catch { fallback(); return; }

  setBuffering(false);
  setIsReady(true);
  if (autoPlay) video.play().catch(() => {});

  // Progressive loading — guarded by isAppending flag to prevent concurrent appends
  let isAppending = false;

  video.addEventListener('timeupdate', async () => {
    if (isAppending || ms.readyState !== 'open') return;
    const bufferedEnd = videoSB.buffered.length > 0 ? videoSB.buffered.end(videoSB.buffered.length - 1) : 0;
    if (bufferedEnd - video.currentTime >= TARGET_BUFFER) return;

    isAppending = true;
    const prevVideo = videoOffset;
    const prevAudio = audioOffset;
    try {
      [videoOffset, audioOffset] = await Promise.all([
        appendOne(videoSB, videoUrl, videoOffset, CHUNK),
        appendOne(audioSB, audioUrl, audioOffset, CHUNK),
      ]);
      // No progress = stream exhausted
      if (videoOffset === prevVideo && audioOffset === prevAudio) {
        if (ms.readyState === 'open') ms.endOfStream();
      }
    } catch {
      if (ms.readyState === 'open') try { ms.endOfStream(); } catch {}
    } finally {
      isAppending = false;
    }
  });
}
