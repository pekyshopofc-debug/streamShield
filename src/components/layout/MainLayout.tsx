'use client';

import { useUIStore } from '@/store/uiStore';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <main
      className="flex-1 min-w-0 transition-[margin] duration-300"
      style={{ marginLeft: sidebarCollapsed ? 64 : 220 }}
    >
      {children}
    </main>
  );
}
