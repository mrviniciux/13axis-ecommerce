import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { catalogLabels, isCatalogResource, slugify } from '@/lib/catalog';

const updateSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => data.name !== undefined || data.active !== undefined, {
    message: 'Informe um nome ou o status.',
  });

type CatalogItemRouteProps = {
  params: Promise<{ resource: string; itemId: string }>;
};

async function canManageCatalog() {
  const session = await auth();
  return (
    session?.user &&
    (session.user.role === 'ADMIN' || session.user.role === 'INVENTORY_MANAGER')
  );
}

function conflictResponse(resource: string) {
  const labels =
    catalogLabels[resource as keyof typeof catalogLabels] ??
    catalogLabels.categories;
  return NextResponse.json(
    { error: `${labels.plural} já possui este nome.` },
    { status: 409 }
  );
}

export async function PATCH(
  request: Request,
  { params }: CatalogItemRouteProps
) {
  if (!(await canManageCatalog())) {
    return NextResponse.json(
      { error: 'Acesso não autorizado.' },
      { status: 401 }
    );
  }

  const { resource, itemId } = await params;
  if (!isCatalogResource(resource)) {
    return NextResponse.json(
      { error: 'Recurso inexistente.' },
      { status: 404 }
    );
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: `Revise os dados d${catalogLabels[resource].article} ${catalogLabels[resource].singular}.`,
      },
      { status: 400 }
    );
  }

  const data = {
    ...parsed.data,
    ...(parsed.data.name ? { slug: slugify(parsed.data.name) } : {}),
  };
  try {
    const result =
      resource === 'categories'
        ? await prisma.category.updateMany({ where: { id: itemId }, data })
        : resource === 'brands'
          ? await prisma.brand.updateMany({ where: { id: itemId }, data })
          : await prisma.variation.updateMany({ where: { id: itemId }, data });
    if (result.count === 0) {
      return NextResponse.json(
        { error: `Registro não encontrado.` },
        { status: 404 }
      );
    }
    const item =
      resource === 'categories'
        ? await prisma.category.findUnique({ where: { id: itemId } })
        : resource === 'brands'
          ? await prisma.brand.findUnique({ where: { id: itemId } })
          : await prisma.variation.findUnique({ where: { id: itemId } });
    return NextResponse.json({ item });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return conflictResponse(resource);
    }
    throw error;
  }
}

export async function DELETE(
  _request: Request,
  { params }: CatalogItemRouteProps
) {
  if (!(await canManageCatalog())) {
    return NextResponse.json(
      { error: 'Acesso não autorizado.' },
      { status: 401 }
    );
  }

  const { resource, itemId } = await params;
  if (!isCatalogResource(resource)) {
    return NextResponse.json(
      { error: 'Recurso inexistente.' },
      { status: 404 }
    );
  }

  const result =
    resource === 'categories'
      ? await prisma.category.updateMany({
          where: { id: itemId, active: true },
          data: { active: false },
        })
      : resource === 'brands'
        ? await prisma.brand.updateMany({
            where: { id: itemId, active: true },
            data: { active: false },
          })
        : await prisma.variation.updateMany({
            where: { id: itemId, active: true },
            data: { active: false },
          });

  if (result.count === 0) {
    const exists =
      resource === 'categories'
        ? await prisma.category.findUnique({
            where: { id: itemId },
            select: { id: true },
          })
        : resource === 'brands'
          ? await prisma.brand.findUnique({
              where: { id: itemId },
              select: { id: true },
            })
          : await prisma.variation.findUnique({
              where: { id: itemId },
              select: { id: true },
            });
    if (!exists) {
      return NextResponse.json(
        { error: 'Registro não encontrado.' },
        { status: 404 }
      );
    }
  }

  return NextResponse.json({ success: true, active: false });
}
