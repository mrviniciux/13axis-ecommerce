'use client';

import { useState, type FormEvent } from 'react';
import { AlertCircle, Check, Pencil, Plus, RotateCcw, X } from 'lucide-react';
import type { CatalogResource } from '@/lib/catalog';
type CatalogItem = {
  id: string;
  name: string;
  active: boolean;
  productsCount: number;
};

export type CatalogSection = {
  resource: CatalogResource;
  items: CatalogItem[];
};

const resourceCopy: Record<
  CatalogResource,
  {
    tab: string;
    title: string;
    description: string;
    singular: string;
    fieldLabel: string;
    editAriaLabel: string;
    placeholder: string;
    empty: string;
  }
> = {
  categories: {
    tab: 'Categorias',
    title: 'Categorias',
    description: 'Agrupam os produtos por tipo de peça.',
    singular: 'categoria',
    fieldLabel: 'Nome da categoria',
    editAriaLabel: 'Novo nome da categoria',
    placeholder: 'Ex.: Calça',
    empty: 'Nenhuma categoria cadastrada.',
  },
  brands: {
    tab: 'Marcas',
    title: 'Marcas',
    description: 'Identificam o fabricante ou a grife do produto.',
    singular: 'marca',
    fieldLabel: 'Nome da marca',
    editAriaLabel: 'Novo nome da marca',
    placeholder: 'Ex.: Nike',
    empty: 'Nenhuma marca cadastrada.',
  },
  variations: {
    tab: 'Variações',
    title: 'Variações',
    description: 'Cores e outras opções reutilizáveis nos produtos.',
    singular: 'variação',
    fieldLabel: 'Nome da variação',
    editAriaLabel: 'Novo nome da variação',
    placeholder: 'Ex.: Preto',
    empty: 'Nenhuma variação cadastrada.',
  },
};

