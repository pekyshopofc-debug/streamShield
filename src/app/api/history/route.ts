import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const history = await prisma.history.findMany({
    where: { userId: auth.userId },
    orderBy: { watchedAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ history });
}

export async function POST(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const body = await req.json();
  const { videoId, title, thumbnail, channel, duration, progress } = body;

  if (!videoId) return NextResponse.json({ error: 'videoId obrigatório' }, { status: 400 });

  const entry = await prisma.history.upsert({
    where: { userId_videoId: { userId: auth.userId, videoId } },
    update: { progress: progress ?? 0, watchedAt: new Date(), title, thumbnail, channel, duration },
    create: { userId: auth.userId, videoId, title, thumbnail, channel, duration: duration ?? 0, progress: progress ?? 0 },
  });

  return NextResponse.json({ entry });
}

export async function DELETE(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const videoId = req.nextUrl.searchParams.get('videoId');
  if (videoId) {
    await prisma.history.deleteMany({ where: { userId: auth.userId, videoId } });
  } else {
    await prisma.history.deleteMany({ where: { userId: auth.userId } });
  }

  return NextResponse.json({ message: 'Removido do histórico' });
}
