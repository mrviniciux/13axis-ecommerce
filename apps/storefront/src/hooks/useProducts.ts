'use client';

import { useEffect, useState } from 'react';
import useProductsFilter from './useProductsFilter';
import type { ProductFromApi } from '@/types/product';

function useProducts() {
  const [products, setProducts] = useState<ProductFromApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Não foi possível carregar os produtos.');
        }
        const data = await response.json();
        if (!cancelled) {
          setProducts(data.products || []);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const filters = useProductsFilter(products);

  return {
    products,
    loading,
    ...filters,
  };
}

export default useProducts;
