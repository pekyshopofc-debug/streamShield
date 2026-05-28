'use client';

import { Clock, LogOut, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function PendingPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
            <Clock className="h-10 w-10 text-yellow-400" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-text">Aguardando aprovação</h1>
          <p className="mt-2 text-text-subtle">
            Olá{user?.username ? `, ${user.username}` : ''}! Seu cadastro foi recebido.
          </p>
        </div>

        <div className="bg-bg-elevated border border-bg-border rounded-2xl p-6 text-left space-y-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text">Acesso controlado</p>
              <p className="text-xs text-text-subtle mt-0.5">
                O StreamShield é um serviço privado. Um administrador precisa aprovar sua conta antes que você possa acessar o conteúdo.
              </p>
            </div>
          </div>
          <div className="border-t border-bg-border pt-4">
            <p className="text-xs text-text-subtle">
              Esta página será atualizada automaticamente quando sua conta for aprovada. Você pode fechar e voltar mais tarde.
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl border border-bg-border text-text-subtle hover:text-text hover:border-bg-elevated text-sm transition"
        >
          <LogOut className="h-4 w-4" />
          Sair da conta
        </button>
      </div>
    </div>
  );
}
