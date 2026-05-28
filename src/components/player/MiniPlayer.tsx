'use client';

import { useRef } from 'react';
import { X, Maximize2, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePlayerStore } from '@/store/playerStore';

export default function MiniPlayer() {
  const { isMiniPlayer, setMiniPlayer, videoId, isPlaying } = usePlayerStore();
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!isMiniPlayer || !videoId) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 right-4 z-40 w-72 rounded-xl overflow-hidden shadow-2xl border border-bg-border bg-black"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        drag
        dragMomentum={false}
      >
        <div className="relative aspect-video bg-black">
          <div className="absolute inset-0 flex items-center justify-center text-text-subtle text-sm">
            Mini Player ativo
          </div>
          <div className="absolute inset-0 flex items-end justify-between p-2 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex gap-1">
              <button
                className="p-1.5 bg-black/50 rounded-lg text-white hover:bg-black/70 transition"
                onClick={() => {
                  const v = videoRef.current;
                  if (v) v.paused ? v.play() : v.pause();
                }}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
              </button>
            </div>
            <div className="flex gap-1">
              <Link href={`/watch/${videoId}`}>
                <button
                  className="p-1.5 bg-black/50 rounded-lg text-white hover:bg-black/70 transition"
                  onClick={() => setMiniPlayer(false)}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </Link>
              <button
                className="p-1.5 bg-black/50 rounded-lg text-white hover:bg-black/70 transition"
                onClick={() => setMiniPlayer(false)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
