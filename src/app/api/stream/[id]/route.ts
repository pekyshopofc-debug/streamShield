import { NextRequest, NextResponse } from 'next/server';
import { getStreamInfo } from '@/lib/youtube/stream';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const rl = checkRateLimit(`stream:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit excedido' }, { status: 429 });
  }

  const { id } = params;
  if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const stream = await getStreamInfo(id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const proxyUrl = `${appUrl}/api/proxy?url=${encodeURIComponent(stream.url)}`;
    const audioProxyUrl = stream.audioUrl
      ? `${appUrl}/api/proxy?url=${encodeURIComponent(stream.audioUrl)}`
      : undefined;

    return NextResponse.json({
      proxyUrl,
      audioProxyUrl,
      mimeType: stream.mimeType,
      quality: stream.quality,
      itag: stream.itag,
      isDash: stream.isDash,
      contentLength: stream.contentLength,
    });
  } catch (err: any) {
    console.error('[/api/stream]', err?.message);
    return NextResponse.json({ error: 'Stream não disponível. Tente recarregar.' }, { status: 500 });
  }
}