export default function CatalogManager({
  sections,
}: {
  sections: CatalogSection[];
}) {
  const [activeTab, setActiveTab] = useState<CatalogResource>(
    sections[0]?.resource ?? 'categories'
  );
  const [catalog, setCatalog] = useState<Record<string, CatalogItem[]>>(() =>
    Object.fromEntries(sections.map((item) => [item.resource, item.items]))
  );
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(
    null
  );

  const current = activeTab;
  const copy = resourceCopy[current];
  const items = catalog[current] ?? [];

  async function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/catalog/${current}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      const result = await response.json();
      if (!response.ok) {
        setNotice({
          text: result.error ?? 'Não foi possível salvar.',
          error: true,
        });
        return;
      }
      setCatalog((state) => ({
        ...state,
        [current]: [
          ...(state[current] ?? []),
          { ...result.item, productsCount: 0 },
        ],
      }));
      setNewName('');
      setCreating(false);
      setNotice({ text: 'Registro criado.', error: false });
    } catch {
      setNotice({ text: 'Não foi possível salvar.', error: true });
    } finally {
      setSaving(false);
    }
  }

  async function updateItem(
    id: string,
    payload: { name?: string; active?: boolean }
  ) {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/catalog/${current}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setNotice({
          text: result.error ?? 'Não foi possível atualizar.',
          error: true,
        });
        return;
      }
      setCatalog((state) => ({
        ...state,
        [current]: (state[current] ?? []).map((item) =>
          item.id === id ? { ...item, ...result.item } : item
        ),
      }));
      setEditingId(null);
      setNotice({ text: 'Registro atualizado.', error: false });
    } catch {
      setNotice({ text: 'Não foi possível atualizar.', error: true });
    } finally {
      setSaving(false);
    }
  }

  async function deactivateItem(id: string) {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/catalog/${current}/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) {
        setNotice({
          text: result.error ?? 'Não foi possível inativar.',
          error: true,
        });
        return;
      }
      setCatalog((state) => ({
        ...state,
        [current]: (state[current] ?? []).map((item) =>
          item.id === id ? { ...item, active: false } : item
        ),
      }));
      setNotice({ text: 'Registro inativado.', error: false });
    } catch {
      setNotice({ text: 'Não foi possível inativar.', error: true });
    } finally {
      setSaving(false);
    }
  }

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

      <div
        role="tablist"
        aria-label="Catálogos"
        className="flex flex-wrap gap-1 border-b border-[#e1e6e1]"
      >
        {sections.map(({ resource }) => {
          const selected = resource === current;
          return (
            <button
              key={resource}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                setActiveTab(resource);
                setNotice(null);
                setCreating(false);
                setEditingId(null);
              }}
              className={`-mb-px h-10 border-b-2 px-4 text-sm font-medium transition-colors ${selected ? 'border-[#183c35] text-[#183c35]' : 'border-transparent text-[#68736e] hover:text-[#202925]'}`}
            >
              {resourceCopy[resource].tab}
              <span className="ml-2 text-xs text-[#98a19d]">
                {catalog[resource]?.length ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <section className="border border-[#e0e6e0] bg-[#fbfcfa]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8ece8] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#29332f]">
              {copy.title}
            </h2>
            <p className="mt-1 text-xs text-[#87918c]">{copy.description}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditingId(null);
              setNewName('');
            }}
            className="inline-flex h-9 items-center gap-2 bg-[#183c35] px-4 text-xs font-medium text-white hover:bg-[#28584c]"
          >
            <Plus size={15} aria-hidden="true" />
            {`Nova ${copy.singular}`}
          </button>
        </div>

        {creating && (
          <form
            onSubmit={createItem}
            className="flex flex-wrap items-end gap-3 border-b border-[#e8ece8] bg-[#f7f9f6] px-5 py-4"
          >
            <label className="min-w-[220px] flex-1 text-xs font-medium text-[#56625c]">
              {copy.fieldLabel}
              <input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                required
                minLength={2}
                maxLength={100}
                placeholder={copy.placeholder}
                className="mt-2 h-10 w-full border border-[#dce2dc] bg-white px-3 text-sm font-normal text-[#303a36] outline-none focus:border-[#58806e] focus:ring-2 focus:ring-[#58806e]/15"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="h-10 bg-[#183c35] px-4 text-xs font-medium text-white hover:bg-[#28584c] disabled:opacity-60"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="h-10 border border-[#dce2dc] px-4 text-xs font-medium text-[#56625c] hover:bg-[#f3f5f2]"
            >
              Cancelar
            </button>
          </form>
        )}

        {items.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-[#7a8580]">
            {copy.empty}
          </p>
        ) : (
          <ul className="divide-y divide-[#edf0ed]">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-3 px-5 py-3"
              >
                {editingId === item.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      required
                      minLength={2}
                      maxLength={100}
                      aria-label="Nome do registro"
                      className="h-9 min-w-[200px] flex-1 border border-[#dce2dc] bg-white px-3 text-sm outline-none focus:border-[#58806e] focus:ring-2 focus:ring-[#58806e]/15"
                    />
                    <button
                      type="button"
                      disabled={saving || editName.trim().length < 2}
                      onClick={() => updateItem(item.id, { name: editName })}
                      className="h-9 bg-[#183c35] px-3 text-xs font-medium text-white hover:bg-[#28584c] disabled:opacity-60"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      aria-label="Cancelar edição"
                      className="flex size-9 items-center justify-center border border-[#dce2dc] text-[#68736e] hover:bg-[#f3f5f2]"
                    >
                      <X size={15} aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-[#303a36]">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-[#89938e]">
                      {item.productsCount}{' '}
                      {item.productsCount === 1 ? 'produto' : 'produtos'}
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-[10px] font-medium ${item.active ? 'bg-[#eff7f0] text-[#376a58]' : 'bg-[#f2eeee] text-[#8d5550]'}`}
                    >
                      {item.active ? 'Ativo' : 'Inativo'}
                    </span>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setEditingId(item.id);
                        setEditName(item.name);
                      }}
                      aria-label={`Editar ${item.name}`}
                      title="Renomear"
                      className="flex size-8 items-center justify-center border border-[#dce2dc] text-[#315b4e] hover:bg-[#eff5f0] disabled:opacity-40"
                    >
                      <Pencil size={14} aria-hidden="true" />
                    </button>
                    {item.active ? (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void deactivateItem(item.id)}
                        aria-label={`Inativar ${item.name}`}
                        title="Inativar"
                        className="flex size-8 items-center justify-center border border-[#dce2dc] text-[#68736e] hover:bg-[#f3f5f2] disabled:opacity-40"
                      >
                        <X size={14} aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => updateItem(item.id, { active: true })}
                        aria-label={`Reativar ${item.name}`}
                        title="Reativar"
                        className="flex size-8 items-center justify-center border border-[#dce2dc] text-[#376a58] hover:bg-[#eff5f0] disabled:opacity-40"
                      >
                        <RotateCcw size={14} aria-hidden="true" />
                      </button>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-[#e8ece8] px-5 py-3 text-[10px] text-[#89938e]">
          Registros inativos deixam de aparecer na seleção de novos produtos,
          mas continuam vinculados aos produtos existentes.
        </div>
      </section>
    </div>
  );
}
