import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// POST /api/admin/users/[id]  body: { action: 'approve' | 'reject' }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getUserFromRequest(req);
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { action } = await req.json();
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  if (target.role === 'admin') {
    return NextResponse.json({ error: 'Não é possível alterar status de admin' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: {
      status: action === 'approve' ? 'approved' : 'rejected',
      approvedAt: action === 'approve' ? new Date() : null,
      approvedBy: action === 'approve' ? admin.userId : null,
    },
    select: { id: true, username: true, email: true, status: true },
  });

  return NextResponse.json({ user: updated });
}

// DELETE /api/admin/users/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getUserFromRequest(req);
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  if (target.role === 'admin') {
    return NextResponse.json({ error: 'Não é possível excluir admin' }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
