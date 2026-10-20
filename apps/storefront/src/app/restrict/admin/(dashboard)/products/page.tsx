import Link from 'next/link';
import ProductInventoryManager from '@/components/ProductInventoryManager';
import { prisma } from '@/lib/prisma';
import { getProductImageUrl } from '@/lib/product-image';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const [products, categories, brands, variations] = await Promise.all([
    prisma.product.findMany({
      include: {
        variants: { include: { inventory: true } },
        category: true,
        brand: true,
        variation: true,
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.brand.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.variation.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-2">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b9690]">
          Catálogo
        </p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-[#202925]">
          Produtos e estoque
        </h1>
        <p className="mt-1 text-sm text-[#75807a]">
          Gerencie SKUs, preços, disponibilidade e movimentações.
        </p>
        <p className="mt-2 text-xs text-[#87918c]">
          Categoria, marca e variação vêm do cadastro em{' '}
          <Link
            href="/restrict/admin/catalogs"
            className="font-medium text-[#376a58] underline underline-offset-2"
          >
            Catálogos
          </Link>
          .
        </p>
      </div>
      <ProductInventoryManager
        categories={categories}
        brands={brands}
        variations={variations}
        initialProducts={JSON.parse(
          JSON.stringify(
            products.map((product) => ({
              ...product,
              image: getProductImageUrl(
                product.image,
                product.id,
                product.updatedAt
              ),
            }))
          )
        )}
      />
    </div>
  );
}
