'use client';

import { motion } from 'framer-motion';
import VideoCard from './VideoCard';
import { VideoGridSkeleton } from '@/components/ui/Skeleton';
import type { VideoResult } from '@/types/video';

interface VideoGridProps {
  videos: VideoResult[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
};

export default function VideoGrid({ videos, isLoading, error, emptyMessage }: VideoGridProps) {
  if (isLoading && videos.length === 0) return <VideoGridSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!isLoading && videos.length === 0 && emptyMessage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-text-subtle text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {videos.map((video) => (
        <motion.div key={video.id} variants={itemVariants}>
          <VideoCard video={video} />
        </motion.div>
      ))}
    </motion.div>
  );
}
