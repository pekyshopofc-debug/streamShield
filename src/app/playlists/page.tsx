'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ListVideo, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { formatRelativeTime } from '@/lib/utils';
import type { PlaylistEntry } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<PlaylistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const { user, token } = useAuthStore();
  const { addToast } = useUIStore();

  const load = async () => {
    if (!user || !token) { setIsLoading(false); return; }
    const res = await fetch('/api/playlists', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setPlaylists(data.playlists ?? []);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [user, token]);

  const createPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        setNewName('');
        addToast('Playlist criada!', 'success');
        load();
      }
    } finally {
      setCreating(false);
    }
  };

  const deletePlaylist = async (id: string) => {
    await fetch(`/api/playlists?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setPlaylists((p) => p.filter((pl) => pl.id !== id));
    addToast('Playlist removida', 'info');
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ListVideo className="h-12 w-12 text-text-subtle" />
        <p className="text-text-subtle">Faça login para gerenciar suas playlists</p>
        <Link href="/login" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text flex items-center gap-2 mb-6">
        <ListVideo className="h-6 w-6" /> Playlists
      </h1>

      {/* Create form */}
      <form onSubmit={createPlaylist} className="flex gap-2 mb-8">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome da nova playlist..."
          className="flex-1"
        />
        <Button type="submit" loading={creating}>
          <Plus className="h-4 w-4" />
          Criar
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-bg-elevated rounded-xl animate-pulse" />)}
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-16 text-text-subtle">
          <ListVideo className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>Nenhuma playlist criada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {playlists.map((pl) => (
            <div key={pl.id} className="flex items-center gap-4 p-4 rounded-xl bg-bg-elevated border border-bg-border group hover:border-bg-border/60 transition">
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ListVideo className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{pl.name}</p>
                <p className="text-xs text-text-subtle">
                  {pl.itemCount ?? 0} vídeos · criada {formatRelativeTime(pl.createdAt)}
                </p>
              </div>
              <button
                onClick={() => deletePlaylist(pl.id)}
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
