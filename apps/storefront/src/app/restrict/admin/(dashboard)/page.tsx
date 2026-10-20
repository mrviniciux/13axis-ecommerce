import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CircleAlert,
  Package,
  ShoppingBag,
  Wallet,
} from 'lucide-react';
import SalesChart from '@/components/SalesChart';
import { prisma } from '@/lib/prisma';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default async function AdminDashboardPage() {
  const currentDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
  }).format(new Date());
  const products = await prisma.product.findMany({
    include: { variants: { include: { inventory: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 6,
  });
  const allInventory = await prisma.inventoryItem.findMany({
    include: { variant: { include: { product: true } } },
  });
  const productCount = await prisma.product.count({
    where: { status: 'ACTIVE' },
  });
  const unitsAvailable = allInventory.reduce(
    (total, item) => total + item.onHand - item.reserved,
    0
  );
  const lowStockCount = allInventory.filter(
    (item) => item.onHand - item.reserved <= item.reorderPoint
  ).length;

  const metrics = [
    {
      label: 'Faturamento do período',
      value: 'R$ 62.400',
      change: '+12,8%',
      icon: Wallet,
      tone: 'green',
    },
    {
      label: 'Pedidos',
      value: '486',
      change: '+8,2%',
      icon: ShoppingBag,
      tone: 'blue',
    },
    {
      label: 'Produtos ativos',
      value: String(productCount),
      change: 'no catálogo',
      icon: Package,
      tone: 'orange',
    },
    {
      label: 'Unidades disponíveis',
      value: unitsAvailable.toLocaleString('pt-BR'),
      change: `${lowStockCount} em reposição`,
      icon: Boxes,
      tone: lowStockCount > 0 ? 'red' : 'green',
    },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b9690]">
            Indicadores ilustrativos · {currentDate}
          </p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-[#202925]">
            Visão geral
          </h1>
          <p className="mt-1 text-sm text-[#75807a]">
            Resumo da operação da sua loja.
          </p>
        </div>
        <Link
          href="/restrict/admin/products"
          className="inline-flex h-10 items-center gap-2 bg-[#183c35] px-4 text-sm font-medium text-white hover:bg-[#28584c]"
        >
          <Package size={16} aria-hidden="true" />
          Gerenciar produtos
        </Link>
      </div>

      <section
        aria-label="Indicadores principais"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map(({ label, value, change, icon: Icon, tone }) => (
          <article
            key={label}
            className="border border-[#e2e7e2] bg-[#fbfcfa] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-medium text-[#74807a]">{label}</p>
              <span
                className={`flex size-8 items-center justify-center ${tone === 'red' ? 'bg-[#f7e8e3] text-[#a24c35]' : tone === 'orange' ? 'bg-[#f7eee0] text-[#aa7536]' : tone === 'blue' ? 'bg-[#e9eff2] text-[#547581]' : 'bg-[#e7f0e9] text-[#39715d]'}`}
              >
                <Icon size={16} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-[25px] font-semibold tracking-tight text-[#202925]">
              {value}
            </p>
            <p
              className={`mt-2 flex items-center gap-1 text-[11px] ${tone === 'red' ? 'text-[#a24c35]' : 'text-[#75807a]'}`}
            >
              {tone === 'red' ? (
                <CircleAlert size={13} />
              ) : tone === 'green' || tone === 'blue' ? (
                <ArrowUpRight size={13} />
              ) : (
                <ArrowDownRight size={13} />
              )}
              {change}
            </p>
          </article>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
        <section className="border border-[#e2e7e2] bg-[#fbfcfa] p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#29332f]">
                Desempenho de vendas
              </h2>
              <p className="mt-1 text-xs text-[#87918c]">
                Últimos 12 meses · valores ilustrativos
              </p>
            </div>
            <span className="border border-[#dce7de] bg-[#f1f6f1] px-2.5 py-1 text-[11px] font-medium text-[#3d725c]">
              Dados demonstrativos
            </span>
          </div>
          <SalesChart />
        </section>

        <section className="border border-[#e2e7e2] bg-[#fbfcfa] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#29332f]">
                Atenção ao estoque
              </h2>
              <p className="mt-1 text-xs text-[#87918c]">
                Abaixo do ponto de reposição
              </p>
            </div>
            <span className="flex size-8 items-center justify-center bg-[#f8ece5] text-[#a85238]">
              <CircleAlert size={16} />
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {allInventory
              .filter(
                (item) => item.onHand - item.reserved <= item.reorderPoint
              )
              .slice(0, 4)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 border-b border-[#edf0ed] pb-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-[#303a36]">
                      {item.variant.product.name}
                    </p>
                    <p className="mt-1 text-[10px] text-[#89938e]">
                      SKU {item.variant.sku}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[#a85238]">
                    {item.onHand - item.reserved} un.
                  </span>
                </div>
              ))}
            {lowStockCount === 0 && (
              <p className="py-8 text-center text-sm text-[#7a8580]">
                Nenhum item precisa de reposição.
              </p>
            )}
            {lowStockCount > 0 && products.length === 0 && (
              <p className="py-8 text-center text-sm text-[#7a8580]">
                Cadastre produtos para acompanhar o estoque.
              </p>
            )}
          </div>
          <Link
            href="/restrict/admin/products"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#376a58] hover:text-[#183c35]"
          >
            Abrir estoque <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </section>
      </div>

      <section className="border border-[#e2e7e2] bg-[#fbfcfa]">
        <div className="flex items-center justify-between border-b border-[#e8ece8] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-[#29332f]">
              Produtos atualizados
            </h2>
            <p className="mt-1 text-xs text-[#87918c]">
              Alterações recentes no catálogo
            </p>
          </div>
          <Link
            href="/restrict/admin/products"
            className="text-xs font-semibold text-[#376a58] hover:text-[#183c35]"
          >
            Ver catálogo
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-[#7a8580]">
            Seu catálogo está vazio. Cadastre o primeiro produto para começar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="bg-[#f7f9f6] text-[10px] uppercase tracking-[0.08em] text-[#89938e]">
                <tr>
                  <th className="px-6 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">SKU principal</th>
                  <th className="px-4 py-3 font-medium">Variantes</th>
                  <th className="px-4 py-3 text-right font-medium">Preço</th>
                  <th className="px-6 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-[#edf0ed]">
                    <td className="px-6 py-3.5 font-medium text-[#303a36]">
                      {product.name}
                    </td>
                    <td className="px-4 py-3.5 text-[#78837e]">
                      {product.variants[0]?.sku ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 text-[#78837e]">
                      {product.variants.length}
                    </td>
                    <td className="px-4 py-3.5 text-right text-[#303a36]">
                      {product.variants[0]
                        ? currency.format(Number(product.variants[0].salePrice))
                        : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span
                        className={`inline-block px-2 py-1 text-[10px] font-medium ${product.status === 'ACTIVE' ? 'bg-[#e7f0e9] text-[#39715d]' : 'bg-[#f1f2ef] text-[#7d8580]'}`}
                      >
                        {product.status === 'ACTIVE'
                          ? 'Ativo'
                          : product.status === 'DRAFT'
                            ? 'Rascunho'
                            : 'Arquivado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
