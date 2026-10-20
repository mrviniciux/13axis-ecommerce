'use client';

import { useMemo, useState } from 'react';
import type { ProductFromApi } from '@/types/product';

function useProductsFilter(products: ProductFromApi[]) {
  const [minimumPrice, setMinimumPrice] = useState('');
  const [maximumPrice, setMaximumPrice] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

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
  }, [maximumPrice, minimumPrice, products, selectedColors, selectedSizes]);

  const hasActiveFilters =
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    minimumPrice !== '' ||
    maximumPrice !== '';

  return {
    filteredProducts,
    hasActiveFilters,
    selectedColors,
    setSelectedColors,
    selectedSizes,
    setSelectedSizes,
    minimumPrice,
    setMinimumPrice,
    maximumPrice,
    setMaximumPrice,
  };
}

export default useProductsFilter;
