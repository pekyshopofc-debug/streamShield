import { getInnertube } from './innertube';
import { getCache, setCache } from '@/lib/cache';
import type { VideoResult } from '@/types/video';

function extractThumbnail(thumbnails: Array<{ url: string; width?: number; height?: number }>): string {
  if (!thumbnails || thumbnails.length === 0) return '/placeholder.jpg';
  const sorted = [...thumbnails].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  return sorted[0].url;
}

function parseDuration(text?: string): number {
  if (!text) return 0;
  const parts = text.split(':').map(Number).reverse();
  return parts.reduce((acc, val, i) => acc + val * Math.pow(60, i), 0);
}

export async function searchVideos(query: string, continuation?: string): Promise<{
  results: VideoResult[];
  hasMore: boolean;
  nextToken?: string;
}> {
  const cacheKey = `search:${query}:${continuation ?? 'first'}`;
  const cached = getCache<{ results: VideoResult[]; hasMore: boolean; nextToken?: string }>(cacheKey);
  if (cached) return cached;

  const yt = await getInnertube();

  let search;
  try {
    search = await yt.search(query, { type: 'video' });
  } catch {
    return { results: [], hasMore: false };
  }

  const results: VideoResult[] = [];

  for (const item of search.results ?? []) {
    if (item.type !== 'Video') continue;
    const v = item as any;
    results.push({
      id: v.id ?? '',
      title: v.title?.text ?? 'Sem título',
      thumbnail: extractThumbnail(v.thumbnails ?? []),
      duration: v.duration?.text ?? '0:00',
      durationSeconds: parseDuration(v.duration?.text),
      channel: v.author?.name ?? v.channel?.name ?? 'Desconhecido',
      channelId: v.author?.id ?? v.channel?.id ?? '',
      channelAvatar: extractThumbnail(v.author?.thumbnails ?? []),
      views: v.view_count?.text ?? '0 visualizações',
      publishedAt: v.published?.text ?? '',
      description: v.description_snippet?.text ?? '',
    });
  }

  const result = {
    results,
    hasMore: !!search.has_continuation,
    nextToken: undefined,
  };

  setCache(cacheKey, result, 300);
  return result;
}
