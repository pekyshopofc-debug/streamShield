'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, History, Heart, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/',          icon: Home,    label: 'Início'    },
  { href: '/search',    icon: Search,  label: 'Buscar'    },
  { href: '/history',   icon: History, label: 'Histórico', auth: true },
  { href: '/favorites', icon: Heart,   label: 'Favoritos', auth: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Hide on auth pages
  if (!user || pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/pending')) return null;

  const items = NAV.filter((item) => !item.auth || user);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg border-t border-bg-border safe-area-bottom">
      <div className="flex items-stretch h-14">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                active ? 'text-primary' : 'text-text-subtle',
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'fill-primary/20')} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        {/* Account shortcut */}
        <Link
          href="/watch"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-text-subtle"
        >
          <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-primary text-[10px] font-bold">
              {user.username[0].toUpperCase()}
            </span>
          </div>
          <span className="text-[10px] font-medium">Conta</span>
        </Link>
      </div>
    </nav>
  );
}
