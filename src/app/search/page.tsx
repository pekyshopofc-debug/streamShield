'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import VideoGrid from '@/components/search/VideoGrid';
import { useSearch } from '@/hooks/useSearch';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const { results, isLoading, error, search } = useSearch();

  useEffect(() => {
    if (q) search(q);
  }, [q, search]);

  return (
    <div className="px-4 py-8 max-w-screen-2xl mx-auto">
      {q ? (
        <>
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-text flex items-center gap-2">
              <Search className="h-5 w-5 text-text-subtle" />
              Resultados para:{' '}
              <span className="text-primary">&ldquo;{q}&rdquo;</span>
            </h1>
            {!isLoading && results.length > 0 && (
              <p className="text-sm text-text-subtle mt-1">{results.length} vídeos encontrados</p>
            )}
          </div>
          <VideoGrid
            videos={results}
            isLoading={isLoading}
            error={error}
            emptyMessage={`Nenhum resultado para "${q}"`}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Search className="h-12 w-12 text-text-subtle" />
          <p className="text-text-subtle text-lg">Digite algo para buscar vídeos</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
