import { ProductStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getProductImageUrl, productImageSchema } from '@/lib/product-image';

const catalogRefSchema = z
  .string()
  .trim()
  .min(1)
  .max(191)
  .nullable()
  .optional();

const productSchema = z.object({
  name: z.string().trim().min(2).max(180),
  sku: z.string().trim().min(2).max(100),
  barcode: z.string().trim().max(100).nullable().optional(),
  categoryId: catalogRefSchema,
  brandId: catalogRefSchema,
  variationId: catalogRefSchema,
  variantLabel: z.string().trim().max(120).nullable().optional(),
  costPrice: z.number().finite().min(0),
  salePrice: z.number().finite().min(0),
  initialStock: z.number().int().min(0),
  reorderPoint: z.number().int().min(0),
  status: z.nativeEnum(ProductStatus),
  image: productImageSchema,
});

async function findCatalogName(
  model: 'category' | 'brand' | 'variation',
  id: string
) {
  const record =
    model === 'category'
      ? await prisma.category.findUnique({
          where: { id },
          select: { name: true },
        })
      : model === 'brand'
        ? await prisma.brand.findUnique({
            where: { id },
            select: { name: true },
          })
        : await prisma.variation.findUnique({
            where: { id },
            select: { name: true },
          });
  return record?.name ?? null;
}

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
      include: {
        variants: { include: { inventory: true } },
        category: true,
        brand: true,
        variation: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({
      products: products.map((product) => ({
        ...product,
        image: getProductImageUrl(product.image, product.id, product.updatedAt),
      })),
    });
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
    const categoryName = data.categoryId
      ? await findCatalogName('category', data.categoryId)
      : null;
    const brandName = data.brandId
      ? await findCatalogName('brand', data.brandId)
      : null;
    const variationName = data.variationId
      ? await findCatalogName('variation', data.variationId)
      : null;
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: `${slugify(data.name)}-${crypto.randomUUID().slice(0, 8)}`,
        categoryId: data.categoryId || null,
        brandId: data.brandId || null,
        variationId: data.variationId || null,
        status: data.status,
        image: data.image || null,
        variants: {
          create: {
            sku: data.sku.toUpperCase(),
            barcode: data.barcode || null,
            label: data.variantLabel || null,
            attributes: {
              ...(data.variantLabel ? { label: data.variantLabel } : {}),
              ...(categoryName ? { category: categoryName } : {}),
              ...(brandName ? { brand: brandName } : {}),
              ...(variationName ? { variation: variationName } : {}),
            },
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
      include: {
        variants: { include: { inventory: true } },
        category: true,
        brand: true,
        variation: true,
      },
    });
    return NextResponse.json(
      {
        product: {
          ...product,
          image: getProductImageUrl(
            product.image,
            product.id,
            product.updatedAt
          ),
        },
      },
      { status: 201 }
    );
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
