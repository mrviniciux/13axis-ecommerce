'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  ArrowUpRight,
  Boxes,
  LayoutDashboard,
  LogOut,
  Package,
  Store,
  Tags,
} from 'lucide-react';
import type { ReactNode } from 'react';

const navigation = [
  { href: '/restrict/admin', label: 'Visão geral', icon: LayoutDashboard },
  {
    href: '/restrict/admin/products',
    label: 'Produtos e estoque',
    icon: Boxes,
  },
  {
    href: '/restrict/admin/catalogs',
    label: 'Catálogos',
    icon: Tags,
  },
];

export default function AdminFrame({
  children,
  userName,
}: {
  children: ReactNode;
  userName: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f4f6f3] text-[#202925]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[246px] flex-col border-r border-[#e1e6e1] bg-[#fbfcfa] lg:flex">
        <div className="flex h-[76px] items-center gap-3 border-b border-[#e7ebe7] px-6">
          <span className="flex size-9 items-center justify-center bg-[#183c35] text-xs font-semibold text-white">
            13
          </span>
          <span className="text-sm font-semibold tracking-[0.08em]">
            AXIS <span className="font-normal text-[#7a8580]">COMMERCE</span>
          </span>
        </div>
        <div className="px-4 pt-7">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98a19d]">
            Workspace
          </p>
          <nav aria-label="Navegação administrativa" className="mt-3 space-y-1">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== '/restrict/admin' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex h-10 items-center gap-3 px-3 text-sm transition-colors ${active ? 'bg-[#e9f0eb] font-semibold text-[#183c35]' : 'text-[#68736e] hover:bg-[#f0f3f0] hover:text-[#202925]'}`}
                >
                  <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto border-t border-[#e7ebe7] p-4">
          <Link
            href="/br"
            className="flex items-center gap-2 px-2 py-2 text-xs text-[#74807a] hover:text-[#183c35]"
          >
            <Store size={15} aria-hidden="true" />
            Voltar à loja
            <ArrowUpRight className="ml-auto" size={14} aria-hidden="true" />
          </Link>
          <div className="mt-3 flex items-center gap-3 border-t border-[#e7ebe7] pt-4">
            <span className="flex size-9 items-center justify-center bg-[#e5ece6] text-xs font-semibold uppercase text-[#315b4e]">
              {userName.slice(0, 1)}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium">
              {userName}
            </span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/restrict/admin/login' })}
              aria-label="Sair da administração"
              title="Sair"
              className="flex size-8 items-center justify-center text-[#78827e] hover:bg-[#edf0ed] hover:text-[#202925]"
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[246px]">
        <header className="sticky top-0 z-10 flex min-h-[62px] flex-wrap items-center justify-between border-b border-[#e1e6e1] bg-[#fbfcfa]/95 px-5 backdrop-blur sm:px-8">
          <div className="flex h-[62px] items-center gap-2 text-xs text-[#8a9490]">
            <Package size={15} aria-hidden="true" />
            <span>Administração</span>
          </div>
          <div className="flex h-[62px] items-center gap-3">
            <Link
              href="/br"
              aria-label="Abrir storefront"
              title="Abrir storefront"
              className="flex size-9 items-center justify-center text-[#6c7772] hover:bg-[#edf0ed] lg:hidden"
            >
              <Store size={17} aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/restrict/admin/login' })}
              className="flex size-9 items-center justify-center text-[#6c7772] hover:bg-[#edf0ed] lg:hidden"
              aria-label="Sair"
              title="Sair"
            >
              <LogOut size={17} aria-hidden="true" />
            </button>
            <span className="hidden text-xs text-[#74807a] sm:block">
              {userName}
            </span>
          </div>
          <nav
            aria-label="Navegação administrativa mobile"
            className="flex w-full gap-2 border-t border-[#e7ebe7] py-2 lg:hidden"
          >
            {navigation.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== '/restrict/admin' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex h-9 items-center gap-2 px-3 text-xs font-medium ${active ? 'bg-[#e9f0eb] text-[#183c35]' : 'text-[#68736e] hover:bg-[#f0f3f0]'}`}
                >
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
