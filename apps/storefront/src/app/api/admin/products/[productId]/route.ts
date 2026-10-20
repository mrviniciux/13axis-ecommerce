import { Prisma, ProductStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { productImageSchema } from '@/lib/product-image';

const catalogRefSchema = z
  .string()
  .trim()
  .min(1)
  .max(191)
  .nullable()
  .optional();

const updateProductSchema = z.object({
  variantId: z.string().min(1),
  name: z.string().trim().min(2).max(180),
  sku: z.string().trim().min(2).max(100),
  barcode: z.string().trim().max(100).nullable(),
  categoryId: catalogRefSchema,
  brandId: catalogRefSchema,
  variationId: catalogRefSchema,
  variantLabel: z.string().trim().max(120).nullable(),
  costPrice: z.number().finite().min(0),
  salePrice: z.number().finite().min(0),
  reorderPoint: z.number().int().min(0),
  status: z.nativeEnum(ProductStatus),
  image: productImageSchema,
});

type ProductRouteProps = {
  params: Promise<{ productId: string }>;
};

async function canManageProducts() {
  const session = await auth();
  return (
    session?.user &&
    (session.user.role === 'ADMIN' || session.user.role === 'INVENTORY_MANAGER')
  );
}

function hasUniqueConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

export async function PATCH(request: Request, { params }: ProductRouteProps) {
  if (!(await canManageProducts())) {
    return NextResponse.json(
      { error: 'Acesso não autorizado.' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const statusUpdate = z
    .object({ status: z.nativeEnum(ProductStatus) })
    .strict()
    .safeParse(body);
  const { productId } = await params;
  if (statusUpdate.success) {
    const updated = await prisma.product.updateMany({
      where: { id: productId },
      data: { status: statusUpdate.data.status },
    });
    if (updated.count === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ status: statusUpdate.data.status });
  }

  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Revise os campos informados para atualizar o produto.' },
      { status: 400 }
    );
  }

  const data = parsed.data;
  try {
    const category = data.categoryId
      ? await prisma.category.findUnique({
          where: { id: data.categoryId },
          select: { name: true },
        })
      : null;
    const brand = data.brandId
      ? await prisma.brand.findUnique({
          where: { id: data.brandId },
          select: { name: true },
        })
      : null;
    const variation = data.variationId
      ? await prisma.variation.findUnique({
          where: { id: data.variationId },
          select: { name: true },
        })
      : null;
    const product = await prisma.$transaction(async (transaction) => {
      const current = await transaction.product.findUnique({
        where: { id: productId },
        include: { variants: { include: { inventory: true } } },
      });
      const variant = current?.variants.find(
        (candidate) => candidate.id === data.variantId
      );
      if (!current || !variant) return null;

      await transaction.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          categoryId: data.categoryId || null,
          brandId: data.brandId || null,
          variationId: data.variationId || null,
          status: data.status,
          ...(data.image !== undefined ? { image: data.image } : {}),
        },
      });
      await transaction.productVariant.update({
        where: { id: variant.id },
        data: {
          sku: data.sku.toUpperCase(),
          barcode: data.barcode || null,
          label: data.variantLabel || null,
          attributes: {
            ...(data.variantLabel ? { label: data.variantLabel } : {}),
            ...(category ? { category: category.name } : {}),
            ...(brand ? { brand: brand.name } : {}),
            ...(variation ? { variation: variation.name } : {}),
          },
          costPrice: data.costPrice,
          salePrice: data.salePrice,
        },
      });
      await transaction.inventoryItem.upsert({
        where: { variantId: variant.id },
        create: { variantId: variant.id, reorderPoint: data.reorderPoint },
        update: { reorderPoint: data.reorderPoint },
      });

      return transaction.product.findUnique({
        where: { id: productId },
        include: {
          variants: { include: { inventory: true } },
          category: true,
          brand: true,
          variation: true,
        },
      });
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produto ou variante não encontrado.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ product });
  } catch (error) {
    if (hasUniqueConflict(error)) {
      return NextResponse.json(
        { error: 'Este SKU ou código de barras já está cadastrado.' },
        { status: 409 }
      );
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: ProductRouteProps) {
  if (!(await canManageProducts())) {
    return NextResponse.json(
      { error: 'Acesso não autorizado.' },
      { status: 401 }
    );
  }

  const { productId } = await params;
  const result = await prisma.product.updateMany({
    where: { id: productId, status: { not: 'ARCHIVED' } },
    data: { status: 'ARCHIVED' },
  });
  if (result.count === 0) {
    const exists = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!exists) {
      return NextResponse.json(
        { error: 'Produto não encontrado.' },
        { status: 404 }
      );
    }
  }
  return NextResponse.json({ success: true, status: 'ARCHIVED' });
}
