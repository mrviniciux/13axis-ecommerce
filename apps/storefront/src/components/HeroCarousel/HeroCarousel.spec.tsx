import { render, screen } from '@testing-library/react';
import HeroCarousel from './HeroCarousel';

// Embla uses DOM APIs unavailable in jsdom; mock the hook to expose a stable ref
// and a minimal API so the component renders without errors.
jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [
    // ref callback — attach to the element without doing anything
    (el: HTMLElement | null) => el,
    // emblaApi stub
    {
      canScrollPrev: () => false,
      canScrollNext: () => true,
      scrollPrev: jest.fn(),
      scrollNext: jest.fn(),
      scrollTo: jest.fn(),
      selectedScrollSnap: () => 0,
      on: jest.fn(),
      off: jest.fn(),
    },
  ],
}));

jest.mock('embla-carousel-autoplay', () => ({
  __esModule: true,
  default: () => ({}),
}));

describe('HeroCarousel', () => {
  it('renders the carousel region', () => {
    render(<HeroCarousel />);
    expect(
      screen.getByRole('region', { name: /hero carousel/i })
    ).toBeInTheDocument();
  });

  it('renders dot indicators for each default slide', () => {
    render(<HeroCarousel />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
  });

  it('renders prev and next navigation buttons', () => {
    render(<HeroCarousel />);
    expect(
      screen.getByRole('button', { name: /slide anterior/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /próximo slide/i })
    ).toBeInTheDocument();
  });

  it('renders custom slides when provided', () => {
    const slides = [
      { id: 's1', src: '/test-1.svg', alt: 'Test slide 1' },
      { id: 's2', src: '/test-2.svg', alt: 'Test slide 2' },
    ];
    render(<HeroCarousel slides={slides} />);
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByAltText('Test slide 1')).toBeInTheDocument();
  });
});
