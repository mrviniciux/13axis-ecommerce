import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
});

export async function POST(request: Request) {
  const payload = registrationSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      {
        error:
          'Informe nome, e-mail válido e senha com ao menos 12 caracteres.',
      },
      { status: 400 }
    );
  }

  const email = payload.data.email.toLowerCase();
  const bootstrapEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (bootstrapEmail && email !== bootstrapEmail) {
    return NextResponse.json(
      { error: 'Este e-mail não está autorizado para o cadastro inicial.' },
      { status: 403 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: 'Já existe uma conta com este e-mail.' },
      { status: 409 }
    );
  }

  if ((await prisma.user.count()) > 0) {
    return NextResponse.json(
      {
        error:
          'O cadastro inicial já foi concluído. Entre com a conta administradora.',
      },
      { status: 403 }
    );
  }

  const passwordHash = await hash(payload.data.password, 12);
  try {
    await prisma.$transaction(
      async (transaction) => {
        const userCount = await transaction.user.count();
        await transaction.user.create({
          data: {
            name: payload.data.name,
            email,
            passwordHash,
            role: userCount === 0 ? 'ADMIN' : 'USER',
          },
        });
      },
      { isolationLevel: 'Serializable' }
    );
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma conta com este e-mail.' },
        { status: 409 }
      );
    }
    if (error instanceof Error && 'code' in error && error.code === 'P2034') {
      return NextResponse.json(
        {
          error:
            'O cadastro inicial já foi concluído. Entre com a conta administradora.',
        },
        { status: 409 }
      );
    }
    throw error;
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
