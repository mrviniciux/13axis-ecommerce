'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

const products = [
  {
    id: 'essential-cotton',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    price: 79.9,
    color: 'white',
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: 'classic-black',
    image:
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
    price: 89.9,
    color: 'black',
    sizes: ['P', 'M', 'G'],
  },
  {
    id: 'oversized-graphite',
    image:
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    price: 119.9,
    color: 'gray',
    sizes: ['M', 'G', 'GG'],
  },
  {
    id: 'soft-pink',
    image:
      'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 94.9,
    color: 'pink',
    sizes: ['P', 'M', 'G'],
  },
  {
    id: 'navy-basic',
    image:
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80',
    price: 84.9,
    color: 'blue',
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: 'earthy-green',
    image:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    price: 99.9,
    color: 'green',
    sizes: ['M', 'G', 'GG'],
  },
  {
    id: 'everyday-white',
    image:
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
    price: 69.9,
    color: 'white',
    sizes: ['P', 'M', 'G'],
  },
  {
    id: 'urban-black',
    image:
      'https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=800&q=80',
    price: 109.9,
    color: 'black',
    sizes: ['M', 'G', 'GG'],
  },
] as const;

const colors = ['black', 'blue', 'gray', 'green', 'pink', 'white'] as const;
const sizes = ['P', 'M', 'G', 'GG'] as const;

const colorValues: Record<(typeof colors)[number], string> = {
  black: '#171717',
  blue: '#254a75',
  gray: '#888888',
  green: '#526c57',
  pink: '#d995a5',
  white: '#ffffff',
};

function ProductListing() {
  const t = useTranslations('products');
  const locale = useLocale();
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minimumPrice, setMinimumPrice] = useState('');
  const [maximumPrice, setMaximumPrice] = useState('');

  const filteredProducts = useMemo(() => {
    const min = minimumPrice === '' ? null : Number(minimumPrice);
    const max = maximumPrice === '' ? null : Number(maximumPrice);

    return products.filter(
      (product) =>
        (selectedColors.length === 0 ||
          selectedColors.includes(product.color)) &&
        (selectedSizes.length === 0 ||
          product.sizes.some((size) => selectedSizes.includes(size))) &&
        (min === null || product.price >= min) &&
        (max === null || product.price <= max)
    );
  }, [maximumPrice, minimumPrice, selectedColors, selectedSizes]);

  const currency = new Intl.NumberFormat(
    locale === 'pt-BR' ? 'pt-BR' : 'en-US',
    { style: 'currency', currency: 'BRL' }
  );
  const hasActiveFilters =
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    minimumPrice !== '' ||
    maximumPrice !== '';

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
      className="bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
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
            className="rounded-lg border border-border bg-white p-5"
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

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-lg border border-border bg-white transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                    <Image
                      src={product.image}
                      alt={t('imageAlt', { name: t(`items.${product.id}`) })}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1280px) 28vw, 240px"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h2 className="line-clamp-2 min-h-10 text-sm font-medium leading-5 sm:text-base">
                      {t(`items.${product.id}`)}
                    </h2>
                    <p className="mt-2 text-base font-semibold sm:text-lg">
                      {currency.format(product.price)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t(`colors.${product.color}`)}
                      <span aria-hidden="true"> · </span>
                      {t('availableSizes', {
                        sizes: product.sizes.join(', '),
                      })}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-border bg-white p-6 text-center">
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
