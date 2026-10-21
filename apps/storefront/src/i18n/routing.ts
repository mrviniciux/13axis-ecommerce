import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { defaultLocale, localeOptions } from '@/config/i18n';

export const routing = defineRouting({
  locales: localeOptions.map((option) => option.value),
  defaultLocale,
  localePrefix: {
    mode: 'always',
    prefixes: {
      'en-US': '/us',
      'pt-BR': '/br',
    },
  },
  pathnames: {
    '/': '/',
    '/loja': '/shop',
    '/shop': {
      'pt-BR': '/loja',
      'en-US': '/shop',
    },
    '/cart': {
      'pt-BR': '/loja',
      'en-US': '/cart',
    },
    '/products/[productId]': {
      'pt-BR': '/produtos/[productId]',
      'en-US': '/products/[productId]',
    },
    '/loja/busca': {
      'pt-BR': '/loja/busca',
      'en-US': '/shop/search',
    },
  },
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
