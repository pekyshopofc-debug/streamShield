'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();
  const [isMd, setIsMd] = useState(false);

  useEffect(() => {
    const check = () => setIsMd(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <main
      className="flex-1 min-w-0 transition-[margin] duration-300 pb-16 md:pb-0"
      style={{ marginLeft: isMd ? (sidebarCollapsed ? 64 : 220) : 0 }}
    >
      {children}
    </main>
  );
}
