import { NextRequest, NextResponse } from 'next/server';
import type { AuthPayload } from '@/types/user';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/pending',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/health',
  '/manifest.json',
  '/sw.js',
  '/icons',
  '/favicon.svg',
  '/_next',
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

// Edge Runtime doesn't support jsonwebtoken (Node.js crypto).
// Decode only — signature verification happens in the API routes.
function decodeToken(token: string): AuthPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(
      part.length + (4 - (part.length % 4)) % 4, '=',
    );
    return JSON.parse(atob(padded)) as AuthPayload;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get('token')?.value;
  const payload = token ? decodeToken(token) : null;

  // Not authenticated → login
  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Pending/rejected → /pending
  if (payload.status !== 'approved') {
    if (pathname !== '/pending') {
      return NextResponse.redirect(new URL('/pending', req.url));
    }
    return NextResponse.next();
  }

  // Admin-only routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
