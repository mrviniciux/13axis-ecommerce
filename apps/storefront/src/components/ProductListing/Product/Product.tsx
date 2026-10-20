'use client';

import type { ProductFromApi } from '@/types/product';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import useCurrencyFormatter from '@/hooks/useCurrencyFormatter';

function Product({ product }: { product: ProductFromApi }) {
  const t = useTranslations('products');
  const currency = useCurrencyFormatter();

  return (
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
  );
}

export default Product;
