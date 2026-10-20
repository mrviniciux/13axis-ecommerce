export const catalogResources = ['categories', 'brands', 'variations'] as const;

export type CatalogResource = (typeof catalogResources)[number];

export function isCatalogResource(value: string): value is CatalogResource {
  return (catalogResources as readonly string[]).includes(value);
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Case- and accent-insensitive key used to compare catalog names in the UI.
// MySQL uses a `_ci` collation, so this mirrors how uniqueness is enforced.
export function normalizeCatalogName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Shared UI/API labels for each catalog resource. Kept in Portuguese to match
// the administrative area, which is not localized yet.
export const catalogLabels: Record<
  CatalogResource,
  { singular: string; plural: string; article: string }
> = {
  categories: { singular: 'categoria', plural: 'Categorias', article: 'a' },
  brands: { singular: 'marca', plural: 'Marcas', article: 'a' },
  variations: { singular: 'variação', plural: 'Variações', article: 'a' },
};
