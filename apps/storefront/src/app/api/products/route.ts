import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');

    const where: any = {
      status: 'ACTIVE',
    };

    if (id) {
      where.id = id;
    }

    if (category) {
      where.category = category;
    }

    if (brand) {
      where.brand = brand;
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
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        {
          variants: {
            some: { sku: { contains: search, mode: 'insensitive' } },
          },
        },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
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
        image: product.image || '',
        price: defaultVariant ? Number(defaultVariant.salePrice) : 0,
        color: defaultVariant?.label?.split(' / ')[0] || 'white', // Simplified color extraction
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
