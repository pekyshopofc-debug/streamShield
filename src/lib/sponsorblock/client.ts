import { getCache, setCache } from '@/lib/cache';
import type { SponsorSegment, ParsedSegment, SponsorCategory, CATEGORY_META } from '@/types/sponsorblock';
import { CATEGORY_META as META } from '@/types/sponsorblock';

const SPONSORBLOCK_API = 'https://sponsor.ajay.app/api';

const DEFAULT_CATEGORIES: SponsorCategory[] = [
  'sponsor',
  'selfpromo',
  'interaction',
  'intro',
  'outro',
  'preview',
  'music_offtopic',
];

export async function getSegments(
  videoId: string,
  categories: SponsorCategory[] = DEFAULT_CATEGORIES,
): Promise<ParsedSegment[]> {
  const cacheKey = `sponsorblock:${videoId}`;
  const cached = getCache<ParsedSegment[]>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    videoID: videoId,
    categories: JSON.stringify(categories),
    actionTypes: JSON.stringify(['skip', 'mute']),
  });

  try {
    const res = await fetch(`${SPONSORBLOCK_API}/skipSegments?${params}`, {
      headers: { 'User-Agent': 'StreamShield/1.0' },
      signal: AbortSignal.timeout(5000),
    });

    if (res.status === 404) {
      setCache(cacheKey, [], 3600);
      return [];
    }

    if (!res.ok) {
      throw new Error(`SponsorBlock API error: ${res.status}`);
    }

    const raw: SponsorSegment[] = await res.json();

    const segments: ParsedSegment[] = raw
      .filter((s) => s.actionType === 'skip' && s.segment.length === 2)
      .map((s) => ({
        id: s.UUID,
        category: s.category,
        start: s.segment[0],
        end: s.segment[1],
        label: META[s.category]?.label ?? s.category,
        color: META[s.category]?.color ?? '#ffffff',
      }));

    setCache(cacheKey, segments, 3600);
    return segments;
  } catch (err: any) {
    if (err?.name === 'TimeoutError') return [];
    throw err;
  }
}
