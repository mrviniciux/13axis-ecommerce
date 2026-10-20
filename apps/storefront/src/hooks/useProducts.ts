'use client';

import useSWR from 'swr';
import type { ProductFromApi } from '@/types/product';

type ProductsResponse = {
  products?: ProductFromApi[];
};

async function fetchProducts(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Não foi possível carregar os produtos.');
  }
  return (await response.json()) as ProductsResponse;
}

function useProducts(query = '') {
  const key = query ? `/api/products?${query}` : '/api/products';
  const { data, error, isLoading } = useSWR<ProductsResponse, Error>(
    key,
    fetchProducts,
    {
      dedupingInterval: 60_000,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return {
    products: data?.products ?? [],
    loading: isLoading,
    error,
  };
}

export default useProducts;
