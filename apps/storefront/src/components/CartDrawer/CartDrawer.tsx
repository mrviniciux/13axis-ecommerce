'use client';

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

function CartDrawer({ open, onClose }: CartDrawerProps) {
  const t = useTranslations('cartDrawer');

  if (!open) {
    return null;
  }

  return (
    <>
      {/* Backdrop — clicar fora fecha a sidenav */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidenav deslizante da direita */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full md:w-[420px] bg-background border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
        aria-modal="true"
        role="dialog"
        aria-label={t('title')}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('close')}
            onClick={onClose}
          >
            <X aria-hidden="true" className="size-5" />
          </Button>
        </div>

        {/* Conteúdo — em branco até o gerenciamento de estado ser implementado */}
        <div className="flex-1 p-6">
          <p className="text-muted-foreground text-sm">{t('empty')}</p>
        </div>

        {/* Rodapé reservado para subtotal e botão de finalizar compra (implementado depois) */}
        <div className="p-6 border-t border-border bg-background/30">
          <div className="text-center text-sm text-muted-foreground">
            {t('placeholder')}
          </div>
        </div>
      </aside>
    </>
  );
}

export default CartDrawer;
