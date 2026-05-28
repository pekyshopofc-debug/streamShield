'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import VideoGrid from '@/components/search/VideoGrid';
import type { FavoriteEntry } from '@/types/user';
import type { VideoResult } from '@/types/video';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!user || !token) { setIsLoading(false); return; }

    fetch('/api/favorites', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        const mapped: VideoResult[] = (data.favorites ?? []).map((f: FavoriteEntry) => ({
          id: f.videoId,
          title: f.title,
          thumbnail: f.thumbnail,
          duration: '',
          durationSeconds: f.duration,
          channel: f.channel,
          channelId: '',
          views: '',
          publishedAt: '',
        }));
        setFavorites(mapped);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user, token]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Heart className="h-12 w-12 text-text-subtle" />
        <p className="text-text-subtle">Faça login para ver seus favoritos</p>
        <Link href="/login" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text flex items-center gap-2 mb-6">
        <Heart className="h-6 w-6 text-primary fill-primary" /> Favoritos
      </h1>
      <VideoGrid
        videos={favorites}
        isLoading={isLoading}
        emptyMessage="Nenhum vídeo favorito ainda"
      />
    </div>
  );
}
