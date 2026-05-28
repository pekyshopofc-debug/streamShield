'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Check, X, Trash2, Users, Clock, ShieldCheck, UserX, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
  createdAt: string;
  approvedAt: string | null;
}

interface Stats { pending: number; approved: number; rejected: number }

type Tab = 'pending' | 'approved' | 'rejected' | 'all';

export default function AdminPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0 });
  const [tab, setTab] = useState<Tab>('pending');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchUsers = useCallback(async (status: Tab) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.users ?? []);
      setStats(data.stats ?? { pending: 0, approved: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role !== 'admin') { router.replace('/'); return; }
    fetchUsers(tab);
  }, [user, router, tab, fetchUsers]);

  const act = async (id: string, action: 'approve' | 'reject' | 'delete') => {
    setActing(id);
    try {
      if (action === 'delete') {
        await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await fetch(`/api/admin/users/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action }),
        });
      }
      fetchUsers(tab);
    } finally {
      setActing(null);
    }
  };

  const tabs: { id: Tab; label: string; count?: number; icon: typeof Clock }[] = [
    { id: 'pending', label: 'Pendentes', count: stats.pending, icon: Clock },
    { id: 'approved', label: 'Aprovados', count: stats.approved, icon: ShieldCheck },
    { id: 'rejected', label: 'Recusados', count: stats.rejected, icon: UserX },
    { id: 'all', label: 'Todos', icon: Users },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Painel Admin</h1>
          <p className="text-text-subtle text-sm mt-1">Gerencie os acessos ao StreamShield</p>
        </div>
        <button
          onClick={() => fetchUsers(tab)}
          className="p-2 rounded-lg text-text-subtle hover:text-text hover:bg-bg-elevated transition"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Pendentes', value: stats.pending, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
          { label: 'Aprovados', value: stats.approved, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          { label: 'Recusados', value: stats.rejected, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
        ].map((s) => (
          <div key={s.label} className={cn('rounded-xl border p-4 text-center', s.bg)}>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-text-subtle mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-bg-elevated rounded-xl p-1 border border-bg-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition',
              tab === t.id ? 'bg-bg-border text-text' : 'text-text-subtle hover:text-text',
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={cn('text-xs px-1.5 py-0.5 rounded-full', tab === t.id ? 'bg-primary/20 text-primary' : 'bg-bg-border')}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* User list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-bg-elevated rounded-xl animate-pulse border border-bg-border" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-text-subtle">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nenhum usuário {tab !== 'all' ? `com status "${tab}"` : ''}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-4 p-4 bg-bg-elevated rounded-xl border border-bg-border">
              <div className="h-9 w-9 rounded-full bg-bg-border flex items-center justify-center text-sm font-bold text-text-muted flex-shrink-0">
                {u.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-text text-sm">{u.username}</p>
                  {u.role === 'admin' && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">admin</span>
                  )}
                  <span className={cn('text-xs px-1.5 py-0.5 rounded border',
                    u.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                    u.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                  )}>
                    {u.status === 'approved' ? 'aprovado' : u.status === 'rejected' ? 'recusado' : 'pendente'}
                  </span>
                </div>
                <p className="text-xs text-text-subtle truncate">{u.email}</p>
                <p className="text-xs text-text-subtle">
                  Cadastro: {new Date(u.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {u.role !== 'admin' && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {u.status !== 'approved' && (
                    <button
                      onClick={() => act(u.id, 'approve')}
                      disabled={acting === u.id}
                      className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition disabled:opacity-50"
                      title="Aprovar"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  {u.status !== 'rejected' && (
                    <button
                      onClick={() => act(u.id, 'reject')}
                      disabled={acting === u.id}
                      className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition disabled:opacity-50"
                      title="Recusar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => act(u.id, 'delete')}
                    disabled={acting === u.id}
                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
