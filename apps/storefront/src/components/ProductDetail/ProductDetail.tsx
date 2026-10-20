'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Check, ShoppingBag } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useCartStore } from '@/lib/cart-store';

interface ProductFromApi {
  id: string;
  name: string;
  image: string;
  price: number;
  color: string;
  sizes: string[];
}

function ProductDetail({ product }: { product: ProductFromApi }) {
  const t = useTranslations('products');
  const locale = useLocale();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeError, setShowSizeError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const productName = product.name;
  const currency = new Intl.NumberFormat(
    locale === 'pt-BR' ? 'pt-BR' : 'en-US',
    { style: 'currency', currency: 'BRL' }
  );

  function handleAddToCart() {
    if (!selectedSize) {
      setShowSizeError(true);
      return;
    }

    addItem();
    setAddedToCart(true);
    setShowSizeError(false);
  }

  return (
    <main className="bg-muted/30 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <nav
          aria-label={t('detail.breadcrumbLabel')}
          className="mb-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {t('detail.backToProducts')}
          </Link>
          <span aria-hidden="true">/</span>
          <span>{t('detail.category')}</span>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-foreground">
            {productName}
          </span>
        </nav>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
          <section
            aria-label={t('detail.galleryLabel', { name: productName })}
            className="grid gap-3 sm:grid-cols-[76px_minmax(0,1fr)]"
          >
            <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col">
              <div
                aria-hidden="true"
                className="relative size-[68px] shrink-0 overflow-hidden rounded-md border-2 border-primary bg-background p-1"
              >
                <Image
                  src={product.image}
                  alt=""
                  fill
                  sizes="68px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="relative order-1 aspect-[4/5] max-h-[760px] overflow-hidden rounded-lg bg-background sm:order-2">
              <Image
                src={product.image}
                alt={t('imageAlt', { name: productName })}
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 760px"
                className="object-cover"
              />
            </div>
          </section>

          <section
            aria-labelledby="product-detail-title"
            className="rounded-lg border border-border bg-background p-5 sm:p-7 lg:sticky lg:top-6"
          >
            <p className="mb-2 text-sm text-muted-foreground">
              {t('detail.category')}
            </p>
            <h1
              id="product-detail-title"
              className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl"
            >
              {productName}
            </h1>
            <p className="mt-5 text-3xl font-semibold tracking-tight">
              {currency.format(product.price)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('detail.priceDisclaimer')}
            </p>

            <div className="mt-7 border-t border-border pt-6">
              <p className="text-sm font-medium">
                {t('detail.color')}: {t(`colors.${product.color}`)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span
                  aria-label={t(`colors.${product.color}`)}
                  className="size-8 rounded-full border border-border shadow-sm"
                  style={{
                    backgroundColor:
                      product.color === 'white'
                        ? '#ffffff'
                        : product.color === 'black'
                          ? '#171717'
                          : product.color === 'blue'
                            ? '#254a75'
                            : product.color === 'gray'
                              ? '#888888'
                              : product.color === 'green'
                                ? '#526c57'
                                : product.color === 'brown'
                                  ? '#6f4e37'
                                  : '#d995a5',
                  }}
                />
              </div>
            </div>

            <fieldset className="mt-7">
              <legend className="text-sm font-medium">
                {t('detail.chooseSize')}
                {selectedSize && (
                  <span className="ml-1 font-normal text-muted-foreground">
                    {t('detail.selectedSize', { size: selectedSize })}
                  </span>
                )}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={selectedSize === size}
                    onClick={() => {
                      setSelectedSize(size);
                      setShowSizeError(false);
                    }}
                    className={`min-h-11 min-w-12 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selectedSize === size
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {showSizeError && (
                <p role="alert" className="mt-2 text-sm text-destructive">
                  {t('detail.sizeRequired')}
                </p>
              )}
            </fieldset>

            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {addedToCart ? (
                <Check aria-hidden="true" className="size-5" />
              ) : (
                <ShoppingBag aria-hidden="true" className="size-5" />
              )}
              {t('detail.addToCart')}
            </button>
            <p aria-live="polite" className="mt-3 min-h-5 text-center text-sm">
              {addedToCart ? (
                <span className="text-green-700 dark:text-green-400">
                  {t('detail.addedToCart')}
                </span>
              ) : null}
            </p>
          </section>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
          <div className="space-y-8">
            <section
              aria-labelledby="product-characteristics-title"
              className="rounded-lg border border-border bg-background p-5 sm:p-7"
            >
              <h2
                id="product-characteristics-title"
                className="text-xl font-semibold"
              >
                {t('detail.characteristics')}
              </h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-md bg-muted/50 p-4">
                  <dt className="text-sm text-muted-foreground">
                    {t('detail.color')}
                  </dt>
                  <dd className="mt-1 font-medium">
                    {t(`colors.${product.color}`)}
                  </dd>
                </div>
                <div className="rounded-md bg-muted/50 p-4">
                  <dt className="text-sm text-muted-foreground">
                    {t('detail.availableSizesLabel')}
                  </dt>
                  <dd className="mt-1 font-medium">
                    {product.sizes.join(', ')}
                  </dd>
                </div>
              </dl>
            </section>

            <section
              aria-labelledby="product-description-title"
              className="rounded-lg border border-border bg-background p-5 sm:p-7"
            >
              <h2
                id="product-description-title"
                className="text-xl font-semibold"
              >
                {t('detail.description')}
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                {t('detail.descriptionText', { name: productName })}
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetail;
