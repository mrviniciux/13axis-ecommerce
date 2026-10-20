'use client';

import { useState, type FormEvent, type InputHTMLAttributes } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';

type InventoryProduct = {
  id: string;
  name: string;
  category: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  image: string | null;
  variants: {
    id: string;
    sku: string;
    label: string | null;
    costPrice: string | number;
    salePrice: string | number;
    inventory: {
      id: string;
      onHand: number;
      reserved: number;
      reorderPoint: number;
    } | null;
  }[];
};

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function ProductInventoryManager({
  initialProducts,
}: {
  initialProducts: InventoryProduct[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [adjustment, setAdjustment] = useState<{
    variantId: string;
    productName: string;
    direction: 1 | -1;
  } | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(1);
  const [adjustmentNote, setAdjustmentNote] = useState('');

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name')),
      sku: String(formData.get('sku')),
      barcode: String(formData.get('barcode')) || undefined,
      category: String(formData.get('category')) || undefined,
      brand: String(formData.get('brand')) || undefined,
      variantLabel: String(formData.get('variantLabel')) || undefined,
      image: String(formData.get('image')) || undefined,
      costPrice: Number(formData.get('costPrice')),
      salePrice: Number(formData.get('salePrice')),
      initialStock: Number(formData.get('initialStock')),
      reorderPoint: Number(formData.get('reorderPoint')),
      status: String(formData.get('status')),
    };

    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) {
      setNotice({
        text: result.error ?? 'Não foi possível cadastrar o produto.',
        error: true,
      });
      return;
    }
    setProducts((current) => [result.product, ...current]);
    setNotice({
      text: 'Produto cadastrado e saldo inicial registrado.',
      error: false,
    });
    form.reset();
    setShowForm(false);
  }

  async function adjustStock(
    variantId: string,
    quantity: number,
    note: string
  ) {
    setSaving(true);
    setNotice(null);
    const response = await fetch('/api/admin/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId, quantity, note: note.trim() }),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) {
      setNotice({
        text: result.error ?? 'Não foi possível ajustar o estoque.',
        error: true,
      });
      return;
    }
    setProducts((current) =>
      current.map((product) => ({
        ...product,
        variants: product.variants.map((variant) =>
          variant.id === variantId
            ? { ...variant, inventory: result.inventory }
            : variant
        ),
      }))
    );
    setAdjustment(null);
    setNotice({
      text: 'Estoque ajustado e movimentação registrada.',
      error: false,
    });
  }

  function beginAdjustment(
    variantId: string,
    productName: string,
    direction: 1 | -1
  ) {
    setAdjustment({ variantId, productName, direction });
    setAdjustmentQuantity(1);
    setAdjustmentNote('');
  }

  function submitAdjustment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adjustment || !adjustmentNote.trim()) return;
    void adjustStock(
      adjustment.variantId,
      adjustment.direction * adjustmentQuantity,
      adjustmentNote.trim()
    );
  }

  const visibleProducts = products.filter((product) =>
    `${product.name} ${product.category ?? ''} ${product.variants.map((variant) => variant.sku).join(' ')}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {notice && (
        <div
          role="status"
          className={`flex items-center gap-2 border px-4 py-3 text-sm ${notice.error ? 'border-[#e8c8be] bg-[#fff5f1] text-[#9b3f2b]' : 'border-[#d5e5d8] bg-[#eff7f0] text-[#376a58]'}`}
        >
          {notice.error ? <AlertCircle size={16} /> : <Check size={16} />}
          {notice.text}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#919b96]"
            aria-hidden="true"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar produto, categoria ou SKU"
            aria-label="Buscar produtos"
            className="h-10 w-full border border-[#dce2dc] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#58806e] focus:ring-2 focus:ring-[#58806e]/15"
          />
        </label>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex h-10 items-center gap-2 bg-[#183c35] px-4 text-sm font-medium text-white hover:bg-[#28584c]"
        >
          {showForm ? <ChevronDown size={16} /> : <Plus size={16} />}
          {showForm ? 'Fechar cadastro' : 'Cadastrar produto'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={createProduct}
          className="border border-[#e0e6e0] bg-[#fbfcfa] p-5 sm:p-6"
        >
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-[#29332f]">
              Novo produto
            </h2>
            <p className="mt-1 text-xs text-[#87918c]">
              Cadastre a identificação comercial, a variante e o saldo inicial.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Nome do produto"
              name="name"
              required
              placeholder="Ex.: Camiseta essencial"
            />
            <Field
              label="SKU"
              name="sku"
              required
              placeholder="CAM-ESS-PTO-M"
            />
            <Field
              label="Categoria"
              name="category"
              placeholder="Ex.: Camisetas"
            />
            <Field label="Marca" name="brand" placeholder="Nome da marca" />
            <Field
              label="Código de barras"
              name="barcode"
              placeholder="EAN / GTIN"
            />
            <Field
              label="Variação"
              name="variantLabel"
              placeholder="Ex.: Preto / M"
            />
            <Field
              label="Imagem (URL)"
              name="image"
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
            />
            <Field
              label="Custo unitário (R$)"
              name="costPrice"
              type="number"
              min="0"
              step="0.01"
              required
            />
            <Field
              label="Preço de venda (R$)"
              name="salePrice"
              type="number"
              min="0"
              step="0.01"
              required
            />
            <Field
              label="Estoque inicial"
              name="initialStock"
              type="number"
              min="0"
              step="1"
              defaultValue="0"
              required
            />
            <Field
              label="Ponto de reposição"
              name="reorderPoint"
              type="number"
              min="0"
              step="1"
              defaultValue="5"
              required
            />
            <label className="block text-xs font-medium text-[#56625c]">
              Status do produto
              <select
                name="status"
                defaultValue="ACTIVE"
                className="mt-2 h-10 w-full border border-[#dce2dc] bg-white px-3 text-sm font-normal text-[#303a36] outline-none focus:border-[#58806e] focus:ring-2 focus:ring-[#58806e]/15"
              >
                <option value="ACTIVE">Ativo</option>
                <option value="DRAFT">Rascunho</option>
              </select>
            </label>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-[#e8ece8] pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-9 border border-[#dce2dc] px-4 text-xs font-medium text-[#56625c] hover:bg-[#f3f5f2]"
            >
              Cancelar
            </button>
            <button
              disabled={saving}
              className="inline-flex h-9 items-center gap-2 bg-[#183c35] px-4 text-xs font-medium text-white hover:bg-[#28584c] disabled:opacity-60"
            >
              {saving && <RefreshCw size={14} className="animate-spin" />}
              Salvar produto
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden border border-[#e0e6e0] bg-[#fbfcfa]">
        <div className="flex items-center justify-between border-b border-[#e8ece8] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#29332f]">
              Catálogo e disponibilidade
            </h2>
            <p className="mt-1 text-xs text-[#87918c]">
              {visibleProducts.length}{' '}
              {visibleProducts.length === 1 ? 'produto' : 'produtos'}
            </p>
          </div>
          <span className="hidden items-center gap-1.5 text-[11px] text-[#85908a] sm:flex">
            <span className="size-1.5 bg-[#6b9a7d]" /> Sincronização pronta para
            integração
          </span>
        </div>
        {visibleProducts.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto flex size-11 items-center justify-center bg-[#edf2ed] text-[#4d725f]">
              <Search size={18} />
            </span>
            <p className="mt-4 text-sm font-medium text-[#35403b]">
              {products.length
                ? 'Nenhum resultado encontrado'
                : 'Seu catálogo ainda está vazio'}
            </p>
            <p className="mt-1 text-xs text-[#87918c]">
              {products.length
                ? 'Tente outro nome ou SKU.'
                : 'Cadastre o primeiro produto para controlar o estoque.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[870px] text-left text-xs">
              <thead className="bg-[#f6f8f5] text-[10px] uppercase tracking-[0.08em] text-[#89938e]">
                <tr>
                  <th className="px-5 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">SKU / variante</th>
                  <th className="px-4 py-3 text-right font-medium">Custo</th>
                  <th className="px-4 py-3 text-right font-medium">Preço</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Disponível
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Reposição
                  </th>
                  <th className="px-5 py-3 text-right font-medium">Ajuste</th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.flatMap((product) =>
                  product.variants.map((variant) => {
                    const inventory = variant.inventory;
                    const available = inventory
                      ? inventory.onHand - inventory.reserved
                      : 0;
                    const lowStock = inventory
                      ? available <= inventory.reorderPoint
                      : true;
                    return (
                      <tr
                        key={variant.id}
                        className="border-t border-[#edf0ed]"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-[#303a36]">
                            {product.name}
                          </p>
                          <p className="mt-1 text-[10px] text-[#89938e]">
                            {product.category || 'Sem categoria'}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-[#68736e]">
                          <p className="font-medium">{variant.sku}</p>
                          <p className="mt-1 text-[10px] text-[#89938e]">
                            {variant.label || 'Padrão'}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-right text-[#68736e]">
                          {currency.format(Number(variant.costPrice))}
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-[#303a36]">
                          {currency.format(Number(variant.salePrice))}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span
                            className={`font-semibold ${lowStock ? 'text-[#a85238]' : 'text-[#376a58]'}`}
                          >
                            {available} un.
                          </span>
                          {inventory && inventory.reserved > 0 && (
                            <p className="mt-1 text-[10px] text-[#89938e]">
                              {inventory.reserved} reservado(s)
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right text-[#78837e]">
                          {inventory?.reorderPoint ?? 0} un.
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              disabled={saving || !inventory || available <= 0}
                              onClick={() =>
                                beginAdjustment(variant.id, product.name, -1)
                              }
                              aria-label={`Baixar uma unidade de ${product.name}`}
                              title="Baixar uma unidade"
                              className="flex size-7 items-center justify-center border border-[#dce2dc] text-[#68736e] hover:bg-[#f3f5f2] disabled:opacity-40"
                            >
                              −
                            </button>
                            <button
                              type="button"
                              disabled={saving || !inventory}
                              onClick={() =>
                                beginAdjustment(variant.id, product.name, 1)
                              }
                              aria-label={`Adicionar uma unidade de ${product.name}`}
                              title="Adicionar uma unidade"
                              className="flex size-7 items-center justify-center border border-[#dce2dc] text-[#376a58] hover:bg-[#eff5f0] disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8ece8] px-5 py-3 text-[10px] text-[#89938e]">
          <span>Saldo disponível = estoque físico − reservado</span>
          <span>Todo ajuste exige motivo e gera movimentação auditável</span>
        </div>
      </div>

      {adjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17211d]/45 p-4">
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-adjustment-title"
            onSubmit={submitAdjustment}
            className="w-full max-w-md border border-[#dce2dc] bg-[#fbfcfa] p-5 shadow-xl sm:p-6"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a9590]">
              Movimentação de estoque
            </p>
            <h2
              id="stock-adjustment-title"
              className="mt-2 text-lg font-semibold text-[#29332f]"
            >
              {adjustment.direction > 0 ? 'Adicionar' : 'Baixar'} unidades
            </h2>
            <p className="mt-1 truncate text-sm text-[#74807a]">
              {adjustment.productName}
            </p>
            <label className="mt-5 block text-xs font-medium text-[#56625c]">
              Quantidade
              <input
                type="number"
                min="1"
                max="1000000"
                step="1"
                required
                value={adjustmentQuantity}
                onChange={(event) =>
                  setAdjustmentQuantity(Math.max(1, Number(event.target.value)))
                }
                className="mt-2 h-10 w-full border border-[#dce2dc] bg-white px-3 text-sm text-[#303a36] outline-none focus:border-[#58806e] focus:ring-2 focus:ring-[#58806e]/15"
              />
            </label>
            <label className="mt-4 block text-xs font-medium text-[#56625c]">
              Motivo do ajuste
              <textarea
                required
                minLength={3}
                maxLength={500}
                value={adjustmentNote}
                onChange={(event) => setAdjustmentNote(event.target.value)}
                rows={3}
                placeholder="Ex.: conferência de inventário"
                className="mt-2 w-full resize-y border border-[#dce2dc] bg-white px-3 py-2 text-sm font-normal text-[#303a36] outline-none focus:border-[#58806e] focus:ring-2 focus:ring-[#58806e]/15"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2 border-t border-[#e8ece8] pt-4">
              <button
                type="button"
                onClick={() => setAdjustment(null)}
                className="h-9 border border-[#dce2dc] px-4 text-xs font-medium text-[#56625c] hover:bg-[#f3f5f2]"
              >
                Cancelar
              </button>
              <button
                disabled={saving}
                className="h-9 bg-[#183c35] px-4 text-xs font-medium text-white hover:bg-[#28584c] disabled:opacity-60"
              >
                Confirmar ajuste
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  ...props
}: {
  label: string;
  name: string;
  type?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-xs font-medium text-[#56625c]">
      {label}
      <input
        name={name}
        type={type}
        {...props}
        className="mt-2 h-10 w-full border border-[#dce2dc] bg-white px-3 text-sm font-normal text-[#303a36] outline-none focus:border-[#58806e] focus:ring-2 focus:ring-[#58806e]/15"
      />
    </label>
  );
}
