'use client';

import { useMemo, useState } from 'react';
import useProducts from './useProducts';

function useProductsFilter(
  initialSearch = '',
  initialSort: 'relevance' | 'price-asc' | 'price-desc' = 'relevance'
) {
  const [minimumPrice, setMinimumPrice] = useState('');
  const [maximumPrice, setMaximumPrice] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<'relevance' | 'price-asc' | 'price-desc'>(
    initialSort
  );

  const query = useMemo(() => {
    const params = new URLSearchParams();

    if (search) {
      params.set('search', search);
    }

    if (sort !== 'relevance') {
      params.set('sort', sort);
    }

    if (selectedColors.length > 0) {
      params.set('colors', selectedColors.join(','));
    }

    if (selectedSizes.length > 0) {
      params.set('sizes', selectedSizes.join(','));
    }

    if (minimumPrice !== '') {
      params.set('minPrice', minimumPrice);
    }

    if (maximumPrice !== '') {
      params.set('maxPrice', maximumPrice);
    }

    return params.toString();
  }, [maximumPrice, minimumPrice, search, selectedColors, selectedSizes, sort]);

  const { products: filteredProducts, loading, error } = useProducts(query);

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

  return {
    toggleValue,
    filteredProducts,
    loading,
    error,
    hasActiveFilters,
    search,
    setSearch,
    sort,
    setSort,
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

export type ProductsFilter = ReturnType<typeof useProductsFilter>;

export default useProductsFilter;
