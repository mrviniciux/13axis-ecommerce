'use client';

import { useState, type ComponentProps } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  CircleHelp,
  CircleUserRound,
  type LucideIcon,
  Menu,
  Search,
  ShoppingCart,
  Truck,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from '@/i18n/routing';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import NavMenu from '@/components/NavMenu';
import { ListItem } from '@/components/NavMenu/NavMenu';
import { Button } from '../ui/button';

const quickLinks: {
  id: string;
  label: 'support' | 'tracking' | 'account';
  icon: LucideIcon;
}[] = [
  { id: 'support', label: 'support', icon: CircleHelp },
  { id: 'tracking', label: 'tracking', icon: Truck },
  { id: 'account', label: 'account', icon: CircleUserRound },
];

const localeOptions = [
  { value: 'pt-BR', label: 'portuguese', flag: '🇧🇷' },
  { value: 'en-US', label: 'english', flag: '🇺🇸' },
] as const;

type LocaleOption = (typeof localeOptions)[number]['value'];

function isLocaleOption(value: string): value is LocaleOption {
  return localeOptions.some((option) => option.value === value);
}

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
}: {
  className?: string;
  homeLabel: string;
  logoAlt: string;
}) {
  return (
    <Link href="/" aria-label={homeLabel} className={className}>
      <Image
        src="/logo.png"
        alt={logoAlt}
        width={80}
        height={80}
        className="h-20 w-auto"
      />
    </Link>
  );
}

type CartButtonProps = {
  quantity: number;
  label: string;
  onClick: ComponentProps<typeof Button>['onClick'];
  compact?: boolean;
};

function CartButton({
  quantity,
  label,
  onClick,
  compact = false,
}: CartButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`relative shrink-0 ${compact ? '' : 'size-11'}`}
      onClick={onClick}
      aria-label={label}
    >
      <ShoppingCart aria-hidden="true" className="size-7" />
      <span
        className={`absolute -top-0.5 -right-1 flex items-center justify-center rounded-full bg-neutral-800 font-semibold text-white ${
          compact ? 'size-5 text-[10px]' : 'size-6 text-xs'
        }`}
      >
        {quantity}
      </span>
    </Button>
  );
}

type LanguageSelectProps = {
  locale: string;
  label: string;
  options: { value: LocaleOption; label: string; flag: string }[];
  onValueChange: (value: string | null) => void;
  className?: string;
};

function LanguageSelect({
  locale,
  label,
  options,
  onValueChange,
  className,
}: LanguageSelectProps) {
  return (
    <Select value={locale} onValueChange={onValueChange}>
      <SelectTrigger aria-label={label} className={className}>
        <SelectValue>
          {(value: string | null) => {
            const selectedOption = options.find(
              (option) => option.value === value
            );

            return selectedOption ? (
              <>
                <span aria-hidden="true">{selectedOption.flag}</span>
                <span className="sr-only">{selectedOption.label}</span>
              </>
            ) : null;
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            aria-label={option.label}
            title={option.label}
          >
            <span aria-hidden="true">{option.flag}</span>
            <span className="sr-only">{option.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Navbar() {
  const t = useTranslations('navbar');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  // TODO: Implement real cart behavior; this count is currently UI-only.
  const [quantity, setQuantity] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLocaleChange(value: string | null) {
    if (value && isLocaleOption(value)) {
      router.replace(pathname, { locale: value });
    }
  }

  const languageOptions = localeOptions.map((option) => ({
    value: option.value,
    label: t(option.label),
    flag: option.flag,
  }));

  return (
    <header className="relative w-full bg-white text-neutral-800">
      <div className="hidden h-[104px] items-center lg:flex">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-[var(--navbar-inline-spacing)]">
          <BrandLink
            className="shrink-0"
            homeLabel={t('home')}
            logoAlt={t('logoAlt')}
          />

          <div className="relative w-[min(28vw,400px)] shrink-0">
            <Input
              type="search"
              placeholder={t('search')}
              aria-label={t('search')}
              className="h-14 rounded-lg border-neutral-200 bg-white pl-8 pr-12 text-base shadow-sm placeholder:text-neutral-500"
            />
            <Search
              aria-hidden="true"
              className="absolute top-1/2 right-4 size-5 -translate-y-1/2"
            />
          </div>

          <nav
            aria-label={t('quickLinks')}
            className="flex w-[min(52vw,760px)] items-center justify-between gap-4 xl:gap-8"
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
                      iconClassName="size-6"
                    />
                  }
                >
                  <ListItem href="/docs" title={t('contactTitle')}>
                    {t('contact')}
                  </ListItem>
                </NavMenu>
              ) : (
                <QuickLinkContent
                  key={id}
                  icon={icon}
                  label={t(label)}
                  className="whitespace-nowrap text-sm"
                  iconClassName="size-7 shrink-0"
                />
              )
            )}
            <CartButton
              quantity={quantity}
              label={t('cart', { quantity })}
              onClick={() => setQuantity((prev) => prev + 1)}
            />
            <LanguageSelect
              locale={locale}
              label={t('language')}
              options={languageOptions}
              onValueChange={handleLocaleChange}
            />
          </nav>
        </div>
      </div>

      <div className="flex h-8 items-center justify-center bg-neutral-500 px-2 text-center text-[11px] font-semibold tracking-wide text-white lg:hidden">
        {t('promotion')}
      </div>

      <div className="relative flex h-16 items-center justify-between border-b border-neutral-200 px-2.5 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X aria-hidden="true" className="size-6" />
          ) : (
            <Menu aria-hidden="true" className="size-6" />
          )}
        </Button>

        <BrandLink
          className="absolute left-1/2 -translate-x-1/2"
          homeLabel={t('home')}
          logoAlt={t('logoAlt')}
        />
        <CartButton
          quantity={quantity}
          label={t('cart', { quantity })}
          onClick={() => setQuantity((prev) => prev + 1)}
          compact
        />
      </div>

      {menuOpen && (
        <nav
          aria-label={t('mainMenu')}
          className="absolute top-full left-0 z-50 w-full border-b border-neutral-200 bg-white px-4 py-3 shadow-md lg:hidden"
        >
          {quickLinks.map(({ id, label, icon }, index) => (
            <QuickLinkContent
              key={id}
              icon={icon}
              label={t(label)}
              className={`py-3 text-sm ${
                index < quickLinks.length - 1
                  ? 'border-b border-neutral-100'
                  : ''
              }`}
            />
          ))}
          <div className="border-t border-neutral-100 pt-3">
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
    </header>
  );
}

export default Navbar;
