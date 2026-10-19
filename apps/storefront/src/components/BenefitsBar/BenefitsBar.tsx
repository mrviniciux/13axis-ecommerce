'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Truck, Percent, Package, CreditCard, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

type BenefitKey =
  | 'shipping'
  | 'discount'
  | 'delivery'
  | 'installments'
  | 'security';

type Benefit = {
  key: BenefitKey;
  icon: LucideIcon;
};

const benefits: Benefit[] = [
  { key: 'shipping', icon: Truck },
  { key: 'discount', icon: Percent },
  { key: 'delivery', icon: Package },
  { key: 'installments', icon: CreditCard },
  { key: 'security', icon: ShieldCheck },
];

// Group items into pairs for the mobile carousel (2 per slide).
// e.g. [[0,1],[2,3],[4]] — last slide may have 1 item.
function chunkPairs<T>(arr: T[]): T[][] {
  const pairs: T[][] = [];
  for (let i = 0; i < arr.length; i += 2) {
    pairs.push(arr.slice(i, i + 2));
  }
  return pairs;
}

function BenefitItem({
  benefitKey,
  icon: Icon,
  t,
}: {
  benefitKey: BenefitKey;
  icon: LucideIcon;
  t: ReturnType<typeof useTranslations<'benefits'>>;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon
        aria-hidden="true"
        className="size-7 shrink-0 text-foreground/70"
        strokeWidth={1.25}
      />
      <div className="flex flex-col leading-tight">
        <span className="text-[13px] font-semibold text-foreground">
          {t(`${benefitKey}.title`)}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {t(`${benefitKey}.subtitle`)}
        </span>
      </div>
    </div>
  );
}

function BenefitsBar() {
  const t = useTranslations('benefits');
  const pairs = chunkPairs(benefits);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    // Disable dragging on sm+ — the carousel is visually hidden there anyway
    watchDrag: true,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  return (
    <section
      aria-label={t('label')}
      className="w-full border-y border-border bg-background"
    >
      {/* ── Mobile carousel (hidden sm+) ── */}
      <div className="sm:hidden">
        <div ref={emblaRef} className="overflow-hidden">
          <div
            className="flex touch-pan-y"
            style={{ touchAction: 'pan-y pinch-zoom' }}
          >
            {pairs.map((pair, slideIndex) => (
              <div key={slideIndex} className="shrink-0 basis-full px-4 py-4">
                <div className="flex items-center justify-around gap-4">
                  {pair.map(({ key, icon }) => (
                    <BenefitItem key={key} benefitKey={key} icon={icon} t={t} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div
          role="tablist"
          aria-label={t('label')}
          className="flex items-center justify-center gap-2 pb-3"
        >
          {pairs.map((_, index) => (
            <button
              key={index}
              role="tab"
              aria-label={`Página ${index + 1}`}
              aria-selected={index === selectedIndex}
              onClick={() => scrollTo(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? 'w-5 bg-foreground'
                  : 'w-1.5 bg-foreground/30 hover:bg-foreground/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Desktop / tablet flat row (hidden below sm) ── */}
      <ul className="mx-auto hidden max-w-[1440px] items-center justify-around gap-x-6 px-4 py-4 sm:flex lg:px-[var(--navbar-inline-spacing)]">
        {benefits.map(({ key, icon: Icon }) => (
          <li key={key} className="flex items-center gap-3">
            <Icon
              aria-hidden="true"
              className="size-7 shrink-0 text-foreground/70"
              strokeWidth={1.25}
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold text-foreground">
                {t(`${key}.title`)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {t(`${key}.subtitle`)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default BenefitsBar;
