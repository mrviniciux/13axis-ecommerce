import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProductImageUrl } from '@/lib/product-image';

const colorMap: Record<string, string> = {
  preto: 'black',
  branco: 'white',
  cinza: 'gray',
  azul: 'blue',
  marrom: 'brown',
  verde: 'green',
};

function mapColorName(name: string | undefined) {
  if (!name) return 'white';
  return (
    colorMap[
      name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
    ] ?? 'white'
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');

    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
    };

    if (id) {
      where.id = id;
    }

    if (category) {
      where.category = { is: { OR: [{ slug: category }, { name: category }] } };
    }

    if (brand) {
      where.brand = { is: { OR: [{ slug: brand }, { name: brand }] } };
    }

    if (minPrice || maxPrice) {
      where.variants = {
        some: {
          AND: [
            minPrice ? { salePrice: { gte: Number(minPrice) } } : {},
            maxPrice ? { salePrice: { lte: Number(maxPrice) } } : {},
          ],
        },
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { category: { is: { name: { contains: search } } } },
        { brand: { is: { name: { contains: search } } } },
        {
          variants: {
            some: { sku: { contains: search } },
          },
        },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        variation: true,
        variants: {
          include: {
            inventory: true,
          },
          orderBy: {
            salePrice: 'asc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform to match the expected format for storefront components
    const formattedProducts = products.map((product) => {
      // Get the first variant (or default variant)
      const defaultVariant = product.variants[0];

      return {
        id: product.id,
        name: product.name,
        image:
          getProductImageUrl(product.image, product.id, product.updatedAt) ||
          '',
        price: defaultVariant ? Number(defaultVariant.salePrice) : 0,
        color: mapColorName(product.variation?.name),
        sizes: Array.from(
          new Set(
            product.variants
              .map((v) => v.label?.split(' / ')[1] || 'Único')
              .filter(Boolean)
          )
        ),
      };
    });

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    );
  }
}
