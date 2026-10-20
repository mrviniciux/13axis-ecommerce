'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { getCurrencyFormatter } from '@/lib/currency';

function useCurrencyFormatter() {
  const locale = useLocale();

  return useMemo(() => getCurrencyFormatter(locale), [locale]);
}

export default useCurrencyFormatter;
