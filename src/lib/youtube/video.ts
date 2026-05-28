import { getInnertube } from './innertube';
import { getCache, setCache } from '@/lib/cache';
import type { VideoInfo, VideoResult, SubtitleTrack, VideoFormat } from '@/types/video';

function extractThumbnail(thumbnails: Array<{ url: string; width?: number; height?: number }>): string {
  if (!thumbnails?.length) return '/placeholder.jpg';
  const sorted = [...thumbnails].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  return sorted[0].url;
}

function parseDuration(text?: string): number {
  if (!text) return 0;
  const parts = text.split(':').map(Number).reverse();
  return parts.reduce((acc, val, i) => acc + val * Math.pow(60, i), 0);
}

function formatViews(n?: number): string {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export async function getVideoInfo(videoId: string): Promise<VideoInfo> {
  const cacheKey = `video:${videoId}`;
  const cached = getCache<VideoInfo>(cacheKey);
  if (cached) return cached;

  const yt = await getInnertube();
  const info = await yt.getInfo(videoId);
  const basic = info.basic_info;

  const subtitleTracks: SubtitleTrack[] = [];
  try {
    const captions = info.captions?.caption_tracks ?? [];
    for (const t of captions) {
      subtitleTracks.push({
        languageCode: t.language_code ?? 'und',
        name: t.name?.text ?? t.language_code ?? 'Unknown',
        url: t.base_url ?? '',
        isDefault: (t as any).is_default ?? false,
      });
    }
  } catch {}

  const formats: VideoFormat[] = [];
  try {
    const streamingData = info.streaming_data;
    const allFormats = [
      ...(streamingData?.formats ?? []),
      ...(streamingData?.adaptive_formats ?? []),
    ];
    for (const f of allFormats) {
      const mime = f.mime_type ?? '';
      const isVideo = mime.startsWith('video/');
      const isAudio = mime.startsWith('audio/');
      const hasBoth = (f as any).has_video && (f as any).has_audio;
      formats.push({
        itag: f.itag ?? 0,
        quality: (f as any).quality ?? 'unknown',
        qualityLabel: (f as any).quality_label ?? (f as any).audio_quality ?? '',
        mimeType: mime,
        bitrate: f.average_bitrate ?? f.bitrate ?? 0,
        width: (f as any).width,
        height: (f as any).height,
        fps: (f as any).fps,
        type: hasBoth ? 'video+audio' : isVideo ? 'video' : 'audio',
      });
    }
  } catch {}

  const related: VideoResult[] = [];
  try {
    const feed: any[] = (info as any).watch_next_feed ?? [];
    for (const item of feed) {
      if (related.length >= 20) break;
      const v = item as any;

      // New format: LockupView (YouTube 2024+)
      if (v.type === 'LockupView' && v.content_type === 'VIDEO') {
        const id: string = v.content_id ?? v.on_tap_endpoint?.payload?.videoId ?? '';
        if (!id) continue;
        const rows: any[] = v.metadata?.metadata?.metadata_rows ?? [];
        const channel = rows[0]?.metadata_parts?.[0]?.text?.text ?? '';
        const viewsText = rows[1]?.metadata_parts?.[0]?.text?.text ?? '';
        const publishedAt = rows[1]?.metadata_parts?.[1]?.text?.text ?? '';
        related.push({
          id,
          title: v.metadata?.title?.text ?? '',
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          duration: '',
          durationSeconds: 0,
          channel,
          channelId: '',
          views: viewsText,
          publishedAt,
        });
        continue;
      }

      // Legacy format: CompactVideo
      if (v.type === 'CompactVideo') {
        const id: string = v.id ?? '';
        if (!id) continue;
        related.push({
          id,
          title: v.title?.toString() ?? '',
          thumbnail: extractThumbnail(v.thumbnails ?? []),
          duration: v.duration?.text ?? '',
          durationSeconds: v.duration?.seconds ?? parseDuration(v.duration?.text),
          channel: v.author?.name ?? '',
          channelId: v.author?.id ?? '',
          views: v.view_count?.toString() ?? '',
          publishedAt: v.published?.toString() ?? '',
        });
      }
    }
  } catch {}

  const result: VideoInfo = {
    id: videoId,
    title: basic.title ?? 'Sem título',
    thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    duration: '',
    durationSeconds: basic.duration ?? 0,
    channel: basic.author ?? 'Desconhecido',
    channelId: basic.channel_id ?? '',
    views: formatViews(basic.view_count),
    publishedAt: '',
    description: basic.short_description?.slice(0, 200),
    fullDescription: basic.short_description ?? '',
    likeCount: formatViews((basic as any).like_count),
    isLive: basic.is_live ?? false,
    keywords: basic.keywords ?? [],
    related,
    subtitleTracks,
    formats,
  };

  setCache(cacheKey, result, 600);
  return result;
}
