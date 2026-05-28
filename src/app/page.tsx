'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, Shield, Zap, SkipForward } from 'lucide-react';
import { useRouter } from 'next/navigation';
import VideoGrid from '@/components/search/VideoGrid';
import { cn } from '@/lib/utils';
import type { VideoResult } from '@/types/video';

const FEATURED_QUERIES = ['tecnologia', 'música', 'ciência', 'programação', 'design'];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuery, setActiveQuery] = useState(FEATURED_QUERIES[0]);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(activeQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setVideos(data.results ?? []);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [activeQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-bg-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <Shield className="h-3.5 w-3.5" />
            100% sem anúncios
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-text mb-4 leading-tight">
            YouTube sem anúncios,<br />
            <span className="text-primary">sem compromisso</span>
          </h1>

          <p className="text-text-muted text-lg mb-8 max-w-2xl mx-auto">
            Player moderno com SponsorBlock, qualidade adaptativa e experiência premium.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-subtle" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar vídeos, canais, tópicos..."
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-bg-elevated border border-bg-border text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 text-base"
              />
            </div>
            <button
              type="submit"
              className="h-12 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors"
            >
              Buscar
            </button>
          </form>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8 text-sm text-text-subtle">
            <Feature icon={<Shield className="h-3.5 w-3.5 text-green-400" />} label="Anti-anúncios" />
            <Feature icon={<SkipForward className="h-3.5 w-3.5 text-blue-400" />} label="SponsorBlock" />
            <Feature icon={<Zap className="h-3.5 w-3.5 text-yellow-400" />} label="Alta qualidade" />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 py-8 max-w-screen-2xl mx-auto">
        {/* Category tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          <span className="text-sm text-text-subtle mr-2 flex-shrink-0 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" /> Em destaque:
          </span>
          {FEATURED_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => setActiveQuery(q)}
              className={cn(
                'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150',
                activeQuery === q
                  ? 'bg-primary text-white'
                  : 'bg-bg-elevated border border-bg-border text-text-muted hover:text-text hover:border-bg-border/80',
              )}
            >
              {q}
            </button>
          ))}
        </div>

        <VideoGrid videos={videos} isLoading={isLoading} emptyMessage="Nenhum vídeo encontrado" />
      </section>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-elevated border border-bg-border">
      {icon}
      <span>{label}</span>
    </div>
  );
}
