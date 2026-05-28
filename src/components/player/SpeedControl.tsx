'use client';

import { RefObject, useState } from 'react';
import { Gauge } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { cn } from '@/lib/utils';

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

interface SpeedControlProps {
  videoRef: RefObject<HTMLVideoElement>;
}

export default function SpeedControl({ videoRef }: SpeedControlProps) {
  const [open, setOpen] = useState(false);
  const { playbackRate, setPlaybackRate } = usePlayerStore();

  const setSpeed = (speed: number) => {
    const v = videoRef.current;
    if (v) v.playbackRate = speed;
    setPlaybackRate(speed);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="p-2 text-white hover:text-primary transition-colors rounded-lg hover:bg-white/10 text-xs font-medium min-w-[2.5rem]"
        title="Velocidade"
      >
        {playbackRate === 1 ? <Gauge className="h-4 w-4" /> : `${playbackRate}×`}
      </button>

      {open && (
        <div
          className="absolute bottom-full right-0 mb-2 bg-bg-surface border border-bg-border rounded-xl shadow-2xl overflow-hidden z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            {SPEEDS.map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeed(speed)}
                className={cn(
                  'w-full px-4 py-2 text-sm text-left hover:bg-bg-elevated transition-colors',
                  speed === playbackRate ? 'text-primary font-medium' : 'text-text',
                )}
              >
                {speed === 1 ? 'Normal' : `${speed}×`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
