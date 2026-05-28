import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const playlists = await prisma.playlist.findMany({
    where: { userId: auth.userId },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { items: true } } },
  });

  return NextResponse.json({
    playlists: playlists.map((p) => ({ ...p, itemCount: p._count.items })),
  });
}

export async function POST(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });

  const playlist = await prisma.playlist.create({
    data: { name: name.trim(), userId: auth.userId },
  });

  return NextResponse.json({ playlist }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

  await prisma.playlist.deleteMany({ where: { id, userId: auth.userId } });
  return NextResponse.json({ message: 'Playlist removida' });
}
