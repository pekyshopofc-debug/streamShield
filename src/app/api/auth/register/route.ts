import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 });
    }

    if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Nome de usuário deve ter 3+ caracteres (letras, números, _)' },
        { status: 400 },
      );
    }

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username }] },
    });

    if (exists) {
      return NextResponse.json({ error: 'E-mail ou nome de usuário já em uso' }, { status: 409 });
    }

    // First registered user becomes admin (auto-approved)
    const userCount = await prisma.user.count();
    const isFirst = userCount === 0;
    const role = isFirst ? 'admin' : 'user';
    const status = isFirst ? 'approved' : 'pending';

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        password: hashed,
        role,
        status,
        approvedAt: isFirst ? new Date() : null,
      },
    });

    // Pending users get no token — they must wait for approval
    if (status === 'pending') {
      return NextResponse.json(
        { pending: true, message: 'Cadastro realizado! Aguarde a aprovação de um administrador.' },
        { status: 201 },
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role as 'admin',
      status: user.status as 'approved',
    });

    const res = NextResponse.json(
      {
        token,
        user: { id: user.id, email: user.email, username: user.username, role: user.role, status: user.status, createdAt: user.createdAt },
      },
      { status: 201 },
    );

    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return res;
  } catch (err: any) {
    console.error('[/api/auth/register]', err?.message);
    return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 });
  }
}
