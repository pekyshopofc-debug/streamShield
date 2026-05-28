import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: auth.userId },
    orderBy: { addedAt: 'desc' },
  });

  return NextResponse.json({ favorites });
}

export async function POST(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const body = await req.json();
  const { videoId, title, thumbnail, channel, duration } = body;

  if (!videoId) return NextResponse.json({ error: 'videoId obrigatório' }, { status: 400 });

  const existing = await prisma.favorite.findUnique({
    where: { userId_videoId: { userId: auth.userId, videoId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({
    data: { userId: auth.userId, videoId, title, thumbnail, channel, duration: duration ?? 0 },
  });

  return NextResponse.json({ favorited: true });
}
