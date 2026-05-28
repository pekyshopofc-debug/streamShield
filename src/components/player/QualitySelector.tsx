'use client';

import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { cn } from '@/lib/utils';

export default function QualitySelector() {
  const [open, setOpen] = useState(false);
  const [qualities, setQualities] = useState<Array<{ itag: number; label: string; height: number }>>([]);
  const { videoId, quality, setQuality, setStreamUrl, setError } = usePlayerStore();

  useEffect(() => {
    if (!videoId) return;
    fetch(`/api/video/${videoId}`)
      .then((r) => r.json())
      .then((data) => {
        const formats = (data.formats ?? []).filter((f: any) => f.type === 'video+audio');
        setQualities(formats.map((f: any) => ({ itag: f.itag, label: f.qualityLabel, height: f.height ?? 0 })));
      })
      .catch(() => {});
  }, [videoId]);

  const selectQuality = async (itag: number, label: string) => {
    setOpen(false);
    if (!videoId) return;
    try {
      const res = await fetch(`/api/stream/${videoId}?itag=${itag}`);
      const data = await res.json();
      if (data.proxyUrl) {
        setStreamUrl(data.proxyUrl);
        setQuality(label);
      }
    } catch {
      setError('Falha ao trocar qualidade');
    }
  };

  if (qualities.length < 2) return null;

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="p-2 text-white hover:text-primary transition-colors rounded-lg hover:bg-white/10"
        title="Qualidade"
      >
        <Settings className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="absolute bottom-full right-0 mb-2 bg-bg-surface border border-bg-border rounded-xl shadow-2xl overflow-hidden z-50 min-w-[120px]"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="px-3 py-2 text-xs text-text-subtle border-b border-bg-border">Qualidade</p>
          {qualities.map((q) => (
            <button
              key={q.itag}
              onClick={() => selectQuality(q.itag, q.label)}
              className={cn(
                'w-full px-4 py-2 text-sm text-left hover:bg-bg-elevated transition-colors',
                q.label === quality ? 'text-primary font-medium' : 'text-text',
              )}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
