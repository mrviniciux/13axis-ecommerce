import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { catalogLabels, isCatalogResource, slugify } from '@/lib/catalog';

const createSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

type CatalogListRouteProps = {
  params: Promise<{ resource: string }>;
};

async function canManageCatalog() {
  const session = await auth();
  return (
    session?.user &&
    (session.user.role === 'ADMIN' || session.user.role === 'INVENTORY_MANAGER')
  );
}

export async function GET(
  _request: Request,
  { params }: CatalogListRouteProps
) {
  if (!(await canManageCatalog())) {
    return NextResponse.json(
      { error: 'Acesso não autorizado.' },
      { status: 401 }
    );
  }

  const { resource } = await params;
  if (!isCatalogResource(resource)) {
    return NextResponse.json(
      { error: 'Recurso inexistente.' },
      { status: 404 }
    );
  }

  const items =
    resource === 'categories'
      ? await prisma.category.findMany({ orderBy: { name: 'asc' } })
      : resource === 'brands'
        ? await prisma.brand.findMany({ orderBy: { name: 'asc' } })
        : await prisma.variation.findMany({ orderBy: { name: 'asc' } });

  return NextResponse.json({ items });
}

export async function POST(
  request: Request,
  { params }: CatalogListRouteProps
) {
  if (!(await canManageCatalog())) {
    return NextResponse.json(
      { error: 'Acesso não autorizado.' },
      { status: 401 }
    );
  }

  const { resource } = await params;
  if (!isCatalogResource(resource)) {
    return NextResponse.json(
      { error: 'Recurso inexistente.' },
      { status: 404 }
    );
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: `Informe um nome de ${catalogLabels[resource].singular}.` },
      { status: 400 }
    );
  }

  const name = parsed.data.name;
  const slug = slugify(name);
  try {
    const item =
      resource === 'categories'
        ? await prisma.category.create({ data: { name, slug } })
        : resource === 'brands'
          ? await prisma.brand.create({ data: { name, slug } })
          : await prisma.variation.create({ data: { name, slug } });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: `${catalogLabels[resource].plural} já possui este nome.` },
        { status: 409 }
      );
    }
    throw error;
  }
}
