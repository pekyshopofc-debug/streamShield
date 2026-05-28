'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Shield, User, LogOut, Settings, History, Heart, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function Header() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-bg/95 backdrop-blur-md border-b border-bg-border">
      <div className="h-full flex items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="h-8 w-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-text text-lg hidden sm:block">
            Stream<span className="text-primary">Shield</span>
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar vídeos..."
              className={cn(
                'w-full h-10 pl-4 pr-12 rounded-full',
                'bg-bg-elevated border border-bg-border text-text placeholder:text-text-subtle',
                'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40',
                'transition-all duration-200',
              )}
            />
            <button
              type="submit"
              className="absolute right-1 h-8 w-8 flex items-center justify-center rounded-full bg-bg-border hover:bg-primary/20 text-text-muted hover:text-primary transition-all"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Auth section */}
        <div className="flex-shrink-0 relative" ref={menuRef}>
          {user ? (
            <>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="h-9 w-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold text-sm hover:bg-primary/30 transition"
              >
                {user.username.slice(0, 1).toUpperCase()}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-11 w-56 bg-bg-surface border border-bg-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-bg-border">
                    <p className="text-sm font-medium text-text truncate">{user.username}</p>
                    <p className="text-xs text-text-subtle truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <MenuLink href="/history" icon={<History className="h-4 w-4" />} label="Histórico" onClick={() => setMenuOpen(false)} />
                    <MenuLink href="/favorites" icon={<Heart className="h-4 w-4" />} label="Favoritos" onClick={() => setMenuOpen(false)} />
                    <MenuLink href="/playlists" icon={<Settings className="h-4 w-4" />} label="Playlists" onClick={() => setMenuOpen(false)} />
                    {user?.role === 'admin' && (
                      <MenuLink href="/admin" icon={<ShieldCheck className="h-4 w-4 text-primary" />} label="Painel Admin" onClick={() => setMenuOpen(false)} />
                    )}
                  </div>
                  <div className="border-t border-bg-border py-1">
                    <button
                      onClick={() => { setMenuOpen(false); logout(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-bg-elevated transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-bg-elevated transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
