import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = ['googlevideo.com', 'youtube.com', 'ytimg.com', 'sponsor.ajay.app'];

// Android YouTube app User-Agent — matches the ANDROID Innertube client
const ANDROID_UA = 'com.google.android.youtube/17.31.35 (Linux; U; Android 11) gzip';

function isAllowedUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    return ALLOWED_HOSTS.some((h) => u.hostname.endsWith(h));
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');
  if (!urlParam) return new NextResponse('URL obrigatória', { status: 400 });

  let decoded: string;
  try {
    decoded = decodeURIComponent(urlParam);
    new URL(decoded);
  } catch {
    return new NextResponse('URL inválida', { status: 400 });
  }

  if (!isAllowedUrl(decoded)) {
    return new NextResponse('Host não permitido', { status: 403 });
  }

  const range = req.headers.get('range');

  const headers: Record<string, string> = {
    'User-Agent': ANDROID_UA,
    'X-YouTube-Client-Name': '3',
    'X-YouTube-Client-Version': '17.31.35',
  };

  if (range) headers['Range'] = range;

  let upstream: Response;
  try {
    upstream = await fetch(decoded, { headers, redirect: 'follow' });
  } catch (err: any) {
    console.error('[proxy] fetch error:', err?.message);
    return new NextResponse('Erro ao buscar stream', { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    // Try without X-YouTube headers as fallback
    try {
      upstream = await fetch(decoded, {
        headers: { 'User-Agent': ANDROID_UA, ...(range ? { Range: range } : {}) },
        redirect: 'follow',
      });
    } catch {
      return new NextResponse('Stream indisponível', { status: upstream.status });
    }
  }

  const responseHeaders = new Headers();
  for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'last-modified', 'etag']) {
    const val = upstream.headers.get(h);
    if (val) responseHeaders.set(h, val);
  }

  responseHeaders.set('accept-ranges', 'bytes');
  responseHeaders.set('cache-control', 'public, max-age=3600');
  responseHeaders.set('access-control-allow-origin', '*');

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
