'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { Check, Loader2, Plus, Search } from 'lucide-react';
import { normalizeCatalogName, type CatalogResource } from '@/lib/catalog';

export type CatalogOption = {
  id: string;
  name: string;
};

type CatalogComboboxProps = {
  label: string;
  name: string;
  resource: CatalogResource;
  options: CatalogOption[];
  /** Value loaded from the product, which may point to an inactive record. */
  defaultOption?: CatalogOption | null;
  placeholder: string;
  onCreated?: (option: CatalogOption) => void;
};

type Entry = { kind: 'option'; option: CatalogOption } | { kind: 'create' };

export default function CatalogCombobox({
  label,
  name,
  resource,
  options,
  defaultOption,
  placeholder,
  onCreated,
}: CatalogComboboxProps) {
  const inputId = useId();
  const listId = `${inputId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [extraOptions, setExtraOptions] = useState<CatalogOption[]>([]);
  const [selected, setSelected] = useState<CatalogOption | null>(() => {
    if (!defaultOption) return null;
    return (
      options.find((option) => option.id === defaultOption.id) ?? defaultOption
    );
  });
  const [query, setQuery] = useState(selected?.name ?? '');
  const [filtering, setFiltering] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const allOptions = useMemo(() => {
    const merged = [...options];
    for (const option of extraOptions) {
      if (!merged.some((candidate) => candidate.id === option.id)) {
        merged.push(option);
      }
    }
    return merged;
  }, [options, extraOptions]);

  const normalizedQuery = filtering ? normalizeCatalogName(query) : '';
  const filteredOptions = normalizedQuery
    ? allOptions.filter((option) =>
        normalizeCatalogName(option.name).includes(normalizedQuery)
      )
    : allOptions;
  const exactMatch = normalizedQuery
    ? allOptions.find(
        (option) => normalizeCatalogName(option.name) === normalizedQuery
      )
    : undefined;
  const canCreate =
    normalizedQuery.length >= 2 && !exactMatch && filteredOptions.length === 0;
  const inactiveSelected =
    selected !== null &&
    !allOptions.some((option) => option.id === selected.id);

  const entries: Entry[] = [
    ...filteredOptions.map<Entry>((option) => ({ kind: 'option', option })),
    ...(canCreate ? ([{ kind: 'create' }] as Entry[]) : []),
  ];
  const safeActiveIndex =
    entries.length === 0 ? -1 : Math.min(activeIndex, entries.length - 1);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setFiltering(false);
        setQuery(selectedRef.current?.name ?? '');
        setError(null);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  function selectOption(option: CatalogOption) {
    setSelected(option);
    setQuery(option.name);
    setFiltering(false);
    setOpen(false);
    setActiveIndex(0);
    setError(null);
  }

  function closeAndRestore() {
    setOpen(false);
    setFiltering(false);
    setQuery(selected?.name ?? '');
    setError(null);
  }

  async function createOption() {
    const candidate = query.trim();
    if (candidate.length < 2 || creating) return;
    setCreating(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/catalog/${resource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: candidate }),
      });
      const result = await response.json();
      if (!response.ok) {
        // A duplicate may exist but be inactive (therefore absent from the
        // options list). Reuse it instead of creating another record.
        const duplicate = allOptions.find(
          (option) =>
            normalizeCatalogName(option.name) ===
            normalizeCatalogName(candidate)
        );
        if (duplicate) {
          selectOption(duplicate);
          return;
        }
        setError(result.error ?? 'Não foi possível cadastrar.');
        return;
      }
      const created: CatalogOption = {
        id: result.item.id,
        name: result.item.name,
      };
      setExtraOptions((current) =>
        current.some((option) => option.id === created.id)
          ? current
          : [...current, created]
      );
      onCreated?.(created);
      selectOption(created);
    } catch {
      setError('Não foi possível cadastrar.');
    } finally {
      setCreating(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setFiltering(false);
        return;
      }
      if (entries.length > 0) {
        setActiveIndex((index) => (index + 1) % entries.length);
      }
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setFiltering(false);
        return;
      }
      if (entries.length > 0) {
        setActiveIndex(
          (index) => (index - 1 + entries.length) % entries.length
        );
      }
      return;
    }
    if (event.key === 'Enter') {
      if (!open) return;
      event.preventDefault();
      const entry = entries[safeActiveIndex];
      if (!entry) return;
      if (entry.kind === 'create') {
        void createOption();
      } else {
        selectOption(entry.option);
      }
      return;
    }
    if (event.key === 'Escape') {
      if (!open) return;
      event.preventDefault();
      closeAndRestore();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor={inputId}
        className="block text-xs font-medium text-[#56625c]"
      >
        {label}
      </label>
      <div className="relative mt-2">
        <Search
          size={14}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#919b96]"
        />
        <input
          ref={inputRef}
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && safeActiveIndex >= 0
              ? `${listId}-${safeActiveIndex}`
              : undefined
          }
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setFiltering(true);
            setOpen(true);
            setActiveIndex(0);
            setError(null);
          }}
          onFocus={() => {
            setOpen(true);
            setFiltering(false);
            setActiveIndex(0);
            requestAnimationFrame(() => inputRef.current?.select());
          }}
          onKeyDown={handleKeyDown}
          className="h-10 w-full border border-[#dce2dc] bg-white pl-9 pr-9 text-sm font-normal text-[#303a36] outline-none focus:border-[#58806e] focus:ring-2 focus:ring-[#58806e]/15"
        />
        {creating ? (
          <Loader2
            size={15}
            aria-hidden="true"
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#58806e]"
          />
        ) : (
          selected &&
          !inactiveSelected && (
            <Check
              size={15}
              aria-hidden="true"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#376a58]"
            />
          )
        )}
        <input type="hidden" name={name} value={selected?.id ?? ''} />
      </div>

      {inactiveSelected && (
        <p className="mt-1 text-[10px] text-[#8d5550]">
          Registro inativo. Selecione outro para atualizar o produto.
        </p>
      )}

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto border border-[#dce2dc] bg-white shadow-lg"
        >
          {entries.length === 0 && (
            <li
              role="presentation"
              className="px-3 py-2 text-xs text-[#87918c]"
            >
              {normalizedQuery
                ? 'Nenhum resultado.'
                : 'Nenhum registro cadastrado.'}
            </li>
          )}
          {entries.map((entry, index) => {
            const active = index === safeActiveIndex;
            if (entry.kind === 'create') {
              return (
                <li key="create" role="presentation">
                  <button
                    type="button"
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={active}
                    disabled={creating}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => void createOption()}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-[#183c35] ${active ? 'bg-[#eff5f0]' : 'hover:bg-[#f5f7f4]'}`}
                  >
                    <Plus size={14} aria-hidden="true" />
                    {`Cadastrar "${query.trim()}"`}
                  </button>
                </li>
              );
            }
            const option = entry.option;
            const isSelected = selected?.id === option.id;
            return (
              <li key={option.id} role="presentation">
                <button
                  type="button"
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-[#303a36] ${active ? 'bg-[#eff5f0]' : 'hover:bg-[#f5f7f4]'}`}
                >
                  <span>{option.name}</span>
                  {isSelected && (
                    <Check
                      size={14}
                      aria-hidden="true"
                      className="text-[#376a58]"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-1 text-[11px] text-[#9b3f2b]">
          {error}
        </p>
      )}
    </div>
  );
}
