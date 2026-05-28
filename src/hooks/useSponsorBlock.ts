'use client';

import { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import type { ParsedSegment } from '@/types/sponsorblock';

export function useSponsorBlock(videoId: string | null) {
  const { sponsorBlockEnabled, setSegments, segments } = usePlayerStore();

  useEffect(() => {
    if (!videoId || !sponsorBlockEnabled) {
      setSegments([]);
      return;
    }

    const controller = new AbortController();

    fetch(`/api/sponsorblock/${videoId}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.segments) setSegments(data.segments);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [videoId, sponsorBlockEnabled, setSegments]);

  const checkSegment = (currentTime: number): ParsedSegment | null => {
    if (!sponsorBlockEnabled) return null;
    return segments.find((s) => currentTime >= s.start && currentTime < s.end) ?? null;
  };

  return { segments, checkSegment };
}
