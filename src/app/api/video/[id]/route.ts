import { NextRequest, NextResponse } from 'next/server';
import { getVideoInfo } from '@/lib/youtube/video';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const rl = checkRateLimit(`video:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit excedido' }, { status: 429 });
  }

  const { id } = params;
  if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const info = await getVideoInfo(id);
    return NextResponse.json(info, {
      headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=120' },
    });
  } catch (err: any) {
    console.error('[/api/video]', err?.message);
    return NextResponse.json({ error: 'Vídeo não encontrado' }, { status: 404 });
  }
}
