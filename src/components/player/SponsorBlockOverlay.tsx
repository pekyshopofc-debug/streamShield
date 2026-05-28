'use client';

import { usePlayerStore } from '@/store/playerStore';
import type { ParsedSegment } from '@/types/sponsorblock';

interface SponsorBlockOverlayProps {
  segments: ParsedSegment[];
}

export default function SponsorBlockOverlay({ segments }: SponsorBlockOverlayProps) {
  const { currentTime, duration } = usePlayerStore();

  const activeSegment = segments.find(
    (s) => currentTime >= s.start && currentTime < s.end,
  );

  if (!activeSegment) return null;

  const remaining = Math.max(0, activeSegment.end - currentTime).toFixed(1);

  return (
    <div className="absolute top-4 right-4 z-20 pointer-events-none animate-fade-in">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm text-sm font-medium text-white"
        style={{
          borderColor: `${activeSegment.color}40`,
          background: `${activeSegment.color}20`,
        }}
      >
        <span
          className="h-2 w-2 rounded-full flex-shrink-0"
          style={{ background: activeSegment.color }}
        />
        <span>{activeSegment.label}</span>
        <span className="text-white/60 text-xs">{remaining}s</span>
      </div>
    </div>
  );
}
