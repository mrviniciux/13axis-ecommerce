import type { ProductsFilter } from '@/hooks/useProductsFilter';
import { useLocale, useTranslations } from 'next-intl';
import { colorOptions, sizeOptions } from '@/config/catalog';
import { getCurrencySymbol } from '@/lib/currency';

type ProductListingFilterProps = {
  filters: ProductsFilter;
};

function ProductListingFilter({ filters }: ProductListingFilterProps) {
  const t = useTranslations('products');
  const locale = useLocale();
  const currencySymbol = getCurrencySymbol(locale);
  const {
    hasActiveFilters,
    selectedColors,
    selectedSizes,
    minimumPrice,
    maximumPrice,
    toggleValue,
    setSelectedColors,
    setSelectedSizes,
    setMinimumPrice,
    setMaximumPrice,
  } = filters;

  return (
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
          {colorOptions.map(({ value, swatch }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <input
                type="checkbox"
                checked={selectedColors.includes(value)}
                onChange={() =>
                  toggleValue(value, selectedColors, setSelectedColors)
                }
                className="size-4 accent-foreground"
              />
              <span
                aria-hidden="true"
                className="size-3 rounded-full border border-black/15"
                style={{ backgroundColor: swatch }}
              />
              {t(`colors.${value}`)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-b border-border py-5">
        <legend className="mb-3 text-sm font-medium">{t('size')}</legend>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((size) => (
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
        <legend className="mb-3 text-sm font-medium">
          {t('price', { currency: currencySymbol })}
        </legend>
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
  );
}

export default ProductListingFilter;
