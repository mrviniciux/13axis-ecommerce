'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/routing';
import { Search, X, ChevronRight } from 'lucide-react';
import Image from 'next/image';

type SuggestionProduct = {
  id: string;
  name: string;
  image: string | null;
};

type SuggestionsResponse = {
  words: string[];
  products: SuggestionProduct[];
};

type SearchSuggestionsProps = {
  className?: string;
};

function SearchSuggestions({ className }: SearchSuggestionsProps) {
  const t = useTranslations('search');
  const n = useTranslations('navbar');
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [products, setProducts] = useState<SuggestionProduct[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (value.trim().length >= 2) {
        debounceRef.current = setTimeout(async () => {
          try {
            const response = await fetch(
              `/api/search/suggestions?q=${encodeURIComponent(value)}`
            );
            const data: SuggestionsResponse = await response.json();
            setWords(data.words);
            setProducts(data.products);
            setOpen(true);
          } catch {
            setWords([]);
            setProducts([]);
          }
        }, 250);
      } else {
        setWords([]);
        setProducts([]);
        setOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (query.trim().length >= 2) {
        router.push({
          pathname: '/loja/busca',
          query: { search: query.trim() },
        });
        setOpen(false);
      }
    }
    if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleSelectWord = (word: string) => {
    setQuery(word);
    setOpen(false);
    router.push({
      pathname: '/loja/busca',
      query: { search: word },
    });
  };

  const handleSelectProduct = () => {
    setOpen(false);
  };

  const handleFocus = () => {
    if (query.trim().length >= 2) {
      setOpen(true);
    }
  };

  const handleBlur = () => {
    // Pequeno atraso para permitir clique nas sugestões antes de fechar
    setTimeout(() => setOpen(false), 150);
  };

  const clearSearch = () => {
    setQuery('');
    setWords([]);
    setProducts([]);
    setOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const isSearchPage =
    pathname.includes('/loja/busca') || pathname.includes('/shop/search');

  return (
    <div className={`relative min-w-0 flex-1 max-w-[400px] ${className ?? ''}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          placeholder={t('products')}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full h-11 rounded-lg pl-4 pr-16 text-sm shadow-sm border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring no-search-cancel"
          aria-label={n('search')}
        />
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        {query.length > 0 && !isSearchPage && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute top-1/2 right-10 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpar busca"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
          {words.length > 0 && (
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t('suggestions')}
              </p>
              <div className="flex flex-col gap-1">
                {words.map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => handleSelectWord(word)}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          )}
          {products.length > 0 && (
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t('products')}
              </p>
              <div className="flex flex-col gap-2">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={{
                      pathname: '/products/[productId]',
                      params: { productId: product.id } as {
                        productId: string;
                      },
                    }}
                    onClick={handleSelectProduct}
                    className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors block"
                  >
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={32}
                        height={32}
                        className="shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="shrink-0 size-8 rounded-md bg-muted flex items-center justify-center">
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="truncate text-foreground line-clamp-1">
                      {product.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {words.length === 0 && products.length === 0 && (
            <div className="px-3 py-3 text-sm text-muted-foreground">
              Nenhuma sugestão encontrada
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchSuggestions;
