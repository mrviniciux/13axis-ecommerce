import ProductInventoryManager from '@/components/ProductInventoryManager';
import { prisma } from '@/lib/prisma';

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { variants: { include: { inventory: true } } },
    orderBy: { updatedAt: 'desc' },
  });

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
      </div>
      <ProductInventoryManager
        initialProducts={JSON.parse(JSON.stringify(products))}
      />
    </div>
  );
}
