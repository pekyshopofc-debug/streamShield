import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MainLayout from '@/components/layout/MainLayout';
import MiniPlayer from '@/components/player/MiniPlayer';
import { ToastContainer } from '@/components/ui/Toast';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: { default: 'StreamShield', template: '%s | StreamShield' },
  description: 'Assistir YouTube sem anúncios. Player moderno com SponsorBlock integrado.',
  keywords: ['youtube', 'player', 'sem anúncios', 'adblock', 'sponsorblock'],
  authors: [{ name: 'StreamShield' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'StreamShield',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-bg text-text min-h-screen`}>
        <Header />
        <div className="flex pt-16">
          <Sidebar />
          <MainLayout>{children}</MainLayout>
        </div>
        <MiniPlayer />
        <ToastContainer />
        <InstallPrompt />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
