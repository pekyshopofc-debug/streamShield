'use client';

import { useState, useCallback, useRef } from 'react';
import type { VideoResult } from '@/types/video';

export function useSearch() {
  const [results, setResults] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQuery] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (q: string, append = false) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setQuery(q);

    try {
      const params = new URLSearchParams({ q });
      const res = await fetch(`/api/search?${params}`, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error('Erro ao buscar vídeos');
      const data = await res.json();

      setResults(append ? (prev) => [...prev, ...(data.results ?? [])] : (data.results ?? []));
      setHasMore(data.hasMore ?? false);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message ?? 'Erro desconhecido');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setQuery('');
    setError(null);
    setHasMore(false);
  }, []);

  return { results, isLoading, error, hasMore, query, search, clear };
}
