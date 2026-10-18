'use client';

import { useState, type ComponentProps } from 'react';
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
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import NavMenu from '@/components/NavMenu';
import { ListItem } from '@/components/NavMenu/NavMenu';
import { Button } from '../ui/button';

const quickLinks: {
  id: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: 'support', label: 'Atendimento', icon: CircleHelp },
  { id: 'tracking', label: 'Rastrear pedido', icon: Truck },
  { id: 'account', label: 'Minha Conta', icon: CircleUserRound },
];

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

function BrandLink({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Página inicial" className={className}>
      <img src="/logo.png" alt="Logo da empresa" className="h-20 w-auto" />
    </Link>
  );
}

type CartButtonProps = {
  quantity: number;
  onClick: ComponentProps<typeof Button>['onClick'];
  compact?: boolean;
};

function CartButton({ quantity, onClick, compact = false }: CartButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`relative shrink-0 ${compact ? '' : 'size-11'}`}
      onClick={onClick}
      aria-label={`Carrinho, ${quantity} itens`}
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

function Navbar() {
  const [quantity, setQuantity] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative w-full bg-white text-neutral-800">
      <div className="hidden h-[104px] items-center lg:flex">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-[var(--navbar-inline-spacing)]">
          <BrandLink className="shrink-0" />

          <div className="relative w-[min(28vw,400px)] shrink-0">
            <Input
              type="search"
              placeholder="O que deseja procurar?"
              aria-label="O que deseja procurar?"
              className="h-14 rounded-lg border-neutral-200 bg-white pl-8 pr-12 text-base shadow-sm placeholder:text-neutral-500"
            />
            <Search
              aria-hidden="true"
              className="absolute top-1/2 right-4 size-5 -translate-y-1/2"
            />
          </div>

          <nav
            aria-label="Links rápidos"
            className="flex w-[min(40vw,680px)] items-center justify-between gap-4 xl:gap-8"
          >
            {quickLinks.map(({ id, label, icon }) =>
              id === 'support' ? (
                <NavMenu
                  key={id}
                  title={
                    <QuickLinkContent
                      icon={icon}
                      label={label}
                      className="gap-2 text-sm font-normal"
                      iconClassName="size-6"
                    />
                  }
                >
                  <ListItem href="/docs" title="Fale conosco">
                    Whatsapp: 48 9 9999-9999
                  </ListItem>
                </NavMenu>
              ) : (
                <QuickLinkContent
                  key={id}
                  icon={icon}
                  label={label}
                  className="whitespace-nowrap text-sm"
                  iconClassName="size-7 shrink-0"
                />
              )
            )}
            <CartButton
              quantity={quantity}
              onClick={() => setQuantity((prev) => prev + 1)}
            />
          </nav>
        </div>
      </div>

      <div className="relative flex h-16 items-center justify-between border-b border-neutral-200 px-2.5 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X aria-hidden="true" className="size-6" />
          ) : (
            <Menu aria-hidden="true" className="size-6" />
          )}
        </Button>

        <BrandLink className="absolute left-1/2 -translate-x-1/2" />
        <CartButton
          quantity={quantity}
          onClick={() => setQuantity((prev) => prev + 1)}
          compact
        />
      </div>

      {menuOpen && (
        <nav
          aria-label="Menu principal"
          className="absolute top-full left-0 z-50 w-full border-b border-neutral-200 bg-white px-4 py-3 shadow-md lg:hidden"
        >
          {quickLinks.map(({ id, label, icon }, index) => (
            <QuickLinkContent
              key={id}
              icon={icon}
              label={label}
              className={`py-3 text-sm ${
                index < quickLinks.length - 1
                  ? 'border-b border-neutral-100'
                  : ''
              }`}
            />
          ))}
        </nav>
      )}
    </header>
  );
}

export default Navbar;
