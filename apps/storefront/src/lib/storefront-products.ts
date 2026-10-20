import { Prisma } from '@prisma/client';
import { getDatabaseProvider, prisma } from '@/lib/prisma';
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

/**
 * PostgreSQL `contains` is case-sensitive; MySQL's default collation is not.
 * Prisma only accepts `mode` for PostgreSQL, so add it conditionally.
 */
function textFilter(value: string) {
  const filter: { contains: string; mode?: 'insensitive' } = {
    contains: value,
  };
  if (getDatabaseProvider() === 'postgresql') {
    filter.mode = 'insensitive';
  }
  return filter;
}

function parsePrice(value: string | null) {
  if (value === null || value === '') return undefined;
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) {
    throw new RangeError('Preço inválido.');
  }
  return price;
}

export async function listProducts(searchParams: URLSearchParams) {
  const id = searchParams.get('id');
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const minPrice = parsePrice(searchParams.get('minPrice'));
  const maxPrice = parsePrice(searchParams.get('maxPrice'));
  const search = searchParams.get('search');

  const where: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
  };

  if (id) {
    where.id = id;
  }

  if (category) {
    where.category = {
      is: { OR: [{ slug: category }, { name: category }] },
    };
  }

  if (brand) {
    where.brand = {
      is: { OR: [{ slug: brand }, { name: brand }] },
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceConditions: Prisma.ProductVariantWhereInput[] = [];
    if (minPrice !== undefined) {
      priceConditions.push({ salePrice: { gte: minPrice } });
    }
    if (maxPrice !== undefined) {
      priceConditions.push({ salePrice: { lte: maxPrice } });
    }
    where.variants = { some: { AND: priceConditions } };
  }

  if (search) {
    where.OR = [
      { name: textFilter(search) },
      { category: { is: { name: textFilter(search) } } },
      { brand: { is: { name: textFilter(search) } } },
      { variants: { some: { sku: textFilter(search) } } },
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

  // Transform to match the expected format for storefront components.
  return products.map((product) => {
    const defaultVariant = product.variants[0];

    return {
      id: product.id,
      name: product.name,
      image:
        getProductImageUrl(product.image, product.id, product.updatedAt) || '',
      price: defaultVariant ? Number(defaultVariant.salePrice) : 0,
      color: mapColorName(product.variation?.name),
      sizes: Array.from(
        new Set(
          product.variants
            .map((variant) => variant.label?.split(' / ')[1] || 'Único')
            .filter(Boolean)
        )
      ),
    };
  });
}
