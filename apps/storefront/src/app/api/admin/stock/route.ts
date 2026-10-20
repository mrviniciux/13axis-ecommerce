import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const adjustmentSchema = z.object({
  variantId: z.string().min(1),
  quantity: z
    .number()
    .int()
    .min(-1000000)
    .max(1000000)
    .refine((value) => value !== 0),
  note: z.string().trim().min(3).max(500),
});

export async function POST(request: Request) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'INVENTORY_MANAGER')
  ) {
    return NextResponse.json(
      { error: 'Acesso não autorizado.' },
      { status: 401 }
    );
  }

  const parsed = adjustmentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Informe um ajuste diferente de zero e descreva o motivo.' },
      { status: 400 }
    );
  }

  const { variantId, quantity, note } = parsed.data;
  const result = await prisma.$transaction(async (transaction) => {
    const inventory = await transaction.inventoryItem.findUnique({
      where: { variantId },
    });
    if (!inventory) return { error: 'Produto não encontrado.', status: 404 };

    const updatedStock = inventory.onHand + quantity;
    if (updatedStock < inventory.reserved) {
      return {
        error: 'O saldo não pode ficar abaixo da quantidade reservada.',
        status: 409,
      };
    }

    const updated = await transaction.inventoryItem.updateMany({
      where: {
        variantId,
        onHand: inventory.onHand,
        reserved: inventory.reserved,
      },
      data: { onHand: updatedStock },
    });
    if (updated.count !== 1) {
      return {
        error:
          'O estoque foi alterado por outra operação. Atualize e tente novamente.',
        status: 409,
      };
    }
    const movement = await transaction.stockMovement.create({
      data: {
        variantId,
        actorId: session.user.id,
        type: 'ADJUSTMENT',
        quantity,
        note,
      },
    });
    return { inventory: { ...inventory, onHand: updatedStock }, movement };
  });

  if ('error' in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }
  return NextResponse.json(result);
}
