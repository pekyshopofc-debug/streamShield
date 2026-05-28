'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Clock, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { VideoResult } from '@/types/video';
import { cn, formatDuration } from '@/lib/utils';

interface VideoCardProps {
  video: VideoResult;
  variant?: 'grid' | 'list';
  progress?: number;
}

export default function VideoCard({ video, variant = 'grid', progress }: VideoCardProps) {
  const [imgError, setImgError] = useState(false);
  const [favorited, setFavorited] = useState(false);

  if (variant === 'list') {
    return (
      <Link href={`/watch/${video.id}`} className="flex gap-4 p-3 rounded-xl hover:bg-bg-elevated transition-colors group">
        <div className="relative w-40 flex-shrink-0 aspect-video rounded-lg overflow-hidden">
          <ThumbnailImage video={video} imgError={imgError} onError={() => setImgError(true)} />
          <DurationBadge duration={video.duration} />
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h3 className="text-sm font-medium text-text line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-text-subtle mt-1">{video.channel}</p>
          <p className="text-xs text-text-subtle mt-0.5">{video.views} · {video.publishedAt}</p>
        </div>
      </Link>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-2 group"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Link href={`/watch/${video.id}`} className="relative aspect-video rounded-xl overflow-hidden block bg-bg-elevated">
        <ThumbnailImage video={video} imgError={imgError} onError={() => setImgError(true)} />
        <DurationBadge duration={video.duration} />

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100">
            <Play className="h-5 w-5 text-white fill-current ml-0.5" />
          </div>
        </div>

        {/* Progress bar */}
        {progress !== undefined && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-bg-border">
            <div className="h-full bg-primary" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
        )}
      </Link>

      <div className="flex gap-3 px-1">
        {/* Channel avatar */}
        <Link href={`/search?q=${encodeURIComponent(video.channel)}`} className="flex-shrink-0">
          <div className="h-9 w-9 rounded-full bg-bg-elevated border border-bg-border flex items-center justify-center text-sm font-semibold text-text-muted hover:border-primary/40 transition-colors overflow-hidden">
            {video.channelAvatar ? (
              <Image src={video.channelAvatar} alt={video.channel} width={36} height={36} className="object-cover" />
            ) : (
              video.channel.slice(0, 1).toUpperCase()
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/watch/${video.id}`}>
            <h3 className="text-sm font-medium text-text line-clamp-2 hover:text-primary transition-colors leading-snug">
              {video.title}
            </h3>
          </Link>
          <p className="text-xs text-text-subtle mt-1 truncate">{video.channel}</p>
          <p className="text-xs text-text-subtle mt-0.5">
            {video.views}
            {video.publishedAt && <> · {video.publishedAt}</>}
          </p>
        </div>

        <button
          onClick={(e) => { e.preventDefault(); setFavorited((f) => !f); }}
          className={cn(
            'flex-shrink-0 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100',
            favorited ? 'text-red-400 hover:text-red-300' : 'text-text-subtle hover:text-text',
          )}
        >
          <Heart className={cn('h-3.5 w-3.5', favorited && 'fill-current')} />
        </button>
      </div>
    </motion.div>
  );
}

function ThumbnailImage({
  video,
  imgError,
  onError,
}: {
  video: VideoResult;
  imgError: boolean;
  onError: () => void;
}) {
  if (imgError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-bg-elevated text-text-subtle">
        <Play className="h-8 w-8" />
      </div>
    );
  }
  return (
    <Image
      src={video.thumbnail}
      alt={video.title}
      fill
      className="object-cover transition-transform duration-300 group-hover:scale-105"
      onError={onError}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
    />
  );
}

function DurationBadge({ duration }: { duration: string }) {
  if (!duration) return null;
  return (
    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
      {duration}
    </div>
  );
}
