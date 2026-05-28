import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha obrigatórios' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    if (user.status === 'pending') {
      return NextResponse.json(
        { error: 'Sua conta está aguardando aprovação de um administrador.', status: 'pending' },
        { status: 403 },
      );
    }

    if (user.status === 'rejected') {
      return NextResponse.json(
        { error: 'Sua solicitação de acesso foi recusada. Entre em contato com o administrador.', status: 'rejected' },
        { status: 403 },
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role as 'user' | 'admin',
      status: user.status as 'approved',
    });

    const res = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });

    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return res;
  } catch (err: any) {
    console.error('[/api/auth/login]', err?.message);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
