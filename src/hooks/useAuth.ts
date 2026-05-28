'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export function useAuth() {
  const { user, token, isLoading, setUser, setToken, setLoading, logout: clearAuth } = useAuthStore();
  const { addToast } = useUIStore();
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          // Surface pending/rejected status to the UI
          if (data.status === 'pending') {
            addToast('Conta aguardando aprovação.', 'info');
          } else if (data.status === 'rejected') {
            addToast('Acesso recusado pelo administrador.', 'error');
          } else {
            addToast(data.error ?? 'Erro ao entrar', 'error');
          }
          throw new Error(data.error ?? 'Login failed');
        }
        setUser(data.user);
        setToken(data.token);
        addToast(`Bem-vindo, ${data.user.username}!`, 'success');
        router.push('/');
      } catch (err: any) {
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setUser, setToken, addToast, router],
  );

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Erro ao criar conta');

        // pending = user was created but needs approval
        if (data.pending) {
          addToast('Cadastro realizado! Aguarde a aprovação.', 'success');
          // Store minimal user info for the pending page
          setUser({ id: '', email, username, role: 'user', status: 'pending', createdAt: new Date().toISOString() });
          setToken(null);
          router.push('/pending');
          return;
        }

        // First user (admin) — logged in immediately
        setUser(data.user);
        setToken(data.token);
        addToast('Conta criada com sucesso!', 'success');
        router.push('/');
      } catch (err: any) {
        addToast(err.message, 'error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setUser, setToken, addToast, router],
  );

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    clearAuth();
    addToast('Até logo!', 'info');
    router.push('/login');
  }, [clearAuth, addToast, router]);

  return { user, token, isLoading, isAuthenticated: !!user, login, register, logout };
}
