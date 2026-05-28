'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { History, Trash2, Play, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { formatDuration, formatRelativeTime } from '@/lib/utils';
import type { HistoryEntry } from '@/types/user';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!user || !token) { setIsLoading(false); return; }

    fetch('/api/history', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setHistory(data.history ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user, token]);

  const removeEntry = async (videoId: string) => {
    await fetch(`/api/history?videoId=${videoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setHistory((h) => h.filter((e) => e.videoId !== videoId));
  };

  const clearAll = async () => {
    await fetch('/api/history', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setHistory([]);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <History className="h-12 w-12 text-text-subtle" />
        <p className="text-text-subtle">Faça login para ver seu histórico</p>
        <Link href="/login" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <History className="h-6 w-6" /> Histórico
        </h1>
        {history.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:bg-red-950/30 rounded-lg transition"
          >
            <Trash2 className="h-4 w-4" /> Limpar tudo
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-bg-elevated rounded-xl animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 text-text-subtle">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>Nenhum vídeo assistido ainda</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => (
            <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl bg-bg-elevated border border-bg-border group hover:border-bg-border/80 transition">
              <Link href={`/watch/${entry.videoId}`} className="relative w-28 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-bg-border">
                {entry.thumbnail && (
                  <Image src={entry.thumbnail} alt={entry.title} fill className="object-cover" />
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40">
                  <Play className="h-6 w-6 text-white fill-current" />
                </div>
                {entry.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-bg-border">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(100, (entry.progress / entry.duration) * 100)}%` }} />
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/watch/${entry.videoId}`} className="text-sm font-medium text-text hover:text-primary transition line-clamp-2">
                  {entry.title}
                </Link>
                <p className="text-xs text-text-subtle mt-1">{entry.channel}</p>
                <p className="text-xs text-text-subtle">{formatRelativeTime(entry.watchedAt)}</p>
              </div>

              <button
                onClick={() => removeEntry(entry.videoId)}
                className="p-2 text-text-subtle hover:text-red-400 opacity-0 group-hover:opacity-100 transition rounded-lg hover:bg-red-950/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
