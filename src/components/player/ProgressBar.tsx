'use client';

import { RefObject, useRef, useState, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration, cn } from '@/lib/utils';

interface ProgressBarProps {
  videoRef: RefObject<HTMLVideoElement>;
}

export default function ProgressBar({ videoRef }: ProgressBarProps) {
  const { currentTime, duration, buffered, segments } = usePlayerStore();
  const barRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [hoverX, setHoverX] = useState(0);
  const [hoverTime, setHoverTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = buffered * 100;

  const getTimeFromEvent = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const bar = barRef.current;
      if (!bar || !duration) return 0;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration],
  );

  const seek = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const v = videoRef.current;
      if (!v) return;
      const time = getTimeFromEvent(e);
      v.currentTime = time;
    },
    [videoRef, getTimeFromEvent],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const bar = barRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      setHoverX(e.clientX - rect.left);
      setHoverTime(getTimeFromEvent(e));
      if (isDragging) seek(e);
    },
    [getTimeFromEvent, isDragging, seek],
  );

  return (
    <div
      className="relative py-2 group/progress cursor-pointer"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setIsDragging(false); }}
      onMouseDown={(e) => { setIsDragging(true); seek(e); }}
      onMouseUp={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onClick={seek}
    >
      {/* Track */}
      <div
        ref={barRef}
        className={cn(
          'relative w-full rounded-full overflow-hidden transition-all duration-150',
          hovering || isDragging ? 'h-1.5' : 'h-1',
        )}
        style={{ background: 'rgba(255,255,255,0.15)' }}
      >
        {/* Buffered */}
        <div
          className="absolute inset-y-0 left-0 bg-white/20 rounded-full"
          style={{ width: `${bufferedPct}%` }}
        />

        {/* SponsorBlock segments */}
        {segments.map((seg) => {
          if (!duration) return null;
          const left = (seg.start / duration) * 100;
          const width = ((seg.end - seg.start) / duration) * 100;
          return (
            <div
              key={seg.id}
              className="absolute inset-y-0 opacity-70 rounded-sm"
              style={{ left: `${left}%`, width: `${width}%`, background: seg.color }}
              title={seg.label}
            />
          );
        })}

        {/* Progress */}
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded-full transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Thumb */}
      <div
        className={cn(
          'absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow-lg -ml-2',
          'transition-all duration-150',
          hovering || isDragging ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
        )}
        style={{ left: `${progress}%` }}
      />

      {/* Hover tooltip */}
      {hovering && duration > 0 && (
        <div
          className="absolute -top-8 px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-xs rounded pointer-events-none whitespace-nowrap -translate-x-1/2"
          style={{ left: hoverX }}
        >
          {formatDuration(hoverTime)}
        </div>
      )}
    </div>
  );
}
