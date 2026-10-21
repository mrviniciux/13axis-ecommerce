'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import ProductListingFilter from '@/components/ProductListing/ProductListingFilter/ProductListingFilter';
import Product from '@/components/ProductListing/Product/Product';
import { Button } from '@/components/ui/button';
import useProductsFilter from '@/hooks/useProductsFilter';
import BenefitsBar from '@/components/BenefitsBar';
import { getCurrencySymbol } from '@/lib/currency';
import type { ProductFromApi } from '@/types/product';

function SearchPage() {
  const t = useTranslations();
  const p = useTranslations('products');
  const n = useTranslations('navbar');
  const locale = useLocale();
  const currencySymbol = getCurrencySymbol(locale);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const query = searchParams.get('search') || '';

  const filters = useProductsFilter(query, 'relevance');

  const sortOptions = [
    { value: 'relevance' as const, label: t('search.sortRelevance') },
    { value: 'price-asc' as const, label: t('search.sortPriceAsc') },
    { value: 'price-desc' as const, label: t('search.sortPriceDesc') },
  ];

  const currentSortLabel =
    sortOptions.find((o) => o.value === filters.sort)?.label ??
    sortOptions[0].label;

  const hasNoResults =
    !filters.loading && filters.filteredProducts.length === 0;

  return (
    <main className="bg-background">
      {/* Banner de benefícios acima do breadcrumb */}
      <BenefitsBar />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="bg-background px-4 py-3 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <ol className="flex flex-wrap text-sm text-muted-foreground gap-1">
            <li>
              <Link href="/" aria-label={n('home')}>
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="mx-1">
              /{' '}
            </li>
            <li className="text-foreground font-medium">
              {t('search.searchResults', { query })}
            </li>
          </ol>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{query}</h1>
            <p
              aria-live="polite"
              className="mt-1 text-sm text-muted-foreground"
              data-testid="search-result-count"
            >
              {p('resultCount', {
                count: filters.filteredProducts.length,
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">
              {t('search.sortBy')}
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentIndex = sortOptions.findIndex(
                  (o) => o.value === filters.sort
                );
                const nextIndex = (currentIndex + 1) % sortOptions.length;
                filters.setSort(sortOptions[nextIndex].value);
              }}
              className="min-w-[140px]"
            >
              {currentSortLabel}
              <span className="ml-2 text-xs text-muted-foreground">▾</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
          <ProductListingFilter filters={filters} />

          <div className="min-w-0">
            {filters.loading ? (
              <div className="flex min-h-56 items-center justify-center">
                <p className="text-muted-foreground">Carregando produtos...</p>
              </div>
            ) : hasNoResults ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background p-12 text-center">
                <p className="text-lg font-medium">{t('search.noResults')}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('search.tryOtherFilters')}
                </p>
                {query.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      (router as any).push({ pathname, query: { search: '' } });
                    }}
                  >
                    Limpar busca
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
                {filters.filteredProducts.map((product: ProductFromApi) => (
                  <Product key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default SearchPage;
