'use client';

import { useState, useRef, useEffect, type ComponentProps } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import {
  CircleHelp,
  CircleUserRound,
  type LucideIcon,
  Menu,
  MoreVertical,
  Search,
  Truck,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from '@/i18n/routing';
import { localeOptions } from '@/config/i18n';
import { Input } from '@/components/ui/input';
import NavMenu from '@/components/NavMenu';
import { ListItem } from '@/components/NavMenu/NavMenu';
import { Button } from '../ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';
import { useCartStore } from '@/lib/cart-store';
import LanguageSelect from '../LanguageSelect';
import CartButton from '../CartButton';
import OverflowMenu from './OverflowMenu';
import CartDrawer from '../CartDrawer';

// ─── Data ────────────────────────────────────────────────────────────────────

const quickLinks: {
  id: string;
  label: 'support' | 'tracking' | 'account';
  icon: LucideIcon;
}[] = [
  { id: 'support', label: 'support', icon: CircleHelp },
  { id: 'tracking', label: 'tracking', icon: Truck },
  { id: 'account', label: 'account', icon: CircleUserRound },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

type QuickLinkContentProps = {
  icon: LucideIcon;
  label: string;
  className?: string;
  iconClassName?: string;
};

function QuickLinkContent({
  icon: Icon,
  label,
  className,
  iconClassName = 'size-5 shrink-0',
}: QuickLinkContentProps) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <Icon aria-hidden="true" className={iconClassName} />
      <span>{label}</span>
    </div>
  );
}

