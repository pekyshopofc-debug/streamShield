import { execFile } from 'child_process';
import { promisify } from 'util';
import { getCache, setCache } from '@/lib/cache';
import type { StreamInfo } from '@/types/video';
import { getInnertube } from './innertube';

const execFileAsync = promisify(execFile);

const YTDLP_BIN = process.env.YTDLP_PATH ?? 'yt-dlp';

export interface QualityOption {
  itag: number;
  label: string;
  height: number;
  fps: number;
  mimeType: string;
  formatId: string;
}

// yt-dlp: most reliable, handles YouTube's 2024 PoToken requirements
async function getStreamViaYtdlp(videoId: string, quality: 'best' | '720' | '480' | '360' = 'best'): Promise<StreamInfo> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  // Prefer H.264 (avc1) — AV1/VP9 break MediaSource when codec is declared as avc1
  const formatSelector = quality === 'best'
    ? 'bestvideo[height<=1080][vcodec^=avc1][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
    : `bestvideo[height<=${quality}][vcodec^=avc1][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${quality}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${quality}]/best`;

  const args = [
    '--no-playlist',
    '--no-warnings',
    '-f', formatSelector,
    // Use Android VR client — bypasses bot detection on server IPs
    '--get-url',
    '--get-format',
    url,
  ];

  const cookie = process.env.YOUTUBE_COOKIE;
  if (cookie) {
    args.push('--cookies', cookie);
  }

  let stdout: string;
  try {
    const result = await execFileAsync(YTDLP_BIN, args, { timeout: 20_000 });
    stdout = result.stdout.trim();
  } catch (err: any) {
    throw new Error(`yt-dlp failed: ${err.stderr?.slice(0, 200) ?? err.message}`);
  }

  const lines = stdout.split('\n').filter(Boolean);

  // yt-dlp may return 2 URLs (video + audio) for best quality DASH
  if (lines.length >= 2 && lines[0].startsWith('http') && lines[1].startsWith('http')) {
    // Video+audio separate streams — return video URL and note it's DASH
    return {
      url: lines[0], // video stream
      audioUrl: lines[1], // audio stream
      mimeType: 'video/mp4',
      quality: quality === 'best' ? 'auto' : `${quality}p`,
      itag: 0,
      isDash: true,
    };
  }

  const streamUrl = lines[0];
  if (!streamUrl?.startsWith('http')) {
    throw new Error('yt-dlp returned no valid URL');
  }

  return {
    url: streamUrl,
    mimeType: 'video/mp4',
    quality: quality === 'best' ? 'auto' : `${quality}p`,
    itag: 0,
    isDash: false,
  };
}

export async function getStreamInfo(
  videoId: string,
  preferredItag?: number,
): Promise<StreamInfo> {
  // yt-dlp provides the most reliable stream extraction
  // No caching — URLs expire quickly and each request should be fresh
  return getStreamViaYtdlp(videoId);
}

export async function getAvailableQualities(videoId: string): Promise<QualityOption[]> {
  const cacheKey = `qualities:${videoId}`;
  const cached = getCache<QualityOption[]>(cacheKey);
  if (cached) return cached;

  // Use youtubei.js just for listing formats (metadata only, no stream access)
  try {
    const yt = await getInnertube();
    const info = await yt.getInfo(videoId);
    const streamingData = info.streaming_data;
    const seen = new Set<number>();
    const qualities: QualityOption[] = [];

    for (const f of [...(streamingData?.formats ?? []), ...(streamingData?.adaptive_formats ?? [])] as any[]) {
      const mime = f.mime_type ?? '';
      if (!mime.startsWith('video/')) continue;
      if (seen.has(f.itag)) continue;
      seen.add(f.itag);
      qualities.push({
        itag: f.itag,
        label: f.quality_label ?? f.quality ?? 'unknown',
        height: f.height ?? 0,
        fps: f.fps ?? 30,
        mimeType: mime,
        formatId: f.itag.toString(),
      });
    }

    qualities.sort((a, b) => b.height - a.height);
    setCache(cacheKey, qualities, 600);
    return qualities;
  } catch {
    // Fallback: return common quality presets
    return [
      { itag: 22, label: '720p', height: 720, fps: 30, mimeType: 'video/mp4', formatId: '22' },
      { itag: 18, label: '360p', height: 360, fps: 30, mimeType: 'video/mp4', formatId: '18' },
    ];
  }
}

export async function getSubtitleVtt(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.youtube.com/' },
  });
  if (!res.ok) throw new Error('Failed to fetch subtitles');
  return res.text();
}
