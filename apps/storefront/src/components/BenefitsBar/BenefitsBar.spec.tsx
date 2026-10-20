import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/i18n/messages/pt-BR.json';
import BenefitsBar from './BenefitsBar';

// Embla uses DOM APIs unavailable in jsdom; provide a minimal stub.
jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [
    (el: HTMLElement | null) => el,
    {
      canScrollPrev: () => false,
      canScrollNext: () => true,
      scrollTo: jest.fn(),
      selectedScrollSnap: () => 0,
      on: jest.fn(),
      off: jest.fn(),
    },
  ],
}));

function renderWithIntl() {
  return render(
    <NextIntlClientProvider locale="pt-BR" messages={messages}>
      <BenefitsBar />
    </NextIntlClientProvider>
  );
}

describe('BenefitsBar', () => {
  it('renders the section landmark', () => {
    renderWithIntl();
    // There are two landmarks with the same label (mobile + desktop);
    // both should be present.
    const regions = screen.getAllByRole('region', { name: /benefícios/i });
    expect(regions.length).toBeGreaterThanOrEqual(1);
  });

  it('renders all five benefit titles', () => {
    renderWithIntl();
    // Titles appear in both mobile and desktop markup — getAllByText is fine.
    expect(screen.getAllByText('Frete Grátis').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10% de Desconto').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Envio').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText('Pague em 12x com cartão').length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('Segurança').length).toBeGreaterThan(0);
  });

  it('renders dot indicators for each pair of benefits', () => {
    renderWithIntl();
    // 5 items → 3 pairs → 3 dot tabs
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
  });
});
