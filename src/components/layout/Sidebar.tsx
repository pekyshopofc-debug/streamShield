'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Search, History, Heart, ListVideo,
  Shield, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Início' },
  { href: '/search', icon: Search, label: 'Buscar' },
];

const USER_NAV_ITEMS = [
  { href: '/history', icon: History, label: 'Histórico' },
  { href: '/favorites', icon: Heart, label: 'Favoritos' },
  { href: '/playlists', icon: ListVideo, label: 'Playlists' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  return (
    <motion.aside
      className={cn(
        'hidden md:flex flex-col fixed left-0 top-16 bottom-0 z-30',
        'bg-bg border-r border-bg-border transition-none',
      )}
      animate={{ width: sidebarCollapsed ? 64 : 220 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 h-6 w-6 rounded-full bg-bg-elevated border border-bg-border flex items-center justify-center text-text-subtle hover:text-text transition-colors z-10"
      >
        {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      <div className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto overflow-x-hidden">
        {/* Main nav */}
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <SidebarLink
              key={href}
              href={href}
              icon={<Icon className="h-5 w-5 flex-shrink-0" />}
              label={label}
              active={pathname === href}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        {/* User nav (requires auth) */}
        {user && (
          <>
            <div className={cn('my-2 border-t border-bg-border', sidebarCollapsed && 'mx-2')} />
            <nav className="flex flex-col gap-0.5">
              {USER_NAV_ITEMS.map(({ href, icon: Icon, label }) => (
                <SidebarLink
                  key={href}
                  href={href}
                  icon={<Icon className="h-5 w-5 flex-shrink-0" />}
                  label={label}
                  active={pathname === href}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </nav>
          </>
        )}
      </div>

      {/* Shield branding */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-bg-border">
          <div className="flex items-center gap-2 text-text-subtle">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs">Sem anúncios</span>
          </div>
        </div>
      )}
    </motion.aside>
  );
}

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
}

function SidebarLink({ href, icon, label, active, collapsed }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150',
        'hover:bg-bg-elevated text-text-muted hover:text-text',
        active && 'bg-primary/10 text-primary hover:text-primary',
        collapsed && 'justify-center px-2',
      )}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && (
        <span className="text-sm font-medium truncate">{label}</span>
      )}
    </Link>
  );
}
