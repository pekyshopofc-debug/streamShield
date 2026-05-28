import { NextRequest, NextResponse } from 'next/server';
import { searchVideos } from '@/lib/youtube/search';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const rl = checkRateLimit(`search:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit excedido. Tente novamente em instantes.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  const q = req.nextUrl.searchParams.get('q');
  if (!q?.trim()) {
    return NextResponse.json({ error: 'Query obrigatória' }, { status: 400 });
  }

  try {
    const result = await searchVideos(q.trim());
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        'X-RateLimit-Remaining': String(rl.remaining),
      },
    });
  } catch (err: any) {
    console.error('[/api/search]', err?.message);
    return NextResponse.json({ error: 'Falha na busca. Tente novamente.' }, { status: 500 });
  }
}