function BrandLink({
  className,
  homeLabel,
  logoAlt,
  compact = false,
}: {
  className?: string;
  homeLabel: string;
  logoAlt: string;
  compact?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const logoSrc =
    resolvedTheme === 'dark'
      ? '/emblema-sem-fundo-branco.png'
      : '/emblema-sem-fundo-preto.png';

  return (
    <Link href="/" aria-label={homeLabel} className={className}>
      <Image
        src={logoSrc}
        alt={logoAlt}
        width={80}
        height={80}
        className={compact ? 'h-10 w-auto' : 'h-16 w-auto'}
      />
    </Link>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

export type LocaleOption = (typeof localeOptions)[number]['value'];

function Navbar() {
  const t = useTranslations('navbar');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams<{ productId: string }>();
  const quantity = useCartStore((state) => state.quantity);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  function isLocaleOption(value: string): value is LocaleOption {
    return localeOptions.some((option) => option.value === value);
  }

  function handleLocaleChange(value: string | null) {
    if (value && isLocaleOption(value)) {
      if (pathname === '/products/[productId]') {
        router.replace(
          {
            pathname: '/products/[productId]',
            params: { productId: params.productId },
          },
          { locale: value }
        );
        return;
      }
      router.replace(pathname, { locale: value });
    }
  }

  const languageOptions = localeOptions.map((option) => ({
    value: option.value,
    label: t(option.label),
    flag: option.flag,
  }));

  return (
    <header className="relative w-full bg-background text-foreground">
      {/* ══════════════════════════════════════════════════════════════
          DESKTOP  lg+
          logo | search | quicklinks | theme | language | cart
          ══════════════════════════════════════════════════════════════ */}
      <div className="hidden h-[88px] items-center lg:flex">
        <div className="mx-auto flex w-full max-w-[1440px] items-center gap-6 px-[var(--navbar-inline-spacing)]">
          <BrandLink homeLabel={t('home')} logoAlt={t('logoAlt')} />

          <div className="relative min-w-0 flex-1 max-w-[400px]">
            <Input
              type="search"
              placeholder={t('search')}
              aria-label={t('search')}
              className="h-11 rounded-lg pl-4 pr-10 text-sm shadow-sm"
            />
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>

          <nav
            aria-label={t('quickLinks')}
            className="flex shrink-0 items-center gap-5 xl:gap-7"
          >
            {quickLinks.map(({ id, label, icon }) =>
              id === 'support' ? (
                <NavMenu
                  key={id}
                  title={
                    <QuickLinkContent
                      icon={icon}
                      label={t(label)}
                      className="gap-2 text-sm font-normal"
                      iconClassName="size-5"
                    />
                  }
                >
                  <ListItem
                    href="https://wa.me/5548999999999"
                    title={t('contactTitle')}
                  >
                    {t('contact')}
                  </ListItem>
                </NavMenu>
              ) : (
                <QuickLinkContent
                  key={id}
                  icon={icon}
                  label={t(label)}
                  className="whitespace-nowrap text-sm"
                  iconClassName="size-5 shrink-0"
                />
              )
            )}

            <ThemeToggle
              variant="icon"
              lightLabel={t('themeLight')}
              darkLabel={t('themeDark')}
            />
            <LanguageSelect
              locale={locale}
              label={t('language')}
              options={languageOptions}
              onValueChange={handleLocaleChange}
            />
            <CartButton
              quantity={quantity}
              label={t('cart', { quantity })}
              onClick={() => setCartOpen(true)}
            />
          </nav>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TABLET  md – lg
          logo | search | quicklinks | cart | overflow(theme+lang)
          ══════════════════════════════════════════════════════════════ */}
      <div className="hidden h-16 items-center border-b border-border px-4 md:flex lg:hidden">
        <BrandLink
          homeLabel={t('home')}
          logoAlt={t('logoAlt')}
          compact
          className="shrink-0 mr-4"
        />

        <div className="relative min-w-0 flex-1 max-w-[320px] mr-4">
          <Input
            type="search"
            placeholder={t('search')}
            aria-label={t('search')}
            className="h-9 rounded-lg pl-4 pr-9 text-sm"
          />
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
        </div>

        <nav
          aria-label={t('quickLinks')}
          className="flex shrink-0 items-center gap-3 mr-auto"
        >
          {quickLinks.map(({ id, label, icon }) =>
            id === 'support' ? (
              <NavMenu
                key={id}
                title={
                  <QuickLinkContent
                    icon={icon}
                    label={t(label)}
                    className="gap-1.5 text-sm font-normal"
                    iconClassName="size-4"
                  />
                }
              >
                <ListItem
                  href="https://wa.me/5548999999999"
                  title={t('contactTitle')}
                >
                  {t('contact')}
                </ListItem>
              </NavMenu>
            ) : (
              <QuickLinkContent
                key={id}
                icon={icon}
                label={t(label)}
                className="whitespace-nowrap text-sm"
                iconClassName="size-4 shrink-0"
              />
            )
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1 ml-3">
          <CartButton
            quantity={quantity}
            label={t('cart', { quantity })}
            onClick={() => setCartOpen(true)}
            compact
          />
          <OverflowMenu
            t={t}
            locale={locale}
            languageOptions={languageOptions}
            onLocaleChange={handleLocaleChange}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE  < md
          promo bar | hamburger | logo | cart
          ══════════════════════════════════════════════════════════════ */}
      <div className="flex h-8 items-center justify-center bg-muted px-2 text-center text-[11px] font-semibold tracking-wide text-muted-foreground md:hidden">
        {t('promotion')}
      </div>

      <div className="relative flex h-14 items-center justify-between border-b border-border px-2.5 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
        </Button>

        <BrandLink
          className="absolute left-1/2 -translate-x-1/2"
          homeLabel={t('home')}
          logoAlt={t('logoAlt')}
          compact
        />

        <CartButton
          quantity={quantity}
          label={t('cart', { quantity })}
          onClick={() => setCartOpen(true)}
          compact
        />
      </div>

      {/* Search bar — mobile only, full width below the header row */}
      <div className="border-b border-border px-3 py-2 md:hidden">
        <div className="relative w-full">
          <Input
            type="search"
            placeholder={t('search')}
            aria-label={t('search')}
            className="h-9 w-full rounded-lg pl-4 pr-9 text-sm"
          />
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <nav
          aria-label={t('mainMenu')}
          className="absolute top-full left-0 z-50 w-full border-b border-border bg-background px-4 py-3 shadow-md md:hidden"
        >
          {quickLinks.map(({ id, label, icon }, index) => (
            <QuickLinkContent
              key={id}
              icon={icon}
              label={t(label)}
              className={`py-3 text-sm ${
                index < quickLinks.length - 1 ? 'border-b border-border' : ''
              }`}
            />
          ))}

          <ThemeToggle
            variant="row"
            lightLabel={t('themeLight')}
            darkLabel={t('themeDark')}
            className="w-full border-b border-border"
          />

          <div className="border-t border-border pt-3">
            <span className="mb-2 block text-sm font-medium">
              {t('language')}
            </span>
            <LanguageSelect
              locale={locale}
              label={t('language')}
              options={languageOptions}
              onValueChange={handleLocaleChange}
              className="w-full"
            />
          </div>
        </nav>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}

export default Navbar;
