import type { Prisma } from '@prisma/client';
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

const colorSlugs: Record<string, string> = Object.fromEntries(
  Object.entries(colorMap).map(([slug, color]) => [color, slug])
);

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
 * PostgreSQL `contains` is case-sensitive, so catalog searches use Prisma's
 * `mode: 'insensitive'` filter.
 */
function textFilter(value: string) {
  return {
    contains: value,
    mode: 'insensitive' as const,
  };
}

function parseList(value: string | null) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Sizes are stored as the second part of the variant label (e.g. "Preto / M").
 * `endsWith` is case-sensitive on PostgreSQL, so use an insensitive filter.
 */
function textSuffix(value: string) {
  return {
    endsWith: value,
    mode: 'insensitive' as const,
  };
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
  const colors = parseList(searchParams.get('colors'));
  const sizes = parseList(searchParams.get('sizes'));
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

  if (colors.length > 0) {
    where.variation = {
      is: {
        slug: {
          in: colors
            .map((color) => colorSlugs[color.toLowerCase()])
            .filter((slug): slug is string => Boolean(slug)),
        },
      },
    };
  }

  const variantConditions: Prisma.ProductVariantWhereInput[] = [];

  if (sizes.length > 0) {
    variantConditions.push({
      OR: sizes.map((size) => ({ label: textSuffix(` / ${size}`) })),
    });
  }

  if (minPrice !== undefined) {
    variantConditions.push({ salePrice: { gte: minPrice } });
  }
  if (maxPrice !== undefined) {
    variantConditions.push({ salePrice: { lte: maxPrice } });
  }

  if (variantConditions.length > 0) {
    where.variants = { some: { AND: variantConditions } };
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
