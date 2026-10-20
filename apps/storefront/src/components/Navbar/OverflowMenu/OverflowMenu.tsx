import LanguageSelect from '@/components/LanguageSelect';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LocaleOption } from '../Navbar';
/**
 * Compact overflow menu used in the tablet breakpoint (md–lg).
 * Shows theme toggle + language selector in a floating panel.
 */

function OverflowMenu({
  t,
  locale,
  languageOptions,
  onLocaleChange,
}: {
  t: ReturnType<typeof useTranslations<'navbar'>>;
  locale: string;
  languageOptions: { value: LocaleOption; label: string; flag: string }[];
  onLocaleChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('moreOptions')}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical aria-hidden="true" className="size-5" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-border bg-background p-3 shadow-lg">
          {/* Theme row */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-border mb-2">
            <span className="text-sm text-muted-foreground">{t('theme')}</span>
            <ThemeToggle
              variant="icon"
              lightLabel={t('themeLight')}
              darkLabel={t('themeDark')}
            />
          </div>
          {/* Language */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              {t('language')}
            </span>
            <LanguageSelect
              locale={locale}
              label={t('language')}
              options={languageOptions}
              onValueChange={(v) => {
                onLocaleChange(v);
                setOpen(false);
              }}
              className="w-24"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default OverflowMenu;
