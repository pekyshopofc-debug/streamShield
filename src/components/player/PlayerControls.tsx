'use client';

import { RefObject, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Volume1,
  Maximize, Minimize, PictureInPicture2, Settings,
  SkipForward, Captions,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { cn, formatDuration } from '@/lib/utils';
import ProgressBar from './ProgressBar';
import SpeedControl from './SpeedControl';
import QualitySelector from './QualitySelector';

interface PlayerControlsProps {
  videoRef: RefObject<HTMLVideoElement>;
  containerRef: RefObject<HTMLDivElement>;
  visible: boolean;
}

export default function PlayerControls({ videoRef, containerRef, visible }: PlayerControlsProps) {
  const {
    isPlaying, currentTime, duration, volume, muted, isFullscreen,
    setVolume, setMuted, subtitleTracks, activeSubtitle, setActiveSubtitle,
    sponsorBlockEnabled, setSponsorBlockEnabled,
  } = usePlayerStore();

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  }, [videoRef]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(!muted);
  }, [videoRef, muted, setMuted]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      const v = videoRef.current;
      if (!v) return;
      v.volume = val;
      v.muted = val === 0;
      setVolume(val);
      setMuted(val === 0);
    },
    [videoRef, setVolume, setMuted],
  );

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen();
  }, [containerRef]);

  const togglePip = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await v.requestPictureInPicture();
    }
  }, [videoRef]);

  const skip = useCallback(
    (seconds: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + seconds));
    },
    [videoRef],
  );

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 flex flex-col justify-end pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Controls bar */}
          <div className="relative z-10 flex flex-col gap-1 px-3 pb-3 pointer-events-auto">
            {/* Progress bar */}
            <ProgressBar videoRef={videoRef} />

            {/* Buttons row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="p-2 text-white hover:text-primary transition-colors rounded-lg hover:bg-white/10"
                  title={isPlaying ? 'Pausar (Space)' : 'Reproduzir (Space)'}
                >
                  {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                </button>

                {/* Skip 10s */}
                <button
                  onClick={() => skip(10)}
                  className="p-2 text-white hover:text-primary transition-colors rounded-lg hover:bg-white/10"
                  title="Avançar 10s (→)"
                >
                  <SkipForward className="h-4 w-4" />
                </button>

                {/* Volume */}
                <div className="flex items-center gap-1.5 group/vol">
                  <button
                    onClick={toggleMute}
                    className="p-2 text-white hover:text-primary transition-colors rounded-lg hover:bg-white/10"
                  >
                    <VolumeIcon className="h-4 w-4" />
                  </button>
                  <div className="w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-200">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={muted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 accent-primary cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {/* Time */}
                <span className="text-white text-sm font-mono select-none px-1">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* SponsorBlock toggle */}
                <button
                  onClick={() => setSponsorBlockEnabled(!sponsorBlockEnabled)}
                  className={cn(
                    'px-2 py-1 text-xs rounded font-medium transition-colors',
                    sponsorBlockEnabled
                      ? 'bg-green-600/30 text-green-400 border border-green-600/40'
                      : 'bg-white/10 text-white/50 border border-white/10',
                  )}
                  title="Toggle SponsorBlock"
                >
                  SB
                </button>

                {/* Subtitles */}
                {subtitleTracks.length > 0 && (
                  <button
                    onClick={() => setActiveSubtitle(activeSubtitle ? null : subtitleTracks[0].languageCode)}
                    className={cn(
                      'p-2 transition-colors rounded-lg hover:bg-white/10',
                      activeSubtitle ? 'text-primary' : 'text-white',
                    )}
                    title="Legendas"
                  >
                    <Captions className="h-4 w-4" />
                  </button>
                )}

                {/* Speed */}
                <SpeedControl videoRef={videoRef} />

                {/* Quality */}
                <QualitySelector />

                {/* PiP */}
                <button
                  onClick={togglePip}
                  className="p-2 text-white hover:text-primary transition-colors rounded-lg hover:bg-white/10"
                  title="Picture in Picture"
                >
                  <PictureInPicture2 className="h-4 w-4" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-white hover:text-primary transition-colors rounded-lg hover:bg-white/10"
                  title={isFullscreen ? 'Sair da tela cheia (F)' : 'Tela cheia (F)'}
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
