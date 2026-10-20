'use client';

import { useTranslations } from 'next-intl';

import ProductListingFilter from './ProductListingFilter';
import useProductsFilter from '@/hooks/useProductsFilter';
import Product from './Product';

function ProductListing() {
  const t = useTranslations('products');
  const filters = useProductsFilter();
  const { filteredProducts, loading } = filters;

  return (
    <section
      aria-labelledby="product-listing-title"
      className="bg-muted/40 px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t('eyebrow')}
            </p>
            <h1
              id="product-listing-title"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              {t('title')}
            </h1>
          </div>
          <p
            aria-live="polite"
            className="text-sm text-muted-foreground"
            data-testid="product-count"
          >
            {t('resultCount', { count: filteredProducts.length })}
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <ProductListingFilter filters={filters} />

          {loading ? (
            <div className="flex min-h-56 items-center justify-center">
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <Product key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
              <div>
                <h2 className="font-medium">{t('emptyTitle')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('emptyDescription')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductListing;
