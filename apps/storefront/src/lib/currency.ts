import { appConfig } from '@/config/app';

type CurrencyFormatOptions = Omit<
  Intl.NumberFormatOptions,
  'style' | 'currency'
>;

const formatterCache = new Map<string, Intl.NumberFormat>();

export function getCurrencyFormatter(
  locale: string,
  options: CurrencyFormatOptions = {}
) {
  const cacheKey = `${locale}:${JSON.stringify(options)}`;
  let formatter = formatterCache.get(cacheKey);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: appConfig.currency,
      ...options,
    });
    formatterCache.set(cacheKey, formatter);
  }

  return formatter;
}

export function formatCurrency(
  value: number,
  locale: string,
  options?: CurrencyFormatOptions
) {
  return getCurrencyFormatter(locale, options).format(value);
}

export function getCurrencySymbol(locale: string) {
  return (
    getCurrencyFormatter(locale)
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value ?? appConfig.currency
  );
}
