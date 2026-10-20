'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ProductFromApi } from '@/types/product';
import ProductListingFilter from './ProductListingFilter';
import useProductsFilter from '@/hooks/useProductsFilter';

function ProductListing() {
  const t = useTranslations('products');
  const locale = useLocale();
  const filters = useProductsFilter();
  const { filteredProducts, loading } = filters;

  const currency = new Intl.NumberFormat(
    locale === 'pt-BR' ? 'pt-BR' : 'en-US',
    { style: 'currency', currency: 'BRL' }
  );

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
              {filteredProducts.map((product: ProductFromApi) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-lg border border-border bg-background transition-shadow hover:shadow-md"
                >
                  <Link
                    href={{
                      pathname: '/products/[productId]',
                      params: { productId: product.id },
                    }}
                    className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                      <Image
                        src={product.image || '/placeholder.svg'}
                        alt={t('imageAlt', { name: product.name })}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1280px) 28vw, 240px"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <h2 className="line-clamp-2 min-h-10 text-sm font-medium leading-5 sm:text-base">
                        {product.name}
                      </h2>
                      <p className="mt-2 text-base font-semibold sm:text-lg">
                        {currency.format(product.price)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {product.color}
                        <span aria-hidden="true"> · </span>
                        {t('availableSizes', {
                          sizes: product.sizes.join(', '),
                        })}
                      </p>
                    </div>
                  </Link>
                </article>
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
