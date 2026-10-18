'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type HeroSlide = {
  id: string;
  src: string;
  alt: string;
};

type HeroCarouselProps = {
  slides?: HeroSlide[];
  /** Autoplay interval in milliseconds. Defaults to 5000 (5s). */
  autoplayDelay?: number;
};

const defaultSlides: HeroSlide[] = [
  {
    id: 'slide-1',
    src: '/hero-slide-1.svg',
    alt: 'Coleção Navajo — joias e acessórios artesanais',
  },
  {
    id: 'slide-2',
    src: '/hero-slide-2.svg',
    alt: 'Nova coleção Turquesa — pedras naturais selecionadas',
  },
  {
    id: 'slide-3',
    src: '/hero-slide-3.svg',
    alt: 'Pulseiras com até 40% de desconto',
  },
];

function HeroCarousel({
  slides = defaultSlides,
  autoplayDelay = 5000,
}: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      containScroll: 'trimSnaps',
    },
    [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  return (
    <section aria-label="Hero carousel" className="relative w-full bg-muted">
      {/* Slide track — overflow hidden clips slides outside the viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex" style={{ touchAction: 'pan-y pinch-zoom' }}>
          {slides.map((slide) => (
            <div key={slide.id} className="relative shrink-0 basis-full">
              {/*
               * pb-10 reserves space so the dots (rendered below the track)
               * never overlap the slide artwork. The image fills the whole
               * box including the padding area via object-cover + fill.
               */}
              <div className="relative h-[70svh] w-full min-h-[480px] max-h-[680px] overflow-hidden pb-10">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover object-top"
                  sizes="100vw"
                  priority={slide.id === slides[0].id}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev button — centred on the slide area, not on the dot strip */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Slide anterior"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className="absolute top-[calc(50%-20px)] left-2 z-10 -translate-y-1/2 rounded-full bg-background/70 text-foreground shadow backdrop-blur-sm hover:bg-background disabled:opacity-30 md:left-4"
      >
        <ChevronLeft aria-hidden="true" className="size-5" />
      </Button>

      {/* Next button */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Próximo slide"
        onClick={scrollNext}
        disabled={!canScrollNext}
        className="absolute top-[calc(50%-20px)] right-2 z-10 -translate-y-1/2 rounded-full bg-background/70 text-foreground shadow backdrop-blur-sm hover:bg-background disabled:opacity-30 md:right-4"
      >
        <ChevronRight aria-hidden="true" className="size-5" />
      </Button>

      {/* Dot indicators — outside the slide track so they never overlap content */}
      <div
        role="tablist"
        aria-label="Selecionar slide"
        className="flex items-center justify-center gap-2 py-3 bg-muted"
      >
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            role="tab"
            aria-label={`Ir para slide ${index + 1}`}
            aria-selected={index === selectedIndex}
            onClick={() => scrollTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? 'w-6 bg-foreground'
                : 'w-2 bg-foreground/40 hover:bg-foreground/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroCarousel;
