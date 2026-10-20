import type { ComponentProps, ReactNode } from 'react';
import { Button } from '../ui/button';
import { ShoppingCart } from 'lucide-react';

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
      <ShoppingCart
        aria-hidden="true"
        className={compact ? 'size-5' : 'size-6'}
      />
      <span
        className={`absolute -top-0.5 -right-1 flex items-center justify-center rounded-full bg-foreground font-semibold text-background ${
          compact ? 'size-4 text-[9px]' : 'size-5 text-[10px]'
        }`}
      >
        {quantity}
      </span>
    </Button>
  );
}
export default CartButton;
