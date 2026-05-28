import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/admin/users?status=pending|approved|rejected|all
export async function GET(req: NextRequest) {
  const admin = getUserFromRequest(req);
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const status = req.nextUrl.searchParams.get('status') ?? 'all';

  const users = await prisma.user.findMany({
    where: status !== 'all' ? { status } : undefined,
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      status: true,
      createdAt: true,
      approvedAt: true,
      approvedBy: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const counts = await prisma.user.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  const stats = { pending: 0, approved: 0, rejected: 0 };
  for (const c of counts) {
    stats[c.status as keyof typeof stats] = c._count.status;
  }

  return NextResponse.json({ users, stats });
}
