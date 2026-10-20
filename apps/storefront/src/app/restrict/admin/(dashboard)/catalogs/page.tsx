import CatalogManager, {
  type CatalogSection,
} from '@/components/CatalogManager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminCatalogPage() {
  const [categories, brands, variations] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    }),
    prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    }),
    prisma.variation.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    }),
  ]);

  const toSection = (
    resource: CatalogSection['resource'],
    items: {
      id: string;
      name: string;
      active: boolean;
      _count: { products: number };
    }[]
  ): CatalogSection => ({
    resource,
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      active: item.active,
      productsCount: item._count.products,
    })),
  });

  const sections: CatalogSection[] = [
    toSection('categories', categories),
    toSection('brands', brands),
    toSection('variations', variations),
  ];

  return (
    <div className="space-y-2">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b9690]">
          Catálogo
        </p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-[#202925]">
          Categorias, marcas e variações
        </h1>
        <p className="mt-1 text-sm text-[#75807a]">
          Mantenha as opções usadas nos formulários de produto e estoque.
        </p>
      </div>
      <CatalogManager sections={sections} />
    </div>
  );
}
