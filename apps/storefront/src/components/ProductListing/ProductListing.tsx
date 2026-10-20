'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import useProducts from '@/hooks/useProducts';
import { ProductFromApi } from '@/types/product';

const colors = ['black', 'blue', 'gray', 'green', 'brown', 'white'] as const;
const sizes = ['P', 'M', 'G', 'GG'] as const;

const colorValues: Record<(typeof colors)[number], string> = {
  black: '#171717',
  blue: '#254a75',
  gray: '#888888',
  green: '#526c57',
  brown: '#6f4e37',
  white: '#ffffff',
};

function ProductListing() {
  const t = useTranslations('products');
  const locale = useLocale();
  const {
    loading,
    hasActiveFilters,
    filteredProducts,
    selectedColors,
    selectedSizes,
    minimumPrice,
    maximumPrice,
    setSelectedColors,
    setSelectedSizes,
    setMinimumPrice,
    setMaximumPrice,
  } = useProducts();

  const currency = new Intl.NumberFormat(
    locale === 'pt-BR' ? 'pt-BR' : 'en-US',
    { style: 'currency', currency: 'BRL' }
  );

  function toggleValue(
    value: string,
    selected: string[],
    setSelected: (values: string[]) => void
  ) {
    setSelected(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  }

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
          <aside
            aria-label={t('filters')}
            className="rounded-lg border border-border bg-background p-5"
          >
            <div className="mb-5 flex items-center justify-between gap-2">
              <h2 className="font-semibold">{t('filters')}</h2>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedColors([]);
                    setSelectedSizes([]);
                    setMinimumPrice('');
                    setMaximumPrice('');
                  }}
                  className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  {t('clearFilters')}
                </button>
              )}
            </div>

            <fieldset className="border-b border-border pb-5">
              <legend className="mb-3 text-sm font-medium">{t('color')}</legend>
              <div className="grid grid-cols-2 gap-2">
                {colors.map((color) => (
                  <label
                    key={color}
                    className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(color)}
                      onChange={() =>
                        toggleValue(color, selectedColors, setSelectedColors)
                      }
                      className="size-4 accent-foreground"
                    />
                    <span
                      aria-hidden="true"
                      className="size-3 rounded-full border border-black/15"
                      style={{ backgroundColor: colorValues[color] }}
                    />
                    {t(`colors.${color}`)}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="border-b border-border py-5">
              <legend className="mb-3 text-sm font-medium">{t('size')}</legend>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <label
                    key={size}
                    className={`flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded border px-2 text-sm transition-colors ${
                      selectedSizes.includes(size)
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground'
                    } focus-within:ring-2 focus-within:ring-ring`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={() =>
                        toggleValue(size, selectedSizes, setSelectedSizes)
                      }
                      className="sr-only"
                    />
                    {size}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="pt-5">
              <legend className="mb-3 text-sm font-medium">{t('price')}</legend>
              <div className="flex items-center gap-2">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">{t('minimumPrice')}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    placeholder={t('minimumPrice')}
                    value={minimumPrice}
                    onChange={(event) => setMinimumPrice(event.target.value)}
                    className="h-10 w-full min-w-0 rounded border border-input bg-background px-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
                <span aria-hidden="true" className="text-muted-foreground">
                  –
                </span>
                <label className="min-w-0 flex-1">
                  <span className="sr-only">{t('maximumPrice')}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    placeholder={t('maximumPrice')}
                    value={maximumPrice}
                    onChange={(event) => setMaximumPrice(event.target.value)}
                    className="h-10 w-full min-w-0 rounded border border-input bg-background px-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
              </div>
            </fieldset>
          </aside>

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
