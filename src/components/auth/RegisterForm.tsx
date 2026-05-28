'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    try {
      await register(email, username, password);
    } catch (err: any) {
      setError(err.message ?? 'Erro ao criar conta');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-text">Criar conta</h1>
        <p className="text-text-subtle mt-1">Gratuito para sempre</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          leftIcon={<Mail className="h-4 w-4" />}
          required
        />

        <Input
          label="Nome de usuário"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="nomedeusuario"
          leftIcon={<User className="h-4 w-4" />}
          required
          minLength={3}
        />

        <Input
          label="Senha"
          type={showPass ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="text-text-subtle hover:text-text transition-colors"
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          required
        />

        {error && (
          <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" loading={isLoading} size="lg" className="mt-2 w-full">
          Criar conta
        </Button>

        <p className="text-center text-sm text-text-subtle">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
