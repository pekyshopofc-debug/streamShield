import { NextRequest, NextResponse } from 'next/server';
import { getVideoInfo } from '@/lib/youtube/video';
import { getSubtitleVtt } from '@/lib/youtube/stream';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  const lang = req.nextUrl.searchParams.get('lang') ?? 'pt';

  if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const info = await getVideoInfo(id);
    const track =
      info.subtitleTracks.find((t) => t.languageCode === lang) ??
      info.subtitleTracks.find((t) => t.languageCode.startsWith('pt')) ??
      info.subtitleTracks[0];

    if (!track) {
      return NextResponse.json({ error: 'Legendas não disponíveis' }, { status: 404 });
    }

    const vtt = await getSubtitleVtt(track.url);
    return new NextResponse(vtt, {
      headers: {
        'Content-Type': 'text/vtt; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao buscar legendas' }, { status: 500 });
  }
}
