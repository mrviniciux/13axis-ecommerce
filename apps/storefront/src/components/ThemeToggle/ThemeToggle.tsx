'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';

type ThemeToggleProps = {
  /** 'icon' — compact button (desktop navbar). 'row' — icon + label row (mobile menu). */
  variant?: 'icon' | 'row';
  lightLabel: string;
  darkLabel: string;
  className?: string;
};

function ThemeToggle({
  variant = 'icon',
  lightLabel,
  darkLabel,
  className,
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  function toggle() {
    setTheme(isDark ? 'light' : 'dark');
  }

  const label = isDark ? lightLabel : darkLabel;

  if (variant === 'row') {
    return (
      <button
        onClick={toggle}
        aria-label={label}
        className={`flex items-center gap-3 py-3 text-sm ${className ?? ''}`}
      >
        {isDark ? (
          <Sun aria-hidden="true" className="size-6 shrink-0" />
        ) : (
          <Moon aria-hidden="true" className="size-6 shrink-0" />
        )}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={toggle}
      className={className}
    >
      {isDark ? (
        <Sun aria-hidden="true" className="size-5" />
      ) : (
        <Moon aria-hidden="true" className="size-5" />
      )}
    </Button>
  );
}

export default ThemeToggle;
