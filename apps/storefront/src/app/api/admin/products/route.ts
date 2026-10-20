import { ProductStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const productSchema = z.object({
  name: z.string().trim().min(2).max(180),
  sku: z.string().trim().min(2).max(100),
  barcode: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  brand: z.string().trim().max(100).optional(),
  variantLabel: z.string().trim().max(120).optional(),
  costPrice: z.number().finite().min(0),
  salePrice: z.number().finite().min(0),
  initialStock: z.number().int().min(0),
  reorderPoint: z.number().int().min(0),
  status: z.nativeEnum(ProductStatus),
  image: z.string().url().optional(), // URL da imagem do produto
});

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(request: Request) {
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

  try {
    const products = await prisma.product.findMany({
      include: { variants: { include: { inventory: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar produtos.' },
      { status: 500 }
    );
  }
}

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

  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Revise os campos informados para cadastrar o produto.' },
      { status: 400 }
    );
  }

  const data = parsed.data;
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: `${slugify(data.name)}-${crypto.randomUUID().slice(0, 8)}`,
        category: data.category || null,
        brand: data.brand || null,
        status: data.status,
        image: data.image || null,
        variants: {
          create: {
            sku: data.sku.toUpperCase(),
            barcode: data.barcode || null,
            label: data.variantLabel || null,
            attributes: data.variantLabel
              ? { label: data.variantLabel }
              : undefined,
            costPrice: data.costPrice,
            salePrice: data.salePrice,
            inventory: {
              create: {
                onHand: data.initialStock,
                reorderPoint: data.reorderPoint,
              },
            },
            movements:
              data.initialStock > 0
                ? {
                    create: {
                      actorId: session.user.id,
                      type: 'INITIAL_STOCK',
                      quantity: data.initialStock,
                      note: 'Saldo inicial no cadastro do produto',
                    },
                  }
                : undefined,
          },
        },
      },
      include: { variants: { include: { inventory: true } } },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Este SKU ou código de barras já está cadastrado.' },
        { status: 409 }
      );
    }
    throw error;
  }
}
