'use client';

import { useState, type FormEvent, type InputHTMLAttributes } from 'react';
import {
  Archive,
  AlertCircle,
  Check,
  ChevronDown,
  ImagePlus,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
} from 'lucide-react';
import { getProductImageUrl } from '@/lib/product-image';
import CatalogCombobox from '@/components/CatalogCombobox';

type CatalogOption = {
  id: string;
  name: string;
};

export type CatalogOptions = {
  categories: CatalogOption[];
  brands: CatalogOption[];
  variations: CatalogOption[];
};

type InventoryProduct = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  brandId: string | null;
  variationId: string | null;
  category: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
  variation: { id: string; name: string } | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  image: string | null;
  updatedAt?: string | Date;
  variants: {
    id: string;
    sku: string;
    barcode: string | null;
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
  categories,
  brands,
  variations,
}: {
  initialProducts: InventoryProduct[];
} & CatalogOptions) {
  const [products, setProducts] = useState(initialProducts);
  const [catalogOptions, setCatalogOptions] = useState<CatalogOptions>({
    categories,
    brands,
    variations,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(
    null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
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

  function registerCatalogOption(
    resource: keyof CatalogOptions,
    option: CatalogOption
  ) {
    setCatalogOptions((current) =>
      current[resource].some((candidate) => candidate.id === option.id)
        ? current
        : { ...current, [resource]: [...current[resource], option] }
    );
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const payload: Record<string, string | number | null> = {
        name: String(formData.get('name')),
        description: String(formData.get('description')) || null,
        sku: String(formData.get('sku')),
        barcode: String(formData.get('barcode')) || null,
        categoryId: String(formData.get('categoryId')) || null,
        brandId: String(formData.get('brandId')) || null,
        variationId: String(formData.get('variationId')) || null,
        variantLabel: String(formData.get('variantLabel')) || null,
        costPrice: Number(formData.get('costPrice')),
        salePrice: Number(formData.get('salePrice')),
        reorderPoint: Number(formData.get('reorderPoint')),
        status: String(formData.get('status')),
      };
      if (!editingProduct) {
        payload.initialStock = Number(formData.get('initialStock'));
      } else {
        payload.variantId = editingProduct.variants[0].id;
        if (removeImage) payload.image = null;
      }
      if (selectedImage?.size) {
        if (selectedImage.size > 2 * 1024 * 1024) {
          throw new Error('A imagem deve ter no máximo 2 MB.');
        }
        if (
          !['image/jpeg', 'image/png', 'image/webp'].includes(
            selectedImage.type
          )
        ) {
          throw new Error('Use uma imagem JPEG, PNG ou WebP.');
        }
        payload.image = await readImageAsDataUrl(selectedImage);
      }

      const response = await fetch(
        editingProduct
          ? `/api/admin/products/${editingProduct.id}`
          : '/api/admin/products',
        {
          method: editingProduct ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        setNotice({
          text: result.error ?? 'Não foi possível salvar o produto.',
          error: true,
        });
        return;
      }
      const savedProduct: InventoryProduct = {
        ...result.product,
        image: getProductImageUrl(
          result.product.image,
          result.product.id,
          result.product.updatedAt
        ),
      };
      setProducts((current) =>
        editingProduct
          ? current.map((product) =>
              product.id === savedProduct.id ? savedProduct : product
            )
          : [savedProduct, ...current]
      );
      setNotice({
        text: editingProduct
          ? 'Produto atualizado.'
          : 'Produto cadastrado e saldo inicial registrado.',
        error: false,
      });
      form.reset();
      setShowForm(false);
      setEditingProduct(null);
      setImagePreview(null);
      setSelectedImage(null);
      setRemoveImage(false);
    } catch (error) {
      setNotice({
        text:
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar o produto.',
        error: true,
      });
    } finally {
      setSaving(false);
    }
  }

  async function updateProductStatus(product: InventoryProduct) {
    const archiving = product.status !== 'ARCHIVED';
    if (
      archiving &&
      !window.confirm(
        `Inativar "${product.name}"? Ele será removido da loja, mas o histórico de estoque será preservado.`
      )
    ) {
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const response = archiving
        ? await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
        : await fetch(`/api/admin/products/${product.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ACTIVE' }),
          });
      const result = await response.json();
      if (!response.ok) {
        setNotice({
          text: result.error ?? 'Não foi possível alterar o status do produto.',
          error: true,
        });
        return;
      }
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, status: result.status } : item
        )
      );
      setNotice({
        text: archiving
          ? 'Produto inativado; o histórico foi preservado.'
          : 'Produto reativado.',
        error: false,
      });
    } catch {
      setNotice({
        text: 'Não foi possível alterar o status do produto.',
        error: true,
      });
    } finally {
      setSaving(false);
    }
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
    `${product.name} ${product.category?.name ?? ''} ${product.brand?.name ?? ''} ${product.variation?.name ?? ''} ${product.variants.map((variant) => variant.sku).join(' ')}`
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
            placeholder="Buscar produto, categoria, marca ou SKU"
            aria-label="Buscar produtos"
            className="h-10 w-full border border-[#dce2dc] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#58806e] focus:ring-2 focus:ring-[#58806e]/15"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setEditingProduct(null);
            setImagePreview(null);
            setSelectedImage(null);
            setRemoveImage(false);
          }}
          className="inline-flex h-10 items-center gap-2 bg-[#183c35] px-4 text-sm font-medium text-white hover:bg-[#28584c]"
        >
          {showForm ? <ChevronDown size={16} /> : <Plus size={16} />}
          {showForm ? 'Fechar formulário' : 'Cadastrar produto'}
        </button>
      </div>

      {showForm && (
        <form
          key={editingProduct?.id ?? 'new-product'}
          onSubmit={saveProduct}
          className="border border-[#e0e6e0] bg-[#fbfcfa] p-5 sm:p-6"
        >
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-[#29332f]">
              {editingProduct ? 'Editar produto' : 'Novo produto'}
            </h2>
            <p className="mt-1 text-xs text-[#87918c]">
              {editingProduct
                ? 'Atualize os dados do produto e da variante principal.'
                : 'Cadastre os dados comerciais, a variante e o saldo inicial.'}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Nome do produto"
              name="name"
              required
              defaultValue={editingProduct?.name}
              placeholder="Ex.: Camiseta essencial"
            />
            <Field
              label="SKU"
              name="sku"
              required
              defaultValue={editingProduct?.variants[0]?.sku}
              placeholder="CAM-ESS-PTO-M"
            />
            <CatalogCombobox
              label="Categoria"
              name="categoryId"
              resource="categories"
              options={catalogOptions.categories}
              defaultOption={editingProduct?.category}
              placeholder="Busque ou cadastre uma categoria"
              onCreated={(option) =>
                registerCatalogOption('categories', option)
              }
            />
            <label className="block text-xs font-medium text-[#56625c] sm:col-span-2">
              Descrição
              <textarea
                name="description"
                maxLength={10000}
                defaultValue={editingProduct?.description ?? ''}
                rows={3}
                className="mt-2 w-full resize-y border border-[#dce2dc] bg-white px-3 py-2 text-sm font-normal text-[#303a36] outline-none focus:border-[#58806e] focus:ring-2 focus:ring-[#58806e]/15"
              />
            </label>
            <CatalogCombobox
              label="Marca"
              name="brandId"
              resource="brands"
              options={catalogOptions.brands}
              defaultOption={editingProduct?.brand}
              placeholder="Busque ou cadastre uma marca"
              onCreated={(option) => registerCatalogOption('brands', option)}
            />
            <CatalogCombobox
              label="Variação (cor)"
              name="variationId"
              resource="variations"
              options={catalogOptions.variations}
              defaultOption={editingProduct?.variation}
              placeholder="Busque ou cadastre uma variação"
              onCreated={(option) =>
                registerCatalogOption('variations', option)
              }
            />
            <Field
              label="Código de barras"
              name="barcode"
              defaultValue={editingProduct?.variants[0]?.barcode ?? ''}
              placeholder="EAN / GTIN"
            />
            <Field
              label="Rótulo da variante"
              name="variantLabel"
              defaultValue={editingProduct?.variants[0]?.label ?? ''}
              placeholder="Ex.: Preto / M"
            />
            <label className="block text-xs font-medium text-[#56625c] sm:col-span-2">
              Imagem do produto (JPEG, PNG ou WebP; até 2 MB)
              <span className="mt-2 flex min-h-10 items-center gap-3 border border-[#dce2dc] bg-white px-3 py-2">
                <ImagePlus size={17} aria-hidden="true" />
                <input
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  aria-label="Enviar imagem do produto"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      setSelectedImage(null);
                      setNotice({
                        text: 'A imagem deve ter no máximo 2 MB.',
                        error: true,
                      });
                      event.currentTarget.value = '';
                      return;
                    }
                    if (
                      !['image/jpeg', 'image/png', 'image/webp'].includes(
                        file.type
                      )
                    ) {
                      setSelectedImage(null);
                      setNotice({
                        text: 'Use uma imagem JPEG, PNG ou WebP.',
                        error: true,
                      });
                      event.currentTarget.value = '';
                      return;
                    }
                    setSelectedImage(file);
                    setRemoveImage(false);
                    void readImageAsDataUrl(file)
                      .then(setImagePreview)
                      .catch(() =>
                        setNotice({
                          text: 'Não foi possível ler o arquivo de imagem.',
                          error: true,
                        })
                      );
                  }}
                  className="min-w-0 flex-1 text-xs font-normal text-[#68736e] file:mr-3 file:border-0 file:bg-[#edf2ed] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#315b4e]"
                />
              </span>
              {imagePreview && (
                <span className="mt-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Pré-visualização da imagem do produto"
                    className="size-16 rounded border border-[#dce2dc] object-cover"
                  />
                  <span className="font-normal text-[#68736e]">
                    {editingProduct
                      ? 'A imagem atual será mantida se nenhum arquivo novo for selecionado.'
                      : 'Pré-visualização'}
                  </span>
                </span>
              )}
              {editingProduct?.image && imagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setSelectedImage(null);
                    setRemoveImage(true);
                  }}
                  className="mt-2 text-xs font-medium text-[#9b3f2b] underline underline-offset-2"
                >
                  Remover imagem atual
                </button>
              )}
            </label>
            <Field
              label="Custo unitário (R$)"
              name="costPrice"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={
                editingProduct
                  ? String(editingProduct.variants[0]?.costPrice ?? '')
                  : undefined
              }
            />
            <Field
              label="Preço de venda (R$)"
              name="salePrice"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={
                editingProduct
                  ? String(editingProduct.variants[0]?.salePrice ?? '')
                  : undefined
              }
            />
            {!editingProduct && (
              <Field
                label="Estoque inicial"
                name="initialStock"
                type="number"
                min="0"
                step="1"
                defaultValue="0"
                required
              />
            )}
            <Field
              label="Ponto de reposição"
              name="reorderPoint"
              type="number"
              min="0"
              step="1"
              defaultValue={String(
                editingProduct?.variants[0]?.inventory?.reorderPoint ?? 5
              )}
              required
            />
            <label className="block text-xs font-medium text-[#56625c]">
              Status do produto
              <select
                name="status"
                defaultValue={editingProduct?.status ?? 'ACTIVE'}
                className="mt-2 h-10 w-full border border-[#dce2dc] bg-white px-3 text-sm font-normal text-[#303a36] outline-none focus:border-[#58806e] focus:ring-2 focus:ring-[#58806e]/15"
              >
                <option value="ACTIVE">Ativo</option>
                <option value="DRAFT">Rascunho</option>
                {editingProduct && <option value="ARCHIVED">Inativo</option>}
              </select>
            </label>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-[#e8ece8] pt-4">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingProduct(null);
                setImagePreview(null);
                setSelectedImage(null);
                setRemoveImage(false);
              }}
              className="h-9 border border-[#dce2dc] px-4 text-xs font-medium text-[#56625c] hover:bg-[#f3f5f2]"
            >
              Cancelar
            </button>
            <button
              disabled={saving}
              className="inline-flex h-9 items-center gap-2 bg-[#183c35] px-4 text-xs font-medium text-white hover:bg-[#28584c] disabled:opacity-60"
            >
              {saving && <RefreshCw size={14} className="animate-spin" />}
              {editingProduct ? 'Salvar alterações' : 'Salvar produto'}
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
            <table className="w-full min-w-[1080px] text-left text-xs">
              <thead className="bg-[#f6f8f5] text-[10px] uppercase tracking-[0.08em] text-[#89938e]">
                <tr>
                  <th className="px-5 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">SKU / variante</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Custo</th>
                  <th className="px-4 py-3 text-right font-medium">Preço</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Disponível
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Reposição
                  </th>
                  <th className="px-5 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.flatMap((product) =>
                  product.variants.map((variant, variantIndex) => {
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
                            {[
                              product.category?.name,
                              product.brand?.name,
                              product.variation?.name,
                            ]
                              .filter(Boolean)
                              .join(' · ') || 'Sem classificação'}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-[#68736e]">
                          <p className="font-medium">{variant.sku}</p>
                          <p className="mt-1 text-[10px] text-[#89938e]">
                            {variant.label || 'Padrão'}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-[10px] font-medium ${
                              product.status === 'ACTIVE'
                                ? 'bg-[#eff7f0] text-[#376a58]'
                                : product.status === 'ARCHIVED'
                                  ? 'bg-[#f2eeee] text-[#8d5550]'
                                  : 'bg-[#f4f1e8] text-[#8a7140]'
                            }`}
                          >
                            {product.status === 'ACTIVE'
                              ? 'Ativo'
                              : product.status === 'ARCHIVED'
                                ? 'Inativo'
                                : 'Rascunho'}
                          </span>
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
                              disabled={
                                saving ||
                                product.status === 'ARCHIVED' ||
                                !inventory ||
                                available <= 0
                              }
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
                              disabled={
                                saving ||
                                product.status === 'ARCHIVED' ||
                                !inventory
                              }
                              onClick={() =>
                                beginAdjustment(variant.id, product.name, 1)
                              }
                              aria-label={`Adicionar uma unidade de ${product.name}`}
                              title="Adicionar uma unidade"
                              className="flex size-7 items-center justify-center border border-[#dce2dc] text-[#376a58] hover:bg-[#eff5f0] disabled:opacity-40"
                            >
                              +
                            </button>
                            {variantIndex === 0 && (
                              <>
                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setImagePreview(product.image);
                                    setSelectedImage(null);
                                    setRemoveImage(false);
                                    setShowForm(true);
                                  }}
                                  aria-label={`Editar ${product.name}`}
                                  title="Editar produto"
                                  className="ml-1 flex h-7 items-center gap-1 border border-[#dce2dc] px-2 text-[#315b4e] hover:bg-[#eff5f0] disabled:opacity-40"
                                >
                                  <Pencil size={13} aria-hidden="true" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() =>
                                    void updateProductStatus(product)
                                  }
                                  aria-label={
                                    product.status === 'ARCHIVED'
                                      ? `Reativar ${product.name}`
                                      : `Inativar ${product.name}`
                                  }
                                  title={
                                    product.status === 'ARCHIVED'
                                      ? 'Reativar produto'
                                      : 'Inativar produto'
                                  }
                                  className="flex h-7 items-center gap-1 border border-[#dce2dc] px-2 text-[#68736e] hover:bg-[#f3f5f2] disabled:opacity-40"
                                >
                                  {product.status === 'ARCHIVED' ? (
                                    <RotateCcw size={13} aria-hidden="true" />
                                  ) : (
                                    <Archive size={13} aria-hidden="true" />
                                  )}
                                  <span>
                                    {product.status === 'ARCHIVED'
                                      ? 'Reativar'
                                      : 'Inativar'}
                                  </span>
                                </button>
                              </>
                            )}
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

function readImageAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Não foi possível ler o arquivo de imagem.'));
    reader.onerror = () =>
      reject(new Error('Não foi possível ler o arquivo de imagem.'));
    reader.readAsDataURL(file);
  });
}
