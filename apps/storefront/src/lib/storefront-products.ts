import { and, asc, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import { getDb } from '../../db';
import {
  productTable,
  productVariantTable,
  categoryTable,
  brandTable,
  variationTable,
} from '../../db/schema';
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

export async function listProducts(searchParams: URLSearchParams) {
  const id = searchParams.get('id');
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const search = searchParams.get('search');

  const db = getDb();
  const conditions = [eq(productTable.status, 'ACTIVE')];
  if (id) conditions.push(eq(productTable.id, id));
  if (category)
    conditions.push(
      or(eq(categoryTable.slug, category), eq(categoryTable.name, category))!
    );
  if (brand)
    conditions.push(
      or(eq(brandTable.slug, brand), eq(brandTable.name, brand))!
    );

  const priceConditions = [];
  for (const [value, compare] of [
    [minPrice, gte],
    [maxPrice, lte],
  ] as const) {
    if (value === null || value === '') continue;
    const price = Number(value);
    if (!Number.isFinite(price) || price < 0) {
      throw new RangeError('Preço inválido.');
    }
    priceConditions.push(compare(productVariantTable.salePrice, String(price)));
  }
  if (priceConditions.length) {
    conditions.push(
      sql`exists (${db
        .select({ id: productVariantTable.id })
        .from(productVariantTable)
        .where(
          and(
            eq(productVariantTable.productId, productTable.id),
            ...priceConditions
          )
        )})`
    );
  }
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(
        ilike(productTable.name, pattern),
        ilike(categoryTable.name, pattern),
        ilike(brandTable.name, pattern),
        sql`exists (${db
          .select({ id: productVariantTable.id })
          .from(productVariantTable)
          .where(
            and(
              eq(productVariantTable.productId, productTable.id),
              ilike(productVariantTable.sku, pattern)
            )
          )})`
      )!
    );
  }

  const rows = await db
    .select({
      product: productTable,
      variation: variationTable,
      variant: productVariantTable,
    })
    .from(productTable)
    .leftJoin(categoryTable, eq(productTable.categoryId, categoryTable.id))
    .leftJoin(brandTable, eq(productTable.brandId, brandTable.id))
    .leftJoin(variationTable, eq(productTable.variationId, variationTable.id))
    .leftJoin(
      productVariantTable,
      eq(productVariantTable.productId, productTable.id)
    )
    .where(and(...conditions))
    .orderBy(desc(productTable.updatedAt), asc(productVariantTable.salePrice));

  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    const group = grouped.get(row.product.id) ?? [];
    group.push(row);
    grouped.set(row.product.id, group);
  }
  const products = Array.from(grouped.values(), (group) => ({
    ...group[0].product,
    variation: group[0].variation,
    variants: group.flatMap((row) => (row.variant ? [row.variant] : [])),
  }));

  // Transform to match the expected format for storefront components
  const formattedProducts = products.map((product) => {
    // Get the first variant (or default variant)
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
            .map((v) => v.label?.split(' / ')[1] || 'Único')
            .filter(Boolean)
        )
      ),
    };
  });

  return formattedProducts;
}
