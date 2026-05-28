'use client';

import { useEffect, useState } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';

type Platform = 'android' | 'ios' | null;

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return null;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

export default function InstallPrompt() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const p = detectPlatform();
    setPlatform(p);

    const dismissed = sessionStorage.getItem('pwa-dismissed');
    if (dismissed) return;

    if (p === 'ios') {
      // Show iOS instructions after a short delay
      const t = setTimeout(() => setShowIosModal(true), 2500);
      return () => clearTimeout(t);
    }

    if (p === 'android') {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowBanner(true);
      };
      window.addEventListener('beforeinstallprompt', handler as any);
      return () => window.removeEventListener('beforeinstallprompt', handler as any);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('pwa-dismissed', '1');
    setShowBanner(false);
    setShowIosModal(false);
  };

  const installAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') sessionStorage.setItem('pwa-dismissed', '1');
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner && !showIosModal) return null;

  // Android install banner
  if (showBanner) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe animate-slide-up">
        <div className="bg-bg-elevated border border-bg-border rounded-2xl shadow-2xl p-4 flex items-center gap-4 max-w-lg mx-auto">
          <img src="/icons/icon-192.png" alt="StreamShield" className="h-12 w-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text text-sm">Instalar StreamShield</p>
            <p className="text-text-subtle text-xs mt-0.5">Acesso rápido sem anúncios, direto da tela inicial</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={installAndroid}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary rounded-lg text-white text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              Instalar
            </button>
            <button onClick={dismiss} className="p-2 text-text-subtle hover:text-text transition rounded-lg">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // iOS install modal
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-safe">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative bg-bg-elevated border border-bg-border rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-slide-up">
        <button onClick={dismiss} className="absolute top-4 right-4 p-1.5 text-text-subtle hover:text-text transition rounded-lg">
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <img src="/icons/icon-192.png" alt="StreamShield" className="h-12 w-12 rounded-xl" />
          <div>
            <p className="font-semibold text-text">Instalar StreamShield</p>
            <p className="text-text-subtle text-xs">Adicionar à tela inicial</p>
          </div>
        </div>

        <p className="text-text-muted text-sm mb-5">
          Instale o app para ter acesso rápido sem anúncios direto da sua tela inicial.
        </p>

        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">1</span>
            <div className="flex-1">
              <p className="text-sm text-text">Toque no botão <strong>Compartilhar</strong></p>
              <div className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 bg-bg-border rounded-lg w-fit">
                <Share className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-text-muted">Ícone de caixa com seta para cima</span>
              </div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">2</span>
            <div className="flex-1">
              <p className="text-sm text-text">Role e toque em <strong>"Adicionar à Tela de Início"</strong></p>
              <div className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 bg-bg-border rounded-lg w-fit">
                <PlusSquare className="h-4 w-4 text-text-muted" />
                <span className="text-xs text-text-muted">Adicionar à Tela de Início</span>
              </div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">3</span>
            <p className="text-sm text-text mt-0.5">Confirme tocando em <strong>"Adicionar"</strong></p>
          </li>
        </ol>

        <button
          onClick={dismiss}
          className="mt-6 w-full py-2.5 text-sm text-text-subtle border border-bg-border rounded-xl hover:bg-bg-border transition"
        >
          Agora não
        </button>
      </div>
    </div>
  );
}
