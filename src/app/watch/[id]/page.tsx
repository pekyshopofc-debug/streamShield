'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ThumbsUp, Share2, Heart, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import VideoPlayer from '@/components/player/VideoPlayer';
import VideoCard from '@/components/search/VideoCard';
import { VideoCardSkeleton } from '@/components/ui/Skeleton';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import type { VideoInfo } from '@/types/video';

interface StreamData {
  proxyUrl: string;
  audioProxyUrl?: string;
  mimeType: string;
  quality: string;
  isDash: boolean;
}

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const { setVideoId, setSubtitleTracks } = usePlayerStore();
  const { user, token } = useAuthStore();
  const { addToast } = useUIStore();

  const loadVideo = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    try {
      const [infoRes, streamRes] = await Promise.all([
        fetch(`/api/video/${id}`),
        fetch(`/api/stream/${id}`),
      ]);

      if (!infoRes.ok) throw new Error('Vídeo não disponível');
      const info: VideoInfo = await infoRes.json();
      setVideoInfo(info);
      setVideoId(id);
      setSubtitleTracks(info.subtitleTracks ?? []);

      if (!streamRes.ok) {
        const errData = await streamRes.json();
        throw new Error(errData.error ?? 'Stream não disponível');
      }
      const sd: StreamData = await streamRes.json();
      setStreamData(sd);

      if (user && token) {
        fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            videoId: id,
            title: info.title,
            thumbnail: info.thumbnail,
            channel: info.channel,
            duration: info.durationSeconds,
          }),
        }).catch(() => {});
      }
    } catch (err: any) {
      setError(err.message ?? 'Erro ao carregar vídeo');
    } finally {
      setIsLoading(false);
    }
  }, [id, user, token, setVideoId, setSubtitleTracks]);

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  const toggleFavorite = async () => {
    if (!user) { addToast('Faça login para favoritar', 'info'); return; }
    if (!videoInfo) return;
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          videoId: id,
          title: videoInfo.title,
          thumbnail: videoInfo.thumbnail,
          channel: videoInfo.channel,
          duration: videoInfo.durationSeconds,
        }),
      });
      const data = await res.json();
      setFavorited(data.favorited);
      addToast(data.favorited ? 'Adicionado aos favoritos' : 'Removido dos favoritos', 'success');
    } catch {
      addToast('Erro ao atualizar favoritos', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="aspect-video bg-bg-elevated rounded-2xl animate-pulse" />
            <div className="mt-4 space-y-3">
              <div className="h-6 bg-bg-elevated rounded-lg animate-pulse w-3/4" />
              <div className="h-4 bg-bg-elevated rounded animate-pulse w-1/2" />
            </div>
          </div>
          <div className="lg:w-96 flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => <VideoCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !videoInfo || !streamData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-400 text-lg text-center px-4">{error ?? 'Vídeo não disponível'}</p>
        <button
          onClick={loadVideo}
          className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition text-sm"
        >
          Tentar novamente
        </button>
        <Link href="/" className="text-text-subtle hover:text-text text-sm transition">
          Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <VideoPlayer
              videoId={id}
              streamUrl={streamData.proxyUrl}
              audioUrl={streamData.audioProxyUrl}
              isDash={streamData.isDash}
              autoPlay
              onEnded={() => {
                if (videoInfo.related.length > 0) {
                  router.push(`/watch/${videoInfo.related[0].id}`);
                }
              }}
            />
          </div>

          {/* Video info */}
          <div className="mt-4 space-y-3">
            <h1 className="text-xl font-bold text-text leading-snug">{videoInfo.title}</h1>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-bg-elevated border border-bg-border flex items-center justify-center text-sm font-semibold text-text-muted overflow-hidden">
                  {videoInfo.channelAvatar ? (
                    <Image src={videoInfo.channelAvatar} alt={videoInfo.channel} width={40} height={40} className="object-cover" />
                  ) : (
                    videoInfo.channel.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">{videoInfo.channel}</p>
                  <div className="flex items-center gap-2 text-xs text-text-subtle">
                    <Eye className="h-3 w-3" />
                    <span>{videoInfo.views} visualizações</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {videoInfo.likeCount && (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-bg-elevated border border-bg-border text-sm text-text-muted">
                    <ThumbsUp className="h-4 w-4" />
                    {videoInfo.likeCount}
                  </div>
                )}

                <button
                  onClick={toggleFavorite}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm transition-all',
                    favorited
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-bg-elevated border-bg-border text-text-muted hover:text-text',
                  )}
                >
                  <Heart className={cn('h-4 w-4', favorited && 'fill-current')} />
                  {favorited ? 'Favoritado' : 'Favoritar'}
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    addToast('Link copiado!', 'success');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-bg-elevated border border-bg-border text-text-muted hover:text-text text-sm transition"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Compartilhar</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-bg-elevated rounded-xl border border-bg-border">
              <div className={cn('text-sm text-text-muted leading-relaxed', !descExpanded && 'line-clamp-3')}>
                {videoInfo.fullDescription || videoInfo.description || 'Sem descrição disponível.'}
              </div>
              {(videoInfo.fullDescription?.length ?? 0) > 200 && (
                <button
                  onClick={() => setDescExpanded((e) => !e)}
                  className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-medium transition"
                >
                  {descExpanded ? <><ChevronUp className="h-3 w-3" />Mostrar menos</> : <><ChevronDown className="h-3 w-3" />Mostrar mais</>}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Related */}
        <div className="lg:w-96 flex-shrink-0">
          <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wide">
            Próximos vídeos
          </h2>
          <div className="flex flex-col gap-2">
            {videoInfo.related.slice(0, 15).map((video) => (
              <VideoCard key={video.id} video={video} variant="list" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
